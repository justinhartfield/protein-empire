# HighProtein.Recipes

The Indexer Site for the Protein Empire - aggregating recipes from all 12 specialized protein recipe sites.

## Overview

HighProtein.Recipes serves as the central hub and traffic driver for the Protein Empire network. It aggregates preview content from all 12 protein sites and links visitors to the full recipes on individual sites.

## Features

### Site-Wide Wins (Implemented)

1. **Hero Ingredient Collections**
   - Protein Powder recipes
   - Banana recipes
   - Peanut Butter recipes
   - Chia Seeds recipes
   - Cottage Cheese recipes
   - Greek Yogurt recipes
   - Oats recipes

2. **Category Organization**
   - Breakfast (pancakes, oatmeal, muffins)
   - Desserts (cookies, brownies, cheesecake, pudding, donuts)
   - Snacks (bites, bars)
   - Savory (pizza, bread)

3. **Flavor Tags**
   - Chocolate
   - Peanut Butter
   - Banana
   - Pumpkin
   - Cookies & Cream

4. **Diet Variants**
   - Gluten-Free
   - Vegan
   - Keto
   - Sugar-Free

5. **Special Filters**
   - No-Bake recipes
   - Quick & Easy (20 min or less)
   - High Protein (30g+)

### Recipe Preview Pages

Each recipe has a preview page that includes:
- Recipe image with protein badge
- Nutrition information (calories, protein, carbs, fat)
- Prep time, cook time, difficulty
- Tags
- CTA button linking to the full recipe on the source site

## Build

```bash
# From repository root
node scripts/build-indexer.js
```

## Deployment

### Netlify Configuration

1. Create a new site in Netlify
2. Connect to the `justinhartfield/protein-empire` repository
3. Configure build settings:
   - **Base directory:** `apps/highprotein.recipes`
   - **Build command:** `cd ../.. && node scripts/build-indexer.js`
   - **Publish directory:** `apps/highprotein.recipes/dist`

4. Add environment variables (if using Strapi):
   ```
   STRAPI_URL=https://web-production-98f1.up.railway.app
   STRAPI_API_TOKEN=<your-token>
   ```

5. Configure custom domain: `highprotein.recipes`

## Data Sources

The site aggregates recipes from:

| Site | Domain | Category |
|------|--------|----------|
| Muffins | proteinmuffins.com | Breakfast |
| Cookies | proteincookies.co | Desserts |
| Pancakes | proteinpancakes.co | Breakfast |
| Brownies | proteinbrownies.co | Desserts |
| Bread | protein-bread.com | Savory |
| Bars | proteinbars.co | Snacks |
| Bites | proteinbites.co | Snacks |
| Donuts | proteindonuts.co | Desserts |
| Oatmeal | proteinoatmeal.co | Breakfast |
| Cheesecake | proteincheesecake.co | Desserts |
| Pizza | proteinpizzas.co | Savory |
| Pudding | proteinpudding.co | Desserts |

## Pages Generated

- Homepage with featured recipes and category navigation
- Category pages (Breakfast, Desserts, Snacks, Savory)
- Food type pages (cookies, brownies, etc.)
- Ingredient collection pages
- Flavor tag pages
- Diet variant pages
- Special filter pages (no-bake, quick, high-protein)
- Recipe preview pages
- Static pages (privacy, terms)
- sitemap.xml and robots.txt

## SEO Features

- Semantic HTML structure
- Recipe schema markup (JSON-LD)
- Open Graph and Twitter Card meta tags
- Canonical URLs
- XML sitemap
- robots.txt
