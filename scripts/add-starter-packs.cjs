const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data', 'recipes');

// Define starter pack recipes for each site
const starterPackRecipes = {
  'protein-bread-com': {
    icon: '🍞',
    recipes: [
      'high-protein-banana-bread-recipe',
      'high-protein-bread',
      'protein-banana-bread-recipe',
      'apple-cinnamon-protein-bread',
      'lemon-blueberry-protein-bread'
    ]
  },
  'proteinbars-co': {
    icon: '🍫',
    recipes: [
      'chocolate-peanut-butter-protein-bars',
      'no-bake-protein-bars',
      'oatmeal-protein-bars',
      'peanut-butter-protein-bars',
      'chocolate-protein-bars'
    ]
  },
  'proteinbites-co': {
    icon: '🍪',
    recipes: [
      'peanut-butter-protein-balls',
      'chocolate-protein-balls',
      'no-bake-protein-balls',
      'oatmeal-protein-balls',
      'easy-protein-balls'
    ]
  },
  'proteinbrownies-co': {
    icon: '🍫',
    recipes: [
      'classic-protein-brownies',
      'fudgy-protein-brownies',
      'chocolate-protein-brownies',
      'healthy-protein-brownies',
      'high-protein-brownies'
    ]
  },
  'proteincheesecake-co': {
    icon: '🍰',
    recipes: [
      'classic-vanilla-bean-cheesecake',
      'no-bake-chocolate-cheesecake',
      'strawberry-swirl-cheesecake',
      'lemon-blueberry-cheesecake-minis',
      'key-lime-cheesecake'
    ]
  },
  'proteindonuts-co': {
    icon: '🍩',
    recipes: [
      'chocolate-protein-donuts',
      'vanilla-protein-donuts',
      'baked-protein-donuts',
      'glazed-protein-donuts',
      'cinnamon-sugar-protein-donuts'
    ]
  },
  'proteinoatmeal-co': {
    icon: '🥣',
    recipes: [
      'classic-protein-oatmeal',
      'peanut-butter-protein-oatmeal',
      'chocolate-protein-oatmeal',
      'banana-protein-oatmeal',
      'overnight-protein-oats'
    ]
  },
  'proteinpancakes-co': {
    icon: '🥞',
    recipes: [
      'classic-protein-pancakes',
      'banana-protein-pancakes',
      'chocolate-chip-protein-pancakes',
      'blueberry-protein-pancakes',
      'fluffy-protein-pancakes'
    ]
  },
  'proteinpizzas-co': {
    icon: '🍕',
    recipes: [
      'classic-protein-pizza-crust',
      'chicken-protein-pizza',
      'margherita-protein-pizza',
      'pepperoni-protein-pizza',
      'high-protein-pizza-crust'
    ]
  },
  'proteinpudding-co': {
    icon: '🍮',
    recipes: [
      'classic-chocolate-protein-pudding',
      'quick-vanilla-protein-pudding',
      'peanut-butter-cup-protein-pudding',
      'banana-cream-protein-pudding',
      'coconut-cream-protein-pudding'
    ]
  }
};

// Get food type from site name
function getFoodType(siteName) {
  const types = {
    'protein-bread-com': 'bread',
    'proteinbars-co': 'bar',
    'proteinbites-co': 'bite',
    'proteinbrownies-co': 'brownie',
    'proteincheesecake-co': 'cheesecake',
    'proteincookies-co': 'cookie',
    'proteindonuts-co': 'donut',
    'proteinoatmeal-co': 'oatmeal',
    'proteinpancakes-co': 'pancake',
    'proteinpizzas-co': 'pizza',
    'proteinpudding-co': 'pudding'
  };
  return types[siteName] || 'recipe';
}

// Process each site
const sites = fs.readdirSync(dataDir).filter(f => 
  fs.statSync(path.join(dataDir, f)).isDirectory()
);

sites.forEach(site => {
  const packsFile = path.join(dataDir, site, 'packs.json');
  if (!fs.existsSync(packsFile)) {
    console.log(`⚠️  ${site}: No packs.json found`);
    return;
  }
  
  const packs = JSON.parse(fs.readFileSync(packsFile, 'utf-8'));
  const hasStarter = packs.some(p => p.slug === 'starter');
  
  if (hasStarter) {
    console.log(`✓ ${site}: Already has starter pack`);
    return;
  }
  
  if (!starterPackRecipes[site]) {
    console.log(`⚠️  ${site}: No starter recipes defined`);
    return;
  }
  
  const foodType = getFoodType(site);
  const starterPack = {
    slug: 'starter',
    title: 'Starter Pack',
    description: `5 essential protein ${foodType} recipes to get you started. Perfect for beginners!`,
    icon: starterPackRecipes[site].icon,
    recipes: starterPackRecipes[site].recipes
  };
  
  // Add starter pack at the beginning
  packs.unshift(starterPack);
  
  fs.writeFileSync(packsFile, JSON.stringify(packs, null, 2));
  console.log(`✅ ${site}: Added starter pack with ${starterPack.recipes.length} recipes`);
});

console.log('\n✨ Done! Run build-all.js to regenerate all sites.');
