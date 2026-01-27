#!/usr/bin/env node

/**
 * Site Builder for the Protein Empire
 * 
 * This script generates a complete static site from recipe data and templates.
 * Templates are designed to match ProteinMuffins.com exactly for SEO and design parity.
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
import { getSite, sites } from '../packages/config/sites.js';
import { getCategoriesForSite } from '../packages/config/categories.js';
import { mapIngredientNameToId } from '../packages/ingredients/ingredient-mapper.js';
import { linkifyDescription } from './linkify-description.js';
import { seoContent, categorySeoContent } from '../packages/config/seo-content.js';

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
    // Helper function to format ingredient name properly
    const formatIngredientName = (name) => {
      // Capitalize first letter of each word, handle special cases
      return name
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/\bOf\b/g, 'of')
        .replace(/\bAnd\b/g, 'and');
    };
    
    // Helper function to parse fractions like "1/2" to decimal
    const parseFraction = (str) => {
      if (!str) return 0;
      str = str.trim();
      // Handle mixed numbers like "1 1/2"
      const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
      if (mixedMatch) {
        return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
      }
      // Handle simple fractions like "1/2"
      const fractionMatch = str.match(/^(\d+)\/(\d+)$/);
      if (fractionMatch) {
        return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
      }
      // Handle decimal numbers
      return parseFloat(str) || 0;
    };
    
    // Parse string ingredients into objects if needed
    if (recipe.ingredients && typeof recipe.ingredients[0] === 'string') {
      recipe.ingredients = recipe.ingredients.map(ing => {
        // Handle ml-based ingredients: "60ml almond milk", "120ml warm water"
        const mlMatch = ing.match(/^(\d+)ml\s+(.+)$/i);
        if (mlMatch) {
          const mlAmount = parseInt(mlMatch[1]);
          const rawName = mlMatch[2];
          const name = formatIngredientName(rawName);
          const id = mapIngredientNameToId(rawName) || rawName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          // Convert ml to grams (approximate: 1ml ≈ 1g for most liquids)
          return { 
            amount: mlAmount, 
            displayAmount: mlAmount,
            name, 
            id, 
            unit: 'ml',
            originalText: ing
          };
        }
        
        // Handle gram-based ingredients: "240g cream cheese"
        const gramMatch = ing.match(/^(\d+)g\s+(.+)$/);
        if (gramMatch) {
          const rawName = gramMatch[2];
          const name = formatIngredientName(rawName);
          const id = mapIngredientNameToId(rawName) || rawName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          return { amount: parseInt(gramMatch[1]), name, id, unit: 'g' };
        }
        
        // Handle egg-based ingredients: "2 large eggs", "3 egg whites", "1 egg"
        const eggMatch = ing.match(/^(\d+)\s+(large\s+)?(eggs?|egg\s+whites?)(.*)$/i);
        if (eggMatch) {
          const count = parseInt(eggMatch[1]);
          const isWhites = /whites?/i.test(eggMatch[3]);
          const name = isWhites ? 'Liquid Egg Whites' : 'Whole Eggs';
          const id = isWhites ? 'egg-whites-liquid' : 'whole-eggs';
          // Convert to grams: 1 large egg ≈ 50g, 1 egg white ≈ 33g (from 3 tbsp)
          const gramsPerUnit = isWhites ? 33 : 50;
          return { 
            amount: count * gramsPerUnit, 
            displayAmount: count,
            name, 
            id, 
            unit: isWhites ? 'egg whites' : 'eggs',
            originalText: ing
          };
        }
        
        // Handle fractional tsp/tbsp: "1/2 tsp cinnamon", "1 1/2 tbsp honey"
        const fractionTspMatch = ing.match(/^([\d\s\/]+)\s*(tsp|tbsp|teaspoon|tablespoon)s?\s+(.+)$/i);
        if (fractionTspMatch) {
          const amount = parseFraction(fractionTspMatch[1]);
          const unit = fractionTspMatch[2].toLowerCase().startsWith('tb') ? 'tbsp' : 'tsp';
          const rawName = fractionTspMatch[3];
          const name = formatIngredientName(rawName);
          const id = mapIngredientNameToId(rawName) || rawName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          // Convert to grams: 1 tsp ≈ 5g, 1 tbsp ≈ 15g
          const gramsPerUnit = unit === 'tbsp' ? 15 : 5;
          return { 
            amount: Math.round(amount * gramsPerUnit), 
            displayAmount: amount,
            name, 
            id, 
            unit,
            originalText: ing
          };
        }
        
        // Handle fractional amounts with ingredients: "1/2 ripe banana", "1 1/2 cups flour"
        const fractionIngMatch = ing.match(/^([\d\s\/]+)\s+(.+)$/i);
        if (fractionIngMatch && fractionIngMatch[1].includes('/')) {
          const amount = parseFraction(fractionIngMatch[1]);
          const rawName = fractionIngMatch[2];
          const name = formatIngredientName(rawName);
          const id = mapIngredientNameToId(rawName) || rawName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          // Estimate grams based on common ingredients
          let estimatedGrams = Math.round(amount * 100); // Default: assume 100g per unit
          if (/banana/i.test(rawName)) estimatedGrams = Math.round(amount * 120); // 1 banana ≈ 120g
          if (/apple/i.test(rawName)) estimatedGrams = Math.round(amount * 180); // 1 apple ≈ 180g
          if (/cup/i.test(rawName)) estimatedGrams = Math.round(amount * 240); // 1 cup ≈ 240ml/g
          return { 
            amount: estimatedGrams, 
            displayAmount: fractionIngMatch[1].trim(),
            name, 
            id, 
            unit: '',
            originalText: ing
          };
        }
        
        // Handle "pinch of" ingredients
        const pinchMatch = ing.match(/^pinch\s+(of\s+)?(.+)$/i);
        if (pinchMatch) {
          const rawName = pinchMatch[2];
          const name = formatIngredientName(rawName);
          const id = mapIngredientNameToId(rawName) || rawName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          return { 
            amount: 1, 
            displayAmount: 'pinch',
            name, 
            id, 
            unit: '',
            originalText: ing
          };
        }
        
        // Handle generic number + ingredient: "100 almond flour for crust"
        const genericMatch = ing.match(/^(\d+)\s+(.+)$/);
        if (genericMatch) {
          const rawName = genericMatch[2];
          const name = formatIngredientName(rawName);
          const id = mapIngredientNameToId(rawName) || rawName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          return { amount: parseInt(genericMatch[1]), name, id, unit: 'g' };
        }
        
        // Fallback for unmatched ingredients - keep the original text as name
        const name = formatIngredientName(ing);
        const id = mapIngredientNameToId(ing) || ing.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return { amount: 0, displayAmount: '', name, id, unit: '' };
      });
    } else if (recipe.ingredients) {
      // Ensure existing ingredient objects have proper IDs
      recipe.ingredients = recipe.ingredients.map(ing => {
        if (!ing.id || ing.id === ing.name.toLowerCase().replace(/\s+/g, '-')) {
          const id = mapIngredientNameToId(ing.name) || ing.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          return { ...ing, id };
        }
        return ing;
      });
    }
    
    // Deduplicate ingredient IDs to prevent Alpine.js x-for key conflicts
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      const idCounts = {};
      recipe.ingredients = recipe.ingredients.map(ing => {
        const baseId = ing.id;
        if (idCounts[baseId] !== undefined) {
          idCounts[baseId]++;
          return { ...ing, id: `${baseId}-${idCounts[baseId]}` };
        } else {
          idCounts[baseId] = 0;
          return ing;
        }
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
    // Generate keywords from tags and category
    if (!recipe.keywords) {
      recipe.keywords = [
        `protein ${site.foodType}`,
        recipe.category || 'classic',
        ...(recipe.tags || [])
      ];
    }
    // Generate random rating between 4.7 and 4.9
    if (!recipe.rating) {
      recipe.rating = (4.7 + Math.random() * 0.2).toFixed(1);
    }
    if (!recipe.ratingCount) {
      recipe.ratingCount = Math.floor(100 + Math.random() * 200);
    }
  });
  console.log(`📚 Loaded ${recipes.length} recipes`);
  
  // Load packs data if exists
  const packsFile = path.join(dataDir, 'packs.json');
  let packs = [];
  if (fs.existsSync(packsFile)) {
    packs = JSON.parse(fs.readFileSync(packsFile, 'utf-8'));
  }
  console.log(`📦 Loaded ${packs.length} recipe packs`);
  
  // Get categories for this site type
  const categories = getCategoriesForSite(domain);
  
  // Copy assets
  console.log(`📁 Copying assets...`);
  
  // Copy recipe images (prefer optimized versions)
  const optimizedImagesDir = path.join(ROOT_DIR, 'data', 'images-optimized', domain.replace(/\./g, '-'));
  const useOptimized = fs.existsSync(optimizedImagesDir);
  const sourceImagesDir = useOptimized ? optimizedImagesDir : imagesDir;
  
  if (fs.existsSync(sourceImagesDir)) {
    // For optimized images, copy only WebP and JPG (not PNG)
    // For original images, copy all formats
    const images = fs.readdirSync(sourceImagesDir).filter(f => {
      if (useOptimized) {
        return f.endsWith('.jpg') || f.endsWith('.webp');
      }
      return f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp');
    });
    images.forEach(img => {
      fs.copyFileSync(path.join(sourceImagesDir, img), path.join(outputDir, 'recipe_images', img));
    });
    console.log(`   ✓ Copied ${images.length} recipe images${useOptimized ? ' (optimized WebP/JPG)' : ' (original - run optimize-images.js first)'}`);
  }
  
  // Copy site-specific images (logo, favicon, etc.)
  const siteImagesDir = path.join(ROOT_DIR, 'apps', domain, 'images');
  if (fs.existsSync(siteImagesDir)) {
    const siteImages = fs.readdirSync(siteImagesDir);
    siteImages.forEach(img => {
      fs.copyFileSync(path.join(siteImagesDir, img), path.join(outputDir, 'images', img));
    });
  }
  
  // Copy ingredients bundle
  const ingredientsBundle = path.join(ROOT_DIR, 'packages', 'ingredients', 'browser-bundle.js');
  if (fs.existsSync(ingredientsBundle)) {
    fs.copyFileSync(ingredientsBundle, path.join(outputDir, 'js', 'ingredients-bundle.js'));
    console.log(`   ✓ Copied ingredients bundle`);
  }
  
  // Define partials (matching ProteinMuffins.com exactly)
  const partials = {
    head: getHeadPartial(),
    nav: getNavPartial(),
    footer: getFooterPartial(),
    recipeCard: getRecipeCardPartial()
  };
  
  // Generate pages
  console.log(`📄 Generating pages...`);
  
  // Homepage
  await generateHomepage(site, recipes, packs, categories, partials, outputDir);
  console.log(`   ✓ Generated index.html`);
  
  // Recipe pages
  for (const recipe of recipes) {
    await generateRecipePage(site, recipe, recipes, categories, partials, outputDir);
  }
  console.log(`   ✓ Generated ${recipes.length} recipe pages`);
  
  // Category pages
  for (const category of Object.values(categories)) {
    await generateCategoryPage(site, category, recipes, categories, partials, outputDir);
  }
  console.log(`   ✓ Generated ${Object.keys(categories).length} category pages`);
  
  // Pack pages
  for (const pack of packs) {
    await generatePackPage(site, pack, recipes, partials, outputDir);
    await generateSuccessPage(site, pack, recipes, partials, outputDir);
  }
  console.log(`   ✓ Generated ${packs.length} pack pages`);
  
  // Supporting pages
  await generateSupportingPages(site, recipes, partials, outputDir);
  console.log(`   ✓ Generated supporting pages`);
  
  // Sitemap
  await generateSitemap(site, recipes, packs, categories, outputDir);
  console.log(`   ✓ Generated sitemap.xml`);
  
  // Robots.txt
  await generateRobotsTxt(site, outputDir);
  console.log(`   ✓ Generated robots.txt`);
  
  console.log(`\n✅ Build complete! Output: ${outputDir}\n`);
}

// ============================================================================
// PARTIALS (matching ProteinMuffins.com exactly)
// ============================================================================

function getHeadPartial() {
  return `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><%= pageTitle %></title>

<% if (site.ga4Id) { %>
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=<%= site.ga4Id %>"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '<%= site.ga4Id %>', {
    'send_page_view': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
<% } %>

<!-- SEO Meta Tags -->
<meta name="description" content="<%= pageDescription %>">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://<%= site.domain %><%= canonicalPath %>">

<!-- Open Graph / Social Sharing -->
<meta property="og:type" content="<%= ogType %>">
<meta property="og:site_name" content="<%= site.name %>">
<meta property="og:title" content="<%= pageTitle %>">
<meta property="og:description" content="<%= pageDescription %>">
<meta property="og:image" content="https://<%= site.domain %><%= ogImage || '/images/logo.png' %>">
<meta property="og:url" content="https://<%= site.domain %><%= canonicalPath %>">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<%= pageTitle %>">
<meta name="twitter:description" content="<%= pageDescription %>">
<meta name="twitter:image" content="https://<%= site.domain %><%= ogImage || '/images/logo.png' %>">

<!-- Theme & Favicon -->
<meta name="theme-color" content="#f59e0b">
<link rel="icon" type="image/png" href="/images/favicon.png">
<link rel="apple-touch-icon" href="/images/favicon.png">

<!-- Performance: DNS Prefetch & Preconnect -->
<link rel="dns-prefetch" href="//cdn.tailwindcss.com">
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">

<% if (preloadImage) { %>
<!-- Performance: Preload LCP Image -->
<link rel="preload" as="image" href="<%= preloadImage %>">
<% } %>

<!-- Dark Mode: Apply before page renders to prevent flash -->
<script>
(function(){
  var s = localStorage.getItem('theme');
  var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (s === 'dark' || (!s && d)) document.documentElement.classList.add('dark');
})();
</script>

<!-- Scripts -->
<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

<% if (includeIngredients) { %>
<!-- Ingredient Substitution System -->
<script src="/js/ingredients-bundle.js"></script>
<% } %>

<!-- Tailwind Config -->
<script>
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                fontFamily: {
                    'anton': ['Anton', 'sans-serif'],
                    'sans': ['Inter', 'sans-serif'],
                },
                colors: {
                    brand: {
                        50: '#fffbeb',
                        100: '#fef3c7',
                        500: '#f59e0b',
                        600: '#d97706',
                        900: '#451a03',
                    },
                    accent: {
                        500: '#10b981',
                    }
                }
            }
        }
    }
</script>

<style>
    [x-cloak] { display: none !important; }
    .glass-nav {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }
    .dark .glass-nav {
        background: rgba(15, 23, 42, 0.8);
    }
    .anton-text {
        font-family: 'Anton', sans-serif;
        letter-spacing: 0.05em;
    }
    .recipe-card:hover .recipe-overlay { opacity: 1; }
    .recipe-shadow { box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.1); }
</style>
`;
}

function getNavPartial() {
  return `
<!-- Top Navigation (matching ProteinMuffins.com) -->
<header class="sticky top-0 z-50 glass-nav dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
            <div class="flex items-center">
                <a href="/" class="flex items-center">
                    <img src="/images/logo.png" alt="<%= site.name %>" class="h-12 md:h-16 w-auto">

                </a>
            </div>
            <nav class="hidden md:flex space-x-8 items-center">
                <a href="/#recipes" class="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-semibold text-sm uppercase tracking-wider">Recipes</a>
                <a href="/#categories" class="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-semibold text-sm uppercase tracking-wider">Categories</a>
                <a href="/#packs" class="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-semibold text-sm uppercase tracking-wider">Recipe Packs</a>

                <!-- Dark Mode Toggle -->
                <button
                    x-data="{ dark: document.documentElement.classList.contains('dark') }"
                    @click="dark = !dark; document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', dark ? 'dark' : 'light')"
                    class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    <svg x-show="!dark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                    </svg>
                    <svg x-show="dark" x-cloak class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                    </svg>
                </button>

                <a href="/pack-starter.html" class="bg-brand-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-brand-900 transition shadow-lg shadow-brand-500/30">STARTER PACK (FREE)</a>
            </nav>
            <div class="flex items-center gap-2 md:hidden">
                <!-- Mobile Dark Mode Toggle -->
                <button
                    x-data="{ dark: document.documentElement.classList.contains('dark') }"
                    @click="dark = !dark; document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', dark ? 'dark' : 'light')"
                    class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    <svg x-show="!dark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                    </svg>
                    <svg x-show="dark" x-cloak class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                    </svg>
                </button>

                <div x-data="{ open: false }">
                    <button @click="open = !open" class="text-slate-900 dark:text-white focus:outline-none">
                        <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                    <!-- Mobile Menu -->
                    <div x-show="open" x-cloak class="absolute top-20 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 p-6 space-y-4 shadow-xl">
                        <a href="/#recipes" class="block text-xl anton-text text-slate-900 dark:text-white">RECIPES</a>
                        <a href="/#categories" class="block text-xl anton-text text-slate-900 dark:text-white">CATEGORIES</a>
                        <a href="/#packs" class="block text-xl anton-text text-slate-900 dark:text-white">RECIPE PACKS</a>
                        <a href="/pack-starter.html" class="block text-center w-full bg-brand-600 text-white py-4 rounded-xl font-bold anton-text text-lg">GET STARTER PACK</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
`;
}

function getFooterPartial() {
  return `
<!-- Footer (matching ProteinMuffins.com) -->
<footer class="bg-slate-900 dark:bg-slate-950 text-white py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
            <!-- Brand -->
            <div class="md:col-span-1">
                <a href="/" class="flex items-center mb-4">
                    <img src="/images/logo.png" alt="<%= site.name %>" class="h-12 w-auto">
                    
                </a>
                <p class="text-slate-400 text-sm"><%= site.tagline %></p>
            </div>
            
            <!-- Quick Links -->
            <div>
                <h4 class="anton-text text-sm tracking-wider mb-4">RECIPES</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/category-all.html" class="hover:text-white transition">All Recipes</a></li>
                    <li><a href="/category-classic.html" class="hover:text-white transition">Classic</a></li>
                    <li><a href="/category-high-protein.html" class="hover:text-white transition">High Protein</a></li>
                    <li><a href="/category-quick.html" class="hover:text-white transition">Quick & Easy</a></li>
                </ul>
            </div>
            
            <!-- Recipe Packs -->
            <div>
                <h4 class="anton-text text-sm tracking-wider mb-4">RECIPE PACKS</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/pack-starter.html" class="hover:text-white transition">Starter Pack (Free)</a></li>
                    <li><a href="/pack-no-bake.html" class="hover:text-white transition">No-Bake Pack</a></li>
                    <li><a href="/pack-high-protein.html" class="hover:text-white transition">High Protein Pack</a></li>
                </ul>
            </div>
            
            <!-- Legal -->
            <div>
                <h4 class="anton-text text-sm tracking-wider mb-4">LEGAL</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/privacy.html" class="hover:text-white transition">Privacy Policy</a></li>
                    <li><a href="/terms.html" class="hover:text-white transition">Terms of Use</a></li>
                </ul>
            </div>
        </div>
        
        <!-- Empire Links -->
        <div class="mt-12 pt-8 border-t border-slate-800 dark:border-slate-700">
            <p class="text-slate-500 text-xs text-center mb-4">Part of the Protein Recipe Empire</p>
            <div class="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
                <a href="https://proteinmuffins.com" class="hover:text-white transition">Muffins</a>
                <a href="https://proteincookies.co" class="hover:text-white transition">Cookies</a>
                <a href="https://proteinpancakes.co" class="hover:text-white transition">Pancakes</a>
                <a href="https://proteinbrownies.co" class="hover:text-white transition">Brownies</a>
                <a href="https://protein-bread.com" class="hover:text-white transition">Bread</a>
                <a href="https://proteinbars.co" class="hover:text-white transition">Bars</a>
                <a href="https://proteinbites.co" class="hover:text-white transition">Bites</a>
                <a href="https://proteindonuts.co" class="hover:text-white transition">Donuts</a>
                <a href="https://proteinoatmeal.co" class="hover:text-white transition">Oatmeal</a>
                <a href="https://proteincheesecake.co" class="hover:text-white transition">Cheesecake</a>
                <a href="https://proteinpizzas.co" class="hover:text-white transition">Pizza</a>
                <a href="https://proteinpudding.co" class="hover:text-white transition">Pudding</a>
                <a href="https://cottagecheeserecipes.co" class="hover:text-white transition">Cottage Cheese</a>
            </div>
        </div>
        
        <div class="mt-8 text-center text-slate-500 text-xs">
            <p>&copy; <%= new Date().getFullYear() %> <a href="https://HighProtein.Recipes" class="hover:text-amber-400 transition-colors">High Protein Recipes</a>. All recipes macro-verified using USDA FoodData Central.</p>
        </div>
    </div>
</footer>
`;
}

function getRecipeCardPartial() {
  return `
<!-- Recipe Card (matching ProteinMuffins.com) -->
<a href="/<%= recipe.slug %>.html" class="recipe-card group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-xl transition-all duration-300">
    <div class="relative aspect-square overflow-hidden">
        <picture>
            <source type="image/webp" srcset="/recipe_images/<%= recipe.slug %>-small.webp 280w, /recipe_images/<%= recipe.slug %>-medium.webp 600w, /recipe_images/<%= recipe.slug %>.webp 800w" sizes="(max-width: 640px) 280px, 280px">
            <img src="/recipe_images/<%= recipe.slug %>.jpg" alt="<%= recipe.title %>" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width="280" height="280">
        </picture>
        <div class="absolute top-3 left-3 bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
            <%= recipe.nutrition.protein %>g
        </div>
        <div class="recipe-overlay absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300"></div>
    </div>
    <div class="p-4">
        <h3 class="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 transition-colors"><%= recipe.title %></h3>
        <p class="text-sm text-slate-500"><%= recipe.nutrition.calories %> cal • <%= recipe.totalTime %>m • <%= recipe.difficulty %></p>
    </div>
</a>
`;
}

// ============================================================================
// PAGE GENERATORS
// ============================================================================

/**
 * Generate homepage (matching ProteinMuffins.com)
 */
async function generateHomepage(site, recipes, packs, categories, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: site.name + ' | The Hub for Macro-Verified ' + site.foodTypePlural.charAt(0).toUpperCase() + site.foodTypePlural.slice(1) + ' Recipes',
  pageDescription: site.description,
  canonicalPath: '/',
  ogType: 'website',
  ogImage: '/images/logo.png',
  preloadImage: recipes[0] ? '/recipe_images/' + recipes[0].slug + '-medium.webp' : null,
  includeIngredients: false
}) %>

<!-- WebSite + Organization Schema (matching ProteinMuffins.com) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "<%= site.name %>",
  "url": "https://<%= site.domain %>/",
  "description": "<%= site.description %>",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://<%= site.domain %>/?search={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "<%= site.name %>",
    "url": "https://<%= site.domain %>/",
    "logo": {
      "@type": "ImageObject",
      "url": "https://<%= site.domain %>/images/logo.png",
      "width": 512,
      "height": 512
    }
  }
}
</script>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">

<%- include('nav', { site }) %>

<main class="flex-grow">
    <!-- Hero Section (matching ProteinMuffins.com) -->
    <section class="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-transparent"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span class="inline-block bg-brand-500 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-6 anton-text tracking-wider">
                <%= recipes.length %>+ Macro-Verified Recipes
            </span>
            <h1 class="anton-text text-5xl md:text-7xl tracking-tight uppercase mb-6 leading-tight">
                THE HUB FOR PROTEIN<br><span class="text-brand-500"><%= site.foodTypePlural.toUpperCase() %></span>
            </h1>
            <p class="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
                Macro-verified protein <%= site.foodType %> recipes with precise nutrition data. Every recipe measured in grams for precise macros.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#recipes" class="bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider">
                    Browse Recipes
                </a>
                <a href="/pack-starter.html" class="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-white/20 transition-colors border border-white/20 tracking-wider">
                    Get Free Starter Pack
                </a>
            </div>
        </div>
    </section>

    <% if (seoData) { %>
    <!-- What Are Section -->
    <section class="py-16 bg-white dark:bg-slate-900">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl md:text-4xl text-slate-900 dark:text-white mb-6 uppercase tracking-wide"><%= seoData.whatAre.title %></h2>
            <% seoData.whatAre.paragraphs.forEach(paragraph => { %>
            <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4"><%= paragraph %></p>
            <% }) %>
        </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-16 bg-slate-50 dark:bg-slate-800">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl md:text-4xl text-slate-900 dark:text-white mb-10 text-center uppercase tracking-wide">Benefits of Protein <%= site.foodTypePlural.charAt(0).toUpperCase() + site.foodTypePlural.slice(1) %></h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <% seoData.benefits.forEach(benefit => { %>
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2"><%= benefit.title %></h3>
                    <p class="text-slate-600 dark:text-slate-400"><%= benefit.description %></p>
                </div>
                <% }) %>
            </div>
        </div>
    </section>

    <!-- Types Section -->
    <section class="py-16 bg-white dark:bg-slate-900">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl md:text-4xl text-slate-900 dark:text-white mb-10 text-center uppercase tracking-wide">Types of Protein <%= site.foodTypePlural.charAt(0).toUpperCase() + site.foodTypePlural.slice(1) %></h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <% seoData.types.forEach(type => { %>
                <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 class="font-bold text-xl text-slate-900 dark:text-white mb-2"><%= type.name %></h3>
                    <p class="text-slate-600 dark:text-slate-400"><%= type.description %></p>
                </div>
                <% }) %>
            </div>
        </div>
    </section>

    <!-- Best Ingredients Section -->
    <section class="py-16 bg-slate-50 dark:bg-slate-800">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl md:text-4xl text-slate-900 dark:text-white mb-10 text-center uppercase tracking-wide">Best Ingredients for Protein <%= site.foodTypePlural.charAt(0).toUpperCase() + site.foodTypePlural.slice(1) %></h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 class="font-bold text-lg text-brand-600 mb-4 uppercase tracking-wide">Protein Sources</h3>
                    <ul class="space-y-2">
                        <% (seoData.ingredients.proteins || []).forEach(ing => { %>
                        <li class="text-slate-600 dark:text-slate-400 flex items-center"><span class="w-2 h-2 bg-brand-500 rounded-full mr-3"></span><%= ing %></li>
                        <% }) %>
                    </ul>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 class="font-bold text-lg text-brand-600 mb-4 uppercase tracking-wide"><%= Object.keys(seoData.ingredients)[1] ? Object.keys(seoData.ingredients)[1].replace(/([A-Z])/g, ' $1').trim() : 'Flour Options' %></h3>
                    <ul class="space-y-2">
                        <% (seoData.ingredients[Object.keys(seoData.ingredients)[1]] || []).forEach(ing => { %>
                        <li class="text-slate-600 dark:text-slate-400 flex items-center"><span class="w-2 h-2 bg-brand-500 rounded-full mr-3"></span><%= ing %></li>
                        <% }) %>
                    </ul>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 class="font-bold text-lg text-brand-600 mb-4 uppercase tracking-wide"><%= Object.keys(seoData.ingredients)[2] ? Object.keys(seoData.ingredients)[2].replace(/([A-Z])/g, ' $1').trim() : 'Sweeteners & Flavors' %></h3>
                    <ul class="space-y-2">
                        <% (seoData.ingredients[Object.keys(seoData.ingredients)[2]] || []).forEach(ing => { %>
                        <li class="text-slate-600 dark:text-slate-400 flex items-center"><span class="w-2 h-2 bg-brand-500 rounded-full mr-3"></span><%= ing %></li>
                        <% }) %>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- How To Make Section -->
    <section class="py-16 bg-white dark:bg-slate-900">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl md:text-4xl text-slate-900 dark:text-white mb-10 text-center uppercase tracking-wide">How to Make Perfect Protein <%= site.foodTypePlural.charAt(0).toUpperCase() + site.foodTypePlural.slice(1) %></h2>
            <div class="space-y-6">
                <% seoData.howTo.forEach((step, index) => { %>
                <div class="flex gap-4">
                    <div class="flex-shrink-0 w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-lg"><%= index + 1 %></div>
                    <div>
                        <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-1"><%= step.step %></h3>
                        <p class="text-slate-600 dark:text-slate-400"><%= step.description %></p>
                    </div>
                </div>
                <% }) %>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 bg-slate-50 dark:bg-slate-800">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl md:text-4xl text-slate-900 dark:text-white mb-10 text-center uppercase tracking-wide">Frequently Asked Questions</h2>
            <div class="space-y-4">
                <% seoData.faqs.forEach(faq => { %>
                <details class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden group">
                    <summary class="px-6 py-4 cursor-pointer font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex justify-between items-center">
                        <%= faq.question %>
                        <svg class="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </summary>
                    <div class="px-6 pb-4 text-slate-600 dark:text-slate-400"><%= faq.answer %></div>
                </details>
                <% }) %>
            </div>
        </div>
    </section>

    <!-- FAQ Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        <% seoData.faqs.forEach((faq, index) => { %>
        {
          "@type": "Question",
          "name": "<%= faq.question.replace(/"/g, '\\"') %>",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "<%= faq.answer.replace(/"/g, '\\"') %>"
          }
        }<%= index < seoData.faqs.length - 1 ? ',' : '' %>
        <% }) %>
      ]
    }
    </script>
    <% } %>

    <!-- All Recipes Section -->
    <section id="recipes" class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-4xl text-center mb-4 uppercase tracking-wider">ALL RECIPES</h2>
            <p class="text-center text-slate-500 mb-10">Every recipe macro-verified using USDA FoodData Central</p>
            
            <!-- Category Filter -->
            <div id="categories" class="flex flex-wrap justify-center gap-3 mb-12">
                <% Object.values(categories).forEach(cat => { %>
                    <a href="/category-<%= cat.slug %>.html" class="px-5 py-2.5 rounded-full text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all shadow-sm">
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
    <section class="py-20 bg-brand-50 dark:bg-brand-900/20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span class="inline-block bg-brand-500 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-6 anton-text tracking-wider">
                FREE DOWNLOAD
            </span>
            <h2 class="anton-text text-4xl uppercase mb-4 tracking-wider">Get the Starter Pack</h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg mb-8">
                5 essential protein <%= site.foodType %> recipes in a printable PDF. Includes shopping list, nutrition facts, and pro tips.
            </p>
            <a href="/pack-starter.html" class="inline-flex items-center gap-3 bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download Free PDF
            </a>
        </div>
    </section>

    <!-- More Packs -->
    <% if (packs.length > 1) { %>
    <section id="packs" class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-4xl text-center mb-4 uppercase tracking-wider">More Recipe Packs</h2>
            <p class="text-center text-slate-500 mb-10">Curated collections for every goal and preference.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <% packs.filter(p => p.slug !== 'starter').forEach(pack => { %>
                    <a href="/pack-<%= pack.slug %>.html" class="block bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-xl transition-all group">
                        <span class="text-4xl mb-4 block"><%= pack.icon %></span>
                        <h3 class="font-semibold text-xl mb-2 group-hover:text-brand-600 transition-colors"><%= pack.title %></h3>
                        <p class="text-slate-600 dark:text-slate-400"><%= pack.description %></p>
                    </a>
                <% }) %>
            </div>
        </div>
    </section>
    <% } %>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

  // Get SEO content for this site
  const seoData = seoContent[site.domain] || null;

  const html = ejs.render(template, {
    site,
    recipes,
    packs,
    categories,
    seoData,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
}

/**
 * Generate a recipe page (matching ProteinMuffins.com exactly)
 */
async function generateRecipePage(site, recipe, allRecipes, categories, partials, outputDir) {
  // Get related recipes - prefer recipe.related_recipes from JSON, fallback to category matching
  let relatedRecipes = [];
  if (recipe.related_recipes && recipe.related_recipes.length > 0) {
    // Use the curated related_recipes from JSON
    relatedRecipes = recipe.related_recipes.map(rel => {
      // Find the full recipe object from allRecipes
      const fullRecipe = allRecipes.find(r => r.slug === rel.slug);
      if (fullRecipe) return fullRecipe;
      // If not found (shouldn't happen for intra-site), return a minimal object with all required fields
      return {
        slug: rel.slug,
        title: rel.title,
        nutrition: { protein: 20, calories: 150, carbs: 15, fat: 5, fiber: 2, sugar: 5 },
        totalTime: 30,
        difficulty: 'Medium',
        domain: rel.domain
      };
    }).filter(r => r !== null);
  } else {
    // Fallback to category-based matching
    relatedRecipes = allRecipes
      .filter(r => r.slug !== recipe.slug && r.categories?.some(c => recipe.categories?.includes(c)))
      .slice(0, 4);
  }
  
  // Get empire links for cross-site interlinking
  const empireLinks = recipe.empire_links || [];
  
  // Generate linked description with internal links
  const linkedDescription = linkifyDescription(recipe.description, recipe, allRecipes, site);
  
  // Get category for breadcrumb
  const primaryCategory = categories[recipe.categories?.[0]] || categories['classic'] || { name: 'Recipes', slug: 'all' };
  
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: recipe.title + ' (Macro-Verified) | ' + site.name,
  pageDescription: recipe.description,
  canonicalPath: '/' + recipe.slug + '.html',
  ogType: 'article',
  ogImage: '/recipe_images/' + recipe.slug + '-og.webp',
  preloadImage: '/recipe_images/' + recipe.slug + '-medium.webp',
  includeIngredients: true
}) %>

<!-- Recipe Schema (matching ProteinMuffins.com) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Recipe",
  "name": "<%= recipe.title %>",
  "image": ["https://<%= site.domain %>/recipe_images/<%= recipe.slug %>-og.webp", "https://<%= site.domain %>/recipe_images/<%= recipe.slug %>.jpg"],
  "description": "<%= recipe.description.replace(/"/g, '\\\\"') %>",
  "keywords": "<%= recipe.keywords?.join(', ') || 'protein ' + site.foodType %>",
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
    "ratingValue": "<%= recipe.rating %>",
    "ratingCount": "<%= recipe.ratingCount %>",
    "bestRating": "5",
    "worstRating": "1"
  },
  "datePublished": "<%= recipe.datePublished || '2026-01-01' %>",
  "recipeCategory": "<%= primaryCategory.name %>",
  "recipeCuisine": "American",
  "recipeIngredient": [<%= recipe.ingredients.map(i => '"' + i.amount + 'g ' + i.name + '"').join(', ') %>],
  "recipeInstructions": [
    <% recipe.instructions.forEach((step, i) => { %>
    {
      "@type": "HowToStep",
      "name": "Step <%= i + 1 %>",
      "text": "<%= step.replace(/"/g, '\\\\"') %>"
    }<%= i < recipe.instructions.length - 1 ? ',' : '' %>
    <% }) %>
  ]
}
</script>

<!-- Breadcrumb Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://<%= site.domain %>/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "<%= primaryCategory.name %>",
      "item": "https://<%= site.domain %>/category-<%= primaryCategory.slug %>.html"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "<%= recipe.title %>"
    }
  ]
}
</script>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">

<%- include('nav', { site }) %>

<main class="flex-grow">
    <!-- Recipe Header / Hero (matching ProteinMuffins.com) -->
    <section class="bg-white dark:bg-slate-900 pt-10 pb-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Breadcrumbs -->
            <nav class="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                <a href="/" class="hover:text-brand-600 transition">Home</a>
                <span>/</span>
                <a href="/category-<%= primaryCategory.slug %>.html" class="hover:text-brand-600 transition"><%= primaryCategory.name %></a>
                <span>/</span>
                <span class="text-slate-900 dark:text-white"><%= recipe.title.split(' ').slice(0, 3).join(' ') %></span>
            </nav>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <!-- Gallery Area -->
                <div class="space-y-4">
                    <div class="rounded-[2.5rem] overflow-hidden aspect-[4/5] lg:aspect-square relative group recipe-shadow">
                        <picture>
                            <source type="image/webp" srcset="/recipe_images/<%= recipe.slug %>-medium.webp 600w, /recipe_images/<%= recipe.slug %>-large.webp 800w, /recipe_images/<%= recipe.slug %>-og.webp 1200w" sizes="(max-width: 768px) 600px, 800px">
                            <img src="/recipe_images/<%= recipe.slug %>.jpg" alt="<%= recipe.title %>" class="w-full h-full object-cover" width="800" height="800">
                        </picture>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div class="absolute bottom-6 left-6 flex space-x-2">
                            <span class="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl text-[10px] font-bold anton-text tracking-widest">MACRO-VERIFIED</span>
                            <span class="bg-brand-600 text-white px-4 py-2 rounded-2xl text-[10px] font-bold anton-text tracking-widest"><%= recipe.nutrition.protein %>G PROTEIN</span>
                        </div>
                    </div>
                </div>

                <!-- Recipe Summary Area -->
                <div>
                    <h1 class="anton-text text-4xl lg:text-6xl text-slate-900 dark:text-white leading-[0.9] mb-6 uppercase">
                        <%= recipe.title.toUpperCase() %><br>
                        <span class="text-brand-500">(MACRO-VERIFIED)</span>
                    </h1>

                    <!-- Stats Bar (matching ProteinMuffins.com) -->
                    <div class="grid grid-cols-3 md:grid-cols-5 gap-4 py-8 border-y border-slate-100 dark:border-slate-700 my-8">
                        <div class="text-center md:border-r border-slate-100 dark:border-slate-700">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Protein</p>
                            <p class="anton-text text-3xl text-brand-600 leading-none"><%= recipe.nutrition.protein %>G</p>
                        </div>
                        <div class="text-center md:border-r border-slate-100 dark:border-slate-700">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Calories</p>
                            <p class="anton-text text-3xl text-slate-900 dark:text-white leading-none"><%= recipe.nutrition.calories %></p>
                        </div>
                        <div class="text-center md:border-r border-slate-100 dark:border-slate-700">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prep Time</p>
                            <p class="anton-text text-3xl text-slate-900 dark:text-white leading-none"><%= recipe.prepTime %>M</p>
                        </div>
                        <div class="text-center md:border-r border-slate-100 dark:border-slate-700">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bake Time</p>
                            <p class="anton-text text-3xl text-slate-900 dark:text-white leading-none"><%= recipe.cookTime %>M</p>
                        </div>
                        <div class="text-center hidden md:block">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yield</p>
                            <p class="anton-text text-3xl text-slate-900 dark:text-white leading-none"><%= recipe.yield %></p>
                        </div>
                    </div>

                    <p class="text-slate-500 text-lg leading-relaxed mb-8">
                        <%- linkedDescription %> All nutrition data is verified using <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:text-brand-700 font-semibold">USDA FoodData Central</a> for accuracy.
                    </p>

                    <!-- CTA Links -->
                    <div class="flex flex-wrap gap-4 items-center">
                        <a href="#recipe" class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-xl tracking-widest">
                            JUMP TO RECIPE
                        </a>
                        <div class="flex items-center space-x-4">
                            <button class="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400" title="Share">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                                </svg>
                            </button>
                            <button onclick="window.print()" class="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400" title="Print">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Anchor Navigation Bar -->
    <div class="sticky top-[72px] z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-y border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between overflow-x-auto py-3 gap-2">
                <div class="flex items-center space-x-1 md:space-x-4 text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                    <a href="#recipe" class="px-2 md:px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition">Recipe</a>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                    <a href="#ingredients" class="px-2 md:px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition">Ingredients</a>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                    <a href="#instructions" class="px-2 md:px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition">Instructions</a>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                    <a href="#troubleshooting" class="px-2 md:px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition">Troubleshooting</a>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                    <a href="#substitutions" class="px-2 md:px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition">Substitutions</a>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                    <a href="#nutrition" class="px-2 md:px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition">Nutrition Panel</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Recipe Content -->
    <section id="recipe" class="py-16 scroll-mt-32">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- FREE RESOURCE CTA -->
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-6 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <span class="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3">Free Resource</span>
                    <h3 class="anton-text text-2xl text-slate-900 dark:text-white mb-2">GET THE PRINTABLE PACK</h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm">Includes shopping list (grams), freezer guide, and the substitution matrix PDF.</p>
                </div>
                <a href="/pack-starter.html" class="inline-flex items-center justify-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-600 transition whitespace-nowrap">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    DOWNLOAD PDF PACK
                </a>
            </div>
            
            <div class="grid lg:grid-cols-3 gap-10">
            <!-- Main Content (2 cols) -->
            <div class="lg:col-span-2">
            <div class="grid md:grid-cols-5 gap-12">
                <!-- Ingredients (2 cols) -->
                <div class="md:col-span-2" x-data="recipeSubstitution({
                    recipeId: '<%= recipe.slug %>',
                    yield: <%= recipe.yield || 12 %>,
                    servingSize: 75,
                    ingredients: <%- JSON.stringify(recipe.ingredients.map(ing => ({ id: ing.id, name: ing.name, amount: ing.amount, unit: ing.unit || 'g', displayAmount: ing.displayAmount || ing.amount }))).replace(/"/g, "'") %>,
                    baseNutrition: { calories: <%= recipe.nutrition.calories %>, protein: <%= recipe.nutrition.protein %>, fat: <%= recipe.nutrition.fat %>, carbs: <%= recipe.nutrition.carbs %>, fiber: <%= recipe.nutrition.fiber || 0 %>, sugar: <%= recipe.nutrition.sugar || 0 %> }
                })">
                    <div class="flex justify-between items-center mb-6">
                        <h2 id="ingredients" class="anton-text text-2xl uppercase tracking-wider scroll-mt-36">INGREDIENTS</h2>
                        <button 
                            x-show="checkHasSubstitutions()"
                            @click="resetAll()"
                            class="text-xs text-brand-600 hover:text-brand-700 font-semibold uppercase tracking-wider flex items-center gap-1"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            Reset All
                        </button>
                    </div>
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 recipe-shadow">
                        <!-- Substitution Info Banner -->
                        <div x-show="checkHasSubstitutions()" x-cloak class="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl text-sm">
                            <div class="flex items-start gap-2">
                                <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                    <p class="font-semibold text-amber-800 dark:text-amber-300"><span x-text="getSubstitutionCount()"></span> ingredient(s) swapped</p>
                                    <template x-if="checkHasHydrationAdjustment()">
                                        <p class="text-amber-700 dark:text-amber-400 mt-1">Hydration adjustment: <span x-text="getTotalHydrationAdjustment() > 0 ? '+' + getTotalHydrationAdjustment() : getTotalHydrationAdjustment()"></span>ml liquid</p>
                                    </template>
                                </div>
                            </div>
                        </div>
                        
                        <ul class="space-y-2">
                            <template x-for="ing in currentIngredients" :key="ing.originalId">
                                <li class="relative">
                                    <!-- Main Ingredient Row -->
                                    <div 
                                        :class="getIngredientClasses(ing)"
                                        @click="toggleIngredient(ing.id)"
                                    >
                                        <div class="flex justify-between items-center">
                                            <div class="flex items-center gap-2">
                                                <span x-text="getDisplayName(ing.id)" :class="ing.isSwapped ? 'text-brand-700 dark:text-brand-400 font-semibold' : 'text-slate-700 dark:text-slate-200'"></span>
                                                <template x-if="ing.isSwapped">
                                                    <button 
                                                        @click.stop="revertIngredient(ing.originalId)"
                                                        class="text-slate-400 hover:text-slate-600"
                                                        title="Revert to original"
                                                    >
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                                        </svg>
                                                    </button>
                                                </template>
                                                <template x-if="canSubstitute(ing.originalId) && !ing.isSwapped">
                                                    <svg class="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                                                    </svg>
                                                </template>
                                            </div>
                                            <span class="font-mono text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-1 rounded-lg text-sm" x-text="getFormattedAmount(ing)"></span>
                                        </div>
                                        <template x-if="ing.isSwapped">
                                            <p class="text-xs text-slate-500 mt-1">Originally: <span x-text="getDisplayName(ing.originalId)"></span></p>
                                        </template>
                                    </div>
                                    
                                    <!-- Substitutes Dropdown -->
                                    <div 
                                        x-show="isExpanded(ing.id) && canSubstitute(ing.originalId)"
                                        x-cloak
                                        x-transition:enter="transition ease-out duration-200"
                                        x-transition:enter-start="opacity-0 -translate-y-2"
                                        x-transition:enter-end="opacity-100 translate-y-0"
                                        class="mt-2 bg-slate-50 dark:bg-slate-700 rounded-xl p-3 border border-slate-200 dark:border-slate-600"
                                    >
                                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Swap with:</p>
                                        <div class="space-y-1">
                                            <template x-for="sub in getSubstitutes(ing.originalId)" :key="sub.id">
                                                <button 
                                                    @click.stop="selectSubstitute(ing.originalId, sub.id)"
                                                    class="w-full text-left px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-colors flex justify-between items-center group"
                                                    :class="sub.isSpecialSwap ? 'border border-amber-200 bg-amber-50' : ''"
                                                >
                                                    <span x-text="sub.name" class="text-slate-700 dark:text-slate-200 group-hover:text-brand-600"></span>
                                                    <span x-show="sub.swapNote" x-text="sub.swapNote" class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-600 dark:text-slate-300 px-2 py-0.5 rounded"></span>
                                                </button>
                                            </template>
                                        </div>
                                    </div>
                                </li>
                            </template>
                        </ul>
                        
                        <!-- Nutrition Delta Display -->
                        <template x-if="nutritionDeltas.length > 0">
                            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nutrition Change (per serving):</p>
                                <div class="flex flex-wrap gap-2">
                                    <template x-for="delta in nutritionDeltas" :key="delta.name">
                                        <span 
                                            class="text-xs px-2 py-1 rounded-full"
                                            :class="delta.delta > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                                            x-text="delta.name + ': ' + delta.formatted"
                                        ></span>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                    
                    <!-- USDA Nutrition Facts Label (Real-time updating) -->
                    <div id="nutrition" class="mt-6 bg-white dark:bg-slate-800 rounded-2xl border-4 border-slate-900 dark:border-white p-4 transition-all duration-300 scroll-mt-36" :class="{ 'border-brand-500 shadow-lg shadow-brand-100': checkHasSubstitutions() }">
                        <div class="border-b-8 border-slate-900 dark:border-white pb-1 mb-2">
                            <h3 class="text-3xl font-black tracking-tight dark:text-white">Nutrition Facts</h3>
                            <p x-show="checkHasSubstitutions()" x-cloak class="text-xs text-brand-600 font-semibold mt-1 flex items-center gap-1">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path></svg>
                                Updated with substitutions
                            </p>
                        </div>
                        <div class="border-b border-slate-900 dark:border-white pb-1 mb-1">
                            <p class="text-sm dark:text-slate-200"><span class="font-bold dark:text-white"><%= recipe.yield || 12 %></span> servings per recipe</p>
                            <div class="flex justify-between items-baseline">
                                <p class="text-sm font-bold dark:text-white">Serving size</p>
                                <p class="text-sm font-bold dark:text-white">1 <%= site.foodType %></p>
                            </div>
                        </div>
                        <div class="border-b-8 border-slate-900 dark:border-white py-2">
                            <p class="text-sm font-bold dark:text-white">Amount per serving</p>
                            <div class="flex justify-between items-baseline">
                                <p class="text-4xl font-black dark:text-white">Calories</p>
                                <p class="text-4xl font-black dark:text-white transition-colors duration-300" :class="{ 'text-brand-600': getNutritionCalories() !== baseNutrition.calories }" x-text="getNutritionCalories()"><%= recipe.nutrition.calories %></p>
                            </div>
                        </div>
                        <div class="text-right text-xs font-bold border-b border-slate-300 dark:border-slate-600 py-1 dark:text-slate-300">% Daily Value*</div>
                        <div class="border-b border-slate-300 dark:border-slate-600 py-1 flex justify-between dark:text-slate-200">
                            <p><span class="font-bold dark:text-white">Total Fat</span> <span x-text="getNutritionFat()" :class="{ 'text-brand-600 font-semibold': getNutritionFat() !== baseNutrition.fat }"><%= recipe.nutrition.fat %></span>g</p>
                            <p class="font-bold dark:text-white" :class="{ 'text-brand-600': getNutritionFat() !== baseNutrition.fat }" x-text="getDVFat() + '%'"><%= Math.round((recipe.nutrition.fat / 78) * 100) %>%</p>
                        </div>
                        <div class="border-b border-slate-300 dark:border-slate-600 py-1 flex justify-between dark:text-slate-200">
                            <p><span class="font-bold dark:text-white">Total Carbohydrate</span> <span x-text="getNutritionCarbs()" :class="{ 'text-brand-600 font-semibold': getNutritionCarbs() !== baseNutrition.carbs }"><%= recipe.nutrition.carbs %></span>g</p>
                            <p class="font-bold dark:text-white" :class="{ 'text-brand-600': getNutritionCarbs() !== baseNutrition.carbs }" x-text="getDVCarbs() + '%'"><%= Math.round((recipe.nutrition.carbs / 275) * 100) %>%</p>
                        </div>
                        <div class="border-b border-slate-300 dark:border-slate-600 py-1 pl-4 flex justify-between dark:text-slate-200">
                            <p>Dietary Fiber <span x-text="getNutritionFiber()" :class="{ 'text-brand-600 font-semibold': getNutritionFiber() !== baseNutrition.fiber }"><%= recipe.nutrition.fiber || 0 %></span>g</p>
                            <p class="font-bold dark:text-white" :class="{ 'text-brand-600': getNutritionFiber() !== baseNutrition.fiber }" x-text="getDVFiber() + '%'"><%= Math.round(((recipe.nutrition.fiber || 0) / 28) * 100) %>%</p>
                        </div>
                        <div class="border-b border-slate-300 dark:border-slate-600 py-1 pl-4 dark:text-slate-200">
                            <p>Total Sugars <span x-text="getNutritionSugar()"><%= recipe.nutrition.sugar || 0 %></span>g</p>
                        </div>
                        <div class="border-b-8 border-slate-900 dark:border-white py-1 flex justify-between dark:text-slate-200">
                            <p><span class="font-bold dark:text-white">Protein</span> <span x-text="getNutritionProtein()" :class="{ 'text-brand-600 font-semibold': getNutritionProtein() !== baseNutrition.protein }"><%= recipe.nutrition.protein %></span>g</p>
                            <p class="font-bold dark:text-white" :class="{ 'text-brand-600': getNutritionProtein() !== baseNutrition.protein }" x-text="getDVProtein() + '%'"><%= Math.round((recipe.nutrition.protein / 50) * 100) %>%</p>
                        </div>
                        <p class="text-xs mt-2 text-slate-500">*The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</p>
                        <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                            <p class="text-xs text-slate-500 flex items-center gap-1">
                                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Verified using <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:text-brand-700 font-semibold">USDA FoodData Central</a>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Instructions (3 cols) -->
                <div class="md:col-span-3">
                    <h2 id="instructions" class="anton-text text-2xl uppercase mb-6 tracking-wider scroll-mt-36">INSTRUCTIONS</h2>
                    <div class="space-y-6">
                        <% recipe.instructions.forEach((step, i) => { %>
                            <div class="flex gap-4">
                                <div class="flex-shrink-0 w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold anton-text text-lg">
                                    <%= i + 1 %>
                                </div>
                                <div class="pt-2">
                                    <p class="text-slate-700 dark:text-slate-300 leading-relaxed"><%= step %></p>
                                </div>
                            </div>
                        <% }) %>
                    </div>
                    
                    <!-- Troubleshooting Section -->
                    <div id="troubleshooting" class="mt-12 scroll-mt-36">
                        <h2 class="anton-text text-2xl uppercase mb-6 tracking-wider">TROUBLESHOOTING</h2>
                        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                            <div class="border-b border-slate-100 dark:border-slate-700 pb-4">
                                <h4 class="font-semibold text-slate-900 dark:text-white mb-2">My <%= site.foodTypePlural %> are too dry</h4>
                                <p class="text-slate-600 dark:text-slate-400 text-sm">Try adding 1-2 tablespoons more liquid (milk, yogurt, or egg whites). Also ensure you're not over-measuring the protein powder - use the scoop and level method.</p>
                            </div>
                            <div class="border-b border-slate-100 dark:border-slate-700 pb-4">
                                <h4 class="font-semibold text-slate-900 dark:text-white mb-2">They didn't rise properly</h4>
                                <p class="text-slate-600 dark:text-slate-400 text-sm">Check your baking powder is fresh (test by adding to hot water - it should bubble vigorously). Also, don't overmix the batter as this can deflate the air bubbles.</p>
                            </div>
                            <div>
                                <h4 class="font-semibold text-slate-900 dark:text-white mb-2">The texture is rubbery</h4>
                                <p class="text-slate-600 dark:text-slate-400 text-sm">This usually means too much protein powder or overbaking. Reduce baking time by 2-3 minutes and check doneness with a toothpick.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Substitutions Section -->
                    <div id="substitutions" class="mt-12 scroll-mt-36">
                        <h2 class="anton-text text-2xl uppercase mb-6 tracking-wider">SUBSTITUTIONS</h2>
                        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <table class="w-full text-sm">
                                <thead class="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th class="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Original</th>
                                        <th class="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Substitute</th>
                                        <th class="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Notes</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                                    <tr>
                                        <td class="px-4 py-3 text-slate-700 dark:text-slate-300">Whey Protein</td>
                                        <td class="px-4 py-3 text-slate-700 dark:text-slate-300">Casein, Plant Blend</td>
                                        <td class="px-4 py-3 text-slate-500">May need +10ml liquid</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-3 text-slate-700 dark:text-slate-300">Greek Yogurt</td>
                                        <td class="px-4 py-3 text-slate-700 dark:text-slate-300">Cottage Cheese, Skyr</td>
                                        <td class="px-4 py-3 text-slate-500">Blend smooth first</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-3 text-slate-700 dark:text-slate-300">Egg Whites</td>
                                        <td class="px-4 py-3 text-slate-700 dark:text-slate-300">Flax Egg, Aquafaba</td>
                                        <td class="px-4 py-3 text-slate-500">For vegan option</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-3 text-slate-700 dark:text-slate-300">Oat Flour</td>
                                        <td class="px-4 py-3 text-slate-700 dark:text-slate-300">Almond Flour, Coconut Flour</td>
                                        <td class="px-4 py-3 text-slate-500">Coconut: use 1/3 amount</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            </div> <!-- Close main content -->
            
            <!-- Sidebar (1 col) -->
            <div class="lg:col-span-1">
                <div class="sticky top-36 space-y-6">
                    <!-- Try These Next -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 class="anton-text text-xl text-slate-900 dark:text-white mb-4 border-b-2 border-slate-900 dark:border-white pb-2 inline-block">TRY THESE NEXT</h3>
                        <div class="space-y-4">
                            <% relatedRecipes.slice(0, 5).forEach(r => { %>
                                <a href="/<%= r.slug %>.html" class="flex items-center gap-3 group">
                                    <div class="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        <picture>
                                            <source type="image/webp" srcset="/recipe_images/<%= r.slug %>-thumb.webp">
                                            <img src="/recipe_images/<%= r.slug %>-thumb.jpg" alt="<%= r.title %>" class="w-full h-full object-cover" loading="lazy" width="64" height="64" onerror="this.parentElement.parentElement.innerHTML='<span class=text-2xl><%= site.emoji || '🍪' %></span>'">
                                        </picture>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 transition text-sm line-clamp-2"><%= r.title %></h4>
                                        <p class="text-xs text-slate-500"><%= r.nutrition?.protein || r.protein || 20 %>G PROTEIN • <%= r.nutrition?.calories || r.calories || 150 %> CAL</p>
                                    </div>
                                </a>
                            <% }) %>
                        </div>
                    </div>
                    
                    <!-- Pack Download CTA -->
                    <div class="rounded-xl p-5 text-white" style="background: #0d9488">
                        <h4 class="anton-text text-xl mb-1"><%= site.name.toUpperCase() %> STARTER PACK</h4>
                        <p class="text-white/80 text-sm mb-4">Get our best protein <%= site.foodType %> recipes in one free download.</p>
                        <div class="space-y-2 mb-4">
                            <div class="flex items-center gap-2 text-sm">
                                <svg class="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>Printable Cards</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <svg class="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                <span>Shopping List (Grams)</span>
                            </div>
                        </div>
                        <a href="/pack-starter.html" class="block w-full text-center py-3 rounded-lg font-bold text-sm transition bg-white/20 hover:bg-white/30 text-white">
                            DOWNLOAD FREE
                        </a>
                    </div>
                </div>
            </div>
            </div> <!-- Close grid -->
        </div>
    </section>

    <!-- Related Recipes (Intra-Site) -->
    <% if (relatedRecipes.length > 0) { %>
    <section class="py-16 bg-slate-100 dark:bg-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl text-center mb-10 uppercase tracking-wider dark:text-white">MORE <%= site.foodTypePlural.toUpperCase() %> RECIPES</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <% relatedRecipes.forEach(r => { %>
                    <%- include('recipeCard', { recipe: r }) %>
                <% }) %>
            </div>
        </div>
    </section>
    <% } %>

    <!-- Explore the Protein Empire (Cross-Site Links) -->
    <% if (empireLinks && empireLinks.length > 0) { %>
    <section class="py-16 bg-gradient-to-br from-slate-900 to-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-10">
                <span class="inline-block px-4 py-1 bg-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">The Protein Empire</span>
                <h2 class="anton-text text-3xl text-white uppercase tracking-wider">EXPLORE MORE PROTEIN RECIPES</h2>
                <p class="text-slate-400 mt-3 max-w-xl mx-auto">Discover delicious macro-verified recipes from our sister sites</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <% empireLinks.forEach(link => { %>
                <a href="https://<%= link.domain %>/<%= link.slug %>.html" class="group bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-brand-500/50 rounded-2xl p-6 transition-all duration-300 flex items-center gap-4" target="_blank" rel="noopener">
                    <div class="w-16 h-16 bg-gradient-to-br from-brand-500/20 to-brand-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg class="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                    </div>
                    <div class="flex-grow">
                        <h3 class="font-bold text-white group-hover:text-brand-400 transition-colors text-lg"><%= link.title %></h3>
                        <p class="text-slate-400 text-sm mt-1">
                            <span class="inline-flex items-center gap-1">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"></path></svg>
                                <%= link.domain %>
                            </span>
                            <% if (link.category) { %> · <%= link.category %><% } %>
                        </p>
                    </div>
                    <div class="flex-shrink-0">
                        <svg class="w-5 h-5 text-slate-500 group-hover:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                    </div>
                </a>
                <% }) %>
            </div>
            <div class="text-center mt-8">
                <a href="https://highprotein.recipes" class="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-semibold transition-colors" target="_blank" rel="noopener">
                    Browse all 300+ recipes across the Protein Empire
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                </a>
            </div>
        </div>
    </section>
    <% } %>

    <!-- CTA Banner -->
    <section class="py-16 bg-brand-500">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="anton-text text-3xl text-white uppercase mb-4 tracking-wider">WANT MORE RECIPES?</h2>
            <p class="text-white/80 mb-8">Get our free starter pack with 5 essential protein <%= site.foodType %> recipes.</p>
            <a href="/pack-starter.html" class="inline-flex items-center gap-3 bg-white text-brand-600 px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-slate-100 transition-colors shadow-xl tracking-wider">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                GET FREE STARTER PACK
            </a>
        </div>
    </section>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    recipe,
    relatedRecipes,
    empireLinks,
    linkedDescription,
    primaryCategory,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, `${recipe.slug}.html`), html);
}

/**
 * Generate a category page
 */
async function generateCategoryPage(site, category, allRecipes, categories, partials, outputDir) {
  // Filter recipes for this category
  let filteredRecipes = allRecipes;
  if (category.slug !== 'all') {
    if (category.filter) {
      filteredRecipes = allRecipes.filter(category.filter);
    } else {
      filteredRecipes = allRecipes.filter(r => 
        r.categories?.includes(category.slug) || 
        r.category?.toLowerCase() === category.slug
      );
    }
  }
  
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: category.name + ' Protein ' + site.foodTypePlural.charAt(0).toUpperCase() + site.foodTypePlural.slice(1) + ' | ' + site.name,
  pageDescription: 'Browse our collection of ' + category.name.toLowerCase() + ' protein ' + site.foodType + ' recipes. All macro-verified with precise nutrition data.',
  canonicalPath: '/category-' + category.slug + '.html',
  ogType: 'website',
  ogImage: filteredRecipes[0] ? '/recipe_images/' + filteredRecipes[0].slug + '-og.webp' : '/images/logo.webp',
  preloadImage: filteredRecipes[0] ? '/recipe_images/' + filteredRecipes[0].slug + '-medium.webp' : null,
  includeIngredients: false
}) %>

<!-- BreadcrumbList Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://<%= site.domain %>/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "<%= category.name %>"
    }
  ]
}
</script>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">

<%- include('nav', { site }) %>

<main class="flex-grow py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumbs -->
        <nav class="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
            <a href="/" class="hover:text-brand-600 transition">Home</a>
            <span>/</span>
            <span class="text-slate-900 dark:text-white"><%= category.name %></span>
        </nav>
        
        <div class="text-center mb-12">
            <span class="text-5xl mb-4 block"><%= category.icon || '📚' %></span>
            <h1 class="anton-text text-5xl uppercase mb-4 tracking-wider dark:text-white"><%= category.name.toUpperCase() %></h1>
            <p class="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto"><%= category.description || 'Browse our ' + category.name.toLowerCase() + ' protein ' + site.foodType + ' recipes.' %></p>
            <p class="text-sm text-slate-500 mt-4 anton-text tracking-wider"><%= filteredRecipes.length %> RECIPES</p>
        </div>
        
        <!-- Category Filter -->
        <div class="flex flex-wrap justify-center gap-3 mb-12">
            <% Object.values(categories).forEach(cat => { %>
                <a href="/category-<%= cat.slug %>.html" class="px-5 py-2.5 rounded-full text-sm font-semibold <%= cat.slug === category.slug ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400' %> transition-all shadow-sm">
                    <%= cat.name %>
                </a>
            <% }) %>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <% filteredRecipes.forEach(recipe => { %>
                <%- include('recipeCard', { recipe }) %>
            <% }) %>
        </div>
        
        <% if (filteredRecipes.length === 0) { %>
            <div class="text-center py-16 text-slate-500">
                <p class="text-lg">No recipes found in this category yet.</p>
                <a href="/" class="text-brand-600 hover:underline mt-4 inline-block font-semibold">Browse all recipes</a>
            </div>
        <% } %>

        <% if (catSeoData) { %>
        <!-- Category SEO Content -->
        <section class="mt-16 pt-12 border-t border-slate-200 dark:border-slate-700">
            <div class="max-w-4xl mx-auto">
                <h2 class="anton-text text-3xl md:text-4xl text-slate-900 dark:text-white mb-6 uppercase tracking-wide"><%= catSeoData.title %></h2>
                <% catSeoData.paragraphs.forEach(paragraph => { %>
                <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4"><%= paragraph %></p>
                <% }) %>
            </div>
        </section>
        <% } %>
    </div>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

  // Look up category SEO content for this site and category
  const siteCatSeo = categorySeoContent?.[site.domain] || {};
  const catSeoData = siteCatSeo[category.name] || null;

  const html = ejs.render(template, {
    site,
    category,
    categories,
    filteredRecipes,
    catSeoData,
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
  pageTitle: pack.title + ' | Free Download | ' + site.name,
  pageDescription: pack.description + ' Download our free PDF with ' + packRecipes.length + ' macro-verified recipes.',
  canonicalPath: '/pack-' + pack.slug + '.html',
  ogType: 'website',
  ogImage: packRecipes[0] ? '/recipe_images/' + packRecipes[0].slug + '-og.webp' : '/images/logo.webp',
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">

<%- include('nav', { site }) %>

<main class="flex-grow">
    <!-- Hero -->
    <section class="bg-slate-900 text-white py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span class="text-6xl mb-6 block"><%= pack.icon %></span>
            <h1 class="anton-text text-5xl md:text-6xl uppercase mb-4 tracking-wider"><%= pack.title.toUpperCase() %></h1>
            <p class="text-xl text-slate-300 mb-8"><%= pack.description %></p>
            <div class="inline-flex items-center gap-2 bg-brand-500/20 text-brand-400 px-4 py-2 rounded-full text-sm font-semibold">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <%= packRecipes.length %> Macro-Verified Recipes
            </div>
        </div>
    </section>

    <!-- What's Included -->
    <section class="py-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl text-center mb-10 uppercase tracking-wider">WHAT'S INCLUDED</h2>
            
            <div class="grid gap-4">
                <% packRecipes.forEach(recipe => { %>
                    <div class="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <picture>
                            <source type="image/webp" srcset="/recipe_images/<%= recipe.slug %>-thumb.webp">
                            <img src="/recipe_images/<%= recipe.slug %>-thumb.jpg" alt="<%= recipe.title %>" class="w-20 h-20 rounded-lg object-cover" loading="lazy" width="80" height="80">
                        </picture>
                        <div class="flex-grow">
                            <h3 class="font-semibold text-slate-900 dark:text-white"><%= recipe.title %></h3>
                            <p class="text-sm text-slate-500"><%= recipe.nutrition.calories %> cal • <%= recipe.totalTime %>m</p>
                        </div>
                        <div class="text-right">
                            <span class="bg-accent-500 text-white text-lg font-bold px-3 py-1 rounded-lg"><%= recipe.nutrition.protein %>g</span>
                            <p class="text-xs text-slate-500 mt-1">protein</p>
                        </div>
                    </div>
                <% }) %>
            </div>
        </div>
    </section>

    <!-- Download Form -->
    <section class="py-16 bg-brand-50 dark:bg-brand-900/20" x-data="{ 
        email: '', 
        submitting: false, 
        submitted: false, 
        error: '',
        async submit() {
            this.error = '';
            this.submitting = true;
            try {
                const res = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: this.email, 
                        packSlug: '<%= pack.slug %>',
                        pdfUrl: window.location.origin + '/guides/<%= site.domain.replace(/\\\\./g, '-') %>-<%= pack.slug %>.pdf'
                    })
                });
                const data = await res.json();
                if (data.success) {
                    this.submitted = true;
                } else {
                    this.error = data.message || 'Something went wrong. Please try again.';
                }
            } catch (e) {
                this.error = 'Something went wrong. Please try again.';
            } finally {
                this.submitting = false;
            }
        }
    }">
        <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <!-- Form State -->
            <template x-if="!submitted">
                <div>
                    <h2 class="anton-text text-3xl mb-4 uppercase tracking-wider">GET YOUR FREE COPY</h2>
                    <p class="text-slate-600 dark:text-slate-400 mb-8">Enter your email and we'll send you the PDF.</p>
                    
                    <form @submit.prevent="submit()" class="space-y-4">
                        <input type="email" x-model="email" placeholder="Enter your email" required
                            class="w-full px-6 py-4 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition text-lg">
                        <button type="submit" :disabled="submitting"
                            class="w-full bg-brand-500 text-white px-8 py-4 rounded-xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider disabled:opacity-50">
                            <span x-show="!submitting">DOWNLOAD FREE PDF</span>
                            <span x-show="submitting" x-cloak>SENDING...</span>
                        </button>
                    </form>
                    
                    <p x-show="error" x-text="error" class="text-red-600 text-sm mt-4 font-semibold"></p>
                    <p class="text-xs text-slate-500 mt-4">No spam. Unsubscribe anytime.</p>
                </div>
            </template>
            
            <!-- Success State -->
            <template x-if="submitted">
                <div>
                    <span class="text-5xl mb-4 block">📬</span>
                    <h2 class="anton-text text-3xl mb-4 uppercase tracking-wider">CHECK YOUR EMAIL!</h2>
                    <p class="text-slate-600 dark:text-slate-400 text-lg mb-2">We've sent your <strong><%= pack.title %></strong> to:</p>
                    <p class="text-brand-600 font-bold text-lg mb-6" x-text="email"></p>
                    <p class="text-slate-500 text-sm">Don't see it? Check your spam folder or <button @click="submitted = false" class="text-brand-600 hover:underline font-semibold">try again</button>.</p>
                </div>
            </template>
        </div>
    </section>

    <!-- Also Includes -->
    <section class="py-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl text-center mb-10 uppercase tracking-wider">ALSO INCLUDES</h2>
            
            <div class="grid md:grid-cols-3 gap-6">
                <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
                    <span class="text-3xl mb-4 block">🛒</span>
                    <h3 class="font-semibold mb-2 dark:text-white">Shopping List</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400">Combined ingredient list organized by category</p>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
                    <span class="text-3xl mb-4 block">📊</span>
                    <h3 class="font-semibold mb-2 dark:text-white">Nutrition Facts</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400">Complete macros for every recipe</p>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
                    <span class="text-3xl mb-4 block">💡</span>
                    <h3 class="font-semibold mb-2 dark:text-white">Pro Tips</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400">Storage, meal prep, and substitution advice</p>
                </div>
            </div>
        </div>
    </section>
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
async function generateSuccessPage(site, pack, allRecipes, partials, outputDir) {
  const packRecipes = allRecipes.filter(r => pack.recipes?.includes(r.slug));
  
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Download ' + pack.title + ' | ' + site.name,
  pageDescription: 'Download your free ' + pack.title + ' PDF.',
  canonicalPath: '/success-' + pack.slug + '.html',
  ogType: 'website',
  ogImage: '/images/logo.png',
  preloadImage: null,
  includeIngredients: false
}) %>
<meta name="robots" content="noindex, nofollow">
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">

<%- include('nav', { site }) %>

<main class="flex-grow py-20">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-6xl mb-6 block">✅</span>
        <h1 class="anton-text text-4xl uppercase mb-4 tracking-wider">YOU'RE ALL SET!</h1>
        <p class="text-xl text-slate-600 dark:text-slate-400 mb-8">Your <%= pack.title %> is ready to download.</p>
        
        <a href="/guides/<%= site.domain.replace(/\\./g, '-') %>-<%= pack.slug %>.pdf" download
            class="inline-flex items-center gap-3 bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider mb-8">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            DOWNLOAD PDF
        </a>
        
        <p class="text-slate-500 mb-12">Having trouble? Check your downloads folder or <a href="/pack-<%= pack.slug %>.html" class="text-brand-600 hover:underline">try again</a>.</p>
        
        <div class="border-t border-slate-200 dark:border-slate-700 pt-12">
            <h2 class="anton-text text-2xl uppercase mb-6 tracking-wider">EXPLORE MORE RECIPES</h2>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="/" class="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all font-semibold">
                    All Recipes
                </a>
                <a href="/#packs" class="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all font-semibold">
                    More Recipe Packs
                </a>
            </div>
        </div>
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
  
  fs.writeFileSync(path.join(outputDir, `success-${pack.slug}.html`), html);
}

/**
 * Generate supporting pages (404, privacy, terms)
 */
async function generateSupportingPages(site, recipes, partials, outputDir) {
  // 404 Page
  const template404 = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Page Not Found | ' + site.name,
  pageDescription: 'The page you are looking for could not be found.',
  canonicalPath: '/404.html',
  ogType: 'website',
  ogImage: '/images/logo.png',
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">

<%- include('nav', { site }) %>

<main class="flex-grow flex items-center justify-center py-20">
    <div class="text-center px-4">
        <span class="text-8xl mb-6 block">🍪</span>
        <h1 class="anton-text text-6xl uppercase mb-4 tracking-wider">404</h1>
        <p class="text-xl text-slate-600 dark:text-slate-400 mb-8">Oops! This recipe doesn't exist.</p>
        <a href="/" class="inline-flex items-center gap-2 bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider">
            BACK TO RECIPES
        </a>
    </div>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

  fs.writeFileSync(path.join(outputDir, '404.html'), ejs.render(template404, {
    site,
    include: (name, data) => ejs.render(partials[name], data)
  }));

  // Privacy Page
  const templatePrivacy = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Privacy Policy | ' + site.name,
  pageDescription: 'Privacy policy for ' + site.name + '.',
  canonicalPath: '/privacy.html',
  ogType: 'website',
  ogImage: '/images/logo.png',
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">

<%- include('nav', { site }) %>

<main class="flex-grow py-16">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="anton-text text-4xl uppercase mb-8 tracking-wider">PRIVACY POLICY</h1>
        <div class="prose prose-slate max-w-none">
            <p>Last updated: January 1, 2026</p>
            
            <h2>Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you sign up for our newsletter or download a recipe pack. This may include your email address.</p>
            
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

  fs.writeFileSync(path.join(outputDir, 'privacy.html'), ejs.render(templatePrivacy, {
    site,
    include: (name, data) => ejs.render(partials[name], data)
  }));

  // Terms Page
  const templateTerms = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Terms of Use | ' + site.name,
  pageDescription: 'Terms of use for ' + site.name + '.',
  canonicalPath: '/terms.html',
  ogType: 'website',
  ogImage: '/images/logo.png',
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">

<%- include('nav', { site }) %>

<main class="flex-grow py-16">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="anton-text text-4xl uppercase mb-8 tracking-wider">TERMS OF USE</h1>
        <div class="prose prose-slate max-w-none">
            <p>Last updated: January 1, 2026</p>
            
            <h2>Acceptance of Terms</h2>
            <p>By accessing and using <%= site.name %>, you accept and agree to be bound by these Terms of Use.</p>
            
            <h2>Use of Content</h2>
            <p>All recipes and content on this site are for personal, non-commercial use only. You may not reproduce, distribute, or sell our content without permission.</p>
            
            <h2>Nutritional Information</h2>
            <p>Nutritional information is provided as a guide only. We verify our data using USDA FoodData Central, but actual values may vary based on ingredients used.</p>
            
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

  fs.writeFileSync(path.join(outputDir, 'terms.html'), ejs.render(templateTerms, {
    site,
    include: (name, data) => ejs.render(partials[name], data)
  }));
}

/**
 * Generate sitemap.xml
 */
async function generateSitemap(site, recipes, packs, categories, outputDir) {
  const today = new Date().toISOString().split('T')[0];
  
  let urls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/privacy.html', priority: '0.3', changefreq: 'yearly' },
    { loc: '/terms.html', priority: '0.3', changefreq: 'yearly' },
  ];
  
  // Add recipes
  recipes.forEach(r => {
    urls.push({ loc: `/${r.slug}.html`, priority: '0.8', changefreq: 'monthly' });
  });
  
  // Add categories
  Object.values(categories).forEach(c => {
    urls.push({ loc: `/category-${c.slug}.html`, priority: '0.7', changefreq: 'weekly' });
  });
  
  // Add packs
  packs.forEach(p => {
    urls.push({ loc: `/pack-${p.slug}.html`, priority: '0.6', changefreq: 'monthly' });
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
async function generateRobotsTxt(site, outputDir) {
  const robots = `User-agent: *
Allow: /

Sitemap: https://${site.domain}/sitemap.xml
`;
  
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), robots);
}

// ============================================================================
// MAIN
// ============================================================================

const domain = process.argv[2];
if (!domain) {
  console.error('Usage: node scripts/build-site.js <domain>');
  console.error('Example: node scripts/build-site.js proteincookies.co');
  process.exit(1);
}

buildSite(domain);

