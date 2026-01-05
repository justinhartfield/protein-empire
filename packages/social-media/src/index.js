/**
 * Protein Empire Social Media Content Generator
 * 
 * This package generates optimized social media content for all platforms:
 * - Pinterest: Pins with SEO-optimized titles and descriptions
 * - Instagram: Feed posts, Stories, Reels, and Carousels
 * - TikTok: Video captions, hooks, and content structures
 * - Facebook: Page posts, group posts, and roundups
 * 
 * Usage:
 *   import { generateAllContent, pinterest, instagram, tiktok, facebook } from '@protein-empire/social-media';
 * 
 * @module @protein-empire/social-media
 */

// Export individual platform generators
export * as pinterest from './pinterest.js';
export * as instagram from './instagram.js';
export * as tiktok from './tiktok.js';
export * as facebook from './facebook.js';

// Export templates for customization
export * from './templates.js';

// Import for combined generation
import { generatePinterestPackage } from './pinterest.js';
import { generateInstagramPackage } from './instagram.js';
import { generateTikTokPackage } from './tiktok.js';
import { generateFacebookPackage } from './facebook.js';

/**
 * Generate social media content for all platforms
 * @param {Object[]} recipes - Array of recipe data
 * @param {Object} siteConfig - Site configuration
 * @returns {Object} - Complete social media content package
 */
export function generateAllContent(recipes, siteConfig) {
  return {
    site: siteConfig.domain,
    siteName: siteConfig.name,
    generatedAt: new Date().toISOString(),
    recipeCount: recipes.length,
    platforms: {
      pinterest: generatePinterestPackage(recipes, siteConfig),
      instagram: generateInstagramPackage(recipes, siteConfig),
      tiktok: generateTikTokPackage(recipes, siteConfig),
      facebook: generateFacebookPackage(recipes, siteConfig)
    },
    summary: {
      totalPinterestPins: recipes.length * 3, // 3 variations per recipe
      totalInstagramPosts: recipes.length,
      totalTikTokVideos: recipes.length,
      totalFacebookPosts: recipes.length,
      estimatedContentPieces: recipes.length * 7 // Rough estimate of unique content
    }
  };
}

/**
 * Generate a content calendar suggestion
 * @param {Object[]} recipes - Array of recipe data
 * @param {Object} siteConfig - Site configuration
 * @param {number} weeks - Number of weeks to plan
 * @returns {Object} - Content calendar
 */
export function generateContentCalendar(recipes, siteConfig, weeks = 4) {
  const calendar = {
    site: siteConfig.domain,
    weeks: [],
    generatedAt: new Date().toISOString()
  };
  
  const shuffledRecipes = [...recipes].sort(() => 0.5 - Math.random());
  let recipeIndex = 0;
  
  for (let week = 1; week <= weeks; week++) {
    const weekPlan = {
      week,
      days: []
    };
    
    // Plan for each day of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach((day, dayIndex) => {
      const dayPlan = {
        day,
        posts: []
      };
      
      // Get recipe for the day (cycle through if needed)
      const recipe = shuffledRecipes[recipeIndex % shuffledRecipes.length];
      recipeIndex++;
      
      // Monday, Wednesday, Friday: Full content push
      if (dayIndex === 0 || dayIndex === 2 || dayIndex === 4) {
        dayPlan.posts.push({
          platform: 'Pinterest',
          time: '8:00 AM',
          type: 'New Pin',
          recipe: recipe.title
        });
        dayPlan.posts.push({
          platform: 'Instagram',
          time: '12:00 PM',
          type: 'Feed Post',
          recipe: recipe.title
        });
        dayPlan.posts.push({
          platform: 'TikTok',
          time: '7:00 PM',
          type: 'Recipe Video',
          recipe: recipe.title
        });
      }
      
      // Tuesday, Thursday: Engagement focus
      if (dayIndex === 1 || dayIndex === 3) {
        dayPlan.posts.push({
          platform: 'Instagram',
          time: '9:00 AM',
          type: 'Story',
          content: 'Behind the scenes / Poll'
        });
        dayPlan.posts.push({
          platform: 'Facebook',
          time: '1:00 PM',
          type: 'Engagement Post',
          recipe: recipe.title
        });
        dayPlan.posts.push({
          platform: 'Pinterest',
          time: '4:00 PM',
          type: 'Re-pin variation',
          recipe: recipe.title
        });
      }
      
      // Saturday: Roundup day
      if (dayIndex === 5) {
        dayPlan.posts.push({
          platform: 'Facebook',
          time: '10:00 AM',
          type: 'Weekly Roundup',
          content: 'Top 5 recipes of the week'
        });
        dayPlan.posts.push({
          platform: 'Instagram',
          time: '2:00 PM',
          type: 'Carousel',
          content: 'Recipe collection'
        });
      }
      
      // Sunday: Light content
      if (dayIndex === 6) {
        dayPlan.posts.push({
          platform: 'Instagram',
          time: '11:00 AM',
          type: 'Story',
          content: 'Meal prep motivation'
        });
        dayPlan.posts.push({
          platform: 'Pinterest',
          time: '3:00 PM',
          type: 'Board organization',
          content: 'Curate and organize pins'
        });
      }
      
      weekPlan.days.push(dayPlan);
    });
    
    calendar.weeks.push(weekPlan);
  }
  
  return calendar;
}

/**
 * Generate cross-promotion content between empire sites
 * @param {Object} sourceSite - Current site config
 * @param {Object[]} empireSites - All empire site configs
 * @param {Object} recipesByDomain - Recipes organized by domain
 * @returns {Object[]} - Cross-promotion content
 */
export function generateCrossPromotionContent(sourceSite, empireSites, recipesByDomain) {
  const crossPromos = [];
  
  empireSites.forEach(targetSite => {
    if (targetSite.domain === sourceSite.domain) return;
    
    const targetRecipes = recipesByDomain[targetSite.domain];
    if (!targetRecipes || targetRecipes.length === 0) return;
    
    // Pick a random recipe from target site
    const featuredRecipe = targetRecipes[Math.floor(Math.random() * targetRecipes.length)];
    
    crossPromos.push({
      targetSite: targetSite.domain,
      targetSiteName: targetSite.name,
      featuredRecipe: featuredRecipe.title,
      content: {
        instagram: `🌟 From our sister site @${targetSite.name.toLowerCase().replace(/\s/g, '')}!\n\nIf you love our ${sourceSite.foodType}, you'll love their ${targetSite.foodType}!\n\nCheck out this ${featuredRecipe.title} - ${featuredRecipe.protein}g protein per serving! 💪\n\n#ProteinEmpire`,
        facebook: `Did you know we have a whole family of protein recipe sites? 🌟\n\nCheck out ${targetSite.name} for amazing ${targetSite.foodType} recipes like this ${featuredRecipe.title} (${featuredRecipe.protein}g protein!).\n\n🔗 ${targetSite.domain}`,
        pinterest: `More protein recipes from the Protein Empire! This ${featuredRecipe.title} from ${targetSite.name} has ${featuredRecipe.protein}g protein per serving. Save for later! 📌`
      }
    });
  });
  
  return crossPromos;
}

export default {
  generateAllContent,
  generateContentCalendar,
  generateCrossPromotionContent
};
