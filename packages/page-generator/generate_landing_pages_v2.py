"""
Modern Landing Page Generator for Protein Empire
Generates conversion-optimized landing pages inspired by SellSmart template.

Output: apps/highprotein.recipes/dist/{intent}/index.html
"""

import json
import os
from datetime import datetime

# Intent page configurations
INTENT_PAGES = {
    'post-workout': {
        'slug': 'post-workout',
        'hero_title_line1': 'Post-Workout',
        'hero_title_line2': 'Protein Recipes',
        'hero_subtitle': 'Fuel your recovery with macro-verified recipes designed to maximize muscle repair and replenish your energy after intense training sessions.',
        'section_label': 'Recovery Fuel',
        'section_title': 'Recipes Built for Recovery',
        'section_subtitle': 'High-protein meals and snacks to help you recover faster and build lean muscle',
        'meta_description': 'Discover post-workout protein recipes with 20-40g protein per serving. Macro-verified recipes for optimal muscle recovery.',
        'keywords': 'post workout protein, recovery recipes, muscle building meals, high protein snacks'
    },
    'meal-prep': {
        'slug': 'meal-prep',
        'hero_title_line1': 'Meal Prep',
        'hero_title_line2': 'Protein Recipes',
        'hero_subtitle': 'Batch-friendly recipes that stay fresh all week. Prep once, eat healthy every day with perfectly portioned protein meals.',
        'section_label': 'Batch Cooking',
        'section_title': 'Prep Once, Eat All Week',
        'section_subtitle': 'Freezer-friendly recipes perfect for busy schedules and consistent nutrition',
        'meta_description': 'High protein meal prep recipes that stay fresh. Batch cooking ideas with macro breakdowns for the week.',
        'keywords': 'meal prep protein, batch cooking, freezer friendly recipes, weekly meal prep'
    },
    'kid-friendly': {
        'slug': 'kid-friendly',
        'hero_title_line1': 'Kid-Friendly',
        'hero_title_line2': 'Protein Recipes',
        'hero_subtitle': 'Delicious protein-packed treats that kids actually love. Healthy snacks disguised as their favorite foods.',
        'section_label': 'Family Favorites',
        'section_title': 'Protein Snacks Kids Love',
        'section_subtitle': 'Healthy treats that taste like dessert but pack a protein punch',
        'meta_description': 'Kid-friendly protein recipes and snacks. Healthy treats children love with hidden nutrition.',
        'keywords': 'kid friendly protein, healthy snacks for kids, protein treats, family recipes'
    },
    'quick-snacks': {
        'slug': 'quick-snacks',
        'hero_title_line1': 'Quick & Easy',
        'hero_title_line2': 'Protein Snacks',
        'hero_subtitle': 'Ready in 15 minutes or less. Perfect for busy days when you need protein fast without sacrificing nutrition.',
        'section_label': '15 Minutes or Less',
        'section_title': 'Fast Protein, No Excuses',
        'section_subtitle': 'Quick recipes for when you need protein now, not later',
        'meta_description': 'Quick protein snack recipes ready in under 15 minutes. Fast, easy, macro-verified.',
        'keywords': 'quick protein snacks, easy protein recipes, 15 minute meals, fast healthy snacks'
    },
    '30g-protein': {
        'slug': '30g-protein',
        'hero_title_line1': '30g+ Protein',
        'hero_title_line2': 'Power Recipes',
        'hero_subtitle': 'Maximum protein per serving for serious athletes and fitness enthusiasts. Hit your daily goals with fewer meals.',
        'section_label': 'High Protein',
        'section_title': 'Maximum Protein Per Serving',
        'section_subtitle': 'For when you need to hit your macros with every single meal',
        'meta_description': 'High protein recipes with 30g+ protein per serving. Perfect for bodybuilding and muscle gain.',
        'keywords': '30g protein recipes, high protein meals, bodybuilding recipes, muscle gain food'
    },
    'vegan': {
        'slug': 'vegan',
        'hero_title_line1': 'Plant-Based',
        'hero_title_line2': 'Protein Recipes',
        'hero_subtitle': 'Delicious vegan recipes that prove you don\'t need meat to hit your protein goals. 100% plant-powered.',
        'section_label': '100% Plant-Based',
        'section_title': 'Vegan Protein Made Delicious',
        'section_subtitle': 'Prove that plant-based eating can be high-protein and satisfying',
        'meta_description': 'Vegan high protein recipes. Plant-based meals with complete amino acid profiles.',
        'keywords': 'vegan protein recipes, plant based protein, vegan high protein, meatless protein'
    },
    'gluten-free': {
        'slug': 'gluten-free',
        'hero_title_line1': 'Gluten-Free',
        'hero_title_line2': 'Protein Recipes',
        'hero_subtitle': 'All the protein, none of the gluten. Celiac-safe recipes that don\'t compromise on taste or nutrition.',
        'section_label': 'Celiac Safe',
        'section_title': 'Gluten-Free, Protein-Full',
        'section_subtitle': 'Safe for sensitive stomachs, satisfying for everyone',
        'meta_description': 'Gluten-free protein recipes for celiac and gluten sensitivity. Safe, delicious, macro-verified.',
        'keywords': 'gluten free protein, celiac recipes, gluten free high protein, gf protein snacks'
    },
    'under-200-calories': {
        'slug': 'under-200-calories',
        'hero_title_line1': 'Under 200',
        'hero_title_line2': 'Calorie Recipes',
        'hero_subtitle': 'Low-calorie, high-protein recipes perfect for cutting phases or maintaining a calorie deficit without hunger.',
        'section_label': 'Low Calorie',
        'section_title': 'Maximum Protein, Minimum Calories',
        'section_subtitle': 'Stay full and hit your protein goals while keeping calories in check',
        'meta_description': 'Low calorie high protein recipes under 200 calories. Perfect for weight loss and cutting.',
        'keywords': 'low calorie protein, under 200 calories, diet recipes, weight loss protein'
    },
    '10-minute-recipes': {
        'slug': '10-minute-recipes',
        'hero_title_line1': '10-Minute',
        'hero_title_line2': 'Protein Recipes',
        'hero_subtitle': 'Ultra-fast recipes for the busiest days. From kitchen to table in 10 minutes flat.',
        'section_label': 'Lightning Fast',
        'section_title': 'Ready in 10 Minutes',
        'section_subtitle': 'No time? No problem. These recipes are faster than delivery.',
        'meta_description': '10 minute protein recipes for busy people. Quick, easy, macro-verified meals.',
        'keywords': '10 minute recipes, fast protein meals, quick healthy recipes, busy schedule meals'
    },
    'high-fiber': {
        'slug': 'high-fiber',
        'hero_title_line1': 'High-Fiber',
        'hero_title_line2': 'Protein Recipes',
        'hero_subtitle': 'Double the nutrition with recipes high in both protein and fiber. Great for digestion and satiety.',
        'section_label': 'Gut Health',
        'section_title': 'Protein + Fiber Powerhouse',
        'section_subtitle': 'Keep your gut happy while hitting your protein goals',
        'meta_description': 'High fiber high protein recipes. Great for digestion, satiety, and overall health.',
        'keywords': 'high fiber protein, gut health recipes, fiber rich meals, digestive health food'
    },
    'under-5g-sugar': {
        'slug': 'under-5g-sugar',
        'hero_title_line1': 'Low Sugar',
        'hero_title_line2': 'Protein Recipes',
        'hero_subtitle': 'Sweet treats and satisfying meals with under 5g sugar. Perfect for keto, diabetic-friendly, or sugar-conscious eating.',
        'section_label': 'Sugar Smart',
        'section_title': 'Sweet Without the Sugar',
        'section_subtitle': 'All the flavor, fraction of the sugar',
        'meta_description': 'Low sugar protein recipes under 5g sugar. Keto-friendly, diabetic-safe options.',
        'keywords': 'low sugar protein, keto protein recipes, diabetic friendly, sugar free snacks'
    },
    'under-10g-carbs': {
        'slug': 'under-10g-carbs',
        'hero_title_line1': 'Low Carb',
        'hero_title_line2': 'Protein Recipes',
        'hero_subtitle': 'Keto-friendly recipes with under 10g net carbs. Stay in ketosis while enjoying delicious protein-packed meals.',
        'section_label': 'Keto Friendly',
        'section_title': 'Keto-Approved Protein',
        'section_subtitle': 'Stay in ketosis without sacrificing taste or protein',
        'meta_description': 'Low carb protein recipes under 10g carbs. Perfect for keto diet and carb cycling.',
        'keywords': 'low carb protein, keto recipes, under 10g carbs, ketogenic meals'
    }
}


def generate_recipe_card(recipe):
    """Generate HTML for a single recipe card."""
    return f'''
                <a href="{recipe['canonical_url']}" class="recipe-card" target="_blank" rel="noopener">
                    <div class="recipe-image">
                        <img src="{recipe['image_url']}" alt="{recipe['title']}" loading="lazy">
                        <div class="recipe-badges">
                            <span class="protein-badge">{recipe['protein_grams']}g Protein</span>
                            <span class="site-badge">{recipe['site_name']}</span>
                        </div>
                    </div>
                    <div class="recipe-content">
                        <h3 class="recipe-title">{recipe['title']}</h3>
                        <div class="recipe-meta">
                            <span class="recipe-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {recipe['prep_time_minutes']} min
                            </span>
                            <span class="recipe-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                </svg>
                                {recipe['calories']} cal
                            </span>
                        </div>
                        <div class="recipe-cta">
                            <span class="view-recipe">
                                View Recipe
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </a>'''


def generate_schema(page_config, recipes, canonical_url):
    """Generate Schema.org ItemList JSON-LD."""
    items = []
    for i, recipe in enumerate(recipes[:50], 1):  # Limit to 50 for schema
        items.append({
            "@type": "ListItem",
            "position": i,
            "url": recipe['canonical_url'],
            "name": recipe['title']
        })
    
    schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": f"{page_config['hero_title_line1']} {page_config['hero_title_line2']}",
        "description": page_config['meta_description'],
        "numberOfItems": len(recipes),
        "itemListElement": items
    }
    
    return json.dumps(schema, indent=2)


def load_template():
    """Load the HTML template."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(script_dir, 'templates', 'landing_page_modern.html')
    
    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()


def generate_landing_page(page_config, recipes, output_dir, template):
    """Generate a single landing page."""
    slug = page_config['slug']
    page_dir = os.path.join(output_dir, slug)
    os.makedirs(page_dir, exist_ok=True)
    
    # Calculate stats
    recipe_count = len(recipes)
    avg_protein = round(sum(r['protein_grams'] for r in recipes) / recipe_count) if recipe_count > 0 else 0
    site_count = len(set(r['site_name'] for r in recipes))
    
    # Generate recipe cards HTML
    recipe_cards = '\n'.join(generate_recipe_card(r) for r in recipes)
    
    # Generate canonical URL
    canonical_url = f"https://highprotein.recipes/{slug}/"
    
    # Generate schema
    schema_json = generate_schema(page_config, recipes, canonical_url)
    
    # Generate OG image (use first recipe image or default)
    og_image = recipes[0]['image_url'] if recipes else 'https://highprotein.recipes/images/og-default.jpg'
    
    # Fill template
    html = template
    replacements = {
        '{{page_title}}': f"{page_config['hero_title_line1']} {page_config['hero_title_line2']}",
        '{{meta_description}}': page_config['meta_description'],
        '{{keywords}}': page_config['keywords'],
        '{{canonical_url}}': canonical_url,
        '{{og_image}}': og_image,
        '{{hero_title_line1}}': page_config['hero_title_line1'],
        '{{hero_title_line2}}': page_config['hero_title_line2'],
        '{{hero_subtitle}}': page_config['hero_subtitle'],
        '{{section_label}}': page_config['section_label'],
        '{{section_title}}': page_config['section_title'],
        '{{section_subtitle}}': page_config['section_subtitle'],
        '{{recipe_count}}': str(recipe_count),
        '{{avg_protein}}': str(avg_protein),
        '{{site_count}}': str(site_count),
        '{{recipe_cards}}': recipe_cards,
        '{{schema_json}}': schema_json
    }
    
    for key, value in replacements.items():
        html = html.replace(key, value)
    
    # Write file
    output_path = os.path.join(page_dir, 'index.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    return recipe_count


def filter_recipes_for_page(all_recipes, slug):
    """Filter recipes based on page type."""
    if slug == 'post-workout':
        return [r for r in all_recipes if r.get('intent_class') == 'post-workout']
    elif slug == 'meal-prep':
        return [r for r in all_recipes if r.get('intent_class') == 'meal-prep']
    elif slug == 'kid-friendly':
        return [r for r in all_recipes if r.get('intent_class') == 'kid-friendly']
    elif slug == 'quick-snacks':
        return [r for r in all_recipes if r.get('intent_class') == 'quick-snack']
    elif slug == '30g-protein':
        return [r for r in all_recipes if r.get('intent_class') == 'high-protein-30g']
    elif slug == 'vegan':
        return [r for r in all_recipes if r.get('intent_class') == 'vegan']
    elif slug == 'gluten-free':
        return [r for r in all_recipes if r.get('intent_class') == 'gluten-free']
    elif slug == 'under-200-calories':
        return [r for r in all_recipes if r.get('calories', 999) < 200]
    elif slug == '10-minute-recipes':
        return [r for r in all_recipes if r.get('prep_time_minutes', 999) <= 10]
    elif slug == 'high-fiber':
        return [r for r in all_recipes if r.get('fiber', 0) >= 5]
    elif slug == 'under-5g-sugar':
        return [r for r in all_recipes if r.get('sugar', 999) < 5]
    elif slug == 'under-10g-carbs':
        return [r for r in all_recipes if r.get('carbs', 999) < 10]
    else:
        return all_recipes


def main():
    # Determine paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.dirname(os.path.dirname(script_dir))
    
    feed_path = os.path.join(base_path, 'apps', 'highprotein.recipes', 'dist', 'feed', 'recipes.json')
    output_dir = os.path.join(base_path, 'apps', 'highprotein.recipes', 'dist')
    
    print("=" * 60)
    print("MODERN LANDING PAGE GENERATOR")
    print("=" * 60)
    print(f"Feed path: {feed_path}")
    print(f"Output dir: {output_dir}")
    
    # Load feed
    with open(feed_path, 'r', encoding='utf-8') as f:
        feed = json.load(f)
    
    all_recipes = feed['recipes']
    print(f"Loaded {len(all_recipes)} recipes from feed")
    
    # Load template
    template = load_template()
    print("Loaded modern template")
    
    print("\n" + "=" * 60)
    print("GENERATING LANDING PAGES")
    print("=" * 60)
    
    # Generate each landing page
    total_pages = 0
    for slug, page_config in INTENT_PAGES.items():
        recipes = filter_recipes_for_page(all_recipes, slug)
        if recipes:
            count = generate_landing_page(page_config, recipes, output_dir, template)
            print(f"  ✅ /{slug}/ - {count} recipes")
            total_pages += 1
        else:
            print(f"  ⚠️  /{slug}/ - No matching recipes, skipped")
    
    print(f"\nGenerated {total_pages} modern landing pages")
    
    print("\n" + "=" * 60)
    print("LANDING PAGE URLS")
    print("=" * 60)
    for slug in INTENT_PAGES.keys():
        print(f"  https://highprotein.recipes/{slug}/")


if __name__ == '__main__':
    main()
