#!/usr/bin/env python3
"""
Validation Script for Dotoro Integration
Verifies feed schema, landing pages, and SEO elements.
"""

import json
import os
import sys
from pathlib import Path

BASE_PATH = Path(__file__).parent.parent
DIST_PATH = BASE_PATH / 'apps' / 'highprotein.recipes' / 'dist'

# Required fields for Dotoro feed
REQUIRED_FEED_FIELDS = [
    'recipe_id',
    'title',
    'protein_grams',
    'calories',
    'diet_tags',
    'meal_type',
    'prep_time',
    'canonical_url',
    'image_url',
    'intent_class'
]

# Valid intent classes
VALID_INTENT_CLASSES = [
    'post-workout',
    'meal-prep',
    'weight-loss',
    'kid-friendly',
    'quick-snack',
    'high-protein-30g',
    'vegan',
    'gluten-free'
]

# Expected landing pages
EXPECTED_LANDING_PAGES = [
    'quick-snacks',
    'vegan',
    '30g-protein',
    'post-workout',
    'gluten-free',
    'meal-prep',
    'kid-friendly',
    'under-200-calories',
    'under-10g-carbs',
    'under-5g-sugar',
    'high-fiber',
    '10-minute-recipes'
]


def validate_feed():
    """Validate the master feed JSON."""
    print("\n" + "=" * 60)
    print("VALIDATING MASTER FEED")
    print("=" * 60)
    
    feed_path = DIST_PATH / 'feed' / 'recipes.json'
    
    if not feed_path.exists():
        print(f"❌ Feed not found: {feed_path}")
        return False
    
    with open(feed_path, 'r') as f:
        feed = json.load(f)
    
    errors = []
    warnings = []
    
    # Check metadata
    if 'metadata' not in feed:
        errors.append("Missing 'metadata' section")
    else:
        meta = feed['metadata']
        print(f"  Feed name: {meta.get('name', 'N/A')}")
        print(f"  Total recipes: {meta.get('total_recipes', 'N/A')}")
        print(f"  Sites included: {meta.get('sites_included', 'N/A')}")
        print(f"  Generated at: {meta.get('generated_at', 'N/A')}")
    
    # Check recipes
    recipes = feed.get('recipes', [])
    if not recipes:
        errors.append("No recipes in feed")
        return False
    
    print(f"\n  Validating {len(recipes)} recipes...")
    
    # Check each recipe
    for i, recipe in enumerate(recipes):
        recipe_id = recipe.get('recipe_id', f'recipe_{i}')
        
        # Check required fields
        for field in REQUIRED_FEED_FIELDS:
            if field not in recipe:
                errors.append(f"Recipe '{recipe_id}' missing field: {field}")
            elif recipe[field] is None or recipe[field] == '':
                warnings.append(f"Recipe '{recipe_id}' has empty field: {field}")
        
        # Validate intent_class
        intent = recipe.get('intent_class')
        if intent and intent not in VALID_INTENT_CLASSES:
            warnings.append(f"Recipe '{recipe_id}' has unknown intent_class: {intent}")
        
        # Validate URLs
        canonical = recipe.get('canonical_url', '')
        if canonical and not canonical.startswith('https://'):
            errors.append(f"Recipe '{recipe_id}' has invalid canonical_url: {canonical}")
        
        # Validate numeric fields
        protein = recipe.get('protein_grams', 0)
        if not isinstance(protein, (int, float)) or protein < 0:
            errors.append(f"Recipe '{recipe_id}' has invalid protein_grams: {protein}")
    
    # Print results
    if errors:
        print(f"\n  ❌ {len(errors)} errors found:")
        for error in errors[:10]:  # Show first 10
            print(f"     - {error}")
        if len(errors) > 10:
            print(f"     ... and {len(errors) - 10} more")
    else:
        print(f"\n  ✅ All required fields present")
    
    if warnings:
        print(f"\n  ⚠️  {len(warnings)} warnings:")
        for warning in warnings[:5]:
            print(f"     - {warning}")
        if len(warnings) > 5:
            print(f"     ... and {len(warnings) - 5} more")
    
    # Check intent distribution
    intent_counts = {}
    for recipe in recipes:
        intent = recipe.get('intent_class', 'unknown')
        intent_counts[intent] = intent_counts.get(intent, 0) + 1
    
    print(f"\n  Intent class distribution:")
    for intent, count in sorted(intent_counts.items(), key=lambda x: -x[1]):
        pct = count / len(recipes) * 100
        print(f"     {intent}: {count} ({pct:.1f}%)")
    
    return len(errors) == 0


def validate_landing_pages():
    """Validate landing pages exist and have proper structure."""
    print("\n" + "=" * 60)
    print("VALIDATING LANDING PAGES")
    print("=" * 60)
    
    errors = []
    
    for slug in EXPECTED_LANDING_PAGES:
        page_path = DIST_PATH / slug / 'index.html'
        
        if not page_path.exists():
            errors.append(f"Missing landing page: /{slug}/")
            continue
        
        # Read and check content
        with open(page_path, 'r') as f:
            content = f.read()
        
        # Check for required elements
        checks = {
            'title tag': '<title>' in content,
            'meta description': 'meta name="description"' in content,
            'canonical URL': 'rel="canonical"' in content,
            'Schema.org': 'application/ld+json' in content,
            'ItemList schema': '"@type": "ItemList"' in content or '"@type":"ItemList"' in content,
            'Open Graph': 'og:title' in content,
        }
        
        missing = [k for k, v in checks.items() if not v]
        
        if missing:
            errors.append(f"/{slug}/ missing: {', '.join(missing)}")
            print(f"  ⚠️  /{slug}/ - missing {len(missing)} elements")
        else:
            print(f"  ✅ /{slug}/ - all SEO elements present")
    
    if errors:
        print(f"\n  ❌ {len(errors)} issues found")
    else:
        print(f"\n  ✅ All {len(EXPECTED_LANDING_PAGES)} landing pages validated")
    
    return len(errors) == 0


def validate_sitemap():
    """Validate sitemap.xml."""
    print("\n" + "=" * 60)
    print("VALIDATING SITEMAP")
    print("=" * 60)
    
    sitemap_path = DIST_PATH / 'sitemap.xml'
    
    if not sitemap_path.exists():
        print("  ❌ sitemap.xml not found")
        return False
    
    with open(sitemap_path, 'r') as f:
        content = f.read()
    
    # Count URLs
    url_count = content.count('<url>')
    print(f"  URLs in sitemap: {url_count}")
    
    # Check for landing pages in sitemap
    missing = []
    for slug in EXPECTED_LANDING_PAGES:
        if f"/{slug}/" not in content:
            missing.append(slug)
    
    if missing:
        print(f"  ⚠️  Landing pages missing from sitemap: {', '.join(missing)}")
    else:
        print(f"  ✅ All landing pages included in sitemap")
    
    # Check for feed
    if '/feed/' in content or 'recipes.json' in content:
        print("  ⚠️  Feed URL in sitemap (should be excluded)")
    else:
        print("  ✅ Feed correctly excluded from sitemap")
    
    return len(missing) == 0


def validate_robots():
    """Validate robots.txt."""
    print("\n" + "=" * 60)
    print("VALIDATING ROBOTS.TXT")
    print("=" * 60)
    
    robots_path = DIST_PATH / 'robots.txt'
    
    if not robots_path.exists():
        print("  ❌ robots.txt not found")
        return False
    
    with open(robots_path, 'r') as f:
        content = f.read()
    
    checks = {
        'User-agent': 'User-agent:' in content,
        'Allow': 'Allow:' in content,
        'Sitemap reference': 'Sitemap:' in content and 'sitemap.xml' in content,
    }
    
    for name, passed in checks.items():
        status = "✅" if passed else "❌"
        print(f"  {status} {name}")
    
    return all(checks.values())


def validate_analytics():
    """Validate analytics files."""
    print("\n" + "=" * 60)
    print("VALIDATING ANALYTICS")
    print("=" * 60)
    
    js_path = DIST_PATH / 'js' / 'ga4-events.js'
    
    if not js_path.exists():
        print("  ❌ ga4-events.js not found")
        return False
    
    with open(js_path, 'r') as f:
        content = f.read()
    
    # Check for key event tracking
    events = ['outbound_click', 'pdf_download', 'scroll_depth', 'page_engagement']
    
    for event in events:
        if event in content:
            print(f"  ✅ {event} tracking present")
        else:
            print(f"  ❌ {event} tracking missing")
    
    return True


def main():
    print("=" * 60)
    print("DOTORO INTEGRATION VALIDATION")
    print("=" * 60)
    print(f"Dist path: {DIST_PATH}")
    
    results = {
        'Feed': validate_feed(),
        'Landing Pages': validate_landing_pages(),
        'Sitemap': validate_sitemap(),
        'Robots.txt': validate_robots(),
        'Analytics': validate_analytics(),
    }
    
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status}: {name}")
        if not passed:
            all_passed = False
    
    print()
    
    if all_passed:
        print("🎉 All validations passed! Ready for Dotoro integration.")
        return 0
    else:
        print("⚠️  Some validations failed. Please review and fix issues.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
