#!/usr/bin/env node

/**
 * Generate PDFs for all recipe packs across all sites
 * 
 * Usage:
 *   node scripts/generate-pdfs.js                    # Generate all
 *   node scripts/generate-pdfs.js proteincookies.co  # Generate for specific site
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePDF } from '../packages/pdf-generator/index.js';
import { sites, getSite } from '../packages/config/sites.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function generatePDFsForSite(domain) {
  console.log(`\n📄 Generating PDFs for ${domain}...\n`);
  
  const site = getSite(domain);
  if (!site) {
    console.error(`❌ Site not found: ${domain}`);
    return false;
  }
  
  // Paths
  const dataDir = path.join(ROOT_DIR, 'data', 'recipes', domain.replace(/\./g, '-'));
  const outputDir = path.join(ROOT_DIR, 'apps', domain, 'dist', 'guides');
  
  // Load recipes
  const recipesFile = path.join(dataDir, 'recipes.json');
  if (!fs.existsSync(recipesFile)) {
    console.log(`   ⚠️ No recipes found for ${domain}`);
    return false;
  }
  
  const recipesData = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));
  const allRecipes = Array.isArray(recipesData) ? recipesData : (recipesData.recipes || []);
  
  // Load packs
  const packsFile = path.join(dataDir, 'packs.json');
  if (!fs.existsSync(packsFile)) {
    console.log(`   ⚠️ No packs found for ${domain}`);
    return false;
  }
  
  const packs = JSON.parse(fs.readFileSync(packsFile, 'utf-8'));
  
  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Generate PDF for each pack
  for (const pack of packs) {
    const packRecipes = allRecipes.filter(r => pack.recipes?.includes(r.slug));
    
    if (packRecipes.length === 0) {
      console.log(`   ⚠️ No recipes found for pack: ${pack.slug}`);
      continue;
    }
    
    // Normalize recipes to have nutrition object
    const normalizedRecipes = packRecipes.map(r => ({
      ...r,
      nutrition: r.nutrition || {
        protein: r.protein,
        calories: r.calories,
        carbs: r.carbs,
        fat: r.fat,
        fiber: r.fiber,
        sugar: r.sugar
      }
    }));
    
    const outputPath = path.join(outputDir, `${domain.replace(/\./g, '-')}-${pack.slug}.pdf`);
    
    await generatePDF({
      site,
      pack,
      recipes: normalizedRecipes,
      outputPath
    });
  }
  
  console.log(`\n✅ Generated ${packs.length} PDFs for ${domain}`);
  return true;
}

async function main() {
  console.log('📚 Protein Empire - PDF Generator\n');
  console.log('='.repeat(50));
  
  const targetDomain = process.argv[2];
  
  if (targetDomain) {
    // Generate for specific site
    await generatePDFsForSite(targetDomain);
  } else {
    // Generate for all sites with data
    const dataDir = path.join(ROOT_DIR, 'data', 'recipes');
    
    for (const domain of Object.keys(sites)) {
      const siteDataDir = path.join(dataDir, domain.replace(/\./g, '-'));
      if (fs.existsSync(path.join(siteDataDir, 'recipes.json'))) {
        await generatePDFsForSite(domain);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ PDF generation complete!\n');
}

main().catch(console.error);
