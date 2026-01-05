#!/usr/bin/env node
/**
 * Generate Email Marketing Campaigns for All Sites
 * 
 * This script generates email marketing content packages for all sites
 * that have recipe data available.
 * 
 * Usage:
 *   node packages/email-marketing/src/generate-campaigns.js
 *   node packages/email-marketing/src/generate-campaigns.js --site=proteincookies.co
 *   node packages/email-marketing/src/generate-campaigns.js --type=welcome
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSiteEmailPackage, generateEmpireEmailPackage } from './index.js';
import { generateAllWelcomeSequences, exportToSendGridFormat } from './welcome-sequence.js';
import { generateMonthlySchedule } from './newsletter.js';

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
function saveContent(domain, type, content) {
  const outputDir = path.join(ROOT_DIR, 'data', 'email-campaigns', domain.replace(/\./g, '-'));
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, `${type}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));
  
  console.log(`  ✓ Saved ${type} to ${outputFile}`);
}

/**
 * Save HTML email preview
 */
function saveHtmlPreview(domain, emailName, html) {
  const outputDir = path.join(ROOT_DIR, 'data', 'email-campaigns', domain.replace(/\./g, '-'), 'previews');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, `${emailName}.html`);
  fs.writeFileSync(outputFile, html);
  
  console.log(`  ✓ Saved preview: ${emailName}.html`);
}

/**
 * Generate campaigns for a single site
 */
function generateForSite(domain, type = 'all') {
  const siteConfig = sites[domain];
  if (!siteConfig) {
    console.error(`❌ Site not found: ${domain}`);
    return;
  }

  if (siteConfig.isIndexer) {
    console.log(`⚠️  Skipping indexer site: ${domain}`);
    return;
  }
  
  const recipes = loadRecipes(domain);
  if (!recipes) {
    console.log(`⚠️  No recipes found for ${domain}, skipping...`);
    return;
  }
  
  console.log(`\n📧 Generating email campaigns for ${domain}...`);
  console.log(`   Found ${recipes.length} recipes`);

  // Load recipes for all sites (for cross-promo)
  const recipesByDomain = {};
  Object.keys(sites).forEach(d => {
    const r = loadRecipes(d);
    if (r) recipesByDomain[d] = r;
  });
  
  if (type === 'all' || type === 'welcome') {
    const welcomeSequences = generateAllWelcomeSequences({ [domain]: siteConfig }, empireSites);
    saveContent(domain, 'welcome-sequence', welcomeSequences[domain]);
    
    // Save SendGrid format
    const sendgridFormat = exportToSendGridFormat(welcomeSequences[domain]);
    saveContent(domain, 'welcome-sequence-sendgrid', sendgridFormat);
    
    // Save HTML previews for each email
    welcomeSequences[domain].emails.forEach((email, index) => {
      saveHtmlPreview(domain, `welcome-${index + 1}-day${email.dayNumber}`, email.html);
    });
  }
  
  if (type === 'all' || type === 'newsletter') {
    const newsletterSchedule = generateMonthlySchedule(siteConfig, recipes, empireSites);
    saveContent(domain, 'newsletter-schedule', newsletterSchedule);
    
    // Save HTML previews for newsletters
    newsletterSchedule.forEach((item, index) => {
      if (item.newsletter?.html) {
        saveHtmlPreview(domain, `newsletter-week${item.week}`, item.newsletter.html);
      }
    });
  }
  
  if (type === 'all') {
    const fullPackage = generateSiteEmailPackage(siteConfig, recipes, empireSites, recipesByDomain);
    saveContent(domain, 'full-package', fullPackage);
  }
  
  console.log(`✅ Completed ${domain}`);
}

/**
 * Main function
 */
async function main() {
  console.log('📧 Protein Empire - Email Campaign Generator\n');
  console.log('='.repeat(50));
  
  // Parse arguments
  const args = process.argv.slice(2);
  const siteArg = args.find(a => a.startsWith('--site='))?.split('=')[1];
  const typeArg = args.find(a => a.startsWith('--type='))?.split('=')[1] || 'all';
  
  // Get sites to process
  let sitesToProcess = Object.keys(sites).filter(domain => {
    const siteConfig = sites[domain];
    if (siteConfig.isIndexer) return false;
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
  console.log(`\nCampaign type: ${typeArg}`);
  
  // Generate campaigns for each site
  for (const domain of sitesToProcess) {
    generateForSite(domain, typeArg);
  }
  
  // Generate empire-wide content if processing all sites
  if (!siteArg && sitesToProcess.length > 1) {
    console.log('\n🏰 Generating empire-wide email content...');
    
    const recipesByDomain = {};
    sitesToProcess.forEach(domain => {
      recipesByDomain[domain] = loadRecipes(domain);
    });
    
    const empirePackage = generateEmpireEmailPackage(sites, empireSites, recipesByDomain);
    
    const empireDir = path.join(ROOT_DIR, 'data', 'email-campaigns', 'empire');
    if (!fs.existsSync(empireDir)) {
      fs.mkdirSync(empireDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(empireDir, 'empire-newsletter.json'),
      JSON.stringify(empirePackage.empireNewsletter, null, 2)
    );
    console.log(`  ✓ Saved empire newsletter`);
    
    if (empirePackage.empireNewsletter?.html) {
      fs.writeFileSync(
        path.join(empireDir, 'empire-newsletter.html'),
        empirePackage.empireNewsletter.html
      );
      console.log(`  ✓ Saved empire newsletter preview`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Email campaign generation complete!');
  console.log(`\nOutput saved to: ${path.join(ROOT_DIR, 'data', 'email-campaigns')}`);
  console.log('\nNext steps:');
  console.log('1. Review HTML previews in the /previews folders');
  console.log('2. Import welcome-sequence-sendgrid.json into SendGrid');
  console.log('3. Set up automation triggers in your email provider');
}

main().catch(console.error);
