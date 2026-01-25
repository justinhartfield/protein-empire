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
  
  // Also load highprotein.recipes exclusive breakfast recipes
  const hprRecipesFile = path.join(ROOT_DIR, 'apps', 'highprotein.recipes', 'data', 'recipes.json');
  if (fs.existsSync(hprRecipesFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(hprRecipesFile, 'utf-8'));
      const recipes = Array.isArray(data) ? data : (data.recipes || []);

      recipes.forEach(recipe => {
        allRecipes.push({
          ...recipe,
          protein: recipe.protein || recipe.nutrition?.protein || 0,
          calories: recipe.calories || recipe.nutrition?.calories || 0,
          carbs: recipe.carbs || recipe.nutrition?.carbs || 0,
          fat: recipe.fat || recipe.nutrition?.fat || 0,
          sourceSite: 'highprotein.recipes',
          sourceName: 'HighProtein.Recipes',
          sourceCategory: 'breakfast',
          foodType: 'breakfast',
          fullRecipeUrl: `/breakfast/recipes/${recipe.slug}/`
        });
      });

      console.log(`   Loaded ${recipes.length} exclusive breakfast recipes from highprotein.recipes`);
    } catch (error) {
      console.log(`   Warning: Could not load highprotein.recipes exclusive recipes: ${error.message}`);
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

  // 2b. All recipes page
  generateAllRecipesPage(site, allRecipes, partials, outputDir);

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
  
  // 10. Tools pages
  console.log('\n🔧 Generating tool pages...');
  console.log('   - P:E Ratio Calculator');
  generatePERatioCalculator(site, partials, outputDir);
  console.log('   - Breakfast Macro Builder');
  // Include breakfast, desserts, and snacks (excluding savory like bread/pizza)
  const breakfastBuilderRecipes = [
    ...categories.breakfast,
    ...categories.desserts,
    ...categories.snacks
  ];
  console.log(`     (${breakfastBuilderRecipes.length} recipes: breakfast + desserts + snacks)`);
  generateBreakfastBuilder(site, breakfastBuilderRecipes, partials, outputDir);
  console.log('   - Cost-per-Protein Calculator');
  generateCostCalculator(site, partials, outputDir);
  console.log('   - Tools Landing Page');
  generateToolsLandingPage(site, partials, outputDir);

  // 11. Breakfast pillar page and programmatic pages
  console.log('\n🥞 Generating breakfast pages...');
  console.log('   - Breakfast Pillar Page');
  generateBreakfastPillarPage(site, categories.breakfast, partials, outputDir);
  console.log('   - Programmatic Landing Pages');
  generateProgrammaticPages(site, categories.breakfast, partials, outputDir);

  // 12. Sitemap and robots.txt
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
<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2">
                <img src="<%= site.logo %>" alt="<%= site.name %>" class="h-10 w-10 rounded-full">
                <span class="font-anton text-xl text-slate-900 dark:text-white tracking-tight uppercase">HighProtein<span class="text-brand-500">.Recipes</span></span>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center gap-6">
                <div class="relative group">
                    <button class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors flex items-center gap-1">
                        Categories
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <a href="/breakfast/" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Breakfast</a>
                        <a href="/category-desserts.html" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Desserts</a>
                        <a href="/category-snacks.html" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Snacks</a>
                        <a href="/category-savory.html" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Savory</a>
                    </div>
                </div>
                <a href="/breakfast/" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Breakfast</a>
                <a href="/tools/" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Tools</a>
                <a href="/high-protein.html" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">30g+ Protein</a>

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

                <a href="/#sites" class="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600 transition-colors">
                    Browse All Sites
                </a>
            </div>

            <!-- Mobile Menu Button -->
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

                <button
                    x-data="{ open: false }"
                    @click="open = !open; $dispatch('toggle-mobile-menu', { open })"
                    class="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    aria-label="Toggle menu"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div
        x-data="{ open: false }"
        @toggle-mobile-menu.window="open = $event.detail.open"
        x-show="open"
        x-cloak
        class="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"
    >
        <div class="px-4 py-4 space-y-3">
            <a href="/breakfast/" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Breakfast Hub</a>
            <a href="/tools/" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Protein Tools</a>
            <div class="border-t border-slate-200 dark:border-slate-700 my-2"></div>
            <a href="/breakfast/" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">All Breakfast</a>
            <a href="/category-desserts.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Desserts</a>
            <a href="/category-snacks.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Snacks</a>
            <a href="/category-savory.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Savory</a>
            <a href="/high-protein.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">30g+ Protein</a>
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
<footer class="bg-slate-900 dark:bg-slate-950 text-white py-12 mt-16">
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
                    <li><a href="/breakfast/" class="hover:text-white transition-colors">Breakfast</a></li>
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
<div class="group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700">
    <!-- Image Container -->
    <a href="<%= recipe.sourceSite === 'highprotein.recipes' ? '/breakfast/recipes/' + recipe.slug + '/' : '/' + recipe.slug + '-preview.html' %>" class="block relative aspect-square overflow-hidden">
        <img
            src="<%= recipe.image_url || (recipe.sourceSite === 'highprotein.recipes' ? '/images/breakfast/' + recipe.slug + '.png' : 'https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg') %>" 
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
        <a href="<%= recipe.sourceSite === 'highprotein.recipes' ? '/breakfast/recipes/' + recipe.slug + '/' : '/' + recipe.slug + '-preview.html' %>">
            <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                <%= recipe.title %>
            </h3>
        </a>
        <div class="mt-2 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
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
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
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
<section class="py-8 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
                <div class="font-anton text-4xl text-brand-500"><%= allRecipes.length %>+</div>
                <div class="text-slate-600 dark:text-slate-400">Recipes</div>
            </div>
            <div>
                <div class="font-anton text-4xl text-brand-500">12</div>
                <div class="text-slate-600 dark:text-slate-400">Specialized Sites</div>
            </div>
            <div>
                <div class="font-anton text-4xl text-brand-500"><%= categories.highProtein.length %></div>
                <div class="text-slate-600 dark:text-slate-400">30g+ Protein</div>
            </div>
            <div>
                <div class="font-anton text-4xl text-brand-500"><%= categories.noBake.length %></div>
                <div class="text-slate-600 dark:text-slate-400">No-Bake Options</div>
            </div>
        </div>
    </div>
</section>

<!-- Featured Recipes -->
<section id="recipes" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Featured Recipes</h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">Hand-picked favorites from across the Protein Empire</p>
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
<section class="py-16 bg-white dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Browse by Category</h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">Find recipes organized the way you think about food</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="/breakfast/" class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-amber-500 to-orange-600">
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
            <p class="text-slate-600 dark:text-slate-400 text-lg">12 specialized sites, each dedicated to perfecting one type of high-protein treat</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <% empireSites.forEach(es => { %>
            <a href="https://<%= es.domain %>" target="_blank" rel="noopener" class="group bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:shadow-lg transition-all text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                    <img src="/images/empire/<%= es.name.toLowerCase() %>.png" alt="<%= es.name %>" class="w-full h-full object-cover">
                </div>
                <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"><%= es.name %></h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1"><%= es.domain %></p>
            </a>
            <% }); %>
        </div>
    </div>
</section>

<!-- Hero Ingredients -->
<section class="py-16 bg-white dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Popular Ingredients</h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">Browse recipes by your favorite protein sources</p>
        </div>
        
        <div class="flex flex-wrap justify-center gap-4">
            <% site.heroIngredients.forEach(ing => { %>
            <a href="/ingredient-<%= ing.slug %>.html" class="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-brand-500 hover:text-white px-6 py-3 rounded-full font-medium transition-colors">
                <%= ing.name %>
                <span class="ml-2 text-sm opacity-70">(<%= categories.byIngredient[ing.slug]?.length || 0 %>)</span>
            </a>
            <% }); %>
        </div>
    </div>
</section>

<!-- Protein Tools -->
<section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Protein Calculator Tools</h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">Free tools to optimize your high-protein diet</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="/tools/pe-ratio-calculator.html" class="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                </div>
                <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">P:E Ratio Calculator</h3>
                <p class="text-slate-600 dark:text-slate-400 text-sm">Calculate protein-to-energy ratio for any food</p>
            </a>
            <a href="/tools/breakfast-builder.html" class="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                </div>
                <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">Breakfast Macro Builder</h3>
                <p class="text-slate-600 dark:text-slate-400 text-sm">Filter breakfast recipes by your macro targets</p>
            </a>
            <a href="/tools/protein-cost-calculator.html" class="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">Protein Cost Calculator</h3>
                <p class="text-slate-600 dark:text-slate-400 text-sm">Compare protein sources by price efficiency</p>
            </a>
        </div>
        <div class="text-center mt-8">
            <a href="/tools/" class="text-brand-500 hover:text-brand-600 font-medium">View All Tools &rarr;</a>
        </div>
    </div>
</section>

<!-- Breakfast Hub CTA -->
<section class="py-12 mx-4 lg:mx-8">
    <div class="max-w-5xl mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 lg:p-12 text-white">
        <div class="lg:flex lg:items-center lg:justify-between">
            <div class="mb-6 lg:mb-0">
                <h2 class="font-anton text-3xl lg:text-4xl uppercase mb-2">High Protein Breakfast Hub</h2>
                <p class="text-white/80 text-lg"><%= categories.breakfast.length %> macro-verified breakfast recipes with interactive filters</p>
            </div>
            <a href="/breakfast/" class="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
                Explore Breakfast
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
        </div>
    </div>
</section>

<!-- Special Filters -->
<section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="/no-bake.html" class="group bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
                <div class="text-5xl mb-4">&#127850;</div>
                <h3 class="font-anton text-2xl uppercase tracking-wider mb-2">No-Bake Recipes</h3>
                <p class="text-white/80 mb-4"><%= categories.noBake.length %> recipes ready in minutes with zero oven time</p>
                <span class="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                    Browse No-Bake
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </span>
            </a>
            <a href="/quick.html" class="group bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white">
                <div class="text-5xl mb-4">&#9889;</div>
                <h3 class="font-anton text-2xl uppercase tracking-wider mb-2">Quick & Easy</h3>
                <p class="text-white/80 mb-4"><%= categories.quick.length %> recipes ready in 20 minutes or less</p>
                <span class="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                    Browse Quick Recipes
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </span>
            </a>
            <a href="/high-protein.html" class="group bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white">
                <div class="text-5xl mb-4">&#128170;</div>
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
 * Generate all recipes page
 */
function generateAllRecipesPage(site, allRecipes, partials, outputDir) {
  console.log(`   - All Recipes (${allRecipes.length} recipes)`);
  generateListingPage(site, allRecipes, {
    title: `All ${allRecipes.length} High-Protein Recipes`,
    description: `Browse all ${allRecipes.length} macro-verified high-protein recipes from across the Protein Empire`,
    slug: 'all-recipes',
    breadcrumb: [{ name: 'Home', url: '/' }, { name: 'All Recipes', url: null }]
  }, partials, outputDir);
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
  // Extract unique food types for filtering
  const foodTypes = [...new Set(recipes.map(r => r.foodType).filter(Boolean))].sort();
  const hasFilters = foodTypes.length > 1;

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
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" x-data="{ activeFilter: 'all' }">
        <!-- Breadcrumb -->
        <nav class="mb-8 text-sm">
            <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <% config.breadcrumb.forEach((crumb, i) => { %>
                    <% if (crumb.url) { %>
                        <li><a href="<%= crumb.url %>" class="hover:text-slate-900 dark:hover:text-white"><%= crumb.name %></a></li>
                        <li>/</li>
                    <% } else { %>
                        <li class="text-slate-900 dark:text-white font-medium"><%= crumb.name %></li>
                    <% } %>
                <% }); %>
            </ol>
        </nav>

        <!-- Header -->
        <div class="mb-8">
            <h1 class="font-anton text-4xl uppercase tracking-wider mb-4"><%= config.title %></h1>
            <p class="text-slate-600 dark:text-slate-400 text-lg"><%= config.description %></p>
            <p class="text-slate-500 dark:text-slate-500 mt-2"><%= recipes.length %> recipes found</p>
        </div>

        <% if (hasFilters && recipes.length > 0) { %>
        <!-- Filter Buttons -->
        <div class="mb-8 flex flex-wrap gap-2">
            <button
                @click="activeFilter = 'all'"
                :class="activeFilter === 'all' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700">
                All (<%= recipes.length %>)
            </button>
            <% foodTypes.forEach(type => {
                const count = recipes.filter(r => r.foodType === type).length;
                const displayName = type.charAt(0).toUpperCase() + type.slice(1);
            %>
            <button
                @click="activeFilter = '<%= type %>'"
                :class="activeFilter === '<%= type %>' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700">
                <%= displayName %> (<%= count %>)
            </button>
            <% }); %>
        </div>
        <% } %>

        <% if (recipes.length > 0) { %>
        <!-- Recipe Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <% recipes.forEach(recipe => { %>
            <div x-show="activeFilter === 'all' || activeFilter === '<%= recipe.foodType %>'" x-transition>
                <%- include('recipe-card', { recipe }) %>
            </div>
            <% }); %>
        </div>
        <% } else { %>
        <div class="text-center py-16">
            <p class="text-slate-500 dark:text-slate-400 text-lg">No recipes found in this category yet.</p>
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
    foodTypes,
    hasFilters,
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
  canonicalPath: recipe.sourceSite === 'highprotein.recipes' ? '/breakfast/recipes/' + recipe.slug + '/' : '/' + recipe.slug + '-preview.html',
  ogType: 'article',
  ogImage: recipe.image_url || (recipe.sourceSite === 'highprotein.recipes' ? '/images/breakfast/' + recipe.slug + '.png' : 'https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg'),
  preloadImage: recipe.image_url || (recipe.sourceSite === 'highprotein.recipes' ? '/images/breakfast/' + recipe.slug + '.png' : 'https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg'),
  includeIngredients: false
}) %>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "<%= recipe.title %>",
  "description": "<%= recipe.description %>",
  "image": "<%= recipe.image_url || (recipe.sourceSite === 'highprotein.recipes' ? 'https://highprotein.recipes/images/breakfast/' + recipe.slug + '.png' : 'https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg') %>",
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
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
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
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-8">
            <div class="aspect-video relative">
                <img
                    src="<%= recipe.image_url || (recipe.sourceSite === 'highprotein.recipes' ? '/images/breakfast/' + recipe.slug + '.png' : 'https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg') %>"
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

    // Breakfast recipes from highprotein.recipes already have full pages at /breakfast/recipes/{slug}/
    // Only generate preview pages for other sites
    if (recipe.sourceSite !== 'highprotein.recipes') {
      fs.writeFileSync(path.join(outputDir, `${recipe.slug}-preview.html`), html);
    }
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
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
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
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
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
    { loc: '/breakfast/', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category-desserts.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category-snacks.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category-savory.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/no-bake.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/quick.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/high-protein.html', priority: '0.8', changefreq: 'weekly' },
    // Tools
    { loc: '/tools/', priority: '0.9', changefreq: 'monthly' },
    { loc: '/tools/pe-ratio-calculator.html', priority: '0.8', changefreq: 'monthly' },
    { loc: '/tools/breakfast-builder.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/tools/protein-cost-calculator.html', priority: '0.8', changefreq: 'monthly' },
    // Breakfast hub
    { loc: '/breakfast/', priority: '0.9', changefreq: 'weekly' },
  ];

  // Add programmatic breakfast pages
  PROGRAMMATIC_INTENTS.forEach(intent => {
    urls.push({ loc: `/breakfast/${intent.slug}.html`, priority: '0.7', changefreq: 'weekly' });
  });
  
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
  
  // Add recipe pages
  allRecipes.forEach(recipe => {
    if (recipe.sourceSite === 'highprotein.recipes') {
      urls.push({ loc: `/breakfast/recipes/${recipe.slug}/`, priority: '0.6', changefreq: 'weekly' });
    } else {
      urls.push({ loc: `/${recipe.slug}-preview.html`, priority: '0.5', changefreq: 'monthly' });
    }
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
      const sourcePath = path.join(sourceLogoDir, file);
      // Skip directories, only copy files
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, path.join(targetLogoDir, file));
      }
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

/**
 * Programmatic page intents for breakfast landing pages
 */
const PROGRAMMATIC_INTENTS = [
  // Macro-based
  { slug: '40g-protein-under-400-calories', title: '40g Protein Breakfast Under 400 Calories', minProtein: 40, maxCalories: 400, tags: [] },
  { slug: '30g-protein-under-300-calories', title: '30g Protein Breakfast Under 300 Calories', minProtein: 30, maxCalories: 300, tags: [] },
  { slug: '50g-protein-breakfast', title: '50g+ Protein Breakfast Recipes', minProtein: 50, maxCalories: 999, tags: [] },

  // Diet + macro
  { slug: 'vegan-30g-protein-breakfast', title: 'Vegan High Protein Breakfast (30g+)', minProtein: 30, maxCalories: 999, tags: ['vegan'] },
  { slug: 'gluten-free-40g-protein-breakfast', title: 'Gluten-Free 40g Protein Breakfast', minProtein: 40, maxCalories: 999, tags: ['gluten-free'] },
  { slug: 'dairy-free-high-protein-breakfast', title: 'Dairy-Free High Protein Breakfast', minProtein: 25, maxCalories: 999, tags: ['dairy-free'] },
  { slug: 'keto-breakfast-30g-protein', title: 'Keto Breakfast with 30g+ Protein', minProtein: 30, maxCalories: 999, tags: ['keto', 'low-carb'] },

  // Time + macro
  { slug: 'quick-high-protein-breakfast-under-15-minutes', title: 'Quick High Protein Breakfast (Under 15 Minutes)', minProtein: 25, maxCalories: 999, tags: [], maxTime: 15 },
  { slug: 'meal-prep-high-protein-breakfast', title: 'Meal Prep High Protein Breakfast Recipes', minProtein: 25, maxCalories: 999, tags: ['meal-prep'] },

  // Specific combos
  { slug: 'no-eggs-high-protein-breakfast', title: 'High Protein Breakfast Without Eggs', minProtein: 25, maxCalories: 999, tags: ['egg-free', 'no-eggs'] },
  { slug: 'low-calorie-high-protein-breakfast', title: 'Low Calorie High Protein Breakfast (Under 350 cal)', minProtein: 25, maxCalories: 350, tags: [] },
];

/**
 * Generate P:E Ratio Calculator page
 */
function generatePERatioCalculator(site, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: 'P:E Ratio Calculator - Protein to Energy Ratio Tool | ' + site.name,
  pageDescription: 'Calculate protein-to-energy ratio for any food. Find out if your meals are ELITE, EXCELLENT, or GOOD for protein density. Free P:E ratio calculator.',
  canonicalPath: '/tools/pe-ratio-calculator.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
  <div class="max-w-4xl mx-auto px-4">

    <!-- Breadcrumb -->
    <nav class="mb-8 text-sm">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li><a href="/" class="hover:text-slate-900 dark:hover:text-white">Home</a></li>
        <li>/</li>
        <li><a href="/tools/" class="hover:text-slate-900 dark:hover:text-white">Tools</a></li>
        <li>/</li>
        <li class="text-slate-900 dark:text-white font-medium">P:E Ratio Calculator</li>
      </ol>
    </nav>

    <!-- Hero -->
    <div class="text-center mb-12">
      <h1 class="font-anton text-4xl lg:text-5xl uppercase mb-4">P:E RATIO CALCULATOR</h1>
      <p class="text-xl text-slate-600 dark:text-slate-400">Calculate protein-to-energy ratio for any food</p>
    </div>

    <!-- Calculator -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg mb-12"
         x-data="peCalculator()">

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Inputs -->
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-semibold mb-2">Protein (grams)</label>
            <input type="number" x-model.number="protein" min="0" step="0.1"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
                          bg-white dark:bg-slate-700 text-2xl font-bold text-center
                          focus:ring-2 focus:ring-brand-500 focus:border-transparent">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">Calories</label>
            <input type="number" x-model.number="calories" min="1" step="1"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
                          bg-white dark:bg-slate-700 text-2xl font-bold text-center
                          focus:ring-2 focus:ring-brand-500 focus:border-transparent">
          </div>
        </div>

        <!-- Result -->
        <div class="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
          <div class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">P:E RATIO</div>
          <div class="text-5xl font-bold mb-2" :class="tierColor" x-text="peRatio.toFixed(2)"></div>
          <div class="text-lg font-bold px-4 py-1 rounded-full" :class="tierBadgeClass" x-text="tierLabel"></div>
          <div class="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center" x-text="tierDescription"></div>
        </div>
      </div>

      <!-- Explanation -->
      <div class="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
        <h3 class="font-bold mb-2">What is P:E Ratio?</h3>
        <p class="text-slate-600 dark:text-slate-400">
          P:E ratio measures grams of protein per 100 calories. A food with 30g protein and 200 calories
          has a P:E of 15 (extremely high). Higher P:E means more protein per calorie - ideal for
          muscle building while managing calories.
        </p>
      </div>
    </div>

    <!-- P:E Tier Guide -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg mb-12">
      <h2 class="font-anton text-2xl uppercase mb-6">P:E RATIO TIERS</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500">
          <div class="text-emerald-600 dark:text-emerald-400 font-bold text-lg">ELITE</div>
          <div class="text-2xl font-bold">&ge;2.5</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Chicken breast, egg whites, Greek yogurt</div>
        </div>
        <div class="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500">
          <div class="text-green-600 dark:text-green-400 font-bold text-lg">EXCELLENT</div>
          <div class="text-2xl font-bold">2.0-2.49</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Cottage cheese, tuna, protein bars</div>
        </div>
        <div class="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500">
          <div class="text-yellow-600 dark:text-yellow-400 font-bold text-lg">GOOD</div>
          <div class="text-2xl font-bold">1.5-1.99</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Whole eggs, salmon, lean beef</div>
        </div>
        <div class="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500">
          <div class="text-orange-600 dark:text-orange-400 font-bold text-lg">MODERATE</div>
          <div class="text-2xl font-bold">&lt;1.5</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Nuts, cheese, regular bread</div>
        </div>
      </div>
    </div>

    <!-- Common Foods Reference -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
      <h2 class="font-anton text-2xl uppercase mb-6">COMMON FOODS P:E REFERENCE</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700">
              <th class="py-3 font-semibold">Food</th>
              <th class="py-3 font-semibold text-right">Protein</th>
              <th class="py-3 font-semibold text-right">Calories</th>
              <th class="py-3 font-semibold text-right">P:E Ratio</th>
              <th class="py-3 font-semibold text-center">Tier</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr><td class="py-3">Chicken Breast (100g)</td><td class="text-right">31g</td><td class="text-right">165</td><td class="text-right font-bold">18.8</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Egg Whites (100g)</td><td class="text-right">11g</td><td class="text-right">52</td><td class="text-right font-bold">21.2</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Greek Yogurt 0% (100g)</td><td class="text-right">10g</td><td class="text-right">59</td><td class="text-right font-bold">16.9</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Cottage Cheese 1% (100g)</td><td class="text-right">11g</td><td class="text-right">72</td><td class="text-right font-bold">15.3</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Whole Egg (50g)</td><td class="text-right">6g</td><td class="text-right">72</td><td class="text-right font-bold">8.3</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Salmon (100g)</td><td class="text-right">20g</td><td class="text-right">208</td><td class="text-right font-bold">9.6</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Almonds (28g)</td><td class="text-right">6g</td><td class="text-right">164</td><td class="text-right font-bold">3.7</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-bold">EXCELLENT</span></td></tr>
            <tr><td class="py-3">Cheddar Cheese (28g)</td><td class="text-right">7g</td><td class="text-right">113</td><td class="text-right font-bold">6.2</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- CTA to Breakfast Builder -->
    <div class="mt-12 text-center">
      <p class="text-slate-600 dark:text-slate-400 mb-4">Looking for high P:E breakfast recipes?</p>
      <a href="/tools/breakfast-builder.html" class="inline-flex items-center gap-2 bg-brand-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
        Try Breakfast Macro Builder
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </a>
    </div>

  </div>
</main>

<%- include('footer', { site }) %>

<script>
document.addEventListener('alpine:init', () => {
  Alpine.data('peCalculator', () => ({
    protein: 30,
    calories: 200,

    get peRatio() {
      if (this.calories <= 0) return 0;
      return (this.protein / this.calories) * 100;
    },

    get tierLabel() {
      if (this.peRatio >= 2.5) return 'ELITE';
      if (this.peRatio >= 2.0) return 'EXCELLENT';
      if (this.peRatio >= 1.5) return 'GOOD';
      return 'MODERATE';
    },

    get tierColor() {
      if (this.peRatio >= 2.5) return 'text-emerald-600 dark:text-emerald-400';
      if (this.peRatio >= 2.0) return 'text-green-600 dark:text-green-400';
      if (this.peRatio >= 1.5) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-orange-600 dark:text-orange-400';
    },

    get tierBadgeClass() {
      if (this.peRatio >= 2.5) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      if (this.peRatio >= 2.0) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      if (this.peRatio >= 1.5) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    },

    get tierDescription() {
      if (this.peRatio >= 2.5) return 'Extremely protein-dense. Ideal for high-protein diets.';
      if (this.peRatio >= 2.0) return 'Very protein-dense. Great for muscle building.';
      if (this.peRatio >= 1.5) return 'Good protein density. Solid choice for balanced meals.';
      return 'Lower protein density. Consider pairing with higher P:E foods.';
    }
  }));
});
</script>

</body>
</html>
`;

  fs.mkdirSync(path.join(outputDir, 'tools'), { recursive: true });
  const html = ejs.render(template, { site, include: (name, data) => ejs.render(partials[name], data) });
  fs.writeFileSync(path.join(outputDir, 'tools', 'pe-ratio-calculator.html'), html);
}

/**
 * Generate Breakfast Macro Builder page
 */
function generateBreakfastBuilder(site, breakfastRecipes, partials, outputDir) {
  // Embed recipe data as JSON for Alpine.js filtering
  const recipesJson = JSON.stringify(breakfastRecipes.map(r => ({
    slug: r.slug,
    title: r.title,
    protein: r.protein || r.nutrition?.protein || 0,
    calories: r.calories || r.nutrition?.calories || 0,
    carbs: r.carbs || r.nutrition?.carbs || 0,
    sourceSite: r.sourceSite,
    fat: r.fat || r.nutrition?.fat || 0,
    prepTime: r.prepTime || 0,
    totalTime: r.totalTime || 0,
    tags: r.tags || [],
    image: r.image_url || (r.sourceSite === 'highprotein.recipes' ? '/images/breakfast/' + r.slug + '.png' : 'https://' + r.sourceSite + '/recipe_images/' + r.slug + '.jpg'),
    sourceSite: r.sourceSite,
    sourceName: r.sourceName,
    fullRecipeUrl: r.fullRecipeUrl
  })));

  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: 'Breakfast Macro Builder - Find High Protein Breakfast by Macros | ' + site.name,
  pageDescription: 'Build your perfect high-protein breakfast. Set protein target, calorie limit, and dietary restrictions. Find matching breakfast recipes instantly.',
  canonicalPath: '/tools/breakfast-builder.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-8">
  <div class="max-w-7xl mx-auto px-4" x-data="breakfastBuilder()">

    <!-- Breadcrumb -->
    <nav class="mb-8 text-sm">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li><a href="/" class="hover:text-slate-900 dark:hover:text-white">Home</a></li>
        <li>/</li>
        <li><a href="/tools/" class="hover:text-slate-900 dark:hover:text-white">Tools</a></li>
        <li>/</li>
        <li class="text-slate-900 dark:text-white font-medium">Breakfast Builder</li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="font-anton text-4xl lg:text-5xl uppercase mb-4">BREAKFAST MACRO BUILDER</h1>
      <p class="text-xl text-slate-600 dark:text-slate-400">Find your perfect high-protein breakfast</p>
    </div>

    <div class="lg:flex lg:gap-8">

      <!-- Filter Panel (Sticky on desktop) -->
      <div class="lg:w-80 lg:flex-shrink-0 mb-8 lg:mb-0">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg lg:sticky lg:top-24">
          <h2 class="font-bold text-lg mb-6">Set Your Targets</h2>

          <!-- Protein Target -->
          <div class="mb-6">
            <label class="flex justify-between mb-2">
              <span class="font-semibold">Min Protein</span>
              <span class="text-brand-600 dark:text-brand-400 font-bold" x-text="minProtein + 'g'"></span>
            </label>
            <input type="range" min="10" max="60" step="5" x-model.number="minProtein"
                   class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500">
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>10g</span><span>60g</span>
            </div>
          </div>

          <!-- Calorie Cap -->
          <div class="mb-6">
            <label class="flex justify-between mb-2">
              <span class="font-semibold">Max Calories</span>
              <span class="text-brand-600 dark:text-brand-400 font-bold" x-text="maxCalories"></span>
            </label>
            <input type="range" min="200" max="800" step="50" x-model.number="maxCalories"
                   class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500">
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>200</span><span>800</span>
            </div>
          </div>

          <!-- Max Prep Time -->
          <div class="mb-6">
            <label class="flex justify-between mb-2">
              <span class="font-semibold">Max Time</span>
              <span class="text-brand-600 dark:text-brand-400 font-bold" x-text="maxTime + ' min'"></span>
            </label>
            <input type="range" min="5" max="60" step="5" x-model.number="maxTime"
                   class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500">
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>5 min</span><span>60 min</span>
            </div>
          </div>

          <!-- Dietary Filters -->
          <div class="mb-6">
            <div class="font-semibold mb-3">Dietary Preferences</div>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.vegan" class="rounded text-brand-500 focus:ring-brand-500">
                <span>Vegan</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.vegetarian" class="rounded text-brand-500 focus:ring-brand-500">
                <span>Vegetarian</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.glutenFree" class="rounded text-brand-500 focus:ring-brand-500">
                <span>Gluten-Free</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.dairyFree" class="rounded text-brand-500 focus:ring-brand-500">
                <span>Dairy-Free</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.keto" class="rounded text-brand-500 focus:ring-brand-500">
                <span>Keto</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.noEggs" class="rounded text-brand-500 focus:ring-brand-500">
                <span>No Eggs</span>
              </label>
            </div>
          </div>

          <!-- Reset -->
          <button @click="resetFilters()"
                  class="w-full py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Reset Filters
          </button>

          <!-- Results Count -->
          <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <div class="text-3xl font-bold text-brand-600 dark:text-brand-400" x-text="filteredRecipes.length"></div>
            <div class="text-sm text-slate-500 dark:text-slate-400">matching recipes</div>
          </div>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="flex-grow">
        <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <template x-for="recipe in filteredRecipes" :key="recipe.slug">
            <a :href="recipe.sourceSite === 'highprotein.recipes' ? '/breakfast/recipes/' + recipe.slug + '/' : '/' + recipe.slug + '-preview.html'"
               class="group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm
                      hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700">
              <div class="aspect-square bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                <img :src="recipe.image" :alt="recipe.title"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     loading="lazy"
                     onerror="this.src='/images/placeholder.png'">
                <div class="absolute top-3 left-3 bg-accent-500 text-white text-sm font-bold px-2 py-1 rounded-lg"
                     x-text="recipe.protein + 'g'"></div>
                <div class="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-medium px-2 py-1 rounded-lg"
                     x-text="recipe.sourceName"></div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600
                           dark:group-hover:text-brand-400 line-clamp-2 transition-colors" x-text="recipe.title"></h3>
                <div class="mt-2 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <span x-text="recipe.calories + ' cal'"></span>
                  <span>&bull;</span>
                  <span x-text="recipe.totalTime + ' min'"></span>
                </div>
              </div>
            </a>
          </template>
        </div>

        <!-- No Results -->
        <div x-show="filteredRecipes.length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">&#128533;</div>
          <h3 class="text-xl font-bold mb-2">No recipes match your criteria</h3>
          <p class="text-slate-600 dark:text-slate-400">Try adjusting your filters to see more options</p>
        </div>
      </div>

    </div>
  </div>
</main>

<%- include('footer', { site }) %>

<script>
const BREAKFAST_RECIPES = ${recipesJson};

document.addEventListener('alpine:init', () => {
  Alpine.data('breakfastBuilder', () => ({
    recipes: BREAKFAST_RECIPES,
    minProtein: 25,
    maxCalories: 500,
    maxTime: 30,
    filters: {
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      dairyFree: false,
      keto: false,
      noEggs: false
    },

    get filteredRecipes() {
      return this.recipes.filter(r => {
        // Macro filters
        if (r.protein < this.minProtein) return false;
        if (r.calories > this.maxCalories) return false;
        if (r.totalTime > this.maxTime) return false;

        // Dietary filters
        const tags = r.tags.map(t => t.toLowerCase());
        if (this.filters.vegan && !tags.includes('vegan')) return false;
        if (this.filters.vegetarian && !tags.includes('vegetarian') && !tags.includes('vegan')) return false;
        if (this.filters.glutenFree && !tags.some(t => t.includes('gluten-free') || t.includes('gluten free'))) return false;
        if (this.filters.dairyFree && !tags.some(t => t.includes('dairy-free') || t.includes('dairy free'))) return false;
        if (this.filters.keto && !tags.some(t => t.includes('keto') || t.includes('low-carb') || t.includes('low carb'))) return false;
        if (this.filters.noEggs && !tags.some(t => t.includes('no-eggs') || t.includes('egg-free') || t.includes('no eggs'))) return false;

        return true;
      }).sort((a, b) => b.protein - a.protein);
    },

    resetFilters() {
      this.minProtein = 25;
      this.maxCalories = 500;
      this.maxTime = 30;
      this.filters = { vegan: false, vegetarian: false, glutenFree: false, dairyFree: false, keto: false, noEggs: false };
    }
  }));
});
</script>

</body>
</html>
`;

  const html = ejs.render(template, { site, recipesJson, include: (name, data) => ejs.render(partials[name], data) });
  fs.writeFileSync(path.join(outputDir, 'tools', 'breakfast-builder.html'), html);
}

/**
 * Generate Cost-per-Protein Calculator page
 */
function generateCostCalculator(site, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: 'Cost Per Gram Protein Calculator - Find Cheapest Protein Sources | ' + site.name,
  pageDescription: 'Calculate and compare cost per gram of protein for any food. Find the most budget-friendly protein sources. Free protein cost calculator.',
  canonicalPath: '/tools/protein-cost-calculator.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
  <div class="max-w-4xl mx-auto px-4" x-data="costCalculator()">

    <!-- Breadcrumb -->
    <nav class="mb-8 text-sm">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li><a href="/" class="hover:text-slate-900 dark:hover:text-white">Home</a></li>
        <li>/</li>
        <li><a href="/tools/" class="hover:text-slate-900 dark:hover:text-white">Tools</a></li>
        <li>/</li>
        <li class="text-slate-900 dark:text-white font-medium">Protein Cost Calculator</li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="font-anton text-4xl lg:text-5xl uppercase mb-4">COST PER GRAM PROTEIN</h1>
      <p class="text-xl text-slate-600 dark:text-slate-400">Compare protein sources by price efficiency</p>
    </div>

    <!-- Input Section -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-8">
      <h2 class="font-bold text-lg mb-6">Add Protein Sources</h2>

      <div class="space-y-4">
        <template x-for="(item, index) in items" :key="item.id">
          <div class="flex flex-wrap gap-3 items-end p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <div class="flex-grow min-w-[200px]">
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Food Name</label>
              <input type="text" x-model="item.name" placeholder="e.g., Chicken Breast"
                     class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-700">
            </div>
            <div class="w-24">
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Price ($)</label>
              <input type="number" x-model.number="item.price" step="0.01" min="0"
                     class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-700">
            </div>
            <div class="w-28">
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Protein/Serving (g)</label>
              <input type="number" x-model.number="item.proteinPerServing" step="1" min="0"
                     class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-700">
            </div>
            <div class="w-20">
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Servings</label>
              <input type="number" x-model.number="item.servings" step="1" min="1"
                     class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-700">
            </div>
            <button @click="removeItem(item.id)" x-show="items.length > 1"
                    class="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </template>
      </div>

      <button @click="addItem()"
              class="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors">
        + Add Another Item
      </button>
    </div>

    <!-- Results Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg" x-show="sortedItems.length > 0">
      <h2 class="font-bold text-lg mb-6">Ranked by Cost Efficiency</h2>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700 text-left">
              <th class="py-3 font-semibold">#</th>
              <th class="py-3 font-semibold">Food</th>
              <th class="py-3 font-semibold text-right">$/g Protein</th>
              <th class="py-3 font-semibold text-right">Total Protein</th>
              <th class="py-3 font-semibold text-center">Rating</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <template x-for="(item, index) in sortedItems" :key="item.id">
              <tr>
                <td class="py-4 font-bold" x-text="index + 1"></td>
                <td class="py-4" x-text="item.name || 'Item ' + (index + 1)"></td>
                <td class="py-4 text-right font-mono font-bold" x-text="'$' + costPerGram(item).toFixed(3)"></td>
                <td class="py-4 text-right" x-text="totalProtein(item) + 'g'"></td>
                <td class="py-4 text-center">
                  <span class="px-2 py-1 rounded text-sm font-bold"
                        :class="ratingClass(item)"
                        x-text="ratingLabel(item)"></span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Cost to Hit 100g -->
      <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 class="font-bold mb-4">Cost to Get 100g Protein</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <template x-for="item in sortedItems.slice(0, 6)" :key="item.id + '-100g'">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
              <div class="font-semibold truncate" x-text="item.name || 'Unknown'"></div>
              <div class="text-2xl font-bold text-brand-600 dark:text-brand-400" x-text="'$' + (costPerGram(item) * 100).toFixed(2)"></div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Rating Guide -->
    <div class="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <h2 class="font-bold text-lg mb-4">Cost Efficiency Ratings</h2>
      <div class="grid sm:grid-cols-4 gap-4 text-center">
        <div><span class="px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold">EXCELLENT</span><div class="text-sm mt-1">&lt;$0.03/g</div></div>
        <div><span class="px-3 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-bold">GOOD</span><div class="text-sm mt-1">$0.03-0.06/g</div></div>
        <div><span class="px-3 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 font-bold">AVERAGE</span><div class="text-sm mt-1">$0.06-0.10/g</div></div>
        <div><span class="px-3 py-1 rounded bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold">EXPENSIVE</span><div class="text-sm mt-1">&gt;$0.10/g</div></div>
      </div>
    </div>

  </div>
</main>

<%- include('footer', { site }) %>

<script>
document.addEventListener('alpine:init', () => {
  Alpine.data('costCalculator', () => ({
    items: [
      { id: 1, name: 'Chicken Breast (1 lb)', price: 4.99, proteinPerServing: 31, servings: 4 },
      { id: 2, name: 'Eggs (dozen)', price: 3.99, proteinPerServing: 6, servings: 12 },
      { id: 3, name: 'Whey Protein (2 lb)', price: 29.99, proteinPerServing: 25, servings: 30 }
    ],
    nextId: 4,

    addItem() {
      this.items.push({ id: this.nextId++, name: '', price: 0, proteinPerServing: 0, servings: 1 });
    },

    removeItem(id) {
      this.items = this.items.filter(i => i.id !== id);
    },

    totalProtein(item) {
      return item.proteinPerServing * item.servings;
    },

    costPerGram(item) {
      const total = this.totalProtein(item);
      if (total <= 0 || item.price <= 0) return Infinity;
      return item.price / total;
    },

    get sortedItems() {
      return [...this.items]
        .filter(i => i.proteinPerServing > 0 && i.price > 0)
        .sort((a, b) => this.costPerGram(a) - this.costPerGram(b));
    },

    ratingLabel(item) {
      const cpg = this.costPerGram(item);
      if (cpg < 0.03) return 'EXCELLENT';
      if (cpg < 0.06) return 'GOOD';
      if (cpg < 0.10) return 'AVERAGE';
      return 'EXPENSIVE';
    },

    ratingClass(item) {
      const cpg = this.costPerGram(item);
      if (cpg < 0.03) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      if (cpg < 0.06) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      if (cpg < 0.10) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    }
  }));
});
</script>

</body>
</html>
`;

  const html = ejs.render(template, { site, include: (name, data) => ejs.render(partials[name], data) });
  fs.writeFileSync(path.join(outputDir, 'tools', 'protein-cost-calculator.html'), html);
}

/**
 * Generate Tools Landing Page
 */
function generateToolsLandingPage(site, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: 'Protein Calculator Tools | ' + site.name,
  pageDescription: 'Free protein calculator tools: P:E ratio calculator, breakfast macro builder, and cost-per-gram protein calculator. Optimize your high-protein diet.',
  canonicalPath: '/tools/',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
  <div class="max-w-7xl mx-auto px-4">

    <!-- Breadcrumb -->
    <nav class="mb-8 text-sm">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li><a href="/" class="hover:text-slate-900 dark:hover:text-white">Home</a></li>
        <li>/</li>
        <li class="text-slate-900 dark:text-white font-medium">Tools</li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="font-anton text-4xl lg:text-5xl uppercase mb-4">PROTEIN CALCULATOR TOOLS</h1>
      <p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        Free tools to help you optimize your high-protein diet. Calculate ratios, find recipes, and compare costs.
      </p>
    </div>

    <!-- Tools Grid -->
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      <!-- P:E Calculator -->
      <a href="/tools/pe-ratio-calculator.html" class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 hover:border-brand-500">
        <div class="h-40 overflow-hidden">
          <img src="/images/breakfast/tool-pe-ratio.png" alt="P:E Ratio Calculator" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-8">
          <h3 class="font-anton text-2xl uppercase mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">P:E Ratio Calculator</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Calculate protein-to-energy ratio for any food. Find out if your meals are ELITE, EXCELLENT, or GOOD for protein density.</p>
          <span class="inline-flex items-center gap-2 text-brand-500 font-semibold group-hover:gap-3 transition-all">
            Calculate Now
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </div>
      </a>

      <!-- Breakfast Builder -->
      <a href="/tools/breakfast-builder.html" class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 hover:border-brand-500">
        <div class="h-40 overflow-hidden">
          <img src="/images/breakfast/tool-macro-builder.png" alt="Breakfast Macro Builder" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-8">
          <h3 class="font-anton text-2xl uppercase mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Breakfast Macro Builder</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Set your protein target, calorie limit, and dietary restrictions. Find matching high-protein breakfast recipes instantly.</p>
          <span class="inline-flex items-center gap-2 text-brand-500 font-semibold group-hover:gap-3 transition-all">
            Build Breakfast
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </div>
      </a>

      <!-- Cost Calculator -->
      <a href="/tools/protein-cost-calculator.html" class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 hover:border-brand-500">
        <div class="h-40 overflow-hidden">
          <img src="/images/breakfast/tool-cost-calc.png" alt="Protein Cost Calculator" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-8">
          <h3 class="font-anton text-2xl uppercase mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Cost-per-Protein Calculator</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Compare protein sources by price efficiency. Find the cheapest ways to hit your protein goals on any budget.</p>
          <span class="inline-flex items-center gap-2 text-brand-500 font-semibold group-hover:gap-3 transition-all">
            Compare Costs
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </div>
      </a>
    </div>

    <!-- Browse Recipes CTA -->
    <div class="bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl p-8 lg:p-12 text-white text-center">
      <h2 class="font-anton text-3xl lg:text-4xl uppercase mb-4">EXPLORE HIGH-PROTEIN RECIPES</h2>
      <p class="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
        Browse 300+ macro-verified recipes from our network of specialized protein recipe sites.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/breakfast/" class="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
          Breakfast Recipes
        </a>
        <a href="/high-protein.html" class="bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
          30g+ Protein
        </a>
        <a href="/" class="bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
          All Recipes
        </a>
      </div>
    </div>

  </div>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

  const html = ejs.render(template, { site, include: (name, data) => ejs.render(partials[name], data) });
  fs.writeFileSync(path.join(outputDir, 'tools', 'index.html'), html);
}

/**
 * Generate programmatic breakfast landing pages
 */
function generateProgrammaticPages(site, breakfastRecipes, partials, outputDir) {
  const programmaticDir = path.join(outputDir, 'breakfast');
  fs.mkdirSync(programmaticDir, { recursive: true });

  for (const intent of PROGRAMMATIC_INTENTS) {
    // Filter recipes
    const matches = breakfastRecipes.filter(r => {
      const protein = r.protein || r.nutrition?.protein || 0;
      const calories = r.calories || r.nutrition?.calories || 0;
      const totalTime = r.totalTime || 0;
      const tags = (r.tags || []).map(t => t.toLowerCase());

      if (protein < intent.minProtein) return false;
      if (calories > intent.maxCalories) return false;
      if (intent.maxTime && totalTime > intent.maxTime) return false;
      if (intent.tags.length > 0) {
        const hasTag = intent.tags.some(t => tags.some(rt => rt.includes(t.toLowerCase())));
        if (!hasTag) return false;
      }
      return true;
    });

    if (matches.length < 3) continue; // Skip if too few results

    const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: intent.title + ' | ' + site.name,
  pageDescription: 'Discover ' + matches.length + ' ' + intent.title.toLowerCase() + ' recipes with precise macro data. Perfect for meal prep and hitting your protein goals.',
  canonicalPath: '/breakfast/' + intent.slug + '.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
  <div class="max-w-7xl mx-auto px-4">

    <!-- Breadcrumb -->
    <nav class="mb-8 text-sm">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li><a href="/" class="hover:text-slate-900 dark:hover:text-white">Home</a></li>
        <li>/</li>
        <li><a href="/breakfast/" class="hover:text-slate-900 dark:hover:text-white">Breakfast</a></li>
        <li>/</li>
        <li class="text-slate-900 dark:text-white font-medium"><%= intent.title %></li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="mb-12">
      <h1 class="font-anton text-4xl lg:text-5xl uppercase tracking-wider mb-4"><%= intent.title %></h1>
      <p class="text-slate-600 dark:text-slate-400 text-lg">
        <%= matches.length %> recipes with at least <%= intent.minProtein %>g protein<% if (intent.maxCalories < 999) { %> and under <%= intent.maxCalories %> calories<% } %><% if (intent.maxTime) { %>, ready in <%= intent.maxTime %> minutes or less<% } %>.
      </p>
    </div>

    <!-- Recipe Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <% matches.forEach(recipe => { %>
        <%- include('recipe-card', { recipe }) %>
      <% }); %>
    </div>

    <!-- CTA to Builder -->
    <div class="bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl p-8 text-white text-center">
      <h2 class="font-anton text-2xl uppercase mb-3">Want More Control?</h2>
      <p class="text-white/80 mb-4">Use our Breakfast Macro Builder to set exact protein, calorie, and dietary filters.</p>
      <a href="/tools/breakfast-builder.html" class="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
        Open Breakfast Builder
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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
      intent,
      matches,
      include: (name, data) => ejs.render(partials[name], data)
    });

    fs.writeFileSync(path.join(programmaticDir, `${intent.slug}.html`), html);
  }
}

/**
 * Generate breakfast pillar page
 */
function generateBreakfastPillarPage(site, breakfastRecipes, partials, outputDir) {
  const programmaticDir = path.join(outputDir, 'breakfast');
  fs.mkdirSync(programmaticDir, { recursive: true });

  // Get counts for programmatic pages
  const intentCounts = PROGRAMMATIC_INTENTS.map(intent => {
    const matches = breakfastRecipes.filter(r => {
      const protein = r.protein || r.nutrition?.protein || 0;
      const calories = r.calories || r.nutrition?.calories || 0;
      const totalTime = r.totalTime || 0;
      const tags = (r.tags || []).map(t => t.toLowerCase());

      if (protein < intent.minProtein) return false;
      if (calories > intent.maxCalories) return false;
      if (intent.maxTime && totalTime > intent.maxTime) return false;
      if (intent.tags.length > 0) {
        const hasTag = intent.tags.some(t => tags.some(rt => rt.includes(t.toLowerCase())));
        if (!hasTag) return false;
      }
      return true;
    });
    return { ...intent, count: matches.length };
  }).filter(i => i.count >= 3);

  // Get top 25 recipes sorted by protein content (highest first)
  const topBreakfastRecipes = [...breakfastRecipes]
    .sort((a, b) => {
      const proteinA = a.protein || a.nutrition?.protein || 0;
      const proteinB = b.protein || b.nutrition?.protein || 0;
      return proteinB - proteinA;
    })
    .slice(0, 25);

  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: 'High Protein Breakfast Recipes - Complete Guide | ' + site.name,
  pageDescription: 'Browse ' + breakfastRecipes.length + ' high-protein breakfast recipes. Filter by macros, dietary restrictions, and prep time. Build your perfect morning meal.',
  canonicalPath: '/breakfast/',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow">
  <!-- Hero -->
  <section class="relative text-white py-16 lg:py-24 overflow-hidden">
    <div class="absolute inset-0">
      <img src="/images/breakfast/hero-bg.png" alt="" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-br from-amber-500/90 to-orange-600/90"></div>
    </div>
    <div class="relative max-w-7xl mx-auto px-4 text-center">
      <h1 class="font-anton text-5xl lg:text-6xl uppercase tracking-wider mb-6 drop-shadow-lg">HIGH PROTEIN BREAKFAST</h1>
      <p class="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
        <%= breakfastRecipes.length %> macro-verified breakfast recipes. Pancakes, oatmeal, muffins, and more - all optimized for protein.
      </p>
      <a href="/tools/breakfast-builder.html" class="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-colors shadow-lg">
        Build Your Perfect Breakfast
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </a>
    </div>
  </section>

  <!-- Quick Filters -->
  <section class="py-12 bg-white dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="font-anton text-3xl uppercase mb-8 text-center">BROWSE BY GOAL</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <%
        const goalImages = {
          '30g-protein-under-300-calories': 'goal-30g-protein.png',
          'quick-high-protein-breakfast': 'goal-quick-15min.png',
          'low-calorie-high-protein-breakfast': 'goal-low-cal.png'
        };
        intentCounts.forEach(intent => {
          const goalImage = goalImages[intent.slug] || 'goal-30g-protein.png';
        %>
        <a href="/breakfast/<%= intent.slug %>.html" class="group bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700 hover:border-brand-500">
          <div class="h-32 overflow-hidden">
            <img src="/images/breakfast/<%= goalImage %>" alt="<%= intent.title %>" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"><%= intent.title %></h3>
            <p class="text-sm text-slate-500 dark:text-slate-400"><%= intent.count %> recipes</p>
          </div>
        </a>
        <% }); %>
      </div>
    </div>
  </section>

  <!-- Featured Breakfast Recipes -->
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <h2 class="font-anton text-3xl uppercase">TOP BREAKFAST RECIPES</h2>
        <a href="/tools/breakfast-builder.html" class="text-brand-500 hover:text-brand-600 font-medium">Filter Recipes &rarr;</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <% topBreakfastRecipes.forEach(recipe => { %>
          <%- include('recipe-card', { recipe }) %>
        <% }); %>
      </div>
    </div>
  </section>

  <!-- Builder CTA -->
  <section class="py-12 mx-4 lg:mx-8">
    <div class="relative max-w-5xl mx-auto rounded-2xl overflow-hidden">
      <div class="absolute inset-0">
        <img src="/images/breakfast/builder-bg.png" alt="" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-brand-500/90 to-accent-500/90"></div>
      </div>
      <div class="relative p-8 lg:p-12 text-white text-center">
        <h2 class="font-anton text-3xl lg:text-4xl uppercase mb-4 drop-shadow-lg">BUILD YOUR PERFECT BREAKFAST</h2>
        <p class="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
          Set your protein target, calorie limit, and dietary preferences. Find matching recipes instantly.
        </p>
        <a href="/tools/breakfast-builder.html" class="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-colors shadow-lg">
          Open Breakfast Builder
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>
    </div>
  </section>

  <!-- Tools -->
  <section class="py-16 bg-white dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="font-anton text-3xl uppercase mb-8 text-center">PROTEIN TOOLS</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <a href="/tools/pe-ratio-calculator.html" class="group bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700">
          <div class="h-40 overflow-hidden">
            <img src="/images/breakfast/tool-pe-ratio.png" alt="P:E Ratio Calculator" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <div class="p-6">
            <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">P:E Ratio Calculator</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Calculate protein-to-energy ratio for any food</p>
          </div>
        </a>
        <a href="/tools/breakfast-builder.html" class="group bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700">
          <div class="h-40 overflow-hidden">
            <img src="/images/breakfast/tool-macro-builder.png" alt="Breakfast Macro Builder" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <div class="p-6">
            <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">Breakfast Macro Builder</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Filter recipes by your exact macro targets</p>
          </div>
        </a>
        <a href="/tools/protein-cost-calculator.html" class="group bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700">
          <div class="h-40 overflow-hidden">
            <img src="/images/breakfast/tool-cost-calc.png" alt="Protein Cost Calculator" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <div class="p-6">
            <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">Protein Cost Calculator</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Compare cost per gram of protein</p>
          </div>
        </a>
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
    breakfastRecipes,
    topBreakfastRecipes,
    intentCounts,
    include: (name, data) => ejs.render(partials[name], data)
  });

  fs.writeFileSync(path.join(programmaticDir, 'index.html'), html);
}

// Run the build
buildIndexerSite().catch(console.error);
