/**
 * Netlify Serverless Function: Verify Access
 * 
 * Verifies access tokens for protected success pages.
 * Uses signed tokens (JWT-like) - no external storage needed.
 */

import crypto from 'crypto';

// Use SendGrid API key as signing secret (or a dedicated secret if available)
const SIGNING_SECRET = process.env.TOKEN_SECRET || process.env.SENDGRID_API_KEY || 'default-secret';

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
      console.log('[verify-access] Invalid token signature');
      return null;
    }
    
    // Decode and check expiry
    const payload = JSON.parse(Buffer.from(dataStr, 'base64url').toString());
    
    if (payload.exp && Date.now() > payload.exp) {
      console.log('[verify-access] Token expired');
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('[verify-access] Token verification error:', error);
    return null;
  }
}

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

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Get access token from query string or body
  let accessToken = event.queryStringParameters?.access || event.queryStringParameters?.token;
  
  if (!accessToken && event.body) {
    try {
      const body = JSON.parse(event.body);
      accessToken = body.access;
    } catch (e) {
      // Ignore parse errors
    }
  }

  if (!accessToken) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        valid: false,
        message: 'Access token required'
      })
    };
  }

  // Verify the access token
  const data = verifySignedToken(accessToken);

  if (!data) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        valid: false,
        message: 'Invalid or expired access token'
      })
    };
  }

  // Check that this is an access token (not a confirmation token)
  if (data.type !== 'access') {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        valid: false,
        message: 'Invalid token type'
      })
    };
  }

  // Return success with user data
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      valid: true,
      email: data.email,
      packSlug: data.packSlug,
      pdfUrl: data.pdfUrl,
      siteName: data.siteName
    })
  };
}
