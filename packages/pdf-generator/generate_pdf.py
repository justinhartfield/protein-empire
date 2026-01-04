#!/usr/bin/env python3
"""
PDF Recipe Pack Generator for the Protein Empire

Generates printable PDF recipe packs using WeasyPrint and Jinja2 templates.
Can source data from local JSON files or Strapi CMS.

Usage:
    python3 generate_pdf.py <domain>
    python3 generate_pdf.py proteincookies.co
"""

import json
import os
import sys
from pathlib import Path
from jinja2 import Template
from weasyprint import HTML, CSS

# Paths
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent.parent
TEMPLATE_PATH = SCRIPT_DIR / "template.html"


def load_template():
    """Load the HTML template."""
    with open(TEMPLATE_PATH, "r") as f:
        return Template(f.read())


def load_site_config(domain: str) -> dict:
    """Load site configuration from sites.js."""
    sites_file = ROOT_DIR / "packages" / "config" / "sites.js"
    with open(sites_file, "r") as f:
        content = f.read()
    
    # Parse the JS object for the specific domain
    import re
    
    # Find the site config block
    pattern = rf"'{re.escape(domain)}':\s*\{{([^}}]+)\}}"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        raise ValueError(f"Site not found: {domain}")
    
    # Parse the config
    config_str = match.group(1)
    site = {"domain": domain}
    
    # Extract key-value pairs
    for line in config_str.split(","):
        line = line.strip()
        if ":" in line:
            key_match = re.match(r"(\w+):\s*['\"]?([^'\"]+)['\"]?", line)
            if key_match:
                key = key_match.group(1)
                value = key_match.group(2).strip()
                site[key] = value
    
    return site


def load_recipes(domain: str) -> list:
    """Load recipes from JSON file."""
    domain_slug = domain.replace(".", "-")
    recipes_file = ROOT_DIR / "data" / "recipes" / domain_slug / "recipes.json"
    
    with open(recipes_file, "r") as f:
        data = json.load(f)
    
    return data.get("recipes", data) if isinstance(data, dict) else data


def load_packs(domain: str) -> list:
    """Load recipe packs from JSON file."""
    domain_slug = domain.replace(".", "-")
    packs_file = ROOT_DIR / "data" / "recipes" / domain_slug / "packs.json"
    
    with open(packs_file, "r") as f:
        return json.load(f)


def generate_shopping_list(recipes: list) -> dict:
    """Generate a categorized shopping list from recipes."""
    categories = {
        "Dry Ingredients": [],
        "Dairy & Eggs": [],
        "Produce": [],
        "Sweeteners & Flavorings": [],
        "Other": []
    }
    
    seen = set()
    
    for recipe in recipes:
        for ing in recipe.get("ingredients", []):
            # Handle string ingredients
            if isinstance(ing, str):
                name = ing.lower()
                display_name = ing
            else:
                name = ing.get("name", "").lower()
                display_name = ing.get("name", "")
            
            if name in seen or not name:
                continue
            seen.add(name)
            
            # Categorize
            if any(x in name for x in ["flour", "oat", "protein", "powder", "baking", "cocoa"]):
                categories["Dry Ingredients"].append(display_name)
            elif any(x in name for x in ["yogurt", "egg", "milk", "cheese", "butter", "cream"]):
                categories["Dairy & Eggs"].append(display_name)
            elif any(x in name for x in ["banana", "apple", "pumpkin", "berry", "lemon", "fruit"]):
                categories["Produce"].append(display_name)
            elif any(x in name for x in ["syrup", "honey", "sugar", "vanilla", "extract", "chocolate"]):
                categories["Sweeteners & Flavorings"].append(display_name)
            else:
                categories["Other"].append(display_name)
    
    return categories


def generate_pdf(site: dict, pack: dict, recipes: list, output_path: Path):
    """Generate a PDF for a recipe pack."""
    template = load_template()
    
    # Generate shopping list
    shopping_list = generate_shopping_list(recipes)
    
    # Render HTML
    html_content = template.render(
        brand_color=site.get("brandColor", "#f59e0b"),
        site_name=site.get("name", ""),
        site_domain=site.get("domain", ""),
        food_type=site.get("foodTypePlural", "recipes"),
        pack_title=pack.get("title", ""),
        pack_description=pack.get("description", ""),
        pack_icon=pack.get("icon", "📚"),
        recipe_count=len(recipes),
        recipes=recipes,
        shopping_list=shopping_list
    )
    
    # Generate PDF
    html = HTML(string=html_content)
    html.write_pdf(str(output_path))
    
    print(f"  ✓ Generated: {output_path.name}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 generate_pdf.py <domain>")
        print("Example: python3 generate_pdf.py proteincookies.co")
        sys.exit(1)
    
    domain = sys.argv[1]
    domain_slug = domain.replace(".", "-")
    
    print(f"\n📄 Generating PDFs for: {domain}\n")
    
    # Load data
    try:
        site = load_site_config(domain)
        all_recipes = load_recipes(domain)
        packs = load_packs(domain)
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        sys.exit(1)
    
    print(f"📚 Found {len(all_recipes)} recipes and {len(packs)} packs")
    
    # Create output directory
    output_dir = ROOT_DIR / "apps" / domain / "dist" / "guides"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Output directory: {output_dir}\n")
    
    # Generate PDF for each pack
    generated = 0
    for pack in packs:
        print(f"📖 Generating: {pack.get('title', pack.get('slug'))}...")
        
        # Get recipes for this pack
        pack_recipe_slugs = pack.get("recipes", [])
        pack_recipes = [r for r in all_recipes if r.get("slug") in pack_recipe_slugs]
        
        if not pack_recipes:
            print(f"   ⚠️ No recipes found for pack")
            continue
        
        output_path = output_dir / f"{domain_slug}-{pack.get('slug')}.pdf"
        
        try:
            generate_pdf(site, pack, pack_recipes, output_path)
            generated += 1
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print(f"\n✅ Generated {generated} PDFs")
    print(f"   Output: {output_dir}")
    
    # List generated files
    pdf_files = list(output_dir.glob("*.pdf"))
    print(f"   Files:")
    for f in pdf_files:
        size_kb = f.stat().st_size / 1024
        print(f"     - {f.name} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
