const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data', 'recipes');

// Define proper recipe mappings for each site's packs
const packRecipeMappings = {
  'proteinpizzas-co': {
    'crust-collection': [
      'classic-protein-pizza-crust',
      'high-protein-pizza-crust',
      'cauliflower-protein-pizza-crust',
      'greek-yogurt-protein-pizza-crust'
    ],
    'pizza-night-classics': [
      'margherita-protein-pizza',
      'pepperoni-protein-pizza',
      'meat-lovers-protein-pizza',
      'supreme-protein-pizza'
    ],
    'chicken-lovers': [
      'chicken-protein-pizza',
      'bbq-chicken-protein-pizza',
      'buffalo-chicken-protein-pizza',
      'pesto-chicken-protein-pizza'
    ],
    'veggie-delights': [
      'veggie-protein-pizza',
      'mushroom-protein-pizza',
      'spinach-feta-protein-pizza',
      'white-protein-pizza'
    ],
    'specialty-pizzas': [
      'breakfast-protein-pizza',
      'hawaiian-protein-pizza',
      'taco-protein-pizza',
      'dessert-protein-pizza'
    ],
    'quick-easy': [
      'protein-pizza-recipe',
      'protein-pizza-dough',
      'cottage-cheese-protein-pizza',
      'protein-pizza-bowl'
    ],
    'gluten-free-dairy-free': [
      'gluten-free-cauliflower-protein-pizza-crust',
      'dairy-free-chickpea-flour-protein-pizza',
      'keto-protein-pizza'
    ]
  },
  'proteinbites-co': {
    'chocolate-lovers': [
      'chocolate-protein-balls',
      'double-chocolate-protein-bites',
      'chocolate-peanut-butter-protein-balls',
      'chocolate-chip-protein-bites'
    ],
    'peanut-butter-pack': [
      'peanut-butter-protein-balls',
      'chocolate-peanut-butter-protein-balls',
      'peanut-butter-banana-protein-bites',
      'peanut-butter-oat-protein-balls'
    ],
    'no-bake-collection': [
      'no-bake-protein-balls',
      'easy-protein-balls',
      'simple-protein-bites',
      'quick-protein-balls'
    ],
    'oatmeal-bites': [
      'oatmeal-protein-balls',
      'oat-protein-bites',
      'oatmeal-raisin-protein-balls',
      'maple-oat-protein-bites'
    ],
    'fruit-flavored': [
      'blueberry-protein-balls',
      'strawberry-protein-bites',
      'lemon-protein-balls',
      'coconut-protein-bites'
    ],
    'gluten-free-dairy-free': [
      'gluten-free-protein-balls',
      'dairy-free-protein-bites',
      'vegan-protein-balls'
    ]
  },
  'proteinoatmeal-co': {
    'overnight-starter': [
      'overnight-protein-oats',
      'basic-overnight-protein-oatmeal',
      'vanilla-overnight-protein-oats',
      'chocolate-overnight-protein-oats'
    ],
    'chocolate-collection': [
      'chocolate-protein-oatmeal',
      'chocolate-peanut-butter-protein-oatmeal',
      'double-chocolate-protein-oats',
      'mocha-protein-oatmeal'
    ],
    'fruit-flavors': [
      'banana-protein-oatmeal',
      'blueberry-protein-oatmeal',
      'strawberry-protein-oatmeal',
      'apple-cinnamon-protein-oatmeal'
    ],
    'nut-butter-pack': [
      'peanut-butter-protein-oatmeal',
      'almond-butter-protein-oatmeal',
      'peanut-butter-banana-protein-oats',
      'chocolate-peanut-butter-protein-oatmeal'
    ],
    'baked-oatmeal': [
      'baked-protein-oatmeal',
      'baked-banana-protein-oatmeal',
      'baked-blueberry-protein-oatmeal',
      'baked-chocolate-protein-oatmeal'
    ],
    'quick-easy': [
      'classic-protein-oatmeal',
      'quick-protein-oatmeal',
      'simple-protein-oats',
      'easy-protein-oatmeal'
    ],
    'gluten-free-dairy-free': [
      'gluten-free-protein-oatmeal',
      'dairy-free-protein-oats',
      'vegan-protein-oatmeal'
    ]
  }
};

// Process each site
const sites = fs.readdirSync(dataDir).filter(f => 
  fs.statSync(path.join(dataDir, f)).isDirectory()
);

sites.forEach(site => {
  const packsFile = path.join(dataDir, site, 'packs.json');
  const recipesFile = path.join(dataDir, site, 'recipes.json');
  
  if (!fs.existsSync(packsFile) || !fs.existsSync(recipesFile)) {
    return;
  }
  
  const packs = JSON.parse(fs.readFileSync(packsFile, 'utf-8'));
  const recipesData = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));
  const recipes = recipesData.recipes || recipesData;
  const validSlugs = recipes.map(r => r.slug);
  
  let modified = false;
  
  packs.forEach(pack => {
    // Check if pack has placeholder recipes
    const hasPlaceholders = pack.recipes.some(r => r.startsWith('recipe-slug-'));
    
    if (hasPlaceholders) {
      // Try to get mapping from our definitions
      const mapping = packRecipeMappings[site]?.[pack.slug];
      
      if (mapping) {
        // Use our predefined mapping, filter to only valid slugs
        pack.recipes = mapping.filter(r => validSlugs.includes(r));
        console.log(`✅ ${site}/${pack.slug}: Fixed with ${pack.recipes.length} recipes from mapping`);
        modified = true;
      } else {
        // Auto-assign recipes based on pack position
        const packIndex = packs.indexOf(pack);
        const recipesPerPack = 4;
        const startIndex = packIndex * recipesPerPack;
        const autoRecipes = validSlugs.slice(startIndex, startIndex + recipesPerPack);
        
        if (autoRecipes.length > 0) {
          pack.recipes = autoRecipes;
          console.log(`⚠️  ${site}/${pack.slug}: Auto-assigned ${pack.recipes.length} recipes`);
          modified = true;
        } else {
          console.log(`❌ ${site}/${pack.slug}: No recipes available to assign`);
        }
      }
    }
  });
  
  if (modified) {
    fs.writeFileSync(packsFile, JSON.stringify(packs, null, 2));
    console.log(`   Saved ${site}/packs.json`);
  }
});

console.log('\n✨ Done! Run build-all.js to regenerate all sites.');
