/**
 * Netlify Serverless Function: Confirm
 *
 * Handles email confirmation for double opt-in subscriptions.
 * Verifies signed token, adds contact to SendGrid, and redirects to success page.
 *
 * Uses signed tokens (JWT-like) - no external storage needed.
 */

import sgClient from '@sendgrid/client';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY || '';
sgClient.setApiKey(apiKey);
sgMail.setApiKey(apiKey);

// Use SendGrid API key as signing secret (or a dedicated secret if available)
const SIGNING_SECRET = process.env.TOKEN_SECRET || process.env.SENDGRID_API_KEY || 'default-secret';

// Access token expiry (24 hours for success page access)
const ACCESS_TOKEN_EXPIRY_HOURS = 24;

/**
 * Verify and decode a signed token
 * Returns null if invalid or expired
 */
function verifySignedToken(token) {
  try {
    const [dataStr, signature] = token.split('.');
    if (!dataStr || !signature) return null;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', SIGNING_SECRET)
      .update(dataStr)
      .digest('base64url');

    if (signature !== expectedSignature) {
      console.log('[confirm] Invalid token signature');
      return null;
    }

    // Decode and check expiry
    const payload = JSON.parse(Buffer.from(dataStr, 'base64url').toString());

    if (payload.exp && Date.now() > payload.exp) {
      console.log('[confirm] Token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[confirm] Token verification error:', error);
    return null;
  }
}

/**
 * Create a signed access token for the success page
 */
function createAccessToken(data) {
  const payload = {
    ...data,
    exp: Date.now() + (ACCESS_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    type: 'access'
  };

  const dataStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(dataStr)
    .digest('base64url');

  return `${dataStr}.${signature}`;
}

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
  const subject = `Your ${packName} is ready!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b; margin: 0;">${siteName}</h1>
      </div>

      <h2 style="color: #1e293b;">Your ${packName} is ready!</h2>

      <p>Thanks for confirming your email! Click the button below to download your free recipe pack:</p>

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
        You're receiving this because you confirmed your subscription to ${siteName}.<br>
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
 * Format pack slug to display name
 */
function formatPackName(slug) {
  if (!slug) return 'Recipe Pack';

  const packNames = {
    'starter': 'Starter Pack',
    'breakfast-meal-plan': '7-Day Breakfast Meal Plan',
    'high-protein': 'High Protein Pack',
    'holiday': 'Holiday Pack',
    'kids': 'Kids Pack',
    'no-bake': 'No-Bake Pack',
    'peanut-butter': 'Peanut Butter Pack'
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
  // Get token from query string
  const token = event.queryStringParameters?.token;
  const siteUrl = process.env.URL || 'https://highprotein.recipes';

  if (!token) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: generateErrorPage(
        'Invalid Link',
        'This confirmation link is missing required information.',
        siteUrl
      )
    };
  }

  // Verify the token
  const data = verifySignedToken(token);

  if (!data) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: generateErrorPage(
        'Link Expired or Invalid',
        'This confirmation link has expired or is invalid. Please request a new download link from the recipe pack page.',
        siteUrl
      )
    };
  }

  const { email, packSlug, pdfUrl, listId, fromEmail, siteName, siteUrl: tokenSiteUrl } = data;
  const packName = formatPackName(packSlug);
  const finalSiteUrl = tokenSiteUrl || siteUrl;

  console.log(`[confirm] Processing confirmation for ${email}`);

  // Add contact to SendGrid list
  try {
    await subscribeContact(email, listId);
    console.log(`[confirm] Added ${email} to SendGrid list ${listId}`);
  } catch (sgError) {
    console.error('[confirm] SendGrid error:', sgError?.response?.body || sgError.message);
    // Continue anyway - we still want to give them access to the PDF
  }

  // Send PDF delivery email
  if (pdfUrl && fromEmail) {
    try {
      await sendPdfEmail(email, fromEmail, packName, pdfUrl, siteName);
      console.log(`[confirm] PDF email sent to ${email}`);
    } catch (emailError) {
      console.error('[confirm] Email error:', emailError?.response?.body || emailError.message);
      // Don't fail - contact is already subscribed
    }
  }

  // Create access token for success page
  const accessToken = createAccessToken({
    email,
    packSlug,
    pdfUrl,
    siteName
  });

  // Redirect to success page with access token
  const successUrl = `${finalSiteUrl}/success-starter.html?access=${encodeURIComponent(accessToken)}`;

  console.log(`[confirm] Redirecting ${email} to success page`);

  return {
    statusCode: 302,
    headers: {
      'Location': successUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
    body: ''
  };
}

// Export for use by verify-access.js
export { verifySignedToken, createAccessToken };
