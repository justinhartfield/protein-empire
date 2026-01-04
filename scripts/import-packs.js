#!/usr/bin/env node

/**
 * Import Recipe Packs into Strapi CMS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const STRAPI_URL = process.env.STRAPI_URL || 'https://web-production-98f1.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

async function strapiRequest(endpoint, method = 'GET', data = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
    },
  };
  
  if (data) {
    options.body = JSON.stringify({ data });
  }
  
  const response = await fetch(url, options);
  const text = await response.text();
  
  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} - ${text}`);
  }
  
  return text ? JSON.parse(text) : null;
}

async function main() {
  if (!STRAPI_API_TOKEN) {
    console.error('STRAPI_API_TOKEN is required');
    process.exit(1);
  }
  
  console.log('📦 Importing Recipe Packs into Strapi...\n');
  
  // Get site ID
  const sitesResult = await strapiRequest('/sites?filters[domain][$eq]=proteincookies.co');
  const site = sitesResult.data?.[0];
  if (!site) {
    console.error('Site not found');
    process.exit(1);
  }
  console.log(`Found site: ${site.name} (ID: ${site.id})`);
  
  // Get all recipes to map slugs to IDs
  const recipesResult = await strapiRequest('/recipes?pagination[pageSize]=100');
  const recipeMap = {};
  for (const recipe of recipesResult.data || []) {
    recipeMap[recipe.slug] = recipe.id;
  }
  console.log(`Found ${Object.keys(recipeMap).length} recipes\n`);
  
  // Load packs from JSON
  const packsFile = path.join(ROOT_DIR, 'data', 'recipes', 'proteincookies-co', 'packs.json');
  const packs = JSON.parse(fs.readFileSync(packsFile, 'utf-8'));
  
  // Import each pack
  for (const pack of packs) {
    console.log(`Creating pack: ${pack.title}...`);
    
    // Map recipe slugs to IDs
    const recipeIds = pack.recipes
      .map(slug => recipeMap[slug])
      .filter(id => id !== undefined);
    
    const packData = {
      title: pack.title,
      slug: pack.slug,
      description: pack.description,
      icon: pack.icon || '📦',
      isFree: true,
      site: site.id,
      recipes: recipeIds,
    };
    
    try {
      const result = await strapiRequest('/recipe-packs', 'POST', packData);
      console.log(`   ✓ Created: ${result.data.title} (ID: ${result.data.id})`);
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Pack import complete!');
}

main().catch(console.error);
