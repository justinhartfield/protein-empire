#!/usr/bin/env python3
"""
Landing Page Generator v3 - Modern Branded Design
Generates intent-based and macro-based landing pages for HighProtein.Recipes
using the new branded template with conversion components.
"""

import json
import os
from pathlib import Path

# Configuration
REPO_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = REPO_ROOT / "data" / "recipes"
OUTPUT_DIR = REPO_ROOT / "apps" / "highprotein.recipes" / "dist"
TEMPLATE_DIR = Path(__file__).parent / "templates"

# Site domain mappings
SITE_DOMAINS = {
    "proteincookies": "proteincookies.co",
    "proteinbrownies": "proteinbrownies.co",
    "proteinpancakes": "proteinpancakes.co",
    "proteinmuffins": "proteinmuffins.com",
    "proteindonuts": "proteindonuts.co",
    "proteinbars": "proteinbars.co",
    "proteinbites": "proteinbites.co",
    "proteinbread": "proteinbread.co",
    "proteinpizzas": "proteinpizzas.co",
    "proteincheesecake": "proteincheesecake.co",
    "proteinicecream": "proteinicecream.co",
}

# Landing page configurations
INTENT_PAGES = {
    "meal-prep": {
        "slug": "meal-prep",
        "title": "Meal Prep Protein Recipes",
        "hero_line1": "High-Protein",
        "hero_line2": "Meal Prep Recipes",
        "subtitle": "Batch-friendly recipes that stay fresh all week. Prep once, eat healthy every day with perfectly portioned protein meals.",
        "collection_label": "Collection: Meal Prep",
        "pdf_pack_name": "Meal Prep Starter Pack",
        "filter_field": "intent_class",
        "filter_value": "meal-prep",
        "keywords": "meal prep protein, batch cooking, weekly meal prep, high protein meal prep"
    },
    "post-workout": {
        "slug": "post-workout",
        "title": "Post-Workout Protein Recipes",
        "hero_line1": "Post-Workout",
        "hero_line2": "Recovery Recipes",
        "subtitle": "Fuel your recovery with high-protein recipes designed for optimal muscle repair. Quick to make, delicious to eat.",
        "collection_label": "Collection: Post-Workout",
        "pdf_pack_name": "Post-Workout Recipe Pack",
        "filter_field": "intent_class",
        "filter_value": "post-workout",
        "keywords": "post workout protein, recovery meals, muscle building recipes"
    },
    "quick-snacks": {
        "slug": "quick-snacks",
        "title": "Quick Protein Snacks",
        "hero_line1": "Quick & Easy",
        "hero_line2": "Protein Snacks",
        "subtitle": "Ready in 15 minutes or less. Perfect for busy days when you need a protein boost without the hassle.",
        "collection_label": "Collection: Quick Snacks",
        "pdf_pack_name": "Quick Snacks Recipe Pack",
        "filter_field": "intent_class",
        "filter_value": "quick-snack",
        "keywords": "quick protein snacks, easy high protein, 15 minute recipes"
    },
    "30g-protein": {
        "slug": "30g-protein",
        "title": "30g+ Protein Recipes",
        "hero_line1": "30+ Grams",
        "hero_line2": "Protein Recipes",
        "subtitle": "Maximum protein per serving. These recipes pack a serious protein punch for serious fitness goals.",
        "collection_label": "Collection: 30g+ Protein",
        "pdf_pack_name": "High-Protein Power Pack",
        "filter_field": "intent_class",
        "filter_value": "high-protein-30g",
        "keywords": "30g protein recipes, high protein meals, maximum protein"
    },
    "vegan": {
        "slug": "vegan",
        "title": "Vegan Protein Recipes",
        "hero_line1": "Plant-Based",
        "hero_line2": "Protein Recipes",
        "subtitle": "100% plant-based protein recipes that prove you don't need animal products to hit your protein goals.",
        "collection_label": "Collection: Vegan",
        "pdf_pack_name": "Vegan Protein Pack",
        "filter_field": "intent_class",
        "filter_value": "vegan",
        "keywords": "vegan protein recipes, plant based protein, vegan high protein"
    },
    "gluten-free": {
        "slug": "gluten-free",
        "title": "Gluten-Free Protein Recipes",
        "hero_line1": "Gluten-Free",
        "hero_line2": "Protein Recipes",
        "subtitle": "Delicious high-protein recipes without the gluten. Perfect for celiac-friendly or gluten-sensitive diets.",
        "collection_label": "Collection: Gluten-Free",
        "pdf_pack_name": "Gluten-Free Recipe Pack",
        "filter_field": "intent_class",
        "filter_value": "gluten-free",
        "keywords": "gluten free protein, celiac friendly recipes, gf high protein"
    },
    "kid-friendly": {
        "slug": "kid-friendly",
        "title": "Kid-Friendly Protein Recipes",
        "hero_line1": "Kid-Approved",
        "hero_line2": "Protein Treats",
        "subtitle": "Healthy protein snacks that kids actually want to eat. Sneak in the nutrition without the complaints.",
        "collection_label": "Collection: Kid-Friendly",
        "pdf_pack_name": "Kids Recipe Pack",
        "filter_field": "intent_class",
        "filter_value": "kid-friendly",
        "keywords": "kid friendly protein, healthy kids snacks, protein for kids"
    },
}

MACRO_PAGES = {
    "under-200-calories": {
        "slug": "under-200-calories",
        "title": "Under 200 Calorie Protein Recipes",
        "hero_line1": "Under 200",
        "hero_line2": "Calorie Recipes",
        "subtitle": "High protein, low calorie. Perfect for cutting or maintaining while still hitting your protein targets.",
        "collection_label": "Collection: Low Calorie",
        "pdf_pack_name": "Low-Cal Recipe Pack",
        "filter_func": lambda r: r.get("calories", 999) < 200,
        "keywords": "low calorie protein, under 200 calories, diet protein recipes"
    },
    "10-minute-recipes": {
        "slug": "10-minute-recipes",
        "title": "10-Minute Protein Recipes",
        "hero_line1": "10-Minute",
        "hero_line2": "Protein Recipes",
        "subtitle": "No time? No problem. These recipes are ready in 10 minutes or less without sacrificing taste or nutrition.",
        "collection_label": "Collection: Quick & Easy",
        "pdf_pack_name": "10-Minute Recipe Pack",
        "filter_func": lambda r: r.get("prep_time_minutes", 999) <= 10,
        "keywords": "10 minute protein, quick protein recipes, fast high protein"
    },
    "high-fiber": {
        "slug": "high-fiber",
        "title": "High-Fiber Protein Recipes",
        "hero_line1": "High-Fiber",
        "hero_line2": "Protein Recipes",
        "subtitle": "Double the benefits with recipes high in both protein and fiber. Great for digestion and satiety.",
        "collection_label": "Collection: High Fiber",
        "pdf_pack_name": "High-Fiber Recipe Pack",
        "filter_func": lambda r: r.get("fiber", 0) >= 5,
        "keywords": "high fiber protein, fiber rich recipes, protein and fiber"
    },
    "under-5g-sugar": {
        "slug": "under-5g-sugar",
        "title": "Low Sugar Protein Recipes",
        "hero_line1": "Under 5g",
        "hero_line2": "Sugar Recipes",
        "subtitle": "Sweet treats without the sugar spike. All the protein, minimal sugar for blood sugar-friendly eating.",
        "collection_label": "Collection: Low Sugar",
        "pdf_pack_name": "Low-Sugar Recipe Pack",
        "filter_func": lambda r: r.get("sugar", 999) < 5,
        "keywords": "low sugar protein, sugar free recipes, keto protein"
    },
    "under-10g-carbs": {
        "slug": "under-10g-carbs",
        "title": "Low Carb Protein Recipes",
        "hero_line1": "Under 10g",
        "hero_line2": "Carb Recipes",
        "subtitle": "Keto-friendly and low-carb protein recipes. Perfect for carb-conscious eating without sacrificing protein.",
        "collection_label": "Collection: Low Carb",
        "pdf_pack_name": "Low-Carb Recipe Pack",
        "filter_func": lambda r: r.get("carbs", 999) < 10,
        "keywords": "low carb protein, keto protein recipes, under 10g carbs"
    },
}


def load_all_recipes():
    """Load all recipes from all site data directories."""
    all_recipes = []
    
    # Site name to domain mapping (handle different folder naming conventions)
    site_folder_to_domain = {
        "proteincookies-co": "proteincookies.co",
        "proteinbrownies-co": "proteinbrownies.co",
        "proteinpancakes-co": "proteinpancakes.co",
        "proteinmuffins-com": "proteinmuffins.com",
        "proteindonuts-co": "proteindonuts.co",
        "proteinbars-co": "proteinbars.co",
        "proteinbites-co": "proteinbites.co",
        "protein-bread-com": "proteinbread.co",
        "proteinpizzas-co": "proteinpizzas.co",
        "proteincheesecake-co": "proteincheesecake.co",
        "proteinicecream-co": "proteinicecream.co",
        "proteinoatmeal-co": "proteinoatmeal.co",
        "proteinpudding-co": "proteinpudding.co",
    }
    
    site_folder_to_name = {
        "proteincookies-co": "ProteinCookies",
        "proteinbrownies-co": "ProteinBrownies",
        "proteinpancakes-co": "ProteinPancakes",
        "proteinmuffins-com": "ProteinMuffins",
        "proteindonuts-co": "ProteinDonuts",
        "proteinbars-co": "ProteinBars",
        "proteinbites-co": "ProteinBites",
        "protein-bread-com": "ProteinBread",
        "proteinpizzas-co": "ProteinPizzas",
        "proteincheesecake-co": "ProteinCheesecake",
        "proteinicecream-co": "ProteinIceCream",
        "proteinoatmeal-co": "ProteinOatmeal",
        "proteinpudding-co": "ProteinPudding",
    }
    
    for site_dir in DATA_DIR.iterdir():
        if not site_dir.is_dir():
            continue
        
        site_folder = site_dir.name
        domain = site_folder_to_domain.get(site_folder, f"{site_folder.replace('-', '.')}") 
        site_name = site_folder_to_name.get(site_folder, site_folder)
        
        # Look for recipes.json file
        recipes_file = site_dir / "recipes.json"
        if recipes_file.exists():
            try:
                with open(recipes_file, 'r') as f:
                    data = json.load(f)
                
                # Handle both {"recipes": [...]} and [...] formats
                recipes_list = data.get('recipes', data) if isinstance(data, dict) else data
                
                if not isinstance(recipes_list, list):
                    continue
                
                for recipe in recipes_list:
                    if not isinstance(recipe, dict):
                        continue
                    
                    # Get slug
                    slug = recipe.get('slug', '')
                    if not slug:
                        continue
                    
                    # Add computed fields
                    recipe['site_name'] = site_name
                    recipe['site_domain'] = domain
                    recipe['canonical_url'] = f"https://{domain}/{slug}.html"
                    recipe['image_url'] = f"https://{domain}/recipe_images/{slug}.jpg"
                    
                    # Extract nutrition (handle flat structure)
                    recipe['protein_grams'] = recipe.get('protein', 0)
                    recipe['calories'] = recipe.get('calories', 0)
                    recipe['carbs'] = recipe.get('carbs', 0)
                    recipe['fat'] = recipe.get('fat', 0)
                    recipe['fiber'] = recipe.get('fiber', 0)
                    recipe['sugar'] = recipe.get('sugar', 0)
                    
                    # Prep time (handle string or int)
                    prep_time = recipe.get('prepTime', '20')
                    recipe['prep_time_minutes'] = int(prep_time) if isinstance(prep_time, str) else prep_time
                    recipe['servings'] = recipe.get('yield', recipe.get('servings', '12'))
                    
                    all_recipes.append(recipe)
                    
            except Exception as e:
                print(f"Error loading {recipes_file}: {e}")
    
    return all_recipes


def generate_recipe_card(recipe):
    """Generate HTML for a single recipe card."""
    return f'''
    <article class="group bg-white rounded-3xl overflow-hidden recipe-card-shadow transition-all-custom hover:-translate-y-2">
        <div class="relative h-56 overflow-hidden">
            <img src="{recipe['image_url']}" alt="{recipe['title']}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy">
            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-900">
                {recipe['protein_grams']}g Protein
            </div>
            <div class="absolute top-4 right-4 bg-brand-900/70 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-white">
                {recipe['site_name']}
            </div>
        </div>
        <div class="p-5">
            <div class="flex items-center gap-4 text-xs font-semibold text-brand-600 mb-2">
                <span>{recipe['prep_time_minutes']} min</span> • <span>{recipe['servings']} Servings</span>
            </div>
            <h3 class="text-lg font-bold text-brand-900 mb-3 group-hover:text-brand-500 transition-colors">{recipe['title']}</h3>
            <div class="flex items-center justify-between mt-4">
                <span class="text-sm font-medium text-brand-600/70">{recipe['calories']} kcal</span>
                <a href="{recipe['canonical_url']}" target="_blank" rel="noopener" class="text-xs font-bold text-brand-500 underline underline-offset-4 decoration-brand-500/30 hover:decoration-brand-500 transition-all">VIEW RECIPE →</a>
            </div>
        </div>
    </article>'''


def generate_schema(page_config, recipes):
    """Generate Schema.org ItemList markup."""
    items = []
    for i, recipe in enumerate(recipes[:50], 1):  # Limit to 50 for schema
        items.append({
            "@type": "ListItem",
            "position": i,
            "url": recipe['canonical_url'],
            "name": recipe['title']
        })
    
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": page_config['title'],
        "description": page_config['subtitle'],
        "numberOfItems": len(recipes),
        "itemListElement": items
    }, indent=2)



def generate_inline_cta(pdf_pack_name, variant=0):
    """Generate an inline CTA banner to insert between recipe rows."""
    messages = [
        ("Want all these recipes in a PDF?", f'Download our "{pdf_pack_name}" containing all recipes with shopping lists and macro breakdowns.'),
        ("Save hours of meal planning!", f'Get the complete "{pdf_pack_name}" with printable shopping lists and prep guides.'),
        ("Never lose a recipe again!", f'Download the "{pdf_pack_name}" - all recipes organized and ready to print.'),
    ]
    title, subtitle = messages[variant % len(messages)]
    
    return f'''
    </div>
    <!-- Inline CTA Banner -->
    <div class="my-8 relative overflow-hidden rounded-2xl cta-gradient p-6 md:p-8 text-white no-print">
        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="max-w-lg text-center md:text-left">
                <h3 class="anton-text text-2xl md:text-3xl mb-2">{title}</h3>
                <p class="text-white/80 text-base leading-relaxed">{subtitle}</p>
            </div>
            <div class="w-full md:w-auto flex-shrink-0">
                <button onclick="window.openLeadMagnet && window.openLeadMagnet()" class="w-full md:w-auto px-8 py-3 bg-white hover:bg-brand-50 text-brand-700 font-bold rounded-full transition-all shadow-lg flex items-center justify-center gap-2 group">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download PDF Pack
                </button>
            </div>
        </div>
        <div class="absolute -bottom-8 -right-8 w-48 h-48 bg-white/5 organic-shape pointer-events-none"></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    '''


def generate_landing_page(page_config, recipes, template):
    """Generate a complete landing page from config and recipes."""
    
    # Generate recipe cards HTML with inline CTAs every 9 recipes (3 rows)
    cards_parts = []
    cta_variant = 0
    for i, recipe in enumerate(recipes):
        cards_parts.append(generate_recipe_card(recipe))
        # Insert CTA after every 9 recipes (3 rows of 3)
        if (i + 1) % 9 == 0 and i < len(recipes) - 1:
            cards_parts.append(generate_inline_cta(page_config['pdf_pack_name'], cta_variant))
            cta_variant += 1
    
    cards_html = '\n'.join(cards_parts)
    
    # Calculate stats
    avg_protein = round(sum(r['protein_grams'] for r in recipes) / len(recipes)) if recipes else 0
    site_count = len(set(r['site_name'] for r in recipes))
    
    # Generate schema
    schema_json = generate_schema(page_config, recipes)
    
    # Fill template
    html = template
    replacements = {
        '{{page_title}}': page_config['title'],
        '{{meta_description}}': page_config['subtitle'],
        '{{keywords}}': page_config.get('keywords', ''),
        '{{canonical_url}}': f"https://highprotein.recipes/{page_config['slug']}/",
        '{{og_image}}': recipes[0]['image_url'] if recipes else 'https://highprotein.recipes/images/og-default.jpg',
        '{{collection_label}}': page_config['collection_label'],
        '{{hero_title_line1}}': page_config['hero_line1'],
        '{{hero_title_line2}}': page_config['hero_line2'],
        '{{hero_subtitle}}': page_config['subtitle'],
        '{{recipe_count}}': str(len(recipes)),
        '{{avg_protein}}': str(avg_protein),
        '{{site_count}}': str(site_count),
        '{{recipe_cards}}': cards_html,
        '{{pdf_pack_name}}': page_config['pdf_pack_name'],
        '{{schema_json}}': schema_json,
        '{{sendgrid_endpoint}}': '/api/subscribe',  # Netlify function endpoint
        '{{success_redirect}}': '/download-success/',
        '{{pdf_download_url}}': f"/downloads/{page_config['slug']}-pack.pdf"
    }
    
    for key, value in replacements.items():
        html = html.replace(key, value)
    
    return html


def main():
    print("Loading recipes...")
    all_recipes = load_all_recipes()
    print(f"Loaded {len(all_recipes)} recipes")
    
    # Load template
    template_path = TEMPLATE_DIR / "landing_page_branded.html"
    with open(template_path, 'r') as f:
        template = f.read()
    
    # Generate intent-based pages
    print("\nGenerating intent-based landing pages...")
    for page_id, config in INTENT_PAGES.items():
        # Filter recipes
        filtered = [r for r in all_recipes if r.get(config['filter_field']) == config['filter_value']]
        
        if not filtered:
            print(f"  Skipping {page_id} - no matching recipes")
            continue
        
        # Sort by protein (highest first)
        filtered.sort(key=lambda r: r['protein_grams'], reverse=True)
        
        # Generate page
        html = generate_landing_page(config, filtered, template)
        
        # Write output
        output_path = OUTPUT_DIR / config['slug'] / "index.html"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            f.write(html)
        
        print(f"  ✓ {config['slug']}/ ({len(filtered)} recipes)")
    
    # Generate macro-based pages
    print("\nGenerating macro-based landing pages...")
    for page_id, config in MACRO_PAGES.items():
        # Filter recipes using custom function
        filtered = [r for r in all_recipes if config['filter_func'](r)]
        
        if not filtered:
            print(f"  Skipping {page_id} - no matching recipes")
            continue
        
        # Sort by protein (highest first)
        filtered.sort(key=lambda r: r['protein_grams'], reverse=True)
        
        # Generate page
        html = generate_landing_page(config, filtered, template)
        
        # Write output
        output_path = OUTPUT_DIR / config['slug'] / "index.html"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            f.write(html)
        
        print(f"  ✓ {config['slug']}/ ({len(filtered)} recipes)")
    
    # Generate download success page
    print("\nGenerating download success page...")
    success_template_path = TEMPLATE_DIR / "download_success.html"
    if success_template_path.exists():
        with open(success_template_path, 'r') as f:
            success_html = f.read()
        
        # Fill in placeholders
        success_html = success_html.replace('{{pdf_pack_name}}', 'High-Protein Starter Pack')
        success_html = success_html.replace('{{pdf_download_url}}', '/downloads/starter-pack.pdf')
        success_html = success_html.replace('{{recipe_count}}', str(len(all_recipes)))
        
        output_path = OUTPUT_DIR / "download-success" / "index.html"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            f.write(success_html)
        print("  ✓ download-success/")
    
    print("\n✅ Landing page generation complete!")


if __name__ == "__main__":
    main()
