/**
 * Social Media Content Templates for the Protein Empire
 * 
 * These templates generate platform-optimized content for each recipe.
 * Each platform has specific requirements for character limits, hashtags, and formatting.
 */

/**
 * Hashtag collections for different platforms and categories
 */
export const hashtags = {
  // Core protein baking hashtags (use on all platforms)
  core: [
    '#proteinrecipes',
    '#highprotein',
    '#proteinbaking',
    '#macrofriendly',
    '#fitfood',
    '#healthyrecipes',
    '#mealprep'
  ],
  
  // Pinterest-specific (longer, more descriptive)
  pinterest: [
    '#proteinrecipe',
    '#healthybaking',
    '#fitnessfood',
    '#macros',
    '#cleaneating',
    '#healthylifestyle',
    '#proteinpacked',
    '#fitnessrecipes',
    '#healthydessert',
    '#guiltfree'
  ],
  
  // Instagram-specific (trending, community-focused)
  instagram: [
    '#foodporn',
    '#instafood',
    '#foodie',
    '#homemade',
    '#foodphotography',
    '#foodstagram',
    '#healthyfood',
    '#eatclean',
    '#fitfam',
    '#gains'
  ],
  
  // TikTok-specific (trending, discovery-focused)
  tiktok: [
    '#fyp',
    '#foryou',
    '#foodtiktok',
    '#recipe',
    '#cooking',
    '#baking',
    '#healthyrecipe',
    '#proteintok',
    '#gymtok',
    '#whatieatinaday'
  ],
  
  // Category-specific hashtags
  categories: {
    cookies: ['#proteincookies', '#healthycookies', '#cookierecipe', '#cookielover'],
    brownies: ['#proteinbrownies', '#healthybrownies', '#brownierecipe', '#chocolatelover'],
    pancakes: ['#proteinpancakes', '#healthypancakes', '#pancakerecipe', '#breakfastideas'],
    muffins: ['#proteinmuffins', '#healthymuffins', '#muffinrecipe', '#breakfastmuffins'],
    bars: ['#proteinbars', '#homemadeproteinbars', '#energybars', '#snackprep'],
    bites: ['#proteinbites', '#energybites', '#nobake', '#healthysnacks'],
    bread: ['#proteinbread', '#healthybread', '#homemadebread', '#breadbaking'],
    pizza: ['#proteinpizza', '#healthypizza', '#pizzarecipe', '#fitnesspizza'],
    oatmeal: ['#proteinoatmeal', '#overnightoats', '#oatmealrecipe', '#healthybreakfast'],
    cheesecake: ['#proteincheesecake', '#healthycheesecake', '#cheesecakerecipe', '#dessertlover'],
    donuts: ['#proteindonuts', '#healthydonuts', '#bakeddonuts', '#donutrecipe'],
    pudding: ['#proteinpudding', '#chiapudding', '#healthydessert', '#puddingrecipe']
  },
  
  // Diet-specific hashtags
  diets: {
    'gluten-free': ['#glutenfree', '#glutenfreerecipes', '#celiac', '#gfree'],
    'vegan': ['#vegan', '#veganrecipes', '#plantbased', '#veganprotein'],
    'keto': ['#keto', '#ketorecipes', '#lowcarb', '#ketodiet'],
    'dairy-free': ['#dairyfree', '#dairyfreerecipes', '#lactosefree'],
    'sugar-free': ['#sugarfree', '#nosugar', '#sugarfreerecipes']
  }
};

/**
 * Emoji collections for different contexts
 */
export const emojis = {
  food: ['🍪', '🧁', '🥞', '🍫', '🥜', '🍌', '🫐', '🍓', '🥣', '🍕', '🍩', '🧀'],
  fitness: ['💪', '🏋️', '🔥', '⚡', '🎯', '✨', '🏆', '💯'],
  reactions: ['😋', '🤤', '😍', '🙌', '👏', '❤️', '💕'],
  actions: ['👇', '📲', '🔗', '📌', '💾', '📖', '⏰']
};

/**
 * Call-to-action templates
 */
export const callToActions = {
  pinterest: [
    'Save this recipe for later! 📌',
    'Pin now, bake later! 📌',
    'Save to your recipe board! 📌',
    'Don\'t forget to save this one! 📌',
    'Pin this to your protein recipes board! 📌'
  ],
  instagram: [
    'Save this recipe & tag us when you make it! 📸',
    'Double tap if you\'d try this! ❤️',
    'Tag a friend who needs this recipe! 👇',
    'Save for your next meal prep! 💾',
    'Link in bio for the full recipe! 🔗'
  ],
  tiktok: [
    'Save for later! 💾',
    'Follow for more protein recipes! ➕',
    'Comment RECIPE for the link! 👇',
    'Duet this when you make it! 🎬',
    'Full recipe in bio! 🔗'
  ],
  facebook: [
    'Save this post for later! 💾',
    'Share with a friend who would love this! 👥',
    'Drop a 🍪 if you\'re making this!',
    'Comment below if you try it!',
    'Click the link for the full recipe! 🔗'
  ]
};

/**
 * Hook templates for different platforms
 */
export const hooks = {
  pinterest: {
    title: [
      '{protein}g Protein {title}',
      'High-Protein {title} Recipe',
      'Macro-Friendly {title}',
      '{title} - {protein}g Protein Per Serving',
      'The Best {title} Recipe ({protein}g Protein!)'
    ],
    description: [
      'Looking for a {foodType} recipe that actually hits your macros? This {title} packs {protein}g of protein per serving with only {calories} calories. Perfect for meal prep!',
      'These {title} are a game-changer for anyone tracking macros. {protein}g protein, {calories} calories, and absolutely delicious. Save this recipe!',
      'Craving {foodType} but want to stay on track? Try this {title} recipe - {protein}g protein per serving and ready in just {totalTime} minutes!'
    ]
  },
  instagram: {
    caption: [
      '{protein}g PROTEIN {foodType}! 💪\n\nYes, you read that right. These {title} are packed with protein and taste absolutely incredible.\n\n',
      'POV: You found the perfect {foodType} recipe 🎯\n\n{protein}g protein per serving\n{calories} calories\nReady in {totalTime} minutes\n\n',
      'Your new favorite {foodType} recipe just dropped 🔥\n\nMacros per serving:\n🔹 Protein: {protein}g\n🔹 Calories: {calories}\n🔹 Carbs: {carbs}g\n🔹 Fat: {fat}g\n\n'
    ]
  },
  tiktok: {
    caption: [
      '{protein}g protein {foodType} that actually taste good 🤯',
      'POV: you found the perfect macro-friendly {foodType} recipe',
      'Wait for it... {protein}g of protein per serving 💪',
      'The {foodType} recipe that broke the internet (for good reason)',
      'Making {title} with {protein}g protein 🔥'
    ]
  },
  facebook: {
    post: [
      '🍪 NEW RECIPE ALERT! 🍪\n\nJust dropped a new {title} recipe on the site and you guys are going to LOVE it.\n\n📊 Macros per serving:\n• Protein: {protein}g\n• Calories: {calories}\n• Carbs: {carbs}g\n• Fat: {fat}g\n\n',
      'Who else is always looking for high-protein {foodType} recipes? 🙋\n\nThis {title} recipe has {protein}g of protein per serving and tastes absolutely amazing. Perfect for meal prep!\n\n',
      '💪 {protein}g PROTEIN {foodType.toUpperCase()}! 💪\n\nI\'ve been perfecting this {title} recipe and it\'s finally ready to share. Only {calories} calories per serving!\n\n'
    ]
  }
};

/**
 * Get random item from array
 */
export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random items from array (no duplicates)
 */
export function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * Replace template variables with recipe data
 */
export function fillTemplate(template, recipe, siteConfig) {
  return template
    .replace(/{title}/g, recipe.title)
    .replace(/{protein}/g, recipe.protein)
    .replace(/{calories}/g, recipe.calories)
    .replace(/{carbs}/g, recipe.carbs)
    .replace(/{fat}/g, recipe.fat)
    .replace(/{fiber}/g, recipe.fiber || 0)
    .replace(/{prepTime}/g, recipe.prepTime)
    .replace(/{cookTime}/g, recipe.cookTime)
    .replace(/{totalTime}/g, recipe.totalTime)
    .replace(/{foodType}/g, siteConfig.foodType)
    .replace(/{foodTypePlural}/g, siteConfig.foodTypePlural)
    .replace(/{siteName}/g, siteConfig.name)
    .replace(/{domain}/g, siteConfig.domain);
}

export default {
  hashtags,
  emojis,
  callToActions,
  hooks,
  getRandomItem,
  getRandomItems,
  fillTemplate
};
