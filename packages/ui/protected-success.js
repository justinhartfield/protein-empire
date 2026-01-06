/**
 * Protected Success Page Module
 * 
 * This module handles access verification for success/download pages
 * when double opt-in is enabled. It verifies that the user has confirmed
 * their email before allowing access to the PDF download.
 * 
 * Usage:
 * 1. Include this script on success pages
 * 2. The script will automatically check for access token in URL
 * 3. If valid, it shows the download content
 * 4. If invalid/missing, it shows an access denied message
 */

(function() {
  'use strict';

  // Configuration
  const VERIFY_ENDPOINT = '/api/verify-access';
  
  // DOM element IDs
  const LOADING_ID = 'loading-state';
  const SUCCESS_ID = 'success-state';
  const DENIED_ID = 'denied-state';
  const DOWNLOAD_BTN_ID = 'download-btn';
  const USER_EMAIL_ID = 'user-email';

  /**
   * Get URL parameters
   */
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      accessToken: params.get('access'),
      email: params.get('email'),
      confirmed: params.get('confirmed')
    };
  }

  /**
   * Show a specific state and hide others
   */
  function showState(stateId) {
    const states = [LOADING_ID, SUCCESS_ID, DENIED_ID];
    states.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = id === stateId ? 'block' : 'none';
      }
    });
  }

  /**
   * Verify access token with the server
   */
  async function verifyAccess(token) {
    try {
      const response = await fetch(`${VERIFY_ENDPOINT}?token=${encodeURIComponent(token)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[protected-success] Verification error:', error);
      return { success: false, error: 'Network error', code: 'NETWORK_ERROR' };
    }
  }

  /**
   * Update the download button with the correct PDF URL
   */
  function updateDownloadButton(pdfUrl) {
    const btn = document.getElementById(DOWNLOAD_BTN_ID);
    if (btn && pdfUrl) {
      btn.href = pdfUrl;
      btn.setAttribute('download', '');
    }
  }

  /**
   * Display user email on the page
   */
  function displayUserEmail(email) {
    const el = document.getElementById(USER_EMAIL_ID);
    if (el && email) {
      el.textContent = email;
    }
  }

  /**
   * Main initialization function
   */
  async function init() {
    const { accessToken, email, confirmed } = getUrlParams();

    // If no access token, show denied state
    if (!accessToken) {
      console.log('[protected-success] No access token provided');
      showState(DENIED_ID);
      return;
    }

    // Show loading state while verifying
    showState(LOADING_ID);

    // Verify the access token
    const result = await verifyAccess(accessToken);

    if (result.success) {
      console.log('[protected-success] Access verified for:', result.data.email);
      
      // Update UI with user data
      displayUserEmail(result.data.email);
      updateDownloadButton(result.data.pdfUrl);
      
      // Show success state
      showState(SUCCESS_ID);
      
      // Track successful confirmation (if GA4 is available)
      if (typeof gtag === 'function') {
        gtag('event', 'download_page_accessed', {
          email: result.data.email,
          pack: result.data.packSlug,
          confirmed: true
        });
      }
    } else {
      console.log('[protected-success] Access denied:', result.code, result.error);
      showState(DENIED_ID);
      
      // Update denied message based on error code
      const deniedMessage = document.getElementById('denied-message');
      if (deniedMessage) {
        switch (result.code) {
          case 'TOKEN_EXPIRED':
            deniedMessage.textContent = 'Your access link has expired. Please check your email for the download link, or request a new one.';
            break;
          case 'INVALID_TOKEN':
            deniedMessage.textContent = 'This access link is invalid. Please confirm your email first to access the download.';
            break;
          default:
            deniedMessage.textContent = 'Unable to verify access. Please confirm your email first to access the download.';
        }
      }
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
