"""
Macro-Based Landing Page Generator for HighProtein.Recipes
Generates dynamic landing pages based on nutritional thresholds.

Examples:
- /under-200-calories/ - Low calorie recipes
- /under-10g-carbs/ - Low carb recipes
- /under-5g-sugar/ - Low sugar recipes
"""

import json
import os
from datetime import datetime

# Macro filter configurations
MACRO_FILTERS = {
    'under-200-calories': {
        'title': 'Under 200 Calorie Protein Recipes',
        'subtitle': 'Low-Cal, High-Protein',
        'slug': 'under-200-calories',
        'description': 'Delicious protein recipes with under 200 calories per serving. Perfect for cutting, weight loss, or anyone watching their calorie intake.',
        'long_description': 'Watching your calories doesn\'t mean sacrificing protein or flavor. These recipes are carefully crafted to deliver maximum protein with minimal calories, making them perfect for weight loss or cutting phases.',
        'keywords': ['low calorie protein', 'under 200 calories', 'diet protein recipes', 'weight loss snacks'],
        'filter_fn': lambda r: r.get('calories', 999) < 200,
        'sort_key': lambda r: r.get('calories', 999),
        'sort_reverse': False,
        'stat_label': 'Avg Calories',
        'stat_fn': lambda recipes: f"{sum(r.get('calories', 0) for r in recipes) // len(recipes) if recipes else 0}",
        'icon': '🔥',
        'color': '#ef4444'
    },
    'under-10g-carbs': {
        'title': 'Under 10g Carbs Protein Recipes',
        'subtitle': 'Keto & Low-Carb Friendly',
        'slug': 'under-10g-carbs',
        'description': 'High-protein recipes with under 10g of carbs per serving. Perfect for keto, low-carb, or diabetic-friendly diets.',
        'long_description': 'Following a keto or low-carb diet? These recipes deliver all the protein you need while keeping carbs to a minimum. Each recipe has under 10g of carbs per serving.',
        'keywords': ['low carb protein', 'keto protein recipes', 'under 10g carbs', 'diabetic friendly'],
        'filter_fn': lambda r: r.get('carbs', 999) < 10,
        'sort_key': lambda r: r.get('carbs', 999),
        'sort_reverse': False,
        'stat_label': 'Avg Carbs',
        'stat_fn': lambda recipes: f"{sum(r.get('carbs', 0) for r in recipes) // len(recipes) if recipes else 0}g",
        'icon': '🥑',
        'color': '#22c55e'
    },
    'under-5g-sugar': {
        'title': 'Under 5g Sugar Protein Recipes',
        'subtitle': 'Low Sugar, High Protein',
        'slug': 'under-5g-sugar',
        'description': 'Satisfy your sweet tooth without the sugar spike. These protein recipes have under 5g of sugar per serving.',
        'long_description': 'Cutting back on sugar doesn\'t mean giving up on treats. These recipes are naturally low in sugar while still delivering great taste and plenty of protein.',
        'keywords': ['low sugar protein', 'sugar free recipes', 'diabetic protein snacks', 'no sugar added'],
        'filter_fn': lambda r: r.get('sugar', 999) < 5,
        'sort_key': lambda r: r.get('sugar', 999),
        'sort_reverse': False,
        'stat_label': 'Avg Sugar',
        'stat_fn': lambda recipes: f"{sum(r.get('sugar', 0) for r in recipes) // len(recipes) if recipes else 0}g",
        'icon': '🍬',
        'color': '#ec4899'
    },
    'high-fiber': {
        'title': 'High Fiber Protein Recipes',
        'subtitle': 'Fiber + Protein Power',
        'slug': 'high-fiber',
        'description': 'Get your fiber and protein in one delicious package. These recipes have 5g or more of fiber per serving.',
        'long_description': 'Fiber is essential for digestive health and satiety. These recipes combine high fiber with high protein for the ultimate satisfying snack or meal.',
        'keywords': ['high fiber protein', 'fiber rich recipes', 'gut health recipes', 'filling protein snacks'],
        'filter_fn': lambda r: r.get('fiber', 0) >= 5,
        'sort_key': lambda r: r.get('fiber', 0),
        'sort_reverse': True,
        'stat_label': 'Avg Fiber',
        'stat_fn': lambda recipes: f"{sum(r.get('fiber', 0) for r in recipes) // len(recipes) if recipes else 0}g",
        'icon': '🌾',
        'color': '#a855f7'
    },
    'quick-10-minutes': {
        'title': '10-Minute Protein Recipes',
        'subtitle': 'Ready in a Flash',
        'slug': '10-minute-recipes',
        'description': 'No time? No problem. These protein recipes are ready in 10 minutes or less. Perfect for busy mornings or post-workout fuel.',
        'long_description': 'When you\'re short on time, these recipes have you covered. Each one can be made in 10 minutes or less, so you can fuel up fast without sacrificing nutrition.',
        'keywords': ['10 minute recipes', 'quick protein', 'fast healthy recipes', 'easy protein snacks'],
        'filter_fn': lambda r: r.get('prep_time_minutes', 999) <= 10,
        'sort_key': lambda r: r.get('prep_time_minutes', 999),
        'sort_reverse': False,
        'stat_label': 'Avg Time',
        'stat_fn': lambda recipes: f"{sum(r.get('prep_time_minutes', 0) for r in recipes) // len(recipes) if recipes else 0} min",
        'icon': '⏱️',
        'color': '#f59e0b'
    }
}

# Site configuration
SITE_CONFIG = {
    'name': 'HighProtein.Recipes',
    'domain': 'highprotein.recipes',
    'brand_color': '#f59e0b',
    'logo_url': '/images/logo.png'
}


def generate_macro_page_html(macro_key, macro_config, recipes):
    """Generate the full HTML for a macro-based landing page."""
    
    # Generate recipe cards HTML
    recipe_cards_html = ""
    for recipe in recipes:
        recipe_cards_html += f'''
            <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <a href="{recipe['canonical_url']}" target="_blank" rel="noopener" class="block">
                    <div class="relative overflow-hidden">
                        <img src="{recipe['image_url']}" alt="{recipe['title']}" 
                             class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                             loading="lazy">
                        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-semibold text-brand-600">
                            {recipe['protein_grams']}g protein
                        </div>
                        <div class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                            {recipe['calories']} cal
                        </div>
                        <div class="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                            {recipe['site_name']}
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-lg text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">{recipe['title']}</h3>
                        <div class="flex items-center gap-4 text-sm text-slate-500">
                            <span>{recipe.get('carbs', 0)}g carbs</span>
                            <span>{recipe.get('fat', 0)}g fat</span>
                            <span>{recipe.get('sugar', 0)}g sugar</span>
                        </div>
                    </div>
                </a>
            </article>
'''
    
    # Generate ItemList schema
    item_list_items = []
    for i, recipe in enumerate(recipes, 1):
        item_list_items.append({
            "@type": "ListItem",
            "position": i,
            "url": recipe['canonical_url'],
            "name": recipe['title']
        })
    
    item_list_json = json.dumps({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": macro_config['title'],
        "description": macro_config['description'],
        "numberOfItems": len(recipes),
        "itemListElement": item_list_items
    }, indent=2)
    
    # Calculate stat
    stat_value = macro_config['stat_fn'](recipes)
    
    # Generate the full HTML
    html = f'''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{macro_config['title']} | {SITE_CONFIG['name']}</title>
<meta name="description" content="{macro_config['description']}">
<meta name="keywords" content="{', '.join(macro_config['keywords'])}">
<link rel="canonical" href="https://{SITE_CONFIG['domain']}/{macro_config['slug']}/">
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE_CONFIG['name']}">
<meta property="og:title" content="{macro_config['title']}">
<meta property="og:description" content="{macro_config['description']}">
<meta property="og:url" content="https://{SITE_CONFIG['domain']}/{macro_config['slug']}/">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{macro_config['title']}">
<meta name="twitter:description" content="{macro_config['description']}">
<!-- Theme & Favicon -->
<meta name="theme-color" content="{macro_config['color']}">
<link rel="icon" type="image/png" href="/images/favicon.png">
<!-- Schema.org ItemList -->
<script type="application/ld+json">
{item_list_json}
</script>
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {{
        theme: {{
            extend: {{
                fontFamily: {{
                    'anton': ['Anton', 'sans-serif'],
                    'sans': ['Inter', 'sans-serif'],
                }},
                colors: {{
                    brand: {{
                        50: '#fffbeb',
                        100: '#fef3c7',
                        500: '{macro_config['color']}',
                        600: '{macro_config['color']}',
                        900: '#451a03',
                    }}
                }}
            }}
        }}
    }}
</script>
<style>
    .line-clamp-2 {{ display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }}
</style>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">

<!-- Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <a href="/" class="flex items-center gap-2">
                <img src="{SITE_CONFIG['logo_url']}" alt="{SITE_CONFIG['name']}" class="h-10 w-10 rounded-full">
                <span class="font-anton text-xl text-slate-900 tracking-tight uppercase">HighProtein<span class="text-brand-500">.Recipes</span></span>
            </a>
            <div class="hidden md:flex items-center gap-6">
                <a href="/" class="text-slate-600 hover:text-slate-900 font-medium transition-colors">Home</a>
                <a href="/under-200-calories/" class="text-slate-600 hover:text-slate-900 font-medium transition-colors">Low Calorie</a>
                <a href="/under-10g-carbs/" class="text-slate-600 hover:text-slate-900 font-medium transition-colors">Low Carb</a>
                <a href="/high-fiber/" class="text-slate-600 hover:text-slate-900 font-medium transition-colors">High Fiber</a>
            </div>
        </div>
    </div>
</nav>

<!-- Hero Section -->
<section class="pt-24 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center max-w-3xl mx-auto">
            <span class="inline-block text-5xl mb-4">{macro_config['icon']}</span>
            <p class="text-brand-500 uppercase tracking-wider font-semibold mb-2">{macro_config['subtitle']}</p>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-anton uppercase tracking-tight mb-6">{macro_config['title']}</h1>
            <p class="text-xl text-slate-300 mb-8">{macro_config['long_description']}</p>
            <a href="#recipes" class="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25">
                Browse {len(recipes)} Recipes
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </a>
        </div>
    </div>
</section>

<!-- Stats Bar -->
<section class="bg-white border-b border-slate-200 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
                <div class="text-3xl font-bold text-brand-500">{len(recipes)}</div>
                <div class="text-sm text-slate-500">Recipes</div>
            </div>
            <div>
                <div class="text-3xl font-bold text-brand-500">{stat_value}</div>
                <div class="text-sm text-slate-500">{macro_config['stat_label']}</div>
            </div>
            <div>
                <div class="text-3xl font-bold text-brand-500">{sum(r['protein_grams'] for r in recipes) // len(recipes) if recipes else 0}g</div>
                <div class="text-sm text-slate-500">Avg Protein</div>
            </div>
            <div>
                <div class="text-3xl font-bold text-brand-500">Free</div>
                <div class="text-sm text-slate-500">All Recipes</div>
            </div>
        </div>
    </div>
</section>

<!-- Recipe Grid -->
<section id="recipes" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-slate-900 mb-4">All {macro_config['title']}</h2>
            <p class="text-slate-600 max-w-2xl mx-auto">Browse our complete collection. Click any recipe to view the full details on our specialized sites.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipe_cards_html}
        </div>
    </div>
</section>

<!-- Related Categories -->
<section class="py-16 bg-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-slate-900 mb-8 text-center">Explore By Nutrition</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <a href="/under-200-calories/" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
                <span class="text-3xl mb-2 block">🔥</span>
                <span class="font-semibold text-slate-900 group-hover:text-brand-500 transition-colors text-sm">Under 200 Cal</span>
            </a>
            <a href="/under-10g-carbs/" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
                <span class="text-3xl mb-2 block">🥑</span>
                <span class="font-semibold text-slate-900 group-hover:text-brand-500 transition-colors text-sm">Under 10g Carbs</span>
            </a>
            <a href="/under-5g-sugar/" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
                <span class="text-3xl mb-2 block">🍬</span>
                <span class="font-semibold text-slate-900 group-hover:text-brand-500 transition-colors text-sm">Under 5g Sugar</span>
            </a>
            <a href="/high-fiber/" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
                <span class="text-3xl mb-2 block">🌾</span>
                <span class="font-semibold text-slate-900 group-hover:text-brand-500 transition-colors text-sm">High Fiber</span>
            </a>
            <a href="/10-minute-recipes/" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
                <span class="text-3xl mb-2 block">⏱️</span>
                <span class="font-semibold text-slate-900 group-hover:text-brand-500 transition-colors text-sm">10-Minute</span>
            </a>
        </div>
    </div>
</section>

<!-- Footer -->
<footer class="bg-slate-900 text-slate-400 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
            <p class="font-anton text-2xl text-white mb-4">HighProtein<span class="text-brand-500">.Recipes</span></p>
            <p class="mb-6">The ultimate high-protein recipe index. Part of the Protein Empire.</p>
            <p class="text-sm">&copy; {datetime.now().year} Protein Empire. All rights reserved.</p>
        </div>
    </div>
</footer>

</body>
</html>'''
    
    return html


def generate_all_macro_pages(feed_path, output_dir):
    """Generate landing pages for all macro filters."""
    
    # Load the feed
    with open(feed_path, 'r', encoding='utf-8') as f:
        feed = json.load(f)
    
    recipes = feed.get('recipes', [])
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 50)
    print("GENERATING MACRO-BASED LANDING PAGES")
    print("=" * 50)
    
    generated_pages = []
    
    # Generate a landing page for each macro filter
    for macro_key, macro_config in MACRO_FILTERS.items():
        # Filter recipes
        filtered_recipes = [r for r in recipes if macro_config['filter_fn'](r)]
        
        if len(filtered_recipes) < 2:
            print(f"  ⚠️  Skipping {macro_key}: only {len(filtered_recipes)} recipes match")
            continue
        
        # Sort recipes
        filtered_recipes.sort(key=macro_config['sort_key'], reverse=macro_config['sort_reverse'])
        
        # Generate the HTML
        html = generate_macro_page_html(macro_key, macro_config, filtered_recipes)
        
        # Create directory for the landing page
        page_dir = os.path.join(output_dir, macro_config['slug'])
        os.makedirs(page_dir, exist_ok=True)
        
        # Write the file
        output_path = os.path.join(page_dir, 'index.html')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        generated_pages.append({
            'macro': macro_key,
            'slug': macro_config['slug'],
            'recipes': len(filtered_recipes),
            'path': output_path
        })
        
        print(f"  ✅ /{macro_config['slug']}/ - {len(filtered_recipes)} recipes")
    
    print()
    print(f"Generated {len(generated_pages)} macro-based landing pages")
    
    return generated_pages


def main():
    # Determine paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.dirname(os.path.dirname(script_dir))
    
    feed_path = os.path.join(base_path, 'apps', 'highprotein.recipes', 'dist', 'feed', 'recipes.json')
    output_dir = os.path.join(base_path, 'apps', 'highprotein.recipes', 'dist')
    
    print(f"Feed path: {feed_path}")
    print(f"Output dir: {output_dir}")
    print()
    
    # Generate macro pages
    pages = generate_all_macro_pages(feed_path, output_dir)
    
    print()
    print("=" * 50)
    print("MACRO PAGE URLS")
    print("=" * 50)
    for page in pages:
        print(f"  https://highprotein.recipes/{page['slug']}/")


if __name__ == '__main__':
    main()
