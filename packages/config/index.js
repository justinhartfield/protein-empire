/**
 * @protein-empire/config
 * 
 * Shared configuration package for the Protein Empire
 */

export { sites, getSite, getSitesByStatus, getAllDomains } from './sites.js';
export { universalCategories, siteCategories, getCategoriesForSite } from './categories.js';
export { default as tailwindConfig } from './tailwind.config.js';
