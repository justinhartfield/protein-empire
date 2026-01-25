#!/usr/bin/env node
// Add Dark Mode Support to Breakfast Recipe Pages
// This script adds dark mode support to all breakfast recipe pages at:
// apps/highprotein.recipes/dist/breakfast/recipes/{slug}/index.html

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const RECIPES_DIR = path.join(ROOT_DIR, 'apps', 'highprotein.recipes', 'dist', 'breakfast', 'recipes');

function addDarkModeToRecipe(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');

  // 1. Add darkMode: 'class' to Tailwind config
  html = html.replace(
    /tailwind\.config\s*=\s*\{\s*\n\s*theme:/,
    `tailwind.config = {\n            darkMode: 'class',\n            theme:`
  );

  // 2. Add dark mode initialization script after </title>
  const darkModeScript = `
    <!-- Dark Mode: Apply before page renders to prevent flash -->
    <script>
    (function(){
      var s = localStorage.getItem('theme');
      var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (s === 'dark' || (!s && d)) document.documentElement.classList.add('dark');
    })();
    </script>`;

  if (!html.includes("localStorage.getItem('theme')")) {
    html = html.replace(
      /<\/title>/,
      `</title>\n${darkModeScript}`
    );
  }

  // 3. Update glass-nav style for dark mode
  html = html.replace(
    '.glass-nav { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); }',
    `.glass-nav { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); }
        .dark .glass-nav { background: rgba(15, 23, 42, 0.9); }`
  );

  // 4. Update body class for dark mode
  html = html.replace(
    '<body class="min-h-screen bg-slate-50 text-slate-900 font-sans">',
    '<body class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">'
  );

  // 5. Add dark mode toggle button to nav (after the brand link)
  const darkModeToggle = `
                    <!-- Dark Mode Toggle -->
                    <button
                        x-data="{ dark: document.documentElement.classList.contains('dark') }"
                        @click="dark = !dark; document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', dark ? 'dark' : 'light')"
                        class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        <svg x-show="!dark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                        </svg>
                        <svg x-show="dark" x-cloak class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                    </button>`;

  if (!html.includes('Toggle dark mode')) {
    html = html.replace(
      '<div class="hidden md:flex items-center space-x-8">',
      `<div class="hidden md:flex items-center space-x-8">${darkModeToggle}`
    );
  }

  // 6. Update nav for dark mode
  html = html.replace(
    'class="glass-nav fixed top-0 left-0 right-0 z-50 border-b border-slate-200"',
    'class="glass-nav fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-700"'
  );

  html = html.replace(
    'class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider"',
    'class="text-slate-600 dark:text-slate-300 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider"'
  );

  // 7. Update sub-nav for dark mode
  html = html.replace(
    '<div class="bg-white border-b border-slate-200 fixed top-20 left-0 right-0 z-40">',
    '<div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 fixed top-20 left-0 right-0 z-40">'
  );

  // 8. Update breadcrumb for dark mode
  html = html.replace(
    '<!-- Breadcrumb -->\n        <div class="bg-white border-b border-slate-200">',
    '<!-- Breadcrumb -->\n        <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">'
  );

  html = html.replace(
    '<span class="text-slate-900">',
    '<span class="text-slate-900 dark:text-white">'
  );

  // 9. Update recipe header section
  html = html.replace(
    '<!-- Recipe Header -->\n        <section class="bg-white py-8 lg:py-12">',
    '<!-- Recipe Header -->\n        <section class="bg-white dark:bg-slate-800 py-8 lg:py-12">'
  );

  // 10. Update quick stats boxes
  html = html.replace(
    /class="text-center p-4 bg-slate-100 rounded-xl"/g,
    'class="text-center p-4 bg-slate-100 dark:bg-slate-700 rounded-xl"'
  );

  html = html.replace(
    /class="text-2xl font-bold text-slate-900"/g,
    'class="text-2xl font-bold text-slate-900 dark:text-white"'
  );

  // 11. Update nutrition panel in header
  html = html.replace(
    '<div class="bg-slate-100 rounded-xl p-6">',
    '<div class="bg-slate-100 dark:bg-slate-700 rounded-xl p-6">'
  );

  // 12. Update meal prep section if exists
  html = html.replace(
    '<section class="py-8 bg-blue-50">',
    '<section class="py-8 bg-blue-50 dark:bg-slate-800">'
  );

  html = html.replace(
    /class="bg-white rounded-xl p-6 shadow-sm"/g,
    'class="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-sm"'
  );

  // 13. Update recipe content section
  html = html.replace(
    '<!-- Recipe Content with Interactive Ingredients -->\n        <section class="py-12 bg-slate-50">',
    '<!-- Recipe Content with Interactive Ingredients -->\n        <section class="py-12 bg-slate-50 dark:bg-slate-900">'
  );

  // 14. Update ingredients sidebar
  html = html.replace(
    /class="bg-white rounded-2xl p-6 shadow-md sticky top-40"/g,
    'class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md sticky top-40"'
  );

  html = html.replace(
    /class="anton-text text-2xl text-slate-900"/g,
    'class="anton-text text-2xl text-slate-900 dark:text-white"'
  );

  // 15. Update nutrition facts label
  html = html.replace(
    'class="bg-white rounded-2xl border-4 border-slate-900 p-4',
    'class="bg-white dark:bg-slate-800 rounded-2xl border-4 border-slate-900 dark:border-slate-600 p-4'
  );

  // 16. Update P:E Ratio gauge box
  html = html.replace(
    /class="bg-white rounded-2xl p-6 shadow-md">\s*<div class="flex items-center justify-between mb-4">\s*<h3 class="font-bold text-slate-900/g,
    'class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md">\n                            <div class="flex items-center justify-between mb-4">\n                                <h3 class="font-bold text-slate-900 dark:text-white'
  );

  // 17. Update instructions panel
  html = html.replace(
    /class="bg-white rounded-2xl p-6 lg:p-8 shadow-md">\s*<h2 class="anton-text text-2xl text-slate-900 mb-6">INSTRUCTIONS/,
    'class="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-md">\n                            <h2 class="anton-text text-2xl text-slate-900 dark:text-white mb-6">INSTRUCTIONS'
  );

  // 18. Update step titles
  html = html.replace(
    /class="font-bold text-slate-900 mb-1"/g,
    'class="font-bold text-slate-900 dark:text-white mb-1"'
  );

  // 19. Update step descriptions
  html = html.replace(
    /class="text-slate-600">([^<]*)<\/p>\s*<\/div>\s*<\/div>/g,
    'class="text-slate-600 dark:text-slate-300">$1</p>\n                                    </div>\n                                </div>'
  );

  // 20. Update footer
  html = html.replace(
    '<footer class="bg-slate-900 text-white py-8">',
    '<footer class="bg-slate-900 dark:bg-slate-950 text-white py-8">'
  );

  // 21. Update h1 title
  html = html.replace(
    /class="anton-text text-4xl lg:text-5xl text-slate-900 mb-4">/,
    'class="anton-text text-4xl lg:text-5xl text-slate-900 dark:text-white mb-4">'
  );

  // 22. Update description text
  html = html.replace(
    /class="text-slate-600 text-lg mb-8">/,
    'class="text-slate-600 dark:text-slate-300 text-lg mb-8">'
  );

  // Additional: Fix remaining text-slate-900 in nutrition section
  html = html.replace(
    /<h3 class="font-bold text-slate-900 mb-4">Nutrition per/g,
    '<h3 class="font-bold text-slate-900 dark:text-white mb-4">Nutrition per'
  );

  html = html.replace(
    /<h3 class="font-bold text-slate-900 mb-3">/g,
    '<h3 class="font-bold text-slate-900 dark:text-white mb-3">'
  );

  return html;
}

// Main execution
console.log('Adding dark mode to breakfast recipe pages...\n');

const recipeDirs = fs.readdirSync(RECIPES_DIR).filter(dir => {
  const stat = fs.statSync(path.join(RECIPES_DIR, dir));
  return stat.isDirectory();
});

let updated = 0;
for (const dir of recipeDirs) {
  const filePath = path.join(RECIPES_DIR, dir, 'index.html');
  if (fs.existsSync(filePath)) {
    console.log(`  Updating: ${dir}/index.html`);
    const updatedHtml = addDarkModeToRecipe(filePath);
    fs.writeFileSync(filePath, updatedHtml);
    updated++;
  }
}

console.log(`\nDone! Updated ${updated} recipe pages with dark mode support.`);
