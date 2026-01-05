#!/usr/bin/env python3
"""
Fix Image Mappings for Protein Empire Sites

This script identifies and fixes mismatched recipe images across all sites.
The issue: Images were duplicated with wrong filenames, causing recipes to 
display images that don't match their content.

Solution: Analyze unique images, identify what they actually show, and 
create proper mappings.
"""

import os
import json
import hashlib
import shutil
from pathlib import Path
from collections import defaultdict

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

def get_file_hash(filepath):
    """Get MD5 hash of a file."""
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def analyze_site_images(site):
    """Analyze images for a site and identify duplicates."""
    images_dir = ROOT / 'data' / 'images' / site
    if not images_dir.exists():
        return None, None, None
    
    # Group images by hash
    hash_to_files = defaultdict(list)
    file_to_hash = {}
    
    for img_file in images_dir.glob('*.png'):
        file_hash = get_file_hash(img_file)
        hash_to_files[file_hash].append(img_file.name)
        file_to_hash[img_file.name] = file_hash
    
    # Find duplicates (same hash, different names)
    duplicates = {h: files for h, files in hash_to_files.items() if len(files) > 1}
    
    # Get unique images (one per hash)
    unique_images = {h: files[0] for h, files in hash_to_files.items()}
    
    return hash_to_files, duplicates, unique_images

def get_recipes(site):
    """Load recipes for a site."""
    recipes_path = ROOT / 'data' / 'recipes' / site / 'recipes.json'
    if not recipes_path.exists():
        return []
    
    with open(recipes_path) as f:
        data = json.load(f)
    
    if isinstance(data, list):
        return data
    return data.get('recipes', [])

def analyze_all_sites():
    """Analyze all sites and report findings."""
    print("=" * 60)
    print("PROTEIN EMPIRE IMAGE ANALYSIS REPORT")
    print("=" * 60)
    
    total_images = 0
    total_unique = 0
    total_duplicates = 0
    
    all_site_data = {}
    
    for site in SITES:
        hash_to_files, duplicates, unique_images = analyze_site_images(site)
        if hash_to_files is None:
            print(f"\n{site}: No images directory found")
            continue
        
        recipes = get_recipes(site)
        
        num_images = sum(len(files) for files in hash_to_files.values())
        num_unique = len(unique_images)
        num_duplicates = num_images - num_unique
        
        total_images += num_images
        total_unique += num_unique
        total_duplicates += num_duplicates
        
        print(f"\n{site}:")
        print(f"  Recipes: {len(recipes)}")
        print(f"  Total images: {num_images}")
        print(f"  Unique images: {num_unique}")
        print(f"  Duplicate images: {num_duplicates}")
        
        if duplicates:
            print(f"  Duplicate groups:")
            for h, files in list(duplicates.items())[:5]:
                print(f"    - {', '.join(files)}")
            if len(duplicates) > 5:
                print(f"    ... and {len(duplicates) - 5} more groups")
        
        all_site_data[site] = {
            'hash_to_files': hash_to_files,
            'duplicates': duplicates,
            'unique_images': unique_images,
            'recipes': recipes
        }
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total images across all sites: {total_images}")
    print(f"Total unique images: {total_unique}")
    print(f"Total duplicate images: {total_duplicates}")
    print(f"Duplication rate: {total_duplicates/total_images*100:.1f}%")
    
    return all_site_data

def create_image_mapping_report(all_site_data):
    """Create a detailed report of image mappings needed."""
    report = []
    
    for site, data in all_site_data.items():
        recipes = data['recipes']
        duplicates = data['duplicates']
        hash_to_files = data['hash_to_files']
        
        if not duplicates:
            continue
        
        report.append(f"\n{'='*60}")
        report.append(f"SITE: {site}")
        report.append(f"{'='*60}")
        
        # For each duplicate group, identify which filename is "correct"
        for file_hash, filenames in duplicates.items():
            report.append(f"\nDuplicate group (same image):")
            for fn in filenames:
                # Check if this filename matches a recipe slug
                slug = fn.replace('.png', '')
                matching_recipe = next((r for r in recipes if r.get('slug') == slug), None)
                if matching_recipe:
                    report.append(f"  - {fn} -> Recipe: '{matching_recipe.get('title', 'Unknown')}'")
                else:
                    report.append(f"  - {fn} -> No matching recipe")
    
    return '\n'.join(report)

def fix_duplicate_images(all_site_data, dry_run=True):
    """
    Fix duplicate images by keeping only one copy per unique image.
    
    Strategy: For each duplicate group, keep the first file alphabetically
    and update recipes to reference that file.
    """
    changes = []
    
    for site, data in all_site_data.items():
        recipes = data['recipes']
        duplicates = data['duplicates']
        hash_to_files = data['hash_to_files']
        
        if not duplicates:
            continue
        
        images_dir = ROOT / 'data' / 'images' / site
        
        # Create a mapping from old filename to new filename
        # For duplicates, map all to the first one alphabetically
        filename_mapping = {}
        for file_hash, filenames in hash_to_files.items():
            canonical_name = sorted(filenames)[0]
            for fn in filenames:
                if fn != canonical_name:
                    filename_mapping[fn] = canonical_name
        
        if filename_mapping:
            changes.append(f"\n{site}:")
            for old_name, new_name in filename_mapping.items():
                changes.append(f"  {old_name} -> {new_name}")
            
            # Update recipes to use canonical names
            recipes_path = ROOT / 'data' / 'recipes' / site / 'recipes.json'
            updated_count = 0
            
            for recipe in recipes:
                current_image = recipe.get('image', '')
                if current_image in filename_mapping:
                    if not dry_run:
                        recipe['image'] = filename_mapping[current_image]
                    updated_count += 1
            
            if updated_count > 0:
                changes.append(f"  Updated {updated_count} recipe image references")
                
                if not dry_run:
                    # Save updated recipes
                    with open(recipes_path, 'w') as f:
                        json.dump(recipes, f, indent=2)
                    
                    # Remove duplicate image files
                    for old_name in filename_mapping.keys():
                        old_path = images_dir / old_name
                        if old_path.exists():
                            old_path.unlink()
                            changes.append(f"  Deleted: {old_name}")
    
    return '\n'.join(changes)

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--fix':
        print("Running in FIX mode - will modify files")
        all_data = analyze_all_sites()
        print("\n" + "=" * 60)
        print("APPLYING FIXES")
        print("=" * 60)
        changes = fix_duplicate_images(all_data, dry_run=False)
        print(changes)
    else:
        print("Running in ANALYSIS mode (use --fix to apply changes)")
        all_data = analyze_all_sites()
        print("\n" + "=" * 60)
        print("IMAGE MAPPING REPORT")
        print("=" * 60)
        report = create_image_mapping_report(all_data)
        print(report)
        print("\n" + "=" * 60)
        print("PROPOSED CHANGES (dry run)")
        print("=" * 60)
        changes = fix_duplicate_images(all_data, dry_run=True)
        print(changes)
