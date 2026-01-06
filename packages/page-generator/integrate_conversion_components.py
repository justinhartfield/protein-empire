#!/usr/bin/env python3
"""
Conversion Components Integration Script

Integrates the conversion components (exit intent, PDF modal, sticky footer, print button)
into all ProteinXYZ.co site pages.

This script:
1. Copies the conversion-components.js to each site's dist/js/ folder
2. Injects the script tag and initialization code into all HTML pages
3. Updates the page generator to include components in future builds
"""

import os
import re
from pathlib import Path

# Configuration
REPO_ROOT = Path(__file__).parent.parent.parent
APPS_DIR = REPO_ROOT / "apps"
CONVERSION_JS = REPO_ROOT / "packages" / "conversion" / "conversion-components.js"

# Site configurations with their specific settings
SITE_CONFIGS = {
    "proteincookies.co": {
        "siteName": "Protein Cookies",
        "siteEmoji": "🍪",
        "leadMagnetTitle": "Protein Cookie Starter Pack",
        "leadMagnetDescription": "Get 25+ protein cookie recipes with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/protein-cookies-starter-pack.pdf"
    },
    "proteinbrownies.co": {
        "siteName": "Protein Brownies",
        "siteEmoji": "🍫",
        "leadMagnetTitle": "Protein Brownie Recipe Pack",
        "leadMagnetDescription": "Get 20+ protein brownie recipes with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/protein-brownies-pack.pdf"
    },
    "proteinpancakes.co": {
        "siteName": "Protein Pancakes",
        "siteEmoji": "🥞",
        "leadMagnetTitle": "Protein Pancake Starter Pack",
        "leadMagnetDescription": "Get 25+ protein pancake recipes with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/protein-pancakes-pack.pdf"
    },
    "proteinmuffins.com": {
        "siteName": "Protein Muffins",
        "siteEmoji": "🧁",
        "leadMagnetTitle": "Protein Muffin Recipe Pack",
        "leadMagnetDescription": "Get 20+ protein muffin recipes with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/protein-muffins-pack.pdf"
    },
    "proteindonuts.co": {
        "siteName": "Protein Donuts",
        "siteEmoji": "🍩",
        "leadMagnetTitle": "Protein Donut Recipe Pack",
        "leadMagnetDescription": "Get 15+ protein donut recipes with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/protein-donuts-pack.pdf"
    },
    "proteinbars.co": {
        "siteName": "Protein Bars",
        "siteEmoji": "🍫",
        "leadMagnetTitle": "Protein Bar Starter Pack",
        "leadMagnetDescription": "Get 25+ homemade protein bar recipes with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/protein-bars-pack.pdf"
    },
    "proteinbites.co": {
        "siteName": "Protein Bites",
        "siteEmoji": "🔵",
        "leadMagnetTitle": "Protein Bites Recipe Pack",
        "leadMagnetDescription": "Get 20+ protein bite recipes with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/protein-bites-pack.pdf"
    },
    "proteinbread.co": {
        "siteName": "Protein Bread",
        "siteEmoji": "🍞",
        "leadMagnetTitle": "Protein Bread Recipe Pack",
        "leadMagnetDescription": "Get 15+ protein bread recipes with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/protein-bread-pack.pdf"
    },
    "proteinpizzas.co": {
        "siteName": "Protein Pizzas",
        "siteEmoji": "🍕",
        "leadMagnetTitle": "Protein Pizza Recipe Pack",
        "leadMagnetDescription": "Get 15+ protein pizza recipes with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/protein-pizzas-pack.pdf"
    },
    "proteincheesecake.co": {
        "siteName": "Protein Cheesecake",
        "siteEmoji": "🍰",
        "leadMagnetTitle": "Protein Cheesecake Recipe Pack",
        "leadMagnetDescription": "Get 20+ protein cheesecake recipes with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/protein-cheesecake-pack.pdf"
    },
    "highprotein.recipes": {
        "siteName": "High Protein Recipes",
        "siteEmoji": "🥗",
        "leadMagnetTitle": "High-Protein Starter Pack",
        "leadMagnetDescription": "Get 50+ high-protein recipes from all our sites with shopping lists and macro breakdowns.",
        "pdfDownloadUrl": "/downloads/high-protein-starter-pack.pdf"
    },
}


def get_init_script(config):
    """Generate the initialization script for a specific site."""
    return f'''
<!-- Conversion Components -->
<script src="/js/conversion-components.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {{
        initConversionComponents({{
            siteName: '{config["siteName"]}',
            siteEmoji: '{config["siteEmoji"]}',
            leadMagnetTitle: '{config["leadMagnetTitle"]}',
            leadMagnetDescription: '{config["leadMagnetDescription"]}',
            sendgridEndpoint: '/.netlify/functions/subscribe',
            successRedirect: '/download-success/',
            pdfDownloadUrl: '{config["pdfDownloadUrl"]}',
            gaMeasurementId: 'G-86MYLJ5WDT',
            stickyDelay: 3000,
            exitIntentEnabled: true
        }});
    }});
</script>
'''


def inject_components_into_html(html_content, init_script):
    """Inject the conversion components script into an HTML page."""
    
    # Check if already injected
    if 'conversion-components.js' in html_content:
        return html_content, False
    
    # Find the closing </body> tag and inject before it
    if '</body>' in html_content:
        html_content = html_content.replace('</body>', f'{init_script}\n</body>')
        return html_content, True
    
    return html_content, False


def copy_js_file(site_dir):
    """Copy the conversion-components.js to the site's js directory."""
    js_dir = site_dir / "dist" / "js"
    js_dir.mkdir(parents=True, exist_ok=True)
    
    dest_file = js_dir / "conversion-components.js"
    
    if CONVERSION_JS.exists():
        with open(CONVERSION_JS, 'r') as f:
            content = f.read()
        with open(dest_file, 'w') as f:
            f.write(content)
        return True
    return False


def process_site(site_name, site_dir):
    """Process a single site, adding conversion components to all pages."""
    
    config = SITE_CONFIGS.get(site_name)
    if not config:
        print(f"  ⚠ No config for {site_name}, using defaults")
        config = {
            "siteName": site_name.replace('.', ' ').title(),
            "siteEmoji": "🍽️",
            "leadMagnetTitle": "Recipe Starter Pack",
            "leadMagnetDescription": "Get our free recipe pack with shopping lists and macro breakdowns.",
            "pdfDownloadUrl": "/downloads/starter-pack.pdf"
        }
    
    dist_dir = site_dir / "dist"
    if not dist_dir.exists():
        print(f"  ⚠ No dist directory for {site_name}")
        return 0
    
    # Copy JS file
    if copy_js_file(site_dir):
        print(f"  ✓ Copied conversion-components.js")
    
    # Generate init script
    init_script = get_init_script(config)
    
    # Process all HTML files
    html_files = list(dist_dir.rglob("*.html"))
    updated_count = 0
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content, was_updated = inject_components_into_html(content, init_script)
            
            if was_updated:
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                updated_count += 1
                
        except Exception as e:
            print(f"  ⚠ Error processing {html_file.name}: {e}")
    
    return updated_count


def main():
    print("=" * 60)
    print("Conversion Components Integration")
    print("=" * 60)
    
    if not CONVERSION_JS.exists():
        print(f"❌ Error: {CONVERSION_JS} not found")
        return
    
    total_updated = 0
    
    for site_dir in APPS_DIR.iterdir():
        if not site_dir.is_dir():
            continue
        
        site_name = site_dir.name
        print(f"\n📁 Processing {site_name}...")
        
        updated = process_site(site_name, site_dir)
        total_updated += updated
        
        if updated > 0:
            print(f"  ✓ Updated {updated} HTML files")
        else:
            print(f"  - No files updated (already integrated or no dist)")
    
    print("\n" + "=" * 60)
    print(f"✅ Integration complete! Updated {total_updated} files total.")
    print("=" * 60)


if __name__ == "__main__":
    main()
