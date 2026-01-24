/**
 * Netlify Serverless Function: Subscribe
 *
 * Handles email subscription requests with DOUBLE OPT-IN.
 * Instead of directly adding to SendGrid, stores a pending subscription
 * and sends a confirmation email.
 *
 * Environment Variables Required:
 * - SENDGRID_API_KEY: Your SendGrid API key
 * - SENDGRID_FROM_EMAIL: Verified sender email
 * - PROTEIN_SITE_NAME: Display name (e.g., "High Protein Recipes")
 */

import { getStore } from '@netlify/blobs';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY || '';
sgMail.setApiKey(apiKey);

/**
 * Generate a secure random token
 */
function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(to, from, confirmUrl, packName, siteName) {
  const subject = `Confirm your subscription to ${siteName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">High Protein Recipes</h1>
      </div>

      <h2 style="color: #1e293b;">One more step!</h2>

      <p>Thanks for requesting the <strong>${packName}</strong>!</p>

      <p>Please confirm your email address to complete your subscription and access your free download:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmUrl}"
           style="display: inline-block; background-color: #f59e0b; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Confirm & Get Your Free PDF
        </a>
      </div>

      <p style="color: #64748b; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${confirmUrl}" style="color: #f59e0b; word-break: break-all;">${confirmUrl}</a>
      </p>

      <p style="color: #64748b; font-size: 14px;">
        This link will expire in 15 days. If you didn't request this, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        ${siteName} | highprotein.recipes
      </p>
    </body>
    </html>
  `;

  const text = `One more step!

Thanks for requesting the ${packName}!

Please confirm your email by visiting this link:
${confirmUrl}

This link will expire in 15 days.

If you didn't request this, you can safely ignore this email.

${siteName} | highprotein.recipes`;

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

  return packNames[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { email, packSlug } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Valid email is required' })
      };
    }

    // Get environment variables
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const siteName = process.env.PROTEIN_SITE_NAME || 'High Protein Recipes';

    // Check configuration
    if (!apiKey) {
      console.error('[subscribe] SENDGRID_API_KEY not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Email service not configured' })
      };
    }

    if (!fromEmail) {
      console.error('[subscribe] SENDGRID_FROM_EMAIL not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Email sender not configured' })
      };
    }

    // Generate confirmation token
    const confirmToken = generateToken();

    // Store pending subscription in Netlify Blobs
    const pendingStore = getStore({
      name: 'pending-subscriptions',
      siteID: context.site?.id || process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN || context.clientContext?.custom?.netlify
    });

    await pendingStore.setJSON(confirmToken, {
      email: email.toLowerCase().trim(),
      packSlug: packSlug || 'breakfast-meal-plan',
      createdAt: new Date().toISOString()
    });

    console.log(`[subscribe] Stored pending subscription for ${email}`);

    // Build confirmation URL
    const siteUrl = process.env.URL || 'https://highprotein.recipes';
    const confirmUrl = `${siteUrl}/api/confirm?token=${confirmToken}`;

    // Send confirmation email
    const packName = formatPackName(packSlug || 'breakfast-meal-plan');
    await sendConfirmationEmail(email, fromEmail, confirmUrl, packName, siteName);
    console.log(`[subscribe] Confirmation email sent to ${email}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Check your email to confirm your subscription!'
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
