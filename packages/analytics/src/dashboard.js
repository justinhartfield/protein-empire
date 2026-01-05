/**
 * Analytics Dashboard Data for the Protein Empire
 * 
 * Provides data structures and utilities for the marketing dashboard.
 * Designed to work with GA4 Data API and manual data entry.
 */

/**
 * Dashboard widget types
 */
export const WidgetTypes = {
  METRIC: 'metric',
  CHART: 'chart',
  TABLE: 'table',
  FUNNEL: 'funnel',
  MAP: 'map'
};

/**
 * Dashboard layout configuration
 */
export const dashboardConfig = {
  empire: {
    name: 'Protein Empire Overview',
    description: 'Aggregated metrics across all sites',
    widgets: [
      {
        id: 'total-users',
        type: WidgetTypes.METRIC,
        title: 'Total Users (All Sites)',
        metric: 'totalUsers',
        comparison: 'previous_period',
        size: 'small'
      },
      {
        id: 'total-sessions',
        type: WidgetTypes.METRIC,
        title: 'Total Sessions',
        metric: 'sessions',
        comparison: 'previous_period',
        size: 'small'
      },
      {
        id: 'total-signups',
        type: WidgetTypes.METRIC,
        title: 'Email Signups',
        metric: 'conversions:sign_up',
        comparison: 'previous_period',
        size: 'small'
      },
      {
        id: 'total-downloads',
        type: WidgetTypes.METRIC,
        title: 'PDF Downloads',
        metric: 'conversions:generate_lead',
        comparison: 'previous_period',
        size: 'small'
      },
      {
        id: 'traffic-by-site',
        type: WidgetTypes.CHART,
        title: 'Traffic by Site',
        chartType: 'bar',
        metric: 'sessions',
        dimension: 'site',
        size: 'large'
      },
      {
        id: 'traffic-trend',
        type: WidgetTypes.CHART,
        title: 'Traffic Trend (30 Days)',
        chartType: 'line',
        metric: 'sessions',
        dimension: 'date',
        size: 'large'
      },
      {
        id: 'top-recipes',
        type: WidgetTypes.TABLE,
        title: 'Top Recipes (All Sites)',
        columns: ['Recipe', 'Site', 'Views', 'Prints', 'Signups'],
        sortBy: 'views',
        limit: 10,
        size: 'large'
      },
      {
        id: 'conversion-funnel',
        type: WidgetTypes.FUNNEL,
        title: 'Signup Funnel',
        steps: ['Page View', 'View Form', 'Start Form', 'Complete'],
        size: 'medium'
      },
      {
        id: 'traffic-sources',
        type: WidgetTypes.CHART,
        title: 'Traffic Sources',
        chartType: 'pie',
        metric: 'sessions',
        dimension: 'source',
        size: 'medium'
      },
      {
        id: 'cross-site-flow',
        type: WidgetTypes.TABLE,
        title: 'Cross-Site Traffic Flow',
        columns: ['From Site', 'To Site', 'Clicks'],
        sortBy: 'clicks',
        limit: 10,
        size: 'medium'
      }
    ]
  },
  site: {
    name: 'Site Dashboard',
    description: 'Individual site metrics',
    widgets: [
      {
        id: 'site-users',
        type: WidgetTypes.METRIC,
        title: 'Users',
        metric: 'totalUsers',
        comparison: 'previous_period',
        size: 'small'
      },
      {
        id: 'site-sessions',
        type: WidgetTypes.METRIC,
        title: 'Sessions',
        metric: 'sessions',
        comparison: 'previous_period',
        size: 'small'
      },
      {
        id: 'site-bounce',
        type: WidgetTypes.METRIC,
        title: 'Bounce Rate',
        metric: 'bounceRate',
        comparison: 'previous_period',
        format: 'percent',
        size: 'small'
      },
      {
        id: 'site-duration',
        type: WidgetTypes.METRIC,
        title: 'Avg. Session Duration',
        metric: 'averageSessionDuration',
        comparison: 'previous_period',
        format: 'duration',
        size: 'small'
      },
      {
        id: 'site-signups',
        type: WidgetTypes.METRIC,
        title: 'Email Signups',
        metric: 'conversions:sign_up',
        comparison: 'previous_period',
        size: 'small'
      },
      {
        id: 'site-downloads',
        type: WidgetTypes.METRIC,
        title: 'PDF Downloads',
        metric: 'conversions:generate_lead',
        comparison: 'previous_period',
        size: 'small'
      },
      {
        id: 'site-traffic-trend',
        type: WidgetTypes.CHART,
        title: 'Traffic Trend',
        chartType: 'line',
        metric: 'sessions',
        dimension: 'date',
        size: 'large'
      },
      {
        id: 'site-top-pages',
        type: WidgetTypes.TABLE,
        title: 'Top Pages',
        columns: ['Page', 'Views', 'Avg. Time', 'Bounce Rate'],
        sortBy: 'views',
        limit: 10,
        size: 'medium'
      },
      {
        id: 'site-top-recipes',
        type: WidgetTypes.TABLE,
        title: 'Top Recipes',
        columns: ['Recipe', 'Views', 'Prints', 'Shares'],
        sortBy: 'views',
        limit: 10,
        size: 'medium'
      },
      {
        id: 'site-traffic-sources',
        type: WidgetTypes.CHART,
        title: 'Traffic Sources',
        chartType: 'pie',
        metric: 'sessions',
        dimension: 'source',
        size: 'medium'
      },
      {
        id: 'site-devices',
        type: WidgetTypes.CHART,
        title: 'Devices',
        chartType: 'donut',
        metric: 'sessions',
        dimension: 'deviceCategory',
        size: 'small'
      },
      {
        id: 'site-conversion-funnel',
        type: WidgetTypes.FUNNEL,
        title: 'Conversion Funnel',
        steps: ['Visit', 'View Form', 'Submit', 'Download'],
        size: 'medium'
      }
    ]
  }
};

/**
 * Sample data structure for dashboard
 */
export const sampleDashboardData = {
  dateRange: {
    start: '2026-01-01',
    end: '2026-01-05'
  },
  empire: {
    totalUsers: 12500,
    totalUsersPrevious: 11200,
    sessions: 18750,
    sessionsPrevious: 16800,
    signups: 375,
    signupsPrevious: 320,
    downloads: 340,
    downloadsPrevious: 290,
    trafficBySite: [
      { site: 'proteincookies.co', sessions: 3200 },
      { site: 'proteinbrownies.co', sessions: 2800 },
      { site: 'proteinpancakes.co', sessions: 2400 },
      { site: 'proteinmuffins.com', sessions: 2100 },
      { site: 'proteinbars.co', sessions: 1800 },
      { site: 'proteinbites.co', sessions: 1500 },
      { site: 'proteinoatmeal.co', sessions: 1200 },
      { site: 'proteincheesecake.co', sessions: 1100 },
      { site: 'proteindonuts.co', sessions: 900 },
      { site: 'proteinpizzas.co', sessions: 850 },
      { site: 'proteinpudding.co', sessions: 500 },
      { site: 'protein-bread.com', sessions: 400 }
    ],
    trafficSources: [
      { source: 'Organic Search', sessions: 9375, percent: 50 },
      { source: 'Pinterest', sessions: 4688, percent: 25 },
      { source: 'Direct', sessions: 2813, percent: 15 },
      { source: 'Social', sessions: 1125, percent: 6 },
      { source: 'Referral', sessions: 750, percent: 4 }
    ]
  }
};

/**
 * Generate empty dashboard data structure
 * @param {string} type - Dashboard type ('empire' or 'site')
 * @returns {Object} - Empty data structure
 */
export function generateEmptyDashboardData(type = 'empire') {
  if (type === 'empire') {
    return {
      dateRange: { start: null, end: null },
      metrics: {
        totalUsers: 0,
        sessions: 0,
        signups: 0,
        downloads: 0
      },
      previousMetrics: {
        totalUsers: 0,
        sessions: 0,
        signups: 0,
        downloads: 0
      },
      trafficBySite: [],
      trafficTrend: [],
      topRecipes: [],
      trafficSources: [],
      crossSiteFlow: [],
      conversionFunnel: {
        pageView: 0,
        viewForm: 0,
        startForm: 0,
        complete: 0
      }
    };
  }

  return {
    dateRange: { start: null, end: null },
    site: null,
    metrics: {
      totalUsers: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      signups: 0,
      downloads: 0
    },
    previousMetrics: {
      totalUsers: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      signups: 0,
      downloads: 0
    },
    trafficTrend: [],
    topPages: [],
    topRecipes: [],
    trafficSources: [],
    devices: [],
    conversionFunnel: {
      visit: 0,
      viewForm: 0,
      submit: 0,
      download: 0
    }
  };
}

/**
 * Calculate percentage change
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {Object} - Change info
 */
export function calculateChange(current, previous) {
  if (previous === 0) {
    return { value: current > 0 ? 100 : 0, direction: 'up' };
  }
  
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change).toFixed(1),
    direction: change >= 0 ? 'up' : 'down'
  };
}

/**
 * Format metric value for display
 * @param {number} value - Raw value
 * @param {string} format - Format type
 * @returns {string} - Formatted value
 */
export function formatMetric(value, format = 'number') {
  switch (format) {
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'duration':
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);
      return `${minutes}m ${seconds}s`;
    case 'currency':
      return `$${value.toFixed(2)}`;
    case 'compact':
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toString();
    default:
      return value.toLocaleString();
  }
}

/**
 * Weekly report template
 */
export const weeklyReportTemplate = {
  title: 'Protein Empire Weekly Report',
  sections: [
    {
      name: 'Executive Summary',
      metrics: ['totalUsers', 'sessions', 'signups', 'downloads'],
      showComparison: true
    },
    {
      name: 'Traffic Overview',
      charts: ['trafficTrend', 'trafficBySite', 'trafficSources']
    },
    {
      name: 'Top Performing Content',
      tables: ['topRecipes', 'topPages']
    },
    {
      name: 'Conversion Performance',
      charts: ['conversionFunnel'],
      metrics: ['signupRate', 'downloadRate']
    },
    {
      name: 'SEO Performance',
      metrics: ['organicTraffic', 'avgPosition', 'impressions', 'clicks']
    },
    {
      name: 'Recommendations',
      type: 'text',
      autoGenerate: true
    }
  ]
};

/**
 * Generate recommendations based on data
 * @param {Object} data - Dashboard data
 * @returns {string[]} - Array of recommendations
 */
export function generateRecommendations(data) {
  const recommendations = [];

  // Traffic recommendations
  if (data.metrics?.sessions < data.previousMetrics?.sessions) {
    recommendations.push('Traffic decreased this period. Consider increasing social media posting frequency or running a Pinterest campaign.');
  }

  // Conversion recommendations
  const signupRate = data.metrics?.signups / data.metrics?.sessions * 100;
  if (signupRate < 2) {
    recommendations.push('Signup rate is below 2%. Test different lead magnet offers or popup timing.');
  }

  // Bounce rate recommendations
  if (data.metrics?.bounceRate > 70) {
    recommendations.push('Bounce rate is high. Improve page load speed and add more engaging above-the-fold content.');
  }

  // Cross-site recommendations
  const crossSiteRate = data.crossSiteClicks / data.metrics?.sessions * 100;
  if (crossSiteRate < 1) {
    recommendations.push('Cross-site traffic is low. Add more prominent links to sister sites in recipe pages.');
  }

  // Default recommendation
  if (recommendations.length === 0) {
    recommendations.push('Performance is on track! Continue current strategies and test new content formats.');
  }

  return recommendations;
}

export default {
  WidgetTypes,
  dashboardConfig,
  sampleDashboardData,
  generateEmptyDashboardData,
  calculateChange,
  formatMetric,
  weeklyReportTemplate,
  generateRecommendations
};
