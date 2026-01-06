/**
 * GA4 Event Tracking for Protein Empire
 * Tracks key conversion events for Dotoro campaign attribution.
 * 
 * Events tracked:
 * - outbound_click: Clicks to ProteinXYZ.co recipe pages
 * - pdf_download: PDF pack downloads
 * - email_signup: Newsletter signups
 * - scroll_depth: 25%, 50%, 75%, 100% scroll milestones
 * - page_engagement: Time on page milestones
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    debug: false, // Set to true for console logging
    scrollMilestones: [25, 50, 75, 100],
    engagementMilestones: [30, 60, 120, 300], // seconds
  };

  // Utility: Log events in debug mode
  function debugLog(eventName, params) {
    if (CONFIG.debug) {
      console.log(`[GA4 Event] ${eventName}`, params);
    }
  }

  // Utility: Send GA4 event
  function sendEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
      debugLog(eventName, params);
    } else {
      debugLog(`gtag not available for: ${eventName}`, params);
    }
  }

  // Utility: Get UTM parameters from URL
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
    };
  }

  // Track outbound clicks to recipe pages
  function trackOutboundClicks() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Check if it's an outbound link to a Protein Empire site
      const proteinDomains = [
        'proteincookies.co',
        'proteinpancakes.co',
        'proteinbrownies.co',
        'protein-bread.com',
        'proteinbars.co',
        'proteinbites.co',
        'proteindonuts.co',
        'proteinoatmeal.co',
        'proteincheesecake.co',
        'proteinpizzas.co',
        'proteinpudding.co'
      ];

      const isOutbound = proteinDomains.some(domain => href.includes(domain));
      
      if (isOutbound) {
        const utmParams = getUTMParams();
        sendEvent('outbound_click', {
          link_url: href,
          link_domain: new URL(href).hostname,
          link_text: link.textContent.trim().substring(0, 100),
          page_location: window.location.href,
          page_title: document.title,
          ...utmParams
        });
      }
    });
  }

  // Track PDF downloads
  function trackPDFDownloads() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      if (href.endsWith('.pdf') || href.includes('/guides/')) {
        const utmParams = getUTMParams();
        sendEvent('pdf_download', {
          file_name: href.split('/').pop(),
          file_url: href,
          page_location: window.location.href,
          ...utmParams
        });
      }
    });
  }

  // Track scroll depth
  function trackScrollDepth() {
    const milestones = new Set(CONFIG.scrollMilestones);
    const triggered = new Set();

    function getScrollPercent() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      return Math.round((scrollTop / scrollHeight) * 100);
    }

    function checkMilestones() {
      const percent = getScrollPercent();
      
      milestones.forEach(milestone => {
        if (percent >= milestone && !triggered.has(milestone)) {
          triggered.add(milestone);
          sendEvent('scroll_depth', {
            percent_scrolled: milestone,
            page_location: window.location.href,
            page_title: document.title
          });
        }
      });
    }

    // Throttled scroll handler
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          checkMilestones();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Track time on page engagement
  function trackPageEngagement() {
    const milestones = new Set(CONFIG.engagementMilestones);
    const triggered = new Set();
    const startTime = Date.now();

    function checkEngagement() {
      const secondsOnPage = Math.floor((Date.now() - startTime) / 1000);
      
      milestones.forEach(milestone => {
        if (secondsOnPage >= milestone && !triggered.has(milestone)) {
          triggered.add(milestone);
          sendEvent('page_engagement', {
            engagement_time_seconds: milestone,
            page_location: window.location.href,
            page_title: document.title
          });
        }
      });
    }

    // Check every 5 seconds
    setInterval(checkEngagement, 5000);
  }

  // Track email signup form submissions
  function trackEmailSignups() {
    document.addEventListener('submit', function(e) {
      const form = e.target;
      
      // Check if it's an email signup form
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput) {
        const utmParams = getUTMParams();
        sendEvent('email_signup', {
          form_id: form.id || 'unknown',
          form_location: form.closest('section')?.id || 'unknown',
          page_location: window.location.href,
          ...utmParams
        });
      }
    });
  }

  // Track CTA button clicks
  function trackCTAClicks() {
    document.addEventListener('click', function(e) {
      const button = e.target.closest('button, .cta-button, [data-cta]');
      if (!button) return;

      const ctaText = button.textContent.trim().substring(0, 50);
      const ctaType = button.getAttribute('data-cta') || 'button';
      
      sendEvent('cta_click', {
        cta_text: ctaText,
        cta_type: ctaType,
        page_location: window.location.href
      });
    });
  }

  // Initialize all tracking
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTracking);
    } else {
      initTracking();
    }
  }

  function initTracking() {
    trackOutboundClicks();
    trackPDFDownloads();
    trackScrollDepth();
    trackPageEngagement();
    trackEmailSignups();
    trackCTAClicks();
    
    debugLog('GA4 Event Tracking initialized', {
      page: window.location.pathname,
      utm: getUTMParams()
    });
  }

  // Auto-initialize
  init();

  // Expose for manual event tracking
  window.ProteinEmpireAnalytics = {
    sendEvent: sendEvent,
    getUTMParams: getUTMParams
  };

})();
