/**
 * Content Publishing Calendar for the Protein Empire
 * 
 * Schedules new recipe publishing, content updates, and site maintenance.
 * Coordinates content across all empire sites.
 */

/**
 * Content types
 */
export const ContentTypes = {
  NEW_RECIPE: 'new_recipe',
  RECIPE_UPDATE: 'recipe_update',
  CATEGORY_PAGE: 'category_page',
  LANDING_PAGE: 'landing_page',
  BLOG_POST: 'blog_post',
  PDF_UPDATE: 'pdf_update',
  SEO_UPDATE: 'seo_update'
};

/**
 * Publishing frequency configuration
 */
export const publishingConfig = {
  newRecipes: {
    frequency: 'weekly',
    perSite: 2, // New recipes per site per week
    bestDays: ['monday', 'thursday'],
    publishTime: '09:00'
  },
  recipeUpdates: {
    frequency: 'monthly',
    perSite: 5, // Updates per site per month
    focus: ['seo', 'images', 'nutrition']
  },
  pdfUpdates: {
    frequency: 'quarterly',
    updateAll: true
  },
  seoAudits: {
    frequency: 'monthly',
    checkItems: [
      'meta descriptions',
      'title tags',
      'internal links',
      'image alt text',
      'schema markup'
    ]
  }
};

/**
 * Content themes by month
 */
export const monthlyThemes = {
  january: {
    theme: 'New Year Health Goals',
    focus: ['high protein', 'low calorie', 'meal prep'],
    keywords: ['healthy new year recipes', 'protein meal prep', 'fitness recipes']
  },
  february: {
    theme: 'Valentine\'s Day',
    focus: ['chocolate', 'romantic', 'date night'],
    keywords: ['healthy valentine recipes', 'protein chocolate recipes']
  },
  march: {
    theme: 'Spring Fresh',
    focus: ['light', 'fresh', 'seasonal'],
    keywords: ['spring recipes', 'light protein recipes']
  },
  april: {
    theme: 'Easter & Spring',
    focus: ['easter', 'spring baking', 'family'],
    keywords: ['healthy easter recipes', 'protein easter treats']
  },
  may: {
    theme: 'Summer Prep',
    focus: ['summer body', 'outdoor', 'quick'],
    keywords: ['summer protein recipes', 'quick healthy recipes']
  },
  june: {
    theme: 'Summer Treats',
    focus: ['no-bake', 'refreshing', 'easy'],
    keywords: ['no bake protein recipes', 'summer treats']
  },
  july: {
    theme: 'Independence Day',
    focus: ['bbq', 'patriotic', 'outdoor'],
    keywords: ['healthy bbq recipes', '4th of july recipes']
  },
  august: {
    theme: 'Back to School',
    focus: ['meal prep', 'lunchbox', 'quick'],
    keywords: ['back to school recipes', 'healthy lunchbox ideas']
  },
  september: {
    theme: 'Fall Flavors',
    focus: ['pumpkin', 'apple', 'cinnamon'],
    keywords: ['protein pumpkin recipes', 'healthy fall recipes']
  },
  october: {
    theme: 'Halloween',
    focus: ['spooky', 'fun', 'kid-friendly'],
    keywords: ['healthy halloween recipes', 'protein halloween treats']
  },
  november: {
    theme: 'Thanksgiving',
    focus: ['holiday', 'comfort', 'family'],
    keywords: ['healthy thanksgiving recipes', 'protein thanksgiving desserts']
  },
  december: {
    theme: 'Holiday Season',
    focus: ['christmas', 'gifts', 'festive'],
    keywords: ['healthy christmas recipes', 'protein holiday treats']
  }
};

/**
 * Generate content calendar for a month
 * @param {Object} options - Calendar options
 * @returns {Object} - Monthly content calendar
 */
export function generateMonthlyContentCalendar(options) {
  const {
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    sites = [],
    existingRecipes = {}
  } = options;

  const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const theme = monthlyThemes[monthName];

  const calendar = {
    year,
    month,
    monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    theme: theme?.theme,
    focus: theme?.focus,
    keywords: theme?.keywords,
    items: []
  };

  // Schedule new recipes for each site
  const publishDays = getPublishDaysInMonth(year, month, publishingConfig.newRecipes.bestDays);
  
  sites.forEach(site => {
    if (site.isIndexer) return;

    // Distribute recipes across publish days
    publishDays.forEach((day, index) => {
      if (index < publishingConfig.newRecipes.perSite * 4) { // 4 weeks
        calendar.items.push({
          id: `recipe-${site.domain}-${day}`,
          type: ContentTypes.NEW_RECIPE,
          site: site.domain,
          siteName: site.name,
          publishDate: day,
          publishTime: publishingConfig.newRecipes.publishTime,
          status: 'planned',
          theme: theme?.focus[index % theme.focus.length],
          notes: [
            `Create new ${site.foodType} recipe`,
            `Focus: ${theme?.focus[index % theme.focus.length]}`,
            'Include full nutrition info',
            'Create social media assets'
          ],
          checklist: generateRecipeChecklist()
        });
      }
    });

    // Schedule recipe updates
    const updateCount = Math.min(
      publishingConfig.recipeUpdates.perSite,
      (existingRecipes[site.domain] || []).length
    );
    
    for (let i = 0; i < updateCount; i++) {
      const updateDay = getRandomDayInMonth(year, month);
      calendar.items.push({
        id: `update-${site.domain}-${i}`,
        type: ContentTypes.RECIPE_UPDATE,
        site: site.domain,
        siteName: site.name,
        publishDate: updateDay,
        status: 'planned',
        notes: [
          'Update SEO elements',
          'Refresh images if needed',
          'Check internal links',
          'Update schema markup'
        ]
      });
    }
  });

  // Schedule monthly SEO audit
  const lastDay = new Date(year, month, 0).toISOString().split('T')[0];
  calendar.items.push({
    id: `seo-audit-${month}`,
    type: ContentTypes.SEO_UPDATE,
    site: 'all',
    siteName: 'All Sites',
    publishDate: lastDay,
    status: 'planned',
    notes: publishingConfig.seoAudits.checkItems.map(item => `Check: ${item}`)
  });

  // Sort by date
  calendar.items.sort((a, b) => a.publishDate.localeCompare(b.publishDate));

  // Add summary
  calendar.summary = {
    totalItems: calendar.items.length,
    byType: {
      newRecipes: calendar.items.filter(i => i.type === ContentTypes.NEW_RECIPE).length,
      updates: calendar.items.filter(i => i.type === ContentTypes.RECIPE_UPDATE).length,
      seoAudits: calendar.items.filter(i => i.type === ContentTypes.SEO_UPDATE).length
    },
    bySite: sites.reduce((acc, site) => {
      if (!site.isIndexer) {
        acc[site.domain] = calendar.items.filter(i => i.site === site.domain).length;
      }
      return acc;
    }, {})
  };

  return calendar;
}

/**
 * Generate quarterly content plan
 * @param {Object} options - Plan options
 * @returns {Object} - Quarterly content plan
 */
export function generateQuarterlyPlan(options) {
  const {
    year = new Date().getFullYear(),
    quarter = Math.ceil((new Date().getMonth() + 1) / 3),
    sites = []
  } = options;

  const startMonth = (quarter - 1) * 3 + 1;
  const months = [];

  for (let i = 0; i < 3; i++) {
    months.push(generateMonthlyContentCalendar({
      year,
      month: startMonth + i,
      sites
    }));
  }

  return {
    year,
    quarter,
    quarterName: `Q${quarter} ${year}`,
    months,
    summary: {
      totalItems: months.reduce((sum, m) => sum + m.items.length, 0),
      newRecipes: months.reduce((sum, m) => sum + m.summary.byType.newRecipes, 0),
      updates: months.reduce((sum, m) => sum + m.summary.byType.updates, 0)
    },
    goals: generateQuarterlyGoals(quarter, sites)
  };
}

/**
 * Generate quarterly goals
 */
function generateQuarterlyGoals(quarter, sites) {
  const activeSites = sites.filter(s => !s.isIndexer).length;
  
  return {
    newRecipes: {
      target: activeSites * publishingConfig.newRecipes.perSite * 12, // 12 weeks
      description: `Publish ${publishingConfig.newRecipes.perSite} new recipes per site per week`
    },
    traffic: {
      target: '+15%',
      description: 'Increase organic traffic by 15% vs previous quarter'
    },
    emailList: {
      target: '+500',
      description: 'Grow email list by 500 subscribers per site'
    },
    seoRankings: {
      target: 'Top 10',
      description: 'Achieve top 10 rankings for 3 new keywords per site'
    }
  };
}

/**
 * Generate recipe creation checklist
 */
function generateRecipeChecklist() {
  return [
    { task: 'Research and test recipe', completed: false },
    { task: 'Calculate accurate macros', completed: false },
    { task: 'Write recipe content', completed: false },
    { task: 'Take photos', completed: false },
    { task: 'Create SEO title and meta description', completed: false },
    { task: 'Add internal links', completed: false },
    { task: 'Add schema markup', completed: false },
    { task: 'Create Pinterest pin', completed: false },
    { task: 'Create Instagram post', completed: false },
    { task: 'Schedule social media', completed: false },
    { task: 'Add to newsletter queue', completed: false }
  ];
}

/**
 * Get publish days in a month
 */
function getPublishDaysInMonth(year, month, dayNames) {
  const days = [];
  const date = new Date(year, month - 1, 1);
  const dayMap = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6
  };
  const targetDays = dayNames.map(d => dayMap[d.toLowerCase()]);

  while (date.getMonth() === month - 1) {
    if (targetDays.includes(date.getDay())) {
      days.push(date.toISOString().split('T')[0]);
    }
    date.setDate(date.getDate() + 1);
  }

  return days;
}

/**
 * Get random day in a month
 */
function getRandomDayInMonth(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Export content calendar to CSV
 * @param {Object} calendar - Content calendar
 * @returns {string} - CSV content
 */
export function exportContentCalendarToCSV(calendar) {
  const headers = ['Date', 'Site', 'Type', 'Theme', 'Status', 'Notes'];
  const rows = [headers.join(',')];

  const items = calendar.items || 
    calendar.months?.flatMap(m => m.items) || [];

  items.forEach(item => {
    const row = [
      item.publishDate,
      item.siteName,
      item.type,
      item.theme || '',
      item.status,
      `"${item.notes?.join('; ') || ''}"`
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

/**
 * Generate content ideas based on theme
 * @param {string} foodType - Site food type
 * @param {string} monthName - Month name
 * @returns {Object[]} - Content ideas
 */
export function generateContentIdeas(foodType, monthName) {
  const theme = monthlyThemes[monthName.toLowerCase()];
  if (!theme) return [];

  const ideas = [];
  
  theme.focus.forEach(focus => {
    ideas.push({
      title: `${focus.charAt(0).toUpperCase() + focus.slice(1)} Protein ${foodType.charAt(0).toUpperCase() + foodType.slice(1)}`,
      type: 'recipe',
      theme: focus,
      keywords: theme.keywords.filter(k => k.includes(focus) || k.includes(foodType))
    });
  });

  // Add roundup ideas
  ideas.push({
    title: `Best ${theme.theme} Protein ${foodType.charAt(0).toUpperCase() + foodType.slice(1)} Recipes`,
    type: 'roundup',
    theme: theme.theme,
    keywords: theme.keywords
  });

  return ideas;
}

export default {
  ContentTypes,
  publishingConfig,
  monthlyThemes,
  generateMonthlyContentCalendar,
  generateQuarterlyPlan,
  exportContentCalendarToCSV,
  generateContentIdeas
};
