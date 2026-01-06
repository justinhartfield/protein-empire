/**
 * Pack Page Form Handler
 * 
 * Handles email subscription form submissions with support for both
 * single opt-in and double opt-in modes.
 * 
 * Include this script on pack pages (pack-*.html)
 */

document.getElementById('subscribe-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email-input').value;
  const submitBtn = document.getElementById('submit-btn');
  const errorEl = document.getElementById('form-error');
  const successEl = document.getElementById('form-success');
  
  // Get pack info from page
  const pathMatch = window.location.pathname.match(/pack-(.+)\.html/);
  const packSlug = pathMatch ? pathMatch[1] : 'starter';
  const siteSlug = document.querySelector('meta[name="site-slug"]')?.content || 
                   window.location.hostname.replace(/\./g, '-');
  
  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'PROCESSING...';
  errorEl.classList.add('hidden');
  if (successEl) successEl.classList.add('hidden');
  
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        packSlug: packSlug,
        pdfUrl: window.location.origin + '/guides/' + siteSlug + '-' + packSlug + '.pdf'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.doubleOptIn) {
        // Double opt-in mode: Show "check your email" message
        if (successEl) {
          successEl.innerHTML = `
            <div class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span>Check your email to confirm and get your PDF!</span>
            </div>
          `;
          successEl.classList.remove('hidden');
        }
        submitBtn.textContent = 'CHECK YOUR EMAIL';
        submitBtn.classList.remove('bg-brand-500', 'hover:bg-brand-600');
        submitBtn.classList.add('bg-green-500', 'cursor-default');
        
        // Track event
        if (typeof gtag === 'function') {
          gtag('event', 'subscription_initiated', {
            pack: packSlug,
            double_opt_in: true
          });
        }
      } else {
        // Single opt-in mode: Redirect to success page
        window.location.href = '/success-' + packSlug + '.html?email=' + encodeURIComponent(email);
      }
    } else {
      throw new Error(data.message || 'Subscription failed');
    }
  } catch (error) {
    console.error('Subscription error:', error);
    errorEl.textContent = error.message || 'Something went wrong. Please try again.';
    errorEl.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'DOWNLOAD FREE PDF';
  }
});
