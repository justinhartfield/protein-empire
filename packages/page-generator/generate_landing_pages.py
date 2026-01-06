"""
Intent-Based Landing Page Generator for HighProtein.Recipes
Generates dynamic landing pages based on intent classes.

These pages serve as ad destinations for Dotoro campaigns.
All recipe links point OUT to ProteinXYZ.co sites (portal model).
"""

import json
import os
from collections import defaultdict
from datetime import datetime

# Intent class configurations with SEO-optimized content
INTENT_CLASSES = {
    'post-workout': {
        'title': 'Post-Workout Protein Recipes',
        'subtitle': 'Fuel Your Recovery',
        'slug': 'post-workout',
        'description': 'Discover our collection of high-protein recipes perfect for post-workout recovery. Each recipe is designed to help rebuild muscle and replenish energy stores after intense training.',
        'long_description': 'After a tough workout, your body needs protein to repair and build muscle. Our post-workout recipes are specifically designed to deliver the protein you need in delicious, easy-to-make formats. From protein cookies to shakes, find the perfect recovery fuel here.',
        'keywords': ['post workout protein', 'muscle recovery recipes', 'gym snacks', 'protein after workout'],
        'cta_text': 'Get Your Free Post-Workout Recipe Pack',
        'pack_slug': 'high-protein',
        'icon': '💪',
        'color': '#ef4444'
    },
    'meal-prep': {
        'title': 'Meal Prep Protein Recipes',
        'subtitle': 'Plan Your Week Like a Pro',
        'slug': 'meal-prep',
        'description': 'Make your week easier with our meal prep-friendly protein recipes. These recipes store well, taste great for days, and help you hit your macros consistently.',
        'long_description': 'Meal prepping is the secret weapon of fitness enthusiasts everywhere. Our meal prep recipes are designed to be made in batches, store perfectly in the fridge or freezer, and taste just as good on day 5 as they did on day 1.',
        'keywords': ['meal prep recipes', 'batch cooking protein', 'weekly meal prep', 'protein meal prep'],
        'cta_text': 'Download Our Meal Prep Guide',
        'pack_slug': 'starter',
        'icon': '📦',
        'color': '#3b82f6'
    },
    'kid-friendly': {
        'title': 'Kid-Friendly Protein Recipes',
        'subtitle': 'Healthy Treats Kids Actually Love',
        'slug': 'kid-friendly',
        'description': 'Sneak more protein into your kids\' diet with these delicious, kid-approved recipes. Perfect for lunchboxes, after-school snacks, and picky eaters.',
        'long_description': 'Getting kids to eat healthy can be a challenge, but these protein-packed recipes are so delicious they won\'t even know they\'re good for them. From protein cookies to pancakes, these recipes are parent-approved and kid-tested.',
        'keywords': ['protein snacks for kids', 'healthy kids recipes', 'lunchbox ideas', 'protein for children'],
        'cta_text': 'Download Our Kids\' Recipe Pack',
        'pack_slug': 'kids',
        'icon': '👶',
        'color': '#ec4899'
    },
    'quick-snack': {
        'title': 'Quick Protein Snacks',
        'subtitle': 'Ready in 15 Minutes or Less',
        'slug': 'quick-snacks',
        'description': 'Short on time? These quick protein snacks are ready in 15 minutes or less. Perfect for busy schedules, pre-workout fuel, or anytime you need a protein boost.',
        'long_description': 'We get it - life is busy. That\'s why we\'ve curated our fastest, easiest protein recipes. Each one can be made in 15 minutes or less, so you can fuel your body without spending hours in the kitchen.',
        'keywords': ['quick protein snack', '15 minute recipes', 'fast protein', 'easy protein snacks'],
        'cta_text': 'Get Your Free Quick Snacks Pack',
        'pack_slug': 'no-bake',
        'icon': '⚡',
        'color': '#f59e0b'
    },
    'high-protein-30g': {
        'title': '30g+ Protein Recipes',
        'subtitle': 'Maximum Protein Power',
        'slug': '30g-protein',
        'description': 'For serious gains, these recipes pack 30 grams or more of protein per serving. Ideal for athletes, bodybuilders, and anyone looking to maximize their protein intake.',
        'long_description': 'When you\'re serious about building muscle, every gram of protein counts. These recipes are specifically designed to deliver 30g or more of protein per serving, making it easier than ever to hit your daily protein goals.',
        'keywords': ['30g protein recipe', 'high protein meal', 'maximum protein', 'bodybuilding recipes'],
        'cta_text': 'Download Our 30g+ Muscle Pack',
        'pack_slug': 'high-protein',
        'icon': '🏋️',
        'color': '#dc2626'
    },
    'vegan': {
        'title': 'Vegan Protein Recipes',
        'subtitle': 'Plant-Powered Protein',
        'slug': 'vegan',
        'description': 'Delicious plant-based protein recipes that prove you don\'t need animal products to hit your protein goals. 100% vegan, 100% delicious.',
        'long_description': 'Plant-based eating doesn\'t mean sacrificing protein. Our vegan recipes use innovative ingredients like pea protein, hemp, and legumes to deliver satisfying, high-protein treats that are completely animal-free.',
        'keywords': ['vegan protein recipes', 'plant based protein', 'vegan high protein', 'dairy free protein'],
        'cta_text': 'Get Your Free Vegan Recipe Pack',
        'pack_slug': 'starter',
        'icon': '🌱',
        'color': '#22c55e'
    },
    'gluten-free': {
        'title': 'Gluten-Free Protein Recipes',
        'subtitle': 'Safe & Delicious',
        'slug': 'gluten-free',
        'description': 'Enjoy high-protein treats without the gluten. These recipes are perfect for those with celiac disease, gluten sensitivity, or anyone avoiding gluten.',
        'long_description': 'Living gluten-free doesn\'t mean missing out on delicious protein treats. Our gluten-free recipes use alternative flours and carefully selected ingredients to deliver all the protein without any of the gluten.',
        'keywords': ['gluten free protein', 'celiac friendly recipes', 'gf protein snacks', 'gluten free baking'],
        'cta_text': 'Download Our Gluten-Free Pack',
        'pack_slug': 'gluten-free-dairy-free',
        'icon': '🌾',
        'color': '#a855f7'
    }
}

# Site configuration for HighProtein.Recipes
SITE_CONFIG = {
    'name': 'HighProtein.Recipes',
    'domain': 'highprotein.recipes',
    'brand_color': '#f59e0b',
    'logo_url': '/images/logo.png'
}


def generate_landing_page_html(intent_key, intent_config, recipes):
    """Generate the full HTML for a landing page."""
    
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
                        <div class="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                            {recipe['site_name']}
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-lg text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">{recipe['title']}</h3>
                        <div class="flex items-center gap-4 text-sm text-slate-500">
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {recipe['prep_time_minutes']} min
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg>
                                {recipe['calories']} cal
                            </span>
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
        "name": intent_config['title'],
        "description": intent_config['description'],
        "numberOfItems": len(recipes),
        "itemListElement": item_list_items
    }, indent=2)
    
    # Generate the full HTML
    html = f'''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{intent_config['title']} | {SITE_CONFIG['name']}</title>
<meta name="description" content="{intent_config['description']}">
<meta name="keywords" content="{', '.join(intent_config['keywords'])}">
<link rel="canonical" href="https://{SITE_CONFIG['domain']}/{intent_config['slug']}/">
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE_CONFIG['name']}">
<meta property="og:title" content="{intent_config['title']}">
<meta property="og:description" content="{intent_config['description']}">
<meta property="og:url" content="https://{SITE_CONFIG['domain']}/{intent_config['slug']}/">
<meta property="og:image" content="https://{SITE_CONFIG['domain']}/images/og-{intent_config['slug']}.png">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{intent_config['title']}">
<meta name="twitter:description" content="{intent_config['description']}">
<!-- Theme & Favicon -->
<meta name="theme-color" content="{intent_config['color']}">
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
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
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
                        500: '{intent_config['color']}',
                        600: '{intent_config['color']}',
                        900: '#451a03',
                    }}
                }}
            }}
        }}
    }}
</script>
<style>
    [x-cloak] {{ display: none !important; }}
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
                <a href="/quick-snacks/" class="text-slate-600 hover:text-slate-900 font-medium transition-colors">Quick Snacks</a>
                <a href="/30g-protein/" class="text-slate-600 hover:text-slate-900 font-medium transition-colors">30g+ Protein</a>
                <a href="/vegan/" class="text-slate-600 hover:text-slate-900 font-medium transition-colors">Vegan</a>
            </div>
        </div>
    </div>
</nav>

<!-- Hero Section -->
<section class="pt-24 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center max-w-3xl mx-auto">
            <span class="inline-block text-5xl mb-4">{intent_config['icon']}</span>
            <p class="text-brand-500 uppercase tracking-wider font-semibold mb-2">{intent_config['subtitle']}</p>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-anton uppercase tracking-tight mb-6">{intent_config['title']}</h1>
            <p class="text-xl text-slate-300 mb-8">{intent_config['long_description']}</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#recipes" class="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25">
                    Browse {len(recipes)} Recipes
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </a>
                <a href="#download" class="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all backdrop-blur-sm border border-white/20">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Free PDF Pack
                </a>
            </div>
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
                <div class="text-3xl font-bold text-brand-500">11</div>
                <div class="text-sm text-slate-500">Sites</div>
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
            <h2 class="text-3xl font-bold text-slate-900 mb-4">All {intent_config['title']}</h2>
            <p class="text-slate-600 max-w-2xl mx-auto">Browse our complete collection of {intent_config['title'].lower()}. Click any recipe to view the full details on our specialized sites.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipe_cards_html}
        </div>
    </div>
</section>

<!-- CTA Section -->
<section id="download" class="py-16 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-block text-5xl mb-4">📥</span>
        <h2 class="text-3xl md:text-4xl font-bold mb-4">{intent_config['cta_text']}</h2>
        <p class="text-xl text-white/80 mb-8">Get our best {intent_config['title'].lower()} in a beautifully designed PDF. Free download, no signup required.</p>
        <a href="/guides/{intent_config['pack_slug']}.pdf" class="inline-flex items-center justify-center gap-2 bg-white text-brand-600 px-8 py-4 rounded-xl font-semibold hover:bg-brand-50 transition-all shadow-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download Free PDF
        </a>
    </div>
</section>

<!-- Related Categories -->
<section class="py-16 bg-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-slate-900 mb-8 text-center">Explore More Categories</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/quick-snacks/" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
                <span class="text-3xl mb-2 block">⚡</span>
                <span class="font-semibold text-slate-900 group-hover:text-brand-500 transition-colors">Quick Snacks</span>
            </a>
            <a href="/30g-protein/" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
                <span class="text-3xl mb-2 block">🏋️</span>
                <span class="font-semibold text-slate-900 group-hover:text-brand-500 transition-colors">30g+ Protein</span>
            </a>
            <a href="/vegan/" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
                <span class="text-3xl mb-2 block">🌱</span>
                <span class="font-semibold text-slate-900 group-hover:text-brand-500 transition-colors">Vegan</span>
            </a>
            <a href="/gluten-free/" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
                <span class="text-3xl mb-2 block">🌾</span>
                <span class="font-semibold text-slate-900 group-hover:text-brand-500 transition-colors">Gluten-Free</span>
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

<!-- Sticky CTA (Mobile) -->
<div class="fixed bottom-0 left-0 right-0 bg-brand-500 text-white py-3 px-4 shadow-lg z-40 md:hidden">
    <a href="#download" class="flex items-center justify-center gap-2 font-semibold">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        Get Free PDF Pack
    </a>
</div>

</body>
</html>'''
    
    return html


def generate_all_landing_pages(feed_path, output_dir):
    """Generate landing pages for all intent classes."""
    
    # Load the feed
    with open(feed_path, 'r', encoding='utf-8') as f:
        feed = json.load(f)
    
    recipes = feed.get('recipes', [])
    
    # Group recipes by intent class
    recipes_by_intent = defaultdict(list)
    for recipe in recipes:
        intent = recipe.get('intent_class', 'quick-snack')
        recipes_by_intent[intent].append(recipe)
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 50)
    print("GENERATING LANDING PAGES")
    print("=" * 50)
    
    generated_pages = []
    
    # Generate a landing page for each intent class
    for intent_key, intent_config in INTENT_CLASSES.items():
        intent_recipes = recipes_by_intent.get(intent_key, [])
        
        if len(intent_recipes) < 2:
            print(f"  ⚠️  Skipping {intent_key}: only {len(intent_recipes)} recipes")
            continue
        
        # Sort recipes by protein content (highest first)
        intent_recipes.sort(key=lambda r: r.get('protein_grams', 0), reverse=True)
        
        # Generate the HTML
        html = generate_landing_page_html(intent_key, intent_config, intent_recipes)
        
        # Create directory for the landing page (for clean URLs)
        page_dir = os.path.join(output_dir, intent_config['slug'])
        os.makedirs(page_dir, exist_ok=True)
        
        # Write the file
        output_path = os.path.join(page_dir, 'index.html')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        generated_pages.append({
            'intent': intent_key,
            'slug': intent_config['slug'],
            'recipes': len(intent_recipes),
            'path': output_path
        })
        
        print(f"  ✅ /{intent_config['slug']}/ - {len(intent_recipes)} recipes")
    
    print()
    print(f"Generated {len(generated_pages)} landing pages")
    
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
    
    # Generate landing pages
    pages = generate_all_landing_pages(feed_path, output_dir)
    
    print()
    print("=" * 50)
    print("LANDING PAGE URLS")
    print("=" * 50)
    for page in pages:
        print(f"  https://highprotein.recipes/{page['slug']}/")


if __name__ == '__main__':
    main()
