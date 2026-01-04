# The Protein Empire

A centralized monorepo for managing a network of macro-verified protein recipe websites.

## Architecture

This monorepo uses **pnpm workspaces** to manage multiple interconnected packages and applications from a single codebase. Changes to shared components automatically propagate to all sites on build.

| Directory | Purpose |
|-----------|---------|
| `apps/` | Individual site applications (e.g., proteincookies.co, proteinpancakes.co) |
| `packages/ui/` | Shared UI components (RecipeCard, Navigation, Footer, etc.) |
| `packages/config/` | Shared configurations (Tailwind, ESLint, site metadata) |
| `packages/ingredients/` | The ingredient substitution system with macro data |
| `packages/pdf-generator/` | Automated PDF recipe pack generation |
| `data/recipes/` | Recipe JSON data files organized by site |
| `data/images/` | Recipe images organized by site |
| `scripts/` | Build, deployment, and utility scripts |

## The Portfolio

| Domain | Niche | Status |
|--------|-------|--------|
| proteinmuffins.com | Muffins & Cupcakes | Live |
| proteincookies.co | Cookies & Bites | Ready |
| proteinpancakes.co | Pancakes & Waffles | Planned |
| proteinbrownies.co | Brownies & Blondies | Planned |
| protein-bread.com | Bread & Bagels | Planned |
| proteinbars.co | Protein Bars | Planned |
| proteinbites.co | Energy Bites | Planned |
| proteindonuts.co | Donuts | Planned |
| proteinoatmeal.co | Oatmeal | Planned |
| proteincheesecake.co | Cheesecake | Planned |
| proteinpizzas.co | Pizza Crusts | Planned |
| proteinpudding.co | Pudding | Planned |

## Getting Started

```bash
# Install dependencies
pnpm install

# Build all sites
pnpm build

# Build a specific site
pnpm build:site proteincookies.co

# Generate all PDF lead magnets
pnpm generate:pdfs

# Start development server
pnpm dev
```

## Deployment

Deployment is automated via GitHub Actions. Pushing to the `main` branch triggers a workflow that builds all sites and deploys them to their respective hosting platforms (Netlify).

## Adding a New Site

1. Create a new directory in `apps/` with the domain name
2. Add site configuration to `packages/config/sites.js`
3. Add recipe data to `data/recipes/{site-name}/`
4. Add recipe images to `data/images/{site-name}/`
5. Run `pnpm build:site {site-name}` to generate the site
6. Commit and push to trigger deployment

## License

Proprietary - All Rights Reserved
