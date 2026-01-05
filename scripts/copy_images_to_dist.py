#!/usr/bin/env python3
"""
Copy Images to Dist Folders

This script copies images from data/images/{site} to apps/{site}/dist/recipe_images/
for all sites in the Protein Empire.
"""

import shutil
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent

SITES = [
    ('protein-bread-com', 'protein-bread.com'),
    ('proteinbars-co', 'proteinbars.co'),
    ('proteinbites-co', 'proteinbites.co'),
    ('proteinbrownies-co', 'proteinbrownies.co'),
    ('proteincheesecake-co', 'proteincheesecake.co'),
    ('proteincookies-co', 'proteincookies.co'),
    ('proteindonuts-co', 'proteindonuts.co'),
    ('proteinoatmeal-co', 'proteinoatmeal.co'),
    ('proteinpancakes-co', 'proteinpancakes.co'),
    ('proteinpizzas-co', 'proteinpizzas.co'),
    ('proteinpudding-co', 'proteinpudding.co'),
]

def copy_images_for_site(data_folder, app_folder):
    """Copy images from data folder to app dist folder."""
    images_src = ROOT / 'data' / 'images' / data_folder
    images_dst = ROOT / 'apps' / app_folder / 'dist' / 'recipe_images'
    recipes_path = ROOT / 'data' / 'recipes' / data_folder / 'recipes.json'
    
    if not images_src.exists():
        print(f"  ⚠️  Source images folder not found: {images_src}")
        return 0
    
    if not images_dst.exists():
        images_dst.mkdir(parents=True, exist_ok=True)
    
    # Load recipes to know which images we need
    if recipes_path.exists():
        with open(recipes_path) as f:
            data = json.load(f)
            if isinstance(data, list):
                recipes = data
            else:
                recipes = data.get('recipes', [])
        recipe_slugs = {r['slug'] for r in recipes}
    else:
        recipe_slugs = set()
    
    copied = 0
    for img_file in images_src.glob('*.png'):
        # Get the recipe slug from the filename
        slug = img_file.stem
        
        # Only copy if this image corresponds to a recipe
        if slug in recipe_slugs or not recipe_slugs:
            dst_path = images_dst / img_file.name
            shutil.copy2(img_file, dst_path)
            copied += 1
    
    return copied

def main():
    print("=" * 60)
    print("COPYING IMAGES TO DIST FOLDERS")
    print("=" * 60)
    
    total_copied = 0
    
    for data_folder, app_folder in SITES:
        print(f"\n{app_folder}:")
        copied = copy_images_for_site(data_folder, app_folder)
        print(f"  ✓ Copied {copied} images")
        total_copied += copied
    
    print("\n" + "=" * 60)
    print(f"TOTAL: {total_copied} images copied to dist folders")
    print("=" * 60)

if __name__ == '__main__':
    main()
