/**
 * Facebook Content Generator for the Protein Empire
 * 
 * Generates optimized Facebook content including:
 * - Page post content
 * - Group post content
 * - Recipe roundup posts
 * - Engagement-focused content
 * - Cross-promotion posts
 * 
 * Facebook Best Practices:
 * - Use eye-catching images
 * - Ask questions to drive engagement
 * - Post at optimal times (1-4 PM)
 * - Use Facebook-native features (polls, events)
 * - Build community through conversation
 */

import {
  hashtags,
  emojis,
  callToActions,
  hooks,
  getRandomItem,
  getRandomItems,
  fillTemplate
} from './templates.js';

/**
 * Generate Facebook page post
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @param {string} style - Post style: 'announcement', 'engagement', 'value'
 * @returns {string} - Optimized post content
 */
export function generatePagePost(recipe, siteConfig, style = 'announcement') {
  let post = '';
  
  switch (style) {
    case 'announcement':
      post = generateAnnouncementPost(recipe, siteConfig);
      break;
    case 'engagement':
      post = generateEngagementPost(recipe, siteConfig);
      break;
    case 'value':
      post = generateValuePost(recipe, siteConfig);
      break;
    default:
      post = generateAnnouncementPost(recipe, siteConfig);
  }
  
  // Add link
  post += `\n\n🔗 Get the full recipe: https://${siteConfig.domain}/${recipe.slug}`;
  
  // Add call-to-action
  post += '\n\n' + getRandomItem(callToActions.facebook);
  
  return post;
}

/**
 * Generate announcement-style post
 */
function generateAnnouncementPost(recipe, siteConfig) {
  const emoji = getRandomItem(emojis.food);
  
  return `${emoji} NEW RECIPE ALERT! ${emoji}

Just dropped a new ${recipe.title} recipe on the site and you guys are going to LOVE it.

📊 Macros per serving:
• Protein: ${recipe.protein}g
• Calories: ${recipe.calories}
• Carbs: ${recipe.carbs}g
• Fat: ${recipe.fat}g

⏱️ Ready in just ${recipe.totalTime} minutes
🍽️ Makes ${recipe.yield}

Perfect for meal prep or when those ${siteConfig.foodType} cravings hit!`;
}

/**
 * Generate engagement-focused post
 */
function generateEngagementPost(recipe, siteConfig) {
  const questions = [
    `Who else is always looking for high-protein ${siteConfig.foodType} recipes? 🙋`,
    `Be honest - would you try these? 👀`,
    `What's your go-to protein ${siteConfig.foodType} flavor? Drop it below! 👇`,
    `Rate these macros: ${recipe.protein}g protein, ${recipe.calories} calories 🤔`,
    `Tag someone who NEEDS to see this recipe! 👥`
  ];
  
  return `${getRandomItem(questions)}

This ${recipe.title} recipe has ${recipe.protein}g of protein per serving and tastes absolutely amazing.

The secret? Using the right ratio of protein powder to keep them soft and delicious, not dry and chalky.

📊 Full macros:
• ${recipe.protein}g protein
• ${recipe.calories} calories
• ${recipe.carbs}g carbs
• ${recipe.fat}g fat`;
}

/**
 * Generate value-focused post (tips/education)
 */
function generateValuePost(recipe, siteConfig) {
  return `💡 PROTEIN BAKING TIP

One of the biggest mistakes people make with protein ${siteConfig.foodType} is using too much protein powder. It makes them dry and crumbly.

The key is balance. In this ${recipe.title} recipe, we use just ${recipe.ingredients.find(i => i.toLowerCase().includes('protein'))?.split(' ')[0] || '60g'} of protein powder combined with other ingredients that add moisture and texture.

The result? ${recipe.protein}g of protein per serving that actually tastes like real ${siteConfig.foodType}!

📊 Macros:
• Protein: ${recipe.protein}g
• Calories: ${recipe.calories}
• Carbs: ${recipe.carbs}g
• Fat: ${recipe.fat}g`;
}

/**
 * Generate recipe roundup post (multiple recipes)
 * @param {Object[]} recipes - Array of recipes to feature
 * @param {Object} siteConfig - Site configuration
 * @param {string} theme - Roundup theme
 * @returns {string} - Roundup post content
 */
export function generateRoundupPost(recipes, siteConfig, theme = 'weekly') {
  const themes = {
    weekly: {
      title: `🔥 This Week's Top ${siteConfig.foodType.charAt(0).toUpperCase() + siteConfig.foodType.slice(1)} Recipes`,
      intro: `Here are the most popular recipes from this week!`
    },
    protein: {
      title: `💪 Highest Protein ${siteConfig.foodType.charAt(0).toUpperCase() + siteConfig.foodType.slice(1)} Recipes`,
      intro: `Looking to maximize your protein intake? These recipes pack the biggest punch!`
    },
    quick: {
      title: `⚡ Quick & Easy ${siteConfig.foodType.charAt(0).toUpperCase() + siteConfig.foodType.slice(1)} Recipes`,
      intro: `Short on time? These recipes are ready in under 20 minutes!`
    },
    beginner: {
      title: `🌟 Best ${siteConfig.foodType.charAt(0).toUpperCase() + siteConfig.foodType.slice(1)} Recipes for Beginners`,
      intro: `New to protein baking? Start with these foolproof recipes!`
    }
  };
  
  const selectedTheme = themes[theme] || themes.weekly;
  
  let post = `${selectedTheme.title}\n\n${selectedTheme.intro}\n\n`;
  
  recipes.slice(0, 5).forEach((recipe, index) => {
    post += `${index + 1}️⃣ ${recipe.title}\n`;
    post += `   📊 ${recipe.protein}g protein | ${recipe.calories} cal\n`;
    post += `   🔗 https://${siteConfig.domain}/${recipe.slug}\n\n`;
  });
  
  post += `Which one are you trying first? Let us know in the comments! 👇`;
  
  return post;
}

/**
 * Generate cross-promotion post (promoting other empire sites)
 * @param {Object} sourceSite - Current site config
 * @param {Object} targetSite - Site to promote
 * @param {Object} targetRecipe - Recipe from target site to feature
 * @returns {string} - Cross-promotion post content
 */
export function generateCrossPromoPost(sourceSite, targetSite, targetRecipe) {
  return `🌟 FROM OUR SISTER SITE 🌟

Love our ${sourceSite.foodType} recipes? You'll also love ${targetSite.name}!

Check out this amazing ${targetRecipe.title}:

📊 Macros:
• Protein: ${targetRecipe.protein}g
• Calories: ${targetRecipe.calories}
• Carbs: ${targetRecipe.carbs}g
• Fat: ${targetRecipe.fat}g

🔗 Get the recipe: https://${targetSite.domain}/${targetRecipe.slug}

The Protein Empire has 12 specialized sites covering everything from ${sourceSite.foodType} to ${targetSite.foodType}. Follow them all for endless macro-friendly recipe inspiration!

#ProteinEmpire #${targetSite.name.replace(/\s/g, '')}`;
}

/**
 * Generate group post (for Facebook groups)
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {string} - Group-friendly post content
 */
export function generateGroupPost(recipe, siteConfig) {
  return `Hey everyone! 👋

I wanted to share a recipe I've been making on repeat lately - ${recipe.title}.

What I love about it:
✅ ${recipe.protein}g protein per serving
✅ Only ${recipe.calories} calories
✅ Ready in ${recipe.totalTime} minutes
✅ Actually tastes amazing (not dry or chalky!)

The full recipe with exact measurements is on my site: https://${siteConfig.domain}/${recipe.slug}

Has anyone else tried making protein ${siteConfig.foodType}? Would love to hear your tips and variations!`;
}

/**
 * Generate poll post
 * @param {Object[]} recipes - Recipes to include in poll
 * @param {Object} siteConfig - Site configuration
 * @returns {Object} - Poll content with options
 */
export function generatePollPost(recipes, siteConfig) {
  const pollRecipes = recipes.slice(0, 4);
  
  return {
    question: `Which ${siteConfig.foodType} recipe should I make next? 🤔`,
    options: pollRecipes.map(r => `${r.title} (${r.protein}g protein)`),
    followUp: `Vote and I'll share the winner's recipe this weekend! The recipes are all on ${siteConfig.domain} if you want to try them yourself.`
  };
}

/**
 * Generate event post (for live cooking, Q&A, etc.)
 * @param {Object} recipe - Featured recipe
 * @param {Object} siteConfig - Site configuration
 * @param {Object} eventDetails - Event information
 * @returns {string} - Event post content
 */
export function generateEventPost(recipe, siteConfig, eventDetails) {
  const { date, time, type } = eventDetails;
  
  const eventTypes = {
    live: {
      title: '🔴 LIVE COOKING SESSION',
      description: `Join me LIVE as I make ${recipe.title} from scratch!`
    },
    qa: {
      title: '❓ PROTEIN BAKING Q&A',
      description: `Got questions about protein ${siteConfig.foodType}? I'm answering them all!`
    },
    challenge: {
      title: '🏆 WEEKLY BAKING CHALLENGE',
      description: `This week's challenge: Make ${recipe.title} and share your results!`
    }
  };
  
  const selectedType = eventTypes[type] || eventTypes.live;
  
  return `${selectedType.title}

${selectedType.description}

📅 Date: ${date}
⏰ Time: ${time}
📍 Right here on this page!

Featured Recipe: ${recipe.title}
📊 ${recipe.protein}g protein | ${recipe.calories} calories

Set a reminder so you don't miss it! 🔔

#ProteinEmpire #${siteConfig.name.replace(/\s/g, '')} #LiveCooking`;
}

/**
 * Generate complete Facebook content package for all recipes
 * @param {Object[]} recipes - Array of recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object} - Complete Facebook content package
 */
export function generateFacebookPackage(recipes, siteConfig) {
  return {
    site: siteConfig.domain,
    siteName: siteConfig.name,
    generatedAt: new Date().toISOString(),
    pageTips: {
      postingFrequency: '1-2 times daily',
      bestTimes: ['1-4 PM weekdays', '12-1 PM weekends'],
      pageDescription: `${siteConfig.name} - Macro-verified high-protein ${siteConfig.foodType} recipes. ${siteConfig.description}`,
      coverPhotoTip: 'Use a collage of your best recipe photos'
    },
    posts: recipes.map(recipe => ({
      recipeId: recipe.id,
      recipeSlug: recipe.slug,
      recipeTitle: recipe.title,
      pagePost: {
        announcement: generatePagePost(recipe, siteConfig, 'announcement'),
        engagement: generatePagePost(recipe, siteConfig, 'engagement'),
        value: generatePagePost(recipe, siteConfig, 'value')
      },
      groupPost: generateGroupPost(recipe, siteConfig)
    })),
    roundups: {
      weekly: generateRoundupPost(recipes.slice(0, 5), siteConfig, 'weekly'),
      highProtein: generateRoundupPost(
        [...recipes].sort((a, b) => b.protein - a.protein).slice(0, 5),
        siteConfig,
        'protein'
      ),
      quick: generateRoundupPost(
        recipes.filter(r => parseInt(r.totalTime) <= 20).slice(0, 5),
        siteConfig,
        'quick'
      )
    },
    polls: [
      generatePollPost(recipes.slice(0, 4), siteConfig),
      generatePollPost(recipes.slice(4, 8), siteConfig)
    ]
  };
}

export default {
  generatePagePost,
  generateRoundupPost,
  generateCrossPromoPost,
  generateGroupPost,
  generatePollPost,
  generateEventPost,
  generateFacebookPackage
};
