/**
 * Netlify Serverless Function: Verify Access
 * 
 * Validates access tokens for protected success pages.
 * Called by success pages to verify the user has confirmed their email.
 * 
 * Flow:
 * 1. Receive access token from query parameter
 * 2. Look up token in Netlify Blobs (confirmed-access store)
 * 3. Verify token hasn't expired
 * 4. Return subscription data if valid, error if not
 * 
 * This endpoint is called via JavaScript on success pages to:
 * - Verify the user has completed double opt-in
 * - Retrieve the PDF download URL
 * - Display personalized content
 */

import { getStore } from "@netlify/blobs";

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
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };

  const accessToken = event.queryStringParameters?.token;

  // Validate token presence
  if (!accessToken) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      })
    };
  }

  try {
    // Get access data from Netlify Blobs
    const store = getStore("confirmed-access");
    const accessJson = await store.get(`access:${accessToken}`);
    
    if (!accessJson) {
      console.log(`[verify-access] Token not found: ${accessToken.substring(0, 8)}...`);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired access token',
          code: 'INVALID_TOKEN'
        })
      };
    }

    const accessData = JSON.parse(accessJson);
    
    // Check if token has expired (24 hours after confirmation)
    if (new Date(accessData.expiresAt) < new Date()) {
      console.log(`[verify-access] Token expired for ${accessData.email}`);
      // Clean up expired token
      await store.delete(`access:${accessToken}`);
      return {
        statusCode: 410,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Access token has expired. Please check your email for the download link.',
          code: 'TOKEN_EXPIRED'
        })
      };
    }

    console.log(`[verify-access] Valid access for ${accessData.email}`);

    // Return success with subscription data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          email: accessData.email,
          packSlug: accessData.packSlug,
          pdfUrl: accessData.pdfUrl,
          siteName: accessData.siteName,
          confirmedAt: accessData.confirmedAt
        }
      })
    };

  } catch (error) {
    console.error('[verify-access] Unexpected error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Server error',
        code: 'SERVER_ERROR'
      })
    };
  }
}
