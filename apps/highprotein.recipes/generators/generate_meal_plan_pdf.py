#!/usr/bin/env python3
"""
Generate 7-Day High-Protein Breakfast Meal Plan PDF
Creates a styled PDF with recipes, shopping list, and pro tips
"""

import json
from pathlib import Path
from datetime import datetime

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
DIST_DIR = BASE_DIR / "dist"
OUTPUT_DIR = DIST_DIR / "downloads"

# Selected recipes for the 7-day meal plan (by slug)
MEAL_PLAN_RECIPES = [
    "freezer-breakfast-burritos",      # Day 1 - 40g - Meal prep burritos
    "protein-pancakes",                 # Day 2 - 32g - Classic pancakes
    "sheet-pan-breakfast-bake",         # Day 3 - 28g - Easy batch cooking
    "volume-greek-style-bowl",          # Day 4 - 32g - Dairy-free bowl
    "chia-protein-pudding",             # Day 5 - 25g - Overnight no-cook
    "cottage-cheese-scramble",          # Day 6 - 35g - Quick eggs
    "savory-oats-turkey-spinach",       # Day 7 - 38g - Savory oatmeal
]

def load_recipes():
    """Load recipes from JSON file"""
    with open(DATA_DIR / "recipes.json", "r") as f:
        data = json.load(f)

    # Create lookup by slug
    recipes_by_slug = {r["slug"]: r for r in data["recipes"]}

    # Get selected recipes in order
    selected = []
    for slug in MEAL_PLAN_RECIPES:
        if slug in recipes_by_slug:
            selected.append(recipes_by_slug[slug])
        else:
            print(f"Warning: Recipe '{slug}' not found")

    return selected

def generate_shopping_list(recipes):
    """Combine all ingredients into a categorized shopping list"""
    all_ingredients = []
    for recipe in recipes:
        all_ingredients.extend(recipe.get("ingredients", []))

    # Categorize ingredients
    categories = {
        "Proteins & Meats": [],
        "Dairy & Eggs": [],
        "Grains & Flours": [],
        "Produce": [],
        "Pantry Staples": [],
        "Other": []
    }

    for ing in all_ingredients:
        ing_lower = ing.lower()
        if any(x in ing_lower for x in ["egg", "turkey", "sausage", "chicken", "protein powder", "whey", "tempeh", "tofu"]):
            categories["Proteins & Meats"].append(ing)
        elif any(x in ing_lower for x in ["milk", "yogurt", "cheese", "cottage", "ricotta", "cream"]):
            categories["Dairy & Eggs"].append(ing)
        elif any(x in ing_lower for x in ["oat", "flour", "tortilla", "bread", "rice", "quinoa"]):
            categories["Grains & Flours"].append(ing)
        elif any(x in ing_lower for x in ["pepper", "onion", "spinach", "tomato", "avocado", "banana", "berry", "fruit", "vegetable"]):
            categories["Produce"].append(ing)
        elif any(x in ing_lower for x in ["salt", "pepper", "spice", "cinnamon", "vanilla", "maple", "honey", "oil", "baking"]):
            categories["Pantry Staples"].append(ing)
        else:
            categories["Other"].append(ing)

    # Remove duplicates (case-insensitive)
    for cat in categories:
        seen = set()
        unique = []
        for ing in categories[cat]:
            key = ing.lower().strip()
            if key not in seen:
                seen.add(key)
                unique.append(ing)
        categories[cat] = unique

    return categories

def generate_html(recipes, shopping_list):
    """Generate HTML for PDF conversion"""

    # Calculate totals
    total_protein = sum(r["protein"] for r in recipes)
    avg_protein = total_protein // len(recipes)
    total_calories = sum(r["calories"] for r in recipes)

    # Recipe pages HTML
    recipe_pages = ""
    for i, recipe in enumerate(recipes, 1):
        ingredients_html = "\n".join(f'<li class="ingredient">{ing}</li>' for ing in recipe.get("ingredients", []))
        instructions_html = "\n".join(
            f'<div class="step"><span class="step-num">{j}</span><div><strong>{step["step"]}</strong><br>{step["text"]}</div></div>'
            for j, step in enumerate(recipe.get("instructions", []), 1)
        )

        recipe_pages += f'''
        <div class="page recipe-page">
            <div class="day-badge">DAY {i}</div>
            <div class="recipe-header">
                <h2 class="recipe-title">{recipe["title"]}</h2>
                <div class="protein-badge">{recipe["protein"]}g</div>
            </div>

            <div class="recipe-meta">
                <span>Prep: {recipe["prepTime"]} min</span>
                <span>Cook: {recipe["cookTime"]} min</span>
                <span>Total: {recipe["totalTime"]} min</span>
                <span>Yield: {recipe["yield"]}</span>
                <span>Difficulty: {recipe["difficulty"]}</span>
            </div>

            <div class="macros-bar">
                <div class="macro"><span class="macro-value">{recipe["calories"]}</span><span class="macro-label">CALORIES</span></div>
                <div class="macro protein"><span class="macro-value">{recipe["protein"]}g</span><span class="macro-label">PROTEIN</span></div>
                <div class="macro"><span class="macro-value">{recipe["carbs"]}g</span><span class="macro-label">CARBS</span></div>
                <div class="macro"><span class="macro-value">{recipe["fat"]}g</span><span class="macro-label">FAT</span></div>
            </div>

            <div class="recipe-content">
                <div class="ingredients-section">
                    <h3>INGREDIENTS</h3>
                    <ul class="ingredients-list">{ingredients_html}</ul>
                </div>
                <div class="instructions-section">
                    <h3>INSTRUCTIONS</h3>
                    <div class="instructions-list">{instructions_html}</div>
                </div>
            </div>
        </div>
        '''

    # Shopping list HTML
    shopping_html = ""
    for category, items in shopping_list.items():
        if items:
            items_html = "\n".join(f'<li class="shop-item"><span class="checkbox"></span>{item}</li>' for item in items)
            shopping_html += f'''
            <div class="shop-category">
                <h4>{category}</h4>
                <ul>{items_html}</ul>
            </div>
            '''

    # Table of contents
    toc_items = ""
    for i, recipe in enumerate(recipes, 1):
        toc_items += f'''
        <div class="toc-item">
            <span class="toc-day">Day {i}</span>
            <span class="toc-title">{recipe["title"].split("(")[0].strip()}</span>
            <span class="toc-protein">{recipe["protein"]}g protein</span>
        </div>
        '''

    html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>7-Day High-Protein Breakfast Meal Plan</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1e293b;
        }}

        .page {{
            width: 8.5in;
            min-height: 11in;
            padding: 0.75in;
            page-break-after: always;
            background: white;
        }}

        /* Cover Page */
        .cover {{
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }}

        .cover-icon {{
            font-size: 72pt;
            margin-bottom: 30px;
        }}

        .cover h1 {{
            font-size: 32pt;
            font-weight: 800;
            color: #f59e0b;
            margin-bottom: 15px;
            letter-spacing: -0.02em;
        }}

        .cover .subtitle {{
            font-size: 14pt;
            color: #64748b;
            margin-bottom: 40px;
        }}

        .cover .badge {{
            background: #f59e0b;
            color: white;
            padding: 10px 25px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 11pt;
        }}

        .cover .brand {{
            position: absolute;
            bottom: 60px;
            color: #94a3b8;
            font-size: 10pt;
        }}

        /* TOC Page */
        .toc {{
            background: #fefce8;
        }}

        .toc h2 {{
            font-size: 24pt;
            color: #f59e0b;
            margin-bottom: 30px;
            font-weight: 800;
        }}

        .toc-item {{
            display: flex;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #e2e8f0;
        }}

        .toc-day {{
            background: #f59e0b;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 9pt;
            font-weight: 600;
            margin-right: 15px;
            min-width: 55px;
            text-align: center;
        }}

        .toc-title {{
            flex: 1;
            font-weight: 500;
        }}

        .toc-protein {{
            background: #10b981;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 9pt;
            font-weight: 600;
        }}

        .toc-extras {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
        }}

        .toc-extras-item {{
            padding: 10px 0;
            color: #64748b;
        }}

        /* Recipe Pages */
        .recipe-page {{
            position: relative;
        }}

        .day-badge {{
            position: absolute;
            top: 0.5in;
            right: 0.5in;
            background: #f59e0b;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 10pt;
        }}

        .recipe-header {{
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-right: 100px;
        }}

        .recipe-title {{
            font-size: 20pt;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.2;
        }}

        .protein-badge {{
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 16pt;
            font-weight: 700;
        }}

        .recipe-meta {{
            display: flex;
            gap: 20px;
            color: #64748b;
            font-size: 9pt;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f59e0b;
        }}

        .macros-bar {{
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
        }}

        .macro {{
            flex: 1;
            background: #f8fafc;
            padding: 12px;
            border-radius: 10px;
            text-align: center;
        }}

        .macro.protein {{
            background: #ecfdf5;
        }}

        .macro-value {{
            display: block;
            font-size: 18pt;
            font-weight: 700;
            color: #1e293b;
        }}

        .macro.protein .macro-value {{
            color: #10b981;
        }}

        .macro-label {{
            font-size: 7pt;
            color: #94a3b8;
            font-weight: 600;
            letter-spacing: 0.05em;
        }}

        .recipe-content {{
            display: flex;
            gap: 30px;
        }}

        .ingredients-section {{
            width: 35%;
        }}

        .instructions-section {{
            width: 65%;
        }}

        .ingredients-section h3,
        .instructions-section h3 {{
            font-size: 10pt;
            font-weight: 700;
            color: #f59e0b;
            margin-bottom: 15px;
            letter-spacing: 0.05em;
        }}

        .ingredients-list {{
            list-style: none;
        }}

        .ingredient {{
            padding: 6px 0;
            border-bottom: 1px solid #f1f5f9;
            font-size: 9pt;
        }}

        .step {{
            display: flex;
            gap: 12px;
            margin-bottom: 15px;
        }}

        .step-num {{
            background: #f59e0b;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9pt;
            font-weight: 600;
            flex-shrink: 0;
        }}

        .step div {{
            font-size: 9pt;
            line-height: 1.5;
        }}

        /* Shopping List Page */
        .shopping-page h2 {{
            font-size: 24pt;
            color: #f59e0b;
            margin-bottom: 25px;
            font-weight: 800;
        }}

        .shop-grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
        }}

        .shop-category h4 {{
            font-size: 10pt;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #f59e0b;
        }}

        .shop-category ul {{
            list-style: none;
        }}

        .shop-item {{
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 5px 0;
            font-size: 9pt;
        }}

        .checkbox {{
            width: 14px;
            height: 14px;
            border: 2px solid #cbd5e1;
            border-radius: 3px;
            flex-shrink: 0;
            margin-top: 2px;
        }}

        /* Tips Page */
        .tips-page h2 {{
            font-size: 24pt;
            color: #f59e0b;
            margin-bottom: 25px;
            font-weight: 800;
        }}

        .tip-card {{
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
        }}

        .tip-card h4 {{
            font-size: 12pt;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
        }}

        .tip-card p {{
            font-size: 10pt;
            color: #64748b;
            line-height: 1.6;
        }}

        /* Back Page */
        .back-page {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: white;
        }}

        .back-page h2 {{
            font-size: 28pt;
            font-weight: 800;
            margin-bottom: 15px;
            color: #f59e0b;
        }}

        .back-page p {{
            font-size: 12pt;
            color: #94a3b8;
            margin-bottom: 30px;
        }}

        .back-page .url {{
            font-size: 18pt;
            font-weight: 700;
            color: #f59e0b;
        }}

        @media print {{
            .page {{
                page-break-after: always;
            }}
        }}
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="page cover">
        <div class="cover-icon">🍳</div>
        <h1>7-DAY HIGH-PROTEIN<br>BREAKFAST MEAL PLAN</h1>
        <p class="subtitle">Start every day with 30g+ protein. Macro-verified recipes for the whole week!</p>
        <div class="badge">7 Macro-Verified Recipes • {total_protein}g Total Protein</div>
        <div class="brand">HighProtein.Recipes | highprotein.recipes</div>
    </div>

    <!-- Table of Contents -->
    <div class="page toc">
        <h2>WHAT'S INSIDE</h2>
        {toc_items}
        <div class="toc-extras">
            <div class="toc-extras-item">Combined Shopping List</div>
            <div class="toc-extras-item">Pro Tips for Meal Prep</div>
        </div>
    </div>

    <!-- Recipe Pages -->
    {recipe_pages}

    <!-- Shopping List -->
    <div class="page shopping-page">
        <h2>COMBINED SHOPPING LIST</h2>
        <div class="shop-grid">
            {shopping_html}
        </div>
    </div>

    <!-- Pro Tips -->
    <div class="page tips-page">
        <h2>PRO TIPS</h2>

        <div class="tip-card">
            <h4>Meal Prep Sunday</h4>
            <p>Make the Freezer Breakfast Burritos and Sheet Pan Breakfast Bake on Sunday. They'll last all week in the fridge or up to 3 months in the freezer. Reheat in 2-3 minutes for instant high-protein breakfasts.</p>
        </div>

        <div class="tip-card">
            <h4>Overnight Prep</h4>
            <p>Prepare the Chia Protein Pudding the night before. It takes just 5 minutes and will be perfectly set by morning. Make multiple jars to grab-and-go throughout the week.</p>
        </div>

        <div class="tip-card">
            <h4>Protein Powder Tips</h4>
            <p>Different protein powders absorb liquid differently. If your batter is too thick, add liquid 1 tablespoon at a time. Whey blends best in hot recipes, while plant proteins work great in no-cook recipes.</p>
        </div>

        <div class="tip-card">
            <h4>Storage Guidelines</h4>
            <p>Refrigerator: Most cooked recipes last 4-5 days. Store in airtight containers.<br>
            Freezer: Burritos and egg bites freeze well for up to 3 months. Wrap individually for easy portions.</p>
        </div>

        <div class="tip-card">
            <h4>Ingredient Substitutions</h4>
            <p>Visit highprotein.recipes for our interactive ingredient substitution tool that automatically recalculates macros when you swap ingredients. Perfect for dietary restrictions or using what you have on hand.</p>
        </div>
    </div>

    <!-- Back Page -->
    <div class="page back-page">
        <h2>Want More Recipes?</h2>
        <p>Visit us for 300+ macro-verified high-protein recipes,<br>interactive ingredient swaps, and more free meal plans.</p>
        <div class="url">highprotein.recipes</div>
    </div>
</body>
</html>'''

    return html

def main():
    print("=" * 60)
    print("Generating 7-Day High-Protein Breakfast Meal Plan PDF")
    print("=" * 60)

    # Load recipes
    recipes = load_recipes()
    print(f"Loaded {len(recipes)} recipes")

    # Generate shopping list
    shopping_list = generate_shopping_list(recipes)
    print(f"Generated shopping list with {sum(len(v) for v in shopping_list.values())} items")

    # Generate HTML
    html = generate_html(recipes, shopping_list)

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Save HTML file (for browser PDF conversion)
    html_path = OUTPUT_DIR / "breakfast-meal-plan.html"
    with open(html_path, "w") as f:
        f.write(html)
    print(f"Generated HTML: {html_path}")

    # Try to generate PDF with weasyprint if available
    try:
        from weasyprint import HTML
        pdf_path = OUTPUT_DIR / "breakfast-meal-plan.pdf"
        HTML(string=html).write_pdf(pdf_path)
        print(f"Generated PDF: {pdf_path}")
    except ImportError:
        print("\nNote: weasyprint not installed. To generate PDF directly:")
        print("  pip install weasyprint")
        print("\nAlternatively, open the HTML file in a browser and print to PDF:")
        print(f"  file://{html_path.absolute()}")

    print("\nDone!")

if __name__ == "__main__":
    main()
