# @protein-empire/analytics

Analytics configuration and tracking for the Protein Empire. Provides GA4 setup, Search Console configuration, custom event tracking, and dashboard utilities.

## Features

- **GA4 Configuration**: Tracking scripts, custom events, conversion setup
- **Search Console**: Sitemap generation, robots.txt, SEO monitoring
- **Custom Events**: Recipe views, signups, downloads, cross-site clicks
- **Dashboard**: Data structures for analytics dashboard
- **Reporting**: Weekly report templates and recommendations

## Installation

```bash
pnpm install
```

## Usage

### Generate Analytics Setup

```bash
# Generate for all sites
node packages/analytics/src/setup-analytics.js

# Generate for a specific site
node packages/analytics/src/setup-analytics.js --site=proteincookies.co
```

### Programmatic Usage

```javascript
import { 
  generateEnhancedGA4Script,
  generateSitemap,
  generateRobotsTxt,
  customEvents
} from '@protein-empire/analytics';

// Generate GA4 tracking script
const ga4Script = generateEnhancedGA4Script('G-XXXXXXXXXX');

// Generate sitemap
const sitemap = generateSitemap('proteincookies.co', recipes);

// Generate robots.txt
const robotsTxt = generateRobotsTxt('proteincookies.co');
```

## Output Structure

Generated files are saved to `data/analytics/{domain}/`:

```
data/analytics/
├── SETUP-GUIDE.md
├── proteincookies-co/
│   ├── ga4-tracking.html
│   ├── recipe-tracking.html
│   ├── sitemap.xml
│   ├── robots.txt
│   └── setup-status.json
├── proteinbrownies-co/
│   └── ...
```

## GA4 Setup

### 1. Create GA4 Property

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create account "Protein Empire"
3. Create property for each site
4. Get Measurement ID (G-XXXXXXXXXX)

### 2. Add to Site Config

```javascript
// packages/config/sites.js
{
  domain: 'proteincookies.co',
  ga4Id: 'G-XXXXXXXXXX',
  // ...
}
```

### 3. Deploy Tracking Script

Add `ga4-tracking.html` content to site's `<head>`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Custom Events

### Recipe Events

| Event | Description | Parameters |
|-------|-------------|------------|
| `view_recipe` | User views recipe | recipe_id, recipe_name, protein_content |
| `print_recipe` | User prints recipe | recipe_id, recipe_name |
| `share_recipe` | User shares recipe | recipe_id, share_method |

### Conversion Events

| Event | Description | Parameters |
|-------|-------------|------------|
| `sign_up` | Email signup | method, source, pack_name |
| `generate_lead` | PDF download | lead_type, pack_name, value |

### Tracking Code

Add `recipe-tracking.html` before `</body>` on recipe pages:

```javascript
// Auto-track recipe views
window.peTrack.recipeView({
  id: 'recipe-123',
  title: 'Protein Cookies',
  protein: 25,
  calories: 180
});

// Track PDF download
window.peTrack.pdfDownload('Cookie Starter Pack', 'user@email.com');
```

## Search Console Setup

### 1. Verify Domain

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property (URL prefix method)
3. Verify via HTML file upload

### 2. Submit Sitemap

1. Go to Sitemaps section
2. Submit: `https://domain.com/sitemap.xml`

### 3. Link to GA4

1. GA4 Admin > Product Links > Search Console Links
2. Select verified property

## Dashboard

### Widget Types

- **Metric**: Single KPI with comparison
- **Chart**: Line, bar, pie charts
- **Table**: Sortable data tables
- **Funnel**: Conversion funnel visualization

### Sample Dashboard Data

```javascript
import { dashboardConfig, sampleDashboardData } from '@protein-empire/analytics';

// Empire overview dashboard
const empireWidgets = dashboardConfig.empire.widgets;

// Site-specific dashboard
const siteWidgets = dashboardConfig.site.widgets;
```

## KPIs

### Traffic KPIs
- Daily Active Users
- Sessions
- Pageviews
- Bounce Rate

### Engagement KPIs
- Avg. Session Duration
- Pages per Session
- Scroll Depth 75%+
- Recipe Print Rate

### Conversion KPIs
- Email Signup Rate (target: >3%)
- PDF Download Rate (target: >80% of signups)
- Cross-site Click Rate (target: >2%)

## SEO Monitoring

### Target Keywords by Site

Each site has target keywords defined in `targetKeywords`:

```javascript
import { targetKeywords } from '@protein-empire/analytics';

// Get keywords for cookies site
const cookieKeywords = targetKeywords.cookies;
// ['protein cookies recipe', 'high protein cookies', ...]
```

### Keyword Tracking

```javascript
import { generateKeywordTracker } from '@protein-empire/analytics';

const tracker = generateKeywordTracker('cookies');
// Returns template for tracking keyword positions
```

## License

UNLICENSED - Protein Empire Internal Use Only
