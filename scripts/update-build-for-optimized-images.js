#!/usr/bin/env node
/**
 * Update build-site.js to use optimized images
 * 
 * This script patches the build process to:
 * 1. Copy optimized images instead of originals
 * 2. Use WebP format with JPEG fallback
 * 3. Add responsive srcset attributes
 * 4. Add lazy loading for non-LCP images
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const buildSitePath = path.join(ROOT_DIR, 'scripts', 'build-site.js');

// Read the current build-site.js
let content = fs.readFileSync(buildSitePath, 'utf-8');

// Backup the original
fs.writeFileSync(buildSitePath + '.backup2', content);

// 1. Update image copying to use optimized images
const oldImageCopy = `  // Copy recipe images
  if (fs.existsSync(imagesDir)) {
    const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'));
    images.forEach(img => {
      fs.copyFileSync(path.join(imagesDir, img), path.join(outputDir, 'recipe_images', img));
    });
    console.log(\`   ✓ Copied \${images.length} recipe images\`);
  }`;

const newImageCopy = `  // Copy recipe images (prefer optimized versions)
  const optimizedImagesDir = path.join(ROOT_DIR, 'data', 'images-optimized', domain.replace(/\\./g, '-'));
  const sourceImagesDir = fs.existsSync(optimizedImagesDir) ? optimizedImagesDir : imagesDir;
  
  if (fs.existsSync(sourceImagesDir)) {
    const images = fs.readdirSync(sourceImagesDir).filter(f => 
      f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp')
    );
    images.forEach(img => {
      fs.copyFileSync(path.join(sourceImagesDir, img), path.join(outputDir, 'recipe_images', img));
    });
    const isOptimized = sourceImagesDir === optimizedImagesDir;
    console.log(\`   ✓ Copied \${images.length} recipe images\${isOptimized ? ' (optimized)' : ' (original - run optimize-images.js first)'}\`);
  }`;

content = content.replace(oldImageCopy, newImageCopy);

// 2. Update recipe card partial to use picture element with WebP
const oldRecipeCard = `<a href="/<%= recipe.slug %>.html" class="recipe-card group block bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-brand-500 hover:shadow-xl transition-all duration-300">
    <div class="relative aspect-square overflow-hidden">
        <img src="/recipe_images/<%= recipe.slug %>.png" alt="<%= recipe.title %>" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">`;

const newRecipeCard = `<a href="/<%= recipe.slug %>.html" class="recipe-card group block bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-brand-500 hover:shadow-xl transition-all duration-300">
    <div class="relative aspect-square overflow-hidden">
        <picture>
            <source type="image/webp" srcset="/recipe_images/<%= recipe.slug %>-small.webp 280w, /recipe_images/<%= recipe.slug %>-medium.webp 600w, /recipe_images/<%= recipe.slug %>.webp 800w" sizes="(max-width: 640px) 280px, 280px">
            <img src="/recipe_images/<%= recipe.slug %>.jpg" alt="<%= recipe.title %>" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width="280" height="280">
        </picture>`;

content = content.replace(oldRecipeCard, newRecipeCard);

// 3. Update main recipe image to use picture element
const oldMainImage = `<img src="/recipe_images/<%= recipe.slug %>.png" alt="<%= recipe.title %>" class="w-full h-full object-cover" width="800" height="800">`;

const newMainImage = `<picture>
                            <source type="image/webp" srcset="/recipe_images/<%= recipe.slug %>-medium.webp 600w, /recipe_images/<%= recipe.slug %>-large.webp 800w, /recipe_images/<%= recipe.slug %>-og.webp 1200w" sizes="(max-width: 768px) 600px, 800px">
                            <img src="/recipe_images/<%= recipe.slug %>.jpg" alt="<%= recipe.title %>" class="w-full h-full object-cover" width="800" height="800">
                        </picture>`;

content = content.replace(oldMainImage, newMainImage);

// 4. Update sidebar thumbnails to use optimized images with lazy loading
const oldSidebarThumb = `<img src="/recipe_images/<%= r.slug %>.png" alt="<%= r.title %>" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=text-2xl><%= site.emoji || '🍪' %></span>'">`;

const newSidebarThumb = `<picture>
                                            <source type="image/webp" srcset="/recipe_images/<%= r.slug %>-thumb.webp">
                                            <img src="/recipe_images/<%= r.slug %>-thumb.jpg" alt="<%= r.title %>" class="w-full h-full object-cover" loading="lazy" width="64" height="64" onerror="this.parentElement.parentElement.innerHTML='<span class=text-2xl><%= site.emoji || '🍪' %></span>'">
                                        </picture>`;

content = content.replace(oldSidebarThumb, newSidebarThumb);

// 5. Update pack page thumbnails
const oldPackThumb = `<img src="/recipe_images/<%= recipe.slug %>.png" alt="<%= recipe.title %>" class="w-20 h-20 rounded-lg object-cover">`;

const newPackThumb = `<picture>
                            <source type="image/webp" srcset="/recipe_images/<%= recipe.slug %>-thumb.webp">
                            <img src="/recipe_images/<%= recipe.slug %>-thumb.jpg" alt="<%= recipe.title %>" class="w-20 h-20 rounded-lg object-cover" loading="lazy" width="80" height="80">
                        </picture>`;

content = content.replace(oldPackThumb, newPackThumb);

// 6. Update OG image references to use optimized version
content = content.replace(
  /ogImage: '\/recipe_images\/' \+ recipe\.slug \+ '\.png'/g,
  "ogImage: '/recipe_images/' + recipe.slug + '-og.webp'"
);

content = content.replace(
  /ogImage: '\/recipe_images\/' \+ (filteredRecipes|packRecipes)\[0\]\.slug \+ '\.png'/g,
  "ogImage: '/recipe_images/' + $1[0].slug + '-og.webp'"
);

// 7. Update preload to use optimized image
content = content.replace(
  /preloadImage: '\/recipe_images\/' \+ recipe\.slug \+ '\.png'/g,
  "preloadImage: '/recipe_images/' + recipe.slug + '-medium.webp'"
);

content = content.replace(
  /preloadImage: (filteredRecipes|recipes)\[0\] \? '\/recipe_images\/' \+ \1\[0\]\.slug \+ '\.png' : null/g,
  "preloadImage: $1[0] ? '/recipe_images/' + $1[0].slug + '-medium.webp' : null"
);

// 8. Update schema.org image reference
content = content.replace(
  /"image": \["https:\/\/<%= site\.domain %>\/recipe_images\/<%= recipe\.slug %>\.png"\]/g,
  '"image": ["https://<%= site.domain %>/recipe_images/<%= recipe.slug %>-og.webp", "https://<%= site.domain %>/recipe_images/<%= recipe.slug %>.jpg"]'
);

// Write the updated file
fs.writeFileSync(buildSitePath, content);

console.log('✅ build-site.js has been updated for optimized images!');
console.log('');
console.log('Changes made:');
console.log('  1. Image copying now prefers optimized images from data/images-optimized/');
console.log('  2. Recipe cards use <picture> with WebP and responsive srcset');
console.log('  3. Main recipe images use <picture> with multiple sizes');
console.log('  4. Thumbnails use optimized thumb size with lazy loading');
console.log('  5. OG images use optimized 1200px version');
console.log('  6. Preload uses medium WebP for faster LCP');
console.log('');
console.log('Next steps:');
console.log('  1. Run: node scripts/optimize-images.js');
console.log('  2. Run: node scripts/build-site.js <domain>');
console.log('  3. Deploy to Netlify');
