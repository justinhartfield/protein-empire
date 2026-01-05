#!/usr/bin/env python3
"""
Master Page Generator for Protein Empire Sites
Generates HTML recipe pages for all sites based on the proteincookies.com template
"""

import json
import os
import sys

# Site configurations
SITES = {
    'proteincookies.co': {
        'name': 'ProteinCookies',
        'domain': 'proteincookies.co',
        'product': 'cookies',
        'product_singular': 'cookie',
        'color': '#f59e0b',  # amber
        'emoji': '🍪'
    },
    'proteinpancakes.co': {
        'name': 'ProteinPancakes',
        'domain': 'proteinpancakes.co',
        'product': 'pancakes',
        'product_singular': 'pancake',
        'color': '#f59e0b',
        'emoji': '🥞'
    },
    'proteinbrownies.co': {
        'name': 'ProteinBrownies',
        'domain': 'proteinbrownies.co',
        'product': 'brownies',
        'product_singular': 'brownie',
        'color': '#78350f',  # brown
        'emoji': '🍫'
    },
    'protein-bread.com': {
        'name': 'ProteinBread',
        'domain': 'protein-bread.com',
        'product': 'bread',
        'product_singular': 'slice',
        'color': '#d97706',
        'emoji': '🍞'
    },
    'proteinbars.co': {
        'name': 'ProteinBars',
        'domain': 'proteinbars.co',
        'product': 'bars',
        'product_singular': 'bar',
        'color': '#dc2626',  # red
        'emoji': '🍫'
    },
    'proteinbites.co': {
        'name': 'ProteinBites',
        'domain': 'proteinbites.co',
        'product': 'bites',
        'product_singular': 'bite',
        'color': '#7c3aed',  # purple
        'emoji': '🔵'
    },
    'proteindonuts.co': {
        'name': 'ProteinDonuts',
        'domain': 'proteindonuts.co',
        'product': 'donuts',
        'product_singular': 'donut',
        'color': '#ec4899',  # pink
        'emoji': '🍩'
    },
    'proteinoatmeal.co': {
        'name': 'ProteinOatmeal',
        'domain': 'proteinoatmeal.co',
        'product': 'oatmeal',
        'product_singular': 'serving',
        'color': '#ca8a04',  # yellow
        'emoji': '🥣'
    },
    'proteincheesecake.co': {
        'name': 'ProteinCheesecake',
        'domain': 'proteincheesecake.co',
        'product': 'cheesecakes',
        'product_singular': 'slice',
        'color': '#f97316',  # orange
        'emoji': '🍰'
    },
    'proteinpizzas.co': {
        'name': 'ProteinPizzas',
        'domain': 'proteinpizzas.co',
        'product': 'pizzas',
        'product_singular': 'slice',
        'color': '#ef4444',  # red
        'emoji': '🍕'
    },
    'proteinpudding.co': {
        'name': 'ProteinPudding',
        'domain': 'proteinpudding.co',
        'product': 'puddings',
        'product_singular': 'serving',
        'color': '#8b5cf6',  # violet
        'emoji': '🍮'
    }
}

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
                    fontFamily: {{
                        'anton': ['Anton', 'sans-serif'],
                        'sans': ['Inter', 'sans-serif'],
                    }},
                    colors: {{
                        brand: {{
                            50: '#fffbeb',
                            100: '#fef3c7',
                            500: '{brand_color}',
                            600: '{brand_color}',
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
        .anton-text {{ font-family: 'Anton', sans-serif; letter-spacing: 0.05em; }}
        .glass-nav {{ background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); }}
    </style>
</head>

<body class="min-h-screen bg-slate-50 text-slate-900 font-sans">
    <!-- Navigation -->
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
        <!-- Breadcrumb -->
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

        <!-- Recipe Header -->
        <section class="bg-white py-8 lg:py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    <!-- Image -->
                    <div class="relative">
                        <div class="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-xl flex items-center justify-center">
                            <span class="text-9xl">{emoji}</span>
                        </div>
                        <span class="absolute top-4 left-4 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg" style="background: {brand_color}">{protein}g PROTEIN</span>
                    </div>
                    
                    <!-- Info -->
                    <div>
                        <span class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4" style="background: {brand_color}20; color: {brand_color}">{category}</span>
                        <h1 class="anton-text text-4xl lg:text-5xl text-slate-900 mb-4">{title_upper}</h1>
                        <p class="text-slate-600 text-lg mb-8">{description}</p>
                        
                        <!-- Quick Stats -->
                        <div class="grid grid-cols-4 gap-4 mb-8">
                            <div class="text-center p-4 bg-slate-100 rounded-xl">
                                <div class="text-2xl font-bold" style="color: {brand_color}">{protein}g</div>
                                <div class="text-xs text-slate-500 uppercase">Protein</div>
                            </div>
                            <div class="text-center p-4 bg-slate-100 rounded-xl">
                                <div class="text-2xl font-bold text-slate-900">{calories}</div>
                                <div class="text-xs text-slate-500 uppercase">Calories</div>
                            </div>
                            <div class="text-center p-4 bg-slate-100 rounded-xl">
                                <div class="text-2xl font-bold text-slate-900">{totalTime}m</div>
                                <div class="text-xs text-slate-500 uppercase">Total Time</div>
                            </div>
                            <div class="text-center p-4 bg-slate-100 rounded-xl">
                                <div class="text-2xl font-bold text-slate-900">{yield_short}</div>
                                <div class="text-xs text-slate-500 uppercase">Yield</div>
                            </div>
                        </div>
                        
                        <!-- Full Nutrition -->
                        <div class="bg-slate-100 rounded-xl p-6">
                            <h3 class="font-bold text-slate-900 mb-4">Nutrition per {servingSize}</h3>
                            <div class="grid grid-cols-3 gap-4 text-sm">
                                <div class="flex justify-between"><span class="text-slate-500">Carbs</span><span class="font-semibold">{carbs}g</span></div>
                                <div class="flex justify-between"><span class="text-slate-500">Fat</span><span class="font-semibold">{fat}g</span></div>
                                <div class="flex justify-between"><span class="text-slate-500">Fiber</span><span class="font-semibold">{fiber}g</span></div>
                                <div class="flex justify-between"><span class="text-slate-500">Sugar</span><span class="font-semibold">{sugar}g</span></div>
                                <div class="flex justify-between"><span class="text-slate-500">Difficulty</span><span class="font-semibold">{difficulty}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Recipe Content -->
        <section class="py-12 bg-slate-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-3 gap-8">
                    <!-- Ingredients -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-2xl p-6 shadow-md sticky top-28">
                            <h2 class="anton-text text-2xl text-slate-900 mb-6">INGREDIENTS</h2>
                            <ul class="space-y-3">
{ingredients_html}
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Instructions -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-2xl p-6 lg:p-8 shadow-md">
                            <h2 class="anton-text text-2xl text-slate-900 mb-6">INSTRUCTIONS</h2>
                            <div class="space-y-6">
{instructions_html}
                            </div>
                        </div>
                        
                        <!-- Pro Tips -->
                        <div class="bg-white rounded-2xl p-6 lg:p-8 shadow-md mt-8">
                            <h2 class="anton-text text-2xl text-slate-900 mb-6">PRO TIPS</h2>
                            <div class="space-y-4">
{tips_html}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Related Recipes -->
        <section class="py-12 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="anton-text text-3xl text-slate-900 mb-8">MORE {product_upper} RECIPES</h2>
                <div class="grid md:grid-cols-3 gap-6">
{related_html}
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="py-12" style="background: {brand_color}">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="anton-text text-3xl text-white mb-4">WANT MORE RECIPES?</h2>
                <p class="text-white/80 mb-6">Get the Starter Pack with 5 essential protein {product} recipes.</p>
                <a href="pack-starter.html" class="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition" style="color: {brand_color}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    DOWNLOAD FREE PDF
                </a>
            </div>
        </section>
    </main>

    <footer class="bg-slate-900 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p class="text-slate-400 text-sm">&copy; 2026 <a href="https://HighProtein.Recipes" class="hover:text-amber-400 transition-colors">High Protein Recipes</a>. All rights reserved.</p>
            <p class="text-slate-500 text-xs mt-2">Nutrition data verified using USDA FoodData Central.</p>
        </div>
    </footer>
</body>
</html>
'''

def generate_recipe_page(recipe, site_config, all_recipes):
    """Generate a single recipe page"""
    
    # Build ingredients HTML
    ingredients_html = ""
    for ing in recipe.get('ingredients', []):
        ingredients_html += f'                                <li class="flex items-start gap-3"><span class="w-2 h-2 rounded-full mt-2 flex-shrink-0" style="background: {site_config["color"]}"></span><span class="text-slate-700">{ing}</span></li>\n'
    
    # Build instructions HTML
    instructions_html = ""
    instructions = recipe.get('instructions', [])
    for i, step in enumerate(instructions, 1):
        if isinstance(step, dict):
            step_name = step.get('step', f'Step {i}')
            step_text = step.get('text', '')
        else:
            step_name = f'Step {i}'
            step_text = step
        instructions_html += f'''                                <div class="flex gap-4">
                                    <div class="w-10 h-10 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0" style="background: {site_config['color']}">{i}</div>
                                    <div>
                                        <h3 class="font-bold text-slate-900 mb-1">{step_name}</h3>
                                        <p class="text-slate-600">{step_text}</p>
                                    </div>
                                </div>\n'''
    
    # Build pro tips HTML
    tips = recipe.get('tips', [
        f"Store in an airtight container at room temperature for up to 5 days.",
        f"For best results, use a kitchen scale to measure ingredients in grams.",
        f"Let cool completely before storing to prevent sogginess."
    ])
    tips_html = ""
    for tip in tips:
        tips_html += f'''                                <div class="flex gap-3 p-4 bg-slate-50 rounded-xl">
                                    <span class="text-xl">💡</span>
                                    <p class="text-slate-600">{tip}</p>
                                </div>\n'''
    
    # Build related recipes HTML (get 3 random other recipes)
    import random
    other_recipes = [r for r in all_recipes if r.get('slug') != recipe.get('slug')]
    related = random.sample(other_recipes, min(3, len(other_recipes)))
    related_html = ""
    for rel in related:
        related_html += f'''                    <a href="{rel.get('slug', '')}.html" class="group bg-slate-50 rounded-2xl overflow-hidden hover:shadow-lg transition">
                        <div class="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <span class="text-6xl">{site_config['emoji']}</span>
                        </div>
                        <div class="p-4">
                            <span class="text-xs font-bold uppercase" style="color: {site_config['color']}">{rel.get('protein', 20)}g Protein</span>
                            <h3 class="font-bold text-slate-900 group-hover:text-brand-600 transition">{rel.get('title', '')}</h3>
                        </div>
                    </a>\n'''
    
    # Build JSON for schema
    ingredients_json = json.dumps(recipe.get('ingredients', []))
    instructions_json = json.dumps([
        {"@type": "HowToStep", "name": step.get('step', f'Step {i+1}') if isinstance(step, dict) else f'Step {i+1}', 
         "text": step.get('text', '') if isinstance(step, dict) else step}
        for i, step in enumerate(instructions)
    ])
    
    # Get yield short form
    yield_amount = recipe.get('yield', '12')
    yield_short = yield_amount.split()[0] if yield_amount else '12'
    
    # Category slug
    category = recipe.get('category', 'Classic')
    category_slug = category.lower().replace(' ', '-').replace('/', '-')
    
    return RECIPE_TEMPLATE.format(
        title=recipe.get('title', ''),
        title_upper=recipe.get('title', '').upper(),
        slug=recipe.get('slug', ''),
        description=recipe.get('description', ''),
        protein=recipe.get('protein', 20),
        calories=recipe.get('calories', 180),
        carbs=recipe.get('carbs', 15),
        fat=recipe.get('fat', 8),
        fiber=recipe.get('fiber', 2),
        sugar=recipe.get('sugar', 5),
        prepTime=recipe.get('prepTime', '10'),
        cookTime=recipe.get('cookTime', '15'),
        totalTime=recipe.get('totalTime', '25'),
        difficulty=recipe.get('difficulty', 'Easy'),
        category=category,
        category_slug=category_slug,
        servingSize=recipe.get('servingSize', '1 serving'),
        yield_amount=yield_amount,
        yield_short=yield_short,
        image=recipe.get('image', 'default.png'),
        site_name=site_config['name'],
        site_name_upper=site_config['name'].upper(),
        domain=site_config['domain'],
        brand_color=site_config['color'],
        emoji=site_config['emoji'],
        product=site_config['product'],
        product_cap=site_config['product'].capitalize(),
        product_upper=site_config['product'].upper(),
        ingredients_html=ingredients_html,
        instructions_html=instructions_html,
        tips_html=tips_html,
        related_html=related_html,
        ingredients_json=ingredients_json,
        instructions_json=instructions_json
    )


def generate_site_pages(site_domain):
    """Generate all pages for a single site"""
    
    if site_domain not in SITES:
        print(f"❌ Unknown site: {site_domain}")
        return 0
    
    site_config = SITES[site_domain]
    site_slug = site_domain.replace('.', '-')
    
    # Find recipe data
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    recipes_path = os.path.join(base_path, 'data', 'recipes', site_slug, 'recipes.json')
    
    if not os.path.exists(recipes_path):
        print(f"❌ No recipes found at: {recipes_path}")
        return 0
    
    with open(recipes_path, 'r') as f:
        data = json.load(f)
        recipes = data.get('recipes', data) if isinstance(data, dict) else data
    
    # Output directory
    output_dir = os.path.join(base_path, 'apps', site_domain, 'dist')
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"📄 Generating pages for: {site_domain}")
    print(f"📚 Found {len(recipes)} recipes")
    print(f"📁 Output directory: {output_dir}")
    
    count = 0
    for recipe in recipes:
        html = generate_recipe_page(recipe, site_config, recipes)
        slug = recipe.get('slug', f"recipe-{count+1}")
        output_path = os.path.join(output_dir, f"{slug}.html")
        
        with open(output_path, 'w') as f:
            f.write(html)
        
        count += 1
        print(f"  ✓ Generated: {slug}.html")
    
    print(f"✅ Generated {count} pages for {site_domain}")
    return count


def generate_all_sites():
    """Generate pages for all sites"""
    total = 0
    for site_domain in SITES.keys():
        count = generate_site_pages(site_domain)
        total += count
    
    print(f"\n🎉 Total pages generated: {total}")
    return total


if __name__ == '__main__':
    if len(sys.argv) > 1:
        site = sys.argv[1]
        if site == 'all':
            generate_all_sites()
        else:
            generate_site_pages(site)
    else:
        generate_all_sites()
