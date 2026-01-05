#!/usr/bin/env node
/**
 * Analytics Setup Script for the Protein Empire
 * 
 * Generates analytics configuration files for all sites.
 * 
 * Usage:
 *   node packages/analytics/src/setup-analytics.js
 *   node packages/analytics/src/setup-analytics.js --site=proteincookies.co
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSiteAnalyticsSetup, generateAllAnalyticsSetup } from './index.js';
import { ga4SetupChecklist } from './ga4.js';
import { gscSetupChecklist } from './search-console.js';

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
    return [];
  }
  
  const data = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));
  return data.recipes || data;
}

/**
 * Save file to output directory
 */
function saveFile(outputPath, content) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, content);
  console.log(`  ✓ Saved: ${outputPath}`);
}

/**
 * Generate analytics files for a site
 */
function generateForSite(domain) {
  const siteConfig = sites[domain];
  if (!siteConfig) {
    console.error(`❌ Site not found: ${domain}`);
    return;
  }

  if (siteConfig.isIndexer) {
    console.log(`⚠️  Skipping indexer site: ${domain}`);
    return;
  }

  console.log(`\n📊 Generating analytics for ${domain}...`);

  const recipes = loadRecipes(domain);
  console.log(`   Found ${recipes.length} recipes`);

  const setup = generateSiteAnalyticsSetup(siteConfig, recipes);
  const outputDir = path.join(ROOT_DIR, 'data', 'analytics', domain.replace(/\./g, '-'));

  // Save GA4 tracking script
  saveFile(
    path.join(outputDir, 'ga4-tracking.html'),
    setup.ga4Script
  );

  // Save recipe tracking code
  saveFile(
    path.join(outputDir, 'recipe-tracking.html'),
    setup.recipeTrackingCode
  );

  // Save sitemap
  saveFile(
    path.join(outputDir, 'sitemap.xml'),
    setup.sitemap
  );

  // Save robots.txt
  saveFile(
    path.join(outputDir, 'robots.txt'),
    setup.robotsTxt
  );

  // Save setup status
  saveFile(
    path.join(outputDir, 'setup-status.json'),
    JSON.stringify(setup.status, null, 2)
  );

  console.log(`✅ Completed ${domain}`);
}

/**
 * Generate setup checklist document
 */
function generateSetupGuide() {
  const guide = `# Protein Empire Analytics Setup Guide

Generated: ${new Date().toISOString()}

## Overview

This guide covers setting up analytics for all Protein Empire sites:
- Google Analytics 4 (GA4)
- Google Search Console (GSC)
- Custom Event Tracking

---

## Part 1: Google Analytics 4 Setup

${ga4SetupChecklist.map(step => `
### Step ${step.step}: ${step.title}

${step.description}

${step.url ? `**URL:** ${step.url}` : ''}
${step.settings ? `**Settings:**\n${JSON.stringify(step.settings, null, 2)}` : ''}
${step.dimensions ? `**Custom Dimensions:**\n${step.dimensions.map(d => `- ${d.name} (${d.scope})`).join('\n')}` : ''}
${step.events ? `**Events:**\n${step.events.map(e => `- ${e}`).join('\n')}` : ''}
${step.conversions ? `**Conversions:**\n${step.conversions.map(c => `- ${c}`).join('\n')}` : ''}
`).join('\n')}

---

## Part 2: Google Search Console Setup

${gscSetupChecklist.map(step => `
### Step ${step.step}: ${step.title}

${step.description}

${step.url ? `**URL:** ${step.url}` : ''}
${step.input ? `**Input:** ${step.input}` : ''}
${step.methods ? `**Verification Methods:**\n${step.methods.map(m => `- ${m.name}${m.recommended ? ' (Recommended)' : ''}: ${m.description}`).join('\n')}` : ''}
${step.pages ? `**Pages to Index:**\n${step.pages.map(p => `- ${p}`).join('\n')}` : ''}
${step.alerts ? `**Alerts:**\n${step.alerts.map(a => `- ${a}`).join('\n')}` : ''}
`).join('\n')}

---

## Part 3: Site-Specific Configuration

For each site, update \`packages/config/sites.js\` with:

\`\`\`javascript
{
  domain: 'example.com',
  ga4Id: 'G-XXXXXXXXXX', // Add your Measurement ID here
  // ... other config
}
\`\`\`

---

## Part 4: Deployment

1. Copy \`ga4-tracking.html\` content to site's \`<head>\` section
2. Copy \`recipe-tracking.html\` content before \`</body>\` on recipe pages
3. Upload \`sitemap.xml\` to site root
4. Upload \`robots.txt\` to site root
5. Submit sitemap in Google Search Console

---

## Part 5: Verification

1. Use GA4 DebugView to verify events
2. Check Search Console for indexing status
3. Test all conversion events
4. Verify cross-site tracking

---

## Support

For issues or questions, refer to:
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Search Console Help](https://support.google.com/webmasters)
`;

  return guide;
}

/**
 * Main function
 */
async function main() {
  console.log('📊 Protein Empire - Analytics Setup Generator\n');
  console.log('='.repeat(50));

  // Parse arguments
  const args = process.argv.slice(2);
  const siteArg = args.find(a => a.startsWith('--site='))?.split('=')[1];

  // Get sites to process
  let sitesToProcess = Object.keys(sites).filter(domain => !sites[domain].isIndexer);

  if (siteArg) {
    if (!sites[siteArg]) {
      console.error(`❌ Site not found: ${siteArg}`);
      process.exit(1);
    }
    sitesToProcess = [siteArg];
  }

  console.log(`\nProcessing ${sitesToProcess.length} sites...`);

  // Generate for each site
  for (const domain of sitesToProcess) {
    generateForSite(domain);
  }

  // Generate setup guide
  console.log('\n📝 Generating setup guide...');
  const guide = generateSetupGuide();
  const guideDir = path.join(ROOT_DIR, 'data', 'analytics');
  if (!fs.existsSync(guideDir)) {
    fs.mkdirSync(guideDir, { recursive: true });
  }
  fs.writeFileSync(path.join(guideDir, 'SETUP-GUIDE.md'), guide);
  console.log(`  ✓ Saved: ${path.join(guideDir, 'SETUP-GUIDE.md')}`);

  // Generate summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ Analytics setup generation complete!\n');
  console.log('Output saved to: data/analytics/');
  console.log('\nNext steps:');
  console.log('1. Read SETUP-GUIDE.md for detailed instructions');
  console.log('2. Create GA4 properties for each site');
  console.log('3. Add Measurement IDs to packages/config/sites.js');
  console.log('4. Deploy tracking scripts to sites');
  console.log('5. Verify in GSC and GA4');
}

main().catch(console.error);
