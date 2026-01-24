#!/usr/bin/env python3
"""
Generate Recipe Pages for highprotein.recipes/breakfast
Creates individual recipe pages with full nutrition, P:E ratio, and meal prep info
"""

import json
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data" / "breakfast"
DIST_DIR = BASE_DIR / "dist" / "breakfast" / "recipes"

# Load recipes
with open(DATA_DIR / "recipes.json", "r") as f:
    data = json.load(f)
    recipes = data["recipes"]

# P:E Ratio classification
def get_pe_class(pe_ratio):
    if pe_ratio >= 15:
        return ("ELITE", "emerald")
    elif pe_ratio >= 10:
        return ("EXCELLENT", "green")
    elif pe_ratio >= 5:
        return ("GOOD", "yellow")
    else:
        return ("MODERATE", "orange")

RECIPE_TEMPLATE = '''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | High Protein Recipes</title>

    <meta name="description" content="{description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://highprotein.recipes/breakfast/recipes/{slug}/">

    <meta property="og:type" content="article">
    <meta property="og:title" content="{title} | High Protein Recipes">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="https://highprotein.recipes/images/breakfast/{image}">
    <meta property="og:url" content="https://highprotein.recipes/breakfast/recipes/{slug}/">

    <meta name="theme-color" content="#f59e0b">
    <link rel="icon" type="image/png" href="/images/favicon.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <script type="application/ld+json">
    {{
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": "{title}",
      "description": "{description}",
      "image": "https://highprotein.recipes/images/breakfast/{image}",
      "author": {{"@type": "Organization", "name": "High Protein Recipes"}},
      "prepTime": "PT{prepTime}M",
      "cookTime": "PT{cookTime}M",
      "totalTime": "PT{totalTime}M",
      "recipeYield": "{yield_amount}",
      "recipeCategory": "Breakfast",
      "recipeCuisine": "American",
      "nutrition": {{
        "@type": "NutritionInformation",
        "calories": "{calories} calories",
        "proteinContent": "{protein}g",
        "carbohydrateContent": "{carbs}g",
        "fatContent": "{fat}g",
        "fiberContent": "{fiber}g",
        "sugarContent": "{sugar}g",
        "sodiumContent": "{sodium}mg"
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
                    <span class="anton-text text-2xl text-brand-600">HIGH PROTEIN RECIPES</span>
                </a>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/breakfast/" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Breakfast</a>
                    <a href="/breakfast/ideas/" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Ideas</a>
                    <a href="/breakfast/meal-prep/" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Meal Prep</a>
                    <a href="/breakfast/meal-plans/7-day/" class="bg-brand-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-brand-900 transition">7-DAY PLAN</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Pillar Sub-Nav -->
    <div class="bg-white border-b border-slate-200 fixed top-20 left-0 right-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center h-12 overflow-x-auto scrollbar-hide space-x-6 text-sm">
                <a href="/breakfast/" class="text-slate-600 hover:text-brand-600 whitespace-nowrap">All Breakfast</a>
                <a href="/breakfast/meal-prep/" class="text-slate-600 hover:text-brand-600 whitespace-nowrap">Meal Prep</a>
                <a href="/breakfast/vegan/" class="text-slate-600 hover:text-brand-600 whitespace-nowrap">Vegan</a>
                <a href="/breakfast/no-eggs/" class="text-slate-600 hover:text-brand-600 whitespace-nowrap">No Eggs</a>
                <a href="/breakfast/low-calorie/" class="text-slate-600 hover:text-brand-600 whitespace-nowrap">Low-Cal</a>
                <a href="/breakfast/fast-food/" class="text-slate-600 hover:text-brand-600 whitespace-nowrap">Fast Food</a>
            </div>
        </div>
    </div>

    <main class="pt-32">
        <!-- Breadcrumb -->
        <div class="bg-white border-b border-slate-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav class="flex text-sm text-slate-500">
                    <a href="/" class="hover:text-brand-600">Home</a>
                    <span class="mx-2">/</span>
                    <a href="/breakfast/" class="hover:text-brand-600">Breakfast</a>
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
                        <img src="/images/breakfast/{image}" alt="{title}" class="w-full rounded-2xl shadow-xl">
                        <div class="absolute top-4 left-4 flex flex-col gap-2">
                            <span class="bg-brand-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">{protein}g PROTEIN</span>
                            <span class="bg-{pe_color}-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">P:E {pe_ratio} ({pe_label})</span>
                        </div>
                        {meal_prep_badge}
                    </div>

                    <!-- Info -->
                    <div>
                        <div class="flex flex-wrap gap-2 mb-4">
                            <span class="px-3 py-1 bg-brand-100 text-brand-600 text-xs font-bold uppercase tracking-wider rounded-full">{category}</span>
                            {dietary_badges}
                        </div>
                        <h1 class="anton-text text-4xl lg:text-5xl text-slate-900 mb-4">{title_upper}</h1>
                        <p class="text-slate-600 text-lg mb-8">{description}</p>

                        <!-- Quick Stats -->
                        <div class="grid grid-cols-4 gap-4 mb-8">
                            <div class="text-center p-4 bg-slate-100 rounded-xl">
                                <div class="text-2xl font-bold text-brand-600">{protein}g</div>
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
                                <div class="flex justify-between"><span class="text-slate-500">Sodium</span><span class="font-semibold">{sodium}mg</span></div>
                                <div class="flex justify-between"><span class="text-slate-500">Difficulty</span><span class="font-semibold">{difficulty}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {meal_prep_section}

        {fast_food_section}

        <!-- Recipe Content -->
        <section class="py-12 bg-slate-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-3 gap-8">
                    <!-- Ingredients -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-2xl p-6 shadow-md sticky top-40">
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
                    </div>
                </div>
            </div>
        </section>

        <!-- Related Recipes CTA -->
        <section class="bg-brand-600 py-12">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="anton-text text-3xl text-white mb-4">WANT MORE BREAKFAST RECIPES?</h2>
                <p class="text-brand-100 mb-6">Explore our collection of high-protein breakfast ideas.</p>
                <a href="/breakfast/ideas/" class="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-4 rounded-xl font-bold hover:bg-brand-50 transition">
                    EXPLORE ALL RECIPES
                </a>
            </div>
        </section>
    </main>

    <footer class="bg-slate-900 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p class="text-slate-400 text-sm">&copy; 2026 High Protein Recipes. All rights reserved.</p>
            <p class="text-slate-500 text-xs mt-2">Nutrition data verified using USDA FoodData Central.</p>
        </div>
    </footer>
</body>
</html>
'''

def generate_dietary_badges(dietary):
    """Generate dietary restriction badges"""
    badges = []
    badge_map = {
        "glutenFree": ("GF", "Gluten-Free", "blue"),
        "dairyFree": ("DF", "Dairy-Free", "purple"),
        "vegan": ("V", "Vegan", "green"),
        "vegetarian": ("VG", "Vegetarian", "green"),
        "keto": ("K", "Keto", "red"),
        "highFiber": ("HF", "High-Fiber", "amber"),
    }

    for key, (abbrev, label, color) in badge_map.items():
        if dietary.get(key, False):
            badges.append(f'<span class="px-2 py-1 bg-{color}-100 text-{color}-600 text-xs font-bold uppercase tracking-wider rounded-full" title="{label}">{abbrev}</span>')

    return "\n                            ".join(badges[:4])  # Limit to 4 badges


def generate_meal_prep_section(meal_prep):
    """Generate meal prep info section if applicable"""
    if not meal_prep or not meal_prep.get("isMealPrep"):
        return ""

    storage_info = ""
    storage = meal_prep.get("storage", {})
    if storage.get("refrigerator"):
        storage_info += f'<div class="flex items-center gap-2"><span class="text-blue-500">Fridge:</span> {storage["refrigerator"]["duration"]}</div>'
    if storage.get("freezer"):
        storage_info += f'<div class="flex items-center gap-2"><span class="text-blue-500">Freezer:</span> {storage["freezer"]["duration"]}</div>'

    reheat_info = ""
    for method in meal_prep.get("reheat", []):
        reheat_info += f'<div class="p-3 bg-white rounded-lg"><strong>{method["method"].title()}</strong>: {method.get("duration", "")} {method.get("instructions", "")[:60]}...</div>'

    return f'''
        <!-- Meal Prep Info -->
        <section class="py-8 bg-blue-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="anton-text text-2xl text-slate-900 mb-6">MEAL PREP INFO</h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h3 class="font-bold text-slate-900 mb-3">Batch Size</h3>
                        <p class="text-3xl font-bold text-brand-600">{meal_prep.get("batchSize", "N/A")} servings</p>
                    </div>
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h3 class="font-bold text-slate-900 mb-3">Storage</h3>
                        <div class="space-y-2 text-sm">{storage_info}</div>
                    </div>
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h3 class="font-bold text-slate-900 mb-3">Reheat Options</h3>
                        <div class="space-y-2 text-sm">{reheat_info}</div>
                    </div>
                </div>
            </div>
        </section>
    '''


def generate_fast_food_section(fast_food):
    """Generate fast food comparison section if applicable"""
    if not fast_food:
        return ""

    orig = fast_food.get("comparison", {}).get("original", {})
    clone = fast_food.get("comparison", {}).get("clone", {})
    improvements = fast_food.get("improvements", {})

    return f'''
        <!-- Fast Food Comparison -->
        <section class="py-8 bg-amber-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="anton-text text-2xl text-slate-900 mb-6">VS. {fast_food.get("chain", "").upper()}</h2>
                <div class="bg-white rounded-xl p-6 shadow-md">
                    <p class="text-slate-600 mb-6">Compared to the original <strong>{fast_food.get("originalItem", "")}</strong>:</p>
                    <div class="grid md:grid-cols-3 gap-6">
                        <div class="text-center">
                            <div class="text-4xl font-bold text-green-600">+{improvements.get("proteinIncrease", 0)}%</div>
                            <div class="text-sm text-slate-500">More Protein</div>
                            <div class="text-xs text-slate-400 mt-1">{orig.get("protein", 0)}g → {clone.get("protein", 0)}g</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-blue-600">-{improvements.get("calorieReduction", 0)}%</div>
                            <div class="text-sm text-slate-500">Fewer Calories</div>
                            <div class="text-xs text-slate-400 mt-1">{orig.get("calories", 0)} → {clone.get("calories", 0)}</div>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold text-purple-600">-{improvements.get("sodiumReduction", 0)}%</div>
                            <div class="text-sm text-slate-500">Less Sodium</div>
                            <div class="text-xs text-slate-400 mt-1">{orig.get("sodium", 0)}mg → {clone.get("sodium", 0)}mg</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    '''


def generate_recipe_page(recipe):
    """Generate a single recipe page"""

    # Build ingredients HTML
    ingredients_html = ""
    for ing in recipe["ingredients"]:
        ingredients_html += f'                                <li class="flex items-start gap-3"><span class="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span><span class="text-slate-700">{ing}</span></li>\n'

    # Build instructions HTML
    instructions_html = ""
    for i, step in enumerate(recipe["instructions"], 1):
        instructions_html += f'''                                <div class="flex gap-4">
                                    <div class="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{i}</div>
                                    <div>
                                        <h3 class="font-bold text-slate-900 mb-1">{step["step"]}</h3>
                                        <p class="text-slate-600">{step["text"]}</p>
                                    </div>
                                </div>\n'''

    # Build JSON arrays for schema
    ingredients_json = json.dumps(recipe["ingredients"])
    instructions_json = json.dumps([{"@type": "HowToStep", "name": s["step"], "text": s["text"]} for s in recipe["instructions"]])

    # Extract yield number
    yield_short = recipe["yield"].split()[0]

    # P:E ratio classification
    pe_label, pe_color = get_pe_class(recipe["peRatio"])

    # Meal prep badge
    meal_prep_badge = ""
    if recipe.get("mealPrep", {}).get("isMealPrep"):
        meal_prep_badge = '<span class="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">MEAL PREP</span>'

    # Dietary badges
    dietary_badges = generate_dietary_badges(recipe.get("dietary", {}))

    # Meal prep section
    meal_prep_section = generate_meal_prep_section(recipe.get("mealPrep"))

    # Fast food section
    fast_food_section = generate_fast_food_section(recipe.get("fastFoodClone"))

    # Generate HTML
    html = RECIPE_TEMPLATE.format(
        title=recipe["title"],
        title_upper=recipe["title"].upper(),
        slug=recipe["slug"],
        description=recipe["description"],
        image=recipe["image"],
        protein=recipe["protein"],
        calories=recipe["calories"],
        carbs=recipe["carbs"],
        fat=recipe["fat"],
        fiber=recipe["fiber"],
        sugar=recipe["sugar"],
        sodium=recipe.get("sodium", 0),
        prepTime=recipe["prepTime"],
        cookTime=recipe["cookTime"],
        totalTime=recipe["totalTime"],
        yield_amount=recipe["yield"],
        yield_short=yield_short,
        servingSize=recipe["servingSize"],
        difficulty=recipe["difficulty"],
        category=recipe["category"],
        pe_ratio=recipe["peRatio"],
        pe_label=pe_label,
        pe_color=pe_color,
        meal_prep_badge=meal_prep_badge,
        dietary_badges=dietary_badges,
        meal_prep_section=meal_prep_section,
        fast_food_section=fast_food_section,
        ingredients_html=ingredients_html,
        instructions_html=instructions_html,
        ingredients_json=ingredients_json,
        instructions_json=instructions_json
    )

    # Create output directory for this recipe
    output_dir = DIST_DIR / recipe["slug"]
    output_dir.mkdir(parents=True, exist_ok=True)

    # Write file
    output_file = output_dir / "index.html"
    with open(output_file, "w") as f:
        f.write(html)

    print(f"Generated: /breakfast/recipes/{recipe['slug']}/")
    return str(output_file)


if __name__ == "__main__":
    print("=" * 60)
    print("Generating Recipe Pages for highprotein.recipes/breakfast")
    print("=" * 60)

    # Ensure output directory exists
    DIST_DIR.mkdir(parents=True, exist_ok=True)

    generated_files = []
    for recipe in recipes:
        filename = generate_recipe_page(recipe)
        generated_files.append(filename)

    print(f"\nTotal: {len(generated_files)} recipe pages generated")
