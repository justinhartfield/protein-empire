# Protein Empire Analytics Setup Guide

Generated: 2026-01-05T16:16:37.540Z

## Overview

This guide covers setting up analytics for all Protein Empire sites:
- Google Analytics 4 (GA4)
- Google Search Console (GSC)
- Custom Event Tracking

---

## Part 1: Google Analytics 4 Setup


### Step 1: Create GA4 Account

Go to analytics.google.com and create a new account for "Protein Empire"

**URL:** https://analytics.google.com/analytics/web/#/provision






### Step 2: Create Property

Create a new GA4 property for each domain (e.g., "ProteinCookies.co")


**Settings:**
{
  "propertyName": "{SiteName}",
  "timezone": "America/New_York",
  "currency": "USD"
}





### Step 3: Create Data Stream

Add a web data stream for the domain


**Settings:**
{
  "streamName": "{domain} - Web",
  "url": "https://{domain}",
  "enhancedMeasurement": true
}





### Step 4: Get Measurement ID

Copy the Measurement ID (G-XXXXXXXXXX) from the data stream








### Step 5: Add to Site Config

Add the Measurement ID to packages/config/sites.js under ga4Id








### Step 6: Configure Custom Dimensions

Set up custom dimensions for recipe tracking



**Custom Dimensions:**
- recipe_category (event)
- protein_content (event)
- lead_magnet (event)
- traffic_source (session)




### Step 7: Enable Enhanced Measurement

Turn on enhanced measurement for automatic event tracking




**Events:**
- Page views
- Scrolls
- Outbound clicks
- Site search
- File downloads



### Step 8: Set Up Conversions

Mark key events as conversions





**Conversions:**
- sign_up
- generate_lead
- pdf_download


### Step 9: Link Search Console

Connect Google Search Console for organic search data








### Step 10: Verify Tracking

Use GA4 DebugView to verify events are being tracked

**URL:** https://analytics.google.com/analytics/web/#/debugview






---

## Part 2: Google Search Console Setup


### Step 1: Access Search Console

Go to Google Search Console

**URL:** https://search.google.com/search-console






### Step 2: Add Property

Click "Add property" and choose "URL prefix" method


**Input:** https://{domain}





### Step 3: Verify Ownership

Choose verification method



**Verification Methods:**
- HTML file (Recommended): Download and upload google{code}.html to site root
- DNS record: Add TXT record to domain DNS
- HTML tag: Add meta tag to homepage <head>




### Step 4: Submit Sitemap

Go to Sitemaps section and submit sitemap URL


**Input:** https://{domain}/sitemap.xml





### Step 5: Request Indexing

Use URL Inspection tool to request indexing for key pages




**Pages to Index:**
- Homepage
- Top 5 recipes
- Category pages



### Step 6: Link to GA4

Connect Search Console to GA4 for combined reporting








### Step 7: Set Up Alerts

Enable email notifications for issues





**Alerts:**
- Indexing issues
- Security issues
- Manual actions


---

## Part 3: Site-Specific Configuration

For each site, update `packages/config/sites.js` with:

```javascript
{
  domain: 'example.com',
  ga4Id: 'G-XXXXXXXXXX', // Add your Measurement ID here
  // ... other config
}
```

---

## Part 4: Deployment

1. Copy `ga4-tracking.html` content to site's `<head>` section
2. Copy `recipe-tracking.html` content before `</body>` on recipe pages
3. Upload `sitemap.xml` to site root
4. Upload `robots.txt` to site root
5. Submit sitemap in Google Search Console

---

## Part 5: Verification

1. Use GA4 DebugView to verify events
2. Check Search Console for indexing status
3. Test all conversion events
4. Verify cross-site tracking

---

## Support

For issues or questions, refer to:
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Search Console Help](https://support.google.com/webmasters)
