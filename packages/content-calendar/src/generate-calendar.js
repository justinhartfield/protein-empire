#!/usr/bin/env node
/**
 * Generate Content Calendars for the Protein Empire
 * 
 * Usage:
 *   node packages/content-calendar/src/generate-calendar.js
 *   node packages/content-calendar/src/generate-calendar.js --month=2 --year=2026
 *   node packages/content-calendar/src/generate-calendar.js --quarter=1 --year=2026
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateCompleteMonthlyCalendar,
  generateMasterCalendarView,
  exportMasterCalendar,
  getCalendarStats
} from './index.js';
import { generateQuarterlyPlan } from './content-calendar.js';
import { generateAnnualEmailCalendar } from './email-calendar.js';

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
  console.log(`  ✓ Saved: ${path.basename(outputPath)}`);
}

/**
 * Generate monthly calendar
 */
function generateMonthly(year, month) {
  console.log(`\n📅 Generating calendar for ${new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}...`);

  // Load recipes for all sites
  const recipes = {};
  const topPerformers = {};
  
  Object.keys(sites).forEach(domain => {
    if (!sites[domain].isIndexer) {
      const siteRecipes = loadRecipes(domain);
      recipes[domain] = siteRecipes;
      // Use first 5 recipes as "top performers" for demo
      topPerformers[domain] = siteRecipes.slice(0, 5);
    }
  });

  // Generate complete calendar
  const calendar = generateCompleteMonthlyCalendar({
    year,
    month,
    sites: empireSites,
    recipes,
    topPerformers
  });

  // Generate master view
  const masterView = generateMasterCalendarView(calendar);

  // Get stats
  const stats = getCalendarStats(calendar);

  // Output directory
  const outputDir = path.join(ROOT_DIR, 'data', 'calendars', `${year}-${String(month).padStart(2, '0')}`);

  // Save complete calendar
  saveFile(
    path.join(outputDir, 'complete-calendar.json'),
    JSON.stringify(calendar, null, 2)
  );

  // Save master view CSV
  saveFile(
    path.join(outputDir, 'master-calendar.csv'),
    exportMasterCalendar(masterView, 'csv')
  );

  // Save iCal format
  saveFile(
    path.join(outputDir, 'calendar.ics'),
    exportMasterCalendar(masterView, 'ical')
  );

  // Save stats
  saveFile(
    path.join(outputDir, 'stats.json'),
    JSON.stringify(stats, null, 2)
  );

  // Print summary
  console.log('\n📊 Calendar Summary:');
  console.log(`   Social Posts: ${stats.social.total}`);
  console.log(`   Email Campaigns: ${stats.email.total}`);
  console.log(`   Content Items: ${stats.content.total}`);
  console.log(`   Total Activities: ${masterView.length}`);

  return calendar;
}

/**
 * Generate quarterly plan
 */
function generateQuarterly(year, quarter) {
  console.log(`\n📅 Generating Q${quarter} ${year} plan...`);

  const plan = generateQuarterlyPlan({
    year,
    quarter,
    sites: empireSites
  });

  const outputDir = path.join(ROOT_DIR, 'data', 'calendars', `${year}-Q${quarter}`);

  saveFile(
    path.join(outputDir, 'quarterly-plan.json'),
    JSON.stringify(plan, null, 2)
  );

  // Generate summary markdown
  const summary = `# Q${quarter} ${year} Content Plan

## Overview

- **Total Content Items**: ${plan.summary.totalItems}
- **New Recipes**: ${plan.summary.newRecipes}
- **Updates**: ${plan.summary.updates}

## Monthly Breakdown

${plan.months.map(m => `### ${m.monthName}
- Theme: ${m.theme}
- Focus: ${m.focus?.join(', ')}
- Items: ${m.items.length}
`).join('\n')}

## Quarterly Goals

${Object.entries(plan.goals).map(([key, goal]) => `### ${key.charAt(0).toUpperCase() + key.slice(1)}
- **Target**: ${goal.target}
- **Description**: ${goal.description}
`).join('\n')}
`;

  saveFile(
    path.join(outputDir, 'quarterly-summary.md'),
    summary
  );

  console.log(`\n✅ Q${quarter} plan generated!`);
  return plan;
}

/**
 * Generate annual email calendar
 */
function generateAnnual(year) {
  console.log(`\n📅 Generating annual email calendar for ${year}...`);

  const calendar = generateAnnualEmailCalendar({
    year,
    sites: empireSites
  });

  const outputDir = path.join(ROOT_DIR, 'data', 'calendars', `${year}-annual`);

  saveFile(
    path.join(outputDir, 'annual-email-calendar.json'),
    JSON.stringify(calendar, null, 2)
  );

  console.log(`\n✅ Annual calendar generated!`);
  console.log(`   Total campaigns: ${calendar.summary.totalCampaigns}`);
  return calendar;
}

/**
 * Main function
 */
async function main() {
  console.log('📅 Protein Empire - Content Calendar Generator\n');
  console.log('='.repeat(50));

  // Parse arguments
  const args = process.argv.slice(2);
  const yearArg = args.find(a => a.startsWith('--year='))?.split('=')[1];
  const monthArg = args.find(a => a.startsWith('--month='))?.split('=')[1];
  const quarterArg = args.find(a => a.startsWith('--quarter='))?.split('=')[1];
  const annualArg = args.includes('--annual');

  const year = yearArg ? parseInt(yearArg) : new Date().getFullYear();

  if (annualArg) {
    generateAnnual(year);
  } else if (quarterArg) {
    generateQuarterly(year, parseInt(quarterArg));
  } else {
    const month = monthArg ? parseInt(monthArg) : new Date().getMonth() + 1;
    generateMonthly(year, month);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Calendar generation complete!');
  console.log(`\nOutput saved to: data/calendars/`);
}

main().catch(console.error);
