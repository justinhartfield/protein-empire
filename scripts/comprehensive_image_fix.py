#!/usr/bin/env python3
"""
Comprehensive Image Fix for Protein Empire Sites

This script:
1. Identifies all unique images per site
2. Maps each unique image to the recipe it best matches (based on filename keywords)
3. Generates a list of recipes that need new images
4. Creates properly named image files for each recipe
"""

import hashlib
import json
import shutil
from pathlib import Path
from collections import defaultdict
import re

ROOT = Path(__file__).parent.parent

SITES = [
    'protein-bread-com',
    'proteinbars-co',
    'proteinbites-co', 
    'proteinbrownies-co',
    'proteincheesecake-co',
    'proteincookies-co',
    'proteindonuts-co',
    'proteinoatmeal-co',
    'proteinpancakes-co',
    'proteinpizzas-co',
    'proteinpudding-co'
]

# Keywords that help identify what an image shows
FLAVOR_KEYWORDS = [
    'vanilla', 'chocolate', 'strawberry', 'blueberry', 'raspberry', 'banana',
    'peanut-butter', 'peanut', 'almond', 'walnut', 'pecan', 'hazelnut', 'nutella',
    'caramel', 'maple', 'honey', 'cinnamon', 'apple', 'pumpkin', 'gingerbread',
    'lemon', 'lime', 'orange', 'coconut', 'matcha', 'green-tea', 'coffee', 'mocha', 'espresso',
    'oreo', 'cookie', 'brownie', 's-mores', 'smores', 'funfetti', 'birthday-cake',
    'red-velvet', 'mint', 'key-lime', 'cheesecake', 'cream-cheese',
    'cherry', 'peach', 'mango', 'tropical', 'berry', 'mixed-berry',
    'oat', 'oatmeal', 'granola', 'protein', 'whey',
    'no-bake', 'baked', 'single-serving', 'mini', 'bite', 'bar', 'ball',
    'greek-yogurt', 'cottage-cheese', 'dairy-free', 'vegan', 'keto', 'gluten-free',
    'tiramisu', 'eggnog', 'snickerdoodle', 'carrot-cake'
]

def get_file_hash(filepath):
    """Get MD5 hash of a file."""
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def extract_keywords(filename):
    """Extract flavor/type keywords from a filename."""
    name = filename.lower().replace('.png', '').replace('_', '-')
    found = []
    for kw in FLAVOR_KEYWORDS:
        if kw in name:
            found.append(kw)
    return set(found)

def keyword_match_score(image_name, recipe_slug):
    """Calculate how well an image name matches a recipe slug based on keywords."""
    img_keywords = extract_keywords(image_name)
    recipe_keywords = extract_keywords(recipe_slug)
    
    if not img_keywords or not recipe_keywords:
        return 0
    
    # Count matching keywords
    matches = img_keywords & recipe_keywords
    
    # Bonus for exact match
    if image_name.replace('.png', '') == recipe_slug:
        return 100
    
    # Score based on keyword overlap
    return len(matches) * 10

def find_best_image_for_recipe(recipe_slug, unique_images, used_images):
    """Find the best matching unique image for a recipe."""
    best_score = -1
    best_image = None
    
    for img_hash, img_names in unique_images.items():
        # Skip if already used
        if img_hash in used_images:
            continue
        
        # Use the first filename in the group for matching
        canonical_name = sorted(img_names)[0]
        
        score = keyword_match_score(canonical_name, recipe_slug)
        if score > best_score:
            best_score = score
            best_image = (img_hash, canonical_name)
    
    return best_image, best_score

def analyze_and_fix_site(site, dry_run=True):
    """Analyze and fix image mappings for a single site."""
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
    
    # Get unique images (by hash)
    hash_to_files = defaultdict(list)
    file_to_hash = {}
    for img_file in images_dir.glob('*.png'):
        file_hash = get_file_hash(img_file)
        hash_to_files[file_hash].append(img_file.name)
        file_to_hash[img_file.name] = file_hash
    
    # Create mapping: recipe_slug -> best matching image hash
    recipe_to_image = {}
    used_images = set()
    unmatched_recipes = []
    
    # First pass: exact matches
    for recipe in recipes:
        slug = recipe['slug']
        expected_image = f"{slug}.png"
        
        if expected_image in file_to_hash:
            img_hash = file_to_hash[expected_image]
            # Check if this hash is already used
            if img_hash not in used_images:
                recipe_to_image[slug] = {
                    'hash': img_hash,
                    'source_file': expected_image,
                    'match_type': 'exact'
                }
                used_images.add(img_hash)
    
    # Second pass: keyword matching for remaining recipes
    for recipe in recipes:
        slug = recipe['slug']
        if slug in recipe_to_image:
            continue
        
        best_image, score = find_best_image_for_recipe(slug, hash_to_files, used_images)
        
        if best_image and score > 0:
            img_hash, source_file = best_image
            recipe_to_image[slug] = {
                'hash': img_hash,
                'source_file': source_file,
                'match_type': 'keyword',
                'score': score
            }
            used_images.add(img_hash)
        else:
            unmatched_recipes.append(slug)
    
    # Third pass: assign remaining images to unmatched recipes
    remaining_hashes = set(hash_to_files.keys()) - used_images
    for i, slug in enumerate(unmatched_recipes[:]):
        if remaining_hashes:
            img_hash = remaining_hashes.pop()
            source_file = hash_to_files[img_hash][0]
            recipe_to_image[slug] = {
                'hash': img_hash,
                'source_file': source_file,
                'match_type': 'fallback'
            }
            used_images.add(img_hash)
            unmatched_recipes.remove(slug)
    
    return {
        'site': site,
        'total_recipes': len(recipes),
        'unique_images': len(hash_to_files),
        'matched_recipes': len(recipe_to_image),
        'unmatched_recipes': unmatched_recipes,
        'recipe_to_image': recipe_to_image,
        'hash_to_files': dict(hash_to_files)
    }

def apply_fix(site_analysis, dry_run=True):
    """Apply the image fix for a site."""
    site = site_analysis['site']
    images_dir = ROOT / 'data' / 'images' / site
    recipe_to_image = site_analysis['recipe_to_image']
    hash_to_files = site_analysis['hash_to_files']
    
    changes = []
    
    # Create a backup directory
    backup_dir = images_dir.parent / f"{site}_backup"
    if not dry_run and not backup_dir.exists():
        shutil.copytree(images_dir, backup_dir)
        changes.append(f"Created backup at {backup_dir}")
    
    # For each recipe, ensure the correct image exists with the correct name
    for recipe_slug, mapping in recipe_to_image.items():
        target_filename = f"{recipe_slug}.png"
        source_file = mapping['source_file']
        
        if source_file != target_filename:
            source_path = images_dir / source_file
            target_path = images_dir / target_filename
            
            if source_path.exists():
                changes.append(f"Copy {source_file} -> {target_filename} ({mapping['match_type']})")
                if not dry_run:
                    shutil.copy2(source_path, target_path)
    
    return changes

def main():
    import sys
    dry_run = '--fix' not in sys.argv
    
    if dry_run:
        print("=" * 80)
        print("DRY RUN MODE - No changes will be made")
        print("Run with --fix to apply changes")
        print("=" * 80)
    else:
        print("=" * 80)
        print("FIX MODE - Applying changes")
        print("=" * 80)
    
    all_unmatched = []
    
    for site in SITES:
        print(f"\n{'='*60}")
        print(f"SITE: {site}")
        print(f"{'='*60}")
        
        analysis = analyze_and_fix_site(site, dry_run)
        if not analysis:
            print("  Skipped (no data)")
            continue
        
        print(f"  Recipes: {analysis['total_recipes']}")
        print(f"  Unique images: {analysis['unique_images']}")
        print(f"  Matched: {analysis['matched_recipes']}")
        print(f"  Unmatched: {len(analysis['unmatched_recipes'])}")
        
        if analysis['unmatched_recipes']:
            print(f"  Unmatched recipes:")
            for slug in analysis['unmatched_recipes']:
                print(f"    - {slug}")
            all_unmatched.extend([(site, slug) for slug in analysis['unmatched_recipes']])
        
        # Show match types
        match_types = defaultdict(int)
        for mapping in analysis['recipe_to_image'].values():
            match_types[mapping['match_type']] += 1
        print(f"  Match types: {dict(match_types)}")
        
        # Apply fixes
        changes = apply_fix(analysis, dry_run)
        if changes:
            print(f"  Changes ({len(changes)}):")
            for change in changes[:10]:
                print(f"    {change}")
            if len(changes) > 10:
                print(f"    ... and {len(changes) - 10} more")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total unmatched recipes needing new images: {len(all_unmatched)}")
    if all_unmatched:
        print("\nRecipes needing new images:")
        for site, slug in all_unmatched:
            print(f"  {site}: {slug}")

if __name__ == '__main__':
    main()
