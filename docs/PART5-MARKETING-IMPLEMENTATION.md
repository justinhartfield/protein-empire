# Part 5: Comprehensive Marketing Plan - Implementation Guide

## Overview

This document describes the complete marketing automation system implemented for the Protein Empire. The system provides automated content generation, email marketing, analytics tracking, and content scheduling across all 12 sites.

## New Packages

### 1. @protein-empire/social-media

**Location:** `packages/social-media/`

Generates platform-specific social media content for all recipes.

#### Features
- **Pinterest**: 3 pin variations per recipe with optimized titles, descriptions, hashtags
- **Instagram**: Feed posts, stories, and reels content with captions and hashtags
- **TikTok**: Video descriptions, hooks, and trending hashtag suggestions
- **Facebook**: Posts, questions, and engagement content

#### Usage
```bash
# Generate for all sites
pnpm generate:social

# Generate for specific site
node packages/social-media/src/generate-all.js --site=proteincookies.co

# Generate for specific platform
node packages/social-media/src/generate-all.js --platform=pinterest
```

#### Output
- `data/social-media/{site}/pinterest.json` - Pinterest pins with 3 variations each
- `data/social-media/{site}/instagram.json` - Instagram content (feed, stories, reels)
- `data/social-media/{site}/tiktok.json` - TikTok video descriptions
- `data/social-media/{site}/facebook.json` - Facebook posts
- `data/social-media/{site}/content-calendar.json` - Scheduled posting times

---

### 2. @protein-empire/email-marketing

**Location:** `packages/email-marketing/`

Automated email campaign generation with SendGrid integration.

#### Features
- **5-Email Welcome Sequence**: Automated drip campaign for new subscribers
- **Weekly Newsletters**: Featured recipe, tips, and cross-promotion
- **Cross-Site Promotion**: Promote sister sites to existing subscribers
- **HTML Previews**: Responsive email templates ready to send

#### Welcome Sequence
| Email | Day | Content |
|-------|-----|---------|
| 1 | 0 | PDF delivery with download link |
| 2 | 2 | Welcome story and brand introduction |
| 3 | 4 | Tips & tricks for protein baking |
| 4 | 6 | Cross-promotion of sister site |
| 5 | 8 | Social proof and testimonials |

#### Usage
```bash
# Generate for all sites
pnpm generate:emails

# Generate for specific site
node packages/email-marketing/src/generate-campaigns.js --site=proteincookies.co

# Generate only welcome sequence
node packages/email-marketing/src/generate-campaigns.js --type=welcome
```

#### Output
- `data/email-campaigns/{site}/welcome-sequence.json` - Welcome sequence data
- `data/email-campaigns/{site}/welcome-sequence-sendgrid.json` - SendGrid-ready format
- `data/email-campaigns/{site}/newsletter-schedule.json` - Newsletter templates
- `data/email-campaigns/{site}/previews/*.html` - HTML email previews

---

### 3. @protein-empire/analytics

**Location:** `packages/analytics/`

Analytics configuration and tracking setup for GA4 and Search Console.

#### Features
- **GA4 Configuration**: Tracking scripts with custom events
- **Search Console**: Sitemap and robots.txt generation
- **Custom Events**: Recipe views, signups, downloads, cross-site clicks
- **Dashboard Data**: KPIs and reporting structures

#### Custom Events
| Event | Description | Parameters |
|-------|-------------|------------|
| `view_recipe` | User views recipe | recipe_id, recipe_name, protein_content |
| `print_recipe` | User prints recipe | recipe_id, recipe_name |
| `sign_up` | Email signup | method, source, pack_name |
| `generate_lead` | PDF download | lead_type, pack_name, value |
| `cross_site_click` | Click to sister site | target_site, source_recipe |

#### Usage
```bash
# Generate for all sites
pnpm generate:analytics

# Generate for specific site
node packages/analytics/src/setup-analytics.js --site=proteincookies.co
```

#### Output
- `data/analytics/{site}/ga4-tracking.html` - GA4 tracking script
- `data/analytics/{site}/recipe-tracking.html` - Recipe event tracking
- `data/analytics/{site}/sitemap.xml` - XML sitemap
- `data/analytics/{site}/robots.txt` - Robots.txt file
- `data/analytics/SETUP-GUIDE.md` - Complete setup instructions

---

### 4. @protein-empire/content-calendar

**Location:** `packages/content-calendar/`

Content planning and scheduling across all marketing channels.

#### Features
- **Social Media Calendar**: Platform-specific posting schedules
- **Email Calendar**: Newsletter and campaign scheduling
- **Content Calendar**: Recipe publishing and SEO updates
- **Export Formats**: CSV, iCal, JSON, tool-specific (Buffer, Hootsuite, Later)

#### Posting Schedule
| Platform | Posts/Day | Best Times (EST) | Best Days |
|----------|-----------|------------------|-----------|
| Pinterest | 5 | 8am, 12pm, 2pm, 6pm, 9pm | Sat, Sun, Fri |
| Instagram | 2 | 11am, 7pm | Tue, Wed, Fri |
| TikTok | 3 | 7am, 12pm, 7pm | Tue, Thu, Fri |
| Facebook | 1 | 1pm | Wed, Thu, Fri |

#### Monthly Themes
| Month | Theme | Focus |
|-------|-------|-------|
| January | New Year Health Goals | high protein, low calorie, meal prep |
| February | Valentine's Day | chocolate, romantic, date night |
| September | Fall Flavors | pumpkin, apple, cinnamon |
| December | Holiday Season | christmas, gifts, festive |

#### Usage
```bash
# Generate current month
pnpm generate:calendar

# Generate specific month
node packages/content-calendar/src/generate-calendar.js --month=2 --year=2026

# Generate quarterly plan
node packages/content-calendar/src/generate-calendar.js --quarter=1 --year=2026
```

#### Output
- `data/calendars/{year}-{month}/complete-calendar.json` - Full calendar data
- `data/calendars/{year}-{month}/master-calendar.csv` - CSV export
- `data/calendars/{year}-{month}/calendar.ics` - iCal format
- `data/calendars/{year}-{month}/stats.json` - Calendar statistics

---

### 5. @protein-empire/marketing-dashboard

**Location:** `packages/marketing-dashboard/`

Centralized admin interface for marketing management.

#### Features
- **Overview Dashboard**: Empire-wide metrics and performance
- **Social Media Management**: Content generation and scheduling
- **Email Marketing**: Campaign management and analytics
- **Analytics**: Traffic, conversions, and SEO performance
- **Content Calendar**: Visual calendar with upcoming items
- **Site Management**: Manage all 12 empire sites

#### Usage
```bash
# Start dashboard server
pnpm dashboard

# Then open http://localhost:3000
```

#### Dashboard Sections
1. **Overview**: Key metrics, traffic charts, top recipes
2. **Social Media**: Platform tabs, content generator, scheduled posts
3. **Email Marketing**: Subscriber stats, campaigns, welcome sequence
4. **Analytics**: GA4 status, SEO performance
5. **Calendar**: Monthly view, upcoming items
6. **Sites**: All 12 sites with quick actions
7. **Settings**: API integrations, notifications

---

## Quick Start

### 1. Generate All Marketing Content

```bash
cd protein-empire

# Generate social media content for all sites
pnpm generate:social

# Generate email campaigns for all sites
pnpm generate:emails

# Generate analytics setup for all sites
pnpm generate:analytics

# Generate content calendar for current month
pnpm generate:calendar
```

### 2. Start Marketing Dashboard

```bash
pnpm dashboard
# Open http://localhost:3000
```

### 3. Deploy Email Campaigns

1. Review HTML previews in `data/email-campaigns/{site}/previews/`
2. Import `welcome-sequence-sendgrid.json` into SendGrid
3. Set up automation triggers for new subscribers

### 4. Set Up Analytics

1. Read `data/analytics/SETUP-GUIDE.md`
2. Create GA4 properties for each site
3. Add Measurement IDs to `packages/config/sites.js`
4. Deploy tracking scripts to site `<head>`
5. Submit sitemaps to Google Search Console

---

## File Structure

```
protein-empire/
├── packages/
│   ├── social-media/           # Social content generator
│   │   ├── src/
│   │   │   ├── pinterest.js    # Pinterest content
│   │   │   ├── instagram.js    # Instagram content
│   │   │   ├── tiktok.js       # TikTok content
│   │   │   ├── facebook.js     # Facebook content
│   │   │   ├── templates.js    # Content templates
│   │   │   ├── generate-all.js # Generation script
│   │   │   └── index.js        # Package exports
│   │   └── README.md
│   │
│   ├── email-marketing/        # Email campaign generator
│   │   ├── src/
│   │   │   ├── templates/      # Email HTML templates
│   │   │   ├── welcome-sequence.js
│   │   │   ├── newsletter.js
│   │   │   ├── cross-promo.js
│   │   │   ├── generate-campaigns.js
│   │   │   └── index.js
│   │   └── README.md
│   │
│   ├── analytics/              # Analytics configuration
│   │   ├── src/
│   │   │   ├── ga4.js          # GA4 setup
│   │   │   ├── search-console.js
│   │   │   ├── events.js       # Custom events
│   │   │   ├── dashboard.js    # Dashboard data
│   │   │   ├── setup-analytics.js
│   │   │   └── index.js
│   │   └── README.md
│   │
│   ├── content-calendar/       # Content scheduling
│   │   ├── src/
│   │   │   ├── social-calendar.js
│   │   │   ├── email-calendar.js
│   │   │   ├── content-calendar.js
│   │   │   ├── generate-calendar.js
│   │   │   └── index.js
│   │   └── README.md
│   │
│   └── marketing-dashboard/    # Admin interface
│       ├── src/
│       │   ├── index.html      # Dashboard UI
│       │   ├── dashboard.js    # Client-side JS
│       │   ├── server.js       # HTTP server
│       │   └── index.js
│       └── README.md
│
├── data/
│   ├── social-media/           # Generated social content
│   ├── email-campaigns/        # Generated email campaigns
│   ├── analytics/              # Generated analytics setup
│   └── calendars/              # Generated calendars
│
└── docs/
    └── PART5-MARKETING-IMPLEMENTATION.md
```

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `pnpm generate:social` | Generate social media content for all sites |
| `pnpm generate:emails` | Generate email campaigns for all sites |
| `pnpm generate:analytics` | Generate analytics setup for all sites |
| `pnpm generate:calendar` | Generate content calendar for current month |
| `pnpm dashboard` | Start marketing dashboard server |

---

## Integration Points

### SendGrid Integration

The email marketing package generates SendGrid-compatible JSON:

```javascript
// Import into SendGrid via API
const campaigns = require('./data/email-campaigns/proteincookies-co/welcome-sequence-sendgrid.json');

// Each email includes:
// - subject, preheader, html_content
// - send_at (delay in seconds)
// - custom_unsubscribe_url
```

### GA4 Integration

Add the generated tracking script to your site's `<head>`:

```html
<!-- Copy from data/analytics/{site}/ga4-tracking.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Social Media Tools

Export calendars for scheduling tools:

```javascript
import { exportForTool } from '@protein-empire/content-calendar';

// Buffer format
const bufferPosts = exportForTool(calendar, 'buffer');

// Hootsuite format
const hootsuitePosts = exportForTool(calendar, 'hootsuite');

// Later format
const laterPosts = exportForTool(calendar, 'later');
```

---

## KPIs and Targets

### Traffic KPIs
- Daily Active Users: Track growth
- Sessions: Monitor engagement
- Bounce Rate: Target < 60%

### Conversion KPIs
- Email Signup Rate: Target > 3%
- PDF Download Rate: Target > 80% of signups
- Cross-site Click Rate: Target > 2%

### Email KPIs
- Open Rate: Target > 40%
- Click Rate: Target > 8%
- Unsubscribe Rate: Target < 0.5%

---

## Next Steps

1. **Configure GA4**: Create properties and add Measurement IDs
2. **Set Up SendGrid**: Import welcome sequences and enable automation
3. **Connect Social Tools**: Link Buffer/Hootsuite for auto-posting
4. **Monitor Dashboard**: Track KPIs and adjust strategy
5. **Generate Content**: Run generators weekly/monthly

---

## Support

For issues or questions, refer to the README files in each package directory.
