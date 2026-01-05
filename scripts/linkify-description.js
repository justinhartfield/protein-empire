/**
 * Linkify description text with internal links to related recipes
 * This function processes the description and adds contextual links to:
 * 1. Related recipes (intra-site) when their titles or key phrases appear
 * 2. Empire recipes (cross-site) when relevant keywords appear
 * 3. Common protein recipe keywords that link to relevant recipes
 */
export function linkifyDescription(description, recipe, allRecipes, site) {
  if (!description) return '';
  
  let linkedDescription = description;
  const usedLinks = new Set(); // Track used links to avoid duplicate linking
  const maxLinks = 5; // Maximum number of links to add
  let linkCount = 0;
  
  // Helper function to escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Helper function to add a link if not already used
  const addLink = (text, url, title, isExternal = false) => {
    if (linkCount >= maxLinks || usedLinks.has(url)) return linkedDescription;
    
    // Create case-insensitive regex that matches whole words
    const regex = new RegExp(`\\b(${escapeRegex(text)})\\b`, 'i');
    
    if (regex.test(linkedDescription)) {
      const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      linkedDescription = linkedDescription.replace(
        regex,
        `<a href="${url}" class="text-brand-600 hover:text-brand-700 font-semibold"${target} title="${title}">$1</a>`
      );
      usedLinks.add(url);
      linkCount++;
    }
    return linkedDescription;
  };
  
  // 1. Link to related recipes (intra-site) - highest priority
  if (recipe.related_recipes && recipe.related_recipes.length > 0) {
    for (const related of recipe.related_recipes) {
      if (linkCount >= maxLinks) break;
      
      // Try to find the recipe title or key phrases in the description
      const fullRecipe = allRecipes.find(r => r.slug === related.slug);
      const title = related.title || (fullRecipe ? fullRecipe.title : '');
      
      if (title) {
        // Try exact title match first
        addLink(title, `/${related.slug}.html`, title);
        
        // Try partial matches for common recipe name patterns
        // e.g., "Snickerdoodle Protein Cookies" -> try "snickerdoodle cookies", "snickerdoodle"
        const words = title.split(' ').filter(w => w.toLowerCase() !== 'protein');
        if (words.length >= 2 && linkCount < maxLinks) {
          const shortName = words.slice(0, 2).join(' ');
          addLink(shortName, `/${related.slug}.html`, title);
        }
        // Try just the first distinctive word (e.g., "snickerdoodle")
        if (words.length > 0 && linkCount < maxLinks) {
          const firstWord = words[0];
          if (firstWord.length > 4) { // Only for distinctive words
            addLink(firstWord, `/${related.slug}.html`, title);
          }
        }
      }
    }
  }
  
  // 2. Link to empire recipes (cross-site) - for cross-domain interlinking
  if (recipe.empire_links && recipe.empire_links.length > 0) {
    for (const empireLink of recipe.empire_links) {
      if (linkCount >= maxLinks) break;
      
      const title = empireLink.title;
      const domain = empireLink.domain;
      const url = `https://${domain}/${empireLink.slug}.html`;
      
      if (title) {
        // Try category-based linking (e.g., "protein brownies", "protein bars")
        if (empireLink.category) {
          addLink(empireLink.category, url, title, true);
        }
        
        // Try title-based linking
        const words = title.split(' ').filter(w => w.toLowerCase() !== 'protein');
        if (words.length >= 2 && linkCount < maxLinks) {
          const shortName = words.slice(0, 2).join(' ');
          addLink(shortName, url, title, true);
        }
      }
    }
  }
  
  // 3. Link common protein recipe keywords to relevant recipes on the same site
  const keywordMappings = [
    { keywords: ['gluten-free', 'gluten free'], category: 'gluten-free' },
    { keywords: ['vegan', 'plant-based'], category: 'vegan' },
    { keywords: ['keto', 'low-carb', 'low carb'], category: 'keto' },
    { keywords: ['no-bake', 'no bake'], category: 'no-bake' },
    { keywords: ['meal prep'], category: 'meal-prep' },
    { keywords: ['post-workout', 'post workout'], category: 'high-protein' },
  ];
  
  for (const mapping of keywordMappings) {
    if (linkCount >= maxLinks) break;
    
    for (const keyword of mapping.keywords) {
      if (linkCount >= maxLinks) break;
      
      // Find a recipe in this category to link to
      const categoryRecipe = allRecipes.find(r => 
        r.slug !== recipe.slug && 
        (r.categories?.includes(mapping.category) || 
         r.tags?.includes(mapping.category) ||
         r.title.toLowerCase().includes(mapping.category))
      );
      
      if (categoryRecipe) {
        addLink(keyword, `/category-${mapping.category}.html`, `${mapping.category.replace(/-/g, ' ')} recipes`);
      }
    }
  }
  
  return linkedDescription;
}
