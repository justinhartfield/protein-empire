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
  
  // ============================================
  // Hub Page Methods (for Dotoro Integration)
  // ============================================
  
  /**
   * Get all hub pages
   */
  async getHubPages(options = {}) {
    const params = {
      filters: { isActive: { '$eq': true } },
      populate: '*',
      sort: options.sort || 'order:asc',
    };
    
    if (options.siteId) {
      params.filters.siteId = { '$eq': options.siteId };
    }
    
    const result = await this.fetch('/hub-pages', params);
    return result.data || [];
  }
  
  /**
   * Get a single hub page by slug
   */
  async getHubPage(slug) {
    const result = await this.fetch('/hub-pages', {
      filters: { slug: { '$eq': slug } },
      populate: '*',
    });
    
    return result.data?.[0] || null;
  }
  
  /**
   * Get recipes filtered by hub page criteria
   * Supports protein bands, calorie bands, time bands, and category filters
   */
  async getRecipesForHubPage(hubPage, siteId, options = {}) {
    const attrs = hubPage.attributes || hubPage;
    const filters = { 
      site: { id: { '$eq': siteId } }, 
      isPublished: { '$eq': true } 
    };
    
    // Apply protein band filters
    if (attrs.proteinBandMin) {
      filters.protein = filters.protein || {};
      filters.protein['$gte'] = attrs.proteinBandMin;
    }
    if (attrs.proteinBandMax) {
      filters.protein = filters.protein || {};
      filters.protein['$lte'] = attrs.proteinBandMax;
    }
    
    // Apply calorie band filters
    if (attrs.calorieBandMin) {
      filters.calories = filters.calories || {};
      filters.calories['$gte'] = attrs.calorieBandMin;
    }
    if (attrs.calorieBandMax) {
      filters.calories = filters.calories || {};
      filters.calories['$lte'] = attrs.calorieBandMax;
    }
    
    // Apply time band filter
    if (attrs.timeBandMax) {
      filters.totalTime = { '$lte': attrs.timeBandMax };
    }
    
    const params = {
      filters,
      populate: {
        categories: { fields: ['name', 'slug'] },
        image: { fields: ['url', 'alternativeText'] },
      },
      pagination: { limit: options.limit || 50 },
      sort: options.sort || 'protein:desc',
    };
    
    const result = await this.fetch('/recipes', params);
    return result.data || [];
  }
  
  /**
   * Get all goals
   */
  async getGoals() {
    const result = await this.fetch('/goals', {
      populate: '*',
      sort: 'order:asc',
    });
    
    return result.data || [];
  }
  
  /**
   * Get all constraints
   */
  async getConstraints() {
    const result = await this.fetch('/constraints', {
      populate: '*',
      sort: 'order:asc',
    });
    
    return result.data || [];
  }
  
  /**
   * Get all outcomes
   */
  async getOutcomes() {
    const result = await this.fetch('/outcomes', {
      populate: '*',
      sort: 'order:asc',
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
      // Add computed band values
      proteinBand: this.getProteinBand(attrs.protein),
      calorieBand: this.getCalorieBand(attrs.calories),
      timeBand: this.getTimeBand(attrs.totalTime),
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
  
  /**
   * Transform Strapi hub page data
   */
  transformHubPage(strapiHubPage) {
    const attrs = strapiHubPage.attributes || strapiHubPage;
    
    return {
      id: strapiHubPage.id,
      title: attrs.title,
      slug: attrs.slug,
      metaTitle: attrs.metaTitle,
      metaDescription: attrs.metaDescription,
      heroHeadline: attrs.heroHeadline,
      heroSubheadline: attrs.heroSubheadline,
      heroImage: attrs.heroImage?.data?.attributes?.url || null,
      introContent: attrs.introContent,
      filterRules: attrs.filterRules,
      defaultFilters: attrs.defaultFilters,
      ctaHeadline: attrs.ctaHeadline,
      ctaButtonText: attrs.ctaButtonText,
      ctaButtonLink: attrs.ctaButtonLink,
      faqContent: attrs.faqContent,
      bottomContent: attrs.bottomContent,
      order: attrs.order,
      isActive: attrs.isActive,
      proteinBandMin: attrs.proteinBandMin,
      proteinBandMax: attrs.proteinBandMax,
      calorieBandMin: attrs.calorieBandMin,
      calorieBandMax: attrs.calorieBandMax,
      timeBandMax: attrs.timeBandMax,
      siteId: attrs.siteId,
    };
  }
  
  // ============================================
  // Band Calculation Helpers
  // ============================================
  
  /**
   * Get protein band label from protein value
   */
  getProteinBand(protein) {
    if (!protein) return null;
    if (protein < 20) return 'under-20g';
    if (protein < 30) return '20-29g';
    if (protein < 40) return '30-39g';
    return '40g-plus';
  }
  
  /**
   * Get calorie band label from calorie value
   */
  getCalorieBand(calories) {
    if (!calories) return null;
    if (calories < 300) return 'under-300';
    if (calories < 500) return '300-500';
    if (calories < 700) return '500-700';
    return '700-plus';
  }
  
  /**
   * Get time band label from total time value
   */
  getTimeBand(totalTime) {
    if (!totalTime) return null;
    if (totalTime <= 15) return 'under-15min';
    if (totalTime <= 30) return '15-30min';
    if (totalTime <= 60) return '30-60min';
    return '60min-plus';
  }
}

module.exports = { StrapiClient };
