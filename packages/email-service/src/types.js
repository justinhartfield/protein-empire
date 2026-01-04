/**
 * @typedef {Object} SubscribeOptions
 * @property {string} email - The email address to subscribe
 * @property {string} listId - The SendGrid list ID to add the contact to
 * @property {string} [firstName] - Optional first name
 * @property {string} [lastName] - Optional last name
 * @property {string} [source] - Source domain (e.g., 'proteincookies.co')
 * @property {string} [leadMagnet] - Which lead magnet triggered the signup
 * @property {Object.<string, string>} [customFields] - Additional custom fields
 */

/**
 * @typedef {Object} SubscribeResult
 * @property {boolean} success - Whether the operation succeeded
 * @property {string} [jobId] - SendGrid job ID for async processing
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} TransactionalEmailOptions
 * @property {string} to - Recipient email address
 * @property {string} from - Sender email address
 * @property {string} subject - Email subject line
 * @property {string} [html] - HTML content
 * @property {string} [text] - Plain text content
 * @property {string} [templateId] - SendGrid dynamic template ID
 * @property {Object.<string, any>} [dynamicTemplateData] - Data for dynamic template
 * @property {Array<{content: string, filename: string, type: string}>} [attachments] - File attachments
 */

/**
 * @typedef {Object} TransactionalResult
 * @property {boolean} success - Whether the email was sent
 * @property {string} [messageId] - SendGrid message ID
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} EmailServiceConfig
 * @property {string} apiKey - SendGrid API key
 * @property {string} [defaultFromEmail] - Default sender email
 * @property {string} [defaultFromName] - Default sender name
 */

export {};
