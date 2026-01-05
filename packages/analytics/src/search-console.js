/**
 * Google Search Console Configuration for the Protein Empire
 * 
 * Provides GSC setup instructions, sitemap generation, and SEO monitoring utilities.
 * 
 * Setup Instructions:
 * 1. Go to search.google.com/search-console
 * 2. Add each domain as a property
 * 3. Verify ownership (DNS or HTML file)
 * 4. Submit sitemap
 */

/**
 * GSC configuration for all empire sites
 */
export const gscConfig = {
  // Per-site properties
  properties: {
    'highprotein.recipes': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://highprotein.recipes/sitemap.xml'
    },
    'proteinmuffins.com': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteinmuffins.com/sitemap.xml'
    },
    'proteincookies.co': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteincookies.co/sitemap.xml'
    },
    'proteinpancakes.co': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteinpancakes.co/sitemap.xml'
    },
    'proteinbrownies.co': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteinbrownies.co/sitemap.xml'
    },
    'protein-bread.com': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://protein-bread.com/sitemap.xml'
    },
    'proteinbars.co': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteinbars.co/sitemap.xml'
    },
    'proteinbites.co': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteinbites.co/sitemap.xml'
    },
    'proteindonuts.co': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteindonuts.co/sitemap.xml'
    },
    'proteinoatmeal.co': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteinoatmeal.co/sitemap.xml'
    },
    'proteincheesecake.co': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteincheesecake.co/sitemap.xml'
    },
    'proteinpizzas.co': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteinpizzas.co/sitemap.xml'
    },
    'proteinpudding.co': {
      verified: false,
      verificationMethod: '',
      sitemapSubmitted: false,
      sitemapUrl: 'https://proteinpudding.co/sitemap.xml'
    }
  }
};

/**
 * Generate XML sitemap for a site
 * @param {string} domain - Site domain
 * @param {Object[]} recipes - Array of recipes
 * @param {Object[]} categories - Array of categories
 * @returns {string} - XML sitemap content
 */
export function generateSitemap(domain, recipes, categories = []) {
  const baseUrl = `https://${domain}`;
  const today = new Date().toISOString().split('T')[0];

  let urls = [
    // Homepage - highest priority
    {
      loc: baseUrl,
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0'
    },
    // Category pages
    ...categories.map(cat => ({
      loc: `${baseUrl}/category-${cat.slug}.html`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.8'
    })),
    // Recipe pages
    ...recipes.map(recipe => ({
      loc: `${baseUrl}/${recipe.slug}.html`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7'
    }))
  ];

  const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`.trim();
}

/**
 * Generate robots.txt for a site
 * @param {string} domain - Site domain
 * @returns {string} - robots.txt content
 */
export function generateRobotsTxt(domain) {
  return `# Protein Empire - ${domain}
# https://${domain}/robots.txt

User-agent: *
Allow: /

# Sitemap
Sitemap: https://${domain}/sitemap.xml

# Crawl-delay (optional, be nice to servers)
Crawl-delay: 1

# Block admin/api paths if any
Disallow: /api/
Disallow: /.netlify/
`.trim();
}

/**
 * GSC setup checklist for new sites
 */
export const gscSetupChecklist = [
  {
    step: 1,
    title: 'Access Search Console',
    description: 'Go to Google Search Console',
    url: 'https://search.google.com/search-console'
  },
  {
    step: 2,
    title: 'Add Property',
    description: 'Click "Add property" and choose "URL prefix" method',
    input: 'https://{domain}'
  },
  {
    step: 3,
    title: 'Verify Ownership',
    description: 'Choose verification method',
    methods: [
      {
        name: 'HTML file',
        description: 'Download and upload google{code}.html to site root',
        recommended: true
      },
      {
        name: 'DNS record',
        description: 'Add TXT record to domain DNS',
        recommended: false
      },
      {
        name: 'HTML tag',
        description: 'Add meta tag to homepage <head>',
        recommended: false
      }
    ]
  },
  {
    step: 4,
    title: 'Submit Sitemap',
    description: 'Go to Sitemaps section and submit sitemap URL',
    input: 'https://{domain}/sitemap.xml'
  },
  {
    step: 5,
    title: 'Request Indexing',
    description: 'Use URL Inspection tool to request indexing for key pages',
    pages: ['Homepage', 'Top 5 recipes', 'Category pages']
  },
  {
    step: 6,
    title: 'Link to GA4',
    description: 'Connect Search Console to GA4 for combined reporting',
    location: 'GA4 Admin > Product Links > Search Console Links'
  },
  {
    step: 7,
    title: 'Set Up Alerts',
    description: 'Enable email notifications for issues',
    alerts: ['Indexing issues', 'Security issues', 'Manual actions']
  }
];

/**
 * Key SEO metrics to monitor in GSC
 */
export const seoMetrics = {
  performance: [
    {
      metric: 'Total Clicks',
      description: 'Number of clicks from Google Search',
      goal: 'Increase month-over-month',
      importance: 'high'
    },
    {
      metric: 'Total Impressions',
      description: 'Number of times site appeared in search results',
      goal: 'Increase month-over-month',
      importance: 'high'
    },
    {
      metric: 'Average CTR',
      description: 'Click-through rate from search results',
      goal: '> 3% for branded, > 1% for non-branded',
      importance: 'medium'
    },
    {
      metric: 'Average Position',
      description: 'Average ranking position in search results',
      goal: '< 10 for target keywords',
      importance: 'high'
    }
  ],
  indexing: [
    {
      metric: 'Pages Indexed',
      description: 'Number of pages in Google index',
      goal: 'All recipe pages indexed',
      importance: 'high'
    },
    {
      metric: 'Crawl Errors',
      description: 'Pages that couldn\'t be crawled',
      goal: '0 errors',
      importance: 'high'
    },
    {
      metric: 'Mobile Usability',
      description: 'Mobile-friendly page count',
      goal: '100% mobile-friendly',
      importance: 'high'
    }
  ],
  enhancements: [
    {
      metric: 'Recipe Rich Results',
      description: 'Pages with valid Recipe schema',
      goal: 'All recipe pages valid',
      importance: 'high'
    },
    {
      metric: 'Core Web Vitals',
      description: 'LCP, FID, CLS scores',
      goal: 'All "Good" status',
      importance: 'medium'
    }
  ]
};

/**
 * Target keywords by site category
 */
export const targetKeywords = {
  cookies: [
    'protein cookies recipe',
    'high protein cookies',
    'protein cookie recipe easy',
    'healthy protein cookies',
    'protein powder cookies',
    'macro friendly cookies',
    'low calorie protein cookies'
  ],
  brownies: [
    'protein brownies recipe',
    'high protein brownies',
    'healthy protein brownies',
    'protein powder brownies',
    'macro friendly brownies',
    'low calorie brownies'
  ],
  pancakes: [
    'protein pancakes recipe',
    'high protein pancakes',
    'protein powder pancakes',
    'healthy protein pancakes',
    'macro friendly pancakes'
  ],
  muffins: [
    'protein muffins recipe',
    'high protein muffins',
    'protein powder muffins',
    'healthy protein muffins'
  ],
  bars: [
    'homemade protein bars',
    'protein bar recipe',
    'no bake protein bars',
    'healthy protein bars'
  ],
  bites: [
    'protein bites recipe',
    'energy bites recipe',
    'no bake protein bites',
    'protein balls recipe'
  ],
  bread: [
    'protein bread recipe',
    'high protein bread',
    'protein powder bread',
    'low carb protein bread'
  ],
  pizza: [
    'protein pizza crust',
    'high protein pizza',
    'protein pizza recipe',
    'healthy pizza crust'
  ],
  oatmeal: [
    'protein oatmeal recipe',
    'proats recipe',
    'protein overnight oats',
    'high protein oatmeal'
  ],
  cheesecake: [
    'protein cheesecake recipe',
    'high protein cheesecake',
    'healthy cheesecake recipe',
    'protein cheesecake no bake'
  ],
  donuts: [
    'protein donuts recipe',
    'baked protein donuts',
    'healthy protein donuts',
    'high protein donuts'
  ],
  pudding: [
    'protein pudding recipe',
    'protein chia pudding',
    'high protein pudding',
    'protein powder pudding'
  ]
};

/**
 * Generate keyword tracking report template
 * @param {string} foodType - Site food type
 * @returns {Object} - Keyword tracking template
 */
export function generateKeywordTracker(foodType) {
  const keywords = targetKeywords[foodType] || [];
  
  return {
    foodType,
    generatedAt: new Date().toISOString(),
    keywords: keywords.map(keyword => ({
      keyword,
      currentPosition: null,
      previousPosition: null,
      change: null,
      impressions: null,
      clicks: null,
      ctr: null,
      targetPage: null,
      notes: ''
    })),
    updateFrequency: 'weekly',
    nextUpdate: null
  };
}

/**
 * Generate GSC configuration report
 * @param {Object} sites - Site configurations
 * @returns {Object} - Configuration status report
 */
export function generateGSCReport(sites) {
  const report = {
    generatedAt: new Date().toISOString(),
    totalSites: Object.keys(sites).length,
    verified: 0,
    pending: 0,
    sitemapsSubmitted: 0,
    sites: []
  };

  Object.entries(gscConfig.properties).forEach(([domain, config]) => {
    if (config.verified) {
      report.verified++;
    } else {
      report.pending++;
    }
    if (config.sitemapSubmitted) {
      report.sitemapsSubmitted++;
    }

    report.sites.push({
      domain,
      verified: config.verified,
      verificationMethod: config.verificationMethod || 'Not verified',
      sitemapSubmitted: config.sitemapSubmitted,
      sitemapUrl: config.sitemapUrl
    });
  });

  return report;
}

export default {
  gscConfig,
  generateSitemap,
  generateRobotsTxt,
  gscSetupChecklist,
  seoMetrics,
  targetKeywords,
  generateKeywordTracker,
  generateGSCReport
};
