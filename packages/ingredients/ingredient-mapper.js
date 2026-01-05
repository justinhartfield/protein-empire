/**
 * Ingredient Name to ID Mapper
 * 
 * Maps common ingredient names from recipes to their database IDs
 * for use with the substitution system.
 */

export const INGREDIENT_NAME_MAP = {
  // Flours
  'oat flour': 'oat-flour',
  'oat flour (blended)': 'oat-flour',
  'blended oat flour': 'oat-flour',
  'almond flour': 'almond-flour',
  'blanched almond flour': 'almond-flour',
  'coconut flour': 'coconut-flour',
  'whole wheat flour': 'whole-wheat-flour',
  'king arthur gf mix': 'king-arthur-gf-mix',
  'king arthur gluten free': 'king-arthur-gf-mix',
  "bob's red mill gf 1-to-1": 'bobs-gf-1to1',
  'bobs gf 1-to-1': 'bobs-gf-1to1',
  'kodiak pancake mix': 'kodiak-pancake-mix',
  'kodiak protein pancake mix': 'kodiak-pancake-mix',
  'birch benders mix': 'birch-benders-mix',
  'birch benders protein pancake mix': 'birch-benders-mix',
  
  // Protein Powders
  'vanilla whey protein': 'whey-vanilla',
  'vanilla whey protein powder': 'whey-vanilla',
  'whey protein powder': 'whey-vanilla',
  'vanilla protein powder': 'whey-vanilla',
  'chocolate whey protein': 'whey-chocolate',
  'chocolate whey protein powder': 'whey-chocolate',
  'chocolate protein powder': 'whey-chocolate',
  'casein protein': 'casein-vanilla',
  'vanilla casein protein': 'casein-vanilla',
  'pea protein': 'pea-protein',
  'pea protein isolate': 'pea-protein',
  'hemp protein': 'hemp-protein',
  'hemp protein powder': 'hemp-protein',
  'egg white protein': 'egg-white-powder',
  'egg white protein powder': 'egg-white-powder',
  
  // Dairy
  'greek yogurt': 'greek-yogurt-nonfat',
  'non-fat greek yogurt': 'greek-yogurt-nonfat',
  'nonfat greek yogurt': 'greek-yogurt-nonfat',
  'plain greek yogurt': 'greek-yogurt-nonfat',
  '2% greek yogurt': 'greek-yogurt-2pct',
  'cottage cheese': 'cottage-cheese-blended',
  'cottage cheese (blended)': 'cottage-cheese-blended',
  'blended cottage cheese': 'cottage-cheese-blended',
  'ricotta': 'ricotta-part-skim',
  'part-skim ricotta': 'ricotta-part-skim',
  'ricotta cheese': 'ricotta-part-skim',
  'skyr': 'skyr',
  'icelandic yogurt': 'skyr',
  'light sour cream': 'sour-cream-light',
  'coconut yogurt': 'coconut-almond-yogurt',
  'almond yogurt': 'coconut-almond-yogurt',
  'dairy-free yogurt': 'coconut-almond-yogurt',
  
  // Eggs
  'egg whites': 'egg-whites-liquid',
  'liquid egg whites': 'egg-whites-liquid',
  'egg white': 'egg-whites-liquid',
  'whole egg': 'whole-eggs',
  'whole eggs': 'whole-eggs',
  'large egg': 'whole-eggs',
  'large eggs': 'whole-eggs',
  'egg': 'whole-eggs',
  'eggs': 'whole-eggs',
  'flax egg': 'flax-egg',
  'chia egg': 'chia-egg',
  'aquafaba': 'aquafaba',
  
  // Fruits & Vegetables
  'banana': 'banana-mashed',
  'mashed banana': 'banana-mashed',
  'ripe banana': 'banana-mashed',
  'overripe banana': 'banana-mashed',
  'pumpkin puree': 'pumpkin-puree',
  'canned pumpkin': 'pumpkin-puree',
  'pumpkin': 'pumpkin-puree',
  'applesauce': 'applesauce-unsweetened',
  'unsweetened applesauce': 'applesauce-unsweetened',
  'sweet potato': 'sweet-potato-mashed',
  'mashed sweet potato': 'sweet-potato-mashed',
  'butternut squash': 'butternut-squash-mashed',
  'zucchini': 'zucchini-grated',
  'grated zucchini': 'zucchini-grated',
  'carrot': 'carrot-grated',
  'grated carrot': 'carrot-grated',
  'carrots': 'carrot-grated',
  
  // Nut Butters
  'peanut butter': 'peanut-butter',
  'natural peanut butter': 'peanut-butter',
  'almond butter': 'almond-butter',
  'sunflower seed butter': 'sunflower-seed-butter',
  'sunbutter': 'sunflower-seed-butter',
  'cashew butter': 'cashew-butter',
  
  // Sweeteners
  'honey': 'honey',
  'raw honey': 'honey',
  'maple syrup': 'maple-syrup',
  'pure maple syrup': 'maple-syrup',
  'agave': 'agave-nectar',
  'agave nectar': 'agave-nectar',
  'medjool dates': 'medjool-dates',
  'dates': 'medjool-dates',
  'pitted dates': 'medjool-dates',
  
  // Oats
  'rolled oats': 'rolled-oats',
  'old fashioned oats': 'rolled-oats',
  'oats': 'rolled-oats',
  'quick oats': 'quick-oats',
  'instant oats': 'quick-oats',
  
  // Fixed ingredients (no substitutes)
  'baking powder': 'baking-powder',
  'baking soda': 'baking-soda',
  'chocolate chips': 'chocolate-chips',
  'dark chocolate chips': 'chocolate-chips',
  'mini chocolate chips': 'chocolate-chips',
  'blueberries': 'blueberries-fresh',
  'fresh blueberries': 'blueberries-fresh',
  'walnuts': 'walnuts-chopped',
  'chopped walnuts': 'walnuts-chopped',
  'cocoa powder': 'cocoa-powder',
  'unsweetened cocoa powder': 'cocoa-powder',
  'dutch process cocoa': 'cocoa-powder',
  'lemon zest': 'lemon-zest',
  'fresh lemon zest': 'lemon-zest',
  'apple': 'apple-diced',
  'diced apple': 'apple-diced',
  'cinnamon': 'cinnamon',
  'ground cinnamon': 'cinnamon',
  'vanilla extract': 'vanilla-extract',
  'pure vanilla extract': 'vanilla-extract',
  'vanilla': 'vanilla-extract',
  'pumpkin pie spice': 'pumpkin-pie-spice',
  'salt': null, // No substitution
  'sea salt': null,
  'sugar-free chocolate chips': 'chocolate-chips',
  'granulated sweetener': null,
  'granulated sweetener (monk fruit)': null,
  'granulated sweetener (monk fruit or erythritol)': null,
  'monk fruit sweetener': null,
  'erythritol': null
};

/**
 * Map an ingredient name to its database ID
 * @param {string} name - The ingredient name from the recipe
 * @returns {string|null} - The database ID or null if not found/not substitutable
 */
export function mapIngredientNameToId(name) {
  if (!name) return null;
  
  // Normalize the name: lowercase, trim, remove extra spaces
  const normalized = name.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Direct lookup
  if (INGREDIENT_NAME_MAP.hasOwnProperty(normalized)) {
    return INGREDIENT_NAME_MAP[normalized];
  }
  
  // Try partial matches for common patterns
  for (const [key, id] of Object.entries(INGREDIENT_NAME_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return id;
    }
  }
  
  // Generate a kebab-case ID as fallback (won't have substitutes)
  return normalized.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Process recipe ingredients and add IDs for substitution system
 * @param {Array} ingredients - Array of ingredient objects with name and amount
 * @returns {Array} - Ingredients with added id property
 */
export function processIngredientsForSubstitution(ingredients) {
  return ingredients.map(ing => ({
    ...ing,
    id: mapIngredientNameToId(ing.name) || ing.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }));
}

export default { INGREDIENT_NAME_MAP, mapIngredientNameToId, processIngredientsForSubstitution };
