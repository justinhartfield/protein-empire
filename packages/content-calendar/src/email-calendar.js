/**
 * Email Marketing Calendar for the Protein Empire
 * 
 * Schedules newsletters, welcome sequences, and promotional emails.
 * Coordinates email campaigns across all empire sites.
 */

/**
 * Email campaign types
 */
export const EmailCampaignTypes = {
  WELCOME_SEQUENCE: 'welcome_sequence',
  WEEKLY_NEWSLETTER: 'weekly_newsletter',
  RECIPE_ROUNDUP: 'recipe_roundup',
  CROSS_PROMOTION: 'cross_promotion',
  SEASONAL: 'seasonal',
  RE_ENGAGEMENT: 're_engagement',
  ANNOUNCEMENT: 'announcement'
};

/**
 * Email sending schedule configuration
 */
export const emailScheduleConfig = {
  newsletter: {
    frequency: 'weekly',
    sendDay: 'sunday',
    sendTime: '10:00',
    timezone: 'America/New_York'
  },
  welcomeSequence: {
    emails: [
      { day: 0, time: 'immediate', name: 'PDF Delivery' },
      { day: 2, time: '10:00', name: 'Welcome Story' },
      { day: 4, time: '10:00', name: 'Tips & Tricks' },
      { day: 6, time: '10:00', name: 'Cross-Promotion' },
      { day: 8, time: '10:00', name: 'Social Proof' }
    ]
  },
  crossPromotion: {
    frequency: 'monthly',
    sendDay: 'wednesday',
    sendTime: '14:00',
    afterWelcomeComplete: true
  },
  seasonal: {
    leadTime: 7, // Days before holiday
    sendTime: '10:00'
  }
};

/**
 * Seasonal email campaigns
 */
export const seasonalCampaigns = {
  newYear: {
    name: 'New Year, New Recipes',
    sendDate: 'january-02',
    theme: 'fitness goals',
    subject: '🎯 Start the Year Strong with High-Protein Recipes'
  },
  valentines: {
    name: 'Valentine\'s Day Treats',
    sendDate: 'february-12',
    theme: 'chocolate treats',
    subject: '💝 Healthy Valentine\'s Treats They\'ll Love'
  },
  easter: {
    name: 'Easter Baking',
    sendDate: 'dynamic', // Calculate based on Easter date
    theme: 'spring treats',
    subject: '🐰 Protein-Packed Easter Treats'
  },
  summer: {
    name: 'Summer Recipe Collection',
    sendDate: 'june-01',
    theme: 'no-bake recipes',
    subject: '☀️ Cool Summer Treats (No Oven Required!)'
  },
  backToSchool: {
    name: 'Back to School Meal Prep',
    sendDate: 'august-15',
    theme: 'meal prep',
    subject: '📚 Meal Prep Made Easy for Busy Days'
  },
  halloween: {
    name: 'Halloween Treats',
    sendDate: 'october-25',
    theme: 'spooky treats',
    subject: '🎃 Healthy Halloween Treats'
  },
  thanksgiving: {
    name: 'Thanksgiving Recipes',
    sendDate: 'dynamic', // Week before Thanksgiving
    theme: 'holiday baking',
    subject: '🦃 Guilt-Free Thanksgiving Desserts'
  },
  christmas: {
    name: 'Holiday Baking Guide',
    sendDate: 'december-15',
    theme: 'holiday treats',
    subject: '🎄 Your Holiday Baking Guide'
  }
};

/**
 * Generate email calendar for a month
 * @param {Object} options - Calendar options
 * @returns {Object} - Monthly email calendar
 */
export function generateMonthlyEmailCalendar(options) {
  const {
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    sites = [],
    includeSeasonalCampaigns = true
  } = options;

  const calendar = {
    year,
    month,
    monthName: new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' }),
    campaigns: []
  };

  // Add weekly newsletters for each site
  const sundays = getSundaysInMonth(year, month);
  sundays.forEach((sunday, weekIndex) => {
    sites.forEach(site => {
      if (site.isIndexer) return;
      
      calendar.campaigns.push({
        id: `newsletter-${site.domain}-week${weekIndex + 1}`,
        type: EmailCampaignTypes.WEEKLY_NEWSLETTER,
        site: site.domain,
        siteName: site.name,
        sendDate: sunday,
        sendTime: emailScheduleConfig.newsletter.sendTime,
        subject: `🍪 This Week at ${site.name}`,
        status: 'scheduled',
        notes: [
          'Feature recipe of the week',
          'Include 3 additional recipes',
          'Add weekly tip',
          'Cross-promote one sister site'
        ]
      });
    });
  });

  // Add seasonal campaigns if applicable
  if (includeSeasonalCampaigns) {
    const monthName = calendar.monthName.toLowerCase();
    Object.entries(seasonalCampaigns).forEach(([key, campaign]) => {
      if (campaign.sendDate.startsWith(monthName.substring(0, 3)) || 
          campaign.sendDate.includes(monthName)) {
        
        const sendDate = parseCampaignDate(campaign.sendDate, year, month);
        if (sendDate) {
          sites.forEach(site => {
            if (site.isIndexer) return;
            
            calendar.campaigns.push({
              id: `seasonal-${key}-${site.domain}`,
              type: EmailCampaignTypes.SEASONAL,
              site: site.domain,
              siteName: site.name,
              campaignName: campaign.name,
              sendDate,
              sendTime: emailScheduleConfig.seasonal.sendTime,
              subject: campaign.subject,
              theme: campaign.theme,
              status: 'draft',
              notes: [
                `Theme: ${campaign.theme}`,
                'Create themed recipe collection',
                'Update subject line for site'
              ]
            });
          });
        }
      }
    });
  }

  // Add cross-promotion campaigns (one per site per month)
  const crossPromoDay = getFirstDayOfWeek(year, month, 'wednesday');
  sites.forEach((site, index) => {
    if (site.isIndexer) return;
    
    // Rotate target sites
    const targetSites = sites.filter(s => s.domain !== site.domain && !s.isIndexer);
    const targetSite = targetSites[index % targetSites.length];
    
    if (targetSite) {
      calendar.campaigns.push({
        id: `crosspromo-${site.domain}-${month}`,
        type: EmailCampaignTypes.CROSS_PROMOTION,
        site: site.domain,
        siteName: site.name,
        targetSite: targetSite.domain,
        targetSiteName: targetSite.name,
        sendDate: crossPromoDay,
        sendTime: emailScheduleConfig.crossPromotion.sendTime,
        subject: `🌟 Discover ${targetSite.name}!`,
        status: 'draft',
        notes: [
          `Promote ${targetSite.name} to ${site.name} subscribers`,
          'Include 3 featured recipes from target site',
          'Highlight free recipe pack'
        ]
      });
    }
  });

  // Sort campaigns by date
  calendar.campaigns.sort((a, b) => {
    const dateCompare = a.sendDate.localeCompare(b.sendDate);
    if (dateCompare !== 0) return dateCompare;
    return a.sendTime.localeCompare(b.sendTime);
  });

  // Add summary
  calendar.summary = {
    totalCampaigns: calendar.campaigns.length,
    byType: {
      newsletters: calendar.campaigns.filter(c => c.type === EmailCampaignTypes.WEEKLY_NEWSLETTER).length,
      seasonal: calendar.campaigns.filter(c => c.type === EmailCampaignTypes.SEASONAL).length,
      crossPromo: calendar.campaigns.filter(c => c.type === EmailCampaignTypes.CROSS_PROMOTION).length
    },
    bySite: sites.reduce((acc, site) => {
      if (!site.isIndexer) {
        acc[site.domain] = calendar.campaigns.filter(c => c.site === site.domain).length;
      }
      return acc;
    }, {})
  };

  return calendar;
}

/**
 * Generate annual email calendar
 * @param {Object} options - Calendar options
 * @returns {Object} - Annual email calendar
 */
export function generateAnnualEmailCalendar(options) {
  const {
    year = new Date().getFullYear(),
    sites = []
  } = options;

  const calendar = {
    year,
    months: []
  };

  for (let month = 1; month <= 12; month++) {
    calendar.months.push(generateMonthlyEmailCalendar({
      year,
      month,
      sites
    }));
  }

  // Add annual summary
  calendar.summary = {
    totalCampaigns: calendar.months.reduce((sum, m) => sum + m.campaigns.length, 0),
    byMonth: calendar.months.map(m => ({
      month: m.monthName,
      total: m.campaigns.length
    })),
    byType: {
      newsletters: calendar.months.reduce((sum, m) => sum + m.summary.byType.newsletters, 0),
      seasonal: calendar.months.reduce((sum, m) => sum + m.summary.byType.seasonal, 0),
      crossPromo: calendar.months.reduce((sum, m) => sum + m.summary.byType.crossPromo, 0)
    }
  };

  return calendar;
}

/**
 * Get all Sundays in a month
 */
function getSundaysInMonth(year, month) {
  const sundays = [];
  const date = new Date(year, month - 1, 1);
  
  // Find first Sunday
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1);
  }
  
  // Get all Sundays
  while (date.getMonth() === month - 1) {
    sundays.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 7);
  }
  
  return sundays;
}

/**
 * Get first occurrence of a day in a month
 */
function getFirstDayOfWeek(year, month, dayName) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(dayName.toLowerCase());
  const date = new Date(year, month - 1, 1);
  
  while (date.getDay() !== targetDay) {
    date.setDate(date.getDate() + 1);
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Parse campaign date string
 */
function parseCampaignDate(dateStr, year, month) {
  if (dateStr === 'dynamic') {
    return null; // Handle dynamic dates separately
  }
  
  const [monthPart, day] = dateStr.split('-');
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'];
  const monthIndex = monthNames.findIndex(m => m.startsWith(monthPart));
  
  if (monthIndex === month - 1) {
    return `${year}-${String(month).padStart(2, '0')}-${day}`;
  }
  
  return null;
}

/**
 * Export email calendar to CSV
 * @param {Object} calendar - Email calendar
 * @returns {string} - CSV content
 */
export function exportEmailCalendarToCSV(calendar) {
  const headers = ['Date', 'Time', 'Site', 'Type', 'Subject', 'Target Site', 'Status', 'Notes'];
  const rows = [headers.join(',')];

  const campaigns = calendar.campaigns || 
    calendar.months?.flatMap(m => m.campaigns) || [];

  campaigns.forEach(campaign => {
    const row = [
      campaign.sendDate,
      campaign.sendTime,
      campaign.siteName,
      campaign.type,
      `"${campaign.subject}"`,
      campaign.targetSiteName || '',
      campaign.status,
      `"${campaign.notes?.join('; ') || ''}"`
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

/**
 * Generate email campaign checklist
 * @param {Object} campaign - Campaign object
 * @returns {Object} - Checklist items
 */
export function generateCampaignChecklist(campaign) {
  const baseChecklist = [
    { task: 'Write subject line', completed: false },
    { task: 'Write preheader text', completed: false },
    { task: 'Create email content', completed: false },
    { task: 'Add images', completed: false },
    { task: 'Check all links', completed: false },
    { task: 'Test on mobile', completed: false },
    { task: 'Send test email', completed: false },
    { task: 'Schedule campaign', completed: false }
  ];

  if (campaign.type === EmailCampaignTypes.WEEKLY_NEWSLETTER) {
    return [
      { task: 'Select featured recipe', completed: false },
      { task: 'Select 3 additional recipes', completed: false },
      { task: 'Write weekly tip', completed: false },
      { task: 'Select cross-promo site', completed: false },
      ...baseChecklist
    ];
  }

  if (campaign.type === EmailCampaignTypes.CROSS_PROMOTION) {
    return [
      { task: 'Select 3 recipes from target site', completed: false },
      { task: 'Write compelling intro', completed: false },
      { task: 'Highlight free recipe pack', completed: false },
      ...baseChecklist
    ];
  }

  if (campaign.type === EmailCampaignTypes.SEASONAL) {
    return [
      { task: 'Create themed recipe collection', completed: false },
      { task: 'Design seasonal graphics', completed: false },
      { task: 'Write seasonal copy', completed: false },
      ...baseChecklist
    ];
  }

  return baseChecklist;
}

export default {
  EmailCampaignTypes,
  emailScheduleConfig,
  seasonalCampaigns,
  generateMonthlyEmailCalendar,
  generateAnnualEmailCalendar,
  exportEmailCalendarToCSV,
  generateCampaignChecklist
};
