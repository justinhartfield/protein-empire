#!/usr/bin/env python3
"""
Hub Page Generator for Protein Empire Sites
Generates dynamic landing pages for Dotoro integration with:
- Interactive filtering (protein, calorie, time bands)
- URL state management for unique landing pages
- Exit intent and PDF lead magnets
- SEO-optimized meta tags
"""

import json
import os
import sys
import requests
from datetime import datetime

# Configuration - Use separate URLs for hub pages (dev) and recipes (prod)
STRAPI_HUB_URL = os.environ.get('STRAPI_HUB_URL', 'https://web-production-98f1.up.railway.app')
STRAPI_RECIPE_URL = os.environ.get('STRAPI_RECIPE_URL', 'https://web-production-98f1.up.railway.app')
STRAPI_API_TOKEN = os.environ.get('STRAPI_API_TOKEN', '')

# Brand configuration
BRAND_CONFIG = {
    'highprotein.recipes': {
        'name': 'High Protein Recipes',
        'color': '#f59e0b',
        'emoji': '💪',
        'domain': 'highprotein.recipes'
    }
}

# Filter band definitions
PROTEIN_BANDS = [
    {'id': 'all', 'label': 'All Protein', 'min': None, 'max': None},
    {'id': '20g', 'label': '20g+', 'min': 20, 'max': None},
    {'id': '30g', 'label': '30g+', 'min': 30, 'max': None},
    {'id': '40g', 'label': '40g+', 'min': 40, 'max': None},
    {'id': '50g', 'label': '50g+', 'min': 50, 'max': None},
]

CALORIE_BANDS = [
    {'id': 'all', 'label': 'All Calories', 'min': None, 'max': None},
    {'id': 'under-300', 'label': 'Under 300', 'min': None, 'max': 300},
    {'id': '300-500', 'label': '300-500', 'min': 300, 'max': 500},
    {'id': '500-700', 'label': '500-700', 'min': 500, 'max': 700},
    {'id': 'over-700', 'label': '700+', 'min': 700, 'max': None},
]

TIME_BANDS = [
    {'id': 'all', 'label': 'Any Time', 'min': None, 'max': None},
    {'id': 'under-15', 'label': 'Under 15 min', 'min': None, 'max': 15},
    {'id': '15-30', 'label': '15-30 min', 'min': 15, 'max': 30},
    {'id': '30-60', 'label': '30-60 min', 'min': 30, 'max': 60},
]


def fetch_hub_pages():
    """Fetch all hub pages from Strapi (dev instance) or local fallback"""
    headers = {'Content-Type': 'application/json'}
    if STRAPI_API_TOKEN:
        headers['Authorization'] = f'Bearer {STRAPI_API_TOKEN}'
    
    url = f'{STRAPI_HUB_URL}/api/hub-pages?populate=*&filters[isActive][$eq]=true&sort=order:asc'
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get('data', [])
    except Exception as e:
        print(f"Error fetching hub pages from API: {e}")
        # Fallback to local JSON file
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        local_file = os.path.join(base_path, 'data', 'hub-pages.json')
        if os.path.exists(local_file):
            print(f"Using local hub pages from {local_file}")
            with open(local_file, 'r') as f:
                data = json.load(f)
                return data.get('data', [])
        return []


def load_local_recipes():
    """Load all recipes from all site folders in data/recipes/"""
    all_recipes = []
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Site domain mapping
    site_domains = {
        'protein-bread-com': 'protein-bread.com',
        'proteinbars-co': 'proteinbars.co',
        'proteinbites-co': 'proteinbites.co',
        'proteinbrownies-co': 'proteinbrownies.co',
        'proteincheesecake-co': 'proteincheesecake.co',
        'proteincookies-co': 'proteincookies.co',
        'proteindonuts-co': 'proteindonuts.co',
        'proteinoatmeal-co': 'proteinoatmeal.co',
        'proteinpancakes-co': 'proteinpancakes.co',
        'proteinpizzas-co': 'proteinpizzas.co',
        'proteinpudding-co': 'proteinpudding.co',
        'proteinmuffins-com': 'proteinmuffins.com',
    }
    
    # Load from all site folders in data/recipes/
    recipes_dir = os.path.join(base_path, 'data', 'recipes')
    
    if os.path.exists(recipes_dir):
        for site_dir in os.listdir(recipes_dir):
            site_path = os.path.join(recipes_dir, site_dir)
            if os.path.isdir(site_path):
                recipes_file = os.path.join(site_path, 'recipes.json')
                if os.path.exists(recipes_file):
                    try:
                        with open(recipes_file, 'r') as f:
                            data = json.load(f)
                            # Handle nested 'recipes' key
                            recipes = data.get('recipes', data) if isinstance(data, dict) else data
                            
                            # Get the domain for this site
                            domain = site_domains.get(site_dir, site_dir.replace('-', '.'))
                            
                            for recipe in recipes:
                                # Normalize recipe format
                                recipe['site'] = site_dir
                                recipe['site_domain'] = domain
                                recipe['title'] = recipe.get('title', recipe.get('name', 'Recipe'))
                                recipe['protein'] = recipe.get('protein', recipe.get('protein_grams', 0))
                                recipe['calories'] = recipe.get('calories', 0)
                                recipe['totalTime'] = recipe.get('totalTime', recipe.get('total_time_minutes', recipe.get('total_time', 0)))
                                
                                # Build canonical URL and image URL
                                slug = recipe.get('slug', recipe.get('title', '').lower().replace(' ', '-'))
                                recipe['canonical_url'] = recipe.get('canonical_url', f'https://{domain}/{slug}.html')
                                # Use image_url from JSON if available, otherwise build from slug
                                if not recipe.get('image_url'):
                                    recipe['image_url'] = f'https://{domain}/recipe_images/{slug}.jpg'
                                
                            all_recipes.extend(recipes)
                            print(f"Loaded {len(recipes)} recipes from {site_dir}")
                    except Exception as e:
                        print(f"Error loading {recipes_file}: {e}")
    else:
        print(f"Recipes directory not found: {recipes_dir}")
    
    print(f"Total recipes loaded: {len(all_recipes)}")
    return all_recipes


def filter_local_recipes(recipes, filters=None):
    """Filter local recipes based on criteria"""
    if not filters:
        return recipes
    
    filtered = []
    for recipe in recipes:
        protein = recipe.get('protein', 0)
        calories = recipe.get('calories', 0)
        total_time = int(recipe.get('totalTime', 0) or 0)
        
        # Apply filters
        if filters.get('protein_min') and protein < filters['protein_min']:
            continue
        if filters.get('protein_max') and protein > filters['protein_max']:
            continue
        if filters.get('calorie_min') and calories < filters['calorie_min']:
            continue
        if filters.get('calorie_max') and calories > filters['calorie_max']:
            continue
        if filters.get('time_max') and total_time > filters['time_max']:
            continue
        
        filtered.append(recipe)
    
    # Sort by protein descending
    filtered.sort(key=lambda x: x.get('protein', 0), reverse=True)
    return filtered


def fetch_recipes(filters=None):
    """Fetch recipes from Strapi (production instance) with optional filters"""
    headers = {'Content-Type': 'application/json'}
    if STRAPI_API_TOKEN:
        headers['Authorization'] = f'Bearer {STRAPI_API_TOKEN}'
    
    params = ['populate[categories][fields][0]=name', 'populate[categories][fields][1]=slug',
              'populate[image][fields][0]=url', 'filters[isPublished][$eq]=true',
              'pagination[limit]=100', 'sort=protein:desc']
    
    if filters:
        if filters.get('protein_min'):
            params.append(f"filters[protein][$gte]={filters['protein_min']}")
        if filters.get('protein_max'):
            params.append(f"filters[protein][$lte]={filters['protein_max']}")
        if filters.get('calorie_min'):
            params.append(f"filters[calories][$gte]={filters['calorie_min']}")
        if filters.get('calorie_max'):
            params.append(f"filters[calories][$lte]={filters['calorie_max']}")
        if filters.get('time_max'):
            params.append(f"filters[totalTime][$lte]={filters['time_max']}")
    
    url = f'{STRAPI_RECIPE_URL}/api/recipes?{"&".join(params)}'
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get('data', [])
    except Exception as e:
        print(f"Error fetching recipes: {e}")
        return []


def generate_filter_buttons_html(filter_type, bands, default_id='all'):
    """Generate HTML for filter button group"""
    buttons = []
    for band in bands:
        active_class = 'bg-brand-500 text-white' if band['id'] == default_id else 'bg-white text-slate-700 hover:bg-brand-100'
        data_attrs = f'data-filter-type="{filter_type}" data-filter-id="{band["id"]}"'
        if band.get('min') is not None:
            data_attrs += f' data-min="{band["min"]}"'
        if band.get('max') is not None:
            data_attrs += f' data-max="{band["max"]}"'
        
        buttons.append(f'''
            <button {data_attrs}
                class="filter-btn px-4 py-2 rounded-full text-sm font-semibold transition-all {active_class} border border-slate-200">
                {band['label']}
            </button>
        ''')
    
    return '\n'.join(buttons)


def generate_recipe_card_html(recipe):
    """Generate HTML for a recipe card (handles both API and local formats)"""
    # Handle both Strapi API format (with attributes) and local JSON format
    attrs = recipe.get('attributes', recipe)
    title = attrs.get('title', 'Recipe')
    protein = attrs.get('protein', 0) or attrs.get('protein_grams', 0)
    calories = attrs.get('calories', 0)
    total_time = attrs.get('totalTime', 0) or attrs.get('total_time_minutes', 0)
    
    # Get the canonical URL for the recipe (links to the actual recipe page on its site)
    canonical_url = attrs.get('canonical_url', '')
    if not canonical_url:
        # Fallback to slug-based URL if no canonical URL
        slug = attrs.get('slug', '')
        canonical_url = f'/{slug}.html' if slug else '#'
    
    # Get the image URL from the feed data
    image_url = attrs.get('image_url', '')
    if not image_url:
        # Fallback to placeholder if no image URL
        title_safe = title[:20].replace(' ', '+').replace('"', '')
        image_url = f'https://placehold.co/400x300/f59e0b/ffffff?text={title_safe}'
    
    # Get site domain for attribution
    site_domain = attrs.get('site_domain', '')
    site_badge = f'<span class="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded-full text-slate-600">{site_domain}</span>' if site_domain else ''
    
    return f'''
        <div class="recipe-card bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
             data-protein="{protein}" data-calories="{calories}" data-time="{total_time}">
            <a href="{canonical_url}" class="block" target="_blank" rel="noopener">
                <div class="aspect-[4/3] overflow-hidden relative">
                    <img src="{image_url}" alt="{title}" 
                         class="w-full h-full object-cover transition-transform hover:scale-105"
                         loading="lazy"
                         onerror="this.src='https://placehold.co/400x300/f59e0b/ffffff?text=Recipe'">
                    {site_badge}
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-lg text-slate-900 mb-2 line-clamp-2">{title}</h3>
                    <div class="flex items-center gap-4 text-sm">
                        <span class="flex items-center gap-1 text-brand-600 font-bold">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                            </svg>
                            {protein}g protein
                        </span>
                        <span class="text-slate-500">{calories} cal</span>
                        <span class="text-slate-500">{total_time} min</span>
                    </div>
                </div>
            </a>
        </div>
    '''


def generate_hub_page_html(hub_page, recipes, brand):
    """Generate complete HTML for a hub page"""
    attrs = hub_page.get('attributes', hub_page)
    
    title = attrs.get('title', 'Hub Page')
    slug = attrs.get('slug', 'hub')
    meta_title = attrs.get('metaTitle', title)
    meta_description = attrs.get('metaDescription', '')
    hero_headline = attrs.get('heroHeadline', title)
    hero_subheadline = attrs.get('heroSubheadline', '')
    intro_content = attrs.get('introContent', '')
    cta_headline = attrs.get('ctaHeadline', 'Get Your Free Recipe Pack')
    cta_button_text = attrs.get('ctaButtonText', 'Download Free')
    cta_button_link = attrs.get('ctaButtonLink', '/recipe-packs/')
    faq_content = attrs.get('faqContent', '')
    bottom_content = attrs.get('bottomContent', '')
    
    # Generate recipe cards
    recipe_cards = '\n'.join([generate_recipe_card_html(r) for r in recipes])
    
    # Generate filter buttons
    protein_filters = generate_filter_buttons_html('protein', PROTEIN_BANDS)
    calorie_filters = generate_filter_buttons_html('calorie', CALORIE_BANDS)
    time_filters = generate_filter_buttons_html('time', TIME_BANDS)
    
    # Schema.org JSON-LD
    schema_json = json.dumps({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": meta_title,
        "description": meta_description,
        "url": f"https://{brand['domain']}/{slug}/",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": len(recipes),
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": i + 1,
                    "url": f"https://{brand['domain']}/{r.get('attributes', r).get('slug', '')}.html"
                }
                for i, r in enumerate(recipes[:10])
            ]
        }
    }, indent=2)
    
    # Build conditional sections
    intro_section = f'<section class="py-12 bg-white"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg">{intro_content}</div></section>' if intro_content else ''
    
    faq_section = f'''<section class="py-16 bg-white">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="anton-text text-3xl text-brand-900 mb-8 text-center">Frequently Asked Questions</h2>
                <div class="prose prose-lg max-w-none">{faq_content}</div>
            </div>
        </section>''' if faq_content else ''
    
    bottom_section = f'<section class="py-12 bg-slate-50"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg">{bottom_content}</div></section>' if bottom_content else ''
    
    html = f'''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{meta_title}</title>
    <meta name="description" content="{meta_description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://{brand['domain']}/{slug}/">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{meta_title}">
    <meta property="og:description" content="{meta_description}">
    <meta property="og:url" content="https://{brand['domain']}/{slug}/">
    <meta property="og:site_name" content="{brand['name']}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{meta_title}">
    <meta name="twitter:description" content="{meta_description}">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Alpine.js -->
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
                            200: '#fde68a',
                            300: '#fcd34d',
                            400: '#fbbf24',
                            500: '{brand['color']}',
                            600: '#d97706',
                            700: '#b45309',
                            800: '#92400e',
                            900: '#451a03',
                        }},
                        accent: {{
                            400: '#34d399',
                            500: '#10b981',
                            600: '#059669',
                        }}
                    }}
                }}
            }}
        }}
    </script>
    
    <style>
        [x-cloak] {{ display: none !important; }}
        body {{ background-color: #fffbeb; color: #451a03; }}
        .anton-text {{ font-family: 'Anton', sans-serif; letter-spacing: 0.02em; }}
        .glass-nav {{ background: rgba(255, 251, 235, 0.9); backdrop-filter: blur(12px); }}
        .filter-btn.active {{ background: {brand['color']}; color: white; }}
        .recipe-card {{ transition: all 0.3s ease; }}
        .recipe-card.hidden {{ display: none; }}
        .line-clamp-2 {{ display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }}
        
        /* Exit Intent Modal */
        .modal-overlay {{ background: rgba(69, 26, 3, 0.7); backdrop-filter: blur(8px); }}
        
        @media print {{ .no-print {{ display: none !important; }} }}
    </style>
    
    <script type="application/ld+json">
    {schema_json}
    </script>
</head>
<body x-data="hubPage()" class="min-h-screen flex flex-col antialiased">

    <!-- Navigation -->
    <nav class="glass-nav fixed top-0 w-full z-40 border-b border-brand-200 no-print">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="/" class="flex items-center space-x-2">
                    <span class="text-3xl">{brand['emoji']}</span>
                    <span class="anton-text text-xl" style="color: {brand['color']}">{brand['name'].upper()}</span>
                </a>
                <div class="hidden md:flex items-center space-x-6">
                    <a href="/" class="text-slate-600 hover:text-brand-600 font-semibold text-sm">Recipes</a>
                    <a href="/categories/" class="text-slate-600 hover:text-brand-600 font-semibold text-sm">Categories</a>
                    <button @click="showEmailModal = true" class="bg-brand-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-brand-600 transition cursor-pointer">
                        FREE PACK
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <main class="flex-grow pt-16">
        <!-- Hero Section -->
        <section class="bg-gradient-to-br from-brand-50 to-brand-100 py-16 md:py-24">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="anton-text text-4xl md:text-6xl lg:text-7xl text-brand-900 mb-6">
                    {hero_headline}
                </h1>
                <p class="text-lg md:text-xl text-brand-800 max-w-3xl mx-auto mb-8">
                    {hero_subheadline}
                </p>
                <div class="flex flex-wrap justify-center gap-4">
                    <a href="#recipes" class="bg-brand-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-600 transition shadow-lg">
                        Browse Recipes
                    </a>
                    <button @click="showEmailModal = true" class="bg-white text-brand-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-50 transition border-2 border-brand-500 cursor-pointer">
                        {cta_button_text}
                    </button>
                </div>
            </div>
        </section>

        <!-- Intro Content -->
        {intro_section}

        <!-- Filter Section -->
        <section id="filters" class="py-8 bg-white border-b border-slate-200 sticky top-16 z-30 no-print">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="space-y-4">
                    <!-- Protein Filter -->
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-sm font-bold text-slate-700 w-20">Protein:</span>
                        <div class="flex flex-wrap gap-2">
                            {protein_filters}
                        </div>
                    </div>
                    
                    <!-- Calorie Filter -->
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-sm font-bold text-slate-700 w-20">Calories:</span>
                        <div class="flex flex-wrap gap-2">
                            {calorie_filters}
                        </div>
                    </div>
                    
                    <!-- Time Filter -->
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-sm font-bold text-slate-700 w-20">Time:</span>
                        <div class="flex flex-wrap gap-2">
                            {time_filters}
                        </div>
                    </div>
                </div>
                
                <!-- Active Filters & Results Count -->
                <div class="mt-4 flex items-center justify-between">
                    <div class="text-sm text-slate-600">
                        <span x-text="visibleCount"></span> recipes found
                    </div>
                    <button @click="resetFilters()" class="text-sm text-brand-600 hover:text-brand-700 font-semibold">
                        Reset Filters
                    </button>
                </div>
            </div>
        </section>

        <!-- Recipe Grid -->
        <section id="recipes" class="py-12 bg-slate-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {recipe_cards}
                </div>
                
                <!-- Load More Button -->
                <div class="mt-12 text-center" x-show="hasMore">
                    <button @click="loadMore()" 
                            class="bg-brand-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-600 transition">
                        Load More Recipes
                    </button>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-16 bg-gradient-to-br from-brand-500 to-brand-600 no-print">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="anton-text text-3xl md:text-5xl text-white mb-6">
                    {cta_headline}
                </h2>
                <p class="text-lg text-brand-100 mb-8">
                    Get our top-rated high protein recipes delivered straight to your inbox.
                </p>
                <button @click="showEmailModal = true" 
                   class="bg-white text-brand-600 px-10 py-5 rounded-full font-bold text-xl hover:bg-brand-50 transition shadow-xl cursor-pointer">
                    {cta_button_text} →
                </button>
            </div>
        </section>

        <!-- FAQ Section -->
        {faq_section}

        <!-- Bottom Content -->
        {bottom_section}
    </main>

    <!-- Footer -->
    <footer class="bg-brand-900 text-brand-100 py-12 no-print">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center space-x-2 mb-4">
                        <span class="text-2xl">{brand['emoji']}</span>
                        <span class="anton-text text-lg">{brand['name']}</span>
                    </div>
                    <p class="text-sm text-brand-300">
                        Delicious high protein recipes for your fitness goals.
                    </p>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Quick Links</h4>
                    <ul class="space-y-2 text-sm">
                        <li><a href="/" class="hover:text-white transition">All Recipes</a></li>
                        <li><a href="/categories/" class="hover:text-white transition">Categories</a></li>
                        <li><a href="/recipe-packs/" class="hover:text-white transition">Recipe Packs</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Popular</h4>
                    <ul class="space-y-2 text-sm">
                        <li><a href="/hit-your-protein/" class="hover:text-white transition">Hit Your Protein</a></li>
                        <li><a href="/high-protein-under-500-calories/" class="hover:text-white transition">Under 500 Calories</a></li>
                        <li><a href="/start-high-protein/" class="hover:text-white transition">Start High Protein</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Legal</h4>
                    <ul class="space-y-2 text-sm">
                        <li><a href="/privacy/" class="hover:text-white transition">Privacy Policy</a></li>
                        <li><a href="/terms/" class="hover:text-white transition">Terms of Use</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-brand-800 mt-8 pt-8 text-center text-sm text-brand-400">
                © {datetime.now().year} {brand['name']}. All rights reserved.
            </div>
        </div>
    </footer>

    <!-- Exit Intent Modal -->
    <div x-show="showExitModal" x-cloak
         class="fixed inset-0 z-50 flex items-center justify-center modal-overlay no-print"
         @click.self="showExitModal = false">
        <div class="bg-white rounded-3xl p-8 max-w-lg mx-4 shadow-2xl" @click.stop>
            <button @click="showExitModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
            <div class="text-center">
                <span class="text-6xl mb-4 block">{brand['emoji']}</span>
                <h3 class="anton-text text-2xl text-brand-900 mb-4">Wait! Don't Miss Out!</h3>
                <p class="text-slate-600 mb-6">Get our FREE high protein recipe pack with 10 delicious recipes.</p>
                <button @click="showExitModal = false; showEmailModal = true" 
                   class="w-full bg-brand-500 text-white py-4 rounded-full font-bold text-lg hover:bg-brand-600 transition cursor-pointer">
                    Get Free Recipes →
                </button>
            </div>
        </div>
    </div>

    <!-- Email Capture Modal -->
    <div x-show="showEmailModal" x-cloak
         class="fixed inset-0 z-50 flex items-center justify-center modal-overlay no-print"
         @click.self="showEmailModal = false">
        <div class="bg-white rounded-3xl p-8 max-w-lg mx-4 shadow-2xl relative" @click.stop>
            <button @click="showEmailModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
            
            <!-- Before Submit -->
            <div x-show="!emailSubmitted" class="text-center">
                <span class="text-6xl mb-4 block">{brand['emoji']}</span>
                <h3 class="anton-text text-2xl text-brand-900 mb-2">Get Your Free Recipe Pack!</h3>
                <p class="text-slate-600 mb-6">Enter your email to receive 10 delicious high protein recipes.</p>
                <form @submit.prevent="emailSubmitted = true" class="space-y-4">
                    <input type="email" x-model="emailAddress" required
                           placeholder="Enter your email address"
                           class="w-full px-4 py-3 rounded-full border-2 border-slate-200 focus:border-brand-500 focus:outline-none text-center">
                    <button type="submit" 
                           class="w-full bg-brand-500 text-white py-4 rounded-full font-bold text-lg hover:bg-brand-600 transition">
                        Send Me Free Recipes →
                    </button>
                </form>
                <p class="text-xs text-slate-400 mt-4">No spam, unsubscribe anytime.</p>
            </div>
            
            <!-- After Submit -->
            <div x-show="emailSubmitted" class="text-center">
                <span class="text-6xl mb-4 block">🎉</span>
                <h3 class="anton-text text-2xl text-brand-900 mb-2">Check Your Inbox!</h3>
                <p class="text-slate-600 mb-6">We've sent your free recipe pack to <strong x-text="emailAddress"></strong></p>
                <button @click="showEmailModal = false" 
                       class="w-full bg-brand-500 text-white py-4 rounded-full font-bold text-lg hover:bg-brand-600 transition">
                    Continue Browsing
                </button>
            </div>
        </div>
    </div>

    <!-- Alpine.js Component -->
    <script>
        function hubPage() {{
            return {{
                filters: {{
                    protein: {{ min: null, max: null }},
                    calorie: {{ min: null, max: null }},
                    time: {{ min: null, max: null }}
                }},
                visibleCount: 0,
                hasMore: false,
                showExitModal: false,
                showEmailModal: false,
                emailSubmitted: false,
                emailAddress: '',
                exitIntentTriggered: false,
                
                init() {{
                    // Read filters from URL
                    this.readFiltersFromURL();
                    
                    // Apply initial filters
                    this.applyFilters();
                    
                    // Setup filter button listeners
                    document.querySelectorAll('.filter-btn').forEach(btn => {{
                        btn.addEventListener('click', (e) => this.handleFilterClick(e));
                    }});
                    
                    // Exit intent listener
                    document.addEventListener('mouseleave', (e) => {{
                        if (e.clientY < 0 && !this.exitIntentTriggered) {{
                            this.exitIntentTriggered = true;
                            setTimeout(() => this.showExitModal = true, 500);
                        }}
                    }});
                    
                    // Count initial recipes
                    this.updateCount();
                }},
                
                readFiltersFromURL() {{
                    const params = new URLSearchParams(window.location.search);
                    
                    if (params.get('protein')) {{
                        const btn = document.querySelector(`[data-filter-type="protein"][data-filter-id="${{params.get('protein')}}"]`);
                        if (btn) {{
                            this.filters.protein.min = btn.dataset.min ? parseInt(btn.dataset.min) : null;
                            this.filters.protein.max = btn.dataset.max ? parseInt(btn.dataset.max) : null;
                            this.setActiveButton('protein', params.get('protein'));
                        }}
                    }}
                    
                    if (params.get('calories')) {{
                        const btn = document.querySelector(`[data-filter-type="calorie"][data-filter-id="${{params.get('calories')}}"]`);
                        if (btn) {{
                            this.filters.calorie.min = btn.dataset.min ? parseInt(btn.dataset.min) : null;
                            this.filters.calorie.max = btn.dataset.max ? parseInt(btn.dataset.max) : null;
                            this.setActiveButton('calorie', params.get('calories'));
                        }}
                    }}
                    
                    if (params.get('time')) {{
                        const btn = document.querySelector(`[data-filter-type="time"][data-filter-id="${{params.get('time')}}"]`);
                        if (btn) {{
                            this.filters.time.min = btn.dataset.min ? parseInt(btn.dataset.min) : null;
                            this.filters.time.max = btn.dataset.max ? parseInt(btn.dataset.max) : null;
                            this.setActiveButton('time', params.get('time'));
                        }}
                    }}
                }},
                
                handleFilterClick(e) {{
                    const btn = e.target.closest('.filter-btn');
                    const type = btn.dataset.filterType;
                    const id = btn.dataset.filterId;
                    const min = btn.dataset.min ? parseInt(btn.dataset.min) : null;
                    const max = btn.dataset.max ? parseInt(btn.dataset.max) : null;
                    
                    // Update filter state
                    this.filters[type] = {{ min, max }};
                    
                    // Update active button styling
                    this.setActiveButton(type, id);
                    
                    // Apply filters
                    this.applyFilters();
                    
                    // Update URL
                    this.updateURL();
                }},
                
                setActiveButton(type, activeId) {{
                    document.querySelectorAll(`[data-filter-type="${{type}}"]`).forEach(btn => {{
                        if (btn.dataset.filterId === activeId) {{
                            btn.classList.remove('bg-white', 'text-slate-700', 'hover:bg-brand-100');
                            btn.classList.add('bg-brand-500', 'text-white', 'active');
                        }} else {{
                            btn.classList.add('bg-white', 'text-slate-700', 'hover:bg-brand-100');
                            btn.classList.remove('bg-brand-500', 'text-white', 'active');
                        }}
                    }});
                }},
                
                applyFilters() {{
                    const cards = document.querySelectorAll('.recipe-card');
                    
                    cards.forEach(card => {{
                        const protein = parseInt(card.dataset.protein) || 0;
                        const calories = parseInt(card.dataset.calories) || 0;
                        const time = parseInt(card.dataset.time) || 0;
                        
                        let visible = true;
                        
                        // Check protein filter
                        if (this.filters.protein.min !== null && protein < this.filters.protein.min) visible = false;
                        if (this.filters.protein.max !== null && protein > this.filters.protein.max) visible = false;
                        
                        // Check calorie filter
                        if (this.filters.calorie.min !== null && calories < this.filters.calorie.min) visible = false;
                        if (this.filters.calorie.max !== null && calories > this.filters.calorie.max) visible = false;
                        
                        // Check time filter
                        if (this.filters.time.min !== null && time < this.filters.time.min) visible = false;
                        if (this.filters.time.max !== null && time > this.filters.time.max) visible = false;
                        
                        card.classList.toggle('hidden', !visible);
                    }});
                    
                    this.updateCount();
                }},
                
                updateCount() {{
                    const visible = document.querySelectorAll('.recipe-card:not(.hidden)').length;
                    this.visibleCount = visible;
                }},
                
                updateURL() {{
                    const params = new URLSearchParams();
                    
                    // Find active filter IDs
                    ['protein', 'calorie', 'time'].forEach(type => {{
                        const activeBtn = document.querySelector(`[data-filter-type="${{type}}"].active`);
                        if (activeBtn && activeBtn.dataset.filterId !== 'all') {{
                            const paramName = type === 'calorie' ? 'calories' : type;
                            params.set(paramName, activeBtn.dataset.filterId);
                        }}
                    }});
                    
                    const newURL = params.toString() 
                        ? `${{window.location.pathname}}?${{params.toString()}}`
                        : window.location.pathname;
                    
                    window.history.replaceState({{}}, '', newURL);
                }},
                
                resetFilters() {{
                    this.filters = {{
                        protein: {{ min: null, max: null }},
                        calorie: {{ min: null, max: null }},
                        time: {{ min: null, max: null }}
                    }};
                    
                    ['protein', 'calorie', 'time'].forEach(type => {{
                        this.setActiveButton(type, 'all');
                    }});
                    
                    this.applyFilters();
                    window.history.replaceState({{}}, '', window.location.pathname);
                }},
                
                loadMore() {{
                    // This would typically fetch more recipes from the API
                    console.log('Load more recipes...');
                }}
            }}
        }}
    </script>
</body>
</html>'''
    
    return html


def generate_all_hub_pages(output_dir, use_local_recipes=True):
    """Generate all hub pages"""
    print("🚀 Starting Hub Page Generation...")
    
    # Fetch hub pages from Strapi
    hub_pages = fetch_hub_pages()
    print(f"📄 Found {len(hub_pages)} hub pages")
    
    if not hub_pages:
        print("⚠️  No hub pages found. Creating sample hub pages...")
        return
    
    # Load all local recipes once if using local mode
    all_local_recipes = []
    if use_local_recipes:
        print("📚 Loading local recipe data...")
        all_local_recipes = load_local_recipes()
        print(f"   Loaded {len(all_local_recipes)} recipes from local files")
    
    # Get brand config
    brand = BRAND_CONFIG.get('highprotein.recipes', {
        'name': 'High Protein Recipes',
        'color': '#f59e0b',
        'emoji': '💪',
        'domain': 'highprotein.recipes'
    })
    
    # Generate each hub page
    for hub_page in hub_pages:
        attrs = hub_page.get('attributes', hub_page)
        slug = attrs.get('slug', 'hub')
        title = attrs.get('title', 'Hub Page')
        
        print(f"  📝 Generating: {title} ({slug})")
        
        # Build filters from hub page settings
        filters = {}
        if attrs.get('proteinBandMin'):
            filters['protein_min'] = attrs['proteinBandMin']
        if attrs.get('proteinBandMax'):
            filters['protein_max'] = attrs['proteinBandMax']
        if attrs.get('calorieBandMin'):
            filters['calorie_min'] = attrs['calorieBandMin']
        if attrs.get('calorieBandMax'):
            filters['calorie_max'] = attrs['calorieBandMax']
        if attrs.get('timeBandMax'):
            filters['time_max'] = attrs['timeBandMax']
        
        # Get recipes - use local data or API
        if use_local_recipes:
            recipes = filter_local_recipes(all_local_recipes, filters if filters else None)
        else:
            recipes = fetch_recipes(filters if filters else None)
        print(f"     Found {len(recipes)} recipes")
        
        # Generate HTML
        html = generate_hub_page_html(hub_page, recipes, brand)
        
        # Create output directory
        page_dir = os.path.join(output_dir, slug)
        os.makedirs(page_dir, exist_ok=True)
        
        # Write HTML file
        output_path = os.path.join(page_dir, 'index.html')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"     ✅ Generated: {output_path}")
    
    print(f"\n✨ Hub page generation complete! Generated {len(hub_pages)} pages.")


if __name__ == '__main__':
    # Default output directory
    output_dir = sys.argv[1] if len(sys.argv) > 1 else './dist'
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate all hub pages
    generate_all_hub_pages(output_dir)
