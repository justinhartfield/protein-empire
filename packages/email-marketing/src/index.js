/**
 * Protein Empire Email Marketing Automation
 * 
 * This package provides email marketing automation including:
 * - Welcome sequences for new subscribers
 * - Weekly newsletters
 * - Recipe roundups
 * - Cross-site promotions
 * - Re-engagement campaigns
 * 
 * Usage:
 *   import { 
 *     generateSiteWelcomeSequence,
 *     generateSiteNewsletter,
 *     generateCrossPromoEmail 
 *   } from '@protein-empire/email-marketing';
 * 
 * @module @protein-empire/email-marketing
 */

// Export welcome sequence functions
export {
  generateSiteWelcomeSequence,
  generateAllWelcomeSequences,
  exportToSendGridFormat,
  exportToConvertKitFormat,
  exportToMailerLiteFormat,
  generateDynamicTemplateData
} from './welcome-sequence.js';

// Export newsletter functions
export {
  generateSiteNewsletter,
  generateEmpireNewsletter,
  generateRecipeRoundup,
  generateMonthlySchedule
} from './newsletter.js';

// Export cross-promotion functions
export {
  generateCrossPromoEmail,
  generateEmpireAnnouncementEmail,
  generateCrossPromoSchedule,
  generateReEngagementEmail
} from './cross-promo.js';

// Export templates
export * from './templates/index.js';

// Import for combined generation
import { generateAllWelcomeSequences } from './welcome-sequence.js';
import { generateMonthlySchedule, generateEmpireNewsletter } from './newsletter.js';
import { generateCrossPromoSchedule, generateEmpireAnnouncementEmail } from './cross-promo.js';

/**
 * Generate complete email marketing package for a site
 * @param {Object} siteConfig - Site configuration
 * @param {Object[]} recipes - Site recipes
 * @param {Object[]} empireSites - All empire sites
 * @param {Object} recipesByDomain - Recipes by domain for cross-promo
 * @returns {Object} - Complete email marketing package
 */
export function generateSiteEmailPackage(siteConfig, recipes, empireSites, recipesByDomain = {}) {
  return {
    site: siteConfig.domain,
    siteName: siteConfig.name,
    generatedAt: new Date().toISOString(),
    welcomeSequence: generateAllWelcomeSequences({ [siteConfig.domain]: siteConfig }, empireSites)[siteConfig.domain],
    newsletterSchedule: generateMonthlySchedule(siteConfig, recipes, empireSites),
    crossPromoSchedule: generateCrossPromoSchedule(siteConfig, empireSites, recipesByDomain),
    empireAnnouncement: generateEmpireAnnouncementEmail({
      sourceSite: siteConfig,
      empireSites
    })
  };
}

/**
 * Generate complete email marketing package for the entire empire
 * @param {Object} sites - All site configurations
 * @param {Object[]} empireSites - Empire sites array
 * @param {Object} recipesByDomain - Recipes organized by domain
 * @returns {Object} - Complete empire email package
 */
export function generateEmpireEmailPackage(sites, empireSites, recipesByDomain) {
  const package_ = {
    generatedAt: new Date().toISOString(),
    sites: {},
    empireNewsletter: generateEmpireNewsletter(sites, recipesByDomain)
  };

  Object.entries(sites).forEach(([domain, siteConfig]) => {
    if (siteConfig.isIndexer) return;

    const recipes = recipesByDomain[domain] || [];
    package_.sites[domain] = generateSiteEmailPackage(
      siteConfig,
      recipes,
      empireSites,
      recipesByDomain
    );
  });

  return package_;
}

/**
 * Email campaign types
 */
export const CampaignTypes = {
  WELCOME_SEQUENCE: 'welcome_sequence',
  WEEKLY_NEWSLETTER: 'weekly_newsletter',
  RECIPE_ROUNDUP: 'recipe_roundup',
  CROSS_PROMOTION: 'cross_promotion',
  EMPIRE_ANNOUNCEMENT: 'empire_announcement',
  RE_ENGAGEMENT: 're_engagement'
};

/**
 * Email sending schedule recommendations
 */
export const SendingSchedule = {
  welcomeSequence: {
    email1: { delay: 0, description: 'Immediate - PDF delivery' },
    email2: { delay: 2, description: 'Day 2 - Welcome story' },
    email3: { delay: 4, description: 'Day 4 - Tips and tricks' },
    email4: { delay: 6, description: 'Day 6 - Cross-promotion' },
    email5: { delay: 8, description: 'Day 8 - Social proof' }
  },
  newsletter: {
    frequency: 'weekly',
    bestDay: 'Sunday',
    bestTime: '10:00 AM',
    timezone: 'subscriber_local'
  },
  crossPromo: {
    frequency: 'monthly',
    afterWelcomeSequence: true,
    rotateTargetSites: true
  }
};

export default {
  generateSiteEmailPackage,
  generateEmpireEmailPackage,
  CampaignTypes,
  SendingSchedule
};
