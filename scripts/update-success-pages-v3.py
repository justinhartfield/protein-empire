#!/usr/bin/env python3
"""
Update success pages to verify access tokens before showing download.
Only users who confirmed their email can access the download.
This version handles the <main> tag structure used in the newer templates.
"""

import os
import re
import glob

def get_pack_slug(filename):
    """Extract pack slug from filename like success-starter.html -> starter"""
    match = re.search(r'success-(.+)\.html$', filename)
    return match.group(1) if match else 'starter'

def update_success_page(filepath, site_domain):
    """Update a single success page with access verification"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has the verification script
        if 'verify-access' in content or 'loading-state' in content:
            return 'skip-already-done'
        
        pack_slug = get_pack_slug(os.path.basename(filepath))
        
        # Look for the main content - either in <main> or <section>
        # Pattern to match the main content area with the download link
        main_pattern = r'<main[^>]*class="[^"]*flex-grow[^"]*"[^>]*>[\s\S]*?</main>'
        
        match = re.search(main_pattern, content, re.IGNORECASE)
        if not match:
            return 'skip-no-main'
        
        original_main = match.group(0)
        
        # Verify it has a download link
        if '.pdf' not in original_main:
            return 'skip-no-pdf-link'
        
        # Create the new protected main content
        protected_main = f'''<main class="flex-grow py-20">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <!-- Loading State -->
        <div id="loading-state" style="display: block;">
            <div class="animate-pulse">
                <div class="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-6"></div>
                <div class="h-10 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
                <div class="h-6 bg-slate-200 rounded w-1/2 mx-auto mb-8"></div>
                <div class="h-14 bg-slate-200 rounded-2xl w-64 mx-auto"></div>
            </div>
            <p class="text-slate-500 mt-6">Verifying access...</p>
        </div>
        
        <!-- Success State (hidden by default) -->
        <div id="success-state" style="display: none;">
            <img src="/images/icons/sparkle.png" alt="" class="mx-auto object-contain mb-4" style="width: 96px; height: 96px;" onerror="this.style.display='none'">
            <h1 class="anton-text text-4xl uppercase mb-4 tracking-wider">YOU'RE ALL SET!</h1>
            <p class="text-xl text-slate-600 mb-8">Your pack is ready to download.</p>
            
            <a id="download-link" href="/guides/{site_domain.replace(".", "-")}-{pack_slug}.pdf" download
                class="inline-flex items-center gap-3 bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider mb-8">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                DOWNLOAD PDF
            </a>
            
            <p class="text-slate-500 mb-12">Having trouble? Check your downloads folder or <a href="/pack-{pack_slug}.html" class="text-brand-600 hover:underline">try again</a>.</p>
            
            <div class="border-t border-slate-200 pt-12">
                <h2 class="anton-text text-2xl uppercase mb-6 tracking-wider">EXPLORE MORE RECIPES</h2>
                <div class="flex flex-wrap justify-center gap-4">
                    <a href="/" class="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold">
                        All Recipes
                    </a>
                    <a href="/#packs" class="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold">
                        More Recipe Packs
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Denied State (hidden by default) -->
        <div id="denied-state" style="display: none;">
            <div class="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
            </div>
            <h1 class="anton-text text-3xl uppercase mb-4 tracking-wider">ACCESS REQUIRED</h1>
            <p class="text-xl text-slate-600 mb-6">Please confirm your email address to access this download.</p>
            <p class="text-slate-500 mb-8">Check your inbox for a confirmation email, or request a new one below.</p>
            
            <a href="/pack-{pack_slug}.html" 
                class="inline-flex items-center gap-3 bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider">
                GET ACCESS
            </a>
        </div>
    </div>
</main>

<script>
(async function() {{
    const VERIFY_ENDPOINT = '/api/verify-access';
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access') || urlParams.get('token');
    
    // Helper to show/hide states
    function showState(stateId) {{
        ['loading-state', 'success-state', 'denied-state'].forEach(id => {{
            const el = document.getElementById(id);
            if (el) el.style.display = id === stateId ? 'block' : 'none';
        }});
    }}
    
    // If no token, show denied state
    if (!token) {{
        showState('denied-state');
        return;
    }}
    
    try {{
        const response = await fetch(`${{VERIFY_ENDPOINT}}?token=${{encodeURIComponent(token)}}`);
        const data = await response.json();
        
        if (data.valid) {{
            showState('success-state');
        }} else {{
            showState('denied-state');
        }}
    }} catch (error) {{
        console.error('Verification error:', error);
        showState('denied-state');
    }}
}})();
</script>'''
        
        new_content = content.replace(original_main, protected_main)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return 'ok'
        else:
            return 'skip-no-change'
            
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
    
    stats = {'ok': 0, 'skip-already-done': 0, 'skip-no-main': 0, 'skip-no-pdf-link': 0, 'skip-no-change': 0, 'error': 0}
    
    for site_folder, site_domain in site_domains.items():
        print(f"\n=== {site_folder} ===")
        success_pages = glob.glob(f'{apps_dir}/{site_folder}/dist/success-*.html')
        
        for page in sorted(success_pages):
            result = update_success_page(page, site_domain)
            stats[result] += 1
            
            status_map = {
                'ok': '[OK] Updated',
                'skip-already-done': '[SKIP] Already protected',
                'skip-no-main': '[SKIP] No main tag found',
                'skip-no-pdf-link': '[SKIP] No PDF link found',
                'skip-no-change': '[SKIP] No change needed',
                'error': '[ERROR]'
            }
            print(f"  {status_map.get(result, result)}: {os.path.basename(page)}")
    
    print("\n" + "=" * 60)
    total_skipped = stats['skip-already-done'] + stats['skip-no-main'] + stats['skip-no-pdf-link'] + stats['skip-no-change']
    print(f"Summary: {stats['ok']} updated, {total_skipped} skipped, {stats['error']} errors")

if __name__ == '__main__':
    main()
