/**
 * Site Configuration for the Protein Empire
 * 
 * Each site in the empire is defined here with its metadata,
 * branding colors, and content configuration.
 */

export const sites = {
  'highprotein.recipes': {
    name: 'HighProtein.Recipes',
    domain: 'highprotein.recipes',
    title: 'HighProtein.Recipes | The Ultimate High-Protein Recipe Index',
    tagline: 'Your gateway to 300+ macro-verified high-protein recipes',
    description: 'Discover the best high-protein recipes across 12 specialized sites. From cookies to pizza, pancakes to pudding - find your perfect macro-friendly treat.',
    foodType: 'recipes',
    foodTypePlural: 'recipes',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-86MYLJ5WDT',
    status: 'ready',
    isIndexer: true,
    // Hero ingredients for ingredient tag collections
    heroIngredients: [
      { name: 'Protein Powder', slug: 'protein-powder', icon: 'protein-bars.png' },
      { name: 'Banana', slug: 'banana', icon: 'banana.png' },
      { name: 'Peanut Butter', slug: 'peanut-butter', icon: 'cookies.png' },
      { name: 'Chia Seeds', slug: 'chia', icon: 'plant-seedling.png' },
      { name: 'Cottage Cheese', slug: 'cottage-cheese', icon: 'cheesecake.png' },
      { name: 'Greek Yogurt', slug: 'greek-yogurt', icon: 'ice-cream.png' },
      { name: 'Oats', slug: 'oats', icon: 'oatmeal.png' }
    ],
    // Flavor tags for cross-linking
    flavorTags: [
      { name: 'Chocolate', slug: 'chocolate' },
      { name: 'Peanut Butter', slug: 'peanut-butter' },
      { name: 'Banana', slug: 'banana' },
      { name: 'Pumpkin', slug: 'pumpkin' },
      { name: 'Cookies & Cream', slug: 'cookies-and-cream' }
    ],
    // Diet variants
    dietTags: [
      { name: 'Gluten-Free', slug: 'gluten-free' },
      { name: 'Vegan', slug: 'vegan' },
      { name: 'Keto', slug: 'keto' },
      { name: 'Sugar-Free', slug: 'sugar-free' }
    ],
    // Main navigation categories
    navCategories: [
      { name: 'Breakfast', slug: 'breakfast', items: ['pancakes', 'oatmeal', 'muffins', 'cottage-cheese'] },
      { name: 'Desserts', slug: 'desserts', items: ['cookies', 'brownies', 'cheesecake', 'pudding', 'donuts'] },
      { name: 'Snacks', slug: 'snacks', items: ['bites', 'bars'] },
      { name: 'Savory', slug: 'savory', items: ['pizza', 'bread'] }
    ],
    // Special filters
    specialFilters: [
      { name: 'No-Bake', slug: 'no-bake' },
      { name: 'Quick & Easy', slug: 'quick' },
      { name: 'High Protein (30g+)', slug: 'high-protein' }
    ]
  },

  'proteinmuffins.com': {
    name: 'ProteinMuffins',
    domain: 'proteinmuffins.com',
    title: 'ProteinMuffins.com | The Hub for Macro-Verified Baking',
    tagline: 'Macro-verified protein muffin recipes with USDA nutrition data',
    description: 'Macro-verified protein muffin recipes with USDA nutrition data. 25+ recipes measured in grams for precise macros. Free recipe packs and printable cards.',
    foodType: 'muffins',
    foodTypePlural: 'muffins',
    brandColor: '#f59e0b', // Amber
    accentColor: '#10b981', // Emerald
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: '', // To be filled
    status: 'live'
  },
  
  'proteincookies.co': {
    name: 'ProteinCookies',
    domain: 'proteincookies.co',
    title: 'ProteinCookies.com | The Hub for Macro-Verified Cookie Recipes',
    tagline: 'Macro-verified protein cookie recipes with precise nutrition data',
    description: 'Macro-verified protein cookie recipes with USDA nutrition data. 25+ recipes measured in grams for precise macros. Free recipe packs and printable cards.',
    foodType: 'cookies',
    foodTypePlural: 'cookies',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-4LGR56JYMC',
    status: 'ready'
  },
  
  'proteinpancakes.co': {
    name: 'ProteinPancakes',
    domain: 'proteinpancakes.co',
    title: 'ProteinPancakes.co | Fluffy Macro-Verified Pancake Recipes',
    tagline: 'Fluffy, delicious protein pancakes, waffles, and crepes',
    description: 'Macro-verified protein pancake, waffle, and crepe recipes. 25+ recipes measured in grams for precise macros. Free recipe packs.',
    foodType: 'pancakes',
    foodTypePlural: 'pancakes',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-QTR3Z59DM3',
    status: 'planned'
  },
  
  'proteinbrownies.co': {
    name: 'ProteinBrownies',
    domain: 'proteinbrownies.co',
    title: 'ProteinBrownies.co | Fudgy Macro-Verified Brownie Recipes',
    tagline: 'Decadent, fudgy protein brownies and blondies',
    description: 'Macro-verified protein brownie and blondie recipes. 25+ recipes measured in grams for precise macros. Free recipe packs.',
    foodType: 'brownies',
    foodTypePlural: 'brownies',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-XNSVN4G4WW',
    status: 'planned'
  },
  
  'protein-bread.com': {
    name: 'ProteinBread',
    domain: 'protein-bread.com',
    title: 'ProteinBread.com | High-Protein Bread & Bagel Recipes',
    tagline: 'High-protein bread, bagels, and rolls for macro-conscious bakers',
    description: 'Macro-verified protein bread, bagel, and roll recipes. 25+ recipes measured in grams for precise macros. Free recipe packs.',
    foodType: 'bread',
    foodTypePlural: 'breads',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-TJX3PMBKTX',
    status: 'planned'
  },
  
  'proteinbars.co': {
    name: 'ProteinBars',
    domain: 'proteinbars.co',
    title: 'ProteinBars.co | Homemade Protein Bar Recipes',
    tagline: 'Ditch expensive store-bought bars. Make your own.',
    description: 'Macro-verified homemade protein bar recipes. 25+ recipes measured in grams for precise macros. Free recipe packs.',
    foodType: 'bars',
    foodTypePlural: 'bars',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-T1F4P3X85Z',
    status: 'planned'
  },
  
  'proteinbites.co': {
    name: 'ProteinBites',
    domain: 'proteinbites.co',
    title: 'ProteinBites.co | No-Bake Energy Bite Recipes',
    tagline: 'Quick, no-bake protein and energy bites',
    description: 'Macro-verified no-bake protein bite and energy ball recipes. 25+ recipes measured in grams for precise macros. Free recipe packs.',
    foodType: 'bites',
    foodTypePlural: 'bites',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-7MXP78QYPD',
    status: 'planned'
  },
  
  'proteindonuts.co': {
    name: 'ProteinDonuts',
    domain: 'proteindonuts.co',
    title: 'ProteinDonuts.co | Healthy Baked Donut Recipes',
    tagline: 'Healthy, baked protein donuts that taste amazing',
    description: 'Macro-verified baked and air-fried protein donut recipes. 25+ recipes measured in grams for precise macros. Free recipe packs.',
    foodType: 'donuts',
    foodTypePlural: 'donuts',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-T3EJDJ9Y0J',
    status: 'planned'
  },
  
  'proteinoatmeal.co': {
    name: 'ProteinOatmeal',
    domain: 'proteinoatmeal.co',
    title: 'ProteinOatmeal.co | High-Protein Oatmeal Recipes',
    tagline: 'Overnight oats, baked oatmeal, and proats',
    description: 'Macro-verified protein oatmeal, overnight oats, and baked oatmeal recipes. 25+ recipes measured in grams for precise macros.',
    foodType: 'oatmeal',
    foodTypePlural: 'oatmeal recipes',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-V8Q26X7XJW',
    status: 'planned'
  },
  
  'proteincheesecake.co': {
    name: 'ProteinCheesecake',
    domain: 'proteincheesecake.co',
    title: 'ProteinCheesecake.co | High-Protein Cheesecake Recipes',
    tagline: 'Creamy, indulgent protein cheesecakes and dessert dips',
    description: 'Macro-verified protein cheesecake and dessert dip recipes. 25+ recipes measured in grams for precise macros. Free recipe packs.',
    foodType: 'cheesecake',
    foodTypePlural: 'cheesecakes',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-HJ0X1TGXYC',
    status: 'planned'
  },
  
  'proteinpizzas.co': {
    name: 'ProteinPizzas',
    domain: 'proteinpizzas.co',
    title: 'ProteinPizzas.co | High-Protein Pizza Crust Recipes',
    tagline: 'Delicious, crispy high-protein pizza crusts',
    description: 'Macro-verified high-protein pizza crust and flatbread recipes. 25+ recipes measured in grams for precise macros. Free recipe packs.',
    foodType: 'pizza',
    foodTypePlural: 'pizzas',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-E3DC1JN6N2',
    status: 'planned'
  },
  
  'cottagecheeserecipes.co': {
    name: 'CottageCheeseRecipes',
    domain: 'cottagecheeserecipes.co',
    title: 'CottageCheeseRecipes.co | Delicious High-Protein Cottage Cheese Recipes',
    tagline: 'The ultimate collection of cottage cheese recipes — from viral pancakes to protein-packed desserts',
    description: 'Discover 30+ delicious cottage cheese recipes including viral pancakes, high-protein brownies, flatbread, pizza, and more. Every recipe features cottage cheese as the star ingredient with full macro breakdowns.',
    foodType: 'cottage cheese recipes',
    foodTypePlural: 'cottage cheese recipes',
    brandColor: '#3b82f6',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-2G3D8EYYBB',
    status: 'ready'
  },

  'proteinpudding.co': {
    name: 'ProteinPudding',
    domain: 'proteinpudding.co',
    title: 'ProteinPudding.co | High-Protein Pudding Recipes',
    tagline: 'Creamy protein puddings, mousses, and chia puddings',
    description: 'Macro-verified protein pudding, mousse, and chia pudding recipes. 25+ recipes measured in grams for precise macros. Free recipe packs.',
    foodType: 'pudding',
    foodTypePlural: 'puddings',
    brandColor: '#f59e0b',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: 'G-KJYVNQJW7F',
    status: 'planned'
  },

  'mealprepideas.co': {
    name: 'MealPrepIdeas',
    domain: 'mealprepideas.co',
    title: 'MealPrepIdeas.co | Meal Prep Authority',
    tagline: 'Batching, logistics, storage, and 5-day protocols for high-performance living',
    description: '1,100+ programmatic pages covering meal prep methods, diets, goals, personas, store guides, and chain restaurants. 185+ recipes, 8 meal plans, 10 interactive tools, and full internal linking.',
    foodType: 'meal prep',
    foodTypePlural: 'meal prep recipes',
    brandColor: '#D9FF00',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: '',
    status: 'live'
  },

  'proteinmeals.co': {
    name: 'ProteinMeals',
    domain: 'proteinmeals.co',
    title: 'ProteinMeals.co | High Protein Authority',
    tagline: 'Macro-optimized meal prep and high-protein recipes for every goal',
    description: '1,100+ programmatic pages for high-protein meal prep. Covers macros, diet constraints, fast food chains, frozen meals, store guides, and ingredient-based navigation. 186+ recipes with full nutrition data.',
    foodType: 'high-protein meals',
    foodTypePlural: 'high-protein meals',
    brandColor: '#D9FF00',
    accentColor: '#10b981',
    logo: '/images/logo.png',
    favicon: '/images/favicon.png',
    socialImage: '/images/social-share.png',
    ga4Id: '',
    status: 'live'
  }
};

// Empire sites (all 12 individual recipe sites)
export const empireSites = [
  { domain: 'proteinmuffins.com', name: 'Muffins', foodType: 'muffins', category: 'breakfast' },
  { domain: 'proteincookies.co', name: 'Cookies', foodType: 'cookies', category: 'desserts' },
  { domain: 'proteinpancakes.co', name: 'Pancakes', foodType: 'pancakes', category: 'breakfast' },
  { domain: 'proteinbrownies.co', name: 'Brownies', foodType: 'brownies', category: 'desserts' },
  { domain: 'protein-bread.com', name: 'Bread', foodType: 'bread', category: 'savory' },
  { domain: 'proteinbars.co', name: 'Bars', foodType: 'bars', category: 'snacks' },
  { domain: 'proteinbites.co', name: 'Bites', foodType: 'bites', category: 'snacks' },
  { domain: 'proteindonuts.co', name: 'Donuts', foodType: 'donuts', category: 'desserts' },
  { domain: 'proteinoatmeal.co', name: 'Oatmeal', foodType: 'oatmeal', category: 'breakfast' },
  { domain: 'proteincheesecake.co', name: 'Cheesecake', foodType: 'cheesecake', category: 'desserts' },
  { domain: 'proteinpizzas.co', name: 'Pizza', foodType: 'pizza', category: 'savory' },
  { domain: 'proteinpudding.co', name: 'Pudding', foodType: 'pudding', category: 'desserts' },
  { domain: 'cottagecheeserecipes.co', name: 'Cottage Cheese', foodType: 'cottage cheese recipes', category: 'breakfast' },
  { domain: 'mealprepideas.co', name: 'Meal Prep', foodType: 'meal prep', category: 'savory' },
  { domain: 'proteinmeals.co', name: 'High-Protein Meals', foodType: 'high-protein meals', category: 'savory' }
];

/**
 * Get site configuration by domain
 */
export function getSite(domain) {
  return sites[domain] || null;
}

/**
 * Get all sites with a specific status
 */
export function getSitesByStatus(status) {
  return Object.values(sites).filter(site => site.status === status);
}

/**
 * Get all site domains
 */
export function getAllDomains() {
  return Object.keys(sites);
}

/**
 * Get empire sites (individual recipe sites, not indexer)
 */
export function getEmpireSites() {
  return empireSites;
}

export default sites;
