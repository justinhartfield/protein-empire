# Deployment Guide

This guide explains how to set up automated deployment for the Protein Empire sites.

## Overview

The Protein Empire uses GitHub Actions to automatically build and deploy all sites when changes are pushed to the `main` branch. Each site is deployed to Netlify.

## Prerequisites

1. A GitHub account with access to the protein-empire repository
2. A Netlify account
3. Domain names configured in GoDaddy (or your registrar)

## Setup Steps

### 1. Create Netlify Sites

For each domain in the empire, create a new site in Netlify:

1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy manually" (we'll use GitHub Actions)
4. Note the **Site ID** from Site Settings → General → Site details

Repeat for each domain:

| Domain | Netlify Site Name |
|--------|-------------------|
| proteincookies.co | protein-cookies |
| proteinpancakes.co | protein-pancakes |
| proteinbrownies.co | protein-brownies |
| protein-bread.com | protein-bread |
| proteinbars.co | protein-bars |
| proteinbites.co | protein-bites |
| proteindonuts.co | protein-donuts |
| proteinoatmeal.co | protein-oatmeal |
| proteincheesecake.co | protein-cheesecake |
| proteinpizzas.co | protein-pizzas |
| proteinpudding.co | protein-pudding |

### 2. Get Netlify Auth Token

1. Go to Netlify → User Settings → Applications
2. Click "New access token"
3. Name it "GitHub Actions - Protein Empire"
4. Copy the token (you won't see it again)

### 3. Configure GitHub Secrets

In your GitHub repository, go to Settings → Secrets and variables → Actions.

Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `NETLIFY_AUTH_TOKEN` | Your Netlify personal access token |
| `NETLIFY_SITE_ID_PROTEINCOOKIES` | Site ID for proteincookies.co |
| `NETLIFY_SITE_ID_PROTEINPANCAKES` | Site ID for proteinpancakes.co |
| `NETLIFY_SITE_ID_PROTEINBROWNIES` | Site ID for proteinbrownies.co |
| `NETLIFY_SITE_ID_PROTEINBREAD` | Site ID for protein-bread.com |
| `NETLIFY_SITE_ID_PROTEINBARS` | Site ID for proteinbars.co |
| `NETLIFY_SITE_ID_PROTEINBITES` | Site ID for proteinbites.co |
| `NETLIFY_SITE_ID_PROTEINDONUTS` | Site ID for proteindonuts.co |
| `NETLIFY_SITE_ID_PROTEINOATMEAL` | Site ID for proteinoatmeal.co |
| `NETLIFY_SITE_ID_PROTEINCHEESECAKE` | Site ID for proteincheesecake.co |
| `NETLIFY_SITE_ID_PROTEINPIZZAS` | Site ID for proteinpizzas.co |
| `NETLIFY_SITE_ID_PROTEINPUDDING` | Site ID for proteinpudding.co |

### 4. Configure Custom Domains in Netlify

For each site in Netlify:

1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `proteincookies.co`)
4. Follow the DNS configuration instructions

### 5. Configure DNS in GoDaddy

For each domain, add the following DNS records:

**For apex domain (e.g., proteincookies.co):**
- Type: A
- Name: @
- Value: 75.2.60.5 (Netlify's load balancer)

**For www subdomain:**
- Type: CNAME
- Name: www
- Value: [your-netlify-site].netlify.app

### 6. Enable HTTPS

In Netlify, go to Site Settings → Domain management → HTTPS.
Click "Verify DNS configuration" and then "Provision certificate".

## Manual Deployment

You can trigger a manual deployment from GitHub Actions:

1. Go to Actions → "Build and Deploy Protein Empire"
2. Click "Run workflow"
3. Optionally specify a single site to build
4. Click "Run workflow"

## Local Development

To build sites locally:

```bash
# Install dependencies
pnpm install

# Build all sites
pnpm build

# Build specific site
pnpm build:site proteincookies.co

# Generate PDFs
pnpm generate:pdfs
```

## Troubleshooting

### Build fails
- Check that recipe data exists in `data/recipes/{domain}/recipes.json`
- Verify packs data exists in `data/recipes/{domain}/packs.json`
- Check the GitHub Actions logs for specific errors

### Deployment fails
- Verify the Netlify site ID is correct
- Check that the Netlify auth token hasn't expired
- Ensure the site exists in Netlify

### DNS not working
- DNS changes can take up to 48 hours to propagate
- Use `dig` or online tools to verify DNS records
- Check Netlify's domain verification status
