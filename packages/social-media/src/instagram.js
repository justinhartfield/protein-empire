/**
 * Instagram Content Generator for the Protein Empire
 * 
 * Generates optimized Instagram content including:
 * - Feed post captions (max 2,200 characters)
 * - Story content suggestions
 * - Reel descriptions
 * - Hashtag strategies (max 30 hashtags)
 * - Carousel post ideas
 * 
 * Instagram Best Practices:
 * - Use high-quality square (1:1) or vertical (4:5) images
 * - Front-load important content in captions
 * - Use a mix of popular and niche hashtags
 * - Include a clear call-to-action
 * - Engage with community through questions
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
 * Generate Instagram feed post caption
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @param {string} style - Caption style: 'macro', 'story', 'quick'
 * @returns {string} - Optimized caption
 */
export function generateFeedCaption(recipe, siteConfig, style = 'macro') {
  let caption = '';
  
  switch (style) {
    case 'macro':
      caption = generateMacroCaption(recipe, siteConfig);
      break;
    case 'story':
      caption = generateStoryCaption(recipe, siteConfig);
      break;
    case 'quick':
      caption = generateQuickCaption(recipe, siteConfig);
      break;
    default:
      caption = generateMacroCaption(recipe, siteConfig);
  }
  
  // Add call-to-action
  caption += '\n\n' + getRandomItem(callToActions.instagram);
  
  // Add link reference
  caption += '\n\n🔗 Link in bio for the full recipe!';
  
  // Add hashtags (in first comment or at end)
  const igHashtags = generateInstagramHashtags(recipe, siteConfig);
  caption += '\n\n.\n.\n.\n' + igHashtags.join(' ');
  
  return caption;
}

/**
 * Generate macro-focused caption
 */
function generateMacroCaption(recipe, siteConfig) {
  const emoji = getRandomItem(emojis.food);
  const fitnessEmoji = getRandomItem(emojis.fitness);
  
  return `${emoji} ${recipe.title.toUpperCase()} ${emoji}

${fitnessEmoji} ${recipe.protein}g protein per serving!

These ${siteConfig.foodType} are perfect for anyone tracking macros. Soft, delicious, and packed with protein.

📊 MACROS PER SERVING:
━━━━━━━━━━━━━━━━━━
🔸 Protein: ${recipe.protein}g
🔸 Calories: ${recipe.calories}
🔸 Carbs: ${recipe.carbs}g
🔸 Fat: ${recipe.fat}g
${recipe.fiber ? `🔸 Fiber: ${recipe.fiber}g` : ''}
━━━━━━━━━━━━━━━━━━

⏱️ Ready in just ${recipe.totalTime} minutes!
🍽️ Makes ${recipe.yield}`;
}

/**
 * Generate storytelling caption
 */
function generateStoryCaption(recipe, siteConfig) {
  const emoji = getRandomItem(emojis.reactions);
  
  return `Okay but can we talk about these ${recipe.title}? ${emoji}

I've been working on this recipe for weeks, testing different ratios of protein powder to get that perfect texture. And honestly? These might be my new favorite.

The secret is using ${recipe.ingredients[0].split(' ').slice(1).join(' ')} as the base - it gives you that soft, ${siteConfig.foodType === 'cookies' ? 'chewy' : 'fluffy'} texture without making them dry or chalky.

Each one has ${recipe.protein}g of protein and only ${recipe.calories} calories. Perfect for meal prep or when those late-night cravings hit.

Trust me, you NEED to try these. Recipe is on the site!`;
}

/**
 * Generate quick/simple caption
 */
function generateQuickCaption(recipe, siteConfig) {
  const emoji = getRandomItem(emojis.food);
  
  return `${emoji} ${recipe.title}

${recipe.protein}g protein | ${recipe.calories} cal | ${recipe.totalTime} min

Simple. Delicious. Macro-friendly.

Would you try these?`;
}

/**
 * Generate Instagram hashtags (max 30)
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {string[]} - Array of hashtags
 */
export function generateInstagramHashtags(recipe, siteConfig) {
  const tags = new Set();
  
  // Add core hashtags (high reach)
  getRandomItems(hashtags.core, 5).forEach(tag => tags.add(tag));
  
  // Add Instagram-specific hashtags (community)
  getRandomItems(hashtags.instagram, 8).forEach(tag => tags.add(tag));
  
  // Add category-specific hashtags (niche)
  const categoryTags = hashtags.categories[siteConfig.foodType] || [];
  categoryTags.forEach(tag => tags.add(tag));
  
  // Add diet-specific hashtags
  if (recipe.tags) {
    recipe.tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
      if (hashtags.diets[normalizedTag]) {
        hashtags.diets[normalizedTag].forEach(t => tags.add(t));
      }
    });
  }
  
  // Add protein-level hashtags
  if (recipe.protein >= 30) {
    tags.add('#30gprotein');
    tags.add('#highproteinrecipe');
  } else if (recipe.protein >= 20) {
    tags.add('#20gprotein');
  }
  
  // Add calorie-level hashtags
  if (recipe.calories < 200) {
    tags.add('#under200calories');
    tags.add('#lowcalorie');
  }
  
  // Add method hashtags
  if (recipe.tags?.some(t => t.toLowerCase().includes('no-bake') || t.toLowerCase().includes('no bake'))) {
    tags.add('#nobake');
    tags.add('#nobakerecipe');
  }
  
  return Array.from(tags).slice(0, 30);
}

/**
 * Generate Instagram Story content suggestions
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object[]} - Array of story slide suggestions
 */
export function generateStoryContent(recipe, siteConfig) {
  return [
    {
      slide: 1,
      type: 'intro',
      content: `NEW RECIPE 🎉`,
      subtext: recipe.title,
      sticker: 'countdown',
      background: 'recipe_image'
    },
    {
      slide: 2,
      type: 'macros',
      content: `${recipe.protein}g PROTEIN`,
      subtext: `${recipe.calories} calories per serving`,
      sticker: 'poll',
      pollQuestion: 'Would you try this?',
      pollOptions: ['YES 🙌', 'Maybe later']
    },
    {
      slide: 3,
      type: 'ingredients',
      content: 'INGREDIENTS',
      subtext: recipe.ingredients.slice(0, 5).join('\n'),
      sticker: 'quiz',
      quizQuestion: 'How much protein per serving?',
      quizOptions: [`${recipe.protein}g ✓`, `${recipe.protein - 5}g`, `${recipe.protein + 5}g`]
    },
    {
      slide: 4,
      type: 'cta',
      content: 'LINK IN BIO',
      subtext: 'for the full recipe!',
      sticker: 'link',
      linkUrl: `https://${siteConfig.domain}/${recipe.slug}`
    }
  ];
}

/**
 * Generate Instagram Reel description
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object} - Reel content package
 */
export function generateReelContent(recipe, siteConfig) {
  const hooks = [
    `${recipe.protein}g protein ${siteConfig.foodType} that actually taste good`,
    `POV: You found the perfect macro-friendly ${siteConfig.foodType}`,
    `The ${siteConfig.foodType} recipe that broke my meal prep`,
    `Making ${recipe.title} (${recipe.protein}g protein!)`,
    `Wait for the macros... 👀`
  ];
  
  return {
    hook: getRandomItem(hooks),
    caption: `${recipe.title} 🔥

${recipe.protein}g protein | ${recipe.calories} cal

Full recipe in bio!

${generateInstagramHashtags(recipe, siteConfig).slice(0, 15).join(' ')}`,
    suggestedAudio: [
      'Trending audio',
      'Original audio with voiceover',
      'ASMR cooking sounds'
    ],
    suggestedLength: '15-30 seconds',
    contentIdeas: [
      'Time-lapse of mixing ingredients',
      'Close-up texture shots',
      'Before/after baking reveal',
      'Macro breakdown overlay',
      'Taste test reaction'
    ]
  };
}

/**
 * Generate carousel post ideas
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object} - Carousel content package
 */
export function generateCarouselContent(recipe, siteConfig) {
  return {
    slides: [
      {
        slide: 1,
        type: 'cover',
        content: recipe.title,
        subtext: `${recipe.protein}g Protein Recipe`
      },
      {
        slide: 2,
        type: 'macros',
        content: 'NUTRITION FACTS',
        details: {
          protein: `${recipe.protein}g`,
          calories: recipe.calories,
          carbs: `${recipe.carbs}g`,
          fat: `${recipe.fat}g`
        }
      },
      {
        slide: 3,
        type: 'ingredients',
        content: 'INGREDIENTS',
        list: recipe.ingredients
      },
      ...recipe.instructions.slice(0, 4).map((step, i) => ({
        slide: 4 + i,
        type: 'step',
        content: `STEP ${i + 1}`,
        details: step.text
      })),
      {
        slide: recipe.instructions.length + 4,
        type: 'final',
        content: 'SAVE THIS RECIPE!',
        subtext: 'Link in bio for printable version'
      }
    ],
    caption: generateFeedCaption(recipe, siteConfig, 'quick')
  };
}

/**
 * Generate complete Instagram content package for all recipes
 * @param {Object[]} recipes - Array of recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object} - Complete Instagram content package
 */
export function generateInstagramPackage(recipes, siteConfig) {
  return {
    site: siteConfig.domain,
    siteName: siteConfig.name,
    generatedAt: new Date().toISOString(),
    linktreeUrl: `https://linktr.ee/proteinempire`, // Suggested
    posts: recipes.map(recipe => ({
      recipeId: recipe.id,
      recipeSlug: recipe.slug,
      recipeTitle: recipe.title,
      feedPost: {
        macroCaption: generateFeedCaption(recipe, siteConfig, 'macro'),
        storyCaption: generateFeedCaption(recipe, siteConfig, 'story'),
        quickCaption: generateFeedCaption(recipe, siteConfig, 'quick')
      },
      stories: generateStoryContent(recipe, siteConfig),
      reel: generateReelContent(recipe, siteConfig),
      carousel: generateCarouselContent(recipe, siteConfig),
      hashtags: generateInstagramHashtags(recipe, siteConfig)
    }))
  };
}

export default {
  generateFeedCaption,
  generateInstagramHashtags,
  generateStoryContent,
  generateReelContent,
  generateCarouselContent,
  generateInstagramPackage
};
