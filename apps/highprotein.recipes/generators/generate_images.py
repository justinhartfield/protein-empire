#!/usr/bin/env python3
"""
Generate Recipe Images using Ideogram API
Generates professional food photography for all breakfast recipes
"""

import json
import os
import requests
import time
from pathlib import Path

# API Configuration
API_KEY = os.environ.get("IDEOGRAM_API_KEY", "7EeSWl-Gj0s-1Zo7o2qwHXkaZijlYx_GnQzqYuuRTCTo2b39VbM5n_tmOPR7mSoco2aR4UHWxplgJgWU9PLQgw")
API_URL = "https://api.ideogram.ai/generate"

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data" / "breakfast"
IMAGES_DIR = BASE_DIR / "images" / "breakfast"

# Category-specific prompt enhancements
CATEGORY_PROMPTS = {
    "Meal Prep": "organized meal prep containers, batch cooking setup, clean modern kitchen background",
    "Vegan": "vibrant plant-based ingredients, fresh vegetables visible, earthy natural tones",
    "Low-Calorie": "light and fresh presentation, bright airy feel, portion-controlled",
    "Fast-Food Clone": "fast-food inspired presentation but elevated, comfort food appeal",
    "High-Fiber": "wholesome ingredients visible, grains and seeds, hearty texture",
    "Grab-and-Go": "portable handheld format, wrapped or individually portioned, on-the-go lifestyle"
}

SUBCATEGORY_PROMPTS = {
    "Burritos & Wraps": "cross-section cut showing colorful filling, foil partially wrapped, steam visible",
    "Eggs & Scrambles": "fluffy texture, sunny morning light, breakfast table setting",
    "Bowls": "top-down flat lay, colorful ingredients artfully arranged, garnished with fresh herbs",
    "Sausage & Patties": "golden brown crispy exterior, stacked neatly, fresh herbs garnish",
    "Puddings": "layered in clear glass jar, creamy texture visible, topped with seeds and fruit",
    "Muffins": "slightly broken open to show texture, steam rising, rustic breakfast setting",
    "Sandwiches": "cross-section showing layers, melted cheese pull, toasted bread texture",
    "Pancakes & Waffles": "stack with syrup drizzle, butter melting, berries on top",
    "Oatmeal & Porridge": "creamy texture in ceramic bowl, swirled toppings, cozy morning feel",
    "Scrambles": "fluffy scrambled texture, colorful mix-ins visible, fresh herbs on top",
    "Soups": "steaming bowl, poached egg floating, crusty bread on side"
}


def load_recipes():
    """Load recipes from JSON file"""
    with open(DATA_DIR / "recipes.json", "r") as f:
        data = json.load(f)
    return data["recipes"]


def build_prompt(recipe):
    """Build an optimized prompt for Ideogram based on recipe details"""

    # Base prompt
    base = f"Professional food photography of {recipe['title'].split('(')[0].strip()}"

    # Add category-specific styling
    category = recipe.get("category", "")
    category_style = CATEGORY_PROMPTS.get(category, "")

    # Add subcategory-specific styling
    subcategory = recipe.get("subcategory", "")
    subcategory_style = SUBCATEGORY_PROMPTS.get(subcategory, "")

    # Combine prompt parts
    prompt_parts = [
        base,
        "high-protein breakfast dish",
        subcategory_style if subcategory_style else category_style,
        "styled on clean white marble surface",
        "natural soft morning window light",
        "appetizing presentation with visible texture",
        "magazine-quality editorial food photography",
        "45-degree overhead angle",
        "shallow depth of field with bokeh background",
        "no text, no watermarks, no logos",
        "photorealistic, 8k quality"
    ]

    # Filter out empty strings and join
    prompt = ". ".join(filter(None, prompt_parts))

    return prompt


def generate_image(recipe):
    """Generate a single recipe image using Ideogram API"""

    prompt = build_prompt(recipe)

    headers = {
        "Api-Key": API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "image_request": {
            "prompt": prompt,
            "aspect_ratio": "ASPECT_1_1",
            "model": "V_2",
            "magic_prompt_option": "AUTO"
        }
    }

    print(f"  Generating: {recipe['title'][:50]}...")
    print(f"  Prompt: {prompt[:100]}...")

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        result = response.json()

        # Get image URL from response
        if "data" in result and len(result["data"]) > 0:
            image_url = result["data"][0]["url"]

            # Download the image
            image_response = requests.get(image_url, timeout=60)
            image_response.raise_for_status()

            # Save as WebP (Ideogram returns PNG, we'll save as-is for now)
            # In production, you'd convert to WebP using Pillow
            output_path = IMAGES_DIR / f"{recipe['slug']}.png"
            with open(output_path, "wb") as f:
                f.write(image_response.content)

            print(f"  Saved: {output_path}")
            return str(output_path)
        else:
            print(f"  ERROR: No image data in response")
            return None

    except requests.exceptions.RequestException as e:
        print(f"  ERROR: {str(e)}")
        return None


def main():
    """Generate images for all recipes"""

    print("=" * 60)
    print("IDEOGRAM IMAGE GENERATOR")
    print("Generating professional food photography for breakfast recipes")
    print("=" * 60)

    # Ensure images directory exists
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    # Load recipes
    recipes = load_recipes()
    print(f"\nLoaded {len(recipes)} recipes from {DATA_DIR / 'recipes.json'}")

    # Check for existing images
    existing = set(f.stem for f in IMAGES_DIR.glob("*.png"))
    print(f"Found {len(existing)} existing images")

    # Filter to recipes needing images
    to_generate = [r for r in recipes if r["slug"] not in existing]
    print(f"Need to generate {len(to_generate)} images")

    if not to_generate:
        print("\nAll images already exist! Nothing to generate.")
        return

    # Generate images
    success = 0
    failed = 0

    for i, recipe in enumerate(to_generate, 1):
        print(f"\n[{i}/{len(to_generate)}] {recipe['title']}")

        result = generate_image(recipe)

        if result:
            success += 1
        else:
            failed += 1

        # Rate limiting - wait between requests
        if i < len(to_generate):
            print("  Waiting 2 seconds before next request...")
            time.sleep(2)

    # Summary
    print("\n" + "=" * 60)
    print("GENERATION COMPLETE")
    print(f"  Success: {success}")
    print(f"  Failed: {failed}")
    print(f"  Images saved to: {IMAGES_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
