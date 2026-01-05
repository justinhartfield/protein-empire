/**
 * Protein Empire Marketing Dashboard
 * Client-side JavaScript for dashboard functionality
 */

// Sample data (would be loaded from API in production)
const dashboardData = {
  metrics: {
    users: { value: 12500, change: 11.6 },
    signups: { value: 375, change: 17.2 },
    downloads: { value: 340, change: 17.2 },
    engagement: { value: 8200, change: 24.5 }
  },
  trafficBySite: [
    { site: 'proteincookies.co', sessions: 3200, name: 'Protein Cookies' },
    { site: 'proteinbrownies.co', sessions: 2800, name: 'Protein Brownies' },
    { site: 'proteinpancakes.co', sessions: 2400, name: 'Protein Pancakes' },
    { site: 'proteinmuffins.com', sessions: 2100, name: 'Protein Muffins' },
    { site: 'proteinbars.co', sessions: 1800, name: 'Protein Bars' },
    { site: 'proteinbites.co', sessions: 1500, name: 'Protein Bites' },
    { site: 'proteinoatmeal.co', sessions: 1200, name: 'Protein Oatmeal' },
    { site: 'proteincheesecake.co', sessions: 1100, name: 'Protein Cheesecake' },
    { site: 'proteindonuts.co', sessions: 900, name: 'Protein Donuts' },
    { site: 'proteinpizzas.co', sessions: 850, name: 'Protein Pizzas' },
    { site: 'proteinpudding.co', sessions: 500, name: 'Protein Pudding' },
    { site: 'protein-bread.com', sessions: 400, name: 'Protein Bread' }
  ],
  trafficSources: [
    { source: 'Organic Search', sessions: 9375, percent: 50 },
    { source: 'Pinterest', sessions: 4688, percent: 25 },
    { source: 'Direct', sessions: 2813, percent: 15 },
    { source: 'Social', sessions: 1125, percent: 6 },
    { source: 'Referral', sessions: 750, percent: 4 }
  ],
  topRecipes: [
    { title: 'Classic Protein Cookies', site: 'proteincookies.co', views: 4520, signups: 156, rate: 3.45 },
    { title: 'Fudgy Protein Brownies', site: 'proteinbrownies.co', views: 3890, signups: 142, rate: 3.65 },
    { title: 'Fluffy Protein Pancakes', site: 'proteinpancakes.co', views: 3210, signups: 98, rate: 3.05 },
    { title: 'Blueberry Protein Muffins', site: 'proteinmuffins.com', views: 2850, signups: 87, rate: 3.05 },
    { title: 'No-Bake Protein Bars', site: 'proteinbars.co', views: 2340, signups: 76, rate: 3.25 }
  ],
  sites: [
    { domain: 'proteincookies.co', name: 'Protein Cookies', foodType: 'cookies', recipes: 25, subscribers: 450 },
    { domain: 'proteinbrownies.co', name: 'Protein Brownies', foodType: 'brownies', recipes: 22, subscribers: 380 },
    { domain: 'proteinpancakes.co', name: 'Protein Pancakes', foodType: 'pancakes', recipes: 20, subscribers: 320 },
    { domain: 'proteinmuffins.com', name: 'Protein Muffins', foodType: 'muffins', recipes: 18, subscribers: 290 },
    { domain: 'proteinbars.co', name: 'Protein Bars', foodType: 'bars', recipes: 15, subscribers: 250 },
    { domain: 'proteinbites.co', name: 'Protein Bites', foodType: 'bites', recipes: 15, subscribers: 220 },
    { domain: 'proteinoatmeal.co', name: 'Protein Oatmeal', foodType: 'oatmeal', recipes: 12, subscribers: 180 },
    { domain: 'proteincheesecake.co', name: 'Protein Cheesecake', foodType: 'cheesecake', recipes: 10, subscribers: 150 },
    { domain: 'proteindonuts.co', name: 'Protein Donuts', foodType: 'donuts', recipes: 10, subscribers: 140 },
    { domain: 'proteinpizzas.co', name: 'Protein Pizzas', foodType: 'pizzas', recipes: 8, subscribers: 120 },
    { domain: 'proteinpudding.co', name: 'Protein Pudding', foodType: 'pudding', recipes: 8, subscribers: 100 },
    { domain: 'protein-bread.com', name: 'Protein Bread', foodType: 'bread', recipes: 6, subscribers: 80 }
  ]
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSiteSelector();
  initCharts();
  populateTopRecipes();
  populateSitesGrid();
  populateCalendar();
});

/**
 * Initialize sidebar navigation
 */
function initNavigation() {
  const links = document.querySelectorAll('.sidebar-link');
  const sections = {
    'overview': 'overview-section',
    'social': 'social-section',
    'email': 'email-section',
    'analytics': 'analytics-section',
    'calendar': 'calendar-section',
    'sites': 'sites-section',
    'settings': 'settings-section'
  };

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href').replace('#', '');
      
      // Update active link
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Show/hide sections
      Object.entries(sections).forEach(([key, sectionId]) => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.classList.toggle('hidden', key !== target);
        }
      });

      // Update page title
      const titles = {
        'overview': ['Overview', 'Empire-wide marketing performance'],
        'social': ['Social Media', 'Manage social media content and scheduling'],
        'email': ['Email Marketing', 'Campaigns, sequences, and subscriber management'],
        'analytics': ['Analytics', 'Traffic, conversions, and SEO performance'],
        'calendar': ['Content Calendar', 'Plan and schedule content across all channels'],
        'sites': ['Sites', 'Manage all empire sites'],
        'settings': ['Settings', 'Configure integrations and preferences']
      };

      if (titles[target]) {
        document.getElementById('page-title').textContent = titles[target][0];
        document.getElementById('page-subtitle').textContent = titles[target][1];
      }
    });
  });
}

/**
 * Initialize site selector
 */
function initSiteSelector() {
  const selector = document.getElementById('site-selector');
  
  dashboardData.sites.forEach(site => {
    const option = document.createElement('option');
    option.value = site.domain;
    option.textContent = site.name;
    selector.appendChild(option);
  });

  selector.addEventListener('change', (e) => {
    const selectedSite = e.target.value;
    console.log('Selected site:', selectedSite);
    // In production, this would filter data and update charts
  });
}

/**
 * Initialize charts
 */
function initCharts() {
  // Traffic by Site Chart
  const trafficCtx = document.getElementById('traffic-chart').getContext('2d');
  new Chart(trafficCtx, {
    type: 'bar',
    data: {
      labels: dashboardData.trafficBySite.slice(0, 8).map(s => s.name.replace('Protein ', '')),
      datasets: [{
        label: 'Sessions',
        data: dashboardData.trafficBySite.slice(0, 8).map(s => s.sessions),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });

  // Traffic Sources Chart
  const sourcesCtx = document.getElementById('sources-chart').getContext('2d');
  new Chart(sourcesCtx, {
    type: 'doughnut',
    data: {
      labels: dashboardData.trafficSources.map(s => s.source),
      datasets: [{
        data: dashboardData.trafficSources.map(s => s.percent),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  });
}

/**
 * Populate top recipes table
 */
function populateTopRecipes() {
  const tbody = document.getElementById('top-recipes-table');
  
  dashboardData.topRecipes.forEach(recipe => {
    const tr = document.createElement('tr');
    tr.className = 'border-b hover:bg-gray-50';
    tr.innerHTML = `
      <td class="py-3 px-4">
        <span class="font-medium text-gray-800">${recipe.title}</span>
      </td>
      <td class="py-3 px-4">
        <span class="text-sm text-gray-600">${recipe.site}</span>
      </td>
      <td class="py-3 px-4 text-right">
        <span class="text-gray-800">${recipe.views.toLocaleString()}</span>
      </td>
      <td class="py-3 px-4 text-right">
        <span class="text-gray-800">${recipe.signups}</span>
      </td>
      <td class="py-3 px-4 text-right">
        <span class="text-green-600 font-medium">${recipe.rate}%</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Populate sites grid
 */
function populateSitesGrid() {
  const grid = document.getElementById('sites-grid');
  
  dashboardData.sites.forEach(site => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow';
    card.innerHTML = `
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
          <span class="text-2xl">🍪</span>
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">${site.name}</h3>
          <p class="text-sm text-gray-500">${site.domain}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-sm text-gray-500">Recipes</p>
          <p class="text-xl font-bold text-gray-800">${site.recipes}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Subscribers</p>
          <p class="text-xl font-bold text-gray-800">${site.subscribers}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <a href="https://${site.domain}" target="_blank" class="flex-1 text-center px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">
          Visit Site
        </a>
        <button class="flex-1 px-3 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
          Manage
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * Populate calendar
 */
function populateCalendar() {
  const grid = document.getElementById('calendar-grid');
  const year = 2026;
  const month = 0; // January
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement('div');
    cell.className = 'min-h-24 p-2 bg-gray-50 rounded';
    grid.appendChild(cell);
  }
  
  // Add day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'min-h-24 p-2 border rounded hover:bg-amber-50 cursor-pointer transition-colors';
    
    const isToday = day === 5; // Assume today is Jan 5
    const hasEvents = [1, 5, 8, 12, 15, 19, 22, 26, 29].includes(day);
    
    cell.innerHTML = `
      <div class="flex justify-between items-start">
        <span class="${isToday ? 'bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm' : 'text-sm text-gray-600'}">${day}</span>
        ${hasEvents ? '<span class="w-2 h-2 bg-amber-500 rounded-full"></span>' : ''}
      </div>
      ${hasEvents ? `
        <div class="mt-2 space-y-1">
          <div class="text-xs bg-amber-100 text-amber-800 px-1 py-0.5 rounded truncate">Newsletter</div>
          ${day % 3 === 0 ? '<div class="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">Pinterest</div>' : ''}
        </div>
      ` : ''}
    `;
    
    grid.appendChild(cell);
  }

  // Populate upcoming items
  const upcomingContainer = document.getElementById('upcoming-items');
  const upcomingItems = [
    { date: 'Jan 5', time: '10:00 AM', type: 'email', title: 'Weekly Newsletter', site: 'All Sites' },
    { date: 'Jan 5', time: '2:00 PM', type: 'social', title: 'Pinterest Pins (5)', site: 'proteincookies.co' },
    { date: 'Jan 6', time: '9:00 AM', type: 'content', title: 'New Recipe: Chocolate Chip Cookies', site: 'proteincookies.co' },
    { date: 'Jan 7', time: '10:00 AM', type: 'email', title: 'Cross-Promo: Brownies', site: 'proteincookies.co' }
  ];

  upcomingItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-4 p-3 bg-gray-50 rounded-lg';
    
    const iconClass = {
      email: 'fas fa-envelope text-blue-600',
      social: 'fab fa-pinterest text-pink-600',
      content: 'fas fa-file-alt text-green-600'
    }[item.type];

    div.innerHTML = `
      <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        <i class="${iconClass}"></i>
      </div>
      <div class="flex-1">
        <p class="font-medium text-gray-800">${item.title}</p>
        <p class="text-sm text-gray-500">${item.site}</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-medium text-gray-800">${item.date}</p>
        <p class="text-xs text-gray-500">${item.time}</p>
      </div>
    `;
    
    upcomingContainer.appendChild(div);
  });
}

/**
 * Format number with K/M suffix
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
