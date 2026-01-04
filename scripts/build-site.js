#!/usr/bin/env node

/**
 * Site Builder for the Protein Empire
 * 
 * This script generates a complete static site from recipe data and templates.
 * 
 * Usage:
 *   node scripts/build-site.js <domain>
 *   node scripts/build-site.js proteincookies.co
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Import configurations
import { getSite } from '../packages/config/sites.js';
import { getCategoriesForSite } from '../packages/config/categories.js';

/**
 * Main build function
 */
async function buildSite(domain) {
  console.log(`\n🏗️  Building site: ${domain}\n`);
  
  // Get site configuration
  const site = getSite(domain);
  if (!site) {
    console.error(`❌ Site not found: ${domain}`);
    process.exit(1);
  }
  
  // Paths
  const dataDir = path.join(ROOT_DIR, 'data', 'recipes', domain.replace(/\./g, '-'));
  const imagesDir = path.join(ROOT_DIR, 'data', 'images', domain.replace(/\./g, '-'));
  const outputDir = path.join(ROOT_DIR, 'apps', domain, 'dist');
  const templatesDir = path.join(ROOT_DIR, 'packages', 'ui', 'templates');
  
  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'recipe_images'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'images'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'js'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'guides'), { recursive: true });
  
  // Load recipe data
  const recipesFile = path.join(dataDir, 'recipes.json');
  if (!fs.existsSync(recipesFile)) {
    console.error(`❌ Recipes file not found: ${recipesFile}`);
    console.log(`   Create this file with your recipe data.`);
    process.exit(1);
  }
  
  let recipesData = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));
  // Handle both array and object with recipes property
  const recipes = Array.isArray(recipesData) ? recipesData : (recipesData.recipes || []);
  
  // Normalize recipe structure
  recipes.forEach(recipe => {
    // Ensure nutrition object exists
    if (!recipe.nutrition) {
      recipe.nutrition = {
        protein: recipe.protein || 0,
        calories: recipe.calories || 0,
        carbs: recipe.carbs || 0,
        fat: recipe.fat || 0,
        fiber: recipe.fiber || 0,
        sugar: recipe.sugar || 0
      };
    }
    // Ensure totalTime is a number
    recipe.totalTime = parseInt(recipe.totalTime) || 30;
    recipe.prepTime = parseInt(recipe.prepTime) || 10;
    recipe.cookTime = parseInt(recipe.cookTime) || 20;
    // Ensure yield is a number
    if (typeof recipe.yield === 'string') {
      recipe.yield = parseInt(recipe.yield) || 12;
    }
    // Ensure categories array exists
    if (!recipe.categories) {
      recipe.categories = [recipe.category?.toLowerCase() || 'classic'];
    }
    // Parse string ingredients into objects if needed
    if (recipe.ingredients && typeof recipe.ingredients[0] === 'string') {
      recipe.ingredients = recipe.ingredients.map(ing => {
        const match = ing.match(/^(\d+)g?\s+(.+)$/);
        if (match) {
          return { amount: parseInt(match[1]), name: match[2] };
        }
        return { amount: 0, name: ing };
      });
    }
    // Normalize instructions to array of strings
    if (recipe.instructions && recipe.instructions.length > 0) {
      if (typeof recipe.instructions[0] === 'object') {
        recipe.instructions = recipe.instructions.map(step => step.text || step.step || '');
      }
    } else {
      recipe.instructions = ['Follow the recipe instructions.'];
    }
  });
  console.log(`📚 Loaded ${recipes.length} recipes`);
  
  // Load packs data if exists
  const packsFile = path.join(dataDir, 'packs.json');
  const packs = fs.existsSync(packsFile) 
    ? JSON.parse(fs.readFileSync(packsFile, 'utf-8'))
    : [];
  console.log(`📦 Loaded ${packs.length} recipe packs`);
  
  // Get categories for this site
  const categories = getCategoriesForSite(domain);
  
  // Copy static assets
  console.log(`\n📁 Copying assets...`);
  
  // Copy recipe images
  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir);
    imageFiles.forEach(file => {
      fs.copyFileSync(
        path.join(imagesDir, file),
        path.join(outputDir, 'recipe_images', file)
      );
    });
    console.log(`   ✓ Copied ${imageFiles.length} recipe images`);
  }
  
  // Copy ingredients bundle
  const ingredientsBundle = path.join(ROOT_DIR, 'packages', 'ingredients', 'browser-bundle.js');
  if (fs.existsSync(ingredientsBundle)) {
    fs.copyFileSync(ingredientsBundle, path.join(outputDir, 'js', 'ingredients-bundle.js'));
    console.log(`   ✓ Copied ingredients bundle`);
  }
  
  // Generate pages
  console.log(`\n📄 Generating pages...`);
  
  // Load partials
  const partials = {
    head: fs.readFileSync(path.join(templatesDir, 'partials', 'head.ejs'), 'utf-8'),
    nav: fs.readFileSync(path.join(templatesDir, 'partials', 'nav.ejs'), 'utf-8'),
    footer: fs.readFileSync(path.join(templatesDir, 'partials', 'footer.ejs'), 'utf-8'),
    recipeCard: fs.readFileSync(path.join(templatesDir, 'partials', 'recipe-card.ejs'), 'utf-8')
  };
  
  // Generate homepage
  await generateHomepage(site, recipes, packs, categories, partials, outputDir);
  console.log(`   ✓ Generated index.html`);
  
  // Generate recipe pages
  for (const recipe of recipes) {
    await generateRecipePage(site, recipe, recipes, partials, outputDir);
  }
  console.log(`   ✓ Generated ${recipes.length} recipe pages`);
  
  // Generate category pages
  const categoryKeys = Object.keys(categories);
  for (const catKey of categoryKeys) {
    await generateCategoryPage(site, categories[catKey], recipes, partials, outputDir);
  }
  console.log(`   ✓ Generated ${categoryKeys.length} category pages`);
  
  // Generate pack pages
  for (const pack of packs) {
    await generatePackPage(site, pack, recipes, partials, outputDir);
    await generateSuccessPage(site, pack, partials, outputDir);
  }
  console.log(`   ✓ Generated ${packs.length} pack pages`);
  
  // Generate supporting pages
  await generatePrivacyPage(site, partials, outputDir);
  await generateTermsPage(site, partials, outputDir);
  await generate404Page(site, partials, outputDir);
  console.log(`   ✓ Generated supporting pages`);
  
  // Generate sitemap
  await generateSitemap(site, recipes, categories, packs, outputDir);
  console.log(`   ✓ Generated sitemap.xml`);
  
  // Generate robots.txt
  await generateRobotsTxt(site, outputDir);
  console.log(`   ✓ Generated robots.txt`);
  
  console.log(`\n✅ Build complete! Output: ${outputDir}\n`);
}

/**
 * Generate the homepage
 */
async function generateHomepage(site, recipes, packs, categories, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: site.title,
  pageDescription: site.description,
  canonicalPath: '/',
  ogType: 'website',
  ogImage: null,
  preloadImage: recipes[0] ? '/recipe_images/' + recipes[0].slug + '.png' : null,
  includeIngredients: false
}) %>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">

<%- include('nav', { site }) %>

<!-- Hero Section -->
<section class="relative bg-slate-900 text-white py-20 overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-transparent"></div>
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <span class="inline-block bg-brand-500 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
      <%= recipes.length %>+ Macro-Verified Recipes
    </span>
    <h1 class="font-anton text-4xl md:text-6xl tracking-tight uppercase mb-4">
      The Hub for Protein<br><%= site.foodTypePlural.charAt(0).toUpperCase() + site.foodTypePlural.slice(1) %>
    </h1>
    <p class="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
      <%= site.tagline %>. Every recipe measured in grams for precise macros.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#recipes" class="bg-brand-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
        Browse Recipes
      </a>
      <a href="/pack-starter.html" class="bg-white/10 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
        Get Free Starter Pack
      </a>
    </div>
  </div>
</section>

<!-- Recipes Section -->
<section id="recipes" class="py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="font-anton text-3xl text-center mb-8 uppercase">All Recipes</h2>
    
    <!-- Category Filter -->
    <div id="categories" class="flex flex-wrap justify-center gap-2 mb-8">
      <% Object.values(categories).forEach(cat => { %>
        <a href="/category-<%= cat.slug %>.html" class="px-4 py-2 rounded-full text-sm font-medium bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors">
          <%= cat.name %>
        </a>
      <% }) %>
    </div>
    
    <!-- Recipe Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <% recipes.forEach(recipe => { %>
        <%- include('recipeCard', { recipe }) %>
      <% }) %>
    </div>
  </div>
</section>

<!-- Starter Pack CTA -->
<section class="py-16 bg-brand-50">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <span class="inline-block bg-brand-500 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
      Free Download
    </span>
    <h2 class="font-anton text-3xl uppercase mb-4">Get the Starter Pack</h2>
    <p class="text-slate-600 mb-8">
      5 essential protein <%= site.foodType %> recipes in a printable PDF. Includes shopping list, nutrition facts, and pro tips.
    </p>
    <a href="/pack-starter.html" class="inline-flex items-center gap-2 bg-brand-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      Download Free PDF
    </a>
  </div>
</section>

<!-- More Packs -->
<% if (packs.length > 1) { %>
<section id="packs" class="py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="font-anton text-3xl text-center mb-4 uppercase">More Recipe Packs</h2>
    <p class="text-center text-slate-600 mb-8">Curated collections for every goal and preference.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <% packs.filter(p => p.slug !== 'starter').forEach(pack => { %>
        <a href="/pack-<%= pack.slug %>.html" class="block bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand-500 hover:shadow-lg transition-all">
          <span class="text-3xl mb-4 block"><%= pack.icon %></span>
          <h3 class="font-semibold text-lg mb-2"><%= pack.title %></h3>
          <p class="text-slate-600 text-sm"><%= pack.description %></p>
        </a>
      <% }) %>
    </div>
  </div>
</section>
<% } %>

<%- include('footer', { site }) %>

</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    recipes,
    packs,
    categories,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
}

/**
 * Generate a recipe page
 */
async function generateRecipePage(site, recipe, allRecipes, partials, outputDir) {
  // Get related recipes (same category, different recipe)
  const relatedRecipes = allRecipes
    .filter(r => r.slug !== recipe.slug && r.categories?.some(c => recipe.categories?.includes(c)))
    .slice(0, 4);
  
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: recipe.title + ' | ' + site.name,
  pageDescription: recipe.description,
  canonicalPath: '/' + recipe.slug + '.html',
  ogType: 'article',
  ogImage: '/recipe_images/' + recipe.slug + '.png',
  preloadImage: '/recipe_images/' + recipe.slug + '.png',
  includeIngredients: true
}) %>

<!-- Recipe Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Recipe",
  "name": "<%= recipe.title %>",
  "image": ["https://<%= site.domain %>/recipe_images/<%= recipe.slug %>.png"],
  "description": "<%= recipe.description %>",
  "keywords": "<%= recipe.keywords?.join(', ') || '' %>",
  "author": {
    "@type": "Organization",
    "name": "<%= site.name %>",
    "url": "https://<%= site.domain %>"
  },
  "prepTime": "PT<%= recipe.prepTime %>M",
  "cookTime": "PT<%= recipe.cookTime %>M",
  "totalTime": "PT<%= recipe.totalTime %>M",
  "recipeYield": "<%= recipe.yield %> <%= site.foodTypePlural %>",
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "<%= recipe.nutrition.calories %> kcal",
    "proteinContent": "<%= recipe.nutrition.protein %>g",
    "fatContent": "<%= recipe.nutrition.fat %>g",
    "carbohydrateContent": "<%= recipe.nutrition.carbs %>g",
    "fiberContent": "<%= recipe.nutrition.fiber %>g",
    "sugarContent": "<%= recipe.nutrition.sugar %>g",
    "servingSize": "1 <%= site.foodType %>"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "<%= recipe.rating || 4.8 %>",
    "ratingCount": "<%= recipe.ratingCount || 100 %>",
    "bestRating": "5",
    "worstRating": "1"
  },
  "datePublished": "<%= recipe.datePublished || new Date().toISOString().split('T')[0] %>",
  "recipeCategory": "<%= recipe.categories?.[0] || 'Breakfast' %>",
  "recipeCuisine": "American",
  "recipeIngredient": [<%= recipe.ingredients.map(i => '"' + i.amount + 'g ' + i.name + '"').join(',') %>],
  "recipeInstructions": [<%= recipe.instructions.map((step, i) => '{"@type":"HowToStep","name":"Step ' + (i+1) + '","text":"' + step.replace(/"/g, '\\\\"') + '"}').join(',') %>]
}
</script>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">

<%- include('nav', { site }) %>

<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Breadcrumb -->
  <nav class="text-sm text-slate-500 mb-6">
    <a href="/" class="hover:text-brand-600">Home</a>
    <span class="mx-2">/</span>
    <span class="text-slate-900"><%= recipe.title %></span>
  </nav>
  
  <!-- Hero -->
  <div class="grid md:grid-cols-2 gap-8 mb-12">
    <div class="relative aspect-square rounded-2xl overflow-hidden">
      <img src="/recipe_images/<%= recipe.slug %>.png" alt="<%= recipe.title %>" class="w-full h-full object-cover">
      <div class="absolute top-4 left-4 bg-accent-500 text-white text-lg font-bold px-3 py-1 rounded-lg">
        <%= recipe.nutrition.protein %>g protein
      </div>
    </div>
    
    <div>
      <h1 class="font-anton text-3xl md:text-4xl uppercase mb-4"><%= recipe.title %></h1>
      <p class="text-slate-600 mb-6"><%= recipe.description %></p>
      
      <!-- Quick Stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 text-center border border-slate-200">
          <div class="text-2xl font-bold text-brand-600"><%= recipe.totalTime %></div>
          <div class="text-sm text-slate-500">minutes</div>
        </div>
        <div class="bg-white rounded-xl p-4 text-center border border-slate-200">
          <div class="text-2xl font-bold text-brand-600"><%= recipe.yield %></div>
          <div class="text-sm text-slate-500"><%= site.foodTypePlural %></div>
        </div>
        <div class="bg-white rounded-xl p-4 text-center border border-slate-200">
          <div class="text-2xl font-bold text-brand-600"><%= recipe.difficulty %></div>
          <div class="text-sm text-slate-500">difficulty</div>
        </div>
      </div>
      
      <!-- Nutrition -->
      <div class="bg-white rounded-xl p-4 border border-slate-200">
        <h3 class="font-semibold mb-3">Nutrition per <%= site.foodType %></h3>
        <div class="grid grid-cols-4 gap-2 text-center text-sm">
          <div>
            <div class="font-bold text-lg"><%= recipe.nutrition.calories %></div>
            <div class="text-slate-500">cal</div>
          </div>
          <div>
            <div class="font-bold text-lg text-accent-600"><%= recipe.nutrition.protein %>g</div>
            <div class="text-slate-500">protein</div>
          </div>
          <div>
            <div class="font-bold text-lg"><%= recipe.nutrition.carbs %>g</div>
            <div class="text-slate-500">carbs</div>
          </div>
          <div>
            <div class="font-bold text-lg"><%= recipe.nutrition.fat %>g</div>
            <div class="text-slate-500">fat</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Ingredients -->
  <section class="mb-12">
    <h2 class="font-anton text-2xl uppercase mb-6">Ingredients</h2>
    <div class="bg-white rounded-xl p-6 border border-slate-200">
      <ul class="space-y-3">
        <% recipe.ingredients.forEach(ing => { %>
          <li class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
            <span><%= ing.name %></span>
            <span class="font-mono text-slate-600"><%= ing.amount %>g</span>
          </li>
        <% }) %>
      </ul>
    </div>
  </section>
  
  <!-- Instructions -->
  <section class="mb-12">
    <h2 class="font-anton text-2xl uppercase mb-6">Instructions</h2>
    <div class="space-y-4">
      <% recipe.instructions.forEach((step, i) => { %>
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold">
            <%= i + 1 %>
          </div>
          <p class="text-slate-700 pt-1"><%= step %></p>
        </div>
      <% }) %>
    </div>
  </section>
  
  <!-- Related Recipes -->
  <% if (relatedRecipes.length > 0) { %>
  <section>
    <h2 class="font-anton text-2xl uppercase mb-6">You Might Also Like</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <% relatedRecipes.forEach(r => { %>
        <%- include('recipeCard', { recipe: r }) %>
      <% }) %>
    </div>
  </section>
  <% } %>
</article>

<%- include('footer', { site }) %>

</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    recipe,
    relatedRecipes,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, `${recipe.slug}.html`), html);
}

/**
 * Generate a category page
 */
async function generateCategoryPage(site, category, allRecipes, partials, outputDir) {
  // Filter recipes for this category
  let filteredRecipes = allRecipes;
  if (category.slug !== 'all') {
    if (category.filter) {
      filteredRecipes = allRecipes.filter(category.filter);
    } else {
      filteredRecipes = allRecipes.filter(r => r.categories?.includes(category.slug));
    }
  }
  
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: category.name + ' Protein ' + site.foodTypePlural.charAt(0).toUpperCase() + site.foodTypePlural.slice(1),
  pageDescription: 'Browse our collection of ' + category.name.toLowerCase() + ' protein ' + site.foodType + ' recipes. All macro-verified with precise nutrition data.',
  canonicalPath: '/category-' + category.slug + '.html',
  ogType: 'website',
  ogImage: null,
  preloadImage: filteredRecipes[0] ? '/recipe_images/' + filteredRecipes[0].slug + '.png' : null,
  includeIngredients: false
}) %>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">

<%- include('nav', { site }) %>

<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="text-center mb-12">
    <span class="text-4xl mb-4 block"><%= category.icon || '📚' %></span>
    <h1 class="font-anton text-4xl uppercase mb-4"><%= category.name %></h1>
    <p class="text-slate-600"><%= category.description || 'Browse our ' + category.name.toLowerCase() + ' recipes.' %></p>
    <p class="text-sm text-slate-500 mt-2"><%= filteredRecipes.length %> recipes</p>
  </div>
  
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <% filteredRecipes.forEach(recipe => { %>
      <%- include('recipeCard', { recipe }) %>
    <% }) %>
  </div>
  
  <% if (filteredRecipes.length === 0) { %>
    <div class="text-center py-12 text-slate-500">
      <p>No recipes found in this category yet.</p>
      <a href="/" class="text-brand-600 hover:underline mt-2 inline-block">Browse all recipes</a>
    </div>
  <% } %>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    category,
    filteredRecipes,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, `category-${category.slug}.html`), html);
}

/**
 * Generate a pack page
 */
async function generatePackPage(site, pack, allRecipes, partials, outputDir) {
  const packRecipes = allRecipes.filter(r => pack.recipes?.includes(r.slug));
  
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: pack.title + ' | ' + site.name,
  pageDescription: pack.description,
  canonicalPath: '/pack-' + pack.slug + '.html',
  ogType: 'website',
  ogImage: null,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">

<%- include('nav', { site }) %>

<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="text-center mb-12">
    <span class="text-5xl mb-4 block"><%= pack.icon %></span>
    <h1 class="font-anton text-4xl uppercase mb-4"><%= pack.title %></h1>
    <p class="text-slate-600 max-w-2xl mx-auto"><%= pack.description %></p>
  </div>
  
  <!-- What's Included -->
  <div class="bg-white rounded-2xl p-8 border border-slate-200 mb-8">
    <h2 class="font-semibold text-xl mb-6">What's Included</h2>
    <ul class="space-y-3">
      <% packRecipes.forEach(recipe => { %>
        <li class="flex items-center gap-3">
          <span class="w-8 h-8 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center font-bold text-sm">
            <%= recipe.nutrition.protein %>g
          </span>
          <span><%= recipe.title %></span>
        </li>
      <% }) %>
    </ul>
    
    <div class="mt-6 pt-6 border-t border-slate-200">
      <p class="text-slate-600 text-sm">Plus: Shopping list, nutrition facts, and pro tips!</p>
    </div>
  </div>
  
  <!-- Download Form -->
  <div class="bg-brand-50 rounded-2xl p-8 text-center">
    <h2 class="font-semibold text-xl mb-4">Get Your Free PDF</h2>
    <p class="text-slate-600 mb-6">Enter your email to download the <%= pack.title %> instantly.</p>
    
    <form action="/success-<%= pack.slug %>.html" method="GET" class="max-w-md mx-auto">
      <div class="flex gap-2">
        <input 
          type="email" 
          name="email" 
          placeholder="your@email.com" 
          required
          class="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
        >
        <button type="submit" class="bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
          Download
        </button>
      </div>
    </form>
  </div>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    pack,
    packRecipes,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, `pack-${pack.slug}.html`), html);
}

/**
 * Generate a success/download page
 */
async function generateSuccessPage(site, pack, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Download ' + pack.title,
  pageDescription: 'Download your free ' + pack.title + ' PDF.',
  canonicalPath: '/success-' + pack.slug + '.html',
  ogType: 'website',
  ogImage: null,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">

<%- include('nav', { site }) %>

<main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
  <div class="bg-white rounded-2xl p-12 border border-slate-200">
    <div class="w-16 h-16 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    
    <h1 class="font-anton text-3xl uppercase mb-4">You're All Set!</h1>
    <p class="text-slate-600 mb-8">Your <%= pack.title %> is ready to download.</p>
    
    <a 
      href="/guides/<%= site.domain.replace(/\\./g, '-') %>-<%= pack.slug %>.pdf" 
      download
      class="inline-flex items-center gap-2 bg-brand-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-600 transition-colors text-lg"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      Download PDF
    </a>
    
    <p class="text-slate-500 text-sm mt-8">
      <a href="/" class="text-brand-600 hover:underline">← Back to recipes</a>
    </p>
  </div>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    pack,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, `success-${pack.slug}.html`), html);
}

/**
 * Generate privacy page
 */
async function generatePrivacyPage(site, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Privacy Policy',
  pageDescription: 'Privacy policy for ' + site.name,
  canonicalPath: '/privacy.html',
  ogType: 'website',
  ogImage: null,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">
<%- include('nav', { site }) %>
<main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="font-anton text-4xl uppercase mb-8">Privacy Policy</h1>
  <div class="prose prose-slate max-w-none">
    <p>Last updated: <%= new Date().toLocaleDateString() %></p>
    <p><%= site.name %> ("we", "our", or "us") operates the <%= site.domain %> website. This page informs you of our policies regarding the collection, use, and disclosure of personal information when you use our Service.</p>
    <h2>Information Collection</h2>
    <p>We may collect your email address when you sign up for our recipe packs. We use this information to send you the requested content and occasional updates about new recipes.</p>
    <h2>Cookies</h2>
    <p>We use cookies and similar tracking technologies to track activity on our Service and hold certain information to improve your experience.</p>
    <h2>Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, please contact us.</p>
  </div>
</main>
<%- include('footer', { site }) %>
</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, 'privacy.html'), html);
}

/**
 * Generate terms page
 */
async function generateTermsPage(site, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Terms of Use',
  pageDescription: 'Terms of use for ' + site.name,
  canonicalPath: '/terms.html',
  ogType: 'website',
  ogImage: null,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">
<%- include('nav', { site }) %>
<main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="font-anton text-4xl uppercase mb-8">Terms of Use</h1>
  <div class="prose prose-slate max-w-none">
    <p>Last updated: <%= new Date().toLocaleDateString() %></p>
    <p>By accessing <%= site.domain %>, you agree to be bound by these Terms of Use.</p>
    <h2>Use of Content</h2>
    <p>All recipes, images, and content on this site are for personal use only. You may not reproduce, distribute, or sell our content without permission.</p>
    <h2>Disclaimer</h2>
    <p>Nutritional information is provided as a guide only. We recommend verifying with your own calculations, especially if you have specific dietary requirements.</p>
    <h2>Changes</h2>
    <p>We reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of any changes.</p>
  </div>
</main>
<%- include('footer', { site }) %>
</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, 'terms.html'), html);
}

/**
 * Generate 404 page
 */
async function generate404Page(site, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Page Not Found',
  pageDescription: 'The page you are looking for could not be found.',
  canonicalPath: '/404.html',
  ogType: 'website',
  ogImage: null,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">
<%- include('nav', { site }) %>
<main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
  <h1 class="font-anton text-6xl text-brand-500 mb-4">404</h1>
  <h2 class="font-anton text-2xl uppercase mb-4">Page Not Found</h2>
  <p class="text-slate-600 mb-8">The recipe you're looking for might have been moved or doesn't exist.</p>
  <a href="/" class="inline-block bg-brand-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
    Back to Recipes
  </a>
</main>
<%- include('footer', { site }) %>
</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, '404.html'), html);
}

/**
 * Generate sitemap.xml
 */
async function generateSitemap(site, recipes, categories, packs, outputDir) {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${site.domain}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

  // Recipe pages
  recipes.forEach(recipe => {
    xml += `  <url>
    <loc>https://${site.domain}/${recipe.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  });

  // Category pages
  Object.values(categories).forEach(cat => {
    xml += `  <url>
    <loc>https://${site.domain}/category-${cat.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  // Pack pages
  packs.forEach(pack => {
    xml += `  <url>
    <loc>https://${site.domain}/pack-${pack.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  xml += `</urlset>`;
  
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), xml);
}

/**
 * Generate robots.txt
 */
async function generateRobotsTxt(site, outputDir) {
  const content = `User-agent: *
Allow: /

Sitemap: https://${site.domain}/sitemap.xml
`;
  
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), content);
}

// Run if called directly
const domain = process.argv[2];
if (!domain) {
  console.error('Usage: node scripts/build-site.js <domain>');
  console.error('Example: node scripts/build-site.js proteincookies.co');
  process.exit(1);
}

buildSite(domain);
