# Email Integration Guide for Protein Empire

This document explains how to integrate the SendGrid email service into your Protein Empire sites.

## Overview

The email integration consists of three main components:

1. **`@protein-empire/email-service`** - A shared package that wraps the SendGrid API
2. **Netlify Functions** - Serverless API endpoints for handling subscriptions
3. **Client-side JavaScript** - Form handling that calls the API

## Quick Start

### Step 1: Set Up SendGrid (One-Time)

1. Log in to SendGrid and upgrade to **Marketing Campaigns Advanced** ($60/mo)
2. Authenticate all your domains (Settings > Sender Authentication)
3. Create a contact list for each domain (Marketing > Contacts)
4. Create the master welcome automation (Marketing > Automations)
5. Note down each list's ID for the next step

### Step 2: Configure Environment Variables

For each site, set these environment variables in Netlify:

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `SENDGRID_API_KEY` | `SG.xxxxx` | Shared across all sites |
| `SENDGRID_LIST_ID` | `abc123-def456` | Unique per site |
| `SENDGRID_FROM_EMAIL` | `hello@proteincookies.co` | Unique per site |
| `SITE_NAME` | `ProteinCookies` | Display name for emails |

### Step 3: Update the Build Script

The form in `generatePackPage` needs to be updated to use the API. Replace the simple form with the enhanced version:

**Current form (lines 1089-1095 in build-site.js):**
```html
<form action="/success-<%= pack.slug %>.html" method="GET" class="space-y-4">
    <input type="email" name="email" placeholder="Enter your email" required
        class="w-full px-6 py-4 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition text-lg">
    <button type="submit" class="w-full bg-brand-500 text-white px-8 py-4 rounded-xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider">
        DOWNLOAD FREE PDF
    </button>
</form>
```

**Updated form with API integration:**
```html
<form data-email-signup 
      data-pack-slug="<%= pack.slug %>" 
      data-pdf-url="/guides/<%= site.domain.replace(/\\./g, '-') %>-<%= pack.slug %>.pdf"
      class="space-y-4">
    <input type="email" name="email" placeholder="Enter your email" required
        class="w-full px-6 py-4 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition text-lg">
    <button type="submit" class="w-full bg-brand-500 text-white px-8 py-4 rounded-xl font-bold anton-text text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/30 tracking-wider">
        DOWNLOAD FREE PDF
    </button>
</form>
<script src="/js/email-signup.js"></script>
```

### Step 4: Copy Required Files

When building each site, ensure these files are copied to the output:

1. Copy `packages/ui/templates/js/email-signup.js` to `dist/js/email-signup.js`
2. Copy `netlify/functions/subscribe.js` to the site's functions directory
3. Copy `netlify.toml` to the site's root

### Step 5: Deploy

Deploy to Netlify with the environment variables configured. The API will be available at `/api/subscribe`.

## How It Works

### User Flow

1. User enters email on pack download page
2. Form submits to `/api/subscribe` (Netlify Function)
3. Function adds contact to SendGrid list → triggers welcome automation
4. Function sends PDF delivery email (optional)
5. User is redirected to success page with download link

### Graceful Degradation

If the API call fails (network error, etc.), the form will still redirect to the success page. This ensures users always get their PDF even if the email subscription fails.

## File Structure

```
protein-empire/
├── packages/
│   ├── email-service/           # Shared SendGrid wrapper
│   │   ├── src/
│   │   │   ├── index.js         # Main exports
│   │   │   ├── sendgrid.js      # SendGrid client
│   │   │   └── types.js         # JSDoc types
│   │   ├── package.json
│   │   └── README.md
│   ├── config/
│   │   └── email-config.js      # Per-site email configuration
│   └── ui/
│       └── templates/
│           └── js/
│               └── email-signup.js  # Client-side form handler
├── netlify/
│   └── functions/
│       └── subscribe.js         # Serverless API endpoint
├── netlify.toml                 # Netlify configuration
└── .env.example                 # Environment variable template
```

## Testing

### Local Testing

1. Create a `.env` file with your SendGrid credentials
2. Use the Netlify CLI to test functions locally:
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```
3. The function will be available at `http://localhost:8888/api/subscribe`

### Production Testing

1. Deploy to a test site on Netlify
2. Submit the form with a test email
3. Check SendGrid dashboard to verify:
   - Contact was added to the correct list
   - Welcome automation was triggered
   - PDF delivery email was sent

## Troubleshooting

### "Email service not configured"
The `SENDGRID_API_KEY` environment variable is not set in Netlify.

### "Email list not configured"
The `SENDGRID_LIST_ID` environment variable is not set for this site.

### Contacts not receiving welcome emails
1. Verify the automation is set to "Live" status
2. Check that the list is included in the automation's entry criteria
3. Remember: only contacts added after the automation goes live will receive emails

### Emails going to spam
1. Ensure domain authentication is complete in SendGrid
2. Verify the sender email is properly authenticated
3. Check SendGrid's deliverability insights for issues

## SendGrid List IDs Reference

Update `packages/config/email-config.js` with your list IDs:

| Domain | List ID | Status |
|--------|---------|--------|
| proteinmuffins.com | `TODO` | ⬜ Pending |
| proteincookies.co | `TODO` | ⬜ Pending |
| proteinpancakes.co | `TODO` | ⬜ Pending |
| proteinbrownies.co | `TODO` | ⬜ Pending |
| protein-bread.com | `TODO` | ⬜ Pending |
| proteinbars.co | `TODO` | ⬜ Pending |
| proteinbites.co | `TODO` | ⬜ Pending |
| proteindonuts.co | `TODO` | ⬜ Pending |
| proteinoatmeal.co | `TODO` | ⬜ Pending |
| proteincheesecake.co | `TODO` | ⬜ Pending |
| proteinpizzas.co | `TODO` | ⬜ Pending |
| proteinpudding.co | `TODO` | ⬜ Pending |

## Next Steps

1. ✅ Email service package created
2. ✅ Netlify function created
3. ✅ Client-side JavaScript created
4. ⬜ Set up SendGrid lists (tomorrow)
5. ⬜ Update build script to include email-signup.js
6. ⬜ Configure environment variables in Netlify
7. ⬜ Test end-to-end flow
8. ⬜ Deploy to all sites
