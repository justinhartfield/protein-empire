/**
 * Netlify Serverless Function: Confirm
 *
 * Handles email confirmation for double opt-in subscriptions.
 */

import sgClient from '@sendgrid/client';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

const apiKey = process.env.SENDGRID_API_KEY || '';
sgClient.setApiKey(apiKey);
sgMail.setApiKey(apiKey);

const SIGNING_SECRET = process.env.TOKEN_SECRET || process.env.SENDGRID_API_KEY || 'default-secret';
const ACCESS_TOKEN_EXPIRY_HOURS = 24;

function verifySignedToken(token) {
  try {
    const [dataStr, signature] = token.split('.');
    if (!dataStr || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SIGNING_SECRET)
      .update(dataStr)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(dataStr, 'base64url').toString());
    if (payload.exp && Date.now() > payload.exp) return null;

    return payload;
  } catch (error) {
    console.error('[confirm] Token error:', error);
    return null;
  }
}

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

async function subscribeContact(email, listId) {
  const request = {
    url: '/v3/marketing/contacts',
    method: 'PUT',
    body: { list_ids: [listId], contacts: [{ email: email.toLowerCase().trim() }] }
  };
  const [response] = await sgClient.request(request);
  return response;
}

async function sendPdfEmail(to, from, packName, downloadUrl, siteName) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #f59e0b;">${siteName}</h1>
      <h2>Your ${packName} is ready!</h2>
      <p>Thanks for confirming! Click below to download:</p>
      <p><a href="${downloadUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Download Your PDF</a></p>
      <p style="color: #666; font-size: 14px;">Link: ${downloadUrl}</p>
    </div>
  `;

  await sgMail.send({
    to,
    from,
    subject: `Your ${packName} is ready!`,
    html,
    text: `Your ${packName} is ready! Download: ${downloadUrl}`
  });
}

function formatPackName(slug) {
  if (!slug) return 'Recipe Pack';
  const names = {
    'starter': 'Starter Pack',
    'high-protein': 'High Protein Pack',
    'holiday': 'Holiday Pack'
  };
  return names[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Pack';
}

function errorPage(title, message, siteUrl) {
  return `<!DOCTYPE html><html><head><title>${title}</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="text-6xl mb-6">😕</div>
        <h1 class="text-2xl font-bold mb-4">${title}</h1>
        <p class="text-slate-600 mb-8">${message}</p>
        <a href="${siteUrl}" class="inline-block bg-amber-500 text-white px-8 py-3 rounded-xl font-bold">Return Home</a>
      </div>
    </body></html>`;
}

export async function handler(event, context) {
  const token = event.queryStringParameters?.token;
  const siteUrl = process.env.URL || 'https://highprotein.recipes';

  if (!token) {
    return { statusCode: 400, headers: { 'Content-Type': 'text/html' }, body: errorPage('Invalid Link', 'Missing token.', siteUrl) };
  }

  const data = verifySignedToken(token);
  if (!data) {
    return { statusCode: 400, headers: { 'Content-Type': 'text/html' }, body: errorPage('Link Expired', 'Please request a new link.', siteUrl) };
  }

  const { email, packSlug, pdfUrl, listId, fromEmail, siteName, siteUrl: tokenSiteUrl } = data;
  const packName = formatPackName(packSlug);
  const finalSiteUrl = tokenSiteUrl || siteUrl;

  console.log(`[confirm] Processing ${email}`);

  try {
    await subscribeContact(email, listId);
    console.log(`[confirm] Added ${email} to list`);
  } catch (err) {
    console.error('[confirm] SendGrid error:', err.message);
  }

  if (pdfUrl && fromEmail) {
    try {
      await sendPdfEmail(email, fromEmail, packName, pdfUrl, siteName);
    } catch (err) {
      console.error('[confirm] Email error:', err.message);
    }
  }

  const accessToken = createAccessToken({ email, packSlug, pdfUrl, siteName });
  const successUrl = `${finalSiteUrl}/success-${packSlug}.html?access=${encodeURIComponent(accessToken)}`;

  return {
    statusCode: 302,
    headers: { 'Location': successUrl, 'Cache-Control': 'no-cache' },
    body: ''
  };
}

export { verifySignedToken, createAccessToken };
