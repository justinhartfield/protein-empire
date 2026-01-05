/**
 * Newsletter Email Templates for the Protein Empire
 * 
 * Weekly newsletter templates featuring:
 * - Recipe of the week
 * - Curated recipe roundups
 * - Tips and tricks
 * - Cross-site promotions
 */

import { generateBaseTemplate, generateButton, generateRecipeCard, generateMacroDisplay } from './base.js';

/**
 * Generate weekly newsletter email
 * @param {Object} options - Newsletter options
 * @returns {Object} - Email content object
 */
export function generateWeeklyNewsletter(options) {
  const {
    siteName = 'Protein Empire',
    brandColor = '#f59e0b',
    domain,
    featuredRecipe,
    additionalRecipes = [],
    tip = null,
    crossPromoSite = null,
    weekNumber = 1
  } = options;

  // Build featured recipe section
  const featuredSection = featuredRecipe ? `
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">🌟 Recipe of the Week</h2>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
      <tr>
        <td>
          <img src="https://${domain}/images/${featuredRecipe.image}" alt="${featuredRecipe.title}" width="100%" style="display: block; border-radius: 12px; max-height: 300px; object-fit: cover;">
        </td>
      </tr>
    </table>
    
    <h3 style="margin: 20px 0 10px 0; color: #1e293b; font-size: 22px;">${featuredRecipe.title}</h3>
    
    ${generateMacroDisplay(featuredRecipe)}
    
    <p style="color: #475569;">${featuredRecipe.description?.substring(0, 200)}...</p>
    
    ${generateButton('Get the Recipe', `https://${domain}/${featuredRecipe.slug}`, brandColor)}
  ` : '';

  // Build additional recipes section
  const additionalSection = additionalRecipes.length > 0 ? `
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">📚 More Recipes You'll Love</h2>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${additionalRecipes.slice(0, 3).map(recipe => `
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #e2e8f0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td width="80" style="vertical-align: top;">
                  <img src="https://${domain}/images/${recipe.image}" alt="${recipe.title}" width="80" height="80" style="display: block; border-radius: 8px; object-fit: cover;">
                </td>
                <td style="padding-left: 15px; vertical-align: top;">
                  <h4 style="margin: 0 0 5px 0; color: #1e293b;">${recipe.title}</h4>
                  <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                    <strong>${recipe.protein}g protein</strong> • ${recipe.calories} cal
                  </p>
                  <a href="https://${domain}/${recipe.slug}" style="color: ${brandColor}; font-size: 14px; text-decoration: none;">View Recipe →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `).join('')}
    </table>
  ` : '';

  // Build tip section
  const tipSection = tip ? `
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">💡 Pro Tip of the Week</h2>
    
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid ${brandColor};">
      <h4 style="margin: 0 0 10px 0; color: #92400e;">${tip.title}</h4>
      <p style="margin: 0; color: #78350f;">${tip.content}</p>
    </div>
  ` : '';

  // Build cross-promo section
  const crossPromoSection = crossPromoSite ? `
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">🌐 From the Empire</h2>
    
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #0369a1;">Check out ${crossPromoSite.name}!</h4>
      <p style="margin: 0 0 15px 0; color: #0c4a6e;">
        Love our recipes? You'll also love our sister site for high-protein ${crossPromoSite.foodType}!
      </p>
      <a href="https://${crossPromoSite.domain}" style="color: ${brandColor}; font-weight: 600; text-decoration: none;">
        Visit ${crossPromoSite.domain} →
      </a>
    </div>
  ` : '';

  const content = `
    <p style="color: #64748b; font-size: 14px; margin: 0 0 20px 0;">Week ${weekNumber} • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
    
    <h1 style="margin: 0 0 20px 0; color: #1e293b;">This Week at ${siteName} 🍪</h1>
    
    <p>Hey there!</p>
    
    <p>Here's what's cooking this week in the Protein Empire...</p>
    
    ${featuredSection}
    ${additionalSection}
    ${tipSection}
    ${crossPromoSection}
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p>That's all for this week! As always, if you make any of our recipes, tag us on Instagram @proteinempire – we love seeing your creations!</p>
    
    <p>Happy baking! 🍪</p>
    
    <p style="margin-top: 30px;">
      <strong>The ${siteName} Team</strong>
    </p>
  `;

  return {
    subject: `🍪 This Week: ${featuredRecipe?.title || 'New Recipes Inside'}`,
    preheader: `${featuredRecipe?.protein || '20'}g protein recipes + tips`,
    html: generateBaseTemplate({
      siteName,
      brandColor,
      preheader: `${featuredRecipe?.protein || '20'}g protein recipes + tips`,
      content
    }),
    plainText: generatePlainTextNewsletter(options)
  };
}

/**
 * Generate plain text version of newsletter
 */
function generatePlainTextNewsletter(options) {
  const { siteName, domain, featuredRecipe, additionalRecipes = [], tip, crossPromoSite } = options;
  
  let text = `
This Week at ${siteName}
========================

Hey there!

Here's what's cooking this week in the Protein Empire...
`;

  if (featuredRecipe) {
    text += `

🌟 RECIPE OF THE WEEK
${featuredRecipe.title}
${featuredRecipe.protein}g protein | ${featuredRecipe.calories} cal | ${featuredRecipe.carbs}g carbs | ${featuredRecipe.fat}g fat

${featuredRecipe.description?.substring(0, 200)}...

Get the recipe: https://${domain}/${featuredRecipe.slug}
`;
  }

  if (additionalRecipes.length > 0) {
    text += `

📚 MORE RECIPES YOU'LL LOVE
`;
    additionalRecipes.slice(0, 3).forEach(recipe => {
      text += `
• ${recipe.title} (${recipe.protein}g protein)
  https://${domain}/${recipe.slug}
`;
    });
  }

  if (tip) {
    text += `

💡 PRO TIP OF THE WEEK
${tip.title}
${tip.content}
`;
  }

  if (crossPromoSite) {
    text += `

🌐 FROM THE EMPIRE
Check out ${crossPromoSite.name} for high-protein ${crossPromoSite.foodType}!
https://${crossPromoSite.domain}
`;
  }

  text += `

---

That's all for this week! Tag us on Instagram @proteinempire when you make our recipes!

Happy baking!
The ${siteName} Team
`;

  return text.trim();
}

/**
 * Generate recipe roundup newsletter
 */
export function generateRoundupNewsletter(options) {
  const {
    siteName = 'Protein Empire',
    brandColor = '#f59e0b',
    domain,
    theme = 'Top Recipes',
    recipes = [],
    intro = ''
  } = options;

  const recipeCards = recipes.slice(0, 5).map((recipe, index) => `
    <tr>
      <td style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="40" style="vertical-align: top; color: ${brandColor}; font-size: 24px; font-weight: 700;">
              ${index + 1}
            </td>
            <td width="100" style="vertical-align: top;">
              <img src="https://${domain}/images/${recipe.image}" alt="${recipe.title}" width="100" height="100" style="display: block; border-radius: 8px; object-fit: cover;">
            </td>
            <td style="padding-left: 15px; vertical-align: top;">
              <h4 style="margin: 0 0 8px 0; color: #1e293b;">${recipe.title}</h4>
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                <strong>${recipe.protein}g protein</strong> • ${recipe.calories} cal • ${recipe.totalTime} min
              </p>
              <a href="https://${domain}/${recipe.slug}" style="color: ${brandColor}; font-size: 14px; font-weight: 600; text-decoration: none;">Get Recipe →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const content = `
    <h1 style="margin: 0 0 20px 0; color: #1e293b;">🏆 ${theme}</h1>
    
    <p>${intro || `Here are our most-loved recipes that our community can't stop making!`}</p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      ${recipeCards}
    </table>
    
    ${generateButton('See All Recipes', `https://${domain}`, brandColor)}
    
    <p>Which one are you trying first? Reply and let us know!</p>
    
    <p>Happy baking! 🍪</p>
    
    <p style="margin-top: 30px;">
      <strong>The ${siteName} Team</strong>
    </p>
  `;

  return {
    subject: `🏆 ${theme}`,
    preheader: `Our community's favorite recipes`,
    html: generateBaseTemplate({
      siteName,
      brandColor,
      preheader: `Our community's favorite recipes`,
      content
    })
  };
}

/**
 * Generate tips collection for newsletters
 */
export const weeklyTips = [
  {
    title: 'The Protein Powder Ratio Rule',
    content: 'For best texture, protein powder should make up no more than 30-40% of your dry ingredients. More than that leads to dry, crumbly results.'
  },
  {
    title: 'The Underbake Secret',
    content: 'Always remove protein baked goods when they look slightly underdone. They continue cooking on the pan and will firm up as they cool.'
  },
  {
    title: 'Moisture is Key',
    content: 'Greek yogurt, mashed banana, and applesauce are your best friends for keeping protein bakes moist. Add 2-3 tablespoons to any recipe that seems dry.'
  },
  {
    title: 'Let It Rest',
    content: 'Protein batter often benefits from resting 5-10 minutes before baking. This allows the protein powder to hydrate and creates better texture.'
  },
  {
    title: 'The Gram Scale Investment',
    content: 'A $15 kitchen scale is the best investment for protein baking. Measuring in grams ensures consistent results and accurate macros every time.'
  },
  {
    title: 'Flavor Masking 101',
    content: 'Cocoa powder, cinnamon, and vanilla extract are excellent at masking the taste of protein powder. Use them generously!'
  },
  {
    title: 'Storage Secrets',
    content: 'Store protein baked goods in an airtight container with a piece of bread. The bread absorbs excess moisture and keeps them fresh longer.'
  },
  {
    title: 'The Freezer is Your Friend',
    content: 'Most protein baked goods freeze beautifully for up to 3 months. Meal prep a big batch and thaw as needed!'
  }
];

export default {
  generateWeeklyNewsletter,
  generateRoundupNewsletter,
  weeklyTips
};
