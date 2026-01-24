#!/usr/bin/env python3
"""
Ingredient Mapping Script for highprotein.recipes

This script parses ingredient strings from recipes.json and maps them to
ingredient database IDs for the Alpine.js ingredient switcher.
"""

import json
import re
from pathlib import Path

# Mapping of ingredient patterns to database IDs
INGREDIENT_MAPPINGS = {
    # Proteins & Meats
    r'turkey.*sausage|lean turkey sausage': 'turkey-sausage',
    r'chicken.*sausage': 'chicken-sausage',
    r'ground turkey|turkey breast': 'turkey-sausage',
    r'tempeh': 'tempeh-crumbles',
    r'firm tofu|tofu': 'tofu-firm',

    # Eggs
    r'liquid egg whites|egg whites': 'egg-whites-liquid',
    r'large eggs?(?! whites)|\d+ eggs?(?! whites)|whole eggs?': 'whole-eggs',

    # Dairy
    r'greek yogurt|plain greek': 'greek-yogurt-nonfat',
    r'cottage cheese': 'cottage-cheese-blended',
    r'ricotta': 'ricotta-part-skim',
    r'mozzarella': 'mozzarella',
    r'cheddar|mexican cheese': 'reduced-fat-cheddar',
    r'almond milk|unsweetened almond': 'almond-milk-unsweetened',
    r'oat milk': 'oat-milk',
    r'soy milk': 'soy-milk',
    r'skim milk|milk(?! powder)': 'dairy-milk',

    # Protein Powders
    r'vanilla.*protein|protein.*vanilla|whey.*vanilla': 'whey-vanilla',
    r'chocolate.*protein|protein.*chocolate|whey.*chocolate': 'whey-chocolate',
    r'unflavored protein|plain protein': 'whey-vanilla',
    r'casein': 'casein-vanilla',
    r'pea protein': 'pea-protein',

    # Flours & Grains
    r'oat flour|blended oats': 'oat-flour',
    r'rolled oats|old fashioned oats': 'rolled-oats',
    r'quick oats|instant oats': 'quick-oats',
    r'almond flour': 'almond-flour',
    r'coconut flour': 'coconut-flour',
    r'chickpea flour|besan': 'chickpea-flour',
    r'whole wheat flour': 'whole-wheat-flour',
    r'kodiak.*mix|kodiak': 'kodiak-pancake-mix',

    # Tortillas & Wraps
    r'flour tortilla|large tortilla': 'flour-tortilla',
    r'whole wheat tortilla': 'whole-wheat-tortilla',
    r'low.?carb tortilla|carb balance': 'low-carb-tortilla',
    r'corn tortilla': 'corn-tortilla',

    # Seeds & Superfoods
    r'chia seeds?': 'chia-seeds',
    r'flax.*seed|ground flax': 'flax-seeds',
    r'hemp.*hearts?|hemp seeds?': 'hemp-hearts',

    # Legumes
    r'mung beans?': 'mung-beans',
    r'black beans?': 'black-beans',
    r'lentils?': 'lentils-cooked',

    # Nut Butters
    r'peanut butter': 'peanut-butter',
    r'almond butter': 'almond-butter',
    r'sunflower.*butter|sun butter': 'sunflower-seed-butter',
    r'cashew butter': 'cashew-butter',

    # Sweeteners
    r'maple syrup': 'maple-syrup',
    r'honey': 'honey',
    r'agave': 'agave-nectar',
    r'medjool dates?|dates': 'medjool-dates',

    # Fruits & Purees
    r'banana|mashed banana': 'banana-mashed',
    r'pumpkin.*puree|canned pumpkin': 'pumpkin-puree',
    r'applesauce|apple sauce': 'applesauce-unsweetened',

    # Misc
    r'vanilla extract': 'vanilla-extract',
    r'cocoa powder': 'cocoa-powder',
    r'baking powder': 'baking-powder',
    r'baking soda': 'baking-soda',
    r'chocolate chips': 'chocolate-chips',
    r'cinnamon': 'cinnamon',
    r'blueberries?': 'blueberries-fresh',
    r'walnuts?': 'walnuts-chopped',
}

def parse_amount(ingredient_str):
    """Extract amount and unit from ingredient string."""
    # Pattern for amounts like "720ml", "680g", "1.5 lbs", "2 cups", etc.
    patterns = [
        r'^(\d+(?:\.\d+)?)\s*(g|ml|oz|lbs?|cups?|tbsp|tsp)\s*(?:\([^)]+\))?\s*',
        r'^\(?\s*(\d+(?:\.\d+)?)\s*(g|ml|oz|lbs?|cups?)\s*\)?\s*',
        r'^(\d+(?:\.\d+)?)\s+(?:large\s+)?(?:medium\s+)?',
    ]

    for pattern in patterns:
        match = re.search(pattern, ingredient_str, re.IGNORECASE)
        if match:
            amount = float(match.group(1))
            unit = match.group(2) if len(match.groups()) > 1 else 'unit'
            return amount, unit.lower() if unit else 'unit'

    # Try to find just a number at the start
    match = re.match(r'^(\d+(?:\.\d+)?)\s+', ingredient_str)
    if match:
        return float(match.group(1)), 'unit'

    return None, None

def map_ingredient(ingredient_str):
    """Map an ingredient string to a database ID."""
    ingredient_lower = ingredient_str.lower()

    for pattern, ingredient_id in INGREDIENT_MAPPINGS.items():
        if re.search(pattern, ingredient_lower, re.IGNORECASE):
            return ingredient_id

    return None

def create_structured_ingredient(ingredient_str):
    """Create a structured ingredient object from a string."""
    amount, unit = parse_amount(ingredient_str)
    ingredient_id = map_ingredient(ingredient_str)

    # Clean up the display name
    display_name = ingredient_str

    return {
        "id": ingredient_id,
        "name": display_name,
        "amount": amount if amount else 1,
        "unit": unit if unit else "unit",
        "displayAmount": ingredient_str
    }

def process_recipes(recipes_path):
    """Process all recipes and add structured ingredients."""
    with open(recipes_path, 'r') as f:
        data = json.load(f)

    for recipe in data['recipes']:
        structured_ingredients = []
        for ing_str in recipe['ingredients']:
            structured = create_structured_ingredient(ing_str)
            structured_ingredients.append(structured)

        recipe['ingredientsStructured'] = structured_ingredients

    return data

def main():
    base_path = Path(__file__).parent.parent
    recipes_path = base_path / 'data' / 'recipes.json'

    print(f"Processing recipes from: {recipes_path}")

    data = process_recipes(recipes_path)

    # Write back
    with open(recipes_path, 'w') as f:
        json.dump(data, f, indent=2)

    # Print summary
    total_ingredients = 0
    mapped_ingredients = 0

    for recipe in data['recipes']:
        for ing in recipe['ingredientsStructured']:
            total_ingredients += 1
            if ing['id']:
                mapped_ingredients += 1

    print(f"\nProcessed {len(data['recipes'])} recipes")
    print(f"Total ingredients: {total_ingredients}")
    print(f"Mapped to database: {mapped_ingredients} ({100*mapped_ingredients/total_ingredients:.1f}%)")
    print(f"Unmapped (non-swappable): {total_ingredients - mapped_ingredients}")

    # List unmapped ingredients
    print("\nUnmapped ingredients (will not be swappable):")
    seen = set()
    for recipe in data['recipes']:
        for ing in recipe['ingredientsStructured']:
            if not ing['id'] and ing['name'] not in seen:
                print(f"  - {ing['name']}")
                seen.add(ing['name'])

if __name__ == '__main__':
    main()
