/**
 * Welcome Sequence Generator for the Protein Empire
 * 
 * Generates complete welcome email sequences for each site,
 * ready to be imported into SendGrid, ConvertKit, or MailerLite.
 */

import { generateWelcomeSequence } from './templates/welcome-sequence.js';

/**
 * Generate welcome sequence for a specific site
 * @param {Object} siteConfig - Site configuration
 * @param {Object} options - Additional options
 * @returns {Object} - Complete welcome sequence
 */
export function generateSiteWelcomeSequence(siteConfig, options = {}) {
  const {
    packName = `${siteConfig.name} Starter Pack`,
    downloadUrl = `https://${siteConfig.domain}/downloads/starter-pack.pdf`,
    empireSites = []
  } = options;

  return generateWelcomeSequence({
    siteName: siteConfig.name,
    brandColor: siteConfig.brandColor || '#f59e0b',
    foodType: siteConfig.foodType,
    domain: siteConfig.domain,
    packName,
    downloadUrl,
    empireSites
  });
}

/**
 * Generate welcome sequences for all sites
 * @param {Object} sites - All site configurations
 * @param {Object[]} empireSites - Empire sites array
 * @returns {Object} - Welcome sequences by domain
 */
export function generateAllWelcomeSequences(sites, empireSites) {
  const sequences = {};

  Object.entries(sites).forEach(([domain, siteConfig]) => {
    if (siteConfig.isIndexer) return; // Skip indexer site

    sequences[domain] = generateSiteWelcomeSequence(siteConfig, {
      empireSites
    });
  });

  return sequences;
}

/**
 * Export welcome sequence to SendGrid format
 * @param {Object} sequence - Welcome sequence object
 * @returns {Object} - SendGrid automation format
 */
export function exportToSendGridFormat(sequence) {
  return {
    name: sequence.sequenceName,
    trigger: {
      type: 'list_entry',
      description: 'Triggered when contact is added to list'
    },
    steps: sequence.emails.map((email, index) => ({
      action: 'send_email',
      delay: index === 0 ? '0' : `${email.dayNumber} days`,
      email: {
        subject: email.subject,
        preheader: email.preheader,
        html_content: email.html,
        plain_content: email.plainText
      }
    }))
  };
}

/**
 * Export welcome sequence to ConvertKit format
 * @param {Object} sequence - Welcome sequence object
 * @returns {Object} - ConvertKit sequence format
 */
export function exportToConvertKitFormat(sequence) {
  return {
    name: sequence.sequenceName,
    emails: sequence.emails.map((email, index) => ({
      subject: email.subject,
      content: email.html,
      send_at: index === 0 ? 'immediately' : `day_${email.dayNumber}`,
      published: true
    }))
  };
}

/**
 * Export welcome sequence to MailerLite format
 * @param {Object} sequence - Welcome sequence object
 * @returns {Object} - MailerLite automation format
 */
export function exportToMailerLiteFormat(sequence) {
  return {
    name: sequence.sequenceName,
    trigger: 'subscriber_joins_group',
    steps: sequence.emails.map((email, index) => ({
      type: 'email',
      delay: {
        value: email.dayNumber,
        unit: 'days'
      },
      email: {
        subject: email.subject,
        content: {
          html: email.html,
          plain: email.plainText
        }
      }
    }))
  };
}

/**
 * Generate SendGrid dynamic template data
 * @param {Object} siteConfig - Site configuration
 * @param {Object} subscriber - Subscriber data
 * @returns {Object} - Dynamic template data
 */
export function generateDynamicTemplateData(siteConfig, subscriber) {
  return {
    site_name: siteConfig.name,
    brand_color: siteConfig.brandColor,
    food_type: siteConfig.foodType,
    domain: siteConfig.domain,
    first_name: subscriber.firstName || 'there',
    email: subscriber.email,
    download_url: subscriber.downloadUrl || `https://${siteConfig.domain}/downloads/starter-pack.pdf`,
    pack_name: subscriber.packName || `${siteConfig.name} Starter Pack`,
    unsubscribe_url: '{{unsubscribe_url}}',
    current_year: new Date().getFullYear()
  };
}

export default {
  generateSiteWelcomeSequence,
  generateAllWelcomeSequences,
  exportToSendGridFormat,
  exportToConvertKitFormat,
  exportToMailerLiteFormat,
  generateDynamicTemplateData
};
