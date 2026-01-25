/**
 * Netlify Serverless Function: Subscribe
 *
 * Handles email subscription requests from the frontend.
 * Supports both single opt-in and double opt-in modes.
 *
 * Double Opt-In Flow (using signed tokens - no external storage needed):
 * 1. Generate signed confirmation token with embedded data
 * 2. Send confirmation email with token
 * 3. User clicks link, token is verified and decoded
 * 4. Contact is added to SendGrid list
 *
 * Environment Variables Required:
 * - SENDGRID_API_KEY: Your SendGrid API key
 * - SENDGRID_LIST_ID: The list ID for this specific site
 * - SENDGRID_FROM_EMAIL: Verified sender email
 * - PROTEIN_SITE_NAME: Display name (e.g., "High Protein Recipes")
 * - DOUBLE_OPT_IN: Set to "true" to enable double opt-in
 */

import sgClient from '@sendgrid/client';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY || '';
sgClient.setApiKey(apiKey);
sgMail.setApiKey(apiKey);

// Configuration
const DOUBLE_OPT_IN_ENABLED = process.env.DOUBLE_OPT_IN === 'true';
const CONFIRMATION_EXPIRY_DAYS = 15;

// Use SendGrid API key as signing secret (or a dedicated secret if available)
const SIGNING_SECRET = process.env.TOKEN_SECRET || process.env.SENDGRID_API_KEY || 'default-secret';

/**
 * Create a signed token containing the subscription data
 * Format: base64(data).base64(signature)
 */
function createSignedToken(data) {
  const payload = {
    ...data,
    exp: Date.now() + (CONFIRMATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  };

  const dataStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(dataStr)
    .digest('base64url');

  return `${dataStr}.${signature}`;
}

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
      console.log('[subscribe] Invalid token signature');
      return null;
    }

    // Decode and check expiry
    const payload = JSON.parse(Buffer.from(dataStr, 'base64url').toString());

    if (payload.exp && Date.now() > payload.exp) {
      console.log('[subscribe] Token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[subscribe] Token verification error:', error);
    return null;
  }
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
 * Send confirmation email for double opt-in
 */
async function sendConfirmationEmail({ to, from, siteName, confirmUrl, packName }) {
  const subject = `Please confirm your email to get your ${packName}`;

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

      <h2 style="color: #1e293b;">Almost there! Confirm your email</h2>

      <p>Thanks for requesting the <strong>${packName}</strong>!</p>

      <p>To complete your subscription and receive your free PDF, please click the button below:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmUrl}"
           style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Confirm & Get My PDF
        </a>
      </div>

      <p style="color: #64748b; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${confirmUrl}" style="color: #f59e0b;">${confirmUrl}</a>
      </p>

      <p style="color: #64748b; font-size: 14px;">
        <strong>This link expires in 15 days.</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

      <p style="color: #64748b; font-size: 12px; text-align: center;">
        Didn't request this? You can safely ignore this email.<br>
        You won't be subscribed unless you click the confirmation link.
      </p>
    </body>
    </html>
  `;

  const text = `
Almost there! Confirm your email

Thanks for requesting the ${packName}!

To complete your subscription and receive your free PDF, click this link:
${confirmUrl}

This link expires in 15 days.

Didn't request this? You can safely ignore this email.
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
 * Main handler
 */
export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

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
    const siteName = process.env.PROTEIN_SITE_NAME || 'High Protein Recipes';
    const siteUrl = process.env.URL || 'https://highprotein.recipes';

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

    if (!fromEmail) {
      console.error('[subscribe] SENDGRID_FROM_EMAIL not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Sender email not configured' })
      };
    }

    console.log(`[subscribe] Config: listId=${listId}, fromEmail=${fromEmail}, siteName=${siteName}, siteUrl=${siteUrl}, doubleOptIn=${DOUBLE_OPT_IN_ENABLED}`);

    // ============================================
    // DOUBLE OPT-IN FLOW (using signed tokens)
    // ============================================
    if (DOUBLE_OPT_IN_ENABLED) {
      console.log(`[subscribe] Double opt-in enabled. Processing ${email}`);

      // Create signed token with subscription data
      const tokenData = {
        email: email.toLowerCase().trim(),
        packSlug: packSlug || 'breakfast-meal-plan',
        pdfUrl: pdfUrl || '',
        listId,
        fromEmail,
        siteName,
        siteUrl
      };

      const token = createSignedToken(tokenData);
      console.log(`[subscribe] Created signed token for ${email}`);

      // Send confirmation email
      try {
        const confirmUrl = `${siteUrl}/api/confirm?token=${encodeURIComponent(token)}`;
        const packName = formatPackName(packSlug);

        await sendConfirmationEmail({
          to: email,
          from: fromEmail,
          siteName,
          confirmUrl,
          packName
        });
        console.log(`[subscribe] Confirmation email sent to ${email}`);
      } catch (emailError) {
        console.error('[subscribe] Error sending confirmation email:', emailError?.response?.body || emailError.message);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, message: 'Failed to send confirmation email' })
        };
      }

      // Return success - user needs to check email
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          doubleOptIn: true,
          message: 'Please check your email to confirm your subscription'
        })
      };
    }

    // ============================================
    // SINGLE OPT-IN FLOW (default behavior)
    // ============================================
    console.log(`[subscribe] Single opt-in. Processing ${email}`);

    // Add contact to SendGrid list
    try {
      await subscribeContact(email, listId);
      console.log(`[subscribe] Added ${email} to SendGrid list ${listId}`);
    } catch (sgError) {
      console.error('[subscribe] SendGrid error:', sgError?.response?.body || sgError.message);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Failed to subscribe' })
      };
    }

    // Send PDF email if URL provided
    if (pdfUrl && fromEmail) {
      try {
        const packName = formatPackName(packSlug);
        await sendPdfEmail(email, fromEmail, packName, pdfUrl, siteName);
        console.log(`[subscribe] PDF email sent to ${email}`);
      } catch (emailError) {
        console.error('[subscribe] Email error:', emailError?.response?.body || emailError.message);
        // Don't fail the request if email fails - contact is already subscribed
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Successfully subscribed! Check your email for the download link.'
      })
    };

  } catch (error) {
    console.error('[subscribe] Unexpected error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Failed to process subscription' })
    };
  }
}

// Export token functions for use by confirm.js
export { createSignedToken, verifySignedToken, formatPackName };
