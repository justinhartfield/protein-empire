/**
 * Welcome Sequence Email Templates for the Protein Empire
 * 
 * A 5-email automated sequence that nurtures new subscribers:
 * - Email 1 (Immediate): PDF delivery
 * - Email 2 (Day 2): Personal welcome story
 * - Email 3 (Day 4): Value-add tips
 * - Email 4 (Day 6): Cross-promotion
 * - Email 5 (Day 8): Social proof
 */

import { generateBaseTemplate, generateButton, generateRecipeCard, generateMacroDisplay } from './base.js';

/**
 * Email 1: PDF Delivery (Immediate)
 * Delivers the promised lead magnet PDF
 */
export function generateEmail1_PdfDelivery(options) {
  const {
    siteName,
    brandColor = '#f59e0b',
    packName,
    downloadUrl,
    recipientName = 'there'
  } = options;

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">Your ${packName} is ready! 🎉</h2>
    
    <p>Hey ${recipientName}!</p>
    
    <p>Thanks for joining the ${siteName} community! Your free recipe pack is ready to download.</p>
    
    ${generateButton('Download Your PDF', downloadUrl, brandColor)}
    
    <p style="color: #64748b; font-size: 14px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${downloadUrl}" style="color: ${brandColor};">${downloadUrl}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <h3 style="margin: 0 0 15px 0; color: #1e293b;">What's Inside:</h3>
    
    <ul style="color: #475569; padding-left: 20px;">
      <li>5+ macro-verified recipes with exact measurements</li>
      <li>Complete nutrition info for each recipe</li>
      <li>Printable recipe cards</li>
      <li>Pro tips for perfect results every time</li>
    </ul>
    
    <p>Over the next week, I'll be sending you some of my best tips for protein baking success. Keep an eye on your inbox!</p>
    
    <p>Happy baking! 🍪</p>
    
    <p style="margin-top: 30px;">
      <strong>The ${siteName} Team</strong>
    </p>
  `;

  return {
    subject: `Your ${packName} is ready! 🎉`,
    preheader: `Download your free recipe pack now`,
    html: generateBaseTemplate({
      siteName,
      brandColor,
      preheader: `Download your free recipe pack now`,
      content
    }),
    plainText: `
Your ${packName} is ready!

Hey ${recipientName}!

Thanks for joining the ${siteName} community! Your free recipe pack is ready to download.

Download here: ${downloadUrl}

What's Inside:
- 5+ macro-verified recipes with exact measurements
- Complete nutrition info for each recipe
- Printable recipe cards
- Pro tips for perfect results every time

Over the next week, I'll be sending you some of my best tips for protein baking success.

Happy baking!
The ${siteName} Team
    `.trim(),
    sendDelay: 0, // Immediate
    dayNumber: 0
  };
}

/**
 * Email 2: Personal Welcome Story (Day 2)
 * Builds connection with the brand story
 */
export function generateEmail2_WelcomeStory(options) {
  const {
    siteName,
    brandColor = '#f59e0b',
    foodType,
    domain,
    recipientName = 'there'
  } = options;

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">The Story Behind ${siteName} 📖</h2>
    
    <p>Hey ${recipientName}!</p>
    
    <p>I wanted to take a moment to share why I started ${siteName} and what we're all about.</p>
    
    <p>Like you, I was frustrated with protein ${foodType} recipes that:</p>
    
    <ul style="color: #475569; padding-left: 20px;">
      <li>Tasted dry and chalky 😬</li>
      <li>Had vague measurements ("1 scoop of protein")</li>
      <li>Didn't include accurate nutrition info</li>
      <li>Required weird ingredients I couldn't find</li>
    </ul>
    
    <p>So I decided to create something better.</p>
    
    <p><strong>Every recipe on ${siteName} is:</strong></p>
    
    <ul style="color: #475569; padding-left: 20px;">
      <li>✅ Measured in grams for precision</li>
      <li>✅ Calculated with USDA nutrition data</li>
      <li>✅ Tested multiple times for perfect results</li>
      <li>✅ Made with ingredients you can actually find</li>
    </ul>
    
    <p>Our mission is simple: make high-protein baking accessible, delicious, and accurate for everyone.</p>
    
    ${generateButton('Explore All Recipes', `https://${domain}`, brandColor)}
    
    <p>Tomorrow, I'll share the 3 biggest mistakes people make with protein ${foodType} (and how to avoid them).</p>
    
    <p>Talk soon! 👋</p>
    
    <p style="margin-top: 30px;">
      <strong>The ${siteName} Team</strong>
    </p>
  `;

  return {
    subject: `The story behind ${siteName} 📖`,
    preheader: `Why we started and what makes us different`,
    html: generateBaseTemplate({
      siteName,
      brandColor,
      preheader: `Why we started and what makes us different`,
      content
    }),
    plainText: `
The Story Behind ${siteName}

Hey ${recipientName}!

I wanted to take a moment to share why I started ${siteName} and what we're all about.

Like you, I was frustrated with protein ${foodType} recipes that:
- Tasted dry and chalky
- Had vague measurements ("1 scoop of protein")
- Didn't include accurate nutrition info
- Required weird ingredients I couldn't find

So I decided to create something better.

Every recipe on ${siteName} is:
✅ Measured in grams for precision
✅ Calculated with USDA nutrition data
✅ Tested multiple times for perfect results
✅ Made with ingredients you can actually find

Our mission is simple: make high-protein baking accessible, delicious, and accurate for everyone.

Explore all recipes: https://${domain}

Tomorrow, I'll share the 3 biggest mistakes people make with protein ${foodType}.

Talk soon!
The ${siteName} Team
    `.trim(),
    sendDelay: 2 * 24 * 60 * 60 * 1000, // 2 days in ms
    dayNumber: 2
  };
}

/**
 * Email 3: Value-Add Tips (Day 4)
 * Provides actionable tips to build trust
 */
export function generateEmail3_Tips(options) {
  const {
    siteName,
    brandColor = '#f59e0b',
    foodType,
    domain,
    recipientName = 'there'
  } = options;

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">3 Common Protein ${foodType.charAt(0).toUpperCase() + foodType.slice(1)} Mistakes 🚫</h2>
    
    <p>Hey ${recipientName}!</p>
    
    <p>After helping thousands of people make better protein ${foodType}, I've noticed the same mistakes come up again and again.</p>
    
    <p>Here's how to avoid them:</p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
    
    <h3 style="color: #ef4444; margin: 0 0 10px 0;">❌ Mistake #1: Using Too Much Protein Powder</h3>
    <p>More protein powder ≠ better results. Too much makes your ${foodType} dry and crumbly. Stick to the recipe ratios!</p>
    
    <p style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
      <strong>✅ Fix:</strong> Never exceed 30-40% protein powder by weight in your dry ingredients.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
    
    <h3 style="color: #ef4444; margin: 0 0 10px 0;">❌ Mistake #2: Overbaking</h3>
    <p>Protein ${foodType} continue cooking after you remove them from the oven. Taking them out when they look "done" means they'll be overdone.</p>
    
    <p style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
      <strong>✅ Fix:</strong> Remove when centers look slightly underdone. They'll firm up as they cool.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
    
    <h3 style="color: #ef4444; margin: 0 0 10px 0;">❌ Mistake #3: Using Volume Measurements</h3>
    <p>"1 scoop" of protein powder can vary by 10-15g depending on how packed it is. This throws off your macros AND texture.</p>
    
    <p style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
      <strong>✅ Fix:</strong> Always weigh your ingredients in grams. A $15 kitchen scale is the best investment you'll make.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
    
    <p>All our recipes are designed to help you avoid these mistakes with precise gram measurements and tested baking times.</p>
    
    ${generateButton('Browse Recipes', `https://${domain}`, brandColor)}
    
    <p>In a couple days, I'll introduce you to some of our sister sites in the Protein Empire. You might find some new favorites!</p>
    
    <p>Happy baking! 🍪</p>
    
    <p style="margin-top: 30px;">
      <strong>The ${siteName} Team</strong>
    </p>
  `;

  return {
    subject: `3 mistakes ruining your protein ${foodType} 🚫`,
    preheader: `Avoid these common errors for perfect results`,
    html: generateBaseTemplate({
      siteName,
      brandColor,
      preheader: `Avoid these common errors for perfect results`,
      content
    }),
    plainText: `
3 Common Protein ${foodType.charAt(0).toUpperCase() + foodType.slice(1)} Mistakes

Hey ${recipientName}!

After helping thousands of people make better protein ${foodType}, I've noticed the same mistakes come up again and again.

❌ Mistake #1: Using Too Much Protein Powder
More protein powder ≠ better results. Too much makes your ${foodType} dry and crumbly.
✅ Fix: Never exceed 30-40% protein powder by weight in your dry ingredients.

❌ Mistake #2: Overbaking
Protein ${foodType} continue cooking after you remove them from the oven.
✅ Fix: Remove when centers look slightly underdone. They'll firm up as they cool.

❌ Mistake #3: Using Volume Measurements
"1 scoop" of protein powder can vary by 10-15g depending on how packed it is.
✅ Fix: Always weigh your ingredients in grams.

Browse recipes: https://${domain}

Happy baking!
The ${siteName} Team
    `.trim(),
    sendDelay: 4 * 24 * 60 * 60 * 1000, // 4 days in ms
    dayNumber: 4
  };
}

/**
 * Email 4: Cross-Promotion (Day 6)
 * Introduces other sites in the empire
 */
export function generateEmail4_CrossPromo(options) {
  const {
    siteName,
    brandColor = '#f59e0b',
    foodType,
    domain,
    empireSites = [],
    recipientName = 'there'
  } = options;

  // Filter out current site and get 3 other sites
  const otherSites = empireSites
    .filter(s => s.domain !== domain)
    .slice(0, 3);

  const siteLinks = otherSites.map(site => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 5px 0; color: #1e293b;">${site.name}</h4>
        <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">High-protein ${site.foodType} recipes</p>
        <a href="https://${site.domain}" style="color: ${brandColor}; font-weight: 600; text-decoration: none;">Visit ${site.domain} →</a>
      </td>
    </tr>
  `).join('');

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">Did You Know? 🌟</h2>
    
    <p>Hey ${recipientName}!</p>
    
    <p>Love our protein ${foodType} recipes? I have some exciting news...</p>
    
    <p><strong>${siteName} is part of the Protein Empire</strong> – a family of 12 specialized recipe sites, each focused on a different type of high-protein treat!</p>
    
    <p>Here are a few you might love:</p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      ${siteLinks}
    </table>
    
    <p>Each site follows the same standards you love:</p>
    
    <ul style="color: #475569; padding-left: 20px;">
      <li>Gram-based measurements</li>
      <li>USDA-verified nutrition data</li>
      <li>Tested recipes that actually work</li>
      <li>Free recipe packs to download</li>
    </ul>
    
    ${generateButton('Explore the Empire', 'https://highprotein.recipes', brandColor)}
    
    <p>In our next email, I'll share some of the amazing results our community has been getting. You won't want to miss it!</p>
    
    <p>Happy exploring! 🗺️</p>
    
    <p style="margin-top: 30px;">
      <strong>The ${siteName} Team</strong>
    </p>
  `;

  return {
    subject: `Did you know we also have protein ${otherSites[0]?.foodType || 'brownies'}? 🌟`,
    preheader: `Discover the Protein Empire - 12 specialized recipe sites`,
    html: generateBaseTemplate({
      siteName,
      brandColor,
      preheader: `Discover the Protein Empire - 12 specialized recipe sites`,
      content
    }),
    plainText: `
Did You Know?

Hey ${recipientName}!

Love our protein ${foodType} recipes? I have some exciting news...

${siteName} is part of the Protein Empire – a family of 12 specialized recipe sites!

Here are a few you might love:
${otherSites.map(s => `- ${s.name}: https://${s.domain}`).join('\n')}

Each site follows the same standards:
- Gram-based measurements
- USDA-verified nutrition data
- Tested recipes that actually work
- Free recipe packs to download

Explore the Empire: https://highprotein.recipes

Happy exploring!
The ${siteName} Team
    `.trim(),
    sendDelay: 6 * 24 * 60 * 60 * 1000, // 6 days in ms
    dayNumber: 6
  };
}

/**
 * Email 5: Social Proof (Day 8)
 * Shows community results and encourages engagement
 */
export function generateEmail5_SocialProof(options) {
  const {
    siteName,
    brandColor = '#f59e0b',
    foodType,
    domain,
    recipientName = 'there'
  } = options;

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b;">Look What Our Community is Making! 📸</h2>
    
    <p>Hey ${recipientName}!</p>
    
    <p>I wanted to share some of the amazing results from our ${siteName} community. These photos always make my day!</p>
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="font-style: italic; margin: 0 0 10px 0;">"I've tried so many protein ${foodType} recipes and these are BY FAR the best. My kids don't even know they're healthy!"</p>
      <p style="margin: 0; color: #64748b; font-size: 14px;">— Sarah M.</p>
    </div>
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="font-style: italic; margin: 0 0 10px 0;">"Finally, recipes with actual gram measurements! My macros are always spot-on now."</p>
      <p style="margin: 0; color: #64748b; font-size: 14px;">— Mike T.</p>
    </div>
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="font-style: italic; margin: 0 0 10px 0;">"I meal prep a batch every Sunday. Game changer for hitting my protein goals!"</p>
      <p style="margin: 0; color: #64748b; font-size: 14px;">— Jessica L.</p>
    </div>
    
    <p><strong>Want to see more?</strong> Follow us on Instagram where we share community creations, tips, and behind-the-scenes content!</p>
    
    ${generateButton('Follow on Instagram', 'https://instagram.com/proteinempire', brandColor)}
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <h3 style="margin: 0 0 15px 0; color: #1e293b;">What's Next?</h3>
    
    <p>This is the last email in our welcome series, but we're just getting started!</p>
    
    <p>Going forward, you'll receive our <strong>weekly newsletter</strong> featuring:</p>
    
    <ul style="color: #475569; padding-left: 20px;">
      <li>🆕 New recipes as they're published</li>
      <li>💡 Protein baking tips and tricks</li>
      <li>🏆 Community highlights</li>
      <li>🎁 Exclusive offers and early access</li>
    </ul>
    
    <p>Thanks for being part of the ${siteName} community. Now go make something delicious!</p>
    
    <p>Happy baking! 🍪</p>
    
    <p style="margin-top: 30px;">
      <strong>The ${siteName} Team</strong>
    </p>
    
    <p style="font-size: 14px; color: #64748b;">
      P.S. Made one of our recipes? Tag us @proteinempire on Instagram – we love seeing your creations!
    </p>
  `;

  return {
    subject: `Look what people are making! 📸`,
    preheader: `Amazing results from our community`,
    html: generateBaseTemplate({
      siteName,
      brandColor,
      preheader: `Amazing results from our community`,
      content
    }),
    plainText: `
Look What Our Community is Making!

Hey ${recipientName}!

I wanted to share some of the amazing results from our ${siteName} community.

"I've tried so many protein ${foodType} recipes and these are BY FAR the best. My kids don't even know they're healthy!" — Sarah M.

"Finally, recipes with actual gram measurements! My macros are always spot-on now." — Mike T.

"I meal prep a batch every Sunday. Game changer for hitting my protein goals!" — Jessica L.

Follow us on Instagram: https://instagram.com/proteinempire

What's Next?

This is the last email in our welcome series. Going forward, you'll receive our weekly newsletter featuring:
- New recipes as they're published
- Protein baking tips and tricks
- Community highlights
- Exclusive offers and early access

Thanks for being part of the ${siteName} community!

Happy baking!
The ${siteName} Team

P.S. Made one of our recipes? Tag us @proteinempire on Instagram!
    `.trim(),
    sendDelay: 8 * 24 * 60 * 60 * 1000, // 8 days in ms
    dayNumber: 8
  };
}

/**
 * Generate complete welcome sequence for a site
 */
export function generateWelcomeSequence(options) {
  return {
    sequenceName: `${options.siteName} Welcome Sequence`,
    totalEmails: 5,
    duration: '8 days',
    emails: [
      generateEmail1_PdfDelivery(options),
      generateEmail2_WelcomeStory(options),
      generateEmail3_Tips(options),
      generateEmail4_CrossPromo(options),
      generateEmail5_SocialProof(options)
    ]
  };
}

export default {
  generateEmail1_PdfDelivery,
  generateEmail2_WelcomeStory,
  generateEmail3_Tips,
  generateEmail4_CrossPromo,
  generateEmail5_SocialProof,
  generateWelcomeSequence
};
