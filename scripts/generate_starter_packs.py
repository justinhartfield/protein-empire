#!/usr/bin/env python3
"""
Generate pack-starter.html and success-starter.html pages for all sites in the Protein Empire.
"""

import json
import os

# Site configurations
# Emoji to icon image mapping
EMOJI_TO_ICON = {
    "🍞": "bread.png",
    "🍫": "chocolate-bar.png",
    "🟤": "protein-bites.png",
    "🟫": "brownies.png",
    "🍰": "cheesecake.png",
    "🍩": "donuts.png",
    "🥣": "oatmeal.png",
    "🥞": "pancakes.png",
    "🍕": "pizza.png",
    "🍮": "pudding.png",
    "💪": "flexed-arm.png",
    "🛒": "shopping-cart.png",
    "📊": "nutrition-chart.png",
    "💡": "lightbulb.png",
    "✅": "sparkle.png",
    "🍪": "cookies.png",
}

def get_icon_html(emoji, size="96"):
    """Convert emoji to icon image HTML."""
    icon_file = EMOJI_TO_ICON.get(emoji, "sparkle.png")
    return f'<img src="/images/icons/{icon_file}" alt="" class="mx-auto object-contain" style="width: {size}px; height: {size}px;">'

SITES = {
    "protein-bread.com": {
        "name": "ProteinBread",
        "name_upper": "PROTEINBREAD",
        "domain": "protein-bread.com",
        "url": "https://protein-bread.com",
        "recipe_dir": "protein-bread-com",
        "emoji": "🍞",
        "description": "High-protein bread, bagels, and rolls for macro-conscious bakers",
        "item_type": "bread",
        "item_type_plural": "bread recipes"
    },
    "proteinbars.co": {
        "name": "ProteinBars",
        "name_upper": "PROTEINBARS",
        "domain": "proteinbars.co",
        "url": "https://proteinbars.co",
        "recipe_dir": "proteinbars-co",
        "emoji": "🍫",
        "description": "Macro-verified protein bar recipes with precise nutrition data",
        "item_type": "bar",
        "item_type_plural": "bar recipes"
    },
    "proteinbites.co": {
        "name": "ProteinBites",
        "name_upper": "PROTEINBITES",
        "domain": "proteinbites.co",
        "url": "https://proteinbites.co",
        "recipe_dir": "proteinbites-co",
        "emoji": "🟤",
        "description": "Macro-verified protein bite recipes with precise nutrition data",
        "item_type": "bite",
        "item_type_plural": "bite recipes"
    },
    "proteinbrownies.co": {
        "name": "ProteinBrownies",
        "name_upper": "PROTEINBROWNIES",
        "domain": "proteinbrownies.co",
        "url": "https://proteinbrownies.co",
        "recipe_dir": "proteinbrownies-co",
        "emoji": "🟫",
        "description": "Macro-verified protein brownie recipes with precise nutrition data",
        "item_type": "brownie",
        "item_type_plural": "brownie recipes"
    },
    "proteincheesecake.co": {
        "name": "ProteinCheesecake",
        "name_upper": "PROTEINCHEESECAKE",
        "domain": "proteincheesecake.co",
        "url": "https://proteincheesecake.co",
        "recipe_dir": "proteincheesecake-co",
        "emoji": "🍰",
        "description": "Macro-verified protein cheesecake recipes with precise nutrition data",
        "item_type": "cheesecake",
        "item_type_plural": "cheesecake recipes"
    },
    "proteindonuts.co": {
        "name": "ProteinDonuts",
        "name_upper": "PROTEINDONUTS",
        "domain": "proteindonuts.co",
        "url": "https://proteindonuts.co",
        "recipe_dir": "proteindonuts-co",
        "emoji": "🍩",
        "description": "Macro-verified protein donut recipes with precise nutrition data",
        "item_type": "donut",
        "item_type_plural": "donut recipes"
    },
    "proteinoatmeal.co": {
        "name": "ProteinOatmeal",
        "name_upper": "PROTEINOATMEAL",
        "domain": "proteinoatmeal.co",
        "url": "https://proteinoatmeal.co",
        "recipe_dir": "proteinoatmeal-co",
        "emoji": "🥣",
        "description": "Macro-verified protein oatmeal recipes with precise nutrition data",
        "item_type": "oatmeal",
        "item_type_plural": "oatmeal recipes"
    },
    "proteinpancakes.co": {
        "name": "ProteinPancakes",
        "name_upper": "PROTEINPANCAKES",
        "domain": "proteinpancakes.co",
        "url": "https://proteinpancakes.co",
        "recipe_dir": "proteinpancakes-co",
        "emoji": "🥞",
        "description": "Macro-verified protein pancake recipes with precise nutrition data",
        "item_type": "pancake",
        "item_type_plural": "pancake recipes"
    },
    "proteinpizzas.co": {
        "name": "ProteinPizzas",
        "name_upper": "PROTEINPIZZAS",
        "domain": "proteinpizzas.co",
        "url": "https://proteinpizzas.co",
        "recipe_dir": "proteinpizzas-co",
        "emoji": "🍕",
        "description": "Macro-verified protein pizza recipes with precise nutrition data",
        "item_type": "pizza",
        "item_type_plural": "pizza recipes"
    },
    "proteinpudding.co": {
        "name": "ProteinPudding",
        "name_upper": "PROTEINPUDDING",
        "domain": "proteinpudding.co",
        "url": "https://proteinpudding.co",
        "recipe_dir": "proteinpudding-co",
        "emoji": "🍮",
        "description": "Macro-verified protein pudding recipes with precise nutrition data",
        "item_type": "pudding",
        "item_type_plural": "pudding recipes"
    },
    "highprotein.recipes": {
        "name": "HighProtein.Recipes",
        "name_upper": "HIGHPROTEIN.RECIPES",
        "domain": "highprotein.recipes",
        "url": "https://highprotein.recipes",
        "recipe_dir": None,  # This is the main site, may have different structure
        "emoji": "💪",
        "description": "The ultimate collection of high-protein recipes",
        "item_type": "recipe",
        "item_type_plural": "recipes"
    }
}

# Empire links for footer
EMPIRE_LINKS = """
                <a href="https://proteinmuffins.com" class="hover:text-white transition">Muffins</a>
                <a href="https://proteincookies.co" class="hover:text-white transition">Cookies</a>
                <a href="https://proteinpancakes.co" class="hover:text-white transition">Pancakes</a>
                <a href="https://proteinbrownies.co" class="hover:text-white transition">Brownies</a>
                <a href="https://protein-bread.com" class="hover:text-white transition">Bread</a>
                <a href="https://proteinbars.co" class="hover:text-white transition">Bars</a>
                <a href="https://proteinbites.co" class="hover:text-white transition">Bites</a>
                <a href="https://proteindonuts.co" class="hover:text-white transition">Donuts</a>
                <a href="https://proteinoatmeal.co" class="hover:text-white transition">Oatmeal</a>
                <a href="https://proteincheesecake.co" class="hover:text-white transition">Cheesecake</a>
                <a href="https://proteinpizzas.co" class="hover:text-white transition">Pizza</a>
                <a href="https://proteinpudding.co" class="hover:text-white transition">Pudding</a>
"""


def load_recipes(recipe_dir):
    """Load recipes from JSON file."""
    base_path = os.path.join(os.path.dirname(__file__), "..", "data", "recipes", recipe_dir)
    recipes_file = os.path.join(base_path, "recipes.json")
    
    if os.path.exists(recipes_file):
        with open(recipes_file, 'r') as f:
            data = json.load(f)
            return data.get('recipes', data) if isinstance(data, dict) else data
    return []


def get_starter_recipes(recipes, count=5):
    """Select 5 diverse recipes for the starter pack."""
    if not recipes:
        return []
    
    # Sort by protein content and pick top 5 diverse ones
    sorted_recipes = sorted(recipes, key=lambda r: r.get('protein', 0), reverse=True)
    
    # Try to get variety - pick from different parts of the list
    selected = []
    step = max(1, len(sorted_recipes) // count)
    
    for i in range(0, min(count * step, len(sorted_recipes)), step):
        if len(selected) < count:
            selected.append(sorted_recipes[i])
    
    # Fill remaining slots if needed
    while len(selected) < count and len(selected) < len(sorted_recipes):
        for r in sorted_recipes:
            if r not in selected:
                selected.append(r)
                break
    
    return selected[:count]


def generate_recipe_cards(recipes, site_config):
    """Generate HTML for recipe cards in the starter pack."""
    cards = []
    for recipe in recipes:
        slug = recipe.get('slug', '')
        title = recipe.get('title', 'Recipe')
        protein = recipe.get('protein', 20)
        calories = recipe.get('calories', 200)
        total_time = recipe.get('totalTime', '30')
        
        card = f'''
                    <div class="flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-200">
                        <img src="/recipe_images/{slug}.png" alt="{title}" class="w-20 h-20 rounded-lg object-cover">
                        <div class="flex-grow">
                            <h3 class="font-semibold text-slate-900">{title}</h3>
                            <p class="text-sm text-slate-500">{calories} cal • {total_time}m</p>
                        </div>
                        <div class="text-right">
                            <span class="bg-accent-500 text-white text-lg font-bold px-3 py-1 rounded-lg">{protein}g</span>
                            <p class="text-xs text-slate-500 mt-1">protein</p>
                        </div>
                    </div>'''
        cards.append(card)
    
    return '\n'.join(cards)


def generate_pack_starter_html(site_config, recipes):
    """Generate pack-starter.html content."""
    
    recipe_cards = generate_recipe_cards(recipes, site_config)
    recipe_count = len(recipes)
    
    # Get first recipe image for OG image
    first_recipe_slug = recipes[0].get('slug', '') if recipes else ''
    og_image = f"{site_config['url']}/recipe_images/{first_recipe_slug}.png" if first_recipe_slug else f"{site_config['url']}/images/logo.png"
    
    html = f'''
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Starter Pack | Free Download | {site_config['name']}</title>

<!-- SEO Meta Tags -->
<meta name="description" content="{recipe_count} essential protein {site_config['item_type_plural']} to get you started. Perfect for beginners! Download our free PDF with {recipe_count} macro-verified recipes.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{site_config['url']}/pack-starter.html">

<!-- Open Graph / Social Sharing -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="{site_config['name']}">
<meta property="og:title" content="Starter Pack | Free Download | {site_config['name']}">
<meta property="og:description" content="{recipe_count} essential protein {site_config['item_type_plural']} to get you started. Perfect for beginners! Download our free PDF with {recipe_count} macro-verified recipes.">
<meta property="og:image" content="{og_image}">
<meta property="og:url" content="{site_config['url']}/pack-starter.html">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Starter Pack | Free Download | {site_config['name']}">
<meta name="twitter:description" content="{recipe_count} essential protein {site_config['item_type_plural']} to get you started. Perfect for beginners! Download our free PDF with {recipe_count} macro-verified recipes.">
<meta name="twitter:image" content="{og_image}">

<!-- Theme & Favicon -->
<meta name="theme-color" content="#f59e0b">
<link rel="icon" type="image/png" href="/images/favicon.png">
<link rel="apple-touch-icon" href="/images/favicon.png">

<!-- Performance: DNS Prefetch & Preconnect -->
<link rel="dns-prefetch" href="//cdn.tailwindcss.com">
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">



<!-- Scripts -->
<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>



<!-- Tailwind Config -->
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
                        500: '#f59e0b',
                        600: '#d97706',
                        900: '#451a03',
                    }},
                    accent: {{
                        500: '#10b981',
                    }}
                }}
            }}
        }}
    }}
</script>

<style>
    [x-cloak] {{ display: none !important; }}
    .glass-nav {{
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }}
    .anton-text {{
        font-family: 'Anton', sans-serif;
        letter-spacing: 0.05em;
    }}
    .recipe-card:hover .recipe-overlay {{ opacity: 1; }}
    .recipe-shadow {{ box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.1); }}
</style>

</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">


<!-- Top Navigation -->
<header class="sticky top-0 z-50 glass-nav border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
            <div class="flex items-center">
                <a href="/" class="flex items-center">
                    <img src="/images/logo.png" alt="{site_config['name']}" class="h-12 w-12 rounded-lg mr-3">
                    <span class="anton-text text-2xl text-slate-900 tracking-wider uppercase">{site_config['name_upper']}</span>
                </a>
            </div>
            <nav class="hidden md:flex space-x-8 items-center">
                <a href="/#recipes" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Recipes</a>
                <a href="/#categories" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Categories</a>
                <a href="/#packs" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Recipe Packs</a>
                <a href="/pack-starter.html" class="bg-brand-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-brand-900 transition shadow-lg shadow-brand-500/30">STARTER PACK (FREE)</a>
            </nav>
            <div class="md:hidden" x-data="{{ open: false }}">
                <button @click="open = !open" class="text-slate-900 focus:outline-none">
                    <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                </button>
                <!-- Mobile Menu -->
                <div x-show="open" x-cloak class="absolute top-20 left-0 right-0 bg-white border-b border-slate-100 p-6 space-y-4 shadow-xl">
                    <a href="/#recipes" class="block text-xl anton-text text-slate-900">RECIPES</a>
                    <a href="/#categories" class="block text-xl anton-text text-slate-900">CATEGORIES</a>
                    <a href="/#packs" class="block text-xl anton-text text-slate-900">RECIPE PACKS</a>
                    <a href="/pack-starter.html" class="block text-center w-full bg-brand-600 text-white py-4 rounded-xl font-bold anton-text text-lg">GET STARTER PACK</a>
                </div>
            </div>
        </div>
    </div>
</header>


<main class="flex-grow">
    <!-- Hero -->
    <section class="bg-slate-900 text-white py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {get_icon_html(site_config['emoji'], '96')}
            <h1 class="anton-text text-5xl md:text-6xl uppercase mb-4 tracking-wider">STARTER PACK</h1>
            <p class="text-xl text-slate-300 mb-8">{recipe_count} essential protein {site_config['item_type_plural']} to get you started. Perfect for beginners!</p>
            <div class="inline-flex items-center gap-2 bg-brand-500/20 text-brand-400 px-4 py-2 rounded-full text-sm font-semibold">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {recipe_count} Macro-Verified Recipes
            </div>
        </div>
    </section>

    <!-- What's Included -->
    <section class="py-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl text-center mb-10 uppercase tracking-wider">WHAT'S INCLUDED</h2>
            
            <div class="grid gap-4">
                {recipe_cards}
            </div>
        </div>
    </section>

    <!-- Download Form -->
    <section class="py-16 bg-brand-50">
        <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="anton-text text-3xl mb-4 uppercase tracking-wider">GET YOUR FREE COPY</h2>
            <p class="text-slate-600 mb-8">Enter your email to download the PDF instantly.</p>
            
            <form action="/success-starter.html" method="GET" class="space-y-4">
                <input type="email" name="email" placeholder="Enter your email" required
                    class="w-full px-6 py-4 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition text-lg">
                <button type="submit" class="w-full bg-brand-500 text-white px-8 py-4 rounded-xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider">
                    DOWNLOAD FREE PDF
                </button>
            </form>
            
            <p class="text-xs text-slate-500 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
    </section>

    <!-- Also Includes -->
    <section class="py-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="anton-text text-3xl text-center mb-10 uppercase tracking-wider">ALSO INCLUDES</h2>
            
            <div class="grid md:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl p-6 border border-slate-200 text-center">
                    {get_icon_html('🛒', '48')}
                    <h3 class="font-semibold mb-2">Shopping List</h3>
                    <p class="text-sm text-slate-600">Combined ingredient list organized by category</p>
                </div>
                <div class="bg-white rounded-xl p-6 border border-slate-200 text-center">
                    {get_icon_html('📊', '48')}
                    <h3 class="font-semibold mb-2">Nutrition Facts</h3>
                    <p class="text-sm text-slate-600">Complete macros for every recipe</p>
                </div>
                <div class="bg-white rounded-xl p-6 border border-slate-200 text-center">
                    {get_icon_html('💡', '48')}
                    <h3 class="font-semibold mb-2">Pro Tips</h3>
                    <p class="text-sm text-slate-600">Storage, meal prep, and substitution advice</p>
                </div>
            </div>
        </div>
    </section>
</main>


<!-- Footer -->
<footer class="bg-slate-900 text-white py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
            <!-- Brand -->
            <div class="md:col-span-1">
                <a href="/" class="flex items-center mb-4">
                    <img src="/images/logo.png" alt="{site_config['name']}" class="h-12 w-12 rounded-lg mr-3">
                    <span class="anton-text text-xl tracking-wider">{site_config['name_upper']}</span>
                </a>
                <p class="text-slate-400 text-sm">{site_config['description']}</p>
            </div>
            
            <!-- Quick Links -->
            <div>
                <h4 class="anton-text text-sm tracking-wider mb-4">RECIPES</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/category-all.html" class="hover:text-white transition">All Recipes</a></li>
                    <li><a href="/category-classic.html" class="hover:text-white transition">Classic</a></li>
                    <li><a href="/category-high-protein.html" class="hover:text-white transition">High Protein</a></li>
                    <li><a href="/category-quick.html" class="hover:text-white transition">Quick & Easy</a></li>
                </ul>
            </div>
            
            <!-- Recipe Packs -->
            <div>
                <h4 class="anton-text text-sm tracking-wider mb-4">RECIPE PACKS</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/pack-starter.html" class="hover:text-white transition">Starter Pack (Free)</a></li>
                    <li><a href="/pack-no-bake.html" class="hover:text-white transition">No-Bake Pack</a></li>
                    <li><a href="/pack-high-protein.html" class="hover:text-white transition">High Protein Pack</a></li>
                </ul>
            </div>
            
            <!-- Legal -->
            <div>
                <h4 class="anton-text text-sm tracking-wider mb-4">LEGAL</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/privacy.html" class="hover:text-white transition">Privacy Policy</a></li>
                    <li><a href="/terms.html" class="hover:text-white transition">Terms of Use</a></li>
                </ul>
            </div>
        </div>
        
        <!-- Empire Links -->
        <div class="mt-12 pt-8 border-t border-slate-800">
            <p class="text-slate-500 text-xs text-center mb-4">Part of the Protein Recipe Empire</p>
            <div class="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
{EMPIRE_LINKS}
            </div>
        </div>
        
        <div class="mt-8 text-center text-slate-500 text-xs">
            <p>&copy; 2026 <a href="https://HighProtein.Recipes" class="hover:text-amber-400 transition-colors">High Protein Recipes</a>. All recipes macro-verified using USDA FoodData Central.</p>
        </div>
    </div>
</footer>


</body>
</html>
'''
    return html


def generate_success_starter_html(site_config):
    """Generate success-starter.html content."""
    
    # PDF filename format
    pdf_filename = f"{site_config['recipe_dir']}-starter.pdf" if site_config['recipe_dir'] else "starter.pdf"
    
    html = f'''
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Download Starter Pack | {site_config['name']}</title>

<!-- SEO Meta Tags -->
<meta name="description" content="Download your free Starter Pack PDF.">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="{site_config['url']}/success-starter.html">

<!-- Open Graph / Social Sharing -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="{site_config['name']}">
<meta property="og:title" content="Download Starter Pack | {site_config['name']}">
<meta property="og:description" content="Download your free Starter Pack PDF.">
<meta property="og:image" content="{site_config['url']}/images/logo.png">
<meta property="og:url" content="{site_config['url']}/success-starter.html">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Download Starter Pack | {site_config['name']}">
<meta name="twitter:description" content="Download your free Starter Pack PDF.">
<meta name="twitter:image" content="{site_config['url']}/images/logo.png">

<!-- Theme & Favicon -->
<meta name="theme-color" content="#f59e0b">
<link rel="icon" type="image/png" href="/images/favicon.png">
<link rel="apple-touch-icon" href="/images/favicon.png">

<!-- Performance: DNS Prefetch & Preconnect -->
<link rel="dns-prefetch" href="//cdn.tailwindcss.com">
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">



<!-- Scripts -->
<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>



<!-- Tailwind Config -->
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
                        500: '#f59e0b',
                        600: '#d97706',
                        900: '#451a03',
                    }},
                    accent: {{
                        500: '#10b981',
                    }}
                }}
            }}
        }}
    }}
</script>

<style>
    [x-cloak] {{ display: none !important; }}
    .glass-nav {{
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }}
    .anton-text {{
        font-family: 'Anton', sans-serif;
        letter-spacing: 0.05em;
    }}
    .recipe-card:hover .recipe-overlay {{ opacity: 1; }}
    .recipe-shadow {{ box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.1); }}
</style>

</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">


<!-- Top Navigation -->
<header class="sticky top-0 z-50 glass-nav border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
            <div class="flex items-center">
                <a href="/" class="flex items-center">
                    <img src="/images/logo.png" alt="{site_config['name']}" class="h-12 w-12 rounded-lg mr-3">
                    <span class="anton-text text-2xl text-slate-900 tracking-wider uppercase">{site_config['name_upper']}</span>
                </a>
            </div>
            <nav class="hidden md:flex space-x-8 items-center">
                <a href="/#recipes" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Recipes</a>
                <a href="/#categories" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Categories</a>
                <a href="/#packs" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Recipe Packs</a>
                <a href="/pack-starter.html" class="bg-brand-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-brand-900 transition shadow-lg shadow-brand-500/30">STARTER PACK (FREE)</a>
            </nav>
            <div class="md:hidden" x-data="{{ open: false }}">
                <button @click="open = !open" class="text-slate-900 focus:outline-none">
                    <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                </button>
                <!-- Mobile Menu -->
                <div x-show="open" x-cloak class="absolute top-20 left-0 right-0 bg-white border-b border-slate-100 p-6 space-y-4 shadow-xl">
                    <a href="/#recipes" class="block text-xl anton-text text-slate-900">RECIPES</a>
                    <a href="/#categories" class="block text-xl anton-text text-slate-900">CATEGORIES</a>
                    <a href="/#packs" class="block text-xl anton-text text-slate-900">RECIPE PACKS</a>
                    <a href="/pack-starter.html" class="block text-center w-full bg-brand-600 text-white py-4 rounded-xl font-bold anton-text text-lg">GET STARTER PACK</a>
                </div>
            </div>
        </div>
    </div>
</header>


<main class="flex-grow py-20">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {get_icon_html('✅', '96')}
        <h1 class="anton-text text-4xl uppercase mb-4 tracking-wider">YOU'RE ALL SET!</h1>
        <p class="text-xl text-slate-600 mb-8">Your Starter Pack is ready to download.</p>
        
        <a href="/guides/{pdf_filename}" download
            class="inline-flex items-center gap-3 bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider mb-8">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            DOWNLOAD PDF
        </a>
        
        <p class="text-slate-500 mb-12">Having trouble? Check your downloads folder or <a href="/pack-starter.html" class="text-brand-600 hover:underline">try again</a>.</p>
        
        <div class="border-t border-slate-200 pt-12">
            <h2 class="anton-text text-2xl uppercase mb-6 tracking-wider">EXPLORE MORE RECIPES</h2>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="/" class="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold">
                    All Recipes
                </a>
                <a href="/#packs" class="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold">
                    More Recipe Packs
                </a>
            </div>
        </div>
    </div>
</main>


<!-- Footer -->
<footer class="bg-slate-900 text-white py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
            <!-- Brand -->
            <div class="md:col-span-1">
                <a href="/" class="flex items-center mb-4">
                    <img src="/images/logo.png" alt="{site_config['name']}" class="h-12 w-12 rounded-lg mr-3">
                    <span class="anton-text text-xl tracking-wider">{site_config['name_upper']}</span>
                </a>
                <p class="text-slate-400 text-sm">{site_config['description']}</p>
            </div>
            
            <!-- Quick Links -->
            <div>
                <h4 class="anton-text text-sm tracking-wider mb-4">RECIPES</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/category-all.html" class="hover:text-white transition">All Recipes</a></li>
                    <li><a href="/category-classic.html" class="hover:text-white transition">Classic</a></li>
                    <li><a href="/category-high-protein.html" class="hover:text-white transition">High Protein</a></li>
                    <li><a href="/category-quick.html" class="hover:text-white transition">Quick & Easy</a></li>
                </ul>
            </div>
            
            <!-- Recipe Packs -->
            <div>
                <h4 class="anton-text text-sm tracking-wider mb-4">RECIPE PACKS</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/pack-starter.html" class="hover:text-white transition">Starter Pack (Free)</a></li>
                    <li><a href="/pack-no-bake.html" class="hover:text-white transition">No-Bake Pack</a></li>
                    <li><a href="/pack-high-protein.html" class="hover:text-white transition">High Protein Pack</a></li>
                </ul>
            </div>
            
            <!-- Legal -->
            <div>
                <h4 class="anton-text text-sm tracking-wider mb-4">LEGAL</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/privacy.html" class="hover:text-white transition">Privacy Policy</a></li>
                    <li><a href="/terms.html" class="hover:text-white transition">Terms of Use</a></li>
                </ul>
            </div>
        </div>
        
        <!-- Empire Links -->
        <div class="mt-12 pt-8 border-t border-slate-800">
            <p class="text-slate-500 text-xs text-center mb-4">Part of the Protein Recipe Empire</p>
            <div class="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
{EMPIRE_LINKS}
            </div>
        </div>
        
        <div class="mt-8 text-center text-slate-500 text-xs">
            <p>&copy; 2026 <a href="https://HighProtein.Recipes" class="hover:text-amber-400 transition-colors">High Protein Recipes</a>. All recipes macro-verified using USDA FoodData Central.</p>
        </div>
    </div>
</footer>


</body>
</html>
'''
    return html


def main():
    """Main function to generate starter pack pages for all sites."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    apps_dir = os.path.join(base_dir, "apps")
    
    # Sites that need starter pack pages (excluding proteincookies.co which already has one)
    sites_to_process = [
        "protein-bread.com",
        "proteinbars.co",
        "proteinbites.co",
        "proteinbrownies.co",
        "proteincheesecake.co",
        "proteindonuts.co",
        "proteinoatmeal.co",
        "proteinpancakes.co",
        "proteinpizzas.co",
        "proteinpudding.co",
        "highprotein.recipes"
    ]
    
    for site_domain in sites_to_process:
        site_config = SITES.get(site_domain)
        if not site_config:
            print(f"⚠️  No config found for {site_domain}, skipping...")
            continue
        
        # Determine site directory name
        site_dir = site_domain
        dist_dir = os.path.join(apps_dir, site_dir, "dist")
        
        if not os.path.exists(dist_dir):
            print(f"⚠️  Directory not found: {dist_dir}, skipping...")
            continue
        
        # Load recipes
        recipes = []
        if site_config['recipe_dir']:
            recipes = load_recipes(site_config['recipe_dir'])
        
        # Get starter recipes (5 recipes)
        starter_recipes = get_starter_recipes(recipes, 5)
        
        if not starter_recipes:
            print(f"⚠️  No recipes found for {site_domain}, using placeholder...")
            # Create placeholder recipes
            starter_recipes = [
                {"slug": "recipe-1", "title": f"Classic Protein {site_config['item_type'].title()}", "protein": 25, "calories": 200, "totalTime": "30"},
                {"slug": "recipe-2", "title": f"High Protein {site_config['item_type'].title()}", "protein": 30, "calories": 220, "totalTime": "35"},
                {"slug": "recipe-3", "title": f"Easy Protein {site_config['item_type'].title()}", "protein": 22, "calories": 180, "totalTime": "25"},
                {"slug": "recipe-4", "title": f"Quick Protein {site_config['item_type'].title()}", "protein": 20, "calories": 190, "totalTime": "20"},
                {"slug": "recipe-5", "title": f"Delicious Protein {site_config['item_type'].title()}", "protein": 24, "calories": 210, "totalTime": "30"},
            ]
        
        # Generate pack-starter.html
        pack_starter_html = generate_pack_starter_html(site_config, starter_recipes)
        pack_starter_path = os.path.join(dist_dir, "pack-starter.html")
        with open(pack_starter_path, 'w') as f:
            f.write(pack_starter_html)
        print(f"✅ Created: {pack_starter_path}")
        
        # Generate success-starter.html
        success_starter_html = generate_success_starter_html(site_config)
        success_starter_path = os.path.join(dist_dir, "success-starter.html")
        with open(success_starter_path, 'w') as f:
            f.write(success_starter_html)
        print(f"✅ Created: {success_starter_path}")
    
    print("\n🎉 All starter pack pages generated successfully!")


if __name__ == "__main__":
    main()
