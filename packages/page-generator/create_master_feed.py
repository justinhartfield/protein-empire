"""
Master Recipe Feed Generator for Protein Empire
Generates a unified JSON feed for the Dotoro ad engine.

Output: dist/feed/recipes.json (and recipes.csv)
Endpoint: https://highprotein.recipes/feed/recipes.json
"""

import json
import os
import csv
import shutil
from datetime import datetime

# Site configurations
SITES = {
    'proteincookies-co': {
        'domain': 'proteincookies.co',
        'name': 'ProteinCookies',
        'meal_type': 'desserts',
        'emoji': '🍪'
    },
    'proteinpancakes-co': {
        'domain': 'proteinpancakes.co',
        'name': 'ProteinPancakes',
        'meal_type': 'breakfast',
        'emoji': '🥞'
    },
    'proteinbrownies-co': {
        'domain': 'proteinbrownies.co',
        'name': 'ProteinBrownies',
        'meal_type': 'desserts',
        'emoji': '🍫'
    },
    'protein-bread-com': {
        'domain': 'protein-bread.com',
        'name': 'ProteinBread',
        'meal_type': 'savory',
        'emoji': '🍞'
    },
    'proteinbars-co': {
        'domain': 'proteinbars.co',
        'name': 'ProteinBars',
        'meal_type': 'snacks',
        'emoji': '🍫'
    },
    'proteinbites-co': {
        'domain': 'proteinbites.co',
        'name': 'ProteinBites',
        'meal_type': 'snacks',
        'emoji': '🔵'
    },
    'proteindonuts-co': {
        'domain': 'proteindonuts.co',
        'name': 'ProteinDonuts',
        'meal_type': 'desserts',
        'emoji': '🍩'
    },
    'proteinoatmeal-co': {
        'domain': 'proteinoatmeal.co',
        'name': 'ProteinOatmeal',
        'meal_type': 'breakfast',
        'emoji': '🥣'
    },
    'proteincheesecake-co': {
        'domain': 'proteincheesecake.co',
        'name': 'ProteinCheesecake',
        'meal_type': 'desserts',
        'emoji': '🍰'
    },
    'proteinpizzas-co': {
        'domain': 'proteinpizzas.co',
        'name': 'ProteinPizzas',
        'meal_type': 'savory',
        'emoji': '🍕'
    },
    'proteinpudding-co': {
        'domain': 'proteinpudding.co',
        'name': 'ProteinPudding',
        'meal_type': 'desserts',
        'emoji': '🍮'
    }
}


def transform_recipe(recipe, site_slug, site_config):
    """
    Transform a recipe from the internal format to the Dotoro feed format.
    """
    domain = site_config['domain']
    slug = recipe.get('slug', '')
    
    # Generate unique recipe ID
    recipe_id = f"{site_slug}-{slug}"
    
    # Format prep time as ISO 8601 duration
    prep_time_raw = str(recipe.get('prepTime', '30'))
    try:
        prep_minutes = int(prep_time_raw.replace('PT', '').replace('M', ''))
        prep_time_iso = f"PT{prep_minutes}M"
    except ValueError:
        prep_time_iso = "PT30M"
        prep_minutes = 30
    
    # Build canonical URL (points to ProteinXYZ.co, NOT highprotein.recipes)
    canonical_url = f"https://{domain}/{slug}.html"
    
    # Build image URL
    image_file = recipe.get('image', f"{slug}.png")
    image_url = f"https://{domain}/images/{image_file}"
    
    # Extract diet tags (combine tags and category)
    diet_tags = list(recipe.get('tags', []))
    if recipe.get('category') and recipe['category'] not in diet_tags:
        diet_tags.append(recipe['category'])
    
    # Get intent class (should be set by add_intent_class.py)
    intent_class = recipe.get('intent_class', 'quick-snack')
    
    # Truncate description for feed
    description = recipe.get('description', '')
    if len(description) > 300:
        description = description[:297] + '...'
    
    return {
        'recipe_id': recipe_id,
        'title': recipe.get('title', ''),
        'description': description,
        'protein_grams': recipe.get('protein', 0) or 0,
        'calories': recipe.get('calories', 0) or 0,
        'carbs': recipe.get('carbs', 0) or 0,
        'fat': recipe.get('fat', 0) or 0,
        'fiber': recipe.get('fiber', 0) or 0,
        'sugar': recipe.get('sugar', 0) or 0,
        'diet_tags': diet_tags,
        'meal_type': site_config['meal_type'],
        'site_name': site_config['name'],
        'site_domain': domain,
        'prep_time': prep_time_iso,
        'prep_time_minutes': prep_minutes,
        'cook_time_minutes': int(str(recipe.get('cookTime', '0')).replace('PT', '').replace('M', '') or 0),
        'total_time_minutes': int(str(recipe.get('totalTime', '0')).replace('PT', '').replace('M', '') or 0),
        'difficulty': recipe.get('difficulty', 'Beginner'),
        'servings': recipe.get('yield', '12'),
        'canonical_url': canonical_url,
        'image_url': image_url,
        'intent_class': intent_class
    }


def load_recipes_for_site(site_slug, base_path):
    """Load all recipes for a given site."""
    recipes_path = os.path.join(base_path, 'data', 'recipes', site_slug, 'recipes.json')
    
    if not os.path.exists(recipes_path):
        print(f"  ⚠️  No recipes found for {site_slug}")
        return []
    
    with open(recipes_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle both list and dict formats
    if isinstance(data, dict):
        return data.get('recipes', [])
    return data


def generate_master_feed(base_path, output_dir):
    """Generate the master recipe feed for Dotoro."""
    all_recipes = []
    site_counts = {}
    
    print("Loading recipes from all sites...")
    for site_slug, site_config in SITES.items():
        recipes = load_recipes_for_site(site_slug, base_path)
        site_counts[site_config['name']] = len(recipes)
        
        for recipe in recipes:
            transformed = transform_recipe(recipe, site_slug, site_config)
            all_recipes.append(transformed)
        
        print(f"  ✅ {site_config['name']}: {len(recipes)} recipes")
    
    # Create feed metadata
    feed = {
        'metadata': {
            'name': 'Protein Empire Master Recipe Feed',
            'description': 'Unified recipe feed for Dotoro ad engine integration',
            'generated_at': datetime.utcnow().isoformat() + 'Z',
            'total_recipes': len(all_recipes),
            'sites_included': len(SITES),
            'version': '1.0',
            'schema_version': 'dotoro-v1',
            'site_breakdown': site_counts
        },
        'intent_classes': sorted(list(set(r['intent_class'] for r in all_recipes))),
        'meal_types': sorted(list(set(r['meal_type'] for r in all_recipes))),
        'recipes': all_recipes
    }
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Write JSON feed
    json_path = os.path.join(output_dir, 'recipes.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(feed, f, indent=2, ensure_ascii=False)
    print(f"\n✅ JSON feed: {json_path}")
    
    # Write CSV feed (for Dotoro compatibility)
    csv_path = os.path.join(output_dir, 'recipes.csv')
    if all_recipes:
        # Flatten diet_tags for CSV
        csv_recipes = []
        for r in all_recipes:
            csv_r = r.copy()
            csv_r['diet_tags'] = ';'.join(r['diet_tags'])
            csv_recipes.append(csv_r)
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=csv_recipes[0].keys())
            writer.writeheader()
            writer.writerows(csv_recipes)
        print(f"✅ CSV feed: {csv_path}")
    
    return feed


def generate_intent_summary(feed):
    """Generate a summary of recipes by intent class."""
    intent_counts = {}
    for recipe in feed['recipes']:
        intent = recipe['intent_class']
        intent_counts[intent] = intent_counts.get(intent, 0) + 1
    
    print("\n" + "=" * 50)
    print("INTENT CLASS DISTRIBUTION")
    print("=" * 50)
    for intent, count in sorted(intent_counts.items(), key=lambda x: -x[1]):
        pct = count / len(feed['recipes']) * 100
        bar = "█" * int(pct / 2)
        print(f"  {intent:20s}: {count:3d} ({pct:5.1f}%) {bar}")
    
    return intent_counts


def main():
    # Determine paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.dirname(os.path.dirname(script_dir))  # protein-empire root
    
    # For highprotein.recipes, output to apps/highprotein.recipes/dist/feed/
    output_dir = os.path.join(base_path, 'apps', 'highprotein.recipes', 'dist', 'feed')
    
    # Also create a copy in the root dist for easy access
    root_output_dir = os.path.join(base_path, 'dist', 'feed')
    
    print("=" * 50)
    print("PROTEIN EMPIRE - Master Feed Generator")
    print("=" * 50)
    print(f"Base path: {base_path}")
    print(f"Output: {output_dir}")
    print()
    
    # Generate the feed
    feed = generate_master_feed(base_path, output_dir)
    
    # Also copy to root dist
    os.makedirs(root_output_dir, exist_ok=True)
    shutil.copy(os.path.join(output_dir, 'recipes.json'), os.path.join(root_output_dir, 'recipes.json'))
    shutil.copy(os.path.join(output_dir, 'recipes.csv'), os.path.join(root_output_dir, 'recipes.csv'))
    print(f"✅ Copied to: {root_output_dir}")
    
    # Print summary
    generate_intent_summary(feed)
    
    print("\n" + "=" * 50)
    print("FEED GENERATION COMPLETE")
    print("=" * 50)
    print(f"Total recipes: {feed['metadata']['total_recipes']}")
    print(f"Sites included: {feed['metadata']['sites_included']}")
    print(f"\nFeed endpoint: https://highprotein.recipes/feed/recipes.json")


if __name__ == '__main__':
    main()
