/**
 * Netlify Serverless Function: Confirm
 *
 * Handles email confirmation for double opt-in flow.
 * Validates token, adds contact to SendGrid list, generates access token,
 * and redirects to success page.
 *
 * Environment Variables Required:
 * - SENDGRID_API_KEY: Your SendGrid API key
 * - SENDGRID_LIST_ID: The list ID for this specific site
 */

import { getStore } from '@netlify/blobs';
import sgClient from '@sendgrid/client';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY || '';
sgClient.setApiKey(apiKey);

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
 * Generate a secure random token
 */
function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Main handler
 */
export async function handler(event, context) {
  // Get token from query string
  const token = event.queryStringParameters?.token;

  if (!token) {
    return {
      statusCode: 302,
      headers: { Location: '/pack-starter.html?error=missing-token' }
    };
  }

  try {
    // Get pending subscriptions store
    const pendingStore = getStore({
      name: 'pending-subscriptions',
      siteID: context.site?.id || process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN || context.clientContext?.custom?.netlify
    });

    // Look up the pending subscription
    const pendingData = await pendingStore.get(token, { type: 'json' });

    if (!pendingData) {
      console.log(`[confirm] Invalid or expired token: ${token.slice(0, 8)}...`);
      return {
        statusCode: 302,
        headers: { Location: '/pack-starter.html?error=invalid-token' }
      };
    }

    const { email, packSlug, createdAt } = pendingData;

    // Check if token has expired (15 days)
    const tokenAge = Date.now() - new Date(createdAt).getTime();
    const maxAge = 15 * 24 * 60 * 60 * 1000; // 15 days in ms

    if (tokenAge > maxAge) {
      console.log(`[confirm] Expired token for ${email}`);
      await pendingStore.delete(token);
      return {
        statusCode: 302,
        headers: { Location: '/pack-starter.html?error=expired-token' }
      };
    }

    // Add contact to SendGrid list
    const listId = process.env.SENDGRID_LIST_ID;
    if (listId && apiKey) {
      try {
        await subscribeContact(email, listId);
        console.log(`[confirm] Contact ${email} added to list ${listId}`);
      } catch (error) {
        console.error('[confirm] Error adding contact:', error?.response?.body || error.message);
        // Continue anyway - we still want to give them access
      }
    }

    // Delete the pending subscription
    await pendingStore.delete(token);

    // Generate access token for the success page (valid for 24 hours)
    const accessToken = generateToken();
    const accessStore = getStore({
      name: 'access-tokens',
      siteID: context.site?.id || process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN || context.clientContext?.custom?.netlify
    });

    await accessStore.setJSON(accessToken, {
      email,
      packSlug,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

    console.log(`[confirm] Subscription confirmed for ${email}, redirecting with access token`);

    // Redirect to success page with access token
    return {
      statusCode: 302,
      headers: { Location: `/download-success/?token=${accessToken}` }
    };

  } catch (error) {
    console.error('[confirm] Unexpected error:', error);
    return {
      statusCode: 302,
      headers: { Location: '/pack-starter.html?error=server-error' }
    };
  }
}
