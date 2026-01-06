#!/usr/bin/env python3
"""
Update all pack pages to handle double opt-in response.
Uses simple string replacement to update the form handler.
"""

import os
import glob

def update_pack_page(filepath):
    """Update a single pack page with the new form handler"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already updated
        if 'data.doubleOptIn' in content:
            print(f"  [SKIP] Already updated: {os.path.basename(filepath)}")
            return 'skip'
        
        # Check if it has the old pattern
        if "if (data.success) {" not in content or "window.location.href = '/success-" not in content:
            print(f"  [SKIP] No matching pattern: {os.path.basename(filepath)}")
            return 'skip'
        
        # Extract pack slug from the redirect URL
        import re
        match = re.search(r"window\.location\.href = '/success-([^']+)\.html", content)
        if not match:
            print(f"  [WARN] Could not find pack slug: {os.path.basename(filepath)}")
            return 'fail'
        
        pack_slug = match.group(1)
        
        # Find the old success handler block and replace it
        old_block = """if (data.success) {
                // Redirect to success page
                window.location.href = '/success-""" + pack_slug + """.html?email=' + encodeURIComponent(email);
            }"""
        
        new_block = """if (data.success) {
                if (data.doubleOptIn) {
                    // Double opt-in mode: Show confirmation message
                    const successEl = document.getElementById('form-success') || document.createElement('p');
                    if (!successEl.id) {
                        successEl.id = 'form-success';
                        successEl.className = 'text-green-600 font-semibold text-center mt-4';
                        form.parentNode.appendChild(successEl);
                    }
                    successEl.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>Check your email to confirm and get your PDF!</span>';
                    successEl.classList.remove('hidden');
                    submitBtn.textContent = 'CHECK YOUR EMAIL';
                    submitBtn.classList.remove('bg-brand-500', 'hover:bg-brand-600');
                    submitBtn.classList.add('bg-green-500', 'cursor-default');
                } else {
                    // Single opt-in mode: Redirect to success page
                    window.location.href = '/success-""" + pack_slug + """.html?email=' + encodeURIComponent(email);
                }
            }"""
        
        if old_block in content:
            new_content = content.replace(old_block, new_block)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  [OK] Updated: {os.path.basename(filepath)}")
            return 'ok'
        else:
            print(f"  [WARN] Block not found exactly: {os.path.basename(filepath)}")
            return 'fail'
            
    except Exception as e:
        print(f"  [ERROR] {os.path.basename(filepath)}: {e}")
        return 'error'

def main():
    apps_dir = '/home/ubuntu/protein-empire/apps'
    
    # Get all pack pages (excluding proteincookies.co which is already done)
    sites = [
        'protein-bread.com', 'proteinbars.co', 'proteinbites.co', 
        'proteinbrownies.co', 'proteincheesecake.co', 'proteindonuts.co',
        'proteinoatmeal.co', 'proteinpancakes.co', 'proteinpizzas.co', 'proteinpudding.co'
    ]
    
    stats = {'ok': 0, 'skip': 0, 'fail': 0, 'error': 0}
    
    for site in sites:
        print(f"\n=== {site} ===")
        pack_pages = glob.glob(f'{apps_dir}/{site}/dist/pack-*.html')
        
        for page in sorted(pack_pages):
            result = update_pack_page(page)
            stats[result] += 1
    
    print("\n" + "=" * 60)
    print(f"Summary: {stats['ok']} updated, {stats['skip']} skipped, {stats['fail']} failed, {stats['error']} errors")

if __name__ == '__main__':
    main()
