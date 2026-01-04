#!/usr/bin/env node
/**
 * Import recipe data into Strapi CMS via API
 * Usage: node scripts/import-to-strapi.js <site-domain>
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.strapi') });

const STRAPI_URL = process.env.STRAPI_URL || 'https://web-production-98f1.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN not set in .env.strapi');
  process.exit(1);
}

const siteDomain = process.argv[2] || 'proteincookies.co';

async function fetchAPI(endpoint, method = 'GET', data = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify({ data });
  }
  
  const response = await fetch(url, options);
  const result = await response.json();
  
  if (!response.ok) {
    console.error(`API Error: ${response.status}`, JSON.stringify(result, null, 2));
    throw new Error(`API Error: ${response.status}`);
  }
  
  return result;
}

async function importSite(domain) {
  console.log(`\n📦 Importing site: ${domain}`);
  
  // Load site config - sites.js exports an object keyed by domain
  const sitesConfig = require('../packages/config/sites.js');
  const sites = sitesConfig.sites || sitesConfig.default || sitesConfig;
  const siteConfig = sites[domain];
  
  if (!siteConfig) {
    throw new Error(`Site config not found for ${domain}`);
  }
  
  // Check if site already exists
  const existingSites = await fetchAPI(`/sites?filters[domain][$eq]=${domain}`);
  
  let siteId;
  if (existingSites.data && existingSites.data.length > 0) {
    siteId = existingSites.data[0].id;
    console.log(`  Site already exists with ID: ${siteId}`);
  } else {
    // Create site
    const siteData = {
      name: siteConfig.name,
      domain: siteConfig.domain,
      tagline: siteConfig.tagline,
      foodType: siteConfig.foodType,
      brandColor: siteConfig.brandColor,
      metaDescription: siteConfig.metaDescription
    };
    
    const newSite = await fetchAPI('/sites', 'POST', siteData);
    siteId = newSite.data.id;
    console.log(`  Created site with ID: ${siteId}`);
  }
  
  return siteId;
}

async function importCategories(siteId, domain) {
  console.log(`\n📁 Importing categories...`);
  
  const categoriesConfig = require('../packages/config/categories.js');
  const categoryMap = {};
  
  // Combine universal and site-specific categories
  const universal = categoriesConfig.universalCategories || {};
  const siteSpecific = (categoriesConfig.siteCategories || {})[domain] || {};
  const allCategories = { ...universal, ...siteSpecific };
  
  for (const cat of Object.values(allCategories)) {
    // Check if category exists
    const existing = await fetchAPI(`/categories?filters[slug][$eq]=${cat.slug}`);
    
    if (existing.data && existing.data.length > 0) {
      categoryMap[cat.slug] = existing.data[0].id;
      console.log(`  Category "${cat.name}" already exists`);
    } else {
      const catData = {
        name: cat.name,
        slug: cat.slug,
        description: cat.description || `${cat.name} recipes`,
        site: siteId
      };
      
      const newCat = await fetchAPI('/categories', 'POST', catData);
      categoryMap[cat.slug] = newCat.data.id;
      console.log(`  Created category: ${cat.name}`);
    }
  }
  
  return categoryMap;
}

async function importRecipes(siteId, categoryMap, domain) {
  console.log(`\n🍪 Importing recipes...`);
  
  // Load recipes from JSON
  const domainKey = domain.replace(/\./g, '-');
  const recipesPath = path.join(__dirname, '..', 'data', 'recipes', domainKey, 'recipes.json');
  
  if (!fs.existsSync(recipesPath)) {
    console.error(`  Recipes file not found: ${recipesPath}`);
    return;
  }
  
  const recipesData = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
  const recipes = recipesData.recipes || recipesData;
  
  console.log(`  Found ${recipes.length} recipes to import`);
  
  for (const recipe of recipes) {
    // Check if recipe already exists
    const existing = await fetchAPI(`/recipes?filters[slug][$eq]=${recipe.slug}`);
    
    if (existing.data && existing.data.length > 0) {
      console.log(`  Recipe "${recipe.title}" already exists, skipping`);
      continue;
    }
    
    // Normalize ingredients - schema uses: name (required), amount (required), unit
    let ingredients = [];
    if (recipe.ingredients) {
      ingredients = recipe.ingredients.map(ing => {
        if (typeof ing === 'string') {
          // Parse string format like "100g protein powder"
          const match = ing.match(/^(\d+)\s*(\w+)?\s+(.+)$/);
          if (match) {
            return { name: match[3], amount: parseInt(match[1]) || 100, unit: match[2] || 'g' };
          }
          return { name: ing, amount: 100, unit: 'g' };
        }
        return {
          name: ing.name || ing.item || 'ingredient',
          amount: parseInt(ing.amount) || 100,
          unit: ing.unit || 'g'
        };
      });
    }
    
    // Normalize instructions - step must be a number, text is the instruction content
    let instructions = [];
    if (recipe.instructions) {
      instructions = recipe.instructions.map((inst, idx) => {
        if (typeof inst === 'string') {
          return { step: idx + 1, text: inst };
        }
        // If step is a string (like "Preheat and Prep"), use index as step number
        // and combine step title with text
        const stepNum = typeof inst.step === 'number' ? inst.step : idx + 1;
        const stepText = typeof inst.step === 'string' 
          ? `${inst.step}: ${inst.text || inst.instruction || ''}`
          : (inst.text || inst.instruction || '');
        return {
          step: stepNum,
          text: stepText
        };
      });
    }
    
    // Get category IDs
    const categoryIds = [];
    if (recipe.categories) {
      for (const catSlug of recipe.categories) {
        if (categoryMap[catSlug]) {
          categoryIds.push(categoryMap[catSlug]);
        }
      }
    }
    
    const recipeData = {
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description || 'A delicious protein recipe',
      prepTime: recipe.prepTime || 10,
      cookTime: recipe.cookTime || 15,
      totalTime: recipe.totalTime || (recipe.prepTime || 10) + (recipe.cookTime || 15),
      yield: parseInt(recipe.yield) || parseInt(recipe.servings) || 12,
      difficulty: recipe.difficulty || 'Easy',
      calories: recipe.nutrition?.calories || recipe.calories || 150,
      protein: recipe.nutrition?.protein || recipe.protein || 15,
      carbs: recipe.nutrition?.carbs || recipe.carbs || 10,
      fat: recipe.nutrition?.fat || recipe.fat || 5,
      fiber: recipe.nutrition?.fiber || recipe.fiber || 2,
      sugar: recipe.nutrition?.sugar || recipe.sugar || 3,
      ingredients: ingredients,
      instructions: instructions,
      tags: recipe.tags || [],
      site: siteId,
      categories: categoryIds
    };
    
    try {
      const newRecipe = await fetchAPI('/recipes', 'POST', recipeData);
      console.log(`  ✅ Imported: ${recipe.title}`);
    } catch (error) {
      console.error(`  ❌ Failed to import: ${recipe.title}`, error.message);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function importPacks(siteId, domain) {
  console.log(`\n📦 Importing recipe packs...`);
  
  const domainKey = domain.replace(/\./g, '-');
  const packsPath = path.join(__dirname, '..', 'data', 'recipes', domainKey, 'packs.json');
  
  if (!fs.existsSync(packsPath)) {
    console.log(`  No packs file found: ${packsPath}`);
    return;
  }
  
  const packsData = JSON.parse(fs.readFileSync(packsPath, 'utf8'));
  const packs = packsData.packs || packsData;
  
  for (const pack of packs) {
    // Check if pack already exists
    const existing = await fetchAPI(`/recipe-packs?filters[slug][$eq]=${pack.slug}`);
    
    if (existing.data && existing.data.length > 0) {
      console.log(`  Pack "${pack.name}" already exists, skipping`);
      continue;
    }
    
    const packData = {
      name: pack.name,
      slug: pack.slug,
      description: pack.description || '',
      recipeCount: pack.recipeCount || pack.recipes?.length || 5,
      isFree: pack.isFree !== false,
      site: siteId
    };
    
    try {
      await fetchAPI('/recipe-packs', 'POST', packData);
      console.log(`  ✅ Imported pack: ${pack.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to import pack: ${pack.name}`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Strapi Data Import Tool');
  console.log(`   URL: ${STRAPI_URL}`);
  console.log(`   Site: ${siteDomain}`);
  
  try {
    // Test API connection
    console.log('\n🔌 Testing API connection...');
    await fetchAPI('/sites');
    console.log('   ✅ Connected to Strapi API');
    
    // Import site
    const siteId = await importSite(siteDomain);
    
    // Import categories
    const categoryMap = await importCategories(siteId, siteDomain);
    
    // Import recipes
    await importRecipes(siteId, categoryMap, siteDomain);
    
    // Import packs
    await importPacks(siteId, siteDomain);
    
    console.log('\n✅ Import complete!');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
