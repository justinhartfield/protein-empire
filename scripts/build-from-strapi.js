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

// Simple Strapi v5 client
class StrapiClient {
  constructor(url, token) {
    this.url = url;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }
  
  async fetch(endpoint, queryString = '') {
    const url = `${this.url}/api${endpoint}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, { headers: this.headers });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Strapi API error: ${response.status} - ${text}`);
    }
    
    return response.json();
  }
  
  async getSite(domain) {
    // Strapi v5: use URL-encoded filter
    const result = await this.fetch('/sites', `filters[domain][$eq]=${encodeURIComponent(domain)}`);
    return result.data?.[0] || null;
  }
  
  async getRecipes() {
    // Strapi v5: fetch all recipes with populate
    const result = await this.fetch('/recipes', 'pagination[pageSize]=100&populate=*');
    return result.data || [];
  }
  
  async getCategories() {
    const result = await this.fetch('/categories', 'pagination[pageSize]=100');
    return result.data || [];
  }
  
  async getRecipePacks() {
    const result = await this.fetch('/recipe-packs', 'pagination[pageSize]=100&populate=*');
    return result.data || [];
  }
  
  transformRecipe(r) {
    // Strapi v5 returns data directly without attributes wrapper
    return {
      title: r.title,
      slug: r.slug,
      description: r.description,
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      totalTime: r.totalTime,
      yield: r.yield,
      servings: r.yield,
      difficulty: r.difficulty,
      nutrition: {
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fat: r.fat,
        fiber: r.fiber,
        sugar: r.sugar,
      },
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
      fiber: r.fiber,
      sugar: r.sugar,
      ingredients: r.ingredients || [],
      instructions: (r.instructions || []).map(i => i.instruction || i),
      tips: r.tips || [],
      tags: r.tags || [],
      categories: (r.categories || []).map(c => c.slug || c),
    };
  }
  
  transformPack(p) {
    // Strapi v5 returns data directly without attributes wrapper
    return {
      name: p.name,
      slug: p.slug,
      description: p.description,
      isFree: p.isFree,
      recipes: (p.recipes || []).map(r => r.slug || r),
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
    console.log(`   Found site: ${site.name || domain} (ID: ${siteId})`);
    
    // Fetch all data
    const [recipes, categories, packs] = await Promise.all([
      client.getRecipes(),
      client.getCategories(),
      client.getRecipePacks(),
    ]);
    
    console.log(`   Recipes: ${recipes.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Packs: ${packs.length}`);
    
    return {
      recipes: recipes.map(r => client.transformRecipe(r)),
      categories: categories.map(c => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
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
