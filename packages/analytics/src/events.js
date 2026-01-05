/**
 * Custom Event Definitions for the Protein Empire
 * 
 * Defines all custom events tracked across the empire sites.
 * These events provide insights into user behavior and conversion funnels.
 */

/**
 * Event categories
 */
export const EventCategories = {
  RECIPE: 'recipe',
  LEAD_GEN: 'lead_generation',
  ENGAGEMENT: 'engagement',
  NAVIGATION: 'navigation',
  CONVERSION: 'conversion'
};

/**
 * Custom event definitions
 */
export const customEvents = {
  // Recipe-related events
  recipe: {
    view: {
      name: 'view_recipe',
      category: EventCategories.RECIPE,
      description: 'User views a recipe page',
      parameters: {
        recipe_id: 'string',
        recipe_name: 'string',
        recipe_category: 'string',
        protein_content: 'number',
        calories: 'number'
      },
      isConversion: false
    },
    print: {
      name: 'print_recipe',
      category: EventCategories.RECIPE,
      description: 'User prints a recipe',
      parameters: {
        recipe_id: 'string',
        recipe_name: 'string'
      },
      isConversion: false
    },
    share: {
      name: 'share_recipe',
      category: EventCategories.RECIPE,
      description: 'User shares a recipe',
      parameters: {
        recipe_id: 'string',
        recipe_name: 'string',
        share_method: 'string' // pinterest, facebook, twitter, email, copy_link
      },
      isConversion: false
    },
    save: {
      name: 'save_recipe',
      category: EventCategories.RECIPE,
      description: 'User saves a recipe to favorites',
      parameters: {
        recipe_id: 'string',
        recipe_name: 'string'
      },
      isConversion: false
    }
  },

  // Lead generation events
  leadGen: {
    formView: {
      name: 'view_signup_form',
      category: EventCategories.LEAD_GEN,
      description: 'User views email signup form',
      parameters: {
        form_location: 'string', // popup, inline, footer, exit_intent
        pack_name: 'string'
      },
      isConversion: false
    },
    formStart: {
      name: 'start_signup',
      category: EventCategories.LEAD_GEN,
      description: 'User starts filling signup form',
      parameters: {
        form_location: 'string',
        pack_name: 'string'
      },
      isConversion: false
    },
    formSubmit: {
      name: 'sign_up',
      category: EventCategories.LEAD_GEN,
      description: 'User submits email signup form',
      parameters: {
        method: 'email',
        form_location: 'string',
        pack_name: 'string'
      },
      isConversion: true
    },
    pdfDownload: {
      name: 'generate_lead',
      category: EventCategories.LEAD_GEN,
      description: 'User downloads PDF lead magnet',
      parameters: {
        lead_type: 'pdf_download',
        pack_name: 'string',
        value: 1
      },
      isConversion: true
    }
  },

  // Engagement events
  engagement: {
    scroll: {
      name: 'scroll',
      category: EventCategories.ENGAGEMENT,
      description: 'User scrolls to depth milestone',
      parameters: {
        percent_scrolled: 'number' // 25, 50, 75, 100
      },
      isConversion: false
    },
    timeOnPage: {
      name: 'engagement',
      category: EventCategories.ENGAGEMENT,
      description: 'User spends significant time on page',
      parameters: {
        recipe_id: 'string',
        engagement_time_msec: 'number'
      },
      isConversion: false
    },
    videoPlay: {
      name: 'video_start',
      category: EventCategories.ENGAGEMENT,
      description: 'User starts playing a video',
      parameters: {
        video_title: 'string',
        video_duration: 'number'
      },
      isConversion: false
    },
    videoComplete: {
      name: 'video_complete',
      category: EventCategories.ENGAGEMENT,
      description: 'User completes watching a video',
      parameters: {
        video_title: 'string'
      },
      isConversion: false
    }
  },

  // Navigation events
  navigation: {
    crossSite: {
      name: 'cross_site_click',
      category: EventCategories.NAVIGATION,
      description: 'User clicks link to another empire site',
      parameters: {
        target_domain: 'string',
        recipe_name: 'string',
        link_location: 'string' // related_recipes, footer, nav, inline
      },
      isConversion: false
    },
    categoryClick: {
      name: 'category_click',
      category: EventCategories.NAVIGATION,
      description: 'User clicks on a category',
      parameters: {
        category_name: 'string'
      },
      isConversion: false
    },
    searchPerformed: {
      name: 'search',
      category: EventCategories.NAVIGATION,
      description: 'User performs a search',
      parameters: {
        search_term: 'string'
      },
      isConversion: false
    },
    externalLink: {
      name: 'click',
      category: EventCategories.NAVIGATION,
      description: 'User clicks external link',
      parameters: {
        link_url: 'string',
        link_text: 'string',
        outbound: true
      },
      isConversion: false
    }
  },

  // Conversion events
  conversion: {
    emailSignup: {
      name: 'sign_up',
      category: EventCategories.CONVERSION,
      description: 'User signs up for email list',
      parameters: {
        method: 'email',
        source: 'string',
        pack_name: 'string'
      },
      isConversion: true
    },
    pdfDownload: {
      name: 'generate_lead',
      category: EventCategories.CONVERSION,
      description: 'User downloads PDF',
      parameters: {
        lead_type: 'pdf_download',
        pack_name: 'string',
        value: 1
      },
      isConversion: true
    }
  }
};

/**
 * Generate event tracking function for client-side use
 * @param {string} eventName - Name of the event
 * @param {Object} eventConfig - Event configuration
 * @returns {string} - JavaScript function code
 */
export function generateEventTracker(eventName, eventConfig) {
  const paramList = Object.keys(eventConfig.parameters).join(', ');
  
  return `
/**
 * Track: ${eventConfig.description}
 * Category: ${eventConfig.category}
 * ${eventConfig.isConversion ? '⭐ CONVERSION EVENT' : ''}
 */
function track_${eventName}(${paramList}) {
  if (typeof gtag !== 'function') {
    console.warn('GA4 not loaded');
    return;
  }
  
  gtag('event', '${eventConfig.name}', {
    ${Object.entries(eventConfig.parameters).map(([key, type]) => 
      `'${key}': ${key}`
    ).join(',\n    ')}
  });
}
`.trim();
}

/**
 * Generate all event tracking functions
 * @returns {string} - JavaScript code with all tracking functions
 */
export function generateAllEventTrackers() {
  let code = `
/**
 * Protein Empire - Event Tracking Functions
 * Auto-generated event trackers for GA4
 */

// Check if GA4 is loaded
function isGA4Loaded() {
  return typeof gtag === 'function';
}

`;

  // Generate trackers for each event category
  Object.entries(customEvents).forEach(([category, events]) => {
    code += `\n// ${category.toUpperCase()} EVENTS\n`;
    
    Object.entries(events).forEach(([eventKey, eventConfig]) => {
      code += generateEventTracker(eventKey, eventConfig) + '\n\n';
    });
  });

  return code;
}

/**
 * Conversion funnel definitions
 */
export const conversionFunnels = {
  emailSignup: {
    name: 'Email Signup Funnel',
    description: 'Tracks user journey from page view to email signup',
    steps: [
      { event: 'page_view', name: 'Page View' },
      { event: 'view_signup_form', name: 'View Form' },
      { event: 'start_signup', name: 'Start Form' },
      { event: 'sign_up', name: 'Complete Signup' }
    ]
  },
  pdfDownload: {
    name: 'PDF Download Funnel',
    description: 'Tracks user journey from page view to PDF download',
    steps: [
      { event: 'page_view', name: 'Page View' },
      { event: 'view_signup_form', name: 'View Form' },
      { event: 'sign_up', name: 'Submit Email' },
      { event: 'generate_lead', name: 'Download PDF' }
    ]
  },
  recipeEngagement: {
    name: 'Recipe Engagement Funnel',
    description: 'Tracks depth of recipe engagement',
    steps: [
      { event: 'view_recipe', name: 'View Recipe' },
      { event: 'scroll_50', name: 'Scroll 50%' },
      { event: 'scroll_100', name: 'Scroll 100%' },
      { event: 'print_recipe', name: 'Print Recipe' }
    ]
  }
};

/**
 * Key Performance Indicators (KPIs)
 */
export const kpis = {
  traffic: [
    { name: 'Daily Active Users', metric: 'active_users', target: 'Increase 10% MoM' },
    { name: 'Sessions', metric: 'sessions', target: 'Increase 10% MoM' },
    { name: 'Pageviews', metric: 'screen_page_views', target: 'Increase 10% MoM' },
    { name: 'Bounce Rate', metric: 'bounce_rate', target: '< 60%' }
  ],
  engagement: [
    { name: 'Avg. Session Duration', metric: 'average_session_duration', target: '> 2 minutes' },
    { name: 'Pages per Session', metric: 'screens_per_session', target: '> 2' },
    { name: 'Scroll Depth 75%+', metric: 'scroll_75', target: '> 40% of users' },
    { name: 'Recipe Print Rate', metric: 'print_recipe', target: '> 5% of recipe views' }
  ],
  conversion: [
    { name: 'Email Signup Rate', metric: 'sign_up', target: '> 3% of visitors' },
    { name: 'PDF Download Rate', metric: 'generate_lead', target: '> 80% of signups' },
    { name: 'Cross-site Click Rate', metric: 'cross_site_click', target: '> 2% of visitors' }
  ],
  seo: [
    { name: 'Organic Traffic %', metric: 'organic_sessions', target: '> 60% of total' },
    { name: 'Avg. Position', metric: 'average_position', target: '< 15' },
    { name: 'CTR from Search', metric: 'ctr', target: '> 2%' }
  ]
};

export default {
  EventCategories,
  customEvents,
  generateEventTracker,
  generateAllEventTrackers,
  conversionFunnels,
  kpis
};
