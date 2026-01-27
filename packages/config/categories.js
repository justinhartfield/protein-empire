/**
 * Recipe Categories Configuration for the Protein Empire
 * 
 * These categories are shared across all sites, with site-specific
 * categories defined in each site's configuration.
 */

// Universal categories that apply to all sites
export const universalCategories = {
  'all': {
    id: 'all',
    name: 'All Recipes',
    slug: 'all',
    description: 'Browse all recipes',
    icon: '📚'
  },
  'high-protein': {
    id: 'high-protein',
    name: 'High Protein',
    slug: 'high-protein',
    description: 'Recipes with 25g+ protein per serving',
    icon: '💪',
    filter: recipe => recipe.nutrition.protein >= 25
  },
  'quick': {
    id: 'quick',
    name: 'Quick & Easy',
    slug: 'quick',
    description: 'Ready in 20 minutes or less',
    icon: '⚡',
    filter: recipe => recipe.totalTime <= 20
  },
  'gluten-free': {
    id: 'gluten-free',
    name: 'Gluten-Free',
    slug: 'gluten-free',
    description: 'Recipes without gluten',
    icon: '🌾',
    filter: recipe => recipe.tags?.some(t => t.toLowerCase() === 'gluten-free')
  },
  'vegan': {
    id: 'vegan',
    name: 'Vegan',
    slug: 'vegan',
    description: 'Plant-based recipes',
    icon: '🌱',
    filter: recipe => recipe.tags?.some(t => t.toLowerCase() === 'vegan')
  },
  'kids': {
    id: 'kids',
    name: 'Kids',
    slug: 'kids',
    description: 'Kid-friendly recipes',
    icon: '👶',
    filter: recipe => recipe.tags?.some(t => t.toLowerCase() === 'kids')
  },
  'seasonal': {
    id: 'seasonal',
    name: 'Seasonal',
    slug: 'seasonal',
    description: 'Holiday and seasonal favorites',
    icon: '🎄',
    filter: recipe => recipe.tags?.some(t => t.toLowerCase() === 'seasonal')
  }
};

// Site-specific category extensions
export const siteCategories = {
  'proteinmuffins.com': {
    'classic': { id: 'classic', name: 'Classic', slug: 'classic', icon: '🧁' },
    'fruit': { id: 'fruit', name: 'Fruit', slug: 'fruit', icon: '🍎' },
    'dessert': { id: 'dessert', name: 'Dessert', slug: 'dessert', icon: '🍫' },
    'savory': { id: 'savory', name: 'Savory', slug: 'savory', icon: '🧀' }
  },
  'proteincookies.co': {
    'classic': { id: 'classic', name: 'Classic', slug: 'classic', icon: '🍪' },
    'chocolate': { id: 'chocolate', name: 'Chocolate & Sweet', slug: 'chocolate', icon: '🍫' },
    'no-bake': { id: 'no-bake', name: 'No-Bake', slug: 'no-bake', icon: '❄️' }
  },
  'proteinpancakes.co': {
    'pancakes': { id: 'pancakes', name: 'Pancakes', slug: 'pancakes', icon: '🥞' },
    'waffles': { id: 'waffles', name: 'Waffles', slug: 'waffles', icon: '🧇' },
    'crepes': { id: 'crepes', name: 'Crepes', slug: 'crepes', icon: '🥞' },
    'savory': { id: 'savory', name: 'Savory', slug: 'savory', icon: '🧀' }
  },
  'proteinbrownies.co': {
    'brownies': { id: 'brownies', name: 'Brownies', slug: 'brownies', icon: '🟫' },
    'blondies': { id: 'blondies', name: 'Blondies', slug: 'blondies', icon: '🟨' },
    'fudgy': { id: 'fudgy', name: 'Fudgy', slug: 'fudgy', icon: '🍫' },
    'cakey': { id: 'cakey', name: 'Cakey', slug: 'cakey', icon: '🎂' }
  },
  'protein-bread.com': {
    'loaves': { id: 'loaves', name: 'Loaves', slug: 'loaves', icon: '🍞' },
    'bagels': { id: 'bagels', name: 'Bagels', slug: 'bagels', icon: '🥯' },
    'rolls': { id: 'rolls', name: 'Rolls & Buns', slug: 'rolls', icon: '🥖' },
    'sweet': { id: 'sweet', name: 'Sweet Breads', slug: 'sweet', icon: '🍰' }
  },
  'proteinbars.co': {
    'no-bake': { id: 'no-bake', name: 'No-Bake', slug: 'no-bake', icon: '❄️' },
    'baked': { id: 'baked', name: 'Baked', slug: 'baked', icon: '🔥' },
    'copycat': { id: 'copycat', name: 'Copycat', slug: 'copycat', icon: '🎯' }
  },
  'proteinbites.co': {
    'chocolate': { id: 'chocolate', name: 'Chocolate', slug: 'chocolate', icon: '🍫' },
    'fruit': { id: 'fruit', name: 'Fruit', slug: 'fruit', icon: '🍓' },
    'nut-free': { id: 'nut-free', name: 'Nut-Free', slug: 'nut-free', icon: '🥜' }
  },
  'proteindonuts.co': {
    'baked': { id: 'baked', name: 'Baked', slug: 'baked', icon: '🔥' },
    'glazed': { id: 'glazed', name: 'Glazed', slug: 'glazed', icon: '✨' },
    'frosted': { id: 'frosted', name: 'Frosted', slug: 'frosted', icon: '🎂' },
    'filled': { id: 'filled', name: 'Filled', slug: 'filled', icon: '💉' }
  },
  'proteinoatmeal.co': {
    'overnight': { id: 'overnight', name: 'Overnight Oats', slug: 'overnight', icon: '🌙' },
    'baked': { id: 'baked', name: 'Baked Oatmeal', slug: 'baked', icon: '🔥' },
    'proats': { id: 'proats', name: 'Proats (Stovetop)', slug: 'proats', icon: '🍳' }
  },
  'proteincheesecake.co': {
    'baked': { id: 'baked', name: 'Baked', slug: 'baked', icon: '🔥' },
    'no-bake': { id: 'no-bake', name: 'No-Bake', slug: 'no-bake', icon: '❄️' },
    'bars': { id: 'bars', name: 'Bars & Minis', slug: 'bars', icon: '🍫' },
    'dips': { id: 'dips', name: 'Dessert Dips', slug: 'dips', icon: '🥣' }
  },
  'proteinpizzas.co': {
    'yogurt-dough': { id: 'yogurt-dough', name: 'Yogurt Dough', slug: 'yogurt-dough', icon: '🥛' },
    'veggie-crust': { id: 'veggie-crust', name: 'Veggie Crusts', slug: 'veggie-crust', icon: '🥦' },
    'keto': { id: 'keto', name: 'Keto/GF Crusts', slug: 'keto', icon: '🥑' }
  },
  'cottagecheeserecipes.co': {
    'pancakes': { id: 'pancakes', name: 'Pancakes & Waffles', slug: 'pancakes', icon: '🥞' },
    'breakfast': { id: 'breakfast', name: 'Breakfast', slug: 'breakfast', icon: '🍳' },
    'bread': { id: 'bread', name: 'Bread & Flatbread', slug: 'bread', icon: '🍞' },
    'desserts': { id: 'desserts', name: 'Desserts', slug: 'desserts', icon: '🍫' },
    'cheesecake': { id: 'cheesecake', name: 'Cheesecake & Pudding', slug: 'cheesecake', icon: '🍰' },
    'pizza': { id: 'pizza', name: 'Pizza & Savory', slug: 'pizza', icon: '🍕' },
    'snacks': { id: 'snacks', name: 'Snacks', slug: 'snacks', icon: '🧁' }
  },
  'proteinpudding.co': {
    'classic': { id: 'classic', name: 'Classic Pudding', slug: 'classic', icon: '🍮' },
    'mousse': { id: 'mousse', name: 'Mousse', slug: 'mousse', icon: '☁️' },
    'chia': { id: 'chia', name: 'Chia Pudding', slug: 'chia', icon: '🌱' }
  }
};

/**
 * Get all categories for a specific site
 */
export function getCategoriesForSite(domain) {
  return {
    ...universalCategories,
    ...(siteCategories[domain] || {})
  };
}

export default { universalCategories, siteCategories, getCategoriesForSite };
