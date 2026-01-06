#!/usr/bin/env python3
"""
Update all pack pages to handle double opt-in response.
Instead of redirecting to success page, show "check your email" message.
"""

import os
import re
import glob

# The old form handler pattern that redirects immediately
OLD_FORM_HANDLER = r"""form\.addEventListener\('submit', async \(e\) => \{
\s+e\.preventDefault\(\);
\s+const email = emailInput\.value\.trim\(\);
\s+if \(!email\) return;
\s+
\s+submitBtn\.disabled = true;
\s+submitBtn\.textContent = 'PROCESSING\.\.\.';
\s+errorEl\.classList\.add\('hidden'\);
\s+
\s+try \{
\s+const response = await fetch\('/api/subscribe', \{
\s+method: 'POST',
\s+headers: \{ 'Content-Type': 'application/json' \},
\s+body: JSON\.stringify\(\{
\s+email,
\s+packSlug: '[^']+',
\s+pdfUrl: '[^']+'
\s+\}\)
\s+\}\);
\s+
\s+const data = await response\.json\(\);
\s+if \(data\.success\) \{
\s+window\.location\.href = '/success-[^']+\.html\?email=' \+ encodeURIComponent\(email\);
\s+\} else \{
\s+throw new Error\(data\.message \|\| 'Subscription failed'\);
\s+\}
\s+\} catch \(error\) \{
\s+console\.error\('Subscription error:', error\);
\s+errorEl\.textContent = error\.message \|\| 'Something went wrong\. Please try again\.';
\s+errorEl\.classList\.remove\('hidden'\);
\s+submitBtn\.disabled = false;
\s+submitBtn\.textContent = 'DOWNLOAD FREE PDF';
\s+\}
\s+\}\);"""

def get_new_form_handler(pack_slug, pdf_url):
    """Generate the new form handler with double opt-in support"""
    return f"""form.addEventListener('submit', async (e) => {{
        e.preventDefault();
        const email = emailInput.value.trim();
        if (!email) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'PROCESSING...';
        errorEl.classList.add('hidden');

        try {{
            const response = await fetch('/api/subscribe', {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }},
                body: JSON.stringify({{
                    email,
                    packSlug: '{pack_slug}',
                    pdfUrl: '{pdf_url}'
                }})
            }});

            const data = await response.json();
            if (data.success) {{
                if (data.doubleOptIn) {{
                    // Double opt-in mode: Show confirmation message
                    const successEl = document.getElementById('form-success') || document.createElement('p');
                    if (!successEl.id) {{
                        successEl.id = 'form-success';
                        successEl.className = 'text-green-600 font-semibold text-center mt-4';
                        form.parentNode.appendChild(successEl);
                    }}
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
    }});"""

def extract_pack_info(content, filename):
    """Extract pack slug and PDF URL from the file"""
    # Extract pack slug from filename
    basename = os.path.basename(filename)
    pack_slug = basename.replace('pack-', '').replace('.html', '')
    
    # Try to find PDF URL in the content
    pdf_match = re.search(r"pdfUrl:\s*['\"]([^'\"]+)['\"]", content)
    if pdf_match:
        pdf_url = pdf_match.group(1)
    else:
        # Construct default PDF URL
        site_dir = os.path.dirname(os.path.dirname(filename))
        site_name = os.path.basename(site_dir)
        site_slug = site_name.replace('.', '-').replace('protein-', '').replace('-co', '-co').replace('-com', '-com')
        pdf_url = f"/guides/{site_slug}-{pack_slug}.pdf"
    
    return pack_slug, pdf_url

def update_pack_page(filepath):
    """Update a single pack page with the new form handler"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already updated
        if 'data.doubleOptIn' in content:
            print(f"  [SKIP] Already updated: {filepath}")
            return False
        
        # Extract pack info
        pack_slug, pdf_url = extract_pack_info(content, filepath)
        
        # Find and replace the form handler
        # Look for the form submit handler pattern
        pattern = r"(form\.addEventListener\('submit',\s*async\s*\(e\)\s*=>\s*\{[\s\S]*?window\.location\.href\s*=\s*'/success-[^']+\.html\?email='\s*\+\s*encodeURIComponent\(email\);[\s\S]*?\}\s*catch\s*\(error\)\s*\{[\s\S]*?\}\s*\}\);)"
        
        new_handler = get_new_form_handler(pack_slug, pdf_url)
        
        # Try to replace
        new_content, count = re.subn(pattern, new_handler, content)
        
        if count == 0:
            # Try alternative pattern for different formatting
            pattern2 = r"form\.addEventListener\('submit',\s*async\s*\(e\)\s*=>\s*\{[^}]+window\.location\.href[^}]+\}[^}]+\}[^}]+\}\);"
            new_content, count = re.subn(pattern2, new_handler, content, flags=re.DOTALL)
        
        if count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  [OK] Updated: {filepath}")
            return True
        else:
            print(f"  [WARN] Could not find form handler pattern in: {filepath}")
            return False
            
    except Exception as e:
        print(f"  [ERROR] {filepath}: {e}")
        return False

def main():
    apps_dir = '/home/ubuntu/protein-empire/apps'
    
    # Get all pack pages
    pack_pages = glob.glob(f'{apps_dir}/*/dist/pack-*.html')
    
    print(f"Found {len(pack_pages)} pack pages to update")
    print("=" * 60)
    
    updated = 0
    skipped = 0
    failed = 0
    
    for page in sorted(pack_pages):
        result = update_pack_page(page)
        if result:
            updated += 1
        elif result is False:
            skipped += 1
        else:
            failed += 1
    
    print("=" * 60)
    print(f"Summary: {updated} updated, {skipped} skipped, {failed} failed")

if __name__ == '__main__':
    main()
