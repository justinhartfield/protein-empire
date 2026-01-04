/**
 * Protein Empire Email Service
 * 
 * Shared email functionality for all Protein Empire sites.
 * Handles both marketing (list subscriptions) and transactional (PDF delivery) emails.
 * 
 * Usage:
 *   import { subscribeContact, sendPdfDeliveryEmail } from '@protein-empire/email-service';
 * 
 * Required Environment Variables:
 *   - SENDGRID_API_KEY: Your SendGrid API key
 *   - SENDGRID_LIST_ID: The list ID for the specific site (set per-site)
 * 
 * @module @protein-empire/email-service
 */

export {
  subscribeContact,
  sendTransactionalEmail,
  sendPdfDeliveryEmail,
  isConfigured
} from './sendgrid.js';

// Re-export types for documentation
export * from './types.js';
