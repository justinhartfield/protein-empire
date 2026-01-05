/**
 * Cross-Promotion Email Generator for the Protein Empire
 * 
 * Generates emails to promote sister sites to existing subscribers,
 * helping to grow the entire empire's audience.
 */

import { generateBaseTemplate, generateButton, generateRecipeCard } from './templates/base.js';

/**
 * Generate cross-promotion email
 * @param {Object} options - Cross-promo options
 * @returns {Object} - Email content
 */
export function generateCrossPromoEmail(options) {
  const {
    sourceSite,
    targetSite,
    featuredRecipes = [],
    recipientName = 'there'
  } = options;

  const recipeCards = featuredRecipes.slice(0, 3).map(recipe => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="80" style="vertical-align: top;">
              <img src="https://${targetSite.domain}/images/${recipe.image}" alt="${recipe.title}" width="80" height="80" style="display: block; border-radius: 8px; object-fit: cover;">
            </td>
            <td style="padding-left: 15px; vertical-align: top;">
              <h4 style="margin: 0 0 5px 0; color: #1e293b;">${recipe.title}</h4>
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                <strong>${recipe.protein}g protein</strong> • ${recipe.calories} cal
              </p>
              <a href="https://${targetSite.domain}/${recipe.slug}" style="color: #f59e0b; font-size: 14px; text-decoration: none;">View Recipe →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">🌟 Discover ${targetSite.name}!</h2>
    
    <p>Hey ${recipientName}!</p>
    
    <p>Since you love our ${sourceSite.foodType} recipes, I thought you'd want to know about our sister site: <strong>${targetSite.name}</strong>!</p>
    
    <p>${targetSite.name} is dedicated to high-protein ${targetSite.foodType} recipes, with the same quality you expect from ${sourceSite.name}:</p>
    
    <ul style="color: #475569; padding-left: 20px;">
      <li>✅ Gram-based measurements for precision</li>
      <li>✅ USDA-verified nutrition data</li>
      <li>✅ Tested recipes that actually work</li>
      <li>✅ Free recipe packs to download</li>
    </ul>
    
    ${featuredRecipes.length > 0 ? `
    <h3 style="margin: 30px 0 15px 0; color: #1e293b;">Popular Recipes on ${targetSite.name}:</h3>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      ${recipeCards}
    </table>
    ` : ''}
    
    ${generateButton(`Explore ${targetSite.name}`, `https://${targetSite.domain}`, '#f59e0b')}
    
    <p>Happy baking! 🍪</p>
    
    <p style="margin-top: 30px;">
      <strong>The ${sourceSite.name} Team</strong>
    </p>
    
    <p style="font-size: 14px; color: #64748b;">
      P.S. ${targetSite.name} has a free recipe pack too! Grab yours when you visit.
    </p>
  `;

  return {
    subject: `🌟 Love ${sourceSite.foodType}? You'll love ${targetSite.foodType} too!`,
    preheader: `Discover ${targetSite.name} - our sister site for protein ${targetSite.foodType}`,
    html: generateBaseTemplate({
      siteName: sourceSite.name,
      brandColor: sourceSite.brandColor,
      preheader: `Discover ${targetSite.name} - our sister site for protein ${targetSite.foodType}`,
      content
    }),
    plainText: `
Discover ${targetSite.name}!

Hey ${recipientName}!

Since you love our ${sourceSite.foodType} recipes, I thought you'd want to know about our sister site: ${targetSite.name}!

${targetSite.name} is dedicated to high-protein ${targetSite.foodType} recipes, with the same quality you expect from ${sourceSite.name}.

Visit: https://${targetSite.domain}

${featuredRecipes.length > 0 ? `
Popular Recipes:
${featuredRecipes.slice(0, 3).map(r => `- ${r.title} (${r.protein}g protein): https://${targetSite.domain}/${r.slug}`).join('\n')}
` : ''}

Happy baking!
The ${sourceSite.name} Team

P.S. ${targetSite.name} has a free recipe pack too!
    `.trim()
  };
}

/**
 * Generate empire announcement email
 * Introduces subscribers to the full Protein Empire
 */
export function generateEmpireAnnouncementEmail(options) {
  const {
    sourceSite,
    empireSites = [],
    recipientName = 'there'
  } = options;

  const siteList = empireSites
    .filter(s => s.domain !== sourceSite.domain)
    .map(site => `
      <tr>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td>
                <h4 style="margin: 0 0 5px 0; color: #1e293b;">${site.name}</h4>
                <p style="margin: 0; color: #64748b; font-size: 14px;">High-protein ${site.foodType} recipes</p>
              </td>
              <td align="right">
                <a href="https://${site.domain}" style="color: #f59e0b; font-size: 14px; text-decoration: none;">Visit →</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">🏰 Welcome to the Protein Empire!</h2>
    
    <p>Hey ${recipientName}!</p>
    
    <p>Did you know that ${sourceSite.name} is part of something bigger?</p>
    
    <p>We're proud to introduce the <strong>Protein Empire</strong> – a family of 12 specialized recipe sites, each dedicated to a different type of high-protein treat!</p>
    
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #92400e;">🎯 Our Mission</h3>
      <p style="margin: 0; color: #78350f;">Make high-protein baking accessible, delicious, and accurate for everyone – with gram-based measurements and USDA-verified nutrition data.</p>
    </div>
    
    <h3 style="margin: 30px 0 15px 0; color: #1e293b;">Explore the Empire:</h3>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      ${siteList}
    </table>
    
    <p>Each site offers:</p>
    <ul style="color: #475569; padding-left: 20px;">
      <li>25+ macro-verified recipes</li>
      <li>Free downloadable recipe packs</li>
      <li>Printable recipe cards</li>
      <li>Weekly new recipes</li>
    </ul>
    
    ${generateButton('Visit the Empire Hub', 'https://highprotein.recipes', '#f59e0b')}
    
    <p>Happy exploring! 🗺️</p>
    
    <p style="margin-top: 30px;">
      <strong>The Protein Empire Team</strong>
    </p>
  `;

  return {
    subject: `🏰 Welcome to the Protein Empire - 12 Sites, Endless Recipes!`,
    preheader: `Discover all 12 specialized protein recipe sites`,
    html: generateBaseTemplate({
      siteName: 'Protein Empire',
      brandColor: '#f59e0b',
      preheader: `Discover all 12 specialized protein recipe sites`,
      content
    }),
    plainText: `
Welcome to the Protein Empire!

Hey ${recipientName}!

Did you know that ${sourceSite.name} is part of something bigger?

We're proud to introduce the Protein Empire – a family of 12 specialized recipe sites!

Our Mission: Make high-protein baking accessible, delicious, and accurate for everyone.

Explore the Empire:
${empireSites.filter(s => s.domain !== sourceSite.domain).map(s => `- ${s.name}: https://${s.domain}`).join('\n')}

Each site offers:
- 25+ macro-verified recipes
- Free downloadable recipe packs
- Printable recipe cards
- Weekly new recipes

Visit the Empire Hub: https://highprotein.recipes

Happy exploring!
The Protein Empire Team
    `.trim()
  };
}

/**
 * Generate cross-promotion schedule
 * Creates a rotation of cross-promo emails for a site
 */
export function generateCrossPromoSchedule(sourceSite, empireSites, recipesByDomain) {
  const schedule = [];
  const otherSites = empireSites.filter(s => s.domain !== sourceSite.domain);

  otherSites.forEach((targetSite, index) => {
    const targetRecipes = recipesByDomain[targetSite.domain] || [];
    
    schedule.push({
      week: index + 1,
      targetSite: targetSite.domain,
      email: generateCrossPromoEmail({
        sourceSite,
        targetSite,
        featuredRecipes: targetRecipes.slice(0, 3)
      })
    });
  });

  return schedule;
}

/**
 * Generate re-engagement email for inactive subscribers
 */
export function generateReEngagementEmail(options) {
  const {
    siteName,
    brandColor = '#f59e0b',
    domain,
    topRecipes = [],
    recipientName = 'there'
  } = options;

  const recipeList = topRecipes.slice(0, 3).map(recipe => `
    <li style="margin-bottom: 10px;">
      <a href="https://${domain}/${recipe.slug}" style="color: #1e293b; text-decoration: none;">
        <strong>${recipe.title}</strong>
      </a>
      <span style="color: #64748b;"> - ${recipe.protein}g protein</span>
    </li>
  `).join('');

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">We Miss You! 👋</h2>
    
    <p>Hey ${recipientName}!</p>
    
    <p>It's been a while since we've seen you at ${siteName}, and we wanted to check in.</p>
    
    <p>While you've been away, we've been busy adding new recipes! Here are some you might have missed:</p>
    
    <ul style="color: #475569; padding-left: 20px;">
      ${recipeList}
    </ul>
    
    ${generateButton('See What\'s New', `https://${domain}`, brandColor)}
    
    <p>We'd love to have you back in the kitchen with us!</p>
    
    <p>Happy baking! 🍪</p>
    
    <p style="margin-top: 30px;">
      <strong>The ${siteName} Team</strong>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #64748b;">
      Not interested anymore? No hard feelings! You can <a href="{{unsubscribe_url}}" style="color: ${brandColor};">unsubscribe here</a>.
    </p>
  `;

  return {
    subject: `👋 We miss you at ${siteName}!`,
    preheader: `Check out what you've been missing`,
    html: generateBaseTemplate({
      siteName,
      brandColor,
      preheader: `Check out what you've been missing`,
      content
    }),
    plainText: `
We Miss You!

Hey ${recipientName}!

It's been a while since we've seen you at ${siteName}, and we wanted to check in.

While you've been away, we've been busy adding new recipes:
${topRecipes.slice(0, 3).map(r => `- ${r.title} (${r.protein}g protein): https://${domain}/${r.slug}`).join('\n')}

See what's new: https://${domain}

We'd love to have you back in the kitchen with us!

Happy baking!
The ${siteName} Team
    `.trim()
  };
}

export default {
  generateCrossPromoEmail,
  generateEmpireAnnouncementEmail,
  generateCrossPromoSchedule,
  generateReEngagementEmail
};
