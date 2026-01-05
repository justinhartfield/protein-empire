#!/usr/bin/env python3
"""
Master Page Generator for Protein Empire Sites - Version 3
With Full Interlinking Support + New UI Elements:
- Anchor Navigation Bar
- FREE RESOURCE CTA
- Try These Next Section
- Pack Download CTA
"""

import json
import os
import sys
import random

# Site configurations with categories for cross-linking
SITES = {
    'proteincookies.co': {
        'name': 'ProteinCookies',
        'domain': 'proteincookies.co',
        'product': 'cookies',
        'product_singular': 'cookie',
        'color': '#f59e0b',
        'emoji': '🍪',
        'category': 'desserts',
        'related_sites': ['proteinbrownies.co', 'proteinbars.co', 'proteinbites.co']
    },
    'proteinpancakes.co': {
        'name': 'ProteinPancakes',
        'domain': 'proteinpancakes.co',
        'product': 'pancakes',
        'product_singular': 'pancake',
        'color': '#f59e0b',
        'emoji': '🥞',
        'category': 'breakfast',
        'related_sites': ['proteinoatmeal.co', 'protein-bread.com', 'proteindonuts.co']
    },
    'proteinbrownies.co': {
        'name': 'ProteinBrownies',
        'domain': 'proteinbrownies.co',
        'product': 'brownies',
        'product_singular': 'brownie',
        'color': '#78350f',
        'emoji': '🍫',
        'category': 'desserts',
        'related_sites': ['proteincookies.co', 'proteincheesecake.co', 'proteinpudding.co']
    },
    'protein-bread.com': {
        'name': 'ProteinBread',
        'domain': 'protein-bread.com',
        'product': 'bread',
        'product_singular': 'slice',
        'color': '#d97706',
        'emoji': '🍞',
        'category': 'savory',
        'related_sites': ['proteinpizzas.co', 'proteinpancakes.co', 'proteinoatmeal.co']
    },
    'proteinbars.co': {
        'name': 'ProteinBars',
        'domain': 'proteinbars.co',
        'product': 'bars',
        'product_singular': 'bar',
        'color': '#dc2626',
        'emoji': '🍫',
        'category': 'snacks',
        'related_sites': ['proteinbites.co', 'proteincookies.co', 'proteinbrownies.co']
    },
    'proteinbites.co': {
        'name': 'ProteinBites',
        'domain': 'proteinbites.co',
        'product': 'bites',
        'product_singular': 'bite',
        'color': '#7c3aed',
        'emoji': '🔵',
        'category': 'snacks',
        'related_sites': ['proteinbars.co', 'proteincookies.co', 'proteinpudding.co']
    },
    'proteindonuts.co': {
        'name': 'ProteinDonuts',
        'domain': 'proteindonuts.co',
        'product': 'donuts',
        'product_singular': 'donut',
        'color': '#ec4899',
        'emoji': '🍩',
        'category': 'desserts',
        'related_sites': ['proteinpancakes.co', 'proteincookies.co', 'proteincheesecake.co']
    },
    'proteinoatmeal.co': {
        'name': 'ProteinOatmeal',
        'domain': 'proteinoatmeal.co',
        'product': 'oatmeal',
        'product_singular': 'serving',
        'color': '#ca8a04',
        'emoji': '🥣',
        'category': 'breakfast',
        'related_sites': ['proteinpancakes.co', 'protein-bread.com', 'proteinpudding.co']
    },
    'proteincheesecake.co': {
        'name': 'ProteinCheesecake',
        'domain': 'proteincheesecake.co',
        'product': 'cheesecakes',
        'product_singular': 'slice',
        'color': '#f97316',
        'emoji': '🍰',
        'category': 'desserts',
        'related_sites': ['proteinbrownies.co', 'proteinpudding.co', 'proteincookies.co']
    },
    'proteinpizzas.co': {
        'name': 'ProteinPizzas',
        'domain': 'proteinpizzas.co',
        'product': 'pizzas',
        'product_singular': 'slice',
        'color': '#ef4444',
        'emoji': '🍕',
        'category': 'savory',
        'related_sites': ['protein-bread.com', 'proteinoatmeal.co', 'proteinpancakes.co']
    },
    'proteinpudding.co': {
        'name': 'ProteinPudding',
        'domain': 'proteinpudding.co',
        'product': 'puddings',
        'product_singular': 'serving',
        'color': '#8b5cf6',
        'emoji': '🍮',
        'category': 'desserts',
        'related_sites': ['proteincheesecake.co', 'proteinbrownies.co', 'proteinoatmeal.co']
    }
}

PACK_COLORS = {
    'banana': '#d97706', 'chocolate': '#78350f', 'berry': '#7c3aed',
    'fruit': '#f59e0b', 'veggie': '#059669', 'classic': '#3b82f6',
    'starter': '#10b981', 'savory': '#ef4444', 'sweet': '#ec4899',
    'bagel': '#ca8a04', 'sandwich': '#6366f1', 'quick': '#14b8a6', 'default': '#0d9488'
}

ALL_SITE_RECIPES = {}
ALL_SITE_PACKS = {}

def load_all_recipes():
    global ALL_SITE_RECIPES, ALL_SITE_PACKS
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    for site_domain in SITES.keys():
        site_slug = site_domain.replace('.', '-')
        recipes_path = os.path.join(base_path, 'data', 'recipes', site_slug, 'recipes.json')
        packs_path = os.path.join(base_path, 'data', 'recipes', site_slug, 'packs.json')
        if os.path.exists(recipes_path):
            with open(recipes_path, 'r') as f:
                data = json.load(f)
                ALL_SITE_RECIPES[site_domain] = data.get('recipes', data) if isinstance(data, dict) else data
        if os.path.exists(packs_path):
            with open(packs_path, 'r') as f:
                ALL_SITE_PACKS[site_domain] = json.load(f)
    print(f"📚 Loaded recipes from {len(ALL_SITE_RECIPES)} sites")
    print(f"📦 Loaded packs from {len(ALL_SITE_PACKS)} sites")

def get_pack_color(pack_slug):
    for keyword, color in PACK_COLORS.items():
        if keyword in pack_slug.lower():
            return color
    return PACK_COLORS['default']

def find_pack_for_recipe(recipe_slug, site_domain):
    if site_domain not in ALL_SITE_PACKS:
        return None
    packs = ALL_SITE_PACKS[site_domain]
    for pack in packs:
        if recipe_slug in pack.get('recipes', []):
            return pack
    return packs[0] if packs else None

RECIPE_TEMPLATE = '''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | {site_name}.com</title>
    <meta name="description" content="{description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://{domain}/{slug}.html">
    <meta property="og:type" content="article">
    <meta property="og:title" content="{title} | {site_name}.com">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="https://{domain}/recipe_images/{image}">
    <meta property="og:url" content="https://{domain}/{slug}.html">
    <meta name="theme-color" content="{brand_color}">
    <link rel="icon" type="image/png" href="/images/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": "{title}",
      "description": "{description}",
      "image": "https://{domain}/recipe_images/{image}",
      "author": {{"@type": "Organization", "name": "{site_name}.com"}},
      "prepTime": "PT{prepTime}M",
      "cookTime": "PT{cookTime}M",
      "totalTime": "PT{totalTime}M",
      "recipeYield": "{yield_amount}",
      "recipeCategory": "{product_cap}",
      "recipeCuisine": "American",
      "nutrition": {{
        "@type": "NutritionInformation",
        "calories": "{calories} calories",
        "proteinContent": "{protein}g",
        "carbohydrateContent": "{carbs}g",
        "fatContent": "{fat}g",
        "fiberContent": "{fiber}g",
        "sugarContent": "{sugar}g"
      }},
      "recipeIngredient": {ingredients_json},
      "recipeInstructions": {instructions_json}
    }}
    </script>
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    fontFamily: {{ 'anton': ['Anton', 'sans-serif'], 'sans': ['Inter', 'sans-serif'] }},
                    colors: {{ brand: {{ 50: '#fffbeb', 100: '#fef3c7', 500: '{brand_color}', 600: '{brand_color}', 900: '#451a03' }}, accent: {{ 500: '#10b981' }} }}
                }}
            }}
        }}
    </script>
    <style>
        .anton-text {{ font-family: 'Anton', sans-serif; letter-spacing: 0.05em; }}
        .glass-nav {{ background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); }}
        .anchor-nav {{ background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); }}
    </style>
</head>
<body class="min-h-screen bg-slate-50 text-slate-900 font-sans">
    <nav class="glass-nav fixed top-0 left-0 right-0 z-50 border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl">{emoji}</span>
                    <span class="anton-text text-2xl" style="color: {brand_color}">{site_name_upper}</span>
                </a>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Recipes</a>
                    <a href="category-all.html" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Categories</a>
                    <a href="pack-starter.html" class="text-white px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition" style="background: {brand_color}">STARTER PACK</a>
                </div>
            </div>
        </div>
    </nav>
    <main class="pt-20">
        <div class="bg-white border-b border-slate-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav class="flex text-sm text-slate-500">
                    <a href="/" class="hover:text-brand-600">Home</a>
                    <span class="mx-2">/</span>
                    <a href="category-{category_slug}.html" class="hover:text-brand-600">{category}</a>
                    <span class="mx-2">/</span>
                    <span class="text-slate-900">{title}</span>
                </nav>
            </div>
        </div>
        <section id="recipe" class="bg-white py-8 lg:py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    <div class="relative">
                        <div class="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-xl flex items-center justify-center">
                            <span class="text-9xl">{emoji}</span>
                        </div>
                        <span class="absolute top-4 left-4 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg" style="background: {brand_color}">{protein}g PROTEIN</span>
                    </div>
                    <div>
                        <span class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4" style="background: {brand_color}20; color: {brand_color}">{category}</span>
                        <h1 class="anton-text text-4xl lg:text-5xl text-slate-900 mb-4">{title_upper}</h1>
                        <p class="text-slate-600 text-lg mb-8">{description}</p>
                        <div class="grid grid-cols-4 gap-4 mb-8">
                            <div class="text-center p-4 bg-slate-100 rounded-xl"><div class="text-2xl font-bold" style="color: {brand_color}">{protein}g</div><div class="text-xs text-slate-500 uppercase">Protein</div></div>
                            <div class="text-center p-4 bg-slate-100 rounded-xl"><div class="text-2xl font-bold text-slate-900">{calories}</div><div class="text-xs text-slate-500 uppercase">Calories</div></div>
                            <div class="text-center p-4 bg-slate-100 rounded-xl"><div class="text-2xl font-bold text-slate-900">{totalTime}m</div><div class="text-xs text-slate-500 uppercase">Total Time</div></div>
                            <div class="text-center p-4 bg-slate-100 rounded-xl"><div class="text-2xl font-bold text-slate-900">{yield_short}</div><div class="text-xs text-slate-500 uppercase">Yield</div></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <div class="anchor-nav sticky top-20 z-40 border-y border-slate-200 shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between overflow-x-auto py-3 gap-2">
                    <div class="flex items-center space-x-1 md:space-x-4 text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                        <a href="#recipe" class="px-2 md:px-3 py-2 text-slate-600 hover:text-slate-900 transition">Recipe</a>
                        <a href="#ingredients" class="px-2 md:px-3 py-2 text-slate-600 hover:text-slate-900 transition">Ingredients</a>
                        <a href="#instructions" class="px-2 md:px-3 py-2 text-slate-600 hover:text-slate-900 transition">Instructions</a>
                        <a href="#troubleshooting" class="px-2 md:px-3 py-2 text-slate-600 hover:text-slate-900 transition">Troubleshooting</a>
                        <a href="#substitutions" class="px-2 md:px-3 py-2 text-slate-600 hover:text-slate-900 transition">Substitutions</a>
                        <a href="#nutrition" class="px-2 md:px-3 py-2 text-slate-600 hover:text-slate-900 transition">Nutrition Panel</a>
                    </div>
                    <a href="pack-{pack_slug}.html" class="hidden md:inline-flex items-center gap-2 text-white px-4 py-2 rounded-full font-bold text-sm hover:opacity-90 transition whitespace-nowrap" style="background: {pack_color}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        DOWNLOAD PDF PACK
                    </a>
                </div>
            </div>
        </div>
        <section class="py-12 bg-slate-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2 space-y-8">
                        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <span class="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3">Free Resource</span>
                                <h3 class="anton-text text-2xl text-slate-900 mb-2">GET THE PRINTABLE PACK</h3>
                                <p class="text-slate-600 text-sm">Includes shopping list (grams), freezer guide, and the substitution matrix PDF.</p>
                            </div>
                            <a href="pack-{pack_slug}.html" class="inline-flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition whitespace-nowrap" style="background: {pack_color}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                DOWNLOAD PDF PACK
                            </a>
                        </div>
                        <div id="ingredients" class="bg-white rounded-2xl p-6 shadow-md scroll-mt-36">
                            <h2 class="anton-text text-2xl text-slate-900 mb-6">INGREDIENTS</h2>
                            <ul class="space-y-3">{ingredients_html}</ul>
                        </div>
                        <div id="instructions" class="bg-white rounded-2xl p-6 lg:p-8 shadow-md scroll-mt-36">
                            <h2 class="anton-text text-2xl text-slate-900 mb-6">STEP-BY-STEP INSTRUCTIONS</h2>
                            <div class="space-y-6">{instructions_html}</div>
                        </div>
                        <div id="troubleshooting" class="bg-white rounded-2xl p-6 lg:p-8 shadow-md scroll-mt-36">
                            <h2 class="anton-text text-2xl text-slate-900 mb-6">TROUBLESHOOTING GUIDE</h2>
                            <div class="space-y-4">{troubleshooting_html}</div>
                        </div>
                        <div id="substitutions" class="bg-white rounded-2xl p-6 lg:p-8 shadow-md scroll-mt-36">
                            <h2 class="anton-text text-2xl text-slate-900 mb-6">SUBSTITUTION MATRIX</h2>
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead><tr class="border-b border-slate-200"><th class="text-left py-3 px-4 font-bold text-slate-900">Original</th><th class="text-left py-3 px-4 font-bold text-slate-900">Swap With</th><th class="text-left py-3 px-4 font-bold text-slate-900">Macro Impact</th></tr></thead>
                                    <tbody>{substitutions_html}</tbody>
                                </table>
                            </div>
                        </div>
                        <div id="nutrition" class="bg-white rounded-2xl p-6 lg:p-8 shadow-md scroll-mt-36">
                            <div class="flex items-center gap-2 mb-4"><span class="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-green-100 text-green-700 rounded">USDA Verified</span></div>
                            <h2 class="anton-text text-2xl text-slate-900 mb-6">NUTRITION FACTS</h2>
                            <div class="border border-slate-900 p-4 max-w-sm">
                                <p class="text-sm text-slate-600 mb-1">{yield_amount} per container</p>
                                <p class="text-sm font-bold border-b border-slate-900 pb-2 mb-2">Serving size {servingSize}</p>
                                <div class="flex justify-between items-end border-b-8 border-slate-900 pb-2 mb-2">
                                    <span class="text-sm">Amount per serving</span>
                                    <span class="text-3xl font-bold">Calories <span style="color: {brand_color}">{calories}</span></span>
                                </div>
                                <div class="text-right text-xs font-bold mb-1">% Daily Value*</div>
                                <div class="space-y-1 text-sm">
                                    <div class="flex justify-between border-b border-slate-200 py-1"><span><strong>Total Fat</strong> {fat}g</span><span class="font-bold">{fat_dv}%</span></div>
                                    <div class="flex justify-between border-b border-slate-200 py-1"><span><strong>Total Carbohydrate</strong> {carbs}g</span><span class="font-bold">{carbs_dv}%</span></div>
                                    <div class="flex justify-between border-b border-slate-200 py-1 pl-4"><span>Dietary Fiber {fiber}g</span><span class="font-bold">{fiber_dv}%</span></div>
                                    <div class="flex justify-between border-b border-slate-200 py-1 pl-4"><span>Total Sugars {sugar}g</span><span></span></div>
                                    <div class="flex justify-between border-b border-slate-900 py-1"><span><strong>Protein</strong> {protein}g</span><span class="font-bold" style="color: {brand_color}">{protein_dv}%</span></div>
                                </div>
                                <p class="text-xs text-slate-500 mt-3">* The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</p>
                            </div>
                        </div>
                        <div class="bg-white rounded-2xl p-6 lg:p-8 shadow-md">
                            <h2 class="anton-text text-2xl text-slate-900 mb-6">PRO TIPS</h2>
                            <div class="space-y-4">{tips_html}</div>
                        </div>
                    </div>
                    <div class="lg:col-span-1 space-y-6">
                        <div class="bg-white rounded-2xl p-6 shadow-md sticky top-36">
                            <h3 class="anton-text text-xl text-slate-900 mb-4 border-b-2 border-slate-900 pb-2 inline-block">TRY THESE NEXT</h3>
                            <div class="space-y-4">{try_these_next_html}</div>
                            <div class="mt-6 rounded-xl p-5 text-white" style="background: {pack_color}">
                                <h4 class="anton-text text-xl mb-1">{pack_title_upper}</h4>
                                <p class="text-white/80 text-sm mb-4">{pack_description_short}</p>
                                <div class="space-y-2 mb-4">
                                    <div class="flex items-center gap-2 text-sm"><svg class="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg><span>Printable Cards</span></div>
                                    <div class="flex items-center gap-2 text-sm"><svg class="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg><span>Shopping List (Grams)</span></div>
                                </div>
                                <a href="pack-{pack_slug}.html" class="block w-full text-center py-3 rounded-lg font-bold text-sm transition" style="background: rgba(0,0,0,0.2); color: white;">DOWNLOAD FREE</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-12 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="anton-text text-3xl text-slate-900 mb-8">MORE {product_upper} RECIPES</h2>
                <div class="grid md:grid-cols-3 gap-6">{related_html}</div>
            </div>
        </section>
        <section class="py-12 bg-gradient-to-br from-slate-100 to-slate-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-10">
                    <span class="inline-block px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">Explore More</span>
                    <h2 class="anton-text text-3xl text-slate-900">THE PROTEIN EMPIRE</h2>
                    <p class="text-slate-600 mt-2">Discover more high-protein recipes across our network</p>
                </div>
                <div class="grid md:grid-cols-3 gap-6">{empire_html}</div>
            </div>
        </section>
        <section class="py-12" style="background: {brand_color}">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="anton-text text-3xl text-white mb-4">WANT MORE RECIPES?</h2>
                <p class="text-white/80 mb-6">Get the Starter Pack with 5 essential protein {product} recipes.</p>
                <a href="pack-starter.html" class="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition" style="color: {brand_color}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    DOWNLOAD FREE PDF
                </a>
            </div>
        </section>
    </main>
    <footer class="bg-slate-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8 pb-8 border-b border-slate-700">
                <a href="https://proteincookies.co" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🍪</span><span class="text-sm">Cookies</span></a>
                <a href="https://proteinpancakes.co" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🥞</span><span class="text-sm">Pancakes</span></a>
                <a href="https://proteinbrownies.co" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🍫</span><span class="text-sm">Brownies</span></a>
                <a href="https://protein-bread.com" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🍞</span><span class="text-sm">Bread</span></a>
                <a href="https://proteinbars.co" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🍫</span><span class="text-sm">Bars</span></a>
                <a href="https://proteinbites.co" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🔵</span><span class="text-sm">Bites</span></a>
                <a href="https://proteindonuts.co" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🍩</span><span class="text-sm">Donuts</span></a>
                <a href="https://proteinoatmeal.co" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🥣</span><span class="text-sm">Oatmeal</span></a>
                <a href="https://proteincheesecake.co" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🍰</span><span class="text-sm">Cheesecake</span></a>
                <a href="https://proteinpizzas.co" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🍕</span><span class="text-sm">Pizza</span></a>
                <a href="https://proteinpudding.co" class="flex items-center gap-2 text-slate-400 hover:text-white transition"><span>🍮</span><span class="text-sm">Pudding</span></a>
            </div>
            <div class="text-center">
                <p class="text-slate-400 text-sm">&copy; 2026 {site_name}.com | Part of The Protein Empire</p>
                <p class="text-slate-500 text-xs mt-2">Nutrition data verified using USDA FoodData Central.</p>
            </div>
        </div>
    </footer>
</body>
</html>
'''

def get_cross_empire_recipes(current_site, current_recipe_slug):
    related_sites = SITES[current_site].get('related_sites', [])
    empire_recipes = []
    for site_domain in related_sites:
        if site_domain in ALL_SITE_RECIPES:
            site_recipes = ALL_SITE_RECIPES[site_domain]
            if site_recipes:
                recipe = random.choice(site_recipes)
                empire_recipes.append({'recipe': recipe, 'site': SITES[site_domain]})
    return empire_recipes[:3]

def generate_recipe_page(recipe, site_config, all_recipes, current_site):
    ingredients_html = ""
    for ing in recipe.get('ingredients', []):
        ingredients_html += f'<li class="flex items-start gap-3"><span class="w-2 h-2 rounded-full mt-2 flex-shrink-0" style="background: {site_config["color"]}"></span><span class="text-slate-700">{ing}</span></li>\n'
    
    instructions_html = ""
    instructions = recipe.get('instructions', [])
    for i, step in enumerate(instructions, 1):
        step_name = step.get('step', f'Step {i}') if isinstance(step, dict) else f'Step {i}'
        step_text = step.get('text', '') if isinstance(step, dict) else step
        instructions_html += f'<div class="flex gap-4"><div class="w-10 h-10 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0" style="background: {site_config["color"]}">{i}</div><div><h3 class="font-bold text-slate-900 mb-1">{step_name}</h3><p class="text-slate-600">{step_text}</p></div></div>\n'
    
    troubleshooting_items = [
        {"issue": f"{site_config['product_singular'].capitalize()} is too dry", "solution": "Try reducing baking time by 2-3 minutes, or add an extra tablespoon of Greek yogurt to the batter."},
        {"issue": "Not rising properly", "solution": "Check that your baking powder is fresh (less than 6 months old). Also avoid overmixing the batter."},
        {"issue": "Gummy texture in center", "solution": "This usually means under-baking. Use a toothpick to test - it should come out with just a few moist crumbs."},
        {"issue": "Too dense", "solution": "Make sure you're measuring protein powder correctly. Too much protein powder can make baked goods dense."}
    ]
    troubleshooting_html = ""
    for item in troubleshooting_items:
        troubleshooting_html += f'<div class="border-l-4 pl-4 py-2" style="border-color: {site_config["color"]}"><h4 class="font-bold text-slate-900 mb-1">{item["issue"]}</h4><p class="text-slate-600 text-sm">{item["solution"]}</p></div>\n'
    
    substitutions = [
        {"original": "Whey Protein", "swap": "Casein or Pea Protein", "impact": "+10% Liquid Required"},
        {"original": "Greek Yogurt", "swap": "Cottage Cheese (Blended)", "impact": "Higher Protein + Sodium"},
        {"original": "Oat Flour", "swap": "Gluten-Free 1-to-1 Blend", "impact": "Neutral"},
        {"original": "Liquid Egg Whites", "swap": "2 Whole Eggs", "impact": "+10g Fat / +90 Cal"}
    ]
    substitutions_html = ""
    for sub in substitutions:
        substitutions_html += f'<tr class="border-b border-slate-100"><td class="py-3 px-4 text-slate-700">{sub["original"]}</td><td class="py-3 px-4 text-slate-700">{sub["swap"]}</td><td class="py-3 px-4 text-slate-500">{sub["impact"]}</td></tr>\n'
    
    tips = recipe.get('tips', [
        f"Store in an airtight container at room temperature for up to 5 days.",
        f"For best results, use a kitchen scale to measure ingredients in grams.",
        f"Let cool completely before storing to prevent sogginess."
    ])
    tips_html = ""
    for tip in tips:
        tips_html += f'<div class="flex gap-3 p-4 bg-slate-50 rounded-xl"><span class="text-xl">💡</span><p class="text-slate-600">{tip}</p></div>\n'
    
    other_recipes = [r for r in all_recipes if r.get('slug') != recipe.get('slug')]
    related = random.sample(other_recipes, min(3, len(other_recipes)))
    related_html = ""
    for rel in related:
        related_html += f'<a href="{rel.get("slug", "")}.html" class="group bg-slate-50 rounded-2xl overflow-hidden hover:shadow-lg transition"><div class="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center"><span class="text-6xl">{site_config["emoji"]}</span></div><div class="p-4"><span class="text-xs font-bold uppercase" style="color: {site_config["color"]}">{rel.get("protein", 20)}g Protein</span><h3 class="font-bold text-slate-900 group-hover:text-brand-600 transition">{rel.get("title", "")}</h3></div></a>\n'
    
    try_these = random.sample(other_recipes, min(5, len(other_recipes)))
    try_these_next_html = ""
    for rel in try_these:
        try_these_next_html += f'<a href="{rel.get("slug", "")}.html" class="flex items-center gap-3 group"><div class="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0"><span class="text-2xl">{site_config["emoji"]}</span></div><div><h4 class="font-semibold text-slate-900 group-hover:text-brand-600 transition text-sm">{rel.get("title", "")}</h4><p class="text-xs text-slate-500">{rel.get("protein", 20)}G PROTEIN • {rel.get("calories", 150)} CAL</p></div></a>\n'
    
    empire_recipes = get_cross_empire_recipes(current_site, recipe.get('slug'))
    empire_html = ""
    for item in empire_recipes:
        rel_recipe = item['recipe']
        rel_site = item['site']
        empire_html += f'<a href="https://{rel_site["domain"]}/{rel_recipe.get("slug", "")}.html" class="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition border border-slate-200" target="_blank"><div class="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative"><span class="text-6xl">{rel_site["emoji"]}</span><span class="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style="background: {rel_site["color"]}">{rel_site["name"]}</span></div><div class="p-4"><span class="text-xs font-bold uppercase" style="color: {rel_site["color"]}">{rel_recipe.get("protein", 20)}g Protein</span><h3 class="font-bold text-slate-900 group-hover:text-brand-600 transition">{rel_recipe.get("title", "")}</h3><p class="text-slate-500 text-sm mt-1 line-clamp-2">{rel_recipe.get("description", "")[:80]}...</p></div></a>\n'
    
    ingredients_json = json.dumps(recipe.get('ingredients', []))
    instructions_json = json.dumps([{"@type": "HowToStep", "name": step.get('step', f'Step {i+1}') if isinstance(step, dict) else f'Step {i+1}', "text": step.get('text', '') if isinstance(step, dict) else step} for i, step in enumerate(instructions)])
    
    yield_amount = recipe.get('yield', '12')
    yield_short = yield_amount.split()[0] if yield_amount else '12'
    category = recipe.get('category', 'Classic')
    category_slug = category.lower().replace(' ', '-').replace('/', '-')
    
    pack = find_pack_for_recipe(recipe.get('slug'), current_site)
    pack_slug = pack.get('slug', 'starter') if pack else 'starter'
    pack_title = pack.get('title', 'Starter Pack') if pack else 'Starter Pack'
    pack_description = pack.get('description', 'Get our starter collection of recipes.') if pack else 'Get our starter collection of recipes.'
    pack_color = get_pack_color(pack_slug)
    
    protein = recipe.get('protein', 20)
    fat = recipe.get('fat', 8)
    carbs = recipe.get('carbs', 15)
    fiber = recipe.get('fiber', 2)
    
    return RECIPE_TEMPLATE.format(
        title=recipe.get('title', ''), title_upper=recipe.get('title', '').upper(), slug=recipe.get('slug', ''),
        description=recipe.get('description', ''), protein=protein, calories=recipe.get('calories', 180),
        carbs=carbs, fat=fat, fiber=fiber, sugar=recipe.get('sugar', 5),
        prepTime=recipe.get('prepTime', '10'), cookTime=recipe.get('cookTime', '15'), totalTime=recipe.get('totalTime', '25'),
        difficulty=recipe.get('difficulty', 'Easy'), category=category, category_slug=category_slug,
        servingSize=recipe.get('servingSize', '1 serving'), yield_amount=yield_amount, yield_short=yield_short,
        image=recipe.get('image', 'default.png'), site_name=site_config['name'], site_name_upper=site_config['name'].upper(),
        domain=site_config['domain'], brand_color=site_config['color'], emoji=site_config['emoji'],
        product=site_config['product'], product_cap=site_config['product'].capitalize(), product_upper=site_config['product'].upper(),
        ingredients_html=ingredients_html, instructions_html=instructions_html, troubleshooting_html=troubleshooting_html,
        substitutions_html=substitutions_html, tips_html=tips_html, related_html=related_html,
        try_these_next_html=try_these_next_html, empire_html=empire_html,
        ingredients_json=ingredients_json, instructions_json=instructions_json,
        pack_slug=pack_slug, pack_title=pack_title, pack_title_upper=pack_title.upper(),
        pack_description_short=pack_description[:50] + '...' if len(pack_description) > 50 else pack_description,
        pack_color=pack_color, protein_dv=round(protein / 50 * 100), fat_dv=round(fat / 78 * 100),
        carbs_dv=round(carbs / 275 * 100), fiber_dv=round(fiber / 28 * 100)
    )

def generate_site_pages(site_domain):
    if site_domain not in SITES:
        print(f"❌ Unknown site: {site_domain}")
        return 0
    site_config = SITES[site_domain]
    site_slug = site_domain.replace('.', '-')
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    recipes_path = os.path.join(base_path, 'data', 'recipes', site_slug, 'recipes.json')
    if not os.path.exists(recipes_path):
        print(f"❌ No recipes found at: {recipes_path}")
        return 0
    with open(recipes_path, 'r') as f:
        data = json.load(f)
        recipes = data.get('recipes', data) if isinstance(data, dict) else data
    output_dir = os.path.join(base_path, 'apps', site_domain, 'dist')
    os.makedirs(output_dir, exist_ok=True)
    print(f"📄 Generating pages for: {site_domain}")
    print(f"📚 Found {len(recipes)} recipes")
    print(f"📁 Output directory: {output_dir}")
    count = 0
    for recipe in recipes:
        html = generate_recipe_page(recipe, site_config, recipes, site_domain)
        slug = recipe.get('slug', f"recipe-{count+1}")
        output_path = os.path.join(output_dir, f"{slug}.html")
        with open(output_path, 'w') as f:
            f.write(html)
        count += 1
        print(f"  ✓ Generated: {slug}.html")
    print(f"✅ Generated {count} pages for {site_domain}")
    return count

def generate_all_sites():
    load_all_recipes()
    total = 0
    for site_domain in SITES.keys():
        count = generate_site_pages(site_domain)
        total += count
    print(f"\n🎉 Total pages generated: {total}")
    print(f"🔗 Interlinking enabled: Tier 1 (Intra-Site) + Tier 2 (Cross-Empire)")
    print(f"✨ New UI elements: Anchor Nav, FREE RESOURCE CTA, Try These Next, Pack Download CTA")
    return total

if __name__ == '__main__':
    if len(sys.argv) > 1:
        site = sys.argv[1]
        if site == 'all':
            generate_all_sites()
        else:
            load_all_recipes()
            generate_site_pages(site)
    else:
        generate_all_sites()
