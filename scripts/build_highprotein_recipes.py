#!/usr/bin/env python3
"""
Master Build Script for HighProtein.Recipes
Runs all generators in the correct sequence for Dotoro integration.

Usage:
    python scripts/build_highprotein_recipes.py

Steps:
1. Add intent_class to all recipes
2. Generate master feed (JSON + CSV)
3. Generate intent-based landing pages
4. Generate macro-based landing pages
5. Generate sitemap and robots.txt
6. Copy analytics assets
"""

import os
import sys
import subprocess
import shutil
from datetime import datetime

# Add packages to path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_PATH = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, os.path.join(BASE_PATH, 'packages', 'page-generator'))

def run_step(name, command):
    """Run a build step and report status."""
    print(f"\n{'='*60}")
    print(f"STEP: {name}")
    print(f"{'='*60}")
    
    start_time = datetime.now()
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=BASE_PATH,
            capture_output=True,
            text=True
        )
        
        # Print output
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr)
        
        duration = (datetime.now() - start_time).total_seconds()
        
        if result.returncode == 0:
            print(f"✅ {name} completed in {duration:.1f}s")
            return True
        else:
            print(f"❌ {name} failed with exit code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ {name} failed with error: {e}")
        return False


def copy_analytics_assets():
    """Copy analytics assets to dist folder."""
    print(f"\n{'='*60}")
    print("STEP: Copy Analytics Assets")
    print(f"{'='*60}")
    
    src = os.path.join(BASE_PATH, 'packages', 'analytics', 'ga4-events.js')
    dst_dir = os.path.join(BASE_PATH, 'apps', 'highprotein.recipes', 'dist', 'js')
    
    os.makedirs(dst_dir, exist_ok=True)
    
    if os.path.exists(src):
        shutil.copy(src, os.path.join(dst_dir, 'ga4-events.js'))
        print(f"✅ Copied ga4-events.js to {dst_dir}")
        return True
    else:
        print(f"⚠️  Analytics file not found: {src}")
        return True  # Non-fatal


def main():
    print("=" * 60)
    print("HIGHPROTEIN.RECIPES BUILD")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base path: {BASE_PATH}")
    
    steps = [
        ("Add Intent Classes", "python3 scripts/add_intent_class.py"),
        ("Generate Master Feed", "python3 packages/page-generator/create_master_feed.py"),
        ("Generate Intent Landing Pages", "python3 packages/page-generator/generate_landing_pages.py"),
        ("Generate Macro Landing Pages", "python3 packages/page-generator/generate_macro_pages.py"),
        ("Generate Sitemap", "python3 packages/page-generator/generate_sitemap.py"),
    ]
    
    results = []
    
    for name, command in steps:
        success = run_step(name, command)
        results.append((name, success))
        if not success:
            print(f"\n⚠️  Build step failed: {name}")
            # Continue with other steps
    
    # Copy analytics assets
    copy_analytics_assets()
    
    # Summary
    print("\n" + "=" * 60)
    print("BUILD SUMMARY")
    print("=" * 60)
    
    all_success = True
    for name, success in results:
        status = "✅" if success else "❌"
        print(f"  {status} {name}")
        if not success:
            all_success = False
    
    print()
    
    if all_success:
        print("🎉 Build completed successfully!")
        print()
        print("Generated assets:")
        print("  - Feed: apps/highprotein.recipes/dist/feed/recipes.json")
        print("  - Feed: apps/highprotein.recipes/dist/feed/recipes.csv")
        print("  - Landing pages: apps/highprotein.recipes/dist/*/index.html")
        print("  - Sitemap: apps/highprotein.recipes/dist/sitemap.xml")
        print("  - Robots: apps/highprotein.recipes/dist/robots.txt")
        print("  - Analytics: apps/highprotein.recipes/dist/js/ga4-events.js")
        print()
        print("Feed endpoint: https://highprotein.recipes/feed/recipes.json")
        return 0
    else:
        print("⚠️  Build completed with errors")
        return 1


if __name__ == '__main__':
    sys.exit(main())
