#!/usr/bin/env python3
"""
Add Netlify functions configuration to all site netlify.toml files.
The functions need to be configured at each site level for the /api/subscribe endpoint to work.
"""

import os
import glob

APPS_PATH = os.path.expanduser("~/protein-empire/apps")

# The functions config and redirect to add
FUNCTIONS_CONFIG = '''
# Netlify Functions
[functions]
  directory = "../../netlify/functions"

# Redirect /api/* to Netlify Functions
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
'''

def update_netlify_toml(filepath):
    """Add functions config to a netlify.toml file."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if already has functions config
    if '[functions]' in content or '/api/*' in content:
        print(f"  Already has functions config")
        return False
    
    # Add functions config at the end
    new_content = content.rstrip() + '\n' + FUNCTIONS_CONFIG
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    return True

def main():
    print("Adding functions configuration to all site netlify.toml files...")
    print()
    
    # Find all netlify.toml files in apps
    toml_files = glob.glob(os.path.join(APPS_PATH, "*/netlify.toml"))
    
    updated = 0
    for filepath in sorted(toml_files):
        site = filepath.split('/apps/')[1].split('/')[0]
        print(f"Processing {site}...")
        if update_netlify_toml(filepath):
            updated += 1
            print(f"  ✓ Updated")
    
    print()
    print(f"Updated {updated} files")

if __name__ == "__main__":
    main()
