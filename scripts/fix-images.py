#!/usr/bin/env python3
import json
import os
from pathlib import Path

ROOT = Path(__file__).parent.parent

SITES = [
    'proteinpancakes-co',
    'proteinpudding-co', 
    'proteinpizzas-co',
    'proteincheesecake-co',
    'proteinoatmeal-co',
    'proteindonuts-co',
    'proteinbites-co',
    'proteinbars-co',
    'protein-bread-com',
    'proteinbrownies-co'
]

def get_available_images(site):
    images_dir = ROOT / 'data' / 'images' / site
    if not images_dir.exists():
        return []
    return [f.name for f in images_dir.glob('*.png')]

def update_recipes(site):
    recipes_path = ROOT / 'data' / 'recipes' / site / 'recipes.json'
    if not recipes_path.exists():
        print(f"  No recipes.json for {site}")
        return
    
    with open(recipes_path) as f:
        data = json.load(f)
    
    # Handle both formats
    if isinstance(data, list):
        recipes = data
        is_array = True
    else:
        recipes = data.get('recipes', [])
        is_array = False
    
    available = get_available_images(site)
    updated = 0
    
    for recipe in recipes:
        slug = recipe.get('slug', '')
        expected_image = f"{slug}.png"
        
        # If the expected image exists, use it
        if expected_image in available:
            if recipe.get('image') != expected_image:
                recipe['image'] = expected_image
                updated += 1
        else:
            # Try to find a close match
            # First, check if current image exists
            current = recipe.get('image', '')
            if current in available:
                continue  # Already correct
            
            # Otherwise, assign from available images based on index
            idx = recipes.index(recipe)
            if idx < len(available):
                recipe['image'] = available[idx]
                print(f"  Assigned {available[idx]} to {slug}")
                updated += 1
    
    # Save back
    with open(recipes_path, 'w') as f:
        if is_array:
            json.dump(recipes, f, indent=2)
        else:
            data['recipes'] = recipes
            json.dump(data, f, indent=2)
    
    print(f"  Updated {updated} recipes")

print("Fixing recipe image references...\n")

for site in SITES:
    print(f"Processing {site}...")
    update_recipes(site)

print("\nDone!")
