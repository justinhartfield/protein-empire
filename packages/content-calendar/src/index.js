/**
 * Protein Empire Content Calendar Package
 * 
 * Provides content planning and scheduling for:
 * - Social media posts (Pinterest, Instagram, TikTok, Facebook)
 * - Email campaigns (newsletters, welcome sequences, promotions)
 * - Content publishing (new recipes, updates, SEO)
 * 
 * @module @protein-empire/content-calendar
 */

// Social media calendar exports
export {
  platformSchedules,
  ContentTypes as SocialContentTypes,
  seasonalThemes,
  generateWeeklyCalendar as generateWeeklySocialCalendar,
  generateMonthlyCalendar,
  exportToCSV as exportSocialToCSV,
  exportForTool
} from './social-calendar.js';

// Email calendar exports
export {
  EmailCampaignTypes,
  emailScheduleConfig,
  seasonalCampaigns,
  generateMonthlyEmailCalendar,
  generateAnnualEmailCalendar,
  exportEmailCalendarToCSV,
  generateCampaignChecklist
} from './email-calendar.js';

// Content calendar exports
export {
  ContentTypes,
  publishingConfig,
  monthlyThemes,
  generateMonthlyContentCalendar,
  generateQuarterlyPlan,
  exportContentCalendarToCSV,
  generateContentIdeas
} from './content-calendar.js';

// Import for combined functions
import { generateMonthlyCalendar as generateMonthlySocialCalendar } from './social-calendar.js';
import { generateMonthlyEmailCalendar } from './email-calendar.js';
import { generateMonthlyContentCalendar } from './content-calendar.js';

/**
 * Generate complete monthly marketing calendar
 * @param {Object} options - Calendar options
 * @returns {Object} - Complete marketing calendar
 */
export function generateCompleteMonthlyCalendar(options) {
  const {
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    sites = [],
    recipes = {},
    topPerformers = {}
  } = options;

  return {
    year,
    month,
    monthName: new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' }),
    generatedAt: new Date().toISOString(),
    
    // Social media calendar
    social: sites.reduce((acc, site) => {
      if (!site.isIndexer) {
        acc[site.domain] = generateMonthlySocialCalendar({
          year,
          month,
          site,
          recipes: recipes[site.domain] || [],
          topPerformers: topPerformers[site.domain] || []
        });
      }
      return acc;
    }, {}),
    
    // Email calendar
    email: generateMonthlyEmailCalendar({
      year,
      month,
      sites
    }),
    
    // Content calendar
    content: generateMonthlyContentCalendar({
      year,
      month,
      sites,
      existingRecipes: recipes
    }),
    
    // Summary
    summary: {
      totalSocialPosts: 0, // Will be calculated
      totalEmails: 0,
      totalContentItems: 0
    }
  };
}

/**
 * Generate master calendar view (all activities)
 * @param {Object} calendar - Complete calendar
 * @returns {Object[]} - Unified calendar items
 */
export function generateMasterCalendarView(calendar) {
  const items = [];

  // Add social media posts
  Object.entries(calendar.social || {}).forEach(([domain, socialCal]) => {
    socialCal.weeks?.forEach(week => {
      Object.entries(week.platforms).forEach(([platform, platformData]) => {
        platformData.posts?.forEach(post => {
          items.push({
            date: post.date,
            time: post.time,
            type: 'social',
            platform,
            site: domain,
            title: post.recipe?.title || post.contentType,
            status: post.status
          });
        });
      });
    });
  });

  // Add email campaigns
  calendar.email?.campaigns?.forEach(campaign => {
    items.push({
      date: campaign.sendDate,
      time: campaign.sendTime,
      type: 'email',
      platform: 'email',
      site: campaign.site,
      title: campaign.subject,
      status: campaign.status
    });
  });

  // Add content items
  calendar.content?.items?.forEach(item => {
    items.push({
      date: item.publishDate,
      time: item.publishTime || '09:00',
      type: 'content',
      platform: 'website',
      site: item.site,
      title: item.type === 'new_recipe' ? 'New Recipe' : item.type,
      status: item.status
    });
  });

  // Sort by date and time
  items.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  return items;
}

/**
 * Export master calendar to various formats
 * @param {Object[]} items - Master calendar items
 * @param {string} format - Export format
 * @returns {string} - Exported content
 */
export function exportMasterCalendar(items, format = 'csv') {
  if (format === 'csv') {
    const headers = ['Date', 'Time', 'Type', 'Platform', 'Site', 'Title', 'Status'];
    const rows = [headers.join(',')];
    
    items.forEach(item => {
      rows.push([
        item.date,
        item.time,
        item.type,
        item.platform,
        item.site,
        `"${item.title}"`,
        item.status
      ].join(','));
    });
    
    return rows.join('\n');
  }

  if (format === 'ical') {
    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Protein Empire//Content Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    items.forEach((item, index) => {
      const dtstart = `${item.date.replace(/-/g, '')}T${item.time.replace(':', '')}00`;
      const dtend = `${item.date.replace(/-/g, '')}T${item.time.replace(':', '')}30`;
      
      ical += `BEGIN:VEVENT
UID:${index}-${item.date}@proteinempire.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${item.type.toUpperCase()}: ${item.title}
DESCRIPTION:Platform: ${item.platform}\\nSite: ${item.site}\\nStatus: ${item.status}
END:VEVENT
`;
    });

    ical += 'END:VCALENDAR';
    return ical;
  }

  return JSON.stringify(items, null, 2);
}

/**
 * Calendar statistics
 */
export function getCalendarStats(calendar) {
  const stats = {
    social: {
      total: 0,
      byPlatform: {},
      bySite: {}
    },
    email: {
      total: calendar.email?.campaigns?.length || 0,
      byType: {},
      bySite: {}
    },
    content: {
      total: calendar.content?.items?.length || 0,
      byType: {},
      bySite: {}
    }
  };

  // Calculate social stats
  Object.entries(calendar.social || {}).forEach(([domain, socialCal]) => {
    let siteTotal = 0;
    socialCal.weeks?.forEach(week => {
      Object.entries(week.platforms).forEach(([platform, platformData]) => {
        const count = platformData.posts?.length || 0;
        stats.social.total += count;
        siteTotal += count;
        stats.social.byPlatform[platform] = (stats.social.byPlatform[platform] || 0) + count;
      });
    });
    stats.social.bySite[domain] = siteTotal;
  });

  // Calculate email stats
  calendar.email?.campaigns?.forEach(campaign => {
    stats.email.byType[campaign.type] = (stats.email.byType[campaign.type] || 0) + 1;
    stats.email.bySite[campaign.site] = (stats.email.bySite[campaign.site] || 0) + 1;
  });

  // Calculate content stats
  calendar.content?.items?.forEach(item => {
    stats.content.byType[item.type] = (stats.content.byType[item.type] || 0) + 1;
    stats.content.bySite[item.site] = (stats.content.bySite[item.site] || 0) + 1;
  });

  return stats;
}

export default {
  generateCompleteMonthlyCalendar,
  generateMasterCalendarView,
  exportMasterCalendar,
  getCalendarStats
};
