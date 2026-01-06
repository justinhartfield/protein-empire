/**
 * Netlify Serverless Function: Confirm
 * 
 * Handles email confirmation for double opt-in subscriptions.
 * 
 * Flow:
 * 1. Validate token from URL query parameter
 * 2. Retrieve pending subscription from Netlify Blobs
 * 3. Check if token has expired
 * 4. Add contact to SendGrid marketing list
 * 5. Generate a secure access token for the success page
 * 6. Send PDF delivery email
 * 7. Delete pending subscription record
 * 8. Redirect to protected success page with access token
 * 
 * Environment Variables Required:
 * - SENDGRID_API_KEY: Your SendGrid API key
 */

import { getStore } from "@netlify/blobs";
import sgClient from '@sendgrid/client';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY || '';
sgClient.setApiKey(apiKey);
sgMail.setApiKey(apiKey);

// Access token expiry (24 hours - for success page access)
const ACCESS_TOKEN_EXPIRY_HOURS = 24;

/**
 * Send PDF delivery email
 */
async function sendPdfEmail({ to, from, packName, downloadUrl, siteName }) {
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
      
      <p>Thanks for confirming your email! Click the button below to get your free recipe pack:</p>
      
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
        You're receiving this because you confirmed your subscription for the ${packName} from ${siteName}.<br>
        Questions? Just reply to this email.
      </p>
    </body>
    </html>
  `;

  const text = `
Your ${packName} is ready!

Thanks for confirming your email! Click the link below to get your free recipe pack:

${downloadUrl}

You're receiving this because you confirmed your subscription for the ${packName} from ${siteName}.
Questions? Just reply to this email.
  `.trim();

  await sgMail.send({ to, from, subject, html, text });
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
    'peanut-butter': 'Peanut Butter Pack',
    'bagel-box-pack': 'Bagel Box Pack',
    'banana-bread-pack': 'Banana Bread Pack',
    'gluten-free-dairy-free': 'Gluten-Free & Dairy-Free Pack',
    'quick-bread-collection': 'Quick Bread Collection',
    'sandwich-bread-pack': 'Sandwich Bread Pack',
    'savory-bread-pack': 'Savory Bread Pack',
    'sweet-bread-pack': 'Sweet Bread Pack'
  };
  
  return packNames[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Pack';
}

/**
 * Generate HTML error page
 */
function generateErrorPage(title, message, siteUrl) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    </head>
    <body class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="text-6xl mb-6">😕</div>
        <h1 class="text-2xl font-bold text-slate-900 mb-4">${title}</h1>
        <p class="text-slate-600 mb-8">${message}</p>
        <a href="${siteUrl}" 
           class="inline-block bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors">
          Return to Homepage
        </a>
      </div>
    </body>
    </html>
  `;
}

/**
 * Main handler
 */
export async function handler(event, context) {
  const token = event.queryStringParameters?.token;
  const siteUrl = process.env.URL || 'https://example.com';
  
  // Validate token presence
  if (!token) {
    console.error('[confirm] No token provided');
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: generateErrorPage(
        'Invalid Link',
        'This confirmation link is invalid. Please request a new download link.',
        siteUrl
      )
    };
  }

  try {
    // Get pending subscription from Netlify Blobs
    const store = getStore("pending-subscriptions");
    const pendingJson = await store.get(`pending:${token}`);
    
    if (!pendingJson) {
      console.error(`[confirm] Token not found: ${token.substring(0, 8)}...`);
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/html' },
        body: generateErrorPage(
          'Link Expired or Already Used',
          'This confirmation link has expired or has already been used. Please request a new download link.',
          siteUrl
        )
      };
    }

    const pending = JSON.parse(pendingJson);
    console.log(`[confirm] Processing confirmation for ${pending.email}`);
    
    // Check if token has expired
    if (new Date(pending.expiresAt) < new Date()) {
      console.log(`[confirm] Token expired for ${pending.email}`);
      // Clean up expired token
      await store.delete(`pending:${token}`);
      return {
        statusCode: 410,
        headers: { 'Content-Type': 'text/html' },
        body: generateErrorPage(
          'Link Expired',
          'This confirmation link has expired (links are valid for 15 days). Please request a new download link.',
          pending.siteUrl || siteUrl
        )
      };
    }

    // Add contact to SendGrid marketing list
    try {
      const requestData = {
        list_ids: [pending.listId],
        contacts: [{ 
          email: pending.email
        }]
      };

      const request = {
        url: '/v3/marketing/contacts',
        method: 'PUT',
        body: requestData
      };

      const [response] = await sgClient.request(request);
      console.log(`[confirm] Contact ${pending.email} added to SendGrid list. Job ID: ${response.body?.job_id}`);
    } catch (sgError) {
      console.error('[confirm] Error adding contact to SendGrid:', sgError?.response?.body || sgError.message);
      // Continue anyway - we still want to give them access to the PDF
    }

    // Generate access token for protected success page
    const accessToken = crypto.randomBytes(32).toString('hex');
    const accessExpiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    
    // Store access token in Netlify Blobs
    const accessStore = getStore("confirmed-access");
    const accessData = {
      email: pending.email,
      packSlug: pending.packSlug,
      pdfUrl: pending.pdfUrl,
      siteName: pending.siteName,
      confirmedAt: new Date().toISOString(),
      expiresAt: accessExpiresAt.toISOString()
    };
    
    await accessStore.set(`access:${accessToken}`, JSON.stringify(accessData), {
      metadata: { 
        email: pending.email,
        expiresAt: accessData.expiresAt
      }
    });
    console.log(`[confirm] Access token generated for ${pending.email}`);

    // Send PDF delivery email
    if (pending.pdfUrl && pending.fromEmail) {
      try {
        const packName = formatPackName(pending.packSlug);
        await sendPdfEmail({
          to: pending.email,
          from: pending.fromEmail,
          packName,
          downloadUrl: pending.pdfUrl,
          siteName: pending.siteName
        });
        console.log(`[confirm] PDF delivery email sent to ${pending.email}`);
      } catch (emailError) {
        console.error('[confirm] Error sending PDF email:', emailError?.response?.body || emailError.message);
        // Continue anyway - they can still download from success page
      }
    }

    // Delete pending subscription record
    await store.delete(`pending:${token}`);
    console.log(`[confirm] Pending subscription deleted for ${pending.email}`);

    // Redirect to protected success page with access token
    const successUrl = `${pending.siteUrl || siteUrl}/success-${pending.packSlug}.html?access=${accessToken}&email=${encodeURIComponent(pending.email)}`;
    
    return {
      statusCode: 302,
      headers: {
        'Location': successUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: ''
    };

  } catch (error) {
    console.error('[confirm] Unexpected error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: generateErrorPage(
        'Something Went Wrong',
        'We encountered an error processing your confirmation. Please try again or contact support.',
        siteUrl
      )
    };
  }
}
