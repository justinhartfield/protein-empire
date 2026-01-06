"""
Intent Class Assignment Script for Protein Empire
Adds intent_class field to all recipes based on intelligent classification rules.

Intent Classes:
- post-workout: High protein, recovery-focused
- meal-prep: Batch-friendly, stores well
- weight-loss: Lower calorie, high protein ratio
- kid-friendly: Kid-approved flavors
- quick-snack: Under 15 min prep
- high-protein-30g: 30g+ protein per serving
- vegan: Plant-based only (based on tags/title, not description mentions)
- gluten-free: No gluten ingredients (based on tags/title, not description mentions)
"""

import json
import os
import re
from pathlib import Path

# Site configurations
SITES = [
    'proteincookies-co',
    'proteinpancakes-co',
    'proteinbrownies-co',
    'protein-bread-com',
    'proteinbars-co',
    'proteinbites-co',
    'proteindonuts-co',
    'proteinoatmeal-co',
    'proteincheesecake-co',
    'proteinpizzas-co',
    'proteinpudding-co'
]

def classify_intent(recipe):
    """
    Classify a recipe into an intent class based on its characteristics.
    Returns the most appropriate intent class.
    
    IMPORTANT: For dietary classifications (vegan, gluten-free), we only check
    title and tags - NOT the description, which often mentions these as options.
    """
    title = recipe.get('title', '').lower()
    tags = [t.lower() for t in recipe.get('tags', [])]
    category = recipe.get('category', '').lower()
    description = recipe.get('description', '').lower()
    
    # Get numeric values with defaults
    protein = recipe.get('protein', 0) or 0
    calories = recipe.get('calories', 0) or 0
    
    # Parse prep time
    prep_time_raw = str(recipe.get('prepTime', '30'))
    try:
        prep_time = int(re.sub(r'[^0-9]', '', prep_time_raw) or '30')
    except:
        prep_time = 30
    
    # Text for strict matching (title + tags only - NOT description)
    strict_text = f"{title} {' '.join(tags)} {category}"
    
    # Full text for general keyword matching
    full_text = f"{title} {description} {' '.join(tags)} {category}"
    
    # Priority-based classification (order matters!)
    
    # 1. Check for HIGH PROTEIN first (30g+) - this is definitive
    if protein >= 30:
        return 'high-protein-30g'
    
    # 2. Check for explicit dietary restrictions in TITLE or TAGS only
    vegan_keywords = ['vegan', 'plant-based', 'plant based']
    if any(kw in strict_text for kw in vegan_keywords):
        return 'vegan'
    
    gluten_free_keywords = ['gluten-free', 'gluten free', 'gf ']
    if any(kw in strict_text for kw in gluten_free_keywords):
        return 'gluten-free'
    
    # 3. Check for kid-friendly in title/tags
    kid_keywords = ['kid', 'kids', 'children', 'lunchbox', 'school']
    if any(kw in strict_text for kw in kid_keywords):
        return 'kid-friendly'
    
    # 4. Check for meal prep in title/tags
    meal_prep_keywords = ['meal prep', 'meal-prep', 'batch', 'make ahead', 'freezer']
    if any(kw in strict_text for kw in meal_prep_keywords):
        return 'meal-prep'
    
    # 5. Check for no-bake (quick snack category)
    if 'no-bake' in strict_text or 'no bake' in strict_text:
        return 'quick-snack'
    
    # 6. Check for quick snack (under 15 min prep)
    if prep_time <= 15:
        return 'quick-snack'
    
    # 7. Check for weight loss (high protein-to-calorie ratio, lower calories)
    if calories > 0 and protein > 0:
        protein_ratio = protein / calories
        if protein_ratio > 0.11 and calories < 180:  # High protein ratio, low cal
            return 'weight-loss'
    
    # 8. Check for post-workout keywords in full text
    workout_keywords = ['post-workout', 'post workout', 'recovery', 'muscle', 'gains', 'gym']
    if any(kw in full_text for kw in workout_keywords):
        return 'post-workout'
    
    # 9. Default classification based on characteristics
    if protein >= 20:
        return 'post-workout'
    elif prep_time <= 20:
        return 'quick-snack'
    else:
        return 'meal-prep'


def process_site(site_slug, base_path):
    """Process all recipes for a single site."""
    recipes_path = os.path.join(base_path, 'data', 'recipes', site_slug, 'recipes.json')
    
    if not os.path.exists(recipes_path):
        print(f"  ⚠️  No recipes found for {site_slug}")
        return 0, {}
    
    # Read recipes
    with open(recipes_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle both list and dict formats
    if isinstance(data, dict):
        recipes = data.get('recipes', [])
        is_dict_format = True
    else:
        recipes = data
        is_dict_format = False
    
    # Track intent distribution
    intent_counts = {}
    
    # Add intent_class to each recipe
    for recipe in recipes:
        intent = classify_intent(recipe)
        recipe['intent_class'] = intent
        intent_counts[intent] = intent_counts.get(intent, 0) + 1
    
    # Write back
    if is_dict_format:
        data['recipes'] = recipes
        output_data = data
    else:
        output_data = recipes
    
    with open(recipes_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    return len(recipes), intent_counts


def main():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    print("=" * 60)
    print("PROTEIN EMPIRE - Intent Class Assignment")
    print("=" * 60)
    print()
    
    total_recipes = 0
    total_intents = {}
    
    for site_slug in SITES:
        print(f"Processing {site_slug}...")
        count, intents = process_site(site_slug, base_path)
        total_recipes += count
        
        # Merge intent counts
        for intent, cnt in intents.items():
            total_intents[intent] = total_intents.get(intent, 0) + cnt
        
        if count > 0:
            print(f"  ✅ {count} recipes updated")
            for intent, cnt in sorted(intents.items()):
                print(f"      - {intent}: {cnt}")
        print()
    
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total recipes processed: {total_recipes}")
    print()
    print("Intent Class Distribution:")
    for intent, cnt in sorted(total_intents.items(), key=lambda x: -x[1]):
        pct = (cnt / total_recipes * 100) if total_recipes > 0 else 0
        bar = "█" * int(pct / 2)
        print(f"  {intent:20s}: {cnt:3d} ({pct:5.1f}%) {bar}")
    print()
    print("✅ All recipes updated with intent_class field!")


if __name__ == '__main__':
    main()
