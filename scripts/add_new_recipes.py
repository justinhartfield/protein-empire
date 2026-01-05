#!/usr/bin/env python3
"""
Adds new gluten-free and dairy-free recipes and a new recipe pack to each site.
"""

import json
import os


def add_recipes_and_packs():
    base_recipe_path = "/home/ubuntu/protein-empire/data/recipes"
    new_recipes_file = os.path.join(base_recipe_path, "gluten-free-dairy-free-recipes.json")

    with open(new_recipes_file, 'r') as f:
        new_recipes_data = json.load(f)

    for site_key, recipes in new_recipes_data.items():
        site_recipe_dir = os.path.join(base_recipe_path, site_key)
        recipes_json_path = os.path.join(site_recipe_dir, "recipes.json")
        packs_json_path = os.path.join(site_recipe_dir, "packs.json")

        # Add new recipes to recipes.json
        with open(recipes_json_path, 'r+') as f:
            existing_data = json.load(f)
            recipe_list = None
            
            if isinstance(existing_data, list):
                recipe_list = existing_data
            elif isinstance(existing_data, dict) and 'recipes' in existing_data and isinstance(existing_data['recipes'], list):
                recipe_list = existing_data['recipes']

            if recipe_list is not None:
                recipe_list.append(recipes["gluten_free"])
                recipe_list.append(recipes["dairy_free"])
                f.seek(0)
                json.dump(existing_data, f, indent=2)
                f.truncate()
                print(f"Added 2 recipes to {recipes_json_path}")
            else:
                print(f"Could not find a recipe list in {recipes_json_path}")

        # Add new pack to packs.json
        with open(packs_json_path, 'r+') as f:
            existing_packs = json.load(f)
            if isinstance(existing_packs, list):
                new_pack = {
                    "slug": "gluten-free-dairy-free",
                    "title": "Gluten-Free & Dairy-Free",
                    "description": "A collection of our best gluten-free and dairy-free recipes, perfect for those with dietary restrictions.",
                    "icon": "\ud83e\udd6c",
                    "recipes": [
                        recipes["gluten_free"]["slug"],
                        recipes["dairy_free"]["slug"]
                    ]
                }
                existing_packs.append(new_pack)
                f.seek(0)
                json.dump(existing_packs, f, indent=2)
                f.truncate()
                print(f"Added new pack to {packs_json_path}")
            else:
                print(f"Skipping {packs_json_path} as it is not a list.")

if __name__ == "__main__":
    add_recipes_and_packs()
