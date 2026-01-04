# Template Audit: ProteinMuffins.com vs Monorepo Build

## Executive Summary

After comparing the original ProteinMuffins.com with the current monorepo build output, I've identified several gaps that need to be addressed before scaling.

---

## SEO Elements Comparison

### ✅ Present in Both
| Element | Status |
|---------|--------|
| Title tag | ✅ |
| Meta description | ✅ |
| Canonical URL | ✅ |
| Open Graph tags | ✅ |
| Twitter Card tags | ✅ |
| Theme color | ✅ |
| Favicon | ✅ |
| DNS prefetch | ✅ |
| Font preconnect | ✅ |
| LCP image preload | ✅ |
| Recipe schema (JSON-LD) | ✅ |
| Tailwind config | ✅ |

### ❌ Missing in Monorepo Build
| Element | Priority | Notes |
|---------|----------|-------|
| **WebSite + Organization schema** | HIGH | Homepage needs this for site-wide SEO |
| **BreadcrumbList schema** | HIGH | Recipe pages need breadcrumb schema |
| **Keywords in Recipe schema** | MEDIUM | Currently empty string |
| **aggregateRating randomization** | LOW | Should vary between 4.7-4.9 |
| **Internal linking in descriptions** | HIGH | Muffins has contextual links in recipe descriptions |
| **Recipe recommendations script** | MEDIUM | `js/recipe-recommendations.js` missing |

---

## Design Elements Comparison

### ✅ Present in Both
| Element | Status |
|---------|--------|
| Anton font for headings | ✅ |
| Inter font for body | ✅ |
| Amber brand color (#f59e0b) | ✅ |
| Light slate background | ✅ |
| Glass navigation | ✅ |
| Recipe cards with protein badges | ✅ |

### ❌ Missing/Different in Monorepo Build
| Element | Priority | Notes |
|---------|----------|-------|
| **Logo display** | HIGH | Muffins uses full logo image, monorepo uses icon + text |
| **Navigation styling** | MEDIUM | Muffins has uppercase tracking-wider text |
| **Hero section layout** | HIGH | Muffins has 2-column grid with large image |
| **Stats bar design** | HIGH | Muffins has anton-text 3xl stats with borders |
| **Recipe card hover effects** | MEDIUM | `.recipe-card:hover .recipe-overlay` |
| **Ingredient substitution UI** | HIGH | Full interactive dropdown system |
| **Recipe page layout** | HIGH | 2-column grid, breadcrumbs, badges |
| **"JUMP TO RECIPE" button** | MEDIUM | Anchor link to recipe section |
| **Share/Print buttons** | LOW | Social sharing icons |
| **Related recipes section** | MEDIUM | Recipe recommendations at bottom |

---

## Ingredient Substitution System

### ProteinMuffins Implementation
```javascript
// Recipe page has:
<script src="js/ingredients-data.js"></script>
<script src="js/recipe-substitution.js"></script>
<script src="js/recipe-recommendations.js"></script>

// Plus RECIPE_CONFIG object with:
{
  "recipeId": "protein-banana-muffins",
  "ingredients": [
    { "id": "oat-flour", "amount": 50, "unit": "g", "usUnit": "2/3 Cup", "category": "dry" },
    ...
  ]
}

// Body has Alpine.js integration:
x-data="{ ...recipeSubstitution(RECIPE_CONFIG), ... }"
```

### Current Monorepo Implementation
- Has `ingredients-bundle.js` but not integrated into recipe pages
- Missing RECIPE_CONFIG per recipe
- Missing Alpine.js integration for substitutions

---

## Action Items

### Phase 1: Critical SEO Fixes
1. Add WebSite + Organization schema to homepage template
2. Add BreadcrumbList schema to recipe page template
3. Add keywords to Recipe schema
4. Add internal linking capability to recipe descriptions

### Phase 2: Design Alignment
1. Update navigation to match Muffins styling (uppercase, tracking-wider)
2. Update recipe page hero layout (2-column grid)
3. Add stats bar with anton-text styling
4. Add "JUMP TO RECIPE" anchor button
5. Add breadcrumb navigation UI

### Phase 3: Ingredient Substitution
1. Generate RECIPE_CONFIG for each recipe from JSON data
2. Integrate substitution system into recipe page template
3. Add Alpine.js x-data binding

### Phase 4: Polish
1. Add recipe recommendations section
2. Add share/print buttons
3. Add hover effects to recipe cards
4. Randomize aggregate ratings (4.7-4.9)

---

## Files to Update

1. `scripts/build-site.js` - Main build script with all templates
2. `packages/ingredients/browser-bundle.js` - Already exists, needs integration
3. Recipe JSON data - May need RECIPE_CONFIG structure added

---

## Estimated Effort

| Phase | Time |
|-------|------|
| Phase 1 | 30 min |
| Phase 2 | 45 min |
| Phase 3 | 30 min |
| Phase 4 | 20 min |
| **Total** | **~2 hours** |
