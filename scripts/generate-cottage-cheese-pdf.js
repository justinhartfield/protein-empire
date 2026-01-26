#!/usr/bin/env node

/**
 * Generate PDF starter pack for cottagecheeserecipes.co
 * Uses system Chrome since the puppeteer-bundled one has version issues.
 */

import puppeteer from 'puppeteer';
import { getSite } from '../packages/config/sites.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function generateHTML(site, pack, recipes) {
  const brandColor = site.brandColor || '#3b82f6';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; }
    .page { page-break-after: always; min-height: 100vh; padding: 0.5in; }
    .page:last-child { page-break-after: auto; }
    .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, ${brandColor}, #1e40af); color: white; min-height: 100vh; }
    .cover h1 { font-size: 32pt; margin-bottom: 12pt; font-weight: 700; }
    .cover .subtitle { font-size: 14pt; opacity: 0.9; margin-bottom: 24pt; }
    .cover .site-url { font-size: 11pt; opacity: 0.7; margin-top: 24pt; }
    .cover .icon { font-size: 64pt; margin-bottom: 16pt; }
    .toc h2 { font-size: 18pt; color: ${brandColor}; margin-bottom: 16pt; border-bottom: 2px solid ${brandColor}; padding-bottom: 8pt; }
    .toc-item { display: flex; justify-content: space-between; padding: 8pt 0; border-bottom: 1px dotted #cbd5e1; }
    .toc-protein { color: ${brandColor}; font-weight: 600; }
    .recipe-title { font-size: 18pt; color: ${brandColor}; margin-bottom: 8pt; font-weight: 700; }
    .recipe-meta { display: flex; gap: 16pt; margin-bottom: 12pt; color: #64748b; font-size: 9pt; }
    .nutrition-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8pt; margin-bottom: 16pt; background: #f1f5f9; padding: 12pt; border-radius: 8pt; }
    .nutrition-item { text-align: center; }
    .nutrition-value { font-size: 16pt; font-weight: 700; color: #1e293b; }
    .nutrition-label { font-size: 8pt; color: #64748b; text-transform: uppercase; }
    .section-title { font-size: 12pt; font-weight: 700; color: ${brandColor}; margin: 12pt 0 8pt; }
    .ingredient { padding: 3pt 0; border-bottom: 1px solid #f1f5f9; font-size: 10pt; }
    .instruction { margin-bottom: 8pt; font-size: 10pt; }
    .instruction strong { color: ${brandColor}; }
    .shopping-category { margin-bottom: 12pt; }
    .shopping-category h3 { color: ${brandColor}; font-size: 11pt; margin-bottom: 4pt; }
    .shopping-item { padding: 2pt 0; font-size: 10pt; }
    .back-page { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; min-height: 100vh; }
    .back-page h2 { font-size: 20pt; color: ${brandColor}; margin-bottom: 12pt; }
    .back-page p { font-size: 12pt; color: #64748b; margin-bottom: 8pt; }
    .back-page .url { font-size: 14pt; color: ${brandColor}; font-weight: 700; }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page cover">
    <div class="icon">${pack.icon}</div>
    <h1>${pack.title}</h1>
    <div class="subtitle">${pack.description}</div>
    <div class="subtitle">${recipes.length} Macro-Verified Recipes</div>
    <div class="site-url">cottagecheeserecipes.co</div>
  </div>

  <!-- Table of Contents -->
  <div class="page toc">
    <h2>What's Inside</h2>
    ${recipes.map((r, i) => `
      <div class="toc-item">
        <span>${i + 1}. ${r.title}</span>
        <span class="toc-protein">${r.protein}g protein</span>
      </div>
    `).join('')}
    <div class="toc-item" style="margin-top: 16pt;">
      <span>📋 Combined Shopping List</span>
    </div>
  </div>

  <!-- Recipe Pages -->
  ${recipes.map(recipe => `
    <div class="page">
      <div class="recipe-title">${recipe.title}</div>
      <div class="recipe-meta">
        <span>⏱ Prep: ${recipe.prepTime}min</span>
        <span>🔥 Cook: ${recipe.cookTime}min</span>
        <span>📊 Total: ${recipe.totalTime}min</span>
        <span>🍽 Yield: ${recipe.yield}</span>
        <span>⚡ ${recipe.difficulty}</span>
      </div>
      
      <div class="nutrition-grid">
        <div class="nutrition-item">
          <div class="nutrition-value">${recipe.calories}</div>
          <div class="nutrition-label">Calories</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-value" style="color: ${brandColor}">${recipe.protein}g</div>
          <div class="nutrition-label">Protein</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-value">${recipe.carbs}g</div>
          <div class="nutrition-label">Carbs</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-value">${recipe.fat}g</div>
          <div class="nutrition-label">Fat</div>
        </div>
      </div>
      
      <div class="section-title">Ingredients</div>
      ${recipe.ingredients.map(ing => `<div class="ingredient">• ${typeof ing === 'string' ? ing : ing.amount + ' ' + ing.name}</div>`).join('')}
      
      <div class="section-title">Instructions</div>
      ${recipe.instructions.map((inst, i) => `
        <div class="instruction"><strong>Step ${i + 1}: ${inst.step}</strong> — ${inst.text}</div>
      `).join('')}
      
      <div style="margin-top: 12pt; padding: 8pt; background: #f0f9ff; border-radius: 4pt; font-size: 9pt; color: #64748b;">
        Per serving (${recipe.servingSize}): ${recipe.calories} cal | ${recipe.protein}g protein | ${recipe.carbs}g carbs | ${recipe.fat}g fat
      </div>
    </div>
  `).join('')}

  <!-- Shopping List -->
  <div class="page">
    <h2 style="font-size: 18pt; color: ${brandColor}; margin-bottom: 16pt;">📋 Combined Shopping List</h2>
    <p style="font-size: 9pt; color: #64748b; margin-bottom: 16pt;">Everything you need to make all ${recipes.length} recipes in this pack.</p>
    ${generateShoppingList(recipes)}
  </div>

  <!-- Back Page -->
  <div class="page back-page">
    <h2>Want More Recipes?</h2>
    <p>Visit us for 30+ macro-verified cottage cheese recipes!</p>
    <p class="url">cottagecheeserecipes.co</p>
    <p style="margin-top: 24pt; font-size: 10pt; color: #94a3b8;">Pancakes • Breakfast • Bread • Desserts • Pizza • Snacks</p>
  </div>
</body>
</html>`;
}

function generateShoppingList(recipes) {
  const categories = {
    'Dairy & Eggs': [],
    'Dry Ingredients': [],
    'Produce': [],
    'Other': []
  };
  
  const seen = new Set();
  
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ing => {
      const name = typeof ing === 'string' ? ing : `${ing.amount} ${ing.name}`;
      const lower = name.toLowerCase();
      
      // Extract just the ingredient name (remove amounts)
      const nameOnly = lower.replace(/^[\d.]+\s*\w*\s+/, '').trim();
      if (seen.has(nameOnly)) return;
      seen.add(nameOnly);
      
      if (lower.includes('egg') || lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || lower.includes('butter') || lower.includes('cream')) {
        categories['Dairy & Eggs'].push(name);
      } else if (lower.includes('flour') || lower.includes('oat') || lower.includes('protein') || lower.includes('powder') || lower.includes('baking') || lower.includes('sugar') || lower.includes('salt') || lower.includes('cocoa')) {
        categories['Dry Ingredients'].push(name);
      } else if (lower.includes('banana') || lower.includes('berry') || lower.includes('blueberry') || lower.includes('fruit') || lower.includes('lemon') || lower.includes('spinach') || lower.includes('pepper') || lower.includes('tomato') || lower.includes('pumpkin')) {
        categories['Produce'].push(name);
      } else {
        categories['Other'].push(name);
      }
    });
  });
  
  return Object.entries(categories)
    .filter(([_, items]) => items.length > 0)
    .map(([cat, items]) => `
      <div class="shopping-category">
        <h3>${cat}</h3>
        ${items.map(item => `<div class="shopping-item">☐ ${item}</div>`).join('')}
      </div>
    `).join('');
}

async function main() {
  const domain = 'cottagecheeserecipes.co';
  const site = getSite(domain);
  
  const recipesData = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/recipes/cottagecheeserecipes-co/recipes.json'), 'utf-8')
  );
  const packs = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/recipes/cottagecheeserecipes-co/packs.json'), 'utf-8')
  );
  
  const starterPack = packs.find(p => p.slug === 'starter');
  if (!starterPack) {
    console.error('Starter pack not found!');
    process.exit(1);
  }
  
  const packRecipes = starterPack.recipes
    .map(slug => recipesData.recipes.find(r => r.slug === slug))
    .filter(Boolean);
  
  console.log(`📦 Generating PDF for "${starterPack.title}" with ${packRecipes.length} recipes...`);
  
  const outputDir = path.join(ROOT, 'apps', domain, 'dist', 'downloads');
  fs.mkdirSync(outputDir, { recursive: true });
  
  const outputPath = path.join(outputDir, 'cottage-cheese-starter-pack.pdf');
  
  const html = generateHTML(site, starterPack, packRecipes);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: outputPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
  });
  
  await browser.close();
  
  const size = fs.statSync(outputPath).size;
  console.log(`✅ PDF saved to: ${outputPath} (${(size / 1024).toFixed(0)}KB)`);
}

main().catch(console.error);
