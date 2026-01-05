/**
 * Email Templates Index
 * 
 * Exports all email templates for the Protein Empire
 */

export * from './base.js';
export * from './welcome-sequence.js';
export * from './newsletter.js';

// Re-export defaults
export { default as baseTemplates } from './base.js';
export { default as welcomeSequenceTemplates } from './welcome-sequence.js';
export { default as newsletterTemplates } from './newsletter.js';
