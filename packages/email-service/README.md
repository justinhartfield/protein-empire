# @protein-empire/email-service

Shared email service package for the Protein Empire. Handles both marketing (list subscriptions that trigger welcome automations) and transactional (PDF delivery) emails via SendGrid.

## Installation

The package is part of the monorepo and will be installed automatically. If you need to install SendGrid dependencies manually:

```bash
cd packages/email-service
pnpm install
```

## Environment Variables

Each site requires the following environment variables:

| Variable | Scope | Description |
|----------|-------|-------------|
| `SENDGRID_API_KEY` | Shared | Your SendGrid API key with Marketing Campaigns permissions |
| `SENDGRID_LIST_ID` | Per-site | The unique SendGrid list ID for that specific domain |
| `SENDGRID_FROM_EMAIL` | Per-site | The verified sender email (e.g., `hello@proteincookies.co`) |

### Example `.env` file

```env
# Shared across all sites
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx

# Site-specific (proteincookies.co)
SENDGRID_LIST_ID=your-list-id-here
SENDGRID_FROM_EMAIL=hello@proteincookies.co
```

## Usage

### Subscribe a Contact (Triggers Welcome Automation)

```javascript
import { subscribeContact } from '@protein-empire/email-service';

const result = await subscribeContact({
  email: 'user@example.com',
  listId: process.env.SENDGRID_LIST_ID,
  firstName: 'John',  // optional
  source: 'proteincookies.co',  // optional
  leadMagnet: 'starter-pack'  // optional
});

if (result.success) {
  console.log('Contact added! Job ID:', result.jobId);
} else {
  console.error('Failed:', result.error);
}
```

### Send PDF Delivery Email

```javascript
import { sendPdfDeliveryEmail } from '@protein-empire/email-service';

const result = await sendPdfDeliveryEmail({
  to: 'user@example.com',
  from: process.env.SENDGRID_FROM_EMAIL,
  packName: 'Starter Pack',
  downloadUrl: 'https://proteincookies.co/downloads/starter-pack.pdf',
  siteName: 'ProteinCookies'
});

if (result.success) {
  console.log('Email sent!');
}
```

### Send Custom Transactional Email

```javascript
import { sendTransactionalEmail } from '@protein-empire/email-service';

const result = await sendTransactionalEmail({
  to: 'user@example.com',
  from: 'hello@proteincookies.co',
  subject: 'Welcome!',
  html: '<h1>Welcome to ProteinCookies!</h1>',
  text: 'Welcome to ProteinCookies!'
});
```

## How It Works

The email service is designed to work with SendGrid's Marketing Campaigns Advanced plan. When a user signs up on any of the 12+ protein sites, the flow is as follows:

1. User enters email on a pack download page
2. Frontend calls the site's `/api/subscribe` endpoint
3. The API uses `subscribeContact()` to add the user to that site's SendGrid list
4. SendGrid's master automation (watching all site lists) triggers the welcome sequence
5. Simultaneously, `sendPdfDeliveryEmail()` sends the immediate PDF download link

This architecture allows a single welcome automation to serve all sites while maintaining proper segmentation.

## Setting Up SendGrid List IDs

Before deploying, you need to create a contact list in SendGrid for each site:

1. Log in to SendGrid → Marketing → Contacts
2. Create a new list (e.g., "ProteinCookies.co Subscribers")
3. Copy the List ID from the URL when viewing the list
4. Add the ID to the site's environment variables

## API Reference

### `subscribeContact(options)`

Adds a contact to a SendGrid Marketing list, triggering any associated automation.

**Parameters:**
- `email` (string, required): Email address
- `listId` (string, required): SendGrid list ID
- `firstName` (string, optional): First name
- `lastName` (string, optional): Last name
- `source` (string, optional): Source domain
- `leadMagnet` (string, optional): Lead magnet identifier
- `customFields` (object, optional): Additional custom fields

**Returns:** `{ success: boolean, jobId?: string, error?: string }`

### `sendPdfDeliveryEmail(options)`

Sends a branded PDF delivery email.

**Parameters:**
- `to` (string, required): Recipient email
- `from` (string, required): Sender email
- `packName` (string, required): Name of the recipe pack
- `downloadUrl` (string, required): URL to download the PDF
- `siteName` (string, required): Name of the site

**Returns:** `{ success: boolean, messageId?: string, error?: string }`

### `sendTransactionalEmail(options)`

Sends a custom transactional email.

**Parameters:**
- `to` (string, required): Recipient email
- `from` (string, required): Sender email
- `subject` (string, required): Email subject
- `html` (string, optional): HTML content
- `text` (string, optional): Plain text content
- `templateId` (string, optional): SendGrid template ID
- `dynamicTemplateData` (object, optional): Template data
- `attachments` (array, optional): File attachments

**Returns:** `{ success: boolean, messageId?: string, error?: string }`

### `isConfigured()`

Checks if the SendGrid API key is set.

**Returns:** `boolean`
