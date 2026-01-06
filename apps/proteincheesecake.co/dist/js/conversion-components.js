/**
 * Protein Empire Conversion Components
 * 
 * Reusable components for email capture across all ProteinXYZ.co sites:
 * - Exit Intent Popup
 * - PDF Lead Magnet Modal
 * - Sticky Footer CTA
 * - Print-Friendly Recipe Layout
 * 
 * Usage: Include this script and call initConversionComponents(config)
 */

(function() {
    'use strict';

    // Default configuration
    const defaultConfig = {
        // SendGrid API endpoint for email capture
        sendgridEndpoint: null,
        
        // Success redirect URL after email capture
        successRedirect: null,
        
        // PDF download URL
        pdfDownloadUrl: null,
        
        // Site-specific branding
        siteName: 'High Protein Recipes',
        siteEmoji: '🥗',
        
        // Lead magnet details
        leadMagnetTitle: 'High-Protein Starter Pack',
        leadMagnetDescription: 'Get our free recipe pack with shopping lists and macro breakdowns.',
        
        // Timing
        stickyDelay: 3000,  // ms before showing sticky
        exitIntentEnabled: true,
        
        // Colors (using Tailwind classes)
        primaryColor: 'brand-500',
        accentColor: 'accent-500',
        
        // GA4 Measurement ID
        gaMeasurementId: 'G-86MYLJ5WDT'
    };

    let config = { ...defaultConfig };
    let state = {
        stickyShown: false,
        exitIntentTriggered: false,
        leadMagnetOpen: false,
        scrollMarkers: [25, 50, 75, 100],
        trackedMarkers: []
    };

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    function trackEvent(eventName, params = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...params,
                site: window.location.hostname,
                page: window.location.pathname
            });
        }
        console.log('[Conversion]', eventName, params);
    }

    async function submitEmail(email, source) {
        trackEvent('email_signup', { source: source });
        
        if (config.sendgridEndpoint) {
            try {
                const response = await fetch(config.sendgridEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        source: source,
                        site: window.location.hostname,
                        page: window.location.pathname,
                        timestamp: new Date().toISOString(),
                        utm_source: getUrlParam('utm_source'),
                        utm_medium: getUrlParam('utm_medium'),
                        utm_campaign: getUrlParam('utm_campaign')
                    })
                });
                return response.ok;
            } catch (e) {
                console.error('Email submission failed:', e);
                return false;
            }
        }
        return true; // No endpoint configured, treat as success
    }

    function getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param) || '';
    }

    function createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    // ========================================
    // EXIT INTENT POPUP
    // ========================================

    function createExitIntentPopup() {
        const html = `
        <div id="pe-exit-intent" class="fixed inset-0 z-[100] flex items-center justify-center p-4" style="display: none;">
            <div class="pe-backdrop absolute inset-0 bg-brand-900/60 backdrop-blur-sm"></div>
            <div class="pe-modal relative bg-brand-50 rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-12 overflow-hidden">
                <div class="absolute -top-10 -left-10 w-32 h-32 bg-brand-500/10 rounded-full"></div>
                
                <button class="pe-close absolute top-4 right-4 p-2 text-brand-400 hover:text-brand-700 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <div class="relative z-10 text-center">
                    <div class="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                    <h2 class="font-bold text-3xl text-brand-900 mb-4" style="font-family: Anton, sans-serif;">Don't leave empty-handed!</h2>
                    <p class="text-brand-700/70 mb-8">Get our "High-Protein Essentials" shopping list for free. No credit card required, just healthy fuel.</p>
                    
                    <form class="pe-form space-y-4">
                        <input type="email" required placeholder="Enter your email" class="pe-email w-full px-6 py-4 rounded-full border-2 border-brand-200 focus:border-brand-500 outline-none transition-all">
                        <button type="submit" class="w-full py-4 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-all shadow-lg">
                            Send Me The List
                        </button>
                        <button type="button" class="pe-dismiss text-brand-400 text-sm hover:text-brand-700 transition-colors mt-4">No thanks, I'm good</button>
                    </form>
                </div>
            </div>
        </div>`;
        
        const popup = createElement(html);
        document.body.appendChild(popup);
        
        // Event listeners
        popup.querySelector('.pe-backdrop').addEventListener('click', () => hideExitIntent());
        popup.querySelector('.pe-close').addEventListener('click', () => hideExitIntent());
        popup.querySelector('.pe-dismiss').addEventListener('click', () => hideExitIntent());
        popup.querySelector('.pe-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = popup.querySelector('.pe-email').value;
            if (email) {
                await submitEmail(email, 'exit_intent');
                hideExitIntent();
                if (config.successRedirect) {
                    window.location.href = config.successRedirect;
                }
            }
        });
        
        return popup;
    }

    function showExitIntent() {
        const popup = document.getElementById('pe-exit-intent');
        if (popup && !state.exitIntentTriggered) {
            popup.style.display = 'flex';
            state.exitIntentTriggered = true;
            trackEvent('exit_intent_shown');
        }
    }

    function hideExitIntent() {
        const popup = document.getElementById('pe-exit-intent');
        if (popup) {
            popup.style.display = 'none';
        }
    }

    // ========================================
    // STICKY FOOTER CTA
    // ========================================

    function createStickyFooter() {
        const html = `
        <div id="pe-sticky-footer" class="fixed bottom-0 left-0 w-full z-50 p-4 pointer-events-none" style="display: none; transform: translateY(100%);">
            <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-brand-200 p-4 flex flex-col md:flex-row items-center gap-4 pointer-events-auto">
                <div class="flex items-center gap-4 flex-grow">
                    <div class="hidden sm:flex w-12 h-16 bg-brand-100 rounded-lg flex-shrink-0 items-center justify-center">
                        <span class="text-2xl">📖</span>
                    </div>
                    <div>
                        <h5 class="font-bold text-brand-900 text-sm md:text-base pe-title">Grab the Free Recipe Pack!</h5>
                        <p class="text-xs text-brand-600 font-medium">Join 15,000+ home cooks saving 5 hours/week.</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 w-full md:w-auto">
                    <input type="email" placeholder="Your email..." class="pe-email flex-grow px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none">
                    <button class="pe-submit bg-brand-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-brand-600 transition-all whitespace-nowrap">
                        Join Free
                    </button>
                    <button class="pe-close text-brand-400 hover:text-brand-700 p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>
        </div>`;
        
        const sticky = createElement(html);
        document.body.appendChild(sticky);
        
        // Update title
        sticky.querySelector('.pe-title').textContent = `Grab the ${config.leadMagnetTitle}!`;
        
        // Event listeners
        sticky.querySelector('.pe-close').addEventListener('click', () => hideStickyFooter());
        sticky.querySelector('.pe-submit').addEventListener('click', async () => {
            const email = sticky.querySelector('.pe-email').value;
            if (email) {
                await submitEmail(email, 'sticky_footer');
                hideStickyFooter();
                if (config.successRedirect) {
                    window.location.href = config.successRedirect;
                }
            }
        });
        
        return sticky;
    }

    function showStickyFooter() {
        const sticky = document.getElementById('pe-sticky-footer');
        if (sticky && !state.stickyShown) {
            sticky.style.display = 'block';
            sticky.style.transition = 'transform 0.5s ease-out';
            setTimeout(() => {
                sticky.style.transform = 'translateY(0)';
            }, 10);
            state.stickyShown = true;
            trackEvent('sticky_footer_shown');
        }
    }

    function hideStickyFooter() {
        const sticky = document.getElementById('pe-sticky-footer');
        if (sticky) {
            sticky.style.transform = 'translateY(100%)';
            setTimeout(() => {
                sticky.style.display = 'none';
            }, 500);
        }
    }

    // ========================================
    // PDF LEAD MAGNET MODAL
    // ========================================

    function createLeadMagnetModal() {
        const html = `
        <div id="pe-lead-magnet" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden" style="display: none;">
            <div class="pe-backdrop absolute inset-0 bg-brand-900/80 backdrop-blur-sm"></div>
            <div class="pe-modal relative w-full max-w-5xl bg-brand-50 md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                <button class="pe-close absolute top-6 right-6 z-50 p-2 bg-brand-900/5 hover:bg-brand-900/10 rounded-full transition-colors text-brand-900">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <!-- Left Side: Visual -->
                <div class="w-full md:w-5/12 p-12 flex flex-col justify-center items-center relative overflow-hidden" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                    <div class="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div class="relative z-10">
                        <div class="w-48 h-64 rounded-tr-[2rem] rounded-br-xl rounded-l-md p-5 flex flex-col justify-between text-white relative" style="background: linear-gradient(145deg, #f59e0b, #d97706); box-shadow: 15px 15px 30px rgba(0,0,0,0.1);">
                            <div class="absolute left-0 top-0 bottom-0 w-3 bg-black/10 rounded-l-md"></div>
                            <div class="relative">
                                <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-3">
                                    <span class="text-xs font-bold">HP</span>
                                </div>
                                <h4 class="text-lg font-bold leading-tight pe-pack-title">High-Protein Starter Pack</h4>
                            </div>
                            <div class="space-y-2">
                                <div class="h-1 w-12 bg-white/50 rounded"></div>
                                <p class="text-[10px] font-medium text-white/70 uppercase tracking-widest">Free Download</p>
                            </div>
                            <div class="absolute -right-3 -bottom-3 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-bold text-center rotate-12 shadow-lg border-2 border-white/20">
                                FREE<br>PDF
                            </div>
                        </div>
                    </div>
                    <div class="mt-10 text-center relative z-10">
                        <p class="text-white/80 font-bold text-sm tracking-widest uppercase mb-2">Exclusive Offer</p>
                        <h3 class="text-white text-xl font-bold mb-4">Transform Your<br>Meal Prep</h3>
                    </div>
                </div>

                <!-- Right Side: Form -->
                <div class="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center">
                    <div class="pe-form-container">
                        <div class="mb-8">
                            <span class="inline-block px-3 py-1 bg-brand-500/10 text-brand-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                                Free Download
                            </span>
                            <h2 class="text-3xl md:text-4xl text-brand-900 leading-tight mb-4" style="font-family: Anton, sans-serif;">
                                Get Your <span class="text-brand-500 pe-modal-title">Free Recipe Pack</span>
                            </h2>
                            <p class="text-lg text-brand-700/70 leading-relaxed pe-modal-desc">
                                All recipes with complete nutrition info, shopping lists, and meal prep tips.
                            </p>
                        </div>

                        <form class="pe-form space-y-4">
                            <div class="relative">
                                <input type="email" required placeholder="Where should we send your guide?" class="pe-email w-full px-6 py-5 rounded-2xl bg-brand-100/50 border-2 border-transparent focus:border-brand-500 outline-none transition-all text-brand-900 placeholder:text-brand-400 text-lg">
                            </div>
                            <button type="submit" class="w-full py-5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 text-lg group">
                                <span>Download Free Guide Now</span>
                                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                            <div class="flex items-center gap-3 pt-4 px-2">
                                <svg class="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                <p class="text-xs text-brand-500">We respect your privacy. Unsubscribe anytime.</p>
                            </div>
                        </form>
                    </div>

                    <!-- Success State -->
                    <div class="pe-success text-center py-8" style="display: none;">
                        <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 class="text-2xl text-brand-900 mb-4" style="font-family: Anton, sans-serif;">Check Your Inbox!</h3>
                        <p class="text-brand-700/70 mb-6">Your recipe pack is on its way. Check your email for the download link.</p>
                        <button class="pe-continue px-8 py-3 bg-brand-100 text-brand-700 font-semibold rounded-full hover:bg-brand-200 transition-all">
                            Continue Browsing
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        
        const modal = createElement(html);
        document.body.appendChild(modal);
        
        // Update content
        modal.querySelector('.pe-pack-title').textContent = config.leadMagnetTitle;
        modal.querySelector('.pe-modal-title').textContent = config.leadMagnetTitle;
        modal.querySelector('.pe-modal-desc').textContent = config.leadMagnetDescription;
        
        // Event listeners
        modal.querySelector('.pe-backdrop').addEventListener('click', () => hideLeadMagnet());
        modal.querySelector('.pe-close').addEventListener('click', () => hideLeadMagnet());
        modal.querySelector('.pe-continue').addEventListener('click', () => hideLeadMagnet());
        modal.querySelector('.pe-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = modal.querySelector('.pe-email').value;
            if (email) {
                await submitEmail(email, 'lead_magnet');
                modal.querySelector('.pe-form-container').style.display = 'none';
                modal.querySelector('.pe-success').style.display = 'block';
                trackEvent('lead_magnet_submitted');
                
                if (config.successRedirect) {
                    setTimeout(() => {
                        window.location.href = config.successRedirect;
                    }, 2000);
                }
            }
        });
        
        return modal;
    }

    function showLeadMagnet() {
        const modal = document.getElementById('pe-lead-magnet');
        if (modal) {
            modal.style.display = 'flex';
            state.leadMagnetOpen = true;
            trackEvent('lead_magnet_opened');
        }
    }

    function hideLeadMagnet() {
        const modal = document.getElementById('pe-lead-magnet');
        if (modal) {
            modal.style.display = 'none';
            state.leadMagnetOpen = false;
            // Reset form
            modal.querySelector('.pe-form-container').style.display = 'block';
            modal.querySelector('.pe-success').style.display = 'none';
            modal.querySelector('.pe-email').value = '';
        }
    }

    // ========================================
    // PRINT BUTTON
    // ========================================

    function createPrintButton() {
        const html = `
        <button id="pe-print-btn" class="fixed bottom-24 right-6 z-40 bg-white shadow-lg rounded-full p-3 hover:bg-brand-50 transition-all border border-brand-200" title="Print Recipe">
            <svg class="w-6 h-6 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        </button>`;
        
        const btn = createElement(html);
        document.body.appendChild(btn);
        
        btn.addEventListener('click', () => {
            trackEvent('print_recipe');
            window.print();
        });
        
        return btn;
    }

    // ========================================
    // SCROLL TRACKING
    // ========================================

    function setupScrollTracking() {
        window.addEventListener('scroll', () => {
            const h = document.documentElement, 
                  b = document.body,
                  st = 'scrollTop',
                  sh = 'scrollHeight';
            const percent = Math.round((h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100);
            
            state.scrollMarkers.forEach(marker => {
                if (percent >= marker && !state.trackedMarkers.includes(marker)) {
                    state.trackedMarkers.push(marker);
                    trackEvent('scroll_depth', { percent: marker });
                }
            });
        });
    }

    // ========================================
    // EXIT INTENT DETECTION
    // ========================================

    function setupExitIntent() {
        if (!config.exitIntentEnabled) return;
        
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 10 && !state.exitIntentTriggered && !state.leadMagnetOpen) {
                showExitIntent();
            }
        });
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    function initConversionComponents(userConfig = {}) {
        config = { ...defaultConfig, ...userConfig };
        
        // Create components
        createExitIntentPopup();
        createStickyFooter();
        createLeadMagnetModal();
        
        // Only add print button on recipe pages
        if (window.location.pathname.includes('.html') || document.querySelector('[itemtype*="Recipe"]')) {
            createPrintButton();
        }
        
        // Setup tracking
        setupScrollTracking();
        setupExitIntent();
        
        // Show sticky after delay
        setTimeout(() => {
            showStickyFooter();
        }, config.stickyDelay);
        
        // Expose global functions
        window.peShowLeadMagnet = showLeadMagnet;
        window.peHideLeadMagnet = hideLeadMagnet;
        window.peShowExitIntent = showExitIntent;
        window.peHideExitIntent = hideExitIntent;
        
        console.log('[Conversion] Components initialized', config);
    }

    // Expose initialization function
    window.initConversionComponents = initConversionComponents;
})();
