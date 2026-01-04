/**
 * Email Signup Handler for Protein Empire Sites
 * 
 * This script handles the email signup form submission on pack download pages.
 * It works with Netlify Functions or any serverless backend that provides
 * a /api/subscribe endpoint.
 * 
 * For static sites without a backend, it falls back to direct redirect
 * with the email as a query parameter (for analytics tracking).
 */

(function() {
  'use strict';

  // Configuration - these can be overridden by setting window.emailSignupConfig
  const defaultConfig = {
    apiEndpoint: '/api/subscribe',
    useApi: true,  // Set to false for pure static sites
    successRedirectBase: '/success-',  // Will append pack slug
    errorMessage: 'Something went wrong. Please try again.',
    loadingText: 'Subscribing...',
    buttonText: 'DOWNLOAD FREE PDF'
  };

  const config = { ...defaultConfig, ...(window.emailSignupConfig || {}) };

  /**
   * Initialize signup forms on the page
   */
  function init() {
    const forms = document.querySelectorAll('[data-email-signup]');
    forms.forEach(setupForm);
  }

  /**
   * Set up a single signup form
   */
  function setupForm(form) {
    form.addEventListener('submit', handleSubmit);
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const packSlug = form.dataset.packSlug || 'starter';
    const pdfUrl = form.dataset.pdfUrl || '';
    
    if (!emailInput || !submitButton) return;
    
    const email = emailInput.value.trim();
    if (!email) return;

    // Disable form during submission
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = config.loadingText;
    emailInput.disabled = true;

    try {
      if (config.useApi) {
        // Call the serverless function
        const response = await fetch(config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            packSlug,
            pdfUrl,
            source: window.location.hostname
          })
        });

        const data = await response.json();

        if (response.ok && data.success !== false) {
          // Success - redirect to success page
          redirectToSuccess(packSlug, email, pdfUrl);
        } else {
          // API error
          showError(form, data.message || config.errorMessage);
          resetForm(form, emailInput, submitButton, originalButtonText);
        }
      } else {
        // No API - just redirect with email param for tracking
        redirectToSuccess(packSlug, email, pdfUrl);
      }
    } catch (error) {
      console.error('[email-signup] Error:', error);
      
      // On network error, still redirect (graceful degradation)
      // The success page can handle the signup via a backup method
      redirectToSuccess(packSlug, email, pdfUrl);
    }
  }

  /**
   * Redirect to success page
   */
  function redirectToSuccess(packSlug, email, pdfUrl) {
    const successUrl = new URL(`${config.successRedirectBase}${packSlug}.html`, window.location.origin);
    successUrl.searchParams.set('email', encodeURIComponent(email));
    if (pdfUrl) {
      successUrl.searchParams.set('pdf', encodeURIComponent(pdfUrl));
    }
    window.location.href = successUrl.toString();
  }

  /**
   * Show error message
   */
  function showError(form, message) {
    // Remove any existing error
    const existingError = form.querySelector('.signup-error');
    if (existingError) existingError.remove();

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'signup-error text-red-500 text-sm mt-2';
    errorDiv.textContent = message;
    form.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
  }

  /**
   * Reset form to initial state
   */
  function resetForm(form, emailInput, submitButton, originalButtonText) {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    emailInput.disabled = false;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual initialization if needed
  window.EmailSignup = { init, config };
})();
