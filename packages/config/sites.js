/**
 * Site Configuration for the Protein Empire
 * 
 * Each site in the empire is defined here with its metadata,
 * branding colors, and content configuration.
 */

export const sites = {
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
    ga4Id: '',
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
    ga4Id: '',
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
    ga4Id: '',
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
    ga4Id: '',
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
    ga4Id: '',
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
    ga4Id: '',
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
    ga4Id: '',
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
    ga4Id: '',
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
    ga4Id: '',
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
    ga4Id: '',
    status: 'planned'
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
    ga4Id: '',
    status: 'planned'
  }
};

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

export default sites;
