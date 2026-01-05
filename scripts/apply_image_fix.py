#!/usr/bin/env python3
"""
Apply Image Fix for Protein Empire Sites

This script applies the correct image mappings based on visual analysis.
It copies images from their current (wrong) names to the correct recipe names.
"""

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).parent.parent

# Correct mappings based on visual analysis of what each unique image actually shows
# Format: recipe_slug -> source_image_filename (the image that actually matches this recipe)

CHEESECAKE_MAPPINGS = {
    # Recipe slug -> Image file that actually shows this type of cheesecake
    "classic-vanilla-bean-cheesecake": "classic-protein-cheesecake.png",
    "no-bake-chocolate-cheesecake": "caramel-pecan-cheesecake.png",  # This shows chocolate cheesecake
    "strawberry-swirl-cheesecake": "strawberry-swirl-cheesecake.png",  # Correct
    "lemon-blueberry-cheesecake-minis": "blueberry-swirl-cheesecake.png",
    "single-serving-peanut-butter-cheesecake": "peanut-butter-protein-cheesecake.png",
    "funfetti-cheesecake-dip": None,  # Needs new image
    "pumpkin-spice-cheesecake": "cookie-dough-cheesecake-dip.png",  # This shows pumpkin
    "key-lime-cheesecake": "key-lime-cheesecake.png",  # Correct
    "caramel-pecan-cheesecake": "eggnog-cheesecake.png",  # This shows caramel pecan
    "mint-chocolate-chip-cheesecake": None,  # Needs new image
    "raspberry-white-chocolate-cheesecake": "raspberry-white-chocolate-cheesecake.png",  # Correct
    "cookies-and-cream-cheesecake": "chocolate-hazelnut-cheesecake.png",  # This shows Oreo
    "s-mores-cheesecake-dip": None,  # Needs new image (coconut shows s'mores but not a dip)
    "red-velvet-cheesecake": "red-velvet-cheesecake.png",  # Correct
    "matcha-green-tea-cheesecake": "brownie-batter-dip.png",  # This shows matcha
    "no-bake-oreo-cheesecake-bites": None,  # Needs new image
    "single-serving-chocolate-cheesecake": "caramel-pecan-cheesecake.png",  # Chocolate
    "brownie-batter-dip": None,  # Needs new image
    "gingerbread-cheesecake": None,  # Needs new image (current shows mini cheesecakes)
    "no-bake-lemon-cheesecake": "lemon-protein-cheesecake.png",  # This shows lemon
    "chocolate-hazelnut-cheesecake": None,  # Needs new image
    "single-serving-strawberry-cheesecake": "strawberry-swirl-cheesecake.png",
    "cookie-dough-cheesecake-dip": None,  # Needs new image
    "eggnog-cheesecake": None,  # Needs new image
    "tiramisu-cheesecake": "tiramisu-cheesecake.png",  # Correct
    "gluten-free-almond-crust-protein-cheesecake": "cottage-cheese-protein-cheesecake.png",  # Generic vanilla
    "dairy-free-cashew-protein-cheesecake": "no-bake-lemon-cheesecake.png",  # Generic vanilla
}

def apply_cheesecake_fix(dry_run=True):
    """Apply the image fix for cheesecake site."""
    site = 'proteincheesecake-co'
    images_dir = ROOT / 'data' / 'images' / site
    
    changes = []
    needs_new_image = []
    
    for recipe_slug, source_image in CHEESECAKE_MAPPINGS.items():
        target_filename = f"{recipe_slug}.png"
        target_path = images_dir / target_filename
        
        if source_image is None:
            needs_new_image.append(recipe_slug)
            continue
        
        source_path = images_dir / source_image
        
        if not source_path.exists():
            changes.append(f"ERROR: Source image not found: {source_image}")
            continue
        
        # Check if we need to copy
        if source_image != target_filename:
            changes.append(f"Copy {source_image} -> {target_filename}")
            if not dry_run:
                shutil.copy2(source_path, target_path)
        else:
            changes.append(f"OK: {target_filename} (already correct)")
    
    return changes, needs_new_image

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
    
    print("\nCHEESECAKE SITE:")
    print("-" * 40)
    changes, needs_new = apply_cheesecake_fix(dry_run)
    
    for change in changes:
        print(f"  {change}")
    
    print(f"\nRecipes needing new images ({len(needs_new)}):")
    for recipe in needs_new:
        print(f"  - {recipe}")
    
    if not dry_run:
        print("\n✓ Changes applied successfully!")

if __name__ == '__main__':
    main()
