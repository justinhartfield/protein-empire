# Protein Empire Deployment Guide

This guide covers deploying the Protein Empire sites to Netlify with Strapi CMS integration.

## Prerequisites

Before deploying, ensure you have access to the following services and credentials.

| Service | URL | Purpose |
|---------|-----|---------|
| GitHub Repository | github.com/justinhartfield/protein-empire | Source code |
| Strapi CMS | web-production-98f1.up.railway.app | Content management |
| Netlify | netlify.com | Static site hosting |

## Environment Variables

The following environment variables are required for the build process.

| Variable | Description | Example |
|----------|-------------|---------|
| STRAPI_URL | Strapi CMS API endpoint | https://web-production-98f1.up.railway.app |
| STRAPI_API_TOKEN | API token for Strapi access | (stored securely in Netlify) |

## Deploying proteincookies.co to Netlify

### Step 1: Create New Site in Netlify

1. Log in to Netlify at app.netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub and select the `justinhartfield/protein-empire` repository
4. Configure the build settings as follows:

**Build Settings:**
- Base directory: `apps/proteincookies.co`
- Build command: `cd ../.. && node scripts/build-from-strapi.js proteincookies.co`
- Publish directory: `apps/proteincookies.co/dist`

### Step 2: Configure Environment Variables

In Netlify site settings, add the following environment variables:

```
STRAPI_URL=https://web-production-98f1.up.railway.app
STRAPI_API_TOKEN=8796888e95a2d25b4e236e44508c50553e1e976a07573f7c75fba983758fd0a5aac23e3c5968eda93f178994ead46ff646f46debfaa9228d49c0ab17ad185ec157f6bd6873d25f88ac099a90612228f5045f404af5b63cdf5bb9cfa272c517bec45e4f805eb4f0799b878fcff14724c50973ecf7d3a1bcd98a5ac7f5ba0dda38
```

### Step 3: Configure Custom Domain

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Enter `proteincookies.co`
4. Follow the DNS configuration instructions to point your domain to Netlify

### Step 4: Enable HTTPS

Netlify automatically provisions SSL certificates via Let's Encrypt. Ensure HTTPS is enabled in Domain settings.

## Build Pipeline Overview

The build process works as follows:

1. Netlify triggers a build on push to main branch
2. The `build-from-strapi.js` script runs
3. Script attempts to fetch content from Strapi CMS
4. If Strapi is unavailable, falls back to local JSON data
5. Static HTML files are generated in the `dist` directory
6. Netlify deploys the generated files

## Strapi CMS Access

**Admin Panel:** https://web-production-98f1.up.railway.app/admin

**Credentials:**
- Email: admin@proteinempire.com
- Password: ProteinEmpire2026!

## Content Management

To update recipes, categories, or packs:

1. Log in to Strapi admin panel
2. Navigate to Content Manager
3. Edit the desired content type
4. Save and publish changes
5. Trigger a new Netlify build (or wait for scheduled rebuild)

## Deploying Additional Sites

To deploy another site (e.g., proteinpancakes.co):

1. Create recipe data in `data/recipes/proteinpancakes-co/`
2. Import data to Strapi using the import scripts
3. Create a new Netlify site with the same configuration
4. Update the build command to use the new domain name

## Troubleshooting

**Build fails with Strapi connection error:**
The build will automatically fall back to JSON data. Check that the STRAPI_URL and STRAPI_API_TOKEN environment variables are correctly set.

**Content not updating:**
Ensure the content is published in Strapi (not just saved as draft). Trigger a new Netlify build after publishing.

**Images not loading:**
Recipe images are stored locally in the repository. Ensure the images exist in `packages/ui/assets/images/recipes/`.
