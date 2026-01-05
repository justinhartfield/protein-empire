/**
 * Protein Empire Marketing Dashboard
 * 
 * Centralized marketing management for the Protein Empire.
 * Integrates social media, email marketing, analytics, and content calendar.
 * 
 * @module @protein-empire/marketing-dashboard
 */

// Re-export all marketing packages for convenience
export * from '@protein-empire/social-media';
export * from '@protein-empire/email-marketing';
export * from '@protein-empire/analytics';
export * from '@protein-empire/content-calendar';

/**
 * Dashboard configuration
 */
export const dashboardConfig = {
  name: 'Protein Empire Marketing Dashboard',
  version: '1.0.0',
  features: [
    'Social Media Management',
    'Email Marketing Automation',
    'Analytics & Reporting',
    'Content Calendar',
    'Cross-Site Promotion'
  ],
  integrations: {
    email: ['SendGrid', 'ConvertKit', 'MailerLite'],
    social: ['Pinterest', 'Instagram', 'TikTok', 'Facebook'],
    analytics: ['Google Analytics 4', 'Google Search Console'],
    scheduling: ['Buffer', 'Hootsuite', 'Later']
  }
};

/**
 * Quick actions available from dashboard
 */
export const quickActions = {
  generateSocialContent: {
    name: 'Generate Social Content',
    description: 'Create Pinterest pins, Instagram posts, and more for all recipes',
    module: '@protein-empire/social-media'
  },
  sendNewsletter: {
    name: 'Send Newsletter',
    description: 'Send weekly newsletter to all subscribers',
    module: '@protein-empire/email-marketing'
  },
  viewCalendar: {
    name: 'View Calendar',
    description: 'See upcoming posts, emails, and content schedule',
    module: '@protein-empire/content-calendar'
  },
  generateReport: {
    name: 'Generate Report',
    description: 'Create weekly performance report',
    module: '@protein-empire/analytics'
  },
  crossPromotion: {
    name: 'Cross-Promotion',
    description: 'Promote sister sites to existing subscribers',
    module: '@protein-empire/email-marketing'
  }
};

/**
 * Dashboard widgets configuration
 */
export const widgets = {
  metrics: [
    { id: 'users', label: 'Total Users', icon: 'users', color: 'blue' },
    { id: 'signups', label: 'Email Signups', icon: 'envelope-open', color: 'green' },
    { id: 'downloads', label: 'PDF Downloads', icon: 'file-pdf', color: 'purple' },
    { id: 'engagement', label: 'Social Engagement', icon: 'heart', color: 'amber' }
  ],
  charts: [
    { id: 'traffic-by-site', type: 'bar', title: 'Traffic by Site' },
    { id: 'traffic-sources', type: 'doughnut', title: 'Traffic Sources' },
    { id: 'signups-trend', type: 'line', title: 'Signups Trend' }
  ],
  tables: [
    { id: 'top-recipes', title: 'Top Performing Recipes' },
    { id: 'recent-signups', title: 'Recent Signups' },
    { id: 'scheduled-posts', title: 'Scheduled Posts' }
  ]
};

export default {
  dashboardConfig,
  quickActions,
  widgets
};
