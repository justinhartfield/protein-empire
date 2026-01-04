/**
 * SendGrid Client Wrapper for the Protein Empire
 * 
 * This module provides functions for:
 * - Adding contacts to SendGrid Marketing lists (triggers welcome automation)
 * - Sending transactional emails (PDF delivery, confirmations)
 */

import sgClient from '@sendgrid/client';
import sgMail from '@sendgrid/mail';

// Initialize with API key from environment
const apiKey = process.env.SENDGRID_API_KEY || '';
sgClient.setApiKey(apiKey);
sgMail.setApiKey(apiKey);

/**
 * Add a contact to a SendGrid Marketing list.
 * This will trigger any automation that has this list as entry criteria.
 * 
 * @param {import('./types.js').SubscribeOptions} options - Subscription options
 * @returns {Promise<import('./types.js').SubscribeResult>} - Result of the operation
 */
export async function subscribeContact(options) {
  const { email, listId, firstName, lastName, source, leadMagnet, customFields } = options;

  // Validate required fields
  if (!email || !listId) {
    return {
      success: false,
      error: 'Email and listId are required'
    };
  }

  // Build contact data object
  const contactData = {
    email: email.toLowerCase().trim()
  };

  if (firstName) contactData.first_name = firstName;
  if (lastName) contactData.last_name = lastName;

  // Add custom fields if provided (source, lead magnet, etc.)
  // Note: Custom fields must be created in SendGrid first
  if (customFields || source || leadMagnet) {
    contactData.custom_fields = {
      ...customFields
    };
    // These require custom field IDs from SendGrid - placeholder for now
    // if (source) contactData.custom_fields.source = source;
    // if (leadMagnet) contactData.custom_fields.lead_magnet = leadMagnet;
  }

  const requestData = {
    list_ids: [listId],
    contacts: [contactData]
  };

  const request = {
    url: '/v3/marketing/contacts',
    method: 'PUT',
    body: requestData
  };

  try {
    const [response] = await sgClient.request(request);
    
    if (response.statusCode === 202) {
      console.log(`[email-service] Contact ${email} added to list ${listId}. Job ID: ${response.body?.job_id}`);
      return {
        success: true,
        jobId: response.body?.job_id
      };
    } else {
      console.error(`[email-service] Unexpected status code: ${response.statusCode}`);
      return {
        success: false,
        error: `Unexpected status code: ${response.statusCode}`
      };
    }
  } catch (error) {
    console.error('[email-service] Error subscribing contact:', error?.response?.body || error.message);
    return {
      success: false,
      error: error?.response?.body?.errors?.[0]?.message || error.message || 'Unknown error'
    };
  }
}

/**
 * Send a transactional email (e.g., PDF delivery, confirmation).
 * 
 * @param {import('./types.js').TransactionalEmailOptions} options - Email options
 * @returns {Promise<import('./types.js').TransactionalResult>} - Result of the operation
 */
export async function sendTransactionalEmail(options) {
  const { to, from, subject, html, text, templateId, dynamicTemplateData, attachments } = options;

  // Validate required fields
  if (!to || !from) {
    return {
      success: false,
      error: 'To and from addresses are required'
    };
  }

  // Build the message object
  const msg = {
    to,
    from,
    subject
  };

  // Use dynamic template if provided, otherwise use html/text content
  if (templateId) {
    msg.templateId = templateId;
    if (dynamicTemplateData) {
      msg.dynamicTemplateData = dynamicTemplateData;
    }
  } else {
    if (html) msg.html = html;
    if (text) msg.text = text;
    if (!html && !text) {
      return {
        success: false,
        error: 'Either html, text, or templateId is required'
      };
    }
  }

  // Add attachments if provided
  if (attachments && attachments.length > 0) {
    msg.attachments = attachments;
  }

  try {
    const [response] = await sgMail.send(msg);
    
    console.log(`[email-service] Email sent to ${to}. Status: ${response.statusCode}`);
    return {
      success: true,
      messageId: response.headers?.['x-message-id']
    };
  } catch (error) {
    console.error('[email-service] Error sending email:', error?.response?.body || error.message);
    return {
      success: false,
      error: error?.response?.body?.errors?.[0]?.message || error.message || 'Unknown error'
    };
  }
}

/**
 * Send a PDF download email using a pre-configured template.
 * This is a convenience wrapper for the common use case.
 * 
 * @param {Object} options - PDF delivery options
 * @param {string} options.to - Recipient email
 * @param {string} options.from - Sender email (e.g., 'hello@proteincookies.co')
 * @param {string} options.packName - Name of the recipe pack
 * @param {string} options.downloadUrl - URL to download the PDF
 * @param {string} options.siteName - Name of the site (e.g., 'ProteinCookies')
 * @returns {Promise<import('./types.js').TransactionalResult>}
 */
export async function sendPdfDeliveryEmail(options) {
  const { to, from, packName, downloadUrl, siteName } = options;

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

  const text = `
Your ${packName} is ready!

Thanks for downloading! Click the link below to get your free recipe pack:

${downloadUrl}

You're receiving this because you requested the ${packName} from ${siteName}.
Questions? Just reply to this email.
  `.trim();

  return sendTransactionalEmail({
    to,
    from,
    subject,
    html,
    text
  });
}

/**
 * Check if the SendGrid API key is configured.
 * Useful for build-time validation.
 * 
 * @returns {boolean}
 */
export function isConfigured() {
  return Boolean(process.env.SENDGRID_API_KEY);
}
