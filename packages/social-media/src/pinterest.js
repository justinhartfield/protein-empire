/**
 * Pinterest Content Generator for the Protein Empire
 * 
 * Generates optimized Pinterest pin content including:
 * - SEO-optimized titles (max 100 characters)
 * - Keyword-rich descriptions (max 500 characters)
 * - Hashtags for discovery
 * - Multiple pin variations per recipe
 * 
 * Pinterest Best Practices:
 * - Use vertical images (2:3 ratio, 1000x1500px ideal)
 * - Include keywords naturally in title and description
 * - Add relevant hashtags (up to 20)
 * - Include a clear call-to-action
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
 * Generate Pinterest pin title (max 100 characters)
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @param {number} variation - Variation number (0-2)
 * @returns {string} - Optimized pin title
 */
export function generatePinTitle(recipe, siteConfig, variation = 0) {
  const templates = hooks.pinterest.title;
  const template = templates[variation % templates.length];
  let title = fillTemplate(template, recipe, siteConfig);
  
  // Ensure title is under 100 characters
  if (title.length > 100) {
    title = title.substring(0, 97) + '...';
  }
  
  return title;
}

/**
 * Generate Pinterest pin description (max 500 characters)
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @param {number} variation - Variation number (0-2)
 * @returns {string} - Optimized pin description with hashtags
 */
export function generatePinDescription(recipe, siteConfig, variation = 0) {
  const templates = hooks.pinterest.description;
  const template = templates[variation % templates.length];
  let description = fillTemplate(template, recipe, siteConfig);
  
  // Add call-to-action
  const cta = getRandomItem(callToActions.pinterest);
  description += '\n\n' + cta;
  
  // Add recipe link
  const recipeUrl = `https://${siteConfig.domain}/${recipe.slug}`;
  description += '\n\n📖 Full recipe: ' + recipeUrl;
  
  // Generate hashtags
  const pinHashtags = generatePinHashtags(recipe, siteConfig);
  description += '\n\n' + pinHashtags.join(' ');
  
  // Ensure description is under 500 characters
  if (description.length > 500) {
    // Remove some hashtags to fit
    const hashtagStart = description.lastIndexOf('\n\n#');
    if (hashtagStart > 0) {
      const baseDescription = description.substring(0, hashtagStart);
      const availableSpace = 500 - baseDescription.length - 2;
      const hashtagString = pinHashtags.slice(0, 5).join(' ');
      description = baseDescription + '\n\n' + hashtagString.substring(0, availableSpace);
    }
  }
  
  return description;
}

/**
 * Generate Pinterest hashtags for a recipe
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {string[]} - Array of hashtags
 */
export function generatePinHashtags(recipe, siteConfig) {
  const tags = new Set();
  
  // Add core hashtags
  getRandomItems(hashtags.core, 3).forEach(tag => tags.add(tag));
  
  // Add Pinterest-specific hashtags
  getRandomItems(hashtags.pinterest, 4).forEach(tag => tags.add(tag));
  
  // Add category-specific hashtags
  const categoryTags = hashtags.categories[siteConfig.foodType] || [];
  categoryTags.forEach(tag => tags.add(tag));
  
  // Add diet-specific hashtags based on recipe tags
  if (recipe.tags) {
    recipe.tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
      if (hashtags.diets[normalizedTag]) {
        getRandomItems(hashtags.diets[normalizedTag], 2).forEach(t => tags.add(t));
      }
    });
  }
  
  // Add protein-specific hashtag
  if (recipe.protein >= 30) {
    tags.add('#highprotein30g');
  } else if (recipe.protein >= 20) {
    tags.add('#highprotein20g');
  }
  
  return Array.from(tags).slice(0, 15); // Pinterest allows up to 20, we use 15
}

/**
 * Generate multiple pin variations for a single recipe
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @param {number} count - Number of variations to generate
 * @returns {Object[]} - Array of pin content objects
 */
export function generatePinVariations(recipe, siteConfig, count = 3) {
  const variations = [];
  
  for (let i = 0; i < count; i++) {
    variations.push({
      title: generatePinTitle(recipe, siteConfig, i),
      description: generatePinDescription(recipe, siteConfig, i),
      hashtags: generatePinHashtags(recipe, siteConfig),
      recipeUrl: `https://${siteConfig.domain}/${recipe.slug}`,
      imageUrl: `https://${siteConfig.domain}/images/${recipe.image}`,
      variation: i + 1,
      boardSuggestions: generateBoardSuggestions(recipe, siteConfig)
    });
  }
  
  return variations;
}

/**
 * Generate suggested Pinterest board names
 * @param {Object} recipe - Recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {string[]} - Array of suggested board names
 */
export function generateBoardSuggestions(recipe, siteConfig) {
  const boards = [
    'High Protein Recipes',
    'Macro Friendly Recipes',
    'Healthy Baking',
    'Fitness Food'
  ];
  
  // Add category-specific board
  const foodType = siteConfig.foodType.charAt(0).toUpperCase() + siteConfig.foodType.slice(1);
  boards.push(`Protein ${foodType} Recipes`);
  
  // Add diet-specific boards
  if (recipe.tags) {
    if (recipe.tags.some(t => t.toLowerCase().includes('gluten'))) {
      boards.push('Gluten Free Recipes');
    }
    if (recipe.tags.some(t => t.toLowerCase().includes('vegan'))) {
      boards.push('Vegan Protein Recipes');
    }
  }
  
  return boards;
}

/**
 * Generate a complete Pinterest content package for all recipes
 * @param {Object[]} recipes - Array of recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object} - Complete Pinterest content package
 */
export function generatePinterestPackage(recipes, siteConfig) {
  const package_ = {
    site: siteConfig.domain,
    siteName: siteConfig.name,
    generatedAt: new Date().toISOString(),
    totalPins: 0,
    pins: []
  };
  
  recipes.forEach(recipe => {
    const variations = generatePinVariations(recipe, siteConfig, 3);
    package_.pins.push({
      recipeId: recipe.id,
      recipeSlug: recipe.slug,
      recipeTitle: recipe.title,
      variations
    });
    package_.totalPins += variations.length;
  });
  
  return package_;
}

export default {
  generatePinTitle,
  generatePinDescription,
  generatePinHashtags,
  generatePinVariations,
  generateBoardSuggestions,
  generatePinterestPackage
};
