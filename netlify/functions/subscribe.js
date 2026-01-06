/**
 * Netlify Serverless Function: Subscribe
 * 
 * Handles email subscription requests from the frontend.
 * Adds contacts to SendGrid and optionally sends a PDF delivery email.
 * 
 * Environment Variables Required:
 * - SENDGRID_API_KEY: Your SendGrid API key
 * - SENDGRID_LIST_ID: The list ID for this specific site
 * - SENDGRID_FROM_EMAIL: Verified sender email (e.g., hello@proteincookies.co)
 * - SITE_NAME: Display name (e.g., "ProteinCookies")
 */

// Import SendGrid client directly (Netlify bundles dependencies)
import sgClient from '@sendgrid/client';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY || '';
sgClient.setApiKey(apiKey);
sgMail.setApiKey(apiKey);

/**
 * Add contact to SendGrid list
 */
async function subscribeContact(email, listId) {
  const requestData = {
    list_ids: [listId],
    contacts: [{ email: email.toLowerCase().trim() }]
  };

  const request = {
    url: '/v3/marketing/contacts',
    method: 'PUT',
    body: requestData
  };

  const [response] = await sgClient.request(request);
  return response;
}

/**
 * Send PDF delivery email
 */
async function sendPdfEmail(to, from, packName, downloadUrl, siteName) {
  const subject = `Your ${packName} is ready! 🎉`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b; margin: 0;">🍪 ${siteName}</h1>
      </div>
      
      <h2 style="color: #1e293b;">Your ${packName} is ready!</h2>
      
      <p>Thanks for downloading! Click the button below to get your free recipe pack:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${downloadUrl}" 
           style="display: inline-block; background-color: #f59e0b; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Download Your PDF
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${downloadUrl}" style="color: #f59e0b;">${downloadUrl}</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <p style="color: #64748b; font-size: 12px; text-align: center;">
        You're receiving this because you requested the ${packName} from ${siteName}.<br>
        Questions? Just reply to this email.
      </p>
    </body>
    </html>
  `;

  const text = `Your ${packName} is ready!\n\nDownload here: ${downloadUrl}`;

  await sgMail.send({
    to,
    from,
    subject,
    html,
    text
  });
}

/**
 * Main handler
 */
export async function handler(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { email, packSlug, pdfUrl } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Valid email is required' })
      };
    }

    // Get environment variables
    const listId = process.env.SENDGRID_LIST_ID;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const siteName = process.env.PROTEIN_SITE_NAME || process.env.SITE_NAME || 'Protein Empire';

    // Check configuration
    if (!apiKey) {
      console.error('[subscribe] SENDGRID_API_KEY not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Email service not configured' })
      };
    }

    if (!listId) {
      console.error('[subscribe] SENDGRID_LIST_ID not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Email list not configured' })
      };
    }

    // Subscribe contact to list (triggers welcome automation)
    try {
      await subscribeContact(email, listId);
      console.log(`[subscribe] Contact ${email} added to list ${listId}`);
    } catch (error) {
      console.error('[subscribe] Error adding contact:', error?.response?.body || error.message);
      // Continue anyway - we still want to send the PDF
    }

    // Send PDF delivery email if URL provided
    if (pdfUrl && fromEmail) {
      try {
        const packName = formatPackName(packSlug);
        await sendPdfEmail(email, fromEmail, packName, pdfUrl, siteName);
        console.log(`[subscribe] PDF email sent to ${email}`);
      } catch (error) {
        console.error('[subscribe] Error sending PDF email:', error?.response?.body || error.message);
        // Don't fail the request - the subscription succeeded
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Successfully subscribed!' 
      })
    };

  } catch (error) {
    console.error('[subscribe] Unexpected error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'An unexpected error occurred' })
    };
  }
}

/**
 * Format pack slug to display name
 */
function formatPackName(slug) {
  if (!slug) return 'Recipe Pack';
  
  const packNames = {
    'starter': 'Starter Pack',
    'high-protein': 'High Protein Pack',
    'holiday': 'Holiday Pack',
    'kids': 'Kids Pack',
    'no-bake': 'No-Bake Pack',
    'peanut-butter': 'Peanut Butter Pack'
  };
  
  return packNames[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Pack';
}
