#!/usr/bin/env node
/**
 * Build script for HighProtein.Recipes - The Indexer Site
 * 
 * This site aggregates preview content from all 12 protein sites
 * and links visitors to the full recipes on individual sites.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Import site configuration
import { getSite, empireSites } from '../packages/config/sites.js';

const DOMAIN = 'highprotein.recipes';

/**
 * Load recipes from all empire sites
 */
function loadAllRecipes() {
  const allRecipes = [];
  
  for (const empireSite of empireSites) {
    const dataDir = path.join(ROOT_DIR, 'data', 'recipes', empireSite.domain.replace(/\./g, '-'));
    const recipesFile = path.join(dataDir, 'recipes.json');
    
    if (fs.existsSync(recipesFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));
        const recipes = Array.isArray(data) ? data : (data.recipes || []);
        
        // Add source site info to each recipe
        recipes.forEach(recipe => {
          allRecipes.push({
            ...recipe,
            sourceSite: empireSite.domain,
            sourceName: empireSite.name,
            sourceCategory: empireSite.category,
            foodType: empireSite.foodType,
            fullRecipeUrl: `https://${empireSite.domain}/${recipe.slug}.html`
          });
        });
        
        console.log(`   Loaded ${recipes.length} recipes from ${empireSite.domain}`);
      } catch (error) {
        console.log(`   Warning: Could not load recipes from ${empireSite.domain}: ${error.message}`);
      }
    } else {
      console.log(`   No data found for ${empireSite.domain}`);
    }
  }
  
  return allRecipes;
}

/**
 * Categorize recipes by various criteria
 */
function categorizeRecipes(recipes, site) {
  const categories = {
    // By meal type
    breakfast: recipes.filter(r => r.sourceCategory === 'breakfast'),
    desserts: recipes.filter(r => r.sourceCategory === 'desserts'),
    snacks: recipes.filter(r => r.sourceCategory === 'snacks'),
    savory: recipes.filter(r => r.sourceCategory === 'savory'),
    
    // By food type (for site-specific pages)
    byFoodType: {},
    
    // By ingredient
    byIngredient: {},
    
    // By flavor
    byFlavor: {},
    
    // By diet
    byDiet: {},
    
    // Special filters
    noBake: recipes.filter(r => 
      r.tags?.some(t => t.toLowerCase().includes('no-bake') || t.toLowerCase().includes('no bake')) ||
      r.category?.toLowerCase().includes('no-bake') ||
      r.cookTime === '0' || r.cookTime === 0
    ),
    quick: recipes.filter(r => parseInt(r.totalTime) <= 20),
    highProtein: recipes.filter(r => r.protein >= 30)
  };
  
  // Group by food type
  empireSites.forEach(es => {
    categories.byFoodType[es.foodType] = recipes.filter(r => r.foodType === es.foodType);
  });
  
  // Group by hero ingredients
  site.heroIngredients.forEach(ing => {
    const matchingRecipes = recipes.filter(r => {
      const searchTerms = ing.name.toLowerCase().split(' ');
      const recipeText = [
        r.title,
        r.description,
        ...(r.ingredients || []),
        ...(r.tags || [])
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => recipeText.includes(term));
    });
    categories.byIngredient[ing.slug] = matchingRecipes;
  });
  
  // Group by flavor
  site.flavorTags.forEach(flavor => {
    const matchingRecipes = recipes.filter(r => {
      const searchTerms = flavor.name.toLowerCase().split(' ');
      const recipeText = [r.title, r.description, ...(r.tags || [])].join(' ').toLowerCase();
      return searchTerms.some(term => recipeText.includes(term));
    });
    categories.byFlavor[flavor.slug] = matchingRecipes;
  });
  
  // Group by diet
  site.dietTags.forEach(diet => {
    const matchingRecipes = recipes.filter(r => {
      const searchTerm = diet.name.toLowerCase();
      const recipeText = [r.title, r.category, ...(r.tags || [])].join(' ').toLowerCase();
      return recipeText.includes(searchTerm);
    });
    categories.byDiet[diet.slug] = matchingRecipes;
  });
  
  return categories;
}

/**
 * Build the indexer site
 */
async function buildIndexerSite() {
  console.log('\n🏗️  Building HighProtein.Recipes Indexer Site\n');
  
  const site = getSite(DOMAIN);
  if (!site) {
    console.error('Site configuration not found for:', DOMAIN);
    process.exit(1);
  }
  
  const outputDir = path.join(ROOT_DIR, 'apps', 'highprotein.recipes', 'dist');
  
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'images'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'recipe_images'), { recursive: true });
  
  // Load all recipes
  console.log('📚 Loading recipes from all empire sites...');
  const allRecipes = loadAllRecipes();
  console.log(`   Total recipes loaded: ${allRecipes.length}\n`);
  
  // Categorize recipes
  console.log('📊 Categorizing recipes...');
  const categories = categorizeRecipes(allRecipes, site);
  
  // EJS partials
  const partials = {
    head: fs.readFileSync(path.join(ROOT_DIR, 'packages/ui/templates/partials/head.ejs'), 'utf-8'),
    nav: generateIndexerNav(),
    footer: generateIndexerFooter(),
    'recipe-card': generateIndexerRecipeCard()
  };
  
  // Generate pages
  console.log('\n📄 Generating pages...');
  
  // 1. Homepage
  generateHomepage(site, allRecipes, categories, partials, outputDir);
  
  // 2. Category pages (Breakfast, Desserts, Snacks, Savory)
  generateCategoryPages(site, categories, partials, outputDir);
  
  // 3. Food type pages (cookies, brownies, etc.)
  generateFoodTypePages(site, categories, partials, outputDir);
  
  // 4. Ingredient collection pages
  generateIngredientPages(site, categories, partials, outputDir);
  
  // 5. Flavor pages
  generateFlavorPages(site, categories, partials, outputDir);
  
  // 6. Diet pages
  generateDietPages(site, categories, partials, outputDir);
  
  // 7. Special filter pages (no-bake, quick, high-protein)
  generateSpecialFilterPages(site, categories, partials, outputDir);
  
  // 8. Recipe preview pages (with link to full recipe)
  generateRecipePreviewPages(site, allRecipes, partials, outputDir);
  
  // 9. Static pages
  generateStaticPages(site, partials, outputDir);
  
  // 10. Sitemap and robots.txt
  generateSitemap(site, allRecipes, categories, outputDir);
  generateRobotsTxt(site, outputDir);
  
  // Copy assets
  copyAssets(outputDir);
  
  console.log('\n✅ Build complete!');
  console.log(`   Output: ${outputDir}`);
  console.log(`   Pages generated: ${fs.readdirSync(outputDir).filter(f => f.endsWith('.html')).length}`);
}

/**
 * Generate custom nav for indexer site
 */
function generateIndexerNav() {
  return `
<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2">
                <img src="<%= site.logo %>" alt="<%= site.name %>" class="h-10 w-10 rounded-full">
                <span class="font-anton text-xl text-slate-900 tracking-tight uppercase">HighProtein<span class="text-brand-500">.Recipes</span></span>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center gap-6">
                <div class="relative group">
                    <button class="text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center gap-1">
                        Categories
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <a href="/category-breakfast.html" class="block px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900">Breakfast</a>
                        <a href="/category-desserts.html" class="block px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900">Desserts</a>
                        <a href="/category-snacks.html" class="block px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900">Snacks</a>
                        <a href="/category-savory.html" class="block px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900">Savory</a>
                    </div>
                </div>
                <a href="/no-bake.html" class="text-slate-600 hover:text-slate-900 font-medium transition-colors">No-Bake</a>
                <a href="/high-protein.html" class="text-slate-600 hover:text-slate-900 font-medium transition-colors">30g+ Protein</a>
                <a href="/#sites" class="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600 transition-colors">
                    Browse All Sites
                </a>
            </div>

            <!-- Mobile Menu Button -->
            <button 
                x-data="{ open: false }"
                @click="open = !open; $dispatch('toggle-mobile-menu', { open })"
                class="md:hidden p-2 text-slate-600 hover:text-slate-900"
                aria-label="Toggle menu"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div 
        x-data="{ open: false }"
        @toggle-mobile-menu.window="open = $event.detail.open"
        x-show="open"
        x-cloak
        class="md:hidden bg-white border-b border-slate-200"
    >
        <div class="px-4 py-4 space-y-3">
            <a href="/category-breakfast.html" class="block text-slate-600 hover:text-slate-900 font-medium">Breakfast</a>
            <a href="/category-desserts.html" class="block text-slate-600 hover:text-slate-900 font-medium">Desserts</a>
            <a href="/category-snacks.html" class="block text-slate-600 hover:text-slate-900 font-medium">Snacks</a>
            <a href="/category-savory.html" class="block text-slate-600 hover:text-slate-900 font-medium">Savory</a>
            <a href="/no-bake.html" class="block text-slate-600 hover:text-slate-900 font-medium">No-Bake</a>
            <a href="/high-protein.html" class="block text-slate-600 hover:text-slate-900 font-medium">30g+ Protein</a>
            <a href="/#sites" class="block bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold text-center">
                Browse All Sites
            </a>
        </div>
    </div>
</nav>

<!-- Spacer for fixed nav -->
<div class="h-16"></div>
`;
}

/**
 * Generate custom footer for indexer site
 */
function generateIndexerFooter() {
  return `
<footer class="bg-slate-900 text-white py-12 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Brand -->
            <div class="col-span-1">
                <div class="flex items-center gap-2 mb-4">
                    <img src="<%= site.logo %>" alt="<%= site.name %>" class="h-10 w-10 rounded-full">
                    <span class="font-anton text-xl tracking-tight uppercase">HighProtein<span class="text-brand-500">.Recipes</span></span>
                </div>
                <p class="text-slate-400 text-sm">
                    Your gateway to 300+ macro-verified high-protein recipes across 12 specialized sites.
                </p>
            </div>

            <!-- Categories -->
            <div>
                <h4 class="font-semibold mb-4">Categories</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/category-breakfast.html" class="hover:text-white transition-colors">Breakfast</a></li>
                    <li><a href="/category-desserts.html" class="hover:text-white transition-colors">Desserts</a></li>
                    <li><a href="/category-snacks.html" class="hover:text-white transition-colors">Snacks</a></li>
                    <li><a href="/category-savory.html" class="hover:text-white transition-colors">Savory</a></li>
                </ul>
            </div>

            <!-- Popular Ingredients -->
            <div>
                <h4 class="font-semibold mb-4">By Ingredient</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/ingredient-protein-powder.html" class="hover:text-white transition-colors">Protein Powder</a></li>
                    <li><a href="/ingredient-greek-yogurt.html" class="hover:text-white transition-colors">Greek Yogurt</a></li>
                    <li><a href="/ingredient-cottage-cheese.html" class="hover:text-white transition-colors">Cottage Cheese</a></li>
                    <li><a href="/ingredient-oats.html" class="hover:text-white transition-colors">Oats</a></li>
                </ul>
            </div>

            <!-- Legal -->
            <div>
                <h4 class="font-semibold mb-4">Legal</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/privacy.html" class="hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="/terms.html" class="hover:text-white transition-colors">Terms of Use</a></li>
                </ul>
            </div>
        </div>

        <!-- Empire Links -->
        <div class="mt-12 pt-8 border-t border-slate-800">
            <p class="text-slate-500 text-sm text-center mb-4">The Protein Empire</p>
            <div class="flex flex-wrap justify-center gap-4 text-slate-400 text-sm">
                <a href="https://proteinmuffins.com" class="hover:text-white transition-colors">Muffins</a>
                <a href="https://proteincookies.co" class="hover:text-white transition-colors">Cookies</a>
                <a href="https://proteinpancakes.co" class="hover:text-white transition-colors">Pancakes</a>
                <a href="https://proteinbrownies.co" class="hover:text-white transition-colors">Brownies</a>
                <a href="https://protein-bread.com" class="hover:text-white transition-colors">Bread</a>
                <a href="https://proteinbars.co" class="hover:text-white transition-colors">Bars</a>
                <a href="https://proteinbites.co" class="hover:text-white transition-colors">Bites</a>
                <a href="https://proteindonuts.co" class="hover:text-white transition-colors">Donuts</a>
                <a href="https://proteinoatmeal.co" class="hover:text-white transition-colors">Oatmeal</a>
                <a href="https://proteincheesecake.co" class="hover:text-white transition-colors">Cheesecake</a>
                <a href="https://proteinpizzas.co" class="hover:text-white transition-colors">Pizza</a>
                <a href="https://proteinpudding.co" class="hover:text-white transition-colors">Pudding</a>
            </div>
        </div>

        <!-- Copyright -->
        <div class="mt-8 text-center text-slate-500 text-sm">
            <p>&copy; <%= new Date().getFullYear() %> <a href="https://HighProtein.Recipes" class="hover:text-amber-400 transition-colors">High Protein Recipes</a>. All rights reserved.</p>
        </div>
    </div>
</footer>
`;
}

/**
 * Generate recipe card for indexer (with external link)
 */
function generateIndexerRecipeCard() {
  return `
<div class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100">
    <!-- Image Container -->
    <a href="/<%= recipe.slug %>-preview.html" class="block relative aspect-square overflow-hidden">
        <img 
            src="<%= recipe.image_url || ('https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg') %>" 
            alt="<%= recipe.title %>"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onerror="this.src='/images/placeholder.png'"
        >
        <!-- Protein Badge -->
        <div class="absolute top-3 left-3 bg-accent-500 text-white text-sm font-bold px-2 py-1 rounded-lg">
            <%= recipe.protein %>g
        </div>
        <!-- Source Badge -->
        <div class="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-medium px-2 py-1 rounded-lg">
            <%= recipe.sourceName %>
        </div>
    </a>
    
    <!-- Content -->
    <div class="p-4">
        <a href="/<%= recipe.slug %>-preview.html">
            <h3 class="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                <%= recipe.title %>
            </h3>
        </a>
        <div class="mt-2 flex items-center gap-3 text-sm text-slate-500">
            <span><%= recipe.calories %> cal</span>
            <span>•</span>
            <span><%= recipe.totalTime %>m</span>
            <span>•</span>
            <span><%= recipe.difficulty %></span>
        </div>
        <a href="<%= recipe.fullRecipeUrl %>" target="_blank" rel="noopener" class="mt-3 inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 font-medium text-sm">
            Full Recipe
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
    </div>
</div>
`;
}

/**
 * Generate homepage
 */
function generateHomepage(site, allRecipes, categories, partials, outputDir) {
  console.log('   - Homepage');
  
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
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
<%- include('nav', { site }) %>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
    <div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center max-w-4xl mx-auto">
            <h1 class="font-anton text-5xl lg:text-7xl uppercase tracking-wider mb-6">
                <span class="text-brand-500">300+</span> High-Protein Recipes
            </h1>
            <p class="text-xl lg:text-2xl text-slate-300 mb-8">
                <%= site.tagline %>. From cookies to pizza, pancakes to pudding - find your perfect macro-friendly treat.
            </p>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="#recipes" class="bg-brand-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-600 transition-colors">
                    Browse Recipes
                </a>
                <a href="#sites" class="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20">
                    Explore All Sites
                </a>
            </div>
        </div>
    </div>
</section>

<!-- Quick Stats -->
<section class="py-8 bg-white border-b border-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
                <div class="font-anton text-4xl text-brand-500"><%= allRecipes.length %>+</div>
                <div class="text-slate-600">Recipes</div>
            </div>
            <div>
                <div class="font-anton text-4xl text-brand-500">12</div>
                <div class="text-slate-600">Specialized Sites</div>
            </div>
            <div>
                <div class="font-anton text-4xl text-brand-500"><%= categories.highProtein.length %></div>
                <div class="text-slate-600">30g+ Protein</div>
            </div>
            <div>
                <div class="font-anton text-4xl text-brand-500"><%= categories.noBake.length %></div>
                <div class="text-slate-600">No-Bake Options</div>
            </div>
        </div>
    </div>
</section>

<!-- Featured Recipes -->
<section id="recipes" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Featured Recipes</h2>
            <p class="text-slate-600 text-lg">Hand-picked favorites from across the Protein Empire</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <% allRecipes.slice(0, 8).forEach(recipe => { %>
                <%- include('recipe-card', { recipe }) %>
            <% }); %>
        </div>
        
        <div class="text-center mt-12">
            <a href="/all-recipes.html" class="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                View All <%= allRecipes.length %> Recipes
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
        </div>
    </div>
</section>

<!-- Browse by Category -->
<section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Browse by Category</h2>
            <p class="text-slate-600 text-lg">Find recipes organized the way you think about food</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="/category-breakfast.html" class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-amber-500 to-orange-600">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 class="font-anton text-2xl uppercase tracking-wider">Breakfast</h3>
                    <p class="text-white/80"><%= categories.breakfast.length %> recipes</p>
                </div>
            </a>
            <a href="/category-desserts.html" class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-pink-500 to-rose-600">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 class="font-anton text-2xl uppercase tracking-wider">Desserts</h3>
                    <p class="text-white/80"><%= categories.desserts.length %> recipes</p>
                </div>
            </a>
            <a href="/category-snacks.html" class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-emerald-500 to-teal-600">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 class="font-anton text-2xl uppercase tracking-wider">Snacks</h3>
                    <p class="text-white/80"><%= categories.snacks.length %> recipes</p>
                </div>
            </a>
            <a href="/category-savory.html" class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-slate-600 to-slate-800">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 class="font-anton text-2xl uppercase tracking-wider">Savory</h3>
                    <p class="text-white/80"><%= categories.savory.length %> recipes</p>
                </div>
            </a>
        </div>
    </div>
</section>

<!-- The Protein Empire Sites -->
<section id="sites" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">The Protein Empire</h2>
            <p class="text-slate-600 text-lg">12 specialized sites, each dedicated to perfecting one type of high-protein treat</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <% empireSites.forEach(es => { %>
            <a href="https://<%= es.domain %>" target="_blank" rel="noopener" class="group bg-white rounded-xl p-6 border border-slate-100 hover:border-brand-500 hover:shadow-lg transition-all text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-anton text-xl uppercase">
                    <%= es.name.charAt(0) %>
                </div>
                <h3 class="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors"><%= es.name %></h3>
                <p class="text-sm text-slate-500 mt-1"><%= es.domain %></p>
            </a>
            <% }); %>
        </div>
    </div>
</section>

<!-- Hero Ingredients -->
<section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Popular Ingredients</h2>
            <p class="text-slate-600 text-lg">Browse recipes by your favorite protein sources</p>
        </div>
        
        <div class="flex flex-wrap justify-center gap-4">
            <% site.heroIngredients.forEach(ing => { %>
            <a href="/ingredient-<%= ing.slug %>.html" class="bg-slate-100 hover:bg-brand-500 hover:text-white px-6 py-3 rounded-full font-medium transition-colors">
                <%= ing.name %>
                <span class="ml-2 text-sm opacity-70">(<%= categories.byIngredient[ing.slug]?.length || 0 %>)</span>
            </a>
            <% }); %>
        </div>
    </div>
</section>

<!-- Special Filters -->
<section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="/no-bake.html" class="group bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
                <div class="text-5xl mb-4">🍪</div>
                <h3 class="font-anton text-2xl uppercase tracking-wider mb-2">No-Bake Recipes</h3>
                <p class="text-white/80 mb-4"><%= categories.noBake.length %> recipes ready in minutes with zero oven time</p>
                <span class="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                    Browse No-Bake
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </span>
            </a>
            <a href="/quick.html" class="group bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white">
                <div class="text-5xl mb-4">⚡</div>
                <h3 class="font-anton text-2xl uppercase tracking-wider mb-2">Quick & Easy</h3>
                <p class="text-white/80 mb-4"><%= categories.quick.length %> recipes ready in 20 minutes or less</p>
                <span class="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                    Browse Quick Recipes
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </span>
            </a>
            <a href="/high-protein.html" class="group bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white">
                <div class="text-5xl mb-4">💪</div>
                <h3 class="font-anton text-2xl uppercase tracking-wider mb-2">30g+ Protein</h3>
                <p class="text-white/80 mb-4"><%= categories.highProtein.length %> recipes with serious protein content</p>
                <span class="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                    Browse High Protein
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </span>
            </a>
        </div>
    </div>
</section>

<%- include('footer', { site }) %>
</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    allRecipes,
    categories,
    empireSites,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
}

/**
 * Generate category pages
 */
function generateCategoryPages(site, categories, partials, outputDir) {
  const categoryConfigs = [
    { slug: 'breakfast', name: 'Breakfast', description: 'Start your day with protein-packed pancakes, muffins, and oatmeal', recipes: categories.breakfast },
    { slug: 'desserts', name: 'Desserts', description: 'Indulgent cookies, brownies, cheesecakes, and more - all macro-friendly', recipes: categories.desserts },
    { slug: 'snacks', name: 'Snacks', description: 'Quick protein bites and bars for on-the-go nutrition', recipes: categories.snacks },
    { slug: 'savory', name: 'Savory', description: 'High-protein pizza crusts, bread, and savory treats', recipes: categories.savory }
  ];
  
  categoryConfigs.forEach(cat => {
    console.log(`   - Category: ${cat.name}`);
    generateListingPage(site, cat.recipes, {
      title: `${cat.name} Recipes`,
      description: cat.description,
      slug: `category-${cat.slug}`,
      breadcrumb: [{ name: 'Home', url: '/' }, { name: cat.name, url: null }]
    }, partials, outputDir);
  });
}

/**
 * Generate food type pages
 */
function generateFoodTypePages(site, categories, partials, outputDir) {
  Object.entries(categories.byFoodType).forEach(([foodType, recipes]) => {
    if (recipes.length > 0) {
      console.log(`   - Food Type: ${foodType}`);
      const title = foodType.charAt(0).toUpperCase() + foodType.slice(1);
      generateListingPage(site, recipes, {
        title: `Protein ${title} Recipes`,
        description: `All ${recipes.length} macro-verified protein ${foodType} recipes`,
        slug: `type-${foodType}`,
        breadcrumb: [{ name: 'Home', url: '/' }, { name: title, url: null }]
      }, partials, outputDir);
    }
  });
}

/**
 * Generate ingredient collection pages
 */
function generateIngredientPages(site, categories, partials, outputDir) {
  site.heroIngredients.forEach(ing => {
    const recipes = categories.byIngredient[ing.slug] || [];
    console.log(`   - Ingredient: ${ing.name} (${recipes.length} recipes)`);
    generateListingPage(site, recipes, {
      title: `${ing.name} Recipes`,
      description: `${recipes.length} high-protein recipes featuring ${ing.name.toLowerCase()}`,
      slug: `ingredient-${ing.slug}`,
      breadcrumb: [{ name: 'Home', url: '/' }, { name: 'Ingredients', url: null }, { name: ing.name, url: null }]
    }, partials, outputDir);
  });
}

/**
 * Generate flavor pages
 */
function generateFlavorPages(site, categories, partials, outputDir) {
  site.flavorTags.forEach(flavor => {
    const recipes = categories.byFlavor[flavor.slug] || [];
    console.log(`   - Flavor: ${flavor.name} (${recipes.length} recipes)`);
    generateListingPage(site, recipes, {
      title: `${flavor.name} Recipes`,
      description: `${recipes.length} delicious ${flavor.name.toLowerCase()}-flavored high-protein recipes`,
      slug: `flavor-${flavor.slug}`,
      breadcrumb: [{ name: 'Home', url: '/' }, { name: 'Flavors', url: null }, { name: flavor.name, url: null }]
    }, partials, outputDir);
  });
}

/**
 * Generate diet pages
 */
function generateDietPages(site, categories, partials, outputDir) {
  site.dietTags.forEach(diet => {
    const recipes = categories.byDiet[diet.slug] || [];
    console.log(`   - Diet: ${diet.name} (${recipes.length} recipes)`);
    generateListingPage(site, recipes, {
      title: `${diet.name} Recipes`,
      description: `${recipes.length} ${diet.name.toLowerCase()} high-protein recipes`,
      slug: `diet-${diet.slug}`,
      breadcrumb: [{ name: 'Home', url: '/' }, { name: 'Diets', url: null }, { name: diet.name, url: null }]
    }, partials, outputDir);
  });
}

/**
 * Generate special filter pages
 */
function generateSpecialFilterPages(site, categories, partials, outputDir) {
  const filters = [
    { slug: 'no-bake', name: 'No-Bake', description: 'Zero oven time required - just mix, chill, and enjoy', recipes: categories.noBake },
    { slug: 'quick', name: 'Quick & Easy', description: 'Ready in 20 minutes or less', recipes: categories.quick },
    { slug: 'high-protein', name: 'High Protein (30g+)', description: 'Recipes with 30 grams of protein or more per serving', recipes: categories.highProtein }
  ];
  
  filters.forEach(filter => {
    console.log(`   - Filter: ${filter.name} (${filter.recipes.length} recipes)`);
    generateListingPage(site, filter.recipes, {
      title: `${filter.name} Recipes`,
      description: filter.description,
      slug: filter.slug,
      breadcrumb: [{ name: 'Home', url: '/' }, { name: filter.name, url: null }]
    }, partials, outputDir);
  });
}

/**
 * Generate a listing page
 */
function generateListingPage(site, recipes, config, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: config.title + ' | ' + site.name,
  pageDescription: config.description,
  canonicalPath: '/' + config.slug + '.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <nav class="mb-8 text-sm">
            <ol class="flex items-center gap-2 text-slate-500">
                <% config.breadcrumb.forEach((crumb, i) => { %>
                    <% if (crumb.url) { %>
                        <li><a href="<%= crumb.url %>" class="hover:text-slate-900"><%= crumb.name %></a></li>
                        <li>/</li>
                    <% } else { %>
                        <li class="text-slate-900 font-medium"><%= crumb.name %></li>
                    <% } %>
                <% }); %>
            </ol>
        </nav>
        
        <!-- Header -->
        <div class="mb-12">
            <h1 class="font-anton text-4xl uppercase tracking-wider mb-4"><%= config.title %></h1>
            <p class="text-slate-600 text-lg"><%= config.description %></p>
            <p class="text-slate-500 mt-2"><%= recipes.length %> recipes found</p>
        </div>
        
        <% if (recipes.length > 0) { %>
        <!-- Recipe Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <% recipes.forEach(recipe => { %>
                <%- include('recipe-card', { recipe }) %>
            <% }); %>
        </div>
        <% } else { %>
        <div class="text-center py-16">
            <p class="text-slate-500 text-lg">No recipes found in this category yet.</p>
            <a href="/" class="inline-block mt-4 text-brand-500 hover:text-brand-600 font-medium">← Back to Home</a>
        </div>
        <% } %>
    </div>
</main>

<%- include('footer', { site }) %>
</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    recipes,
    config,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, `${config.slug}.html`), html);
}

/**
 * Generate recipe preview pages
 */
function generateRecipePreviewPages(site, allRecipes, partials, outputDir) {
  console.log(`   - Recipe preview pages (${allRecipes.length} recipes)`);
  
  allRecipes.forEach(recipe => {
    const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: recipe.title + ' | ' + site.name,
  pageDescription: recipe.description,
  canonicalPath: '/' + recipe.slug + '-preview.html',
  ogType: 'article',
  ogImage: recipe.image_url || ('https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg'),
  preloadImage: recipe.image_url || ('https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg'),
  includeIngredients: false
}) %>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "<%= recipe.title %>",
  "description": "<%= recipe.description %>",
  "image": "<%= recipe.image_url || ('https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg') %>",
  "author": {
    "@type": "Organization",
    "name": "<%= recipe.sourceName %>"
  },
  "prepTime": "PT<%= recipe.prepTime %>M",
  "cookTime": "PT<%= recipe.cookTime %>M",
  "totalTime": "PT<%= recipe.totalTime %>M",
  "recipeYield": "<%= recipe.yield %>",
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "<%= recipe.calories %> calories",
    "proteinContent": "<%= recipe.protein %>g"
  },
  "recipeCategory": "<%= recipe.category || recipe.foodType %>",
  "keywords": "<%= (recipe.tags || []).join(', ') %>"
}
</script>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <nav class="mb-8 text-sm">
            <ol class="flex items-center gap-2 text-slate-500">
                <li><a href="/" class="hover:text-slate-900">Home</a></li>
                <li>/</li>
                <li><a href="/type-<%= recipe.foodType %>.html" class="hover:text-slate-900"><%= recipe.foodType.charAt(0).toUpperCase() + recipe.foodType.slice(1) %></a></li>
                <li>/</li>
                <li class="text-slate-900 font-medium"><%= recipe.title %></li>
            </ol>
        </nav>
        
        <!-- Recipe Header -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-8">
            <div class="aspect-video relative">
                <img 
                    src="<%= recipe.image_url || ('https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg') %>" 
                    alt="<%= recipe.title %>"
                    class="w-full h-full object-cover"
                    onerror="this.src='/images/placeholder.png'"
                >
                <div class="absolute top-4 left-4 bg-accent-500 text-white text-lg font-bold px-3 py-1 rounded-lg">
                    <%= recipe.protein %>g protein
                </div>
                <div class="absolute top-4 right-4 bg-slate-900/80 text-white text-sm font-medium px-3 py-1 rounded-lg">
                    From <%= recipe.sourceName %>
                </div>
            </div>
            
            <div class="p-8">
                <h1 class="font-anton text-3xl lg:text-4xl uppercase tracking-wider mb-4"><%= recipe.title %></h1>
                <p class="text-slate-600 text-lg mb-6"><%= recipe.description %></p>
                
                <!-- Quick Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-slate-50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-slate-900"><%= recipe.calories %></div>
                        <div class="text-sm text-slate-500">Calories</div>
                    </div>
                    <div class="bg-emerald-50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-emerald-600"><%= recipe.protein %>g</div>
                        <div class="text-sm text-slate-500">Protein</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-slate-900"><%= recipe.carbs %>g</div>
                        <div class="text-sm text-slate-500">Carbs</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-slate-900"><%= recipe.fat %>g</div>
                        <div class="text-sm text-slate-500">Fat</div>
                    </div>
                </div>
                
                <!-- Time & Difficulty -->
                <div class="flex flex-wrap gap-4 mb-8 text-slate-600">
                    <span class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Prep: <%= recipe.prepTime %> min
                    </span>
                    <span class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg>
                        Cook: <%= recipe.cookTime %> min
                    </span>
                    <span class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        <%= recipe.difficulty %>
                    </span>
                    <span class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        Yields: <%= recipe.yield %>
                    </span>
                </div>
                
                <!-- CTA -->
                <div class="bg-gradient-to-r from-brand-500 to-accent-500 rounded-xl p-6 text-white text-center">
                    <h3 class="font-anton text-2xl uppercase tracking-wider mb-2">Get the Full Recipe</h3>
                    <p class="text-white/80 mb-4">Complete ingredients list, step-by-step instructions, and tips</p>
                    <a href="<%= recipe.fullRecipeUrl %>" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                        View on <%= recipe.sourceName %>
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Tags -->
        <% if (recipe.tags && recipe.tags.length > 0) { %>
        <div class="mb-8">
            <h3 class="font-semibold text-slate-900 mb-3">Tags</h3>
            <div class="flex flex-wrap gap-2">
                <% recipe.tags.forEach(tag => { %>
                <span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"><%= tag %></span>
                <% }); %>
            </div>
        </div>
        <% } %>
        
        <!-- Related -->
        <div class="text-center">
            <a href="/type-<%= recipe.foodType %>.html" class="text-brand-500 hover:text-brand-600 font-medium">
                ← More <%= recipe.foodType.charAt(0).toUpperCase() + recipe.foodType.slice(1) %> Recipes
            </a>
        </div>
    </div>
</main>

<%- include('footer', { site }) %>
</body>
</html>
`;

    const html = ejs.render(template, {
      site,
      recipe,
      include: (name, data) => ejs.render(partials[name], data)
    });
    
    fs.writeFileSync(path.join(outputDir, `${recipe.slug}-preview.html`), html);
  });
}

/**
 * Generate static pages (privacy, terms, all recipes)
 */
function generateStaticPages(site, partials, outputDir) {
  console.log('   - Static pages (privacy, terms)');
  
  // Privacy page
  const privacyTemplate = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Privacy Policy | ' + site.name,
  pageDescription: 'Privacy policy for ' + site.name,
  canonicalPath: '/privacy.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
<%- include('nav', { site }) %>
<main class="flex-grow py-16">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="font-anton text-4xl uppercase mb-8 tracking-wider">PRIVACY POLICY</h1>
        <div class="prose prose-slate max-w-none">
            <p>Last updated: January 1, 2026</p>
            
            <h2>Information We Collect</h2>
            <p>We collect information you provide when you sign up for our newsletter or download a recipe pack. This may include your email address.</p>
            
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to send you recipe updates, newsletters, and promotional materials. You can opt out at any time.</p>
            
            <h2>Cookies</h2>
            <p>We use cookies and similar technologies to analyze traffic and improve your experience on our site.</p>
            
            <h2>Third-Party Services</h2>
            <p>We may use third-party services such as Google Analytics to help us understand how visitors use our site.</p>
            
            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us.</p>
        </div>
    </div>
</main>
<%- include('footer', { site }) %>
</body>
</html>
`;
  
  fs.writeFileSync(path.join(outputDir, 'privacy.html'), ejs.render(privacyTemplate, {
    site,
    include: (name, data) => ejs.render(partials[name], data)
  }));
  
  // Terms page
  const termsTemplate = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Terms of Use | ' + site.name,
  pageDescription: 'Terms of use for ' + site.name,
  canonicalPath: '/terms.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
<%- include('nav', { site }) %>
<main class="flex-grow py-16">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="font-anton text-4xl uppercase mb-8 tracking-wider">TERMS OF USE</h1>
        <div class="prose prose-slate max-w-none">
            <p>Last updated: January 1, 2026</p>
            
            <h2>Acceptance of Terms</h2>
            <p>By accessing and using HighProtein.Recipes, you accept and agree to be bound by these Terms of Use.</p>
            
            <h2>Use of Content</h2>
            <p>All recipes and content on this site are for personal, non-commercial use only. You may not reproduce, distribute, or sell our content without permission.</p>
            
            <h2>Nutritional Information</h2>
            <p>Nutritional information is provided as a guide only. We verify our data using USDA FoodData Central, but actual values may vary based on ingredients used.</p>
            
            <h2>External Links</h2>
            <p>This site contains links to external recipe sites within the Protein Empire network. We are not responsible for the content or practices of these external sites.</p>
            
            <h2>Disclaimer</h2>
            <p>The recipes and information on this site are provided "as is" without warranty of any kind. Always consult a healthcare professional before making dietary changes.</p>
            
            <h2>Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of any changes.</p>
        </div>
    </div>
</main>
<%- include('footer', { site }) %>
</body>
</html>
`;
  
  fs.writeFileSync(path.join(outputDir, 'terms.html'), ejs.render(termsTemplate, {
    site,
    include: (name, data) => ejs.render(partials[name], data)
  }));
}

/**
 * Generate sitemap
 */
function generateSitemap(site, allRecipes, categories, outputDir) {
  console.log('   - Sitemap');
  
  const today = new Date().toISOString().split('T')[0];
  
  let urls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/privacy.html', priority: '0.3', changefreq: 'yearly' },
    { loc: '/terms.html', priority: '0.3', changefreq: 'yearly' },
    { loc: '/category-breakfast.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category-desserts.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category-snacks.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category-savory.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/no-bake.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/quick.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/high-protein.html', priority: '0.8', changefreq: 'weekly' },
  ];
  
  // Add ingredient pages
  site.heroIngredients.forEach(ing => {
    urls.push({ loc: `/ingredient-${ing.slug}.html`, priority: '0.7', changefreq: 'weekly' });
  });
  
  // Add flavor pages
  site.flavorTags.forEach(flavor => {
    urls.push({ loc: `/flavor-${flavor.slug}.html`, priority: '0.6', changefreq: 'weekly' });
  });
  
  // Add diet pages
  site.dietTags.forEach(diet => {
    urls.push({ loc: `/diet-${diet.slug}.html`, priority: '0.6', changefreq: 'weekly' });
  });
  
  // Add food type pages
  Object.keys(categories.byFoodType).forEach(foodType => {
    urls.push({ loc: `/type-${foodType}.html`, priority: '0.7', changefreq: 'weekly' });
  });
  
  // Add recipe preview pages
  allRecipes.forEach(recipe => {
    urls.push({ loc: `/${recipe.slug}-preview.html`, priority: '0.5', changefreq: 'monthly' });
  });
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>https://${site.domain}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap);
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt(site, outputDir) {
  console.log('   - robots.txt');
  
  const robots = `User-agent: *
Allow: /
Sitemap: https://${site.domain}/sitemap.xml
`;
  
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), robots);
}

/**
 * Copy assets
 */
function copyAssets(outputDir) {
  console.log('\n📁 Copying assets...');
  
  const ROOT_DIR_ASSETS = path.resolve(__dirname, '..');
  const targetImagesDir = path.join(outputDir, 'recipe_images');
  
  // Copy recipe images from proteincookies.co
  const sourceImagesDir = path.join(ROOT_DIR_ASSETS, 'apps/proteincookies.co/dist/recipe_images');
  if (fs.existsSync(sourceImagesDir)) {
    fs.readdirSync(sourceImagesDir).forEach(file => {
      fs.copyFileSync(
        path.join(sourceImagesDir, file),
        path.join(targetImagesDir, file)
      );
    });
    console.log('   Copied proteincookies.co recipe images');
  }
  
  // Copy recipe images from all data/images subdirectories
  const dataImagesDir = path.join(ROOT_DIR_ASSETS, 'data/images');
  if (fs.existsSync(dataImagesDir)) {
    const subdirs = fs.readdirSync(dataImagesDir);
    subdirs.forEach(subdir => {
      const subdirPath = path.join(dataImagesDir, subdir);
      if (fs.statSync(subdirPath).isDirectory()) {
        fs.readdirSync(subdirPath).forEach(file => {
          if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.webp')) {
            const targetPath = path.join(targetImagesDir, file);
            // Only copy if file doesn't already exist (avoid overwriting)
            if (!fs.existsSync(targetPath)) {
              fs.copyFileSync(
                path.join(subdirPath, file),
                targetPath
              );
            }
          }
        });
        console.log(`   Copied ${subdir} recipe images`);
      }
    });
  }
  
  // Copy logo and other images
  const sourceLogoDir = path.join(ROOT_DIR_ASSETS, 'apps/proteincookies.co/dist/images');
  const targetLogoDir = path.join(outputDir, 'images');
  
  if (fs.existsSync(sourceLogoDir)) {
    fs.readdirSync(sourceLogoDir).forEach(file => {
      fs.copyFileSync(
        path.join(sourceLogoDir, file),
        path.join(targetLogoDir, file)
      );
    });
    console.log('   Copied logo and images');
  }
  
  // Create placeholder image
  const placeholderSvg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f1f5f9"/>
    <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#94a3b8" text-anchor="middle" dy=".3em">Recipe Image</text>
  </svg>`;
  fs.writeFileSync(path.join(outputDir, 'images/placeholder.png'), placeholderSvg);
}

// Run the build
buildIndexerSite().catch(console.error);
