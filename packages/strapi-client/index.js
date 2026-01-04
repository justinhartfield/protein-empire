/**
 * Protein Empire - Strapi API Client
 * 
 * Fetches content from Strapi CMS for static site generation.
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

class StrapiClient {
  constructor(url = STRAPI_URL, token = STRAPI_API_TOKEN) {
    this.url = url;
    this.token = token;
    this.headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  async fetch(endpoint, params = {}) {
    const searchParams = new URLSearchParams();
    
    // Handle nested params for Strapi's query format
    const flattenParams = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const paramKey = prefix ? `${prefix}[${key}]` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenParams(value, paramKey);
        } else {
          searchParams.append(paramKey, value);
        }
      }
    };
    
    flattenParams(params);
    
    const queryString = searchParams.toString();
    const url = `${this.url}/api${endpoint}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, { headers: this.headers });
    
    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Get site configuration by domain
   */
  async getSite(domain) {
    const result = await this.fetch('/sites', {
      filters: { domain: { '$eq': domain } },
      populate: '*',
    });
    
    return result.data?.[0] || null;
  }
  
  /**
   * Get all recipes for a site
   */
  async getRecipes(siteId, options = {}) {
    const params = {
      filters: { site: { id: { '$eq': siteId } }, isPublished: { '$eq': true } },
      populate: {
        categories: { fields: ['name', 'slug'] },
        image: { fields: ['url', 'alternativeText'] },
      },
      pagination: { limit: options.limit || 100 },
      sort: options.sort || 'title:asc',
    };
    
    const result = await this.fetch('/recipes', params);
    return result.data || [];
  }
  
  /**
   * Get a single recipe by slug
   */
  async getRecipe(slug, siteId) {
    const result = await this.fetch('/recipes', {
      filters: { 
        slug: { '$eq': slug },
        site: { id: { '$eq': siteId } },
      },
      populate: '*',
    });
    
    return result.data?.[0] || null;
  }
  
  /**
   * Get all categories for a site
   */
  async getCategories(siteId) {
    const result = await this.fetch('/categories', {
      filters: { site: { id: { '$eq': siteId } } },
      populate: '*',
      sort: 'name:asc',
    });
    
    return result.data || [];
  }
  
  /**
   * Get all recipe packs for a site
   */
  async getRecipePacks(siteId) {
    const result = await this.fetch('/recipe-packs', {
      filters: { site: { id: { '$eq': siteId } } },
      populate: {
        recipes: { fields: ['title', 'slug', 'protein', 'calories'] },
      },
      sort: 'name:asc',
    });
    
    return result.data || [];
  }
  
  /**
   * Get recipes by category
   */
  async getRecipesByCategory(categorySlug, siteId) {
    const result = await this.fetch('/recipes', {
      filters: {
        site: { id: { '$eq': siteId } },
        categories: { slug: { '$eq': categorySlug } },
        isPublished: { '$eq': true },
      },
      populate: {
        categories: { fields: ['name', 'slug'] },
        image: { fields: ['url', 'alternativeText'] },
      },
      pagination: { limit: 100 },
    });
    
    return result.data || [];
  }
  
  /**
   * Transform Strapi recipe data to the format expected by build scripts
   */
  transformRecipe(strapiRecipe) {
    const attrs = strapiRecipe.attributes || strapiRecipe;
    
    return {
      id: strapiRecipe.id,
      title: attrs.title,
      slug: attrs.slug,
      description: attrs.description,
      prepTime: attrs.prepTime,
      cookTime: attrs.cookTime,
      totalTime: attrs.totalTime,
      servings: attrs.servings,
      yield: attrs.servings,
      difficulty: attrs.difficulty,
      nutrition: {
        calories: attrs.calories,
        protein: attrs.protein,
        carbs: attrs.carbs,
        fat: attrs.fat,
        fiber: attrs.fiber,
        sugar: attrs.sugar,
      },
      calories: attrs.calories,
      protein: attrs.protein,
      carbs: attrs.carbs,
      fat: attrs.fat,
      fiber: attrs.fiber,
      sugar: attrs.sugar,
      ingredients: attrs.ingredients || [],
      instructions: (attrs.instructions || []).map(inst => inst.instruction || inst),
      tips: attrs.tips || [],
      tags: attrs.tags || [],
      categories: (attrs.categories?.data || []).map(cat => cat.attributes?.slug || cat.slug),
      image: attrs.image?.data?.attributes?.url || `/recipe_images/${attrs.slug}.png`,
    };
  }
  
  /**
   * Transform Strapi pack data to the format expected by build scripts
   */
  transformPack(strapiPack) {
    const attrs = strapiPack.attributes || strapiPack;
    
    return {
      id: strapiPack.id,
      name: attrs.name,
      slug: attrs.slug,
      description: attrs.description,
      isFree: attrs.isFree,
      recipes: (attrs.recipes?.data || []).map(r => r.attributes?.slug || r.slug),
    };
  }
}

module.exports = { StrapiClient };
