#!/usr/bin/env python3
"""
Generate JavaScript data file from recipes.json
Creates breakfast-data.js for use in client-side calculators
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data" / "breakfast"
JS_DIR = BASE_DIR / "js"


def main():
    print("=" * 50)
    print("Generating breakfast-data.js")
    print("=" * 50)

    # Load recipes
    with open(DATA_DIR / "recipes.json", "r") as f:
        data = json.load(f)

    recipes = data["recipes"]

    # Extract minimal data needed for calculators
    minimal_recipes = []
    for recipe in recipes:
        minimal_recipes.append({
            "id": recipe["id"],
            "slug": recipe["slug"],
            "title": recipe["title"],
            "protein": recipe["protein"],
            "calories": recipe["calories"],
            "carbs": recipe["carbs"],
            "fat": recipe["fat"],
            "fiber": recipe.get("fiber", 0),
            "peRatio": recipe.get("peRatio", 0),
            "prepTime": recipe.get("prepTime", ""),
            "cookTime": recipe.get("cookTime", ""),
            "totalTime": recipe.get("totalTime", ""),
            "category": recipe.get("category", ""),
            "subcategory": recipe.get("subcategory", ""),
            "dietary": recipe.get("dietary", {}),
            "mealPrep": {
                "isMealPrep": recipe.get("mealPrep", {}).get("isMealPrep", False),
                "freezerFriendly": recipe.get("mealPrep", {}).get("freezerFriendly", False)
            },
            "image": recipe.get("image", ""),
            "tags": recipe.get("tags", [])
        })

    # Generate JavaScript file
    js_content = f"""/**
 * Breakfast Recipe Data
 * Auto-generated from recipes.json
 * Last updated: {data.get('lastUpdated', 'unknown')}
 */

const BREAKFAST_RECIPES = {json.dumps(minimal_recipes, indent=2)};

// Make available globally
if (typeof window !== 'undefined') {{
    window.BREAKFAST_RECIPES = BREAKFAST_RECIPES;
}}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = BREAKFAST_RECIPES;
}}
"""

    # Ensure JS directory exists
    JS_DIR.mkdir(parents=True, exist_ok=True)

    # Write JS file
    output_file = JS_DIR / "breakfast-data.js"
    with open(output_file, "w") as f:
        f.write(js_content)

    print(f"Generated: {output_file}")
    print(f"Total recipes: {len(minimal_recipes)}")


if __name__ == "__main__":
    main()
