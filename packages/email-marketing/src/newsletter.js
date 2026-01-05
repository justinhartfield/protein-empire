/**
 * Newsletter Generator for the Protein Empire
 * 
 * Generates weekly newsletters and recipe roundups
 * for the entire empire or individual sites.
 */

import { generateWeeklyNewsletter, generateRoundupNewsletter, weeklyTips } from './templates/newsletter.js';

/**
 * Generate weekly newsletter for a site
 * @param {Object} siteConfig - Site configuration
 * @param {Object[]} recipes - Available recipes
 * @param {Object} options - Newsletter options
 * @returns {Object} - Newsletter email
 */
export function generateSiteNewsletter(siteConfig, recipes, options = {}) {
  const {
    weekNumber = getWeekNumber(),
    crossPromoSite = null
  } = options;

  // Sort recipes by date or randomly select
  const shuffledRecipes = [...recipes].sort(() => 0.5 - Math.random());
  const featuredRecipe = shuffledRecipes[0];
  const additionalRecipes = shuffledRecipes.slice(1, 4);

  // Get a tip for this week
  const tip = weeklyTips[weekNumber % weeklyTips.length];

  return generateWeeklyNewsletter({
    siteName: siteConfig.name,
    brandColor: siteConfig.brandColor,
    domain: siteConfig.domain,
    featuredRecipe,
    additionalRecipes,
    tip,
    crossPromoSite,
    weekNumber
  });
}

/**
 * Generate empire-wide newsletter
 * @param {Object} sites - All site configurations
 * @param {Object} recipesByDomain - Recipes organized by domain
 * @param {Object} options - Newsletter options
 * @returns {Object} - Empire newsletter email
 */
export function generateEmpireNewsletter(sites, recipesByDomain, options = {}) {
  const {
    weekNumber = getWeekNumber()
  } = options;

  // Collect best recipes from each site
  const allRecipes = [];
  Object.entries(recipesByDomain).forEach(([domain, recipes]) => {
    if (recipes && recipes.length > 0) {
      const siteConfig = sites[domain];
      // Add domain info to recipes
      recipes.forEach(recipe => {
        allRecipes.push({
          ...recipe,
          domain,
          siteName: siteConfig?.name
        });
      });
    }
  });

  // Sort by protein content and pick top recipes
  const topRecipes = allRecipes
    .sort((a, b) => b.protein - a.protein)
    .slice(0, 5);

  const tip = weeklyTips[weekNumber % weeklyTips.length];

  return {
    subject: `🍪 This Week in the Protein Empire`,
    preheader: `Top recipes from across all 12 sites`,
    html: generateEmpireNewsletterHtml(topRecipes, tip, weekNumber),
    plainText: generateEmpireNewsletterText(topRecipes, tip, weekNumber)
  };
}

/**
 * Generate HTML for empire newsletter
 */
function generateEmpireNewsletterHtml(recipes, tip, weekNumber) {
  const recipeCards = recipes.map(recipe => `
    <tr>
      <td style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="100" style="vertical-align: top;">
              <img src="https://${recipe.domain}/images/${recipe.image}" alt="${recipe.title}" width="100" height="100" style="display: block; border-radius: 8px; object-fit: cover;">
            </td>
            <td style="padding-left: 15px; vertical-align: top;">
              <p style="margin: 0 0 5px 0; color: #f59e0b; font-size: 12px; font-weight: 600; text-transform: uppercase;">${recipe.siteName}</p>
              <h4 style="margin: 0 0 8px 0; color: #1e293b;">${recipe.title}</h4>
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                <strong>${recipe.protein}g protein</strong> • ${recipe.calories} cal
              </p>
              <a href="https://${recipe.domain}/${recipe.slug}" style="color: #f59e0b; font-size: 14px; font-weight: 600; text-decoration: none;">Get Recipe →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🏰 Protein Empire</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Week ${weekNumber} Newsletter</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b;">This Week's Top Recipes 🏆</h2>
              
              <p>Here are the highest-protein recipes from across all 12 sites in the empire!</p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                ${recipeCards}
              </table>
              
              <!-- Tip Section -->
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 30px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">💡 ${tip.title}</h4>
                <p style="margin: 0; color: #78350f;">${tip.content}</p>
              </div>
              
              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #f59e0b;">
                    <a href="https://highprotein.recipes" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">Explore All Sites</a>
                  </td>
                </tr>
              </table>
              
              <p>Happy baking! 🍪</p>
              <p><strong>The Protein Empire Team</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 30px 40px; text-align: center; font-size: 14px; color: #64748b;">
              <p>You're receiving this because you're subscribed to the Protein Empire newsletter.</p>
              <p><a href="{{unsubscribe_url}}" style="color: #94a3b8;">Unsubscribe</a></p>
              <p style="color: #94a3b8;">© ${new Date().getFullYear()} Protein Empire</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate plain text for empire newsletter
 */
function generateEmpireNewsletterText(recipes, tip, weekNumber) {
  let text = `
PROTEIN EMPIRE - Week ${weekNumber} Newsletter
==========================================

This Week's Top Recipes
-----------------------

`;

  recipes.forEach((recipe, index) => {
    text += `${index + 1}. ${recipe.title} (${recipe.siteName})
   ${recipe.protein}g protein | ${recipe.calories} cal
   https://${recipe.domain}/${recipe.slug}

`;
  });

  text += `
💡 ${tip.title}
${tip.content}

Explore all sites: https://highprotein.recipes

Happy baking!
The Protein Empire Team
`;

  return text.trim();
}

/**
 * Generate recipe roundup newsletter
 * @param {Object} siteConfig - Site configuration
 * @param {Object[]} recipes - Recipes to feature
 * @param {string} theme - Roundup theme
 * @returns {Object} - Roundup newsletter
 */
export function generateRecipeRoundup(siteConfig, recipes, theme) {
  const themes = {
    'highest-protein': {
      title: '💪 Highest Protein Recipes',
      intro: 'These recipes pack the most protein per serving!',
      sortFn: (a, b) => b.protein - a.protein
    },
    'lowest-calorie': {
      title: '🥗 Lowest Calorie Recipes',
      intro: 'Maximum flavor, minimum calories!',
      sortFn: (a, b) => a.calories - b.calories
    },
    'quickest': {
      title: '⚡ Quickest Recipes',
      intro: 'Ready in 20 minutes or less!',
      sortFn: (a, b) => parseInt(a.totalTime) - parseInt(b.totalTime)
    },
    'no-bake': {
      title: '🧊 No-Bake Recipes',
      intro: 'No oven required for these delicious treats!',
      filterFn: r => r.tags?.some(t => t.toLowerCase().includes('no-bake') || t.toLowerCase().includes('no bake'))
    },
    'gluten-free': {
      title: '🌾 Gluten-Free Recipes',
      intro: 'Delicious options for gluten-free diets!',
      filterFn: r => r.tags?.some(t => t.toLowerCase().includes('gluten'))
    },
    'vegan': {
      title: '🌱 Vegan Recipes',
      intro: 'Plant-powered protein goodness!',
      filterFn: r => r.tags?.some(t => t.toLowerCase().includes('vegan'))
    }
  };

  const selectedTheme = themes[theme] || themes['highest-protein'];
  
  let filteredRecipes = [...recipes];
  if (selectedTheme.filterFn) {
    filteredRecipes = filteredRecipes.filter(selectedTheme.filterFn);
  }
  if (selectedTheme.sortFn) {
    filteredRecipes.sort(selectedTheme.sortFn);
  }

  return generateRoundupNewsletter({
    siteName: siteConfig.name,
    brandColor: siteConfig.brandColor,
    domain: siteConfig.domain,
    theme: selectedTheme.title,
    recipes: filteredRecipes.slice(0, 5),
    intro: selectedTheme.intro
  });
}

/**
 * Get current week number of the year
 */
function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 604800000; // milliseconds in a week
  return Math.ceil(diff / oneWeek);
}

/**
 * Generate newsletter schedule for a month
 * @param {Object} siteConfig - Site configuration
 * @param {Object[]} recipes - Available recipes
 * @param {Object[]} empireSites - Empire sites for cross-promo
 * @returns {Object[]} - Array of scheduled newsletters
 */
export function generateMonthlySchedule(siteConfig, recipes, empireSites) {
  const schedule = [];
  const currentWeek = getWeekNumber();
  
  for (let i = 0; i < 4; i++) {
    const weekNum = currentWeek + i;
    
    // Rotate through cross-promo sites
    const crossPromoSite = empireSites
      .filter(s => s.domain !== siteConfig.domain)
      [i % (empireSites.length - 1)];

    schedule.push({
      week: weekNum,
      sendDate: getDateForWeek(weekNum),
      type: i % 2 === 0 ? 'weekly' : 'roundup',
      newsletter: i % 2 === 0 
        ? generateSiteNewsletter(siteConfig, recipes, { weekNumber: weekNum, crossPromoSite })
        : generateRecipeRoundup(siteConfig, recipes, ['highest-protein', 'quickest', 'lowest-calorie', 'no-bake'][i % 4])
    });
  }

  return schedule;
}

/**
 * Get date for a specific week number
 */
function getDateForWeek(weekNumber) {
  const year = new Date().getFullYear();
  const date = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  // Adjust to next Sunday (newsletter day)
  date.setDate(date.getDate() + (7 - date.getDay()));
  return date.toISOString().split('T')[0];
}

export default {
  generateSiteNewsletter,
  generateEmpireNewsletter,
  generateRecipeRoundup,
  generateMonthlySchedule
};
