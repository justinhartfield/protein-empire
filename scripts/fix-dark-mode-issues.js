#!/usr/bin/env node
// Fix Dark Mode Issues on Breakfast Recipe Pages
// - P:E gauge needle visibility
// - Ingredients text contrast

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const RECIPES_DIR = path.join(ROOT_DIR, 'apps', 'highprotein.recipes', 'dist', 'breakfast', 'recipes');

function fixDarkModeIssues(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');

  // 1. Fix P:E gauge needle - change from dark slate to white with dark stroke for visibility
  // Old: <polygon points="100,30 96,100 104,100" fill="#1e293b"/>
  // New: Use a color that works in both modes - white fill with dark stroke
  html = html.replace(
    /<polygon points="100,30 96,100 104,100" fill="#1e293b"\/>/g,
    '<polygon points="100,30 96,100 104,100" fill="#f8fafc" stroke="#334155" stroke-width="1"/>'
  );

  // Fix the center circles of the needle
  html = html.replace(
    /<circle cx="100" cy="100" r="8" fill="#1e293b"\/>/g,
    '<circle cx="100" cy="100" r="8" fill="#f8fafc" stroke="#334155" stroke-width="1"/>'
  );

  // 2. Fix ingredients text - add dark mode variant
  // The ingredient name text uses text-slate-700 without dark variant
  html = html.replace(
    /: 'text-slate-700'\}/g,
    `: 'text-slate-700 dark:text-slate-300'}`
  );

  // Also fix the hover state for ingredient rows
  html = html.replace(
    /hover:bg-slate-50 rounded-lg/g,
    'hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg'
  );

  // 3. Fix the substitution dropdown background
  html = html.replace(
    /class="mt-2 bg-slate-50 rounded-xl p-3 border border-slate-200"/g,
    'class="mt-2 bg-slate-50 dark:bg-slate-700 rounded-xl p-3 border border-slate-200 dark:border-slate-600"'
  );

  // Fix dropdown option hover
  html = html.replace(
    /class="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors/g,
    'class="w-full text-left px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-colors'
  );

  // Fix dropdown option text
  html = html.replace(
    /class="text-slate-700 group-hover:text-brand-600"/g,
    'class="text-slate-700 dark:text-slate-300 group-hover:text-brand-600"'
  );

  // 4. Fix P:E explanation border color
  html = html.replace(
    /class="mt-4 pt-4 border-t border-slate-100">/g,
    'class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">'
  );

  // 5. Fix nutrition facts label border for dark mode
  html = html.replace(
    /border-b-8 border-slate-900 pb-1/g,
    'border-b-8 border-slate-900 dark:border-slate-400 pb-1'
  );

  html = html.replace(
    /border-b-8 border-slate-900 py-2/g,
    'border-b-8 border-slate-900 dark:border-slate-400 py-2'
  );

  html = html.replace(
    /border-b-8 border-slate-900 py-1/g,
    'border-b-8 border-slate-900 dark:border-slate-400 py-1'
  );

  // Fix nutrition facts smaller borders
  html = html.replace(
    /border-b border-slate-300 py-1/g,
    'border-b border-slate-300 dark:border-slate-600 py-1'
  );

  // Fix nutrition facts border-t
  html = html.replace(
    /border-t border-slate-200">/g,
    'border-t border-slate-200 dark:border-slate-600">'
  );

  return html;
}

// Main execution
console.log('Fixing dark mode issues on breakfast recipe pages...\n');

const recipeDirs = fs.readdirSync(RECIPES_DIR).filter(dir => {
  const stat = fs.statSync(path.join(RECIPES_DIR, dir));
  return stat.isDirectory();
});

let updated = 0;
for (const dir of recipeDirs) {
  const filePath = path.join(RECIPES_DIR, dir, 'index.html');
  if (fs.existsSync(filePath)) {
    console.log(`  Fixing: ${dir}/index.html`);
    const updatedHtml = fixDarkModeIssues(filePath);
    fs.writeFileSync(filePath, updatedHtml);
    updated++;
  }
}

console.log(`\nDone! Fixed ${updated} recipe pages.`);
