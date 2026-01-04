#!/usr/bin/env node

/**
 * Build All Sites for the Protein Empire
 * 
 * This script builds all sites that have recipe data available.
 * 
 * Usage:
 *   node scripts/build-all.js
 *   node scripts/build-all.js --status=ready  # Only build sites with 'ready' status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

import { sites, getSitesByStatus } from '../packages/config/sites.js';

/**
 * Build a single site
 */
function buildSite(domain) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔨 Building ${domain}...`);
    
    const child = spawn('node', [path.join(__dirname, 'build-site.js'), domain], {
      stdio: 'inherit',
      cwd: ROOT_DIR
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Build failed for ${domain} with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

/**
 * Main function
 */
async function buildAll() {
  console.log('🏗️  Protein Empire - Build All Sites\n');
  console.log('='.repeat(50));
  
  // Parse arguments
  const args = process.argv.slice(2);
  const statusFilter = args.find(a => a.startsWith('--status='))?.split('=')[1];
  
  // Get sites to build
  let sitesToBuild = Object.values(sites);
  
  if (statusFilter) {
    sitesToBuild = getSitesByStatus(statusFilter);
    console.log(`\nFiltering by status: ${statusFilter}`);
  }
  
  // Filter to sites that have recipe data
  const dataDir = path.join(ROOT_DIR, 'data', 'recipes');
  sitesToBuild = sitesToBuild.filter(site => {
    const siteDataDir = path.join(dataDir, site.domain.replace(/\./g, '-'));
    const recipesFile = path.join(siteDataDir, 'recipes.json');
    return fs.existsSync(recipesFile);
  });
  
  console.log(`\nFound ${sitesToBuild.length} sites with recipe data:\n`);
  sitesToBuild.forEach(site => {
    console.log(`  • ${site.domain} (${site.status})`);
  });
  
  if (sitesToBuild.length === 0) {
    console.log('\n⚠️  No sites to build. Add recipe data to data/recipes/{domain}/ first.');
    return;
  }
  
  // Build each site
  const results = {
    success: [],
    failed: []
  };
  
  for (const site of sitesToBuild) {
    try {
      await buildSite(site.domain);
      results.success.push(site.domain);
    } catch (error) {
      console.error(`\n❌ Error building ${site.domain}:`, error.message);
      results.failed.push(site.domain);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Build Summary\n');
  console.log(`✅ Successful: ${results.success.length}`);
  results.success.forEach(d => console.log(`   • ${d}`));
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length}`);
    results.failed.forEach(d => console.log(`   • ${d}`));
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

buildAll();
