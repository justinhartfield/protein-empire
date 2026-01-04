/**
 * PDF Recipe Pack Generator for the Protein Empire
 * 
 * Generates printable PDF recipe packs with:
 * - Cover page with branding
 * - Table of contents
 * - Full recipe pages with nutrition
 * - Combined shopping list
 * - Pro tips page
 * 
 * Uses Puppeteer for HTML-to-PDF conversion.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * Generate a PDF recipe pack
 * @param {Object} options - Generation options
 * @param {Object} options.site - Site configuration
 * @param {Object} options.pack - Pack configuration
 * @param {Array} options.recipes - Array of recipe objects
 * @param {string} options.outputPath - Output file path
 */
export async function generatePDF(options) {
  const { site, pack, recipes, outputPath } = options;
  
  // Generate HTML content
  const html = generateHTML(site, pack, recipes);
  
  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // Generate PDF
  await page.pdf({
    path: outputPath,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
      right: '0.5in'
    }
  });
  
  await browser.close();
  
  console.log(`  ✓ Generated: ${path.basename(outputPath)}`);
}

/**
 * Generate HTML for the PDF
 */
function generateHTML(site, pack, recipes) {
  const brandColor = site.brandColor || '#f59e0b';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1e293b;
    }
    
    .page {
      page-break-after: always;
      min-height: 100vh;
      padding: 0.5in;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    /* Cover Page */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, ${brandColor}22, ${brandColor}11);
    }
    
    .cover-icon {
      font-size: 72pt;
      margin-bottom: 24pt;
    }
    
    .cover-title {
      font-size: 28pt;
      font-weight: 700;
      color: ${brandColor};
      margin-bottom: 12pt;
      text-transform: uppercase;
    }
    
    .cover-subtitle {
      font-size: 14pt;
      color: #64748b;
      margin-bottom: 24pt;
    }
    
    .cover-site {
      font-size: 12pt;
      color: #94a3b8;
      margin-top: auto;
      padding-top: 48pt;
    }
    
    /* Table of Contents */
    .toc h2 {
      font-size: 18pt;
      color: ${brandColor};
      margin-bottom: 24pt;
      text-transform: uppercase;
    }
    
    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 8pt 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .toc-protein {
      background: ${brandColor};
      color: white;
      padding: 2pt 8pt;
      border-radius: 4pt;
      font-weight: 600;
      font-size: 10pt;
    }
    
    /* Recipe Page */
    .recipe-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16pt;
      padding-bottom: 16pt;
      border-bottom: 2px solid ${brandColor};
    }
    
    .recipe-title {
      font-size: 18pt;
      font-weight: 700;
      color: #1e293b;
    }
    
    .recipe-protein-badge {
      background: ${brandColor};
      color: white;
      padding: 4pt 12pt;
      border-radius: 6pt;
      font-weight: 700;
      font-size: 14pt;
    }
    
    .recipe-meta {
      display: flex;
      gap: 24pt;
      margin-bottom: 16pt;
      color: #64748b;
      font-size: 10pt;
    }
    
    .nutrition-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8pt;
      margin-bottom: 24pt;
    }
    
    .nutrition-item {
      background: #f8fafc;
      padding: 8pt;
      border-radius: 6pt;
      text-align: center;
    }
    
    .nutrition-value {
      font-size: 16pt;
      font-weight: 700;
      color: #1e293b;
    }
    
    .nutrition-label {
      font-size: 9pt;
      color: #64748b;
      text-transform: uppercase;
    }
    
    .recipe-columns {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 24pt;
    }
    
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: ${brandColor};
      text-transform: uppercase;
      margin-bottom: 12pt;
    }
    
    .ingredient-list {
      list-style: none;
    }
    
    .ingredient-list li {
      display: flex;
      justify-content: space-between;
      padding: 4pt 0;
      border-bottom: 1px dotted #e2e8f0;
    }
    
    .ingredient-amount {
      font-family: monospace;
      color: #64748b;
    }
    
    .instruction-list {
      list-style: none;
      counter-reset: step;
    }
    
    .instruction-list li {
      counter-increment: step;
      padding: 6pt 0;
      padding-left: 24pt;
      position: relative;
    }
    
    .instruction-list li::before {
      content: counter(step);
      position: absolute;
      left: 0;
      width: 18pt;
      height: 18pt;
      background: ${brandColor};
      color: white;
      border-radius: 50%;
      font-size: 10pt;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Shopping List */
    .shopping-list h2 {
      font-size: 18pt;
      color: ${brandColor};
      margin-bottom: 24pt;
      text-transform: uppercase;
    }
    
    .shopping-category {
      margin-bottom: 16pt;
    }
    
    .shopping-category h3 {
      font-size: 11pt;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 8pt;
      padding-bottom: 4pt;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .shopping-item {
      display: flex;
      align-items: center;
      gap: 8pt;
      padding: 4pt 0;
    }
    
    .checkbox {
      width: 12pt;
      height: 12pt;
      border: 1.5pt solid #cbd5e1;
      border-radius: 2pt;
    }
    
    /* Tips Page */
    .tips h2 {
      font-size: 18pt;
      color: ${brandColor};
      margin-bottom: 24pt;
      text-transform: uppercase;
    }
    
    .tip-card {
      background: #f8fafc;
      padding: 16pt;
      border-radius: 8pt;
      margin-bottom: 12pt;
    }
    
    .tip-card h3 {
      font-size: 12pt;
      color: #1e293b;
      margin-bottom: 8pt;
    }
    
    .tip-card p {
      color: #64748b;
      font-size: 10pt;
    }
    
    /* Back Page */
    .back-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    
    .back-page h2 {
      font-size: 24pt;
      color: ${brandColor};
      margin-bottom: 16pt;
    }
    
    .back-page p {
      color: #64748b;
      margin-bottom: 24pt;
    }
    
    .back-page .url {
      font-size: 14pt;
      color: ${brandColor};
      font-weight: 600;
    }
  </style>
</head>
<body>

<!-- Cover Page -->
<div class="page cover">
  <div class="cover-icon">${pack.icon || '📚'}</div>
  <h1 class="cover-title">${pack.title}</h1>
  <p class="cover-subtitle">${pack.description}</p>
  <p class="cover-subtitle">${recipes.length} Macro-Verified Recipes</p>
  <p class="cover-site">${site.name} | ${site.domain}</p>
</div>

<!-- Table of Contents -->
<div class="page toc">
  <h2>What's Inside</h2>
  ${recipes.map((r, i) => `
    <div class="toc-item">
      <span>${i + 1}. ${r.title}</span>
      <span class="toc-protein">${r.nutrition.protein}g protein</span>
    </div>
  `).join('')}
  <div class="toc-item" style="margin-top: 24pt;">
    <span>Shopping List</span>
  </div>
  <div class="toc-item">
    <span>Pro Tips</span>
  </div>
</div>

<!-- Recipe Pages -->
${recipes.map(recipe => `
<div class="page recipe">
  <div class="recipe-header">
    <h1 class="recipe-title">${recipe.title}</h1>
    <span class="recipe-protein-badge">${recipe.nutrition.protein}g</span>
  </div>
  
  <div class="recipe-meta">
    <span>Prep: ${recipe.prepTime} min</span>
    <span>Cook: ${recipe.cookTime} min</span>
    <span>Total: ${recipe.totalTime} min</span>
    <span>Yield: ${recipe.yield} ${site.foodTypePlural}</span>
    <span>Difficulty: ${recipe.difficulty}</span>
  </div>
  
  <div class="nutrition-grid">
    <div class="nutrition-item">
      <div class="nutrition-value">${recipe.nutrition.calories}</div>
      <div class="nutrition-label">Calories</div>
    </div>
    <div class="nutrition-item">
      <div class="nutrition-value" style="color: ${brandColor}">${recipe.nutrition.protein}g</div>
      <div class="nutrition-label">Protein</div>
    </div>
    <div class="nutrition-item">
      <div class="nutrition-value">${recipe.nutrition.carbs}g</div>
      <div class="nutrition-label">Carbs</div>
    </div>
    <div class="nutrition-item">
      <div class="nutrition-value">${recipe.nutrition.fat}g</div>
      <div class="nutrition-label">Fat</div>
    </div>
  </div>
  
  <div class="recipe-columns">
    <div>
      <h3 class="section-title">Ingredients</h3>
      <ul class="ingredient-list">
        ${recipe.ingredients.map(ing => {
          // Handle both string and object ingredients
          if (typeof ing === 'string') {
            return `<li><span>${ing}</span></li>`;
          }
          return `
            <li>
              <span>${ing.name}</span>
              <span class="ingredient-amount">${ing.amount}g</span>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
    
    <div>
      <h3 class="section-title">Instructions</h3>
      <ol class="instruction-list">
        ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
      </ol>
    </div>
  </div>
</div>
`).join('')}

<!-- Shopping List -->
<div class="page shopping-list">
  <h2>Combined Shopping List</h2>
  ${generateShoppingList(recipes)}
</div>

<!-- Pro Tips -->
<div class="page tips">
  <h2>Pro Tips</h2>
  
  <div class="tip-card">
    <h3>Measure by Weight</h3>
    <p>For accurate macros, always use a kitchen scale. Volume measurements (cups, tablespoons) can vary significantly.</p>
  </div>
  
  <div class="tip-card">
    <h3>Protein Powder Tips</h3>
    <p>Different protein powders absorb liquid differently. If your batter is too thick, add liquid 1 tablespoon at a time. If too thin, add a bit more flour.</p>
  </div>
  
  <div class="tip-card">
    <h3>Storage</h3>
    <p>Store at room temperature for 2-3 days, refrigerate for up to 1 week, or freeze for up to 3 months. Thaw overnight in the fridge.</p>
  </div>
  
  <div class="tip-card">
    <h3>Meal Prep</h3>
    <p>Make a double batch on Sunday for the week ahead. Portion into containers for grab-and-go convenience.</p>
  </div>
  
  <div class="tip-card">
    <h3>Substitutions</h3>
    <p>Visit ${site.domain} for our interactive ingredient substitution tool that automatically recalculates macros when you swap ingredients.</p>
  </div>
</div>

<!-- Back Page -->
<div class="page back-page">
  <h2>Want More Recipes?</h2>
  <p>Visit us for ${recipes.length}+ more macro-verified ${site.foodType} recipes, interactive ingredient substitutions, and more free recipe packs.</p>
  <p class="url">${site.domain}</p>
</div>

</body>
</html>
`;
}

/**
 * Generate shopping list HTML from recipes
 */
function generateShoppingList(recipes) {
  // Aggregate ingredients by category
  const categories = {
    'Dry Ingredients': [],
    'Dairy & Eggs': [],
    'Produce': [],
    'Other': []
  };
  
  const seen = new Set();
  
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ing => {
      const name = ing.name.toLowerCase();
      if (seen.has(name)) return;
      seen.add(name);
      
      // Categorize
      if (name.includes('flour') || name.includes('oat') || name.includes('protein') || name.includes('powder') || name.includes('baking')) {
        categories['Dry Ingredients'].push(ing.name);
      } else if (name.includes('yogurt') || name.includes('egg') || name.includes('milk') || name.includes('cheese') || name.includes('butter')) {
        categories['Dairy & Eggs'].push(ing.name);
      } else if (name.includes('banana') || name.includes('apple') || name.includes('pumpkin') || name.includes('berry') || name.includes('lemon')) {
        categories['Produce'].push(ing.name);
      } else {
        categories['Other'].push(ing.name);
      }
    });
  });
  
  let html = '';
  Object.entries(categories).forEach(([cat, items]) => {
    if (items.length === 0) return;
    html += `
      <div class="shopping-category">
        <h3>${cat}</h3>
        ${items.map(item => `
          <div class="shopping-item">
            <div class="checkbox"></div>
            <span>${item}</span>
          </div>
        `).join('')}
      </div>
    `;
  });
  
  return html;
}

export default { generatePDF };
