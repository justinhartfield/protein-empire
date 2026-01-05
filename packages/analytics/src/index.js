/**
 * Protein Empire Analytics Package
 * 
 * Provides analytics configuration, tracking, and reporting utilities
 * for all sites in the Protein Empire.
 * 
 * Features:
 * - GA4 configuration and tracking scripts
 * - Google Search Console setup
 * - Custom event definitions
 * - Dashboard data structures
 * - Reporting utilities
 * 
 * @module @protein-empire/analytics
 */

// GA4 exports
export {
  ga4Config,
  generateGA4Script,
  generateEnhancedGA4Script,
  generateRecipeTrackingCode,
  ga4SetupChecklist,
  generateConfigReport as generateGA4Report
} from './ga4.js';

// Search Console exports
export {
  gscConfig,
  generateSitemap,
  generateRobotsTxt,
  gscSetupChecklist,
  seoMetrics,
  targetKeywords,
  generateKeywordTracker,
  generateGSCReport
} from './search-console.js';

// Events exports
export {
  EventCategories,
  customEvents,
  generateEventTracker,
  generateAllEventTrackers,
  conversionFunnels,
  kpis
} from './events.js';

// Dashboard exports
export {
  WidgetTypes,
  dashboardConfig,
  sampleDashboardData,
  generateEmptyDashboardData,
  calculateChange,
  formatMetric,
  weeklyReportTemplate,
  generateRecommendations
} from './dashboard.js';

// Import for combined functions
import { generateEnhancedGA4Script, generateRecipeTrackingCode } from './ga4.js';
import { generateSitemap, generateRobotsTxt } from './search-console.js';

/**
 * Generate complete analytics setup for a site
 * @param {Object} siteConfig - Site configuration
 * @param {Object[]} recipes - Site recipes
 * @returns {Object} - Complete analytics setup
 */
export function generateSiteAnalyticsSetup(siteConfig, recipes = []) {
  const { domain, name, ga4Id } = siteConfig;

  return {
    site: domain,
    siteName: name,
    generatedAt: new Date().toISOString(),
    
    // GA4 tracking script
    ga4Script: generateEnhancedGA4Script(ga4Id, { enableDebug: false }),
    
    // Recipe tracking code
    recipeTrackingCode: generateRecipeTrackingCode(),
    
    // Sitemap
    sitemap: generateSitemap(domain, recipes),
    
    // Robots.txt
    robotsTxt: generateRobotsTxt(domain),
    
    // Setup status
    status: {
      ga4Configured: !!ga4Id,
      sitemapGenerated: true,
      robotsTxtGenerated: true
    }
  };
}

/**
 * Generate analytics setup for all sites
 * @param {Object} sites - All site configurations
 * @param {Object} recipesByDomain - Recipes by domain
 * @returns {Object} - Analytics setup for all sites
 */
export function generateAllAnalyticsSetup(sites, recipesByDomain = {}) {
  const setup = {
    generatedAt: new Date().toISOString(),
    sites: {}
  };

  Object.entries(sites).forEach(([domain, siteConfig]) => {
    if (siteConfig.isIndexer) return;
    
    const recipes = recipesByDomain[domain] || [];
    setup.sites[domain] = generateSiteAnalyticsSetup(siteConfig, recipes);
  });

  return setup;
}

/**
 * Analytics implementation status
 */
export const implementationStatus = {
  ga4: {
    status: 'ready',
    description: 'GA4 tracking scripts and configuration ready',
    nextSteps: [
      'Create GA4 properties for each site',
      'Add Measurement IDs to site config',
      'Deploy tracking scripts to sites'
    ]
  },
  searchConsole: {
    status: 'ready',
    description: 'GSC setup instructions and sitemap generation ready',
    nextSteps: [
      'Verify each domain in GSC',
      'Submit sitemaps',
      'Link GSC to GA4'
    ]
  },
  customEvents: {
    status: 'ready',
    description: 'Custom event tracking defined and ready',
    nextSteps: [
      'Deploy event tracking code to sites',
      'Configure conversions in GA4',
      'Set up custom dimensions'
    ]
  },
  dashboard: {
    status: 'ready',
    description: 'Dashboard data structures defined',
    nextSteps: [
      'Build dashboard UI',
      'Connect to GA4 Data API',
      'Set up automated reporting'
    ]
  }
};

export default {
  generateSiteAnalyticsSetup,
  generateAllAnalyticsSetup,
  implementationStatus
};
