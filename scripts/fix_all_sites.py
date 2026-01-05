#!/usr/bin/env python3
"""
Fix All Sites - Analyze and apply image fixes for all Protein Empire sites

This script:
1. Analyzes unique images per site
2. Identifies which recipes need images
3. Reports what needs to be generated
"""

import hashlib
import json
import shutil
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).parent.parent

SITES = [
    'protein-bread-com',
    'proteinbars-co',
    'proteinbites-co', 
    'proteinbrownies-co',
    'proteincheesecake-co',  # Already fixed
    'proteincookies-co',
    'proteindonuts-co',
    'proteinoatmeal-co',
    'proteinpancakes-co',
    'proteinpizzas-co',
    'proteinpudding-co'
]

def get_file_hash(filepath):
    """Get MD5 hash of a file."""
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def analyze_site(site):
    """Analyze a site and return info about images and recipes."""
    images_dir = ROOT / 'data' / 'images' / site
    recipes_path = ROOT / 'data' / 'recipes' / site / 'recipes.json'
    
    if not images_dir.exists() or not recipes_path.exists():
        return None
    
    # Load recipes
    with open(recipes_path) as f:
        data = json.load(f)
        if isinstance(data, list):
            recipes = data
        else:
            recipes = data.get('recipes', [])
    
    # Get unique recipes (remove duplicates)
    unique_recipes = {}
    for r in recipes:
        slug = r['slug']
        if slug not in unique_recipes:
            unique_recipes[slug] = r
    
    # Get unique images (by hash)
    hash_to_files = defaultdict(list)
    for img_file in images_dir.glob('*.png'):
        file_hash = get_file_hash(img_file)
        hash_to_files[file_hash].append(img_file.name)
    
    # Get all image filenames
    all_images = {f.name for f in images_dir.glob('*.png')}
    
    # Check which recipes have matching images
    recipes_with_images = []
    recipes_without_images = []
    
    for slug in unique_recipes:
        expected_image = f"{slug}.png"
        if expected_image in all_images:
            recipes_with_images.append(slug)
        else:
            recipes_without_images.append(slug)
    
    return {
        'site': site,
        'total_recipes': len(unique_recipes),
        'unique_images': len(hash_to_files),
        'total_image_files': len(all_images),
        'recipes_with_images': recipes_with_images,
        'recipes_without_images': recipes_without_images,
        'hash_to_files': dict(hash_to_files),
        'recipes': unique_recipes
    }

def get_duplicate_groups(site_analysis):
    """Get groups of duplicate images (same content, different names)."""
    duplicates = {}
    for h, files in site_analysis['hash_to_files'].items():
        if len(files) > 1:
            duplicates[h] = files
    return duplicates

def main():
    print("=" * 80)
    print("PROTEIN EMPIRE - ALL SITES ANALYSIS")
    print("=" * 80)
    
    all_missing = []
    
    for site in SITES:
        analysis = analyze_site(site)
        if not analysis:
            print(f"\n{site}: No data found")
            continue
        
        print(f"\n{site}:")
        print(f"  Recipes: {analysis['total_recipes']}")
        print(f"  Unique images: {analysis['unique_images']}")
        print(f"  Total image files: {analysis['total_image_files']}")
        print(f"  Recipes with images: {len(analysis['recipes_with_images'])}")
        print(f"  Recipes WITHOUT images: {len(analysis['recipes_without_images'])}")
        
        if analysis['recipes_without_images']:
            print(f"  Missing images for:")
            for slug in analysis['recipes_without_images']:
                print(f"    - {slug}")
                all_missing.append((site, slug))
    
    print("\n" + "=" * 80)
    print("SUMMARY - ALL MISSING IMAGES")
    print("=" * 80)
    print(f"Total recipes needing new images: {len(all_missing)}")
    
    # Group by site
    by_site = defaultdict(list)
    for site, slug in all_missing:
        by_site[site].append(slug)
    
    for site, slugs in by_site.items():
        print(f"\n{site} ({len(slugs)} missing):")
        for slug in slugs:
            print(f"  - {slug}")

if __name__ == '__main__':
    main()
