# @protein-empire/marketing-dashboard

Centralized marketing dashboard for the Protein Empire. Manage social media, email campaigns, analytics, and content calendar from one interface.

## Features

- **Overview Dashboard**: Empire-wide metrics and performance
- **Social Media Management**: Generate and schedule content for Pinterest, Instagram, TikTok, Facebook
- **Email Marketing**: Manage newsletters, welcome sequences, and campaigns
- **Analytics**: Traffic, conversions, and SEO performance
- **Content Calendar**: Plan and schedule content across all channels
- **Site Management**: Manage all 12 empire sites from one place

## Installation

```bash
pnpm install
```

## Usage

### Start Dashboard Server

```bash
# Development
node packages/marketing-dashboard/src/server.js

# Or use npm script
cd packages/marketing-dashboard && pnpm dev
```

Then open http://localhost:3000

### Dashboard Sections

#### Overview
- Total users, signups, downloads, engagement metrics
- Traffic by site chart
- Traffic sources breakdown
- Top performing recipes table
- Quick action buttons

#### Social Media
- Platform tabs (Pinterest, Instagram, TikTok, Facebook)
- Content generator
- Scheduled posts management
- Performance metrics

#### Email Marketing
- Subscriber statistics
- Campaign list
- Welcome sequence status
- Send newsletter

#### Analytics
- GA4 configuration status
- SEO performance
- Traffic trends
- Conversion tracking

#### Content Calendar
- Monthly calendar view
- Upcoming items list
- Schedule new content
- Export to iCal

#### Sites
- All 12 empire sites
- Recipe count
- Subscriber count
- Quick actions

#### Settings
- API integrations
- Notification preferences
- Account settings

## API Endpoints

The dashboard server provides these API endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/metrics` | Dashboard metrics |
| `GET /api/sites` | All sites data |
| `GET /api/traffic` | Traffic data |
| `GET /api/recipes` | Top recipes |
| `GET /api/calendar` | Calendar items |

## Quick Actions

From the dashboard, you can quickly:

1. **Generate Social Content**: Create Pinterest pins, Instagram posts for all recipes
2. **Send Newsletter**: Preview and send weekly newsletter
3. **View Calendar**: See upcoming posts and emails
4. **Generate Report**: Create weekly performance report
5. **Cross-Promotion**: Promote sister sites to subscribers

## Integration with Other Packages

The dashboard integrates with all marketing packages:

```javascript
import {
  // Social Media
  generatePinterestContent,
  generateInstagramContent,
  
  // Email Marketing
  generateSiteNewsletter,
  generateWelcomeSequence,
  
  // Analytics
  generateGA4Script,
  generateSitemap,
  
  // Content Calendar
  generateCompleteMonthlyCalendar
} from '@protein-empire/marketing-dashboard';
```

## Customization

### Adding New Widgets

Edit `src/index.html` to add new dashboard widgets:

```html
<div class="metric-card bg-white rounded-xl shadow-sm p-6">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm text-gray-500">New Metric</p>
      <p class="text-3xl font-bold text-gray-800">Value</p>
    </div>
    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
      <i class="fas fa-icon text-blue-600"></i>
    </div>
  </div>
</div>
```

### Adding New API Endpoints

Edit `src/server.js` to add new API routes:

```javascript
case '/api/new-endpoint':
  res.writeHead(200);
  res.end(JSON.stringify({ data: 'value' }));
  break;
```

## Tech Stack

- **Frontend**: HTML, TailwindCSS, Chart.js, Font Awesome
- **Backend**: Node.js HTTP server
- **Data**: JSON (would connect to database in production)

## Production Deployment

For production, consider:

1. Replace the simple HTTP server with Express or Fastify
2. Add authentication (e.g., Passport.js, Auth0)
3. Connect to a real database (PostgreSQL, MongoDB)
4. Deploy to Netlify Functions, Vercel, or AWS Lambda
5. Add proper error handling and logging

## License

UNLICENSED - Protein Empire Internal Use Only
