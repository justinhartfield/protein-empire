# CLAUDE.md - Protein Empire Monorepo Rules

## ⚠️ CRITICAL: Deployment Sources

**highprotein.recipes lives HERE** in `apps/highprotein.recipes` — NOT in the separate `highprotein-recipes` standalone repo!

### Site → Source Mapping
| Site | Correct Source | ❌ DO NOT USE |
|------|---------------|---------------|
| highprotein.recipes | `protein-empire/apps/highprotein.recipes` | standalone `highprotein-recipes` repo (outdated) |

The standalone `highprotein-recipes` repo is **outdated** and should not be deployed. All protein sites are managed in this monorepo under `apps/`.

## Project Structure

```
protein-empire/
├── apps/                    # All deployable sites
│   ├── highprotein.recipes  # ← THE REAL ONE
│   ├── proteinmuffins.com
│   ├── proteincookies.com
│   └── ...
├── packages/                # Shared code
├── data/                    # Shared data/recipes
└── scripts/                 # Build/generation scripts
```

## Deployment

Always deploy from this monorepo. Each app in `apps/` has its own Netlify site.
