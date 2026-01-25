#!/usr/bin/env node
// Add CTA sections to breakfast recipe pages

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const RECIPES_DIR = path.join(ROOT_DIR, 'apps', 'highprotein.recipes', 'dist', 'breakfast', 'recipes');

const FREE_RESOURCE_CTA = `
            <!-- FREE RESOURCE CTA -->
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-6 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <span class="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3">Free Resource</span>
                    <h3 class="font-anton text-2xl text-slate-900 dark:text-white mb-2">GET THE 7-DAY MEAL PLAN</h3>
                    <p class="text-slate-600 dark:text-slate-300 text-sm">Includes shopping list, nutrition facts, and meal prep tips for a week of high-protein breakfasts.</p>
                </div>
                <a href="/pack-starter.html" class="inline-flex items-center justify-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-600 transition whitespace-nowrap">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    DOWNLOAD PDF
                </a>
            </div>`;

const BOTTOM_CTA = `
    <!-- CTA Banner -->
    <section class="py-16 bg-brand-500">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="font-anton text-3xl text-white uppercase mb-4 tracking-wider">WANT MORE BREAKFAST RECIPES?</h2>
            <p class="text-white/80 mb-8">Get our free 7-day starter pack with high-protein breakfast recipes.</p>
            <a href="/pack-starter.html" class="inline-flex items-center gap-3 bg-white text-brand-600 px-8 py-4 rounded-2xl font-bold font-anton text-lg hover:bg-slate-100 transition-colors shadow-xl tracking-wider">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                GET FREE STARTER PACK
            </a>
        </div>
    </section>`;

function addCTAToRecipe(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');

  // Check if CTAs already exist
  if (html.includes('FREE RESOURCE CTA')) {
    console.log(`    Skipping (already has CTAs)`);
    return;
  }

  // 1. Add FREE RESOURCE CTA after the recipe content section starts
  // Insert after <!-- Recipe Content with Interactive Ingredients --> section opening
  html = html.replace(
    /(<section class="py-12 bg-slate-50 dark:bg-slate-900">\s*<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\s*<div class="grid lg:grid-cols-3 gap-8")/,
    `<section class="py-12 bg-slate-50 dark:bg-slate-900">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
${FREE_RESOURCE_CTA}
                <div class="grid lg:grid-cols-3 gap-8"`
  );

  // 2. Add bottom CTA before the Related Recipes CTA section
  html = html.replace(
    /<!-- Related Recipes CTA -->/,
    `${BOTTOM_CTA}

        <!-- Related Recipes CTA -->`
  );

  fs.writeFileSync(filePath, html);
}

// Main execution
console.log('Adding CTAs to breakfast recipe pages...\n');

const recipeDirs = fs.readdirSync(RECIPES_DIR).filter(dir => {
  const stat = fs.statSync(path.join(RECIPES_DIR, dir));
  return stat.isDirectory();
});

let updated = 0;
for (const dir of recipeDirs) {
  const filePath = path.join(RECIPES_DIR, dir, 'index.html');
  if (fs.existsSync(filePath)) {
    console.log(`  Processing: ${dir}/index.html`);
    addCTAToRecipe(filePath);
    updated++;
  }
}

console.log(`\nDone! Processed ${updated} recipe pages.`);
