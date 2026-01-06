"""
Sitemap Generator for HighProtein.Recipes
Generates a comprehensive sitemap.xml including all landing pages.
"""

import os
from datetime import datetime

# Site configuration
SITE_CONFIG = {
    'domain': 'highprotein.recipes',
    'base_url': 'https://highprotein.recipes'
}

# Static pages with priorities
STATIC_PAGES = [
    {'url': '/', 'priority': '1.0', 'changefreq': 'daily'},
]

# Intent-based landing pages
INTENT_PAGES = [
    {'slug': 'quick-snacks', 'priority': '0.9', 'changefreq': 'weekly'},
    {'slug': 'vegan', 'priority': '0.9', 'changefreq': 'weekly'},
    {'slug': '30g-protein', 'priority': '0.9', 'changefreq': 'weekly'},
    {'slug': 'post-workout', 'priority': '0.9', 'changefreq': 'weekly'},
    {'slug': 'gluten-free', 'priority': '0.9', 'changefreq': 'weekly'},
    {'slug': 'meal-prep', 'priority': '0.8', 'changefreq': 'weekly'},
    {'slug': 'kid-friendly', 'priority': '0.8', 'changefreq': 'weekly'},
]

# Macro-based landing pages
MACRO_PAGES = [
    {'slug': 'under-200-calories', 'priority': '0.8', 'changefreq': 'weekly'},
    {'slug': 'under-10g-carbs', 'priority': '0.8', 'changefreq': 'weekly'},
    {'slug': 'under-5g-sugar', 'priority': '0.8', 'changefreq': 'weekly'},
    {'slug': 'high-fiber', 'priority': '0.8', 'changefreq': 'weekly'},
    {'slug': '10-minute-recipes', 'priority': '0.8', 'changefreq': 'weekly'},
]

# Category pages
CATEGORY_PAGES = [
    {'slug': 'category-breakfast', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'category-desserts', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'category-snacks', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'category-savory', 'priority': '0.7', 'changefreq': 'weekly'},
]

# Type pages (by site)
TYPE_PAGES = [
    {'slug': 'type-cookies', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'type-pancakes', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'type-brownies', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'type-bread', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'type-bars', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'type-bites', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'type-donuts', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'type-oatmeal', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'type-cheesecake', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'type-pizza', 'priority': '0.7', 'changefreq': 'weekly'},
    {'slug': 'type-pudding', 'priority': '0.7', 'changefreq': 'weekly'},
]


def generate_sitemap_xml(output_dir):
    """Generate the sitemap.xml file."""
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Start XML
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    
    # Add static pages
    for page in STATIC_PAGES:
        url = f"{SITE_CONFIG['base_url']}{page['url']}"
        xml_lines.append(f'''  <url>
    <loc>{url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>''')
    
    # Add intent pages
    for page in INTENT_PAGES:
        url = f"{SITE_CONFIG['base_url']}/{page['slug']}/"
        xml_lines.append(f'''  <url>
    <loc>{url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>''')
    
    # Add macro pages
    for page in MACRO_PAGES:
        url = f"{SITE_CONFIG['base_url']}/{page['slug']}/"
        xml_lines.append(f'''  <url>
    <loc>{url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>''')
    
    # Add category pages
    for page in CATEGORY_PAGES:
        url = f"{SITE_CONFIG['base_url']}/{page['slug']}.html"
        xml_lines.append(f'''  <url>
    <loc>{url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>''')
    
    # Add type pages
    for page in TYPE_PAGES:
        url = f"{SITE_CONFIG['base_url']}/{page['slug']}.html"
        xml_lines.append(f'''  <url>
    <loc>{url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>''')
    
    # Scan for preview pages
    preview_pages = []
    for filename in os.listdir(output_dir):
        if filename.endswith('-preview.html'):
            preview_pages.append(filename)
    
    for filename in sorted(preview_pages):
        url = f"{SITE_CONFIG['base_url']}/{filename}"
        xml_lines.append(f'''  <url>
    <loc>{url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>''')
    
    # Close XML
    xml_lines.append('</urlset>')
    
    # Write sitemap
    sitemap_path = os.path.join(output_dir, 'sitemap.xml')
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml_lines))
    
    total_urls = (len(STATIC_PAGES) + len(INTENT_PAGES) + len(MACRO_PAGES) + 
                  len(CATEGORY_PAGES) + len(TYPE_PAGES) + len(preview_pages))
    
    print(f"✅ Generated sitemap.xml with {total_urls} URLs")
    print(f"   - Static pages: {len(STATIC_PAGES)}")
    print(f"   - Intent pages: {len(INTENT_PAGES)}")
    print(f"   - Macro pages: {len(MACRO_PAGES)}")
    print(f"   - Category pages: {len(CATEGORY_PAGES)}")
    print(f"   - Type pages: {len(TYPE_PAGES)}")
    print(f"   - Preview pages: {len(preview_pages)}")
    
    return sitemap_path


def generate_robots_txt(output_dir):
    """Generate robots.txt file."""
    
    robots_content = f"""# Robots.txt for {SITE_CONFIG['domain']}
User-agent: *
Allow: /

# Sitemap
Sitemap: {SITE_CONFIG['base_url']}/sitemap.xml

# Feed
Allow: /feed/

# Crawl-delay (optional, for politeness)
Crawl-delay: 1
"""
    
    robots_path = os.path.join(output_dir, 'robots.txt')
    with open(robots_path, 'w', encoding='utf-8') as f:
        f.write(robots_content)
    
    print(f"✅ Generated robots.txt")
    
    return robots_path


def main():
    # Determine paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.dirname(os.path.dirname(script_dir))
    output_dir = os.path.join(base_path, 'apps', 'highprotein.recipes', 'dist')
    
    print("=" * 50)
    print("GENERATING SITEMAP & ROBOTS.TXT")
    print("=" * 50)
    print(f"Output dir: {output_dir}")
    print()
    
    # Generate sitemap
    generate_sitemap_xml(output_dir)
    
    # Generate robots.txt
    generate_robots_txt(output_dir)
    
    print()
    print("Done!")


if __name__ == '__main__':
    main()
