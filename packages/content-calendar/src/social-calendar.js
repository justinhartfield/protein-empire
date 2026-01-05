/**
 * Social Media Content Calendar for the Protein Empire
 * 
 * Generates posting schedules for Pinterest, Instagram, TikTok, and Facebook.
 * Optimized for maximum engagement based on platform best practices.
 */

/**
 * Platform posting schedules (optimal times in EST)
 */
export const platformSchedules = {
  pinterest: {
    postsPerDay: 5,
    bestTimes: ['08:00', '12:00', '14:00', '18:00', '21:00'],
    bestDays: ['saturday', 'sunday', 'friday'],
    peakSeasons: ['january', 'september', 'october'], // New year resolutions, back to school
    contentMix: {
      newRecipes: 40,      // % of posts
      repins: 30,          // Reshare top performers
      seasonal: 20,        // Seasonal content
      crossPromo: 10       // Other empire sites
    }
  },
  instagram: {
    postsPerDay: 2,
    bestTimes: ['11:00', '19:00'],
    bestDays: ['tuesday', 'wednesday', 'friday'],
    peakSeasons: ['january', 'may', 'september'],
    contentMix: {
      feedPosts: 30,
      stories: 50,
      reels: 20
    }
  },
  tiktok: {
    postsPerDay: 3,
    bestTimes: ['07:00', '12:00', '19:00'],
    bestDays: ['tuesday', 'thursday', 'friday'],
    peakSeasons: ['january', 'june', 'september'],
    contentMix: {
      recipes: 60,
      tips: 25,
      trends: 15
    }
  },
  facebook: {
    postsPerDay: 1,
    bestTimes: ['13:00'],
    bestDays: ['wednesday', 'thursday', 'friday'],
    peakSeasons: ['january', 'november', 'december'],
    contentMix: {
      recipes: 50,
      engagement: 30,  // Questions, polls
      crossPromo: 20
    }
  }
};

/**
 * Content types for social media
 */
export const ContentTypes = {
  NEW_RECIPE: 'new_recipe',
  TOP_PERFORMER: 'top_performer',
  SEASONAL: 'seasonal',
  CROSS_PROMO: 'cross_promo',
  TIP: 'tip',
  ENGAGEMENT: 'engagement',
  TREND: 'trend',
  STORY: 'story',
  REEL: 'reel'
};

/**
 * Seasonal themes by month
 */
export const seasonalThemes = {
  january: ['new year', 'fitness goals', 'healthy eating', 'meal prep'],
  february: ['valentine', 'chocolate', 'date night', 'self love'],
  march: ['spring', 'st patrick', 'fresh start', 'green recipes'],
  april: ['easter', 'spring cleaning', 'outdoor', 'light recipes'],
  may: ['mother\'s day', 'memorial day', 'summer prep', 'picnic'],
  june: ['summer', 'father\'s day', 'graduation', 'beach body'],
  july: ['4th of july', 'summer treats', 'bbq', 'no bake'],
  august: ['back to school', 'meal prep', 'quick recipes', 'lunchbox'],
  september: ['fall', 'pumpkin', 'apple', 'cozy recipes'],
  october: ['halloween', 'pumpkin spice', 'fall baking', 'spooky treats'],
  november: ['thanksgiving', 'holiday prep', 'comfort food', 'gratitude'],
  december: ['christmas', 'holiday', 'gift', 'winter treats']
};

/**
 * Generate social media calendar for a week
 * @param {Object} options - Calendar options
 * @returns {Object} - Weekly social media calendar
 */
export function generateWeeklyCalendar(options) {
  const {
    startDate = new Date(),
    site,
    recipes = [],
    topPerformers = [],
    platform = 'all'
  } = options;

  const calendar = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    site: site?.domain,
    platforms: {}
  };

  const platforms = platform === 'all' 
    ? ['pinterest', 'instagram', 'tiktok', 'facebook']
    : [platform];

  platforms.forEach(p => {
    calendar.platforms[p] = generatePlatformWeek(p, startDate, recipes, topPerformers, site);
  });

  return calendar;
}

/**
 * Generate a week of posts for a specific platform
 */
function generatePlatformWeek(platform, startDate, recipes, topPerformers, site) {
  const schedule = platformSchedules[platform];
  const posts = [];
  const month = startDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const themes = seasonalThemes[month] || [];

  // Generate posts for each day of the week
  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const dayName = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const dateStr = date.toISOString().split('T')[0];

    // Determine number of posts for this day
    const isPeakDay = schedule.bestDays.includes(dayName);
    const postsToday = isPeakDay ? schedule.postsPerDay : Math.ceil(schedule.postsPerDay * 0.7);

    for (let i = 0; i < postsToday; i++) {
      const time = schedule.bestTimes[i % schedule.bestTimes.length];
      const contentType = selectContentType(schedule.contentMix, i, postsToday);
      const recipe = selectRecipe(contentType, recipes, topPerformers);

      posts.push({
        id: `${platform}-${dateStr}-${i}`,
        platform,
        date: dateStr,
        time,
        dayOfWeek: dayName,
        contentType,
        recipe: recipe ? {
          id: recipe.id || recipe.slug,
          title: recipe.title,
          slug: recipe.slug
        } : null,
        seasonalTheme: themes[i % themes.length],
        status: 'scheduled',
        notes: generatePostNotes(contentType, recipe, site)
      });
    }
  }

  return {
    totalPosts: posts.length,
    posts
  };
}

/**
 * Select content type based on mix percentages
 */
function selectContentType(contentMix, index, total) {
  const types = Object.entries(contentMix);
  let cumulative = 0;
  const position = (index / total) * 100;

  for (const [type, percentage] of types) {
    cumulative += percentage;
    if (position < cumulative) {
      return type;
    }
  }

  return types[0][0];
}

/**
 * Select recipe based on content type
 */
function selectRecipe(contentType, recipes, topPerformers) {
  if (contentType === 'top_performer' || contentType === 'repins') {
    return topPerformers[Math.floor(Math.random() * topPerformers.length)];
  }
  
  if (contentType === 'new_recipe' || contentType === 'recipes' || contentType === 'feedPosts') {
    return recipes[Math.floor(Math.random() * recipes.length)];
  }

  return null;
}

/**
 * Generate notes for a post
 */
function generatePostNotes(contentType, recipe, site) {
  const notes = [];

  switch (contentType) {
    case 'new_recipe':
    case 'recipes':
      notes.push(`Feature: ${recipe?.title || 'TBD'}`);
      notes.push('Include recipe link in bio/caption');
      break;
    case 'top_performer':
    case 'repins':
      notes.push(`Reshare top performer: ${recipe?.title || 'TBD'}`);
      notes.push('Update caption with fresh angle');
      break;
    case 'seasonal':
      notes.push('Create seasonal-themed content');
      notes.push('Use trending hashtags');
      break;
    case 'cross_promo':
      notes.push('Promote sister site');
      notes.push('Tag other account');
      break;
    case 'tip':
    case 'tips':
      notes.push('Share protein baking tip');
      notes.push('Include call-to-action');
      break;
    case 'engagement':
      notes.push('Ask question or run poll');
      notes.push('Respond to comments within 1 hour');
      break;
    case 'stories':
      notes.push('Behind-the-scenes or quick tip');
      notes.push('Use interactive stickers');
      break;
    case 'reels':
      notes.push('Recipe video or trending audio');
      notes.push('Keep under 30 seconds');
      break;
  }

  return notes;
}

/**
 * Generate monthly social media calendar
 * @param {Object} options - Calendar options
 * @returns {Object} - Monthly calendar
 */
export function generateMonthlyCalendar(options) {
  const {
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    site,
    recipes = [],
    topPerformers = []
  } = options;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const weeks = [];

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    weeks.push(generateWeeklyCalendar({
      startDate: new Date(currentDate),
      site,
      recipes,
      topPerformers
    }));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return {
    year,
    month,
    monthName: startDate.toLocaleString('en-US', { month: 'long' }),
    site: site?.domain,
    themes: seasonalThemes[startDate.toLocaleString('en-US', { month: 'long' }).toLowerCase()],
    weeks,
    summary: {
      totalPosts: weeks.reduce((sum, w) => {
        return sum + Object.values(w.platforms).reduce((s, p) => s + p.totalPosts, 0);
      }, 0),
      byPlatform: {
        pinterest: weeks.reduce((sum, w) => sum + (w.platforms.pinterest?.totalPosts || 0), 0),
        instagram: weeks.reduce((sum, w) => sum + (w.platforms.instagram?.totalPosts || 0), 0),
        tiktok: weeks.reduce((sum, w) => sum + (w.platforms.tiktok?.totalPosts || 0), 0),
        facebook: weeks.reduce((sum, w) => sum + (w.platforms.facebook?.totalPosts || 0), 0)
      }
    }
  };
}

/**
 * Export calendar to CSV format
 * @param {Object} calendar - Calendar object
 * @returns {string} - CSV content
 */
export function exportToCSV(calendar) {
  const headers = ['Date', 'Time', 'Platform', 'Content Type', 'Recipe', 'Theme', 'Notes', 'Status'];
  const rows = [headers.join(',')];

  const allPosts = [];
  
  if (calendar.weeks) {
    // Monthly calendar
    calendar.weeks.forEach(week => {
      Object.values(week.platforms).forEach(platform => {
        allPosts.push(...platform.posts);
      });
    });
  } else {
    // Weekly calendar
    Object.values(calendar.platforms).forEach(platform => {
      allPosts.push(...platform.posts);
    });
  }

  // Sort by date and time
  allPosts.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  allPosts.forEach(post => {
    const row = [
      post.date,
      post.time,
      post.platform,
      post.contentType,
      post.recipe?.title || '',
      post.seasonalTheme || '',
      `"${post.notes?.join('; ') || ''}"`,
      post.status
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

/**
 * Export calendar to JSON format for scheduling tools
 * @param {Object} calendar - Calendar object
 * @param {string} tool - Target tool (buffer, hootsuite, later)
 * @returns {Object} - Tool-specific format
 */
export function exportForTool(calendar, tool) {
  const allPosts = [];
  
  if (calendar.weeks) {
    calendar.weeks.forEach(week => {
      Object.values(week.platforms).forEach(platform => {
        allPosts.push(...platform.posts);
      });
    });
  } else {
    Object.values(calendar.platforms).forEach(platform => {
      allPosts.push(...platform.posts);
    });
  }

  switch (tool) {
    case 'buffer':
      return allPosts.map(post => ({
        text: post.notes?.join(' ') || '',
        media: [],
        scheduled_at: `${post.date}T${post.time}:00`,
        profile_ids: [post.platform]
      }));

    case 'hootsuite':
      return allPosts.map(post => ({
        text: post.notes?.join(' ') || '',
        socialNetworkType: post.platform.toUpperCase(),
        scheduledSendTime: `${post.date}T${post.time}:00Z`
      }));

    case 'later':
      return allPosts.map(post => ({
        caption: post.notes?.join(' ') || '',
        platform: post.platform,
        scheduled_time: `${post.date} ${post.time}`,
        media_type: post.contentType === 'reels' ? 'video' : 'image'
      }));

    default:
      return allPosts;
  }
}

export default {
  platformSchedules,
  ContentTypes,
  seasonalThemes,
  generateWeeklyCalendar,
  generateMonthlyCalendar,
  exportToCSV,
  exportForTool
};
