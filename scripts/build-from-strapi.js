#!/usr/bin/env node

/**
 * Build Site from Strapi CMS
 * 
 * This script fetches content from Strapi and generates static sites.
 * Falls back to local JSON files if Strapi is not available.
 * 
 * Usage:
 *   STRAPI_URL=https://your-strapi.railway.app \
 *   STRAPI_API_TOKEN=your-token \
 *   node scripts/build-from-strapi.js <domain>
 * 
 * Or without Strapi (uses local JSON):
 *   node scripts/build-from-strapi.js <domain>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// Simple Strapi client (inline to avoid module issues)
class StrapiClient {
  constructor(url, token) {
    this.url = url;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }
  
  async fetch(endpoint, params = {}) {
    const searchParams = new URLSearchParams();
    
    const flattenParams = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const paramKey = prefix ? `${prefix}[${key}]` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenParams(value, paramKey);
        } else {
          searchParams.append(paramKey, String(value));
        }
      }
    };
    
    flattenParams(params);
    
    const queryString = searchParams.toString();
    const url = `${this.url}/api${endpoint}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, { headers: this.headers });
    
    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async getSite(domain) {
    const result = await this.fetch('/sites', {
      'filters[domain][$eq]': domain,
    });
    return result.data?.[0] || null;
  }
  
  async getRecipes(siteId) {
    const result = await this.fetch('/recipes', {
      'filters[site][id][$eq]': siteId,
      'filters[isPublished][$eq]': true,
      'populate[categories][fields][0]': 'name',
      'populate[categories][fields][1]': 'slug',
      'pagination[limit]': 100,
    });
    return result.data || [];
  }
  
  async getCategories(siteId) {
    const result = await this.fetch('/categories', {
      'filters[site][id][$eq]': siteId,
    });
    return result.data || [];
  }
  
  async getRecipePacks(siteId) {
    const result = await this.fetch('/recipe-packs', {
      'filters[site][id][$eq]': siteId,
      'populate[recipes][fields][0]': 'title',
      'populate[recipes][fields][1]': 'slug',
    });
    return result.data || [];
  }
  
  transformRecipe(r) {
    const a = r.attributes || r;
    return {
      title: a.title,
      slug: a.slug,
      description: a.description,
      prepTime: a.prepTime,
      cookTime: a.cookTime,
      totalTime: a.totalTime,
      yield: a.servings,
      servings: a.servings,
      difficulty: a.difficulty,
      nutrition: {
        calories: a.calories,
        protein: a.protein,
        carbs: a.carbs,
        fat: a.fat,
        fiber: a.fiber,
        sugar: a.sugar,
      },
      calories: a.calories,
      protein: a.protein,
      carbs: a.carbs,
      fat: a.fat,
      fiber: a.fiber,
      sugar: a.sugar,
      ingredients: a.ingredients || [],
      instructions: (a.instructions || []).map(i => i.instruction || i),
      tips: a.tips || [],
      tags: a.tags || [],
      categories: (a.categories?.data || []).map(c => c.attributes?.slug || c.slug),
    };
  }
  
  transformPack(p) {
    const a = p.attributes || p;
    return {
      name: a.name,
      slug: a.slug,
      description: a.description,
      isFree: a.isFree,
      recipes: (a.recipes?.data || []).map(r => r.attributes?.slug || r.slug),
    };
  }
}

async function fetchFromStrapi(domain) {
  if (!STRAPI_URL || !STRAPI_API_TOKEN) {
    return null;
  }
  
  console.log(`📡 Fetching data from Strapi: ${STRAPI_URL}`);
  
  try {
    const client = new StrapiClient(STRAPI_URL, STRAPI_API_TOKEN);
    
    // Get site
    const site = await client.getSite(domain);
    if (!site) {
      console.log(`   Site not found in Strapi: ${domain}`);
      return null;
    }
    
    const siteId = site.id;
    console.log(`   Found site: ${site.attributes?.name || domain} (ID: ${siteId})`);
    
    // Fetch all data
    const [recipes, categories, packs] = await Promise.all([
      client.getRecipes(siteId),
      client.getCategories(siteId),
      client.getRecipePacks(siteId),
    ]);
    
    console.log(`   Recipes: ${recipes.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Packs: ${packs.length}`);
    
    return {
      recipes: recipes.map(r => client.transformRecipe(r)),
      categories: categories.map(c => ({
        name: c.attributes?.name || c.name,
        slug: c.attributes?.slug || c.slug,
        description: c.attributes?.description || c.description,
      })),
      packs: packs.map(p => client.transformPack(p)),
    };
  } catch (error) {
    console.log(`   ⚠️ Strapi fetch failed: ${error.message}`);
    return null;
  }
}

function loadFromJSON(domain) {
  const dataDir = path.join(ROOT_DIR, 'data', 'recipes', domain.replace(/\./g, '-'));
  const recipesFile = path.join(dataDir, 'recipes.json');
  const packsFile = path.join(dataDir, 'packs.json');
  
  if (!fs.existsSync(recipesFile)) {
    return null;
  }
  
  console.log(`📁 Loading data from JSON: ${dataDir}`);
  
  const recipesData = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));
  const recipes = Array.isArray(recipesData) ? recipesData : (recipesData.recipes || []);
  
  let packs = [];
  if (fs.existsSync(packsFile)) {
    const packsData = JSON.parse(fs.readFileSync(packsFile, 'utf-8'));
    packs = Array.isArray(packsData) ? packsData : (packsData.packs || []);
  }
  
  console.log(`   Recipes: ${recipes.length}`);
  console.log(`   Packs: ${packs.length}`);
  
  return { recipes, packs };
}

async function main() {
  const domain = process.argv[2];
  
  if (!domain) {
    console.error('Usage: node scripts/build-from-strapi.js <domain>');
    process.exit(1);
  }
  
  console.log(`\n🏗️  Building site: ${domain}\n`);
  
  // Try Strapi first, fall back to JSON
  let data = await fetchFromStrapi(domain);
  
  if (!data) {
    data = loadFromJSON(domain);
  }
  
  if (!data) {
    console.error(`❌ No data source available for: ${domain}`);
    console.log('   Either configure STRAPI_URL and STRAPI_API_TOKEN,');
    console.log('   or create data files in data/recipes/' + domain.replace(/\./g, '-'));
    process.exit(1);
  }
  
  // Write data to temp files for the main build script
  const tempDir = path.join(ROOT_DIR, '.temp', domain.replace(/\./g, '-'));
  fs.mkdirSync(tempDir, { recursive: true });
  
  fs.writeFileSync(
    path.join(tempDir, 'recipes.json'),
    JSON.stringify({ recipes: data.recipes }, null, 2)
  );
  
  if (data.packs) {
    fs.writeFileSync(
      path.join(tempDir, 'packs.json'),
      JSON.stringify({ packs: data.packs }, null, 2)
    );
  }
  
  console.log(`\n✅ Data prepared. Running build script...\n`);
  
  // Run the main build script
  const { spawn } = await import('child_process');
  const buildProcess = spawn('node', ['scripts/build-site.js', domain], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      PROTEIN_EMPIRE_DATA_DIR: tempDir,
    },
  });
  
  buildProcess.on('close', (code) => {
    // Clean up temp files
    fs.rmSync(tempDir, { recursive: true, force: true });
    process.exit(code);
  });
}

main().catch(console.error);
