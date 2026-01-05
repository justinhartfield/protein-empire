/**
 * Base Email Template for the Protein Empire
 * 
 * Provides a responsive, mobile-friendly email template that works
 * across all major email clients (Gmail, Outlook, Apple Mail, etc.)
 */

/**
 * Generate the base HTML wrapper for all emails
 * @param {Object} options - Template options
 * @param {string} options.siteName - Name of the site
 * @param {string} options.brandColor - Primary brand color (hex)
 * @param {string} options.preheader - Preview text shown in inbox
 * @param {string} options.content - Main email content HTML
 * @param {string} options.footerText - Custom footer text
 * @param {string} options.unsubscribeUrl - Unsubscribe link URL
 * @returns {string} - Complete HTML email
 */
export function generateBaseTemplate(options) {
  const {
    siteName = 'Protein Empire',
    brandColor = '#f59e0b',
    preheader = '',
    content = '',
    footerText = '',
    unsubscribeUrl = '{{unsubscribe_url}}'
  } = options;

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${siteName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    
    /* Base styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .header {
      background-color: ${brandColor};
      padding: 30px 40px;
      text-align: center;
    }
    
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    
    .content {
      padding: 40px;
    }
    
    .button {
      display: inline-block;
      background-color: ${brandColor};
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
    }
    
    .button:hover {
      background-color: #d97706;
    }
    
    .footer {
      background-color: #f1f5f9;
      padding: 30px 40px;
      text-align: center;
      font-size: 14px;
      color: #64748b;
    }
    
    .footer a {
      color: ${brandColor};
      text-decoration: none;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 10px;
    }
    
    /* Responsive styles */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .content, .header, .footer {
        padding: 20px !important;
      }
      .header h1 {
        font-size: 24px !important;
      }
    }
  </style>
</head>
<body>
  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${preheader}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>
  
  <!-- Email wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Email container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td class="header" style="background-color: ${brandColor}; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🍪 ${siteName}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer" style="background-color: #f1f5f9; padding: 30px 40px; text-align: center; font-size: 14px; color: #64748b;">
              ${footerText || `<p>You're receiving this email because you signed up for ${siteName}.</p>`}
              
              <div class="social-links" style="margin: 20px 0;">
                <a href="https://pinterest.com/proteinempire" style="color: ${brandColor};">Pinterest</a> •
                <a href="https://instagram.com/proteinempire" style="color: ${brandColor};">Instagram</a> •
                <a href="https://tiktok.com/@proteinempire" style="color: ${brandColor};">TikTok</a>
              </div>
              
              <p style="margin: 10px 0;">
                <a href="${unsubscribeUrl}" style="color: #94a3b8;">Unsubscribe</a> •
                <a href="https://proteinempire.com/preferences" style="color: #94a3b8;">Email Preferences</a>
              </p>
              
              <p style="margin: 10px 0; color: #94a3b8;">
                © ${new Date().getFullYear()} Protein Empire. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate a button HTML
 */
export function generateButton(text, url, color = '#f59e0b') {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto;">
      <tr>
        <td style="border-radius: 8px; background-color: ${color};">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generate a recipe card HTML
 */
export function generateRecipeCard(recipe, domain) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="padding: 0;">
          <img src="https://${domain}/images/${recipe.image}" alt="${recipe.title}" width="100%" style="display: block; max-height: 200px; object-fit: cover;">
        </td>
      </tr>
      <tr>
        <td style="padding: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #1e293b;">${recipe.title}</h3>
          <p style="margin: 0 0 15px 0; color: #64748b; font-size: 14px;">
            <strong>${recipe.protein}g protein</strong> • ${recipe.calories} cal • ${recipe.totalTime} min
          </p>
          <a href="https://${domain}/${recipe.slug}" style="color: #f59e0b; font-weight: 600; text-decoration: none;">View Recipe →</a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generate a macro display HTML
 */
export function generateMacroDisplay(recipe) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border-radius: 8px; padding: 20px;">
      <tr>
        <td align="center" style="padding: 10px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="padding: 0 15px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${recipe.protein}g</div>
                <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Protein</div>
              </td>
              <td style="padding: 0 15px; text-align: center; border-left: 1px solid #e2e8f0;">
                <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${recipe.calories}</div>
                <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Calories</div>
              </td>
              <td style="padding: 0 15px; text-align: center; border-left: 1px solid #e2e8f0;">
                <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${recipe.carbs}g</div>
                <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Carbs</div>
              </td>
              <td style="padding: 0 15px; text-align: center; border-left: 1px solid #e2e8f0;">
                <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${recipe.fat}g</div>
                <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Fat</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export default {
  generateBaseTemplate,
  generateButton,
  generateRecipeCard,
  generateMacroDisplay
};
