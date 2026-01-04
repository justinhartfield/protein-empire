/**
 * Email Configuration for the Protein Empire
 * 
 * This file maps each domain to its SendGrid configuration.
 * List IDs should be added after creating the lists in SendGrid.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Log in to SendGrid (app.sendgrid.com)
 * 2. Go to Marketing > Contacts
 * 3. Create a new list for each domain (e.g., "ProteinCookies.co Subscribers")
 * 4. Copy the List ID from the URL and paste it below
 * 5. Create a verified sender for each domain (Marketing > Senders)
 */

export const emailConfig = {
  // Shared SendGrid API key (set via environment variable)
  // SENDGRID_API_KEY should be set in your deployment environment
  
  // Per-site configuration
  sites: {
    'proteinmuffins.com': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteinmuffins.com',
      fromName: 'Protein Muffins',
      senderVerified: false // Set to true after verifying in SendGrid
    },
    
    'proteincookies.co': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteincookies.co',
      fromName: 'Protein Cookies',
      senderVerified: false
    },
    
    'proteinpancakes.co': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteinpancakes.co',
      fromName: 'Protein Pancakes',
      senderVerified: false
    },
    
    'proteinbrownies.co': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteinbrownies.co',
      fromName: 'Protein Brownies',
      senderVerified: false
    },
    
    'protein-bread.com': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@protein-bread.com',
      fromName: 'Protein Bread',
      senderVerified: false
    },
    
    'proteinbars.co': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteinbars.co',
      fromName: 'Protein Bars',
      senderVerified: false
    },
    
    'proteinbites.co': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteinbites.co',
      fromName: 'Protein Bites',
      senderVerified: false
    },
    
    'proteindonuts.co': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteindonuts.co',
      fromName: 'Protein Donuts',
      senderVerified: false
    },
    
    'proteinoatmeal.co': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteinoatmeal.co',
      fromName: 'Protein Oatmeal',
      senderVerified: false
    },
    
    'proteincheesecake.co': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteincheesecake.co',
      fromName: 'Protein Cheesecake',
      senderVerified: false
    },
    
    'proteinpizzas.co': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteinpizzas.co',
      fromName: 'Protein Pizzas',
      senderVerified: false
    },
    
    'proteinpudding.co': {
      listId: '', // TODO: Add SendGrid List ID
      fromEmail: 'hello@proteinpudding.co',
      fromName: 'Protein Pudding',
      senderVerified: false
    }
  }
};

/**
 * Get email configuration for a specific domain
 * @param {string} domain - The domain to get config for
 * @returns {Object|null} - The email config or null if not found
 */
export function getEmailConfig(domain) {
  return emailConfig.sites[domain] || null;
}

/**
 * Get all domains that have email configured (list ID set)
 * @returns {string[]} - Array of configured domain names
 */
export function getConfiguredDomains() {
  return Object.entries(emailConfig.sites)
    .filter(([_, config]) => config.listId)
    .map(([domain]) => domain);
}

/**
 * Check if a domain is ready for email (has list ID and verified sender)
 * @param {string} domain - The domain to check
 * @returns {boolean}
 */
export function isEmailReady(domain) {
  const config = emailConfig.sites[domain];
  return config && config.listId && config.senderVerified;
}

export default emailConfig;
