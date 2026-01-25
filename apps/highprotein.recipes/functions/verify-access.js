/**
 * Netlify Serverless Function: Verify Access
 *
 * Validates access tokens for the download success page.
 * Returns { valid: true } if token is valid, { valid: false } otherwise.
 */

import { getStore } from '@netlify/blobs';

/**
 * Main handler
 */
export async function handler(event, context) {
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

  // Get token from query string
  const token = event.queryStringParameters?.token;

  if (!token) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: false, reason: 'missing-token' })
    };
  }

  try {
    // Get access tokens store
    const accessStore = getStore({
      name: 'access-tokens',
      siteID: context.site?.id || process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN || context.clientContext?.custom?.netlify
    });

    // Look up the access token
    const tokenData = await accessStore.get(token, { type: 'json' });

    if (!tokenData) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: false, reason: 'invalid-token' })
      };
    }

    const { expiresAt, packSlug } = tokenData;

    // Check if token has expired
    if (new Date(expiresAt) < new Date()) {
      console.log(`[verify-access] Expired token: ${token.slice(0, 8)}...`);
      await accessStore.delete(token);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: false, reason: 'expired-token' })
      };
    }

    // Token is valid
    console.log(`[verify-access] Valid access for pack: ${packSlug}`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: true,
        packSlug: packSlug || 'breakfast-meal-plan'
      })
    };

  } catch (error) {
    console.error('[verify-access] Unexpected error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: false, reason: 'server-error' })
    };
  }
}
