#!/usr/bin/env node
/**
 * Image Optimization Script for Protein Empire
 * 
 * This script optimizes all recipe images by:
 * 1. Converting PNG to WebP format (with JPEG fallback)
 * 2. Generating multiple sizes for responsive images
 * 3. Compressing images with optimal quality settings
 * 
 * Usage:
 *   node scripts/optimize-images.js                    # Optimize all sites
 *   node scripts/optimize-images.js proteincheesecake.co  # Optimize specific site
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Image sizes to generate
const SIZES = [
  { name: 'thumb', width: 64, height: 64 },      // Thumbnails
  { name: 'small', width: 280, height: 280 },    // Recipe cards
  { name: 'medium', width: 600, height: 600 },   // Main recipe image
  { name: 'large', width: 800, height: 800 },    // High-res display
  { name: 'og', width: 1200, height: 1200 },     // Open Graph / Social
];

// Quality settings
const WEBP_QUALITY = 82;
const JPEG_QUALITY = 85;

/**
 * Optimize a single image
 */
async function optimizeImage(inputPath, outputDir, baseName) {
  const results = [];
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`  Processing: ${baseName} (${metadata.width}x${metadata.height})`);
    
    for (const size of SIZES) {
      const webpPath = path.join(outputDir, `${baseName}-${size.name}.webp`);
      const jpgPath = path.join(outputDir, `${baseName}-${size.name}.jpg`);
      
      // Generate WebP
      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpPath);
      
      // Generate JPEG fallback
      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: JPEG_QUALITY, progressive: true })
        .toFile(jpgPath);
      
      const webpStats = fs.statSync(webpPath);
      const jpgStats = fs.statSync(jpgPath);
      
      results.push({
        size: size.name,
        webp: (webpStats.size / 1024).toFixed(1) + ' KB',
        jpg: (jpgStats.size / 1024).toFixed(1) + ' KB'
      });
    }
    
    // Also create a default webp and jpg (medium size) with original name
    const defaultWebp = path.join(outputDir, `${baseName}.webp`);
    const defaultJpg = path.join(outputDir, `${baseName}.jpg`);
    
    await sharp(inputPath)
      .resize(800, 800, { fit: 'cover', position: 'center' })
      .webp({ quality: WEBP_QUALITY })
      .toFile(defaultWebp);
    
    await sharp(inputPath)
      .resize(800, 800, { fit: 'cover', position: 'center' })
      .jpeg({ quality: JPEG_QUALITY, progressive: true })
      .toFile(defaultJpg);
    
    return { success: true, results };
  } catch (error) {
    console.error(`  ❌ Error processing ${baseName}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Optimize all images for a site
 */
async function optimizeSiteImages(domain) {
  const domainDir = domain.replace(/\./g, '-');
  const inputDir = path.join(ROOT_DIR, 'data', 'images', domainDir);
  const outputDir = path.join(ROOT_DIR, 'data', 'images-optimized', domainDir);
  
  if (!fs.existsSync(inputDir)) {
    console.log(`⚠️  No images found for ${domain}`);
    return;
  }
  
  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Get all PNG/JPG images
  const images = fs.readdirSync(inputDir).filter(f => 
    f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
  );
  
  console.log(`\n🖼️  Optimizing ${images.length} images for ${domain}...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const img of images) {
    const inputPath = path.join(inputDir, img);
    const baseName = path.basename(img, path.extname(img));
    
    const result = await optimizeImage(inputPath, outputDir, baseName);
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  // Calculate size savings
  const originalSize = images.reduce((sum, img) => {
    return sum + fs.statSync(path.join(inputDir, img)).size;
  }, 0);
  
  const optimizedFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.webp'));
  const optimizedSize = optimizedFiles.reduce((sum, img) => {
    return sum + fs.statSync(path.join(outputDir, img)).size;
  }, 0);
  
  console.log(`\n✅ ${domain} optimization complete:`);
  console.log(`   Images processed: ${successCount}/${images.length}`);
  console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Optimized size: ${(optimizedSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Savings: ${((1 - optimizedSize / originalSize) * 100).toFixed(0)}%`);
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Protein Empire - Image Optimization\n');
  console.log('='.repeat(50));
  
  const targetDomain = process.argv[2];
  
  if (targetDomain) {
    await optimizeSiteImages(targetDomain);
  } else {
    // Optimize all sites
    const imagesDir = path.join(ROOT_DIR, 'data', 'images');
    const sites = fs.readdirSync(imagesDir).filter(d => 
      fs.statSync(path.join(imagesDir, d)).isDirectory()
    );
    
    for (const site of sites) {
      const domain = site.replace(/-/g, '.');
      await optimizeSiteImages(domain);
    }
  }
  
  console.log('\n✨ Image optimization complete!');
  console.log('\nNext steps:');
  console.log('1. Update build-site.js to copy optimized images');
  console.log('2. Update HTML templates to use <picture> with srcset');
  console.log('3. Add loading="lazy" to non-LCP images');
}

main().catch(console.error);
