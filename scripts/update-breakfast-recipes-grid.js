#!/usr/bin/env node
// Update breakfast/index.html to show all 25 HighProtein.Recipes breakfast cards

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const RECIPES_DIR = path.join(ROOT_DIR, 'apps', 'highprotein.recipes', 'dist', 'breakfast', 'recipes');
const BREAKFAST_INDEX = path.join(ROOT_DIR, 'apps', 'highprotein.recipes', 'dist', 'breakfast', 'index.html');

function extractRecipeData(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');

  // Extract JSON-LD schema
  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!schemaMatch) return null;

  try {
    const schema = JSON.parse(schemaMatch[1]);
    const recipe = schema['@graph']?.find(item => item['@type'] === 'Recipe') || schema;

    // Parse time from PT format (e.g., "PT15M" -> 15)
    const totalTimeMatch = recipe.totalTime?.match(/PT(\d+)M/);
    const totalTime = totalTimeMatch ? parseInt(totalTimeMatch[1]) : 0;

    // Parse calories (e.g., "340 calories" -> 340)
    const caloriesMatch = recipe.nutrition?.calories?.match(/(\d+)/);
    const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : 0;

    // Parse protein (e.g., "38g" -> 38)
    const proteinMatch = recipe.nutrition?.proteinContent?.match(/(\d+)/);
    const protein = proteinMatch ? parseInt(proteinMatch[1]) : 0;

    return {
      name: recipe.name,
      image: recipe.image,
      protein,
      calories,
      totalTime,
      slug: path.basename(path.dirname(filePath))
    };
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e.message);
    return null;
  }
}

function generateRecipeCard(recipe) {
  return `
<div class="group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700">
    <a href="/breakfast/recipes/${recipe.slug}/" class="block relative aspect-square overflow-hidden">
        <img
            src="${recipe.image}"
            alt="${recipe.name}"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onerror="this.src='/images/placeholder.png'"
        >
        <div class="absolute top-3 left-3 bg-accent-500 text-white text-sm font-bold px-2 py-1 rounded-lg">
            ${recipe.protein}g
        </div>
    </a>
    <div class="p-4">
        <a href="/breakfast/recipes/${recipe.slug}/">
            <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                ${recipe.name}
            </h3>
        </a>
        <div class="mt-2 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>${recipe.calories} cal</span>
            <span>&bull;</span>
            <span>${recipe.totalTime}m</span>
        </div>
    </div>
</div>`;
}

// Main execution
console.log('Extracting recipe data from 25 breakfast recipes...\n');

const recipeDirs = fs.readdirSync(RECIPES_DIR).filter(dir => {
  const stat = fs.statSync(path.join(RECIPES_DIR, dir));
  return stat.isDirectory();
});

const recipes = [];
for (const dir of recipeDirs) {
  const filePath = path.join(RECIPES_DIR, dir, 'index.html');
  if (fs.existsSync(filePath)) {
    const data = extractRecipeData(filePath);
    if (data) {
      recipes.push(data);
      console.log(`  Extracted: ${data.name} (${data.protein}g protein, ${data.calories} cal)`);
    }
  }
}

// Sort by protein content (highest first)
recipes.sort((a, b) => b.protein - a.protein);

console.log(`\nGenerating ${recipes.length} recipe cards...`);

// Generate all cards HTML
const cardsHtml = recipes.map(r => generateRecipeCard(r)).join('\n        ');

// Read breakfast index
let html = fs.readFileSync(BREAKFAST_INDEX, 'utf-8');

// Replace the TOP BREAKFAST RECIPES section
// Find the section and replace the grid content
const sectionStart = '<!-- Featured Breakfast Recipes -->';
const sectionEnd = '<!-- Builder CTA -->';

const startIdx = html.indexOf(sectionStart);
const endIdx = html.indexOf(sectionEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find section markers in breakfast/index.html');
  process.exit(1);
}

const newSection = `<!-- Featured Breakfast Recipes -->
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <h2 class="font-anton text-3xl uppercase">TOP BREAKFAST RECIPES</h2>
        <a href="/tools/breakfast-builder.html" class="text-brand-500 hover:text-brand-600 font-medium">Filter Recipes &rarr;</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        ${cardsHtml}
      </div>
    </div>
  </section>

  `;

html = html.substring(0, startIdx) + newSection + html.substring(endIdx);

fs.writeFileSync(BREAKFAST_INDEX, html);

console.log(`\nDone! Updated breakfast/index.html with ${recipes.length} recipe cards.`);
