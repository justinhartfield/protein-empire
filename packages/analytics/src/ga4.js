/**
 * Google Analytics 4 Configuration for the Protein Empire
 * 
 * Provides GA4 setup, configuration, and tracking utilities for all sites.
 * 
 * Setup Instructions:
 * 1. Create a GA4 account at analytics.google.com
 * 2. Create a property for each site
 * 3. Get the Measurement ID (G-XXXXXXXXXX)
 * 4. Add to site configuration
 */

/**
 * GA4 configuration for all empire sites
 */
export const ga4Config = {
  // Master account info
  account: {
    name: 'Protein Empire',
    accountId: '', // Fill after creating account
  },
  
  // Per-site properties
  properties: {
    'highprotein.recipes': {
      propertyId: '',
      measurementId: '', // G-XXXXXXXXXX
      streamId: '',
      status: 'pending'
    },
    'proteinmuffins.com': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'proteincookies.co': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'proteinpancakes.co': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'proteinbrownies.co': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'protein-bread.com': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'proteinbars.co': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'proteinbites.co': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'proteindonuts.co': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'proteinoatmeal.co': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'proteincheesecake.co': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'proteinpizzas.co': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    },
    'proteinpudding.co': {
      propertyId: '',
      measurementId: '',
      streamId: '',
      status: 'pending'
    }
  }
};

/**
 * Generate GA4 tracking script for a site
 * @param {string} measurementId - GA4 Measurement ID (G-XXXXXXXXXX)
 * @returns {string} - HTML script tag
 */
export function generateGA4Script(measurementId) {
  if (!measurementId) {
    return '<!-- GA4 not configured -->';
  }

  return `
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}', {
    'send_page_view': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
`.trim();
}

/**
 * Generate GA4 tracking script with enhanced ecommerce for recipe sites
 * @param {string} measurementId - GA4 Measurement ID
 * @param {Object} options - Additional configuration options
 * @returns {string} - HTML script tag
 */
export function generateEnhancedGA4Script(measurementId, options = {}) {
  if (!measurementId) {
    return '<!-- GA4 not configured -->';
  }

  const {
    enableDebug = false,
    customDimensions = {}
  } = options;

  return `
<!-- Google Analytics 4 - Enhanced -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  
  // Base configuration
  gtag('config', '${measurementId}', {
    'send_page_view': true,
    'cookie_flags': 'SameSite=None;Secure',
    ${enableDebug ? "'debug_mode': true," : ''}
    'custom_map': {
      'dimension1': 'recipe_category',
      'dimension2': 'protein_content',
      'dimension3': 'lead_magnet',
      'dimension4': 'traffic_source'
    }
  });

  // Protein Empire custom tracking functions
  window.peTrack = {
    // Track recipe view
    recipeView: function(recipe) {
      gtag('event', 'view_recipe', {
        'recipe_id': recipe.id,
        'recipe_name': recipe.title,
        'recipe_category': recipe.category,
        'protein_content': recipe.protein,
        'calories': recipe.calories
      });
    },
    
    // Track PDF download
    pdfDownload: function(packName, email) {
      gtag('event', 'generate_lead', {
        'lead_type': 'pdf_download',
        'pack_name': packName,
        'value': 1
      });
    },
    
    // Track email signup
    emailSignup: function(source, packName) {
      gtag('event', 'sign_up', {
        'method': 'email',
        'source': source,
        'pack_name': packName
      });
    },
    
    // Track recipe print
    recipePrint: function(recipeId, recipeName) {
      gtag('event', 'print_recipe', {
        'recipe_id': recipeId,
        'recipe_name': recipeName
      });
    },
    
    // Track cross-site navigation
    crossSiteClick: function(targetDomain, recipeName) {
      gtag('event', 'cross_site_click', {
        'target_domain': targetDomain,
        'recipe_name': recipeName
      });
    },
    
    // Track scroll depth
    scrollDepth: function(percentage) {
      gtag('event', 'scroll', {
        'percent_scrolled': percentage
      });
    },
    
    // Track time on recipe
    timeOnRecipe: function(recipeId, seconds) {
      gtag('event', 'engagement', {
        'recipe_id': recipeId,
        'engagement_time_msec': seconds * 1000
      });
    }
  };
</script>
`.trim();
}

/**
 * Generate custom event tracking code for recipe pages
 * @returns {string} - JavaScript code for event tracking
 */
export function generateRecipeTrackingCode() {
  return `
<script>
  // Auto-track recipe view on page load
  document.addEventListener('DOMContentLoaded', function() {
    const recipeData = document.querySelector('[data-recipe]');
    if (recipeData && window.peTrack) {
      window.peTrack.recipeView({
        id: recipeData.dataset.recipeId,
        title: recipeData.dataset.recipeTitle,
        category: recipeData.dataset.recipeCategory,
        protein: parseInt(recipeData.dataset.recipeProtein),
        calories: parseInt(recipeData.dataset.recipeCalories)
      });
    }
  });

  // Track scroll depth
  let scrollDepths = [25, 50, 75, 100];
  let trackedDepths = [];
  
  window.addEventListener('scroll', function() {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    
    scrollDepths.forEach(function(depth) {
      if (scrollPercent >= depth && !trackedDepths.includes(depth)) {
        trackedDepths.push(depth);
        if (window.peTrack) {
          window.peTrack.scrollDepth(depth);
        }
      }
    });
  });

  // Track print button clicks
  document.querySelectorAll('[data-print-recipe]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const recipeId = this.dataset.recipeId;
      const recipeName = this.dataset.recipeName;
      if (window.peTrack) {
        window.peTrack.recipePrint(recipeId, recipeName);
      }
    });
  });

  // Track cross-site links
  document.querySelectorAll('a[data-cross-site]').forEach(function(link) {
    link.addEventListener('click', function() {
      const targetDomain = new URL(this.href).hostname;
      const recipeName = this.dataset.recipeName || 'Unknown';
      if (window.peTrack) {
        window.peTrack.crossSiteClick(targetDomain, recipeName);
      }
    });
  });

  // Track time on page
  let startTime = Date.now();
  window.addEventListener('beforeunload', function() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const recipeData = document.querySelector('[data-recipe]');
    if (recipeData && window.peTrack && timeSpent > 5) {
      window.peTrack.timeOnRecipe(recipeData.dataset.recipeId, timeSpent);
    }
  });
</script>
`.trim();
}

/**
 * GA4 setup checklist for new sites
 */
export const ga4SetupChecklist = [
  {
    step: 1,
    title: 'Create GA4 Account',
    description: 'Go to analytics.google.com and create a new account for "Protein Empire"',
    url: 'https://analytics.google.com/analytics/web/#/provision'
  },
  {
    step: 2,
    title: 'Create Property',
    description: 'Create a new GA4 property for each domain (e.g., "ProteinCookies.co")',
    settings: {
      propertyName: '{SiteName}',
      timezone: 'America/New_York',
      currency: 'USD'
    }
  },
  {
    step: 3,
    title: 'Create Data Stream',
    description: 'Add a web data stream for the domain',
    settings: {
      streamName: '{domain} - Web',
      url: 'https://{domain}',
      enhancedMeasurement: true
    }
  },
  {
    step: 4,
    title: 'Get Measurement ID',
    description: 'Copy the Measurement ID (G-XXXXXXXXXX) from the data stream',
    location: 'Admin > Data Streams > Select Stream > Measurement ID'
  },
  {
    step: 5,
    title: 'Add to Site Config',
    description: 'Add the Measurement ID to packages/config/sites.js under ga4Id',
    example: "ga4Id: 'G-XXXXXXXXXX'"
  },
  {
    step: 6,
    title: 'Configure Custom Dimensions',
    description: 'Set up custom dimensions for recipe tracking',
    dimensions: [
      { name: 'recipe_category', scope: 'event' },
      { name: 'protein_content', scope: 'event' },
      { name: 'lead_magnet', scope: 'event' },
      { name: 'traffic_source', scope: 'session' }
    ]
  },
  {
    step: 7,
    title: 'Enable Enhanced Measurement',
    description: 'Turn on enhanced measurement for automatic event tracking',
    events: ['Page views', 'Scrolls', 'Outbound clicks', 'Site search', 'File downloads']
  },
  {
    step: 8,
    title: 'Set Up Conversions',
    description: 'Mark key events as conversions',
    conversions: ['sign_up', 'generate_lead', 'pdf_download']
  },
  {
    step: 9,
    title: 'Link Search Console',
    description: 'Connect Google Search Console for organic search data',
    location: 'Admin > Product Links > Search Console Links'
  },
  {
    step: 10,
    title: 'Verify Tracking',
    description: 'Use GA4 DebugView to verify events are being tracked',
    url: 'https://analytics.google.com/analytics/web/#/debugview'
  }
];

/**
 * Generate GA4 configuration report
 * @param {Object} sites - Site configurations
 * @returns {Object} - Configuration status report
 */
export function generateConfigReport(sites) {
  const report = {
    generatedAt: new Date().toISOString(),
    totalSites: Object.keys(sites).length,
    configured: 0,
    pending: 0,
    sites: []
  };

  Object.entries(sites).forEach(([domain, config]) => {
    const ga4Status = config.ga4Id ? 'configured' : 'pending';
    if (ga4Status === 'configured') {
      report.configured++;
    } else {
      report.pending++;
    }

    report.sites.push({
      domain,
      name: config.name,
      ga4Id: config.ga4Id || 'Not configured',
      status: ga4Status
    });
  });

  return report;
}

export default {
  ga4Config,
  generateGA4Script,
  generateEnhancedGA4Script,
  generateRecipeTrackingCode,
  ga4SetupChecklist,
  generateConfigReport
};
