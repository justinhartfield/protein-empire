#!/usr/bin/env python3
"""Add SendGrid dependencies to all site package.json files."""

import json
import os
from pathlib import Path

SITES = [
    "highprotein.recipes",
    "protein-bread.com",
    "proteinbars.co",
    "proteinbites.co",
    "proteinbrownies.co",
    "proteincheesecake.co",
    "proteincookies.co",
    "proteindonuts.co",
    "proteinoatmeal.co",
    "proteinpancakes.co",
    "proteinpizzas.co",
    "proteinpudding.co"
]

SENDGRID_DEPS = {
    "@sendgrid/client": "^8.1.1",
    "@sendgrid/mail": "^8.1.1"
}

def main():
    apps_dir = Path(__file__).parent.parent / "apps"
    
    for site in SITES:
        pkg_path = apps_dir / site / "package.json"
        
        if not pkg_path.exists():
            print(f"Creating package.json for {site}")
            pkg = {
                "name": f"@protein-empire/{site.replace('.', '-')}",
                "version": "1.0.0",
                "private": True,
                "description": f"Protein Empire site: {site}",
                "dependencies": SENDGRID_DEPS
            }
        else:
            with open(pkg_path) as f:
                pkg = json.load(f)
            
            if "dependencies" not in pkg:
                pkg["dependencies"] = {}
            
            pkg["dependencies"].update(SENDGRID_DEPS)
            print(f"Updated {site}")
        
        with open(pkg_path, 'w') as f:
            json.dump(pkg, f, indent=2)
            f.write('\n')

if __name__ == "__main__":
    main()
