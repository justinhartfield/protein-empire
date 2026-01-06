/**
 * Netlify Serverless Function: Subscribe
 * 
 * Handles email subscription requests from the frontend.
 * Supports both single opt-in and double opt-in modes.
 * 
 * Double Opt-In Flow:
 * 1. Generate unique confirmation token
 * 2. Store pending subscription in Netlify Blobs
 * 3. Send confirmation email
 * 4. User must click confirmation link to complete subscription
 * 
 * Environment Variables Required:
 * - SENDGRID_API_KEY: Your SendGrid API key
 * - SENDGRID_LIST_ID: The list ID for this specific site
 * - SENDGRID_FROM_EMAIL: Verified sender email (e.g., hello@proteincookies.co)
 * - SITE_NAME: Display name (e.g., "ProteinCookies")
 * - DOUBLE_OPT_IN: Set to "true" to enable double opt-in
 */

import { getStore } from "@netlify/blobs";
import sgClient from '@sendgrid/client';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY || '';
sgClient.setApiKey(apiKey);
sgMail.setApiKey(apiKey);

// Configuration
const DOUBLE_OPT_IN_ENABLED = process.env.DOUBLE_OPT_IN === 'true';
const CONFIRMATION_EXPIRY_DAYS = 15; // 15-day expiry for confirmation links

/**
 * Add contact to SendGrid list (used in single opt-in mode)
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
 * Send PDF delivery email (used in single opt-in mode)
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
        <h1 style="color: #f59e0b; margin: 0;">🍪 ${siteName}</h1>
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
    const siteName = process.env.PROTEIN_SITE_NAME || process.env.SITE_NAME || 'Protein Empire';
    const siteUrl = process.env.URL || `https://${process.env.SITE_NAME?.toLowerCase().replace(/\s+/g, '')}.com`;

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

    // ============================================
    // DOUBLE OPT-IN FLOW
    // ============================================
    if (DOUBLE_OPT_IN_ENABLED) {
      console.log(`[subscribe] Double opt-in enabled. Processing ${email}`);
      
      // Generate secure confirmation token (256-bit)
      const token = crypto.randomBytes(32).toString('hex');
      
      // Calculate expiry date (15 days from now)
      const expiresAt = new Date(Date.now() + CONFIRMATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      
      // Prepare pending subscription data
      const pendingData = {
        email: email.toLowerCase().trim(),
        packSlug: packSlug || 'starter',
        pdfUrl: pdfUrl || '',
        listId,
        fromEmail,
        siteName,
        siteUrl,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      };
      
      try {
        // Store pending subscription in Netlify Blobs
        const store = getStore("pending-subscriptions");
        await store.set(`pending:${token}`, JSON.stringify(pendingData), {
          metadata: { 
            email: pendingData.email,
            expiresAt: pendingData.expiresAt
          }
        });
        console.log(`[subscribe] Stored pending subscription for ${email} with token ${token.substring(0, 8)}...`);
      } catch (storeError) {
        console.error('[subscribe] Error storing pending subscription:', storeError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, message: 'Failed to process subscription' })
        };
      }

      // Send confirmation email
      try {
        const confirmUrl = `${siteUrl}/api/confirm?token=${token}`;
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
        // Clean up the pending subscription since email failed
        try {
          const store = getStore("pending-subscriptions");
          await store.delete(`pending:${token}`);
        } catch (cleanupError) {
          console.error('[subscribe] Error cleaning up pending subscription:', cleanupError);
        }
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
          message: 'Please check your email to confirm your subscription!'
        })
      };
    }

    // ============================================
    // SINGLE OPT-IN FLOW (Original behavior)
    // ============================================
    console.log(`[subscribe] Single opt-in mode. Processing ${email}`);

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
        doubleOptIn: false,
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
