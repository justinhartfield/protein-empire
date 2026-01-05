#!/usr/bin/env node
/**
 * Generate Social Media Content for All Sites
 * 
 * This script generates social media content packages for all sites
 * that have recipe data available.
 * 
 * Usage:
 *   node packages/social-media/src/generate-all.js
 *   node packages/social-media/src/generate-all.js --site=proteincookies.co
 *   node packages/social-media/src/generate-all.js --platform=pinterest
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAllContent, generateContentCalendar, generateCrossPromotionContent } from './index.js';
import { generatePinterestPackage } from './pinterest.js';
import { generateInstagramPackage } from './instagram.js';
import { generateTikTokPackage } from './tiktok.js';
import { generateFacebookPackage } from './facebook.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');

// Import site configurations
const sitesModule = await import('../../config/sites.js');
const { sites, empireSites } = sitesModule;

/**
 * Load recipes for a site
 */
function loadRecipes(domain) {
  const recipesDir = path.join(ROOT_DIR, 'data', 'recipes', domain.replace(/\./g, '-'));
  const recipesFile = path.join(recipesDir, 'recipes.json');
  
  if (!fs.existsSync(recipesFile)) {
    return null;
  }
  
  const data = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));
  return data.recipes || data;
}

/**
 * Save generated content to file
 */
function saveContent(domain, platform, content) {
  const outputDir = path.join(ROOT_DIR, 'data', 'social-media', domain.replace(/\./g, '-'));
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, `${platform}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));
  
  console.log(`  ✓ Saved ${platform} content to ${outputFile}`);
}

/**
 * Generate content for a single site
 */
function generateForSite(domain, platform = 'all') {
  const siteConfig = sites[domain];
  if (!siteConfig) {
    console.error(`❌ Site not found: ${domain}`);
    return;
  }
  
  const recipes = loadRecipes(domain);
  if (!recipes) {
    console.log(`⚠️  No recipes found for ${domain}, skipping...`);
    return;
  }
  
  console.log(`\n📱 Generating social media content for ${domain}...`);
  console.log(`   Found ${recipes.length} recipes`);
  
  if (platform === 'all' || platform === 'pinterest') {
    const pinterestContent = generatePinterestPackage(recipes, siteConfig);
    saveContent(domain, 'pinterest', pinterestContent);
  }
  
  if (platform === 'all' || platform === 'instagram') {
    const instagramContent = generateInstagramPackage(recipes, siteConfig);
    saveContent(domain, 'instagram', instagramContent);
  }
  
  if (platform === 'all' || platform === 'tiktok') {
    const tiktokContent = generateTikTokPackage(recipes, siteConfig);
    saveContent(domain, 'tiktok', tiktokContent);
  }
  
  if (platform === 'all' || platform === 'facebook') {
    const facebookContent = generateFacebookPackage(recipes, siteConfig);
    saveContent(domain, 'facebook', facebookContent);
  }
  
  if (platform === 'all' || platform === 'calendar') {
    const calendar = generateContentCalendar(recipes, siteConfig, 4);
    saveContent(domain, 'content-calendar', calendar);
  }
  
  if (platform === 'all') {
    const allContent = generateAllContent(recipes, siteConfig);
    saveContent(domain, 'all-platforms', allContent);
  }
  
  console.log(`✅ Completed ${domain}`);
}

/**
 * Main function
 */
async function main() {
  console.log('📱 Protein Empire - Social Media Content Generator\n');
  console.log('='.repeat(50));
  
  // Parse arguments
  const args = process.argv.slice(2);
  const siteArg = args.find(a => a.startsWith('--site='))?.split('=')[1];
  const platformArg = args.find(a => a.startsWith('--platform='))?.split('=')[1] || 'all';
  
  // Get sites to process
  let sitesToProcess = Object.keys(sites).filter(domain => {
    const recipesDir = path.join(ROOT_DIR, 'data', 'recipes', domain.replace(/\./g, '-'));
    return fs.existsSync(path.join(recipesDir, 'recipes.json'));
  });
  
  if (siteArg) {
    if (!sites[siteArg]) {
      console.error(`❌ Site not found: ${siteArg}`);
      process.exit(1);
    }
    sitesToProcess = [siteArg];
  }
  
  console.log(`\nFound ${sitesToProcess.length} sites with recipe data:`);
  sitesToProcess.forEach(site => console.log(`  • ${site}`));
  console.log(`\nPlatform: ${platformArg}`);
  
  // Generate content for each site
  for (const domain of sitesToProcess) {
    generateForSite(domain, platformArg);
  }
  
  // Generate cross-promotion content
  if (platformArg === 'all' && sitesToProcess.length > 1) {
    console.log('\n🔗 Generating cross-promotion content...');
    
    const recipesByDomain = {};
    sitesToProcess.forEach(domain => {
      recipesByDomain[domain] = loadRecipes(domain);
    });
    
    sitesToProcess.forEach(domain => {
      const siteConfig = sites[domain];
      const crossPromos = generateCrossPromotionContent(siteConfig, empireSites, recipesByDomain);
      if (crossPromos.length > 0) {
        saveContent(domain, 'cross-promotion', crossPromos);
      }
    });
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Social media content generation complete!');
  console.log(`\nOutput saved to: ${path.join(ROOT_DIR, 'data', 'social-media')}`);
}

main().catch(console.error);
