#!/usr/bin/env python3
"""
Clean up duplicate scripts from pack pages that were added by multiple runs of the update script.
"""

import os
import re
import glob

APPS_PATH = os.path.expanduser("~/protein-empire/apps")

def cleanup_pack_page(filepath):
    """Remove duplicate subscribe scripts from pack page."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Count occurrences of the subscribe form script
    script_count = content.count("document.getElementById('subscribe-form').addEventListener")
    
    if script_count <= 1:
        return False
    
    print(f"  Found {script_count} duplicate scripts")
    
    # Pattern to match the duplicate script blocks (keeping only the first one)
    # We want to remove any script block that starts with subscribe-form listener after the first one
    
    # Find all script blocks with subscribe-form
    pattern = r'(\s*<script>\s*document\.getElementById\(\'subscribe-form\'\)\.addEventListener.*?</script>)'
    matches = list(re.finditer(pattern, content, re.DOTALL))
    
    if len(matches) > 1:
        # Remove all but the first match
        for match in reversed(matches[1:]):
            content = content[:match.start()] + content[match.end():]
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    return True

def main():
    print("Cleaning up duplicate scripts from pack pages...")
    
    pack_pages = glob.glob(os.path.join(APPS_PATH, "*/dist/pack-*.html"))
    cleaned = 0
    
    for filepath in sorted(pack_pages):
        site = filepath.split('/apps/')[1].split('/')[0]
        filename = os.path.basename(filepath)
        print(f"Checking {site}/{filename}...")
        if cleanup_pack_page(filepath):
            cleaned += 1
            print(f"  ✓ Cleaned")
    
    print(f"\nCleaned {cleaned} files")

if __name__ == "__main__":
    main()
