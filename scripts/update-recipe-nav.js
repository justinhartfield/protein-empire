#!/usr/bin/env node
// Update Navigation on Breakfast Recipe Pages
// This script updates the nav to match the main site nav from index.html

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const RECIPES_DIR = path.join(ROOT_DIR, 'apps', 'highprotein.recipes', 'dist', 'breakfast', 'recipes');

// The new nav HTML (matching index.html but with 7-DAY PLAN CTA)
const NEW_NAV = `
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <a href="/" class="flex items-center gap-2">
                    <img src="/images/logo.png" alt="HighProtein.Recipes" class="h-10 w-10 rounded-full">
                    <span class="font-anton text-xl text-slate-900 dark:text-white tracking-tight uppercase">HighProtein<span class="text-brand-500">.Recipes</span></span>
                </a>

                <!-- Desktop Navigation -->
                <div class="hidden md:flex items-center gap-6">
                    <div class="relative group">
                        <button class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors flex items-center gap-1">
                            Categories
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <a href="/category-breakfast.html" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Breakfast</a>
                            <a href="/category-desserts.html" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Desserts</a>
                            <a href="/category-snacks.html" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Snacks</a>
                            <a href="/category-savory.html" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Savory</a>
                        </div>
                    </div>
                    <a href="/breakfast/" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Breakfast</a>
                    <a href="/tools/" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Tools</a>
                    <a href="/high-protein.html" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">30g+ Protein</a>

                    <!-- Dark Mode Toggle -->
                    <button
                        x-data="{ dark: document.documentElement.classList.contains('dark') }"
                        @click="dark = !dark; document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', dark ? 'dark' : 'light')"
                        class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        <svg x-show="!dark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                        </svg>
                        <svg x-show="dark" x-cloak class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                        </svg>
                    </button>

                    <a href="/pack-starter.html" class="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600 transition-colors">
                        7-DAY PLAN
                    </a>
                </div>

                <!-- Mobile Menu Button -->
                <div class="flex items-center gap-2 md:hidden">
                    <!-- Mobile Dark Mode Toggle -->
                    <button
                        x-data="{ dark: document.documentElement.classList.contains('dark') }"
                        @click="dark = !dark; document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', dark ? 'dark' : 'light')"
                        class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        <svg x-show="!dark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                        </svg>
                        <svg x-show="dark" x-cloak class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                        </svg>
                    </button>

                    <button
                        x-data="{ open: false }"
                        @click="open = !open; $dispatch('toggle-mobile-menu', { open })"
                        class="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        aria-label="Toggle menu"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div
            x-data="{ open: false }"
            @toggle-mobile-menu.window="open = $event.detail.open"
            x-show="open"
            x-cloak
            class="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"
        >
            <div class="px-4 py-4 space-y-3">
                <a href="/breakfast/" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Breakfast Hub</a>
                <a href="/tools/" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Protein Tools</a>
                <div class="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                <a href="/category-breakfast.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">All Breakfast</a>
                <a href="/category-desserts.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Desserts</a>
                <a href="/category-snacks.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Snacks</a>
                <a href="/category-savory.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Savory</a>
                <a href="/high-protein.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">30g+ Protein</a>
                <a href="/pack-starter.html" class="block bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold text-center">
                    7-DAY PLAN
                </a>
            </div>
        </div>
    </nav>

    <!-- Spacer for fixed nav -->
    <div class="h-16"></div>
`;

function updateRecipeNav(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');

  // Remove the old nav and sub-nav, keep everything from <main onwards
  // Pattern: from <!-- Navigation --> to just before <!-- Breadcrumb -->

  // First, find where main content starts (the Breadcrumb)
  const breadcrumbIndex = html.indexOf('<!-- Breadcrumb -->');
  if (breadcrumbIndex === -1) {
    console.log(`    Warning: No breadcrumb found, skipping`);
    return html;
  }

  // Find start of body content after </head><body...>
  const bodyMatch = html.match(/<body[^>]*>/);
  if (!bodyMatch) {
    console.log(`    Warning: No body tag found, skipping`);
    return html;
  }
  const bodyEndIndex = html.indexOf(bodyMatch[0]) + bodyMatch[0].length;

  // Build new HTML: everything before body end + new nav + main with breadcrumb onwards
  const beforeBody = html.substring(0, bodyEndIndex);
  const fromBreadcrumb = html.substring(breadcrumbIndex);

  // We need to wrap from breadcrumb in <main class="pt-16"> but the old HTML has <main class="pt-32">
  // Let's adjust - the new nav uses h-16 spacer so main should use pt-16 not pt-32
  let mainContent = fromBreadcrumb.replace('<main class="pt-32">', '<main class="flex-grow">');

  // The breadcrumb needs to be inside main, let's fix the structure
  // Current structure: <!-- Breadcrumb --> <div>...</div> then more sections
  // We need: <main class="flex-grow"> <!-- Breadcrumb --> ...

  const newHtml = beforeBody + NEW_NAV + `
    <main class="flex-grow">
        ` + fromBreadcrumb.replace(/<main class="pt-32">[\s\S]*?<!-- Breadcrumb -->/, '<!-- Breadcrumb -->');

  return newHtml;
}

// Main execution
console.log('Updating navigation on breakfast recipe pages...\n');

const recipeDirs = fs.readdirSync(RECIPES_DIR).filter(dir => {
  const stat = fs.statSync(path.join(RECIPES_DIR, dir));
  return stat.isDirectory();
});

let updated = 0;
for (const dir of recipeDirs) {
  const filePath = path.join(RECIPES_DIR, dir, 'index.html');
  if (fs.existsSync(filePath)) {
    console.log(`  Updating: ${dir}/index.html`);
    const updatedHtml = updateRecipeNav(filePath);
    fs.writeFileSync(filePath, updatedHtml);
    updated++;
  }
}

console.log(`\nDone! Updated ${updated} recipe pages with new navigation.`);
