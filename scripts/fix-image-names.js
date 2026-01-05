const fs = require('fs');
const path = require('path');

const SITES = [
  'proteinpancakes-co',
  'proteinpudding-co',
  'proteinpizzas-co',
  'proteincheesecake-co',
  'proteinoatmeal-co',
  'proteindonuts-co',
  'proteinbites-co',
  'proteinbars-co',
  'protein-bread-com',
  'proteinbrownies-co'
];

function getAvailableImages(site) {
  const imagesDir = path.join(__dirname, '..', 'data', 'images', site);
  if (!fs.existsSync(imagesDir)) return [];
  return fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));
}

function updateRecipeImages(site) {
  const recipesPath = path.join(__dirname, '..', 'data', 'recipes', site, 'recipes.json');
  if (!fs.existsSync(recipesPath)) {
    console.log(`  No recipes.json found for ${site}`);
    return;
  }
  
  let data = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
  const availableImages = getAvailableImages(site);
  
  // Handle both array and object formats
  const recipes = Array.isArray(data) ? data : data.recipes;
  
  let updated = 0;
  recipes.forEach(recipe => {
    // Generate expected image name from slug
    const expectedImage = `${recipe.slug}.png`;
    
    if (availableImages.includes(expectedImage)) {
      if (recipe.image !== expectedImage) {
        recipe.image = expectedImage;
        updated++;
      }
    } else {
      // Try to find a matching image
      const matchingImage = availableImages.find(img => 
        img.toLowerCase().includes(recipe.slug.split('-')[0]) ||
        recipe.slug.toLowerCase().includes(img.replace('.png', '').split('-')[0])
      );
      if (matchingImage && recipe.image !== matchingImage) {
        console.log(`  Mapping ${recipe.slug} -> ${matchingImage}`);
        recipe.image = matchingImage;
        updated++;
      }
    }
  });
  
  // Save back
  if (Array.isArray(data)) {
    fs.writeFileSync(recipesPath, JSON.stringify(data, null, 2));
  } else {
    data.recipes = recipes;
    fs.writeFileSync(recipesPath, JSON.stringify(data, null, 2));
  }
  
  console.log(`  Updated ${updated} image references`);
}

console.log('Fixing image names in recipe files...\n');

SITES.forEach(site => {
  console.log(`Processing ${site}...`);
  updateRecipeImages(site);
});

console.log('\nDone!');
