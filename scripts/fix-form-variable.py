#!/usr/bin/env python3
"""
Fix the 'form is not defined' error in pack pages.
Replace 'form.parentNode.appendChild' with 'this.parentNode.appendChild'
since we're inside the form's event listener where 'this' refers to the form.
"""

import os
import glob

def fix_pack_page(filepath):
    """Fix a single pack page"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if it has the issue
        if 'form.parentNode.appendChild' not in content:
            return 'skip'
        
        # Replace form.parentNode with e.target.parentNode (e is the event)
        # Actually, better to use document.getElementById('subscribe-form').parentNode
        new_content = content.replace(
            'form.parentNode.appendChild(successEl)',
            "document.getElementById('subscribe-form').parentNode.appendChild(successEl)"
        )
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  [OK] Fixed: {os.path.basename(filepath)}")
            return 'ok'
        else:
            return 'skip'
            
    except Exception as e:
        print(f"  [ERROR] {os.path.basename(filepath)}: {e}")
        return 'error'

def main():
    apps_dir = '/home/ubuntu/protein-empire/apps'
    
    # Get all sites
    sites = [
        'protein-bread.com', 'proteinbars.co', 'proteinbites.co', 
        'proteinbrownies.co', 'proteincheesecake.co', 'proteincookies.co',
        'proteindonuts.co', 'proteinoatmeal.co', 'proteinpancakes.co', 
        'proteinpizzas.co', 'proteinpudding.co'
    ]
    
    stats = {'ok': 0, 'skip': 0, 'error': 0}
    
    for site in sites:
        print(f"\n=== {site} ===")
        pack_pages = glob.glob(f'{apps_dir}/{site}/dist/pack-*.html')
        
        for page in sorted(pack_pages):
            result = fix_pack_page(page)
            stats[result] += 1
    
    print("\n" + "=" * 60)
    print(f"Summary: {stats['ok']} fixed, {stats['skip']} skipped, {stats['error']} errors")

if __name__ == '__main__':
    main()
