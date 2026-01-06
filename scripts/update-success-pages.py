#!/usr/bin/env python3
"""
Update all success pages to require access token verification.
Adds loading state, success state, and denied state with verification script.
"""

import os
import glob
import re

def get_protected_success_script():
    """Return the JavaScript for protected success page"""
    return '''<!-- Protected Success Page Script -->
<script>
/**
 * Protected Success Page - Verifies access token before showing download content
 */
(function() {
  'use strict';

  const VERIFY_ENDPOINT = '/api/verify-access';

  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      accessToken: params.get('access'),
      email: params.get('email')
    };
  }

  function showState(stateId) {
    ['loading-state', 'success-state', 'denied-state'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = id === stateId ? 'block' : 'none';
    });
  }

  async function verifyAccess(token) {
    try {
      const response = await fetch(`${VERIFY_ENDPOINT}?token=${encodeURIComponent(token)}`);
      return await response.json();
    } catch (error) {
      console.error('[protected-success] Verification error:', error);
      return { valid: false, message: 'Network error' };
    }
  }

  async function init() {
    const { accessToken, email } = getUrlParams();

    // If no access token, show denied state
    if (!accessToken) {
      console.log('[protected-success] No access token provided');
      showState('denied-state');
      return;
    }

    // Show loading state while verifying
    showState('loading-state');

    // Verify the access token
    const result = await verifyAccess(accessToken);

    if (result.valid) {
      console.log('[protected-success] Access verified for:', result.email);
      
      // Update email display
      const emailEl = document.getElementById('user-email');
      if (emailEl) emailEl.textContent = result.email;
      
      // Update download button
      const btn = document.getElementById('download-btn');
      if (btn && result.pdfUrl) {
        btn.href = result.pdfUrl;
      }
      
      showState('success-state');
      
      // Track event
      if (typeof gtag === 'function') {
        gtag('event', 'download_page_accessed', {
          email: result.email,
          pack: result.packSlug
        });
      }
    } else {
      console.log('[protected-success] Access denied:', result.message);
      showState('denied-state');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>'''

def get_main_content_replacement(pack_slug, pack_name, pdf_url):
    """Generate the new main content with three states"""
    return f'''<main class="flex-grow py-20">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <!-- Loading State -->
        <div id="loading-state" style="display: block;">
            <div class="animate-pulse">
                <span class="text-6xl mb-6 block">⏳</span>
                <h1 class="anton-text text-4xl uppercase mb-4 tracking-wider">VERIFYING ACCESS...</h1>
                <p class="text-xl text-slate-600">Please wait while we verify your subscription.</p>
            </div>
        </div>

        <!-- Success State (shown after verification) -->
        <div id="success-state" style="display: none;">
            <span class="text-6xl mb-6 block">✅</span>
            <h1 class="anton-text text-4xl uppercase mb-4 tracking-wider">YOU'RE ALL SET!</h1>
            <p class="text-xl text-slate-600 mb-2">Your {pack_name} is ready to download.</p>
            <p class="text-sm text-slate-500 mb-8">Confirmed for: <span id="user-email" class="font-semibold text-slate-700"></span></p>
            
            <a id="download-btn" href="{pdf_url}" download
                class="inline-flex items-center gap-3 bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider mb-8">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                DOWNLOAD PDF
            </a>
            
            <p class="text-slate-500 mb-12">We've also sent the download link to your email.</p>
            
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

        <!-- Access Denied State -->
        <div id="denied-state" style="display: none;">
            <span class="text-6xl mb-6 block">🔒</span>
            <h1 class="anton-text text-4xl uppercase mb-4 tracking-wider">ACCESS REQUIRED</h1>
            <p id="denied-message" class="text-xl text-slate-600 mb-8">
                Please confirm your email first to access the download.
            </p>
            
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-left">
                <h3 class="font-bold text-amber-800 mb-2">How to get access:</h3>
                <ol class="text-amber-700 space-y-2 list-decimal list-inside">
                    <li>Request the recipe pack from the <a href="/pack-{pack_slug}.html" class="underline hover:text-amber-900">download page</a></li>
                    <li>Check your email for a confirmation message</li>
                    <li>Click the confirmation link in the email</li>
                    <li>You'll be redirected here with full access!</li>
                </ol>
            </div>
            
            <a href="/pack-{pack_slug}.html" 
                class="inline-flex items-center gap-3 bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                REQUEST DOWNLOAD LINK
            </a>
            
            <p class="text-slate-500 mt-6 text-sm">
                Already confirmed? Check your email for the download link.
            </p>
        </div>
        
    </div>
</main>'''

def update_success_page(filepath):
    """Update a single success page with access verification"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already updated
        if 'loading-state' in content and 'denied-state' in content:
            print(f"  [SKIP] Already updated: {os.path.basename(filepath)}")
            return 'skip'
        
        # Extract pack slug from filename
        basename = os.path.basename(filepath)
        pack_slug = basename.replace('success-', '').replace('.html', '')
        
        # Format pack name
        pack_name = pack_slug.replace('-', ' ').title()
        if 'Pack' not in pack_name:
            pack_name += ' Pack'
        
        # Try to find PDF URL in the content
        pdf_match = re.search(r'href="([^"]*\.pdf)"', content)
        if pdf_match:
            pdf_url = pdf_match.group(1)
        else:
            # Construct default PDF URL from site
            site_dir = os.path.dirname(os.path.dirname(filepath))
            site_name = os.path.basename(site_dir)
            site_slug = site_name.replace('.', '-')
            pdf_url = f"/guides/{site_slug}-{pack_slug}.pdf"
        
        # Find and replace the main content
        main_pattern = r'<main[^>]*>[\s\S]*?</main>'
        new_main = get_main_content_replacement(pack_slug, pack_name, pdf_url)
        
        new_content = re.sub(main_pattern, new_main, content)
        
        if new_content == content:
            print(f"  [WARN] Could not find main content: {os.path.basename(filepath)}")
            return 'fail'
        
        # Add the verification script before </body>
        script = get_protected_success_script()
        new_content = new_content.replace('</body>', f'{script}\n\n</body>')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  [OK] Updated: {os.path.basename(filepath)}")
        return 'ok'
            
    except Exception as e:
        print(f"  [ERROR] {os.path.basename(filepath)}: {e}")
        return 'error'

def main():
    apps_dir = '/home/ubuntu/protein-empire/apps'
    
    # Get all sites (excluding proteincookies.co which is already done)
    sites = [
        'protein-bread.com', 'proteinbars.co', 'proteinbites.co', 
        'proteinbrownies.co', 'proteincheesecake.co', 'proteindonuts.co',
        'proteinoatmeal.co', 'proteinpancakes.co', 'proteinpizzas.co', 'proteinpudding.co'
    ]
    
    stats = {'ok': 0, 'skip': 0, 'fail': 0, 'error': 0}
    
    for site in sites:
        print(f"\n=== {site} ===")
        success_pages = glob.glob(f'{apps_dir}/{site}/dist/success-*.html')
        
        for page in sorted(success_pages):
            result = update_success_page(page)
            stats[result] += 1
    
    print("\n" + "=" * 60)
    print(f"Summary: {stats['ok']} updated, {stats['skip']} skipped, {stats['fail']} failed, {stats['error']} errors")

if __name__ == '__main__':
    main()
