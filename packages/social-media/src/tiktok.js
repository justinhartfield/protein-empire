/**
 * TikTok Content Generator for the Protein Empire
 * 
 * Generates optimized TikTok content including:
 * - Video captions (max 2,200 characters)
 * - Hook suggestions for first 3 seconds
 * - Trending audio recommendations
 * - Hashtag strategies
 * - Content format ideas
 * 
 * TikTok Best Practices:
 * - Hook viewers in first 1-3 seconds
 * - Use trending sounds when relevant
 * - Keep videos 15-60 seconds for best reach
 * - Use text overlays for key information
 * - Post consistently (1-3x daily ideal)
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
 * Generate TikTok video caption
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @param {string} style - Caption style: 'hook', 'informative', 'casual'
 * @returns {string} - Optimized caption
 */
export function generateTikTokCaption(recipe, siteConfig, style = 'hook') {
  let caption = '';
  
  switch (style) {
    case 'hook':
      caption = generateHookCaption(recipe, siteConfig);
      break;
    case 'informative':
      caption = generateInformativeCaption(recipe, siteConfig);
      break;
    case 'casual':
      caption = generateCasualCaption(recipe, siteConfig);
      break;
    default:
      caption = generateHookCaption(recipe, siteConfig);
  }
  
  // Add hashtags
  const tiktokHashtags = generateTikTokHashtags(recipe, siteConfig);
  caption += '\n\n' + tiktokHashtags.join(' ');
  
  return caption;
}

/**
 * Generate hook-style caption (attention-grabbing)
 */
function generateHookCaption(recipe, siteConfig) {
  const hookTemplates = [
    `${recipe.protein}g protein ${siteConfig.foodType} that actually taste good 🤯`,
    `POV: you found the perfect macro-friendly ${siteConfig.foodType} recipe`,
    `The ${siteConfig.foodType} recipe that changed my meal prep forever`,
    `Wait for the macros... ${recipe.protein}g protein 💪`,
    `Making ${recipe.title} and they're INSANE`,
    `${recipe.protein}g protein. ${recipe.calories} calories. You're welcome.`,
    `The internet needs to know about these ${siteConfig.foodType}`,
    `Gym bros are gonna love this one 🏋️`
  ];
  
  return getRandomItem(hookTemplates);
}

/**
 * Generate informative caption
 */
function generateInformativeCaption(recipe, siteConfig) {
  return `${recipe.title} Recipe 🍪

📊 Macros per serving:
• ${recipe.protein}g protein
• ${recipe.calories} calories  
• ${recipe.carbs}g carbs
• ${recipe.fat}g fat

⏱️ ${recipe.totalTime} min to make
🍽️ Makes ${recipe.yield}

Full recipe link in bio!`;
}

/**
 * Generate casual caption
 */
function generateCasualCaption(recipe, siteConfig) {
  const casualTemplates = [
    `obsessed with these rn 😍`,
    `meal prep just got way better`,
    `the recipe everyone's been asking for`,
    `trust me on this one`,
    `you NEED to try these`,
    `game changer fr fr`
  ];
  
  return `${recipe.title} - ${recipe.protein}g protein 💪\n\n${getRandomItem(casualTemplates)}`;
}

/**
 * Generate TikTok hashtags
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {string[]} - Array of hashtags
 */
export function generateTikTokHashtags(recipe, siteConfig) {
  const tags = new Set();
  
  // Add TikTok discovery hashtags (essential)
  tags.add('#fyp');
  tags.add('#foryou');
  tags.add('#foryoupage');
  
  // Add TikTok-specific hashtags
  getRandomItems(hashtags.tiktok, 5).forEach(tag => tags.add(tag));
  
  // Add core protein hashtags
  getRandomItems(hashtags.core, 3).forEach(tag => tags.add(tag));
  
  // Add category-specific hashtags
  const categoryTags = hashtags.categories[siteConfig.foodType] || [];
  getRandomItems(categoryTags, 2).forEach(tag => tags.add(tag));
  
  // Add trending fitness hashtags
  tags.add('#gymtok');
  tags.add('#proteintok');
  tags.add('#healthytok');
  
  // Add diet-specific if applicable
  if (recipe.tags) {
    if (recipe.tags.some(t => t.toLowerCase().includes('vegan'))) {
      tags.add('#vegantiktok');
    }
    if (recipe.tags.some(t => t.toLowerCase().includes('gluten'))) {
      tags.add('#glutenfreetiktok');
    }
  }
  
  return Array.from(tags).slice(0, 15); // TikTok shows ~5-6 in caption
}

/**
 * Generate video hook suggestions (first 3 seconds)
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object[]} - Array of hook suggestions
 */
export function generateVideoHooks(recipe, siteConfig) {
  return [
    {
      type: 'question',
      text: `Want ${siteConfig.foodType} with ${recipe.protein}g of protein?`,
      onScreen: `${recipe.protein}g PROTEIN ${siteConfig.foodType.toUpperCase()}`,
      timing: '0-3 seconds'
    },
    {
      type: 'statement',
      text: `These ${siteConfig.foodType} have ${recipe.protein} grams of protein`,
      onScreen: `WAIT FOR IT...`,
      timing: '0-3 seconds'
    },
    {
      type: 'pov',
      text: `POV: You found the perfect macro-friendly ${siteConfig.foodType}`,
      onScreen: `POV: Perfect ${siteConfig.foodType}`,
      timing: '0-3 seconds'
    },
    {
      type: 'challenge',
      text: `I bet you can't guess how much protein is in these`,
      onScreen: `GUESS THE PROTEIN 👀`,
      timing: '0-3 seconds'
    },
    {
      type: 'reveal',
      text: `The ${siteConfig.foodType} recipe that broke my meal prep`,
      onScreen: `GAME CHANGER 🔥`,
      timing: '0-3 seconds'
    }
  ];
}

/**
 * Generate video content structure
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object} - Video structure guide
 */
export function generateVideoStructure(recipe, siteConfig) {
  return {
    format: 'recipe-reveal',
    duration: '30-45 seconds',
    sections: [
      {
        name: 'Hook',
        duration: '0-3s',
        content: 'Attention-grabbing statement or question',
        textOverlay: `${recipe.protein}g PROTEIN`,
        tips: ['Show finished product', 'Use trending sound', 'Make a bold claim']
      },
      {
        name: 'Ingredients Flash',
        duration: '3-8s',
        content: 'Quick cuts of ingredients',
        textOverlay: 'INGREDIENTS',
        tips: ['Show each ingredient briefly', 'Use satisfying sounds', 'Keep pace fast']
      },
      {
        name: 'Process Montage',
        duration: '8-20s',
        content: 'Time-lapse or quick cuts of making',
        textOverlay: 'Step numbers or tips',
        tips: ['Show mixing, pouring, shaping', 'Include satisfying moments', 'Speed up boring parts']
      },
      {
        name: 'Baking/Setting',
        duration: '20-25s',
        content: 'Quick shot of oven/fridge',
        textOverlay: `${recipe.cookTime} MIN`,
        tips: ['Can skip or speed up', 'Show timer if relevant']
      },
      {
        name: 'Reveal',
        duration: '25-35s',
        content: 'Show finished product',
        textOverlay: 'THE RESULT',
        tips: ['Slow motion pull apart', 'Show texture', 'Make it look delicious']
      },
      {
        name: 'Macros',
        duration: '35-40s',
        content: 'Display nutrition info',
        textOverlay: `${recipe.protein}g protein | ${recipe.calories} cal`,
        tips: ['Use clean graphics', 'Highlight protein', 'Keep on screen 3+ seconds']
      },
      {
        name: 'CTA',
        duration: '40-45s',
        content: 'Call to action',
        textOverlay: 'RECIPE IN BIO',
        tips: ['Point to bio', 'Ask to follow', 'Encourage saves']
      }
    ]
  };
}

/**
 * Generate trending audio suggestions
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object[]} - Array of audio suggestions
 */
export function generateAudioSuggestions(recipe, siteConfig) {
  return [
    {
      type: 'trending',
      description: 'Use current trending sound',
      tips: 'Check TikTok Creative Center for trending sounds',
      bestFor: 'Maximum reach'
    },
    {
      type: 'asmr',
      description: 'Original ASMR cooking sounds',
      tips: 'Mixing, sizzling, crunching sounds',
      bestFor: 'Satisfying content'
    },
    {
      type: 'voiceover',
      description: 'Personal voiceover explaining recipe',
      tips: 'Keep it casual and conversational',
      bestFor: 'Building connection'
    },
    {
      type: 'music',
      description: 'Upbeat background music',
      tips: 'Match energy to video pace',
      bestFor: 'Quick recipe videos'
    },
    {
      type: 'text-to-speech',
      description: 'TikTok text-to-speech feature',
      tips: 'Good for ingredient lists',
      bestFor: 'Accessibility'
    }
  ];
}

/**
 * Generate content ideas for a recipe
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object[]} - Array of content ideas
 */
export function generateContentIdeas(recipe, siteConfig) {
  return [
    {
      format: 'Standard Recipe',
      description: `Full recipe video for ${recipe.title}`,
      duration: '30-45s',
      difficulty: 'Easy'
    },
    {
      format: 'Macro Reveal',
      description: 'Focus on the impressive protein content',
      duration: '15-20s',
      difficulty: 'Easy'
    },
    {
      format: 'Taste Test',
      description: 'React to trying the finished product',
      duration: '15-30s',
      difficulty: 'Easy'
    },
    {
      format: 'Meal Prep',
      description: `Making a batch of ${recipe.yield} for the week`,
      duration: '30-60s',
      difficulty: 'Medium'
    },
    {
      format: 'Ingredient Swap',
      description: 'Show variations (vegan, GF, etc.)',
      duration: '30-45s',
      difficulty: 'Medium'
    },
    {
      format: 'Duet/Stitch',
      description: 'React to someone asking for protein recipes',
      duration: '15-30s',
      difficulty: 'Easy'
    },
    {
      format: 'Day in the Life',
      description: `Include ${recipe.title} in a full day of eating`,
      duration: '60-90s',
      difficulty: 'Hard'
    }
  ];
}

/**
 * Generate complete TikTok content package for all recipes
 * @param {Object[]} recipes - Array of recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object} - Complete TikTok content package
 */
export function generateTikTokPackage(recipes, siteConfig) {
  return {
    site: siteConfig.domain,
    siteName: siteConfig.name,
    generatedAt: new Date().toISOString(),
    accountTips: {
      postingFrequency: '1-3 times daily',
      bestTimes: ['7-9 AM', '12-2 PM', '7-9 PM'],
      profileBio: `${siteConfig.name} | High-Protein ${siteConfig.foodType.charAt(0).toUpperCase() + siteConfig.foodType.slice(1)} Recipes 🍪💪\nFree recipes 👇`,
      linkInBio: `https://${siteConfig.domain}`
    },
    videos: recipes.map(recipe => ({
      recipeId: recipe.id,
      recipeSlug: recipe.slug,
      recipeTitle: recipe.title,
      captions: {
        hook: generateTikTokCaption(recipe, siteConfig, 'hook'),
        informative: generateTikTokCaption(recipe, siteConfig, 'informative'),
        casual: generateTikTokCaption(recipe, siteConfig, 'casual')
      },
      hooks: generateVideoHooks(recipe, siteConfig),
      structure: generateVideoStructure(recipe, siteConfig),
      audioSuggestions: generateAudioSuggestions(recipe, siteConfig),
      contentIdeas: generateContentIdeas(recipe, siteConfig),
      hashtags: generateTikTokHashtags(recipe, siteConfig)
    }))
  };
}

export default {
  generateTikTokCaption,
  generateTikTokHashtags,
  generateVideoHooks,
  generateVideoStructure,
  generateAudioSuggestions,
  generateContentIdeas,
  generateTikTokPackage
};
