#!/usr/bin/env python3
"""
Update pack pages to use JavaScript form submission with double opt-in support.
Replaces the simple HTML form with a JavaScript-powered form that calls /api/subscribe.
"""

import os
import re
import glob

def get_pack_slug(filename):
    """Extract pack slug from filename like pack-starter.html -> starter"""
    match = re.search(r'pack-(.+)\.html$', filename)
    return match.group(1) if match else 'starter'

def update_pack_page(filepath, site_domain):
    """Update a single pack page with JavaScript form handler"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has the JavaScript form handler
        if 'data.doubleOptIn' in content:
            return 'skip-already-done'
        
        pack_slug = get_pack_slug(os.path.basename(filepath))
        
        # Find and replace the simple HTML form with JavaScript-powered form
        old_form_pattern = r'<form action="/success-[^"]+\.html" method="GET" class="space-y-4">\s*<input type="email" name="email" placeholder="Enter your email" required\s*class="[^"]+">[\s\S]*?<button type="submit"[^>]*>\s*DOWNLOAD FREE PDF\s*</button>\s*</form>'
        
        new_form = f'''<form id="subscribe-form" class="space-y-4">
                <input type="email" id="email-input" placeholder="Enter your email" required
                    class="w-full px-6 py-4 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition text-lg">
                <button type="submit" id="submit-btn" class="w-full bg-brand-500 text-white px-8 py-4 rounded-xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider">
                    DOWNLOAD FREE PDF
                </button>
                <p id="form-error" class="text-red-500 text-sm hidden"></p>
                <p id="form-success" class="text-green-600 font-semibold text-center hidden"></p>
            </form>
            
            <script>
            document.getElementById('subscribe-form').addEventListener('submit', async function(e) {{
                e.preventDefault();
                
                const email = document.getElementById('email-input').value;
                const submitBtn = document.getElementById('submit-btn');
                const errorEl = document.getElementById('form-error');
                const successEl = document.getElementById('form-success');
                
                // Reset states
                submitBtn.disabled = true;
                submitBtn.textContent = 'PROCESSING...';
                errorEl.classList.add('hidden');
                successEl.classList.add('hidden');
                
                try {{
                    const response = await fetch('/api/subscribe', {{
                        method: 'POST',
                        headers: {{
                            'Content-Type': 'application/json',
                        }},
                        body: JSON.stringify({{
                            email: email,
                            packSlug: '{pack_slug}',
                            pdfUrl: window.location.origin + '/guides/{site_domain.replace(".", "-")}-{pack_slug}.pdf'
                        }})
                    }});
                    
                    const data = await response.json();
                    
                    if (data.success) {{
                        if (data.doubleOptIn) {{
                            // Double opt-in mode: Show confirmation message
                            successEl.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>Check your email to confirm and get your PDF!</span>';
                            successEl.classList.remove('hidden');
                            submitBtn.textContent = 'CHECK YOUR EMAIL';
                            submitBtn.classList.remove('bg-brand-500', 'hover:bg-brand-600');
                            submitBtn.classList.add('bg-green-500', 'cursor-default');
                        }} else {{
                            // Single opt-in mode: Redirect to success page
                            window.location.href = '/success-{pack_slug}.html?email=' + encodeURIComponent(email);
                        }}
                    }} else {{
                        throw new Error(data.message || 'Subscription failed');
                    }}
                }} catch (error) {{
                    console.error('Subscription error:', error);
                    errorEl.textContent = error.message || 'Something went wrong. Please try again.';
                    errorEl.classList.remove('hidden');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'DOWNLOAD FREE PDF';
                }}
            }});
            </script>'''
        
        new_content = re.sub(old_form_pattern, new_form, content, flags=re.IGNORECASE)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return 'ok'
        else:
            return 'skip-no-match'
            
    except Exception as e:
        print(f"  [ERROR] {os.path.basename(filepath)}: {e}")
        return 'error'

def main():
    apps_dir = '/home/ubuntu/protein-empire/apps'
    
    # Site folder to domain mapping
    site_domains = {
        'protein-bread.com': 'protein-bread.com',
        'proteinbars.co': 'proteinbars.co',
        'proteinbites.co': 'proteinbites.co',
        'proteinbrownies.co': 'proteinbrownies.co',
        'proteincheesecake.co': 'proteincheesecake.co',
        'proteincookies.co': 'proteincookies.co',
        'proteindonuts.co': 'proteindonuts.co',
        'proteinoatmeal.co': 'proteinoatmeal.co',
        'proteinpancakes.co': 'proteinpancakes.co',
        'proteinpizzas.co': 'proteinpizzas.co',
        'proteinpudding.co': 'proteinpudding.co'
    }
    
    stats = {'ok': 0, 'skip-already-done': 0, 'skip-no-match': 0, 'error': 0}
    
    for site_folder, site_domain in site_domains.items():
        print(f"\n=== {site_folder} ===")
        pack_pages = glob.glob(f'{apps_dir}/{site_folder}/dist/pack-*.html')
        
        for page in sorted(pack_pages):
            result = update_pack_page(page, site_domain)
            stats[result] += 1
            
            status_map = {
                'ok': '[OK] Updated',
                'skip-already-done': '[SKIP] Already has double opt-in',
                'skip-no-match': '[SKIP] No matching form pattern',
                'error': '[ERROR]'
            }
            print(f"  {status_map.get(result, result)}: {os.path.basename(page)}")
    
    print("\n" + "=" * 60)
    print(f"Summary: {stats['ok']} updated, {stats['skip-already-done']} already done, {stats['skip-no-match']} no match, {stats['error']} errors")

if __name__ == '__main__':
    main()
