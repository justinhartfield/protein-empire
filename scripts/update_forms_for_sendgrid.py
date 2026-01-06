#!/usr/bin/env python3
"""
Update all pack pages and success pages to integrate with SendGrid via the /api/subscribe endpoint.

This script:
1. Updates pack pages to submit forms via JavaScript to /api/subscribe
2. Updates success pages to call /api/subscribe on page load with the email from URL params
"""

import os
import re
import glob

# Base path for apps
APPS_PATH = os.path.expanduser("~/protein-empire/apps")

# Site slug mapping (domain to PDF filename prefix)
SITE_SLUGS = {
    'proteincookies.co': 'proteincookies-co',
    'proteinpancakes.co': 'proteinpancakes-co',
    'proteinbrownies.co': 'proteinbrownies-co',
    'proteinbars.co': 'proteinbars-co',
    'proteinbites.co': 'proteinbites-co',
    'proteindonuts.co': 'proteindonuts-co',
    'proteinoatmeal.co': 'proteinoatmeal-co',
    'proteincheesecake.co': 'proteincheesecake-co',
    'proteinpizzas.co': 'proteinpizzas-co',
    'proteinpudding.co': 'proteinpudding-co',
    'protein-bread.com': 'protein-bread-com',
    'highprotein.recipes': 'highprotein-recipes',
}

def get_site_slug_from_domain(domain):
    """Get the site slug from domain."""
    return SITE_SLUGS.get(domain, domain.replace('.', '-'))

def get_new_form_html(pack_slug, site_slug):
    """Generate the new form HTML with JavaScript submission."""
    return f'''    <!-- Download Form -->
    <section class="py-16 bg-brand-50">
        <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="anton-text text-3xl mb-4 uppercase tracking-wider">GET YOUR FREE COPY</h2>
            <p class="text-slate-600 mb-8">Enter your email to download the PDF instantly.</p>
            
            <form id="subscribe-form" class="space-y-4">
                <input type="email" id="email-input" name="email" placeholder="Enter your email" required
                    class="w-full px-6 py-4 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition text-lg">
                <button type="submit" id="submit-btn" class="w-full bg-brand-500 text-white px-8 py-4 rounded-xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider">
                    DOWNLOAD FREE PDF
                </button>
                <p id="form-error" class="text-red-500 text-sm hidden"></p>
            </form>
            
            <p class="text-xs text-slate-500 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
    </section>

    <script>
    document.getElementById('subscribe-form').addEventListener('submit', async function(e) {{
        e.preventDefault();
        
        const email = document.getElementById('email-input').value;
        const submitBtn = document.getElementById('submit-btn');
        const errorEl = document.getElementById('form-error');
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'PROCESSING...';
        errorEl.classList.add('hidden');
        
        try {{
            const response = await fetch('/api/subscribe', {{
                method: 'POST',
                headers: {{
                    'Content-Type': 'application/json',
                }},
                body: JSON.stringify({{
                    email: email,
                    packSlug: '{pack_slug}',
                    pdfUrl: window.location.origin + '/guides/{site_slug}-{pack_slug}.pdf'
                }})
            }});
            
            const data = await response.json();
            
            if (data.success) {{
                // Redirect to success page
                window.location.href = '/success-{pack_slug}.html?email=' + encodeURIComponent(email);
            }} else {{
                throw new Error(data.message || 'Subscription failed');
            }}
        }} catch (error) {{
            console.error('Subscription error:', error);
            errorEl.textContent = 'Something went wrong. Please try again.';
            errorEl.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'DOWNLOAD FREE PDF';
        }}
    }});
    </script>'''


def get_success_page_script(site_slug):
    """Generate the script to add to success pages for tracking."""
    return f'''
    <script>
    // Subscribe user on success page load (backup in case form submission failed)
    (function() {{
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        
        if (email) {{
            // Get pack slug from URL
            const pathMatch = window.location.pathname.match(/success-(.+)\\.html/);
            const packSlug = pathMatch ? pathMatch[1] : 'starter';
            
            // Call subscribe API (fire and forget - user already has access to PDF)
            fetch('/api/subscribe', {{
                method: 'POST',
                headers: {{
                    'Content-Type': 'application/json',
                }},
                body: JSON.stringify({{
                    email: email,
                    packSlug: packSlug,
                    pdfUrl: window.location.origin + '/guides/{site_slug}-' + packSlug + '.pdf'
                }})
            }}).catch(err => console.log('Subscribe backup call:', err));
        }}
    }})();
    </script>
'''


def update_pack_page(filepath):
    """Update a pack page with the new form."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract pack slug from filename
    filename = os.path.basename(filepath)
    pack_slug_match = re.search(r'pack-(.+)\.html', filename)
    if not pack_slug_match:
        print(f"  Skipping {filename} - couldn't extract pack slug")
        return False
    
    pack_slug = pack_slug_match.group(1)
    
    # Extract site domain from canonical URL
    canonical_match = re.search(r'href="https://([^/]+)/', content)
    if not canonical_match:
        print(f"  Skipping {filename} - couldn't find canonical URL")
        return False
    
    site_domain = canonical_match.group(1)
    site_slug = get_site_slug_from_domain(site_domain)
    
    # Find and replace the form section (including any existing script)
    # Pattern matches from "<!-- Download Form -->" to the closing </section> and script
    old_form_pattern = r'([ \t]*)<!-- Download Form -->.*?</section>(\s*<script>.*?</script>)?'
    
    if not re.search(old_form_pattern, content, re.DOTALL):
        print(f"  Skipping {filename} - no form section found")
        return False
    
    new_form = get_new_form_html(pack_slug, site_slug)
    new_content = re.sub(old_form_pattern, new_form, content, flags=re.DOTALL)
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    return True


def update_success_page(filepath):
    """Update a success page with the subscribe script."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if script already added
    if 'Subscribe user on success page load' in content:
        print(f"  Skipping {os.path.basename(filepath)} - already updated")
        return False
    
    # Extract site domain from canonical URL
    canonical_match = re.search(r'href="https://([^/]+)/', content)
    if not canonical_match:
        print(f"  Skipping {os.path.basename(filepath)} - couldn't find canonical URL")
        return False
    
    site_domain = canonical_match.group(1)
    site_slug = get_site_slug_from_domain(site_domain)
    
    # Add the script before </body>
    script = get_success_page_script(site_slug)
    content = content.replace('</body>', f'{script}\n</body>')
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    return True


def main():
    print("=" * 60)
    print("Updating pack pages and success pages for SendGrid integration")
    print("=" * 60)
    
    # Find all pack pages
    pack_pages = glob.glob(os.path.join(APPS_PATH, "*/dist/pack-*.html"))
    print(f"\nFound {len(pack_pages)} pack pages")
    
    updated_packs = 0
    for filepath in sorted(pack_pages):
        site = filepath.split('/apps/')[1].split('/')[0]
        filename = os.path.basename(filepath)
        print(f"Processing {site}/{filename}...")
        if update_pack_page(filepath):
            updated_packs += 1
            print(f"  ✓ Updated")
    
    print(f"\nUpdated {updated_packs} pack pages")
    
    # Find all success pages
    success_pages = glob.glob(os.path.join(APPS_PATH, "*/dist/success-*.html"))
    print(f"\nFound {len(success_pages)} success pages")
    
    updated_success = 0
    for filepath in sorted(success_pages):
        site = filepath.split('/apps/')[1].split('/')[0]
        filename = os.path.basename(filepath)
        print(f"Processing {site}/{filename}...")
        if update_success_page(filepath):
            updated_success += 1
            print(f"  ✓ Updated")
    
    print(f"\nUpdated {updated_success} success pages")
    print("\n" + "=" * 60)
    print("Done!")
    print("=" * 60)


if __name__ == "__main__":
    main()
