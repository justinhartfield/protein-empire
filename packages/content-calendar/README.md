# @protein-empire/content-calendar

Content calendar and scheduling system for the Protein Empire. Plan and coordinate social media, email campaigns, and content publishing across all sites.

## Features

- **Social Media Calendar**: Pinterest, Instagram, TikTok, Facebook scheduling
- **Email Calendar**: Newsletters, welcome sequences, promotions
- **Content Calendar**: Recipe publishing, updates, SEO audits
- **Export Formats**: CSV, iCal, JSON, tool-specific (Buffer, Hootsuite, Later)

## Installation

```bash
pnpm install
```

## Usage

### Generate Calendars

```bash
# Generate current month
node packages/content-calendar/src/generate-calendar.js

# Generate specific month
node packages/content-calendar/src/generate-calendar.js --month=2 --year=2026

# Generate quarterly plan
node packages/content-calendar/src/generate-calendar.js --quarter=1 --year=2026

# Generate annual email calendar
node packages/content-calendar/src/generate-calendar.js --annual --year=2026
```

### Programmatic Usage

```javascript
import {
  generateCompleteMonthlyCalendar,
  generateMasterCalendarView,
  exportMasterCalendar
} from '@protein-empire/content-calendar';

// Generate complete calendar
const calendar = generateCompleteMonthlyCalendar({
  year: 2026,
  month: 1,
  sites: empireSites,
  recipes: recipesByDomain
});

// Get unified view
const masterView = generateMasterCalendarView(calendar);

// Export to CSV
const csv = exportMasterCalendar(masterView, 'csv');

// Export to iCal
const ical = exportMasterCalendar(masterView, 'ical');
```

## Output Structure

Generated calendars are saved to `data/calendars/`:

```
data/calendars/
├── 2026-01/
│   ├── complete-calendar.json
│   ├── master-calendar.csv
│   ├── calendar.ics
│   └── stats.json
├── 2026-Q1/
│   ├── quarterly-plan.json
│   └── quarterly-summary.md
└── 2026-annual/
    └── annual-email-calendar.json
```

## Social Media Schedule

### Platform Posting Frequency

| Platform | Posts/Day | Best Times (EST) | Best Days |
|----------|-----------|------------------|-----------|
| Pinterest | 5 | 8am, 12pm, 2pm, 6pm, 9pm | Sat, Sun, Fri |
| Instagram | 2 | 11am, 7pm | Tue, Wed, Fri |
| TikTok | 3 | 7am, 12pm, 7pm | Tue, Thu, Fri |
| Facebook | 1 | 1pm | Wed, Thu, Fri |

### Content Mix

**Pinterest**:
- 40% New recipes
- 30% Repins (top performers)
- 20% Seasonal content
- 10% Cross-promotion

**Instagram**:
- 30% Feed posts
- 50% Stories
- 20% Reels

## Email Schedule

### Weekly Newsletter
- **Day**: Sunday
- **Time**: 10:00 AM EST
- **Content**: Featured recipe, 3 additional recipes, tip, cross-promo

### Welcome Sequence
| Email | Day | Content |
|-------|-----|---------|
| 1 | 0 | PDF delivery |
| 2 | 2 | Welcome story |
| 3 | 4 | Tips & tricks |
| 4 | 6 | Cross-promotion |
| 5 | 8 | Social proof |

### Seasonal Campaigns
- New Year (Jan 2)
- Valentine's Day (Feb 12)
- Easter (dynamic)
- Summer (Jun 1)
- Back to School (Aug 15)
- Halloween (Oct 25)
- Thanksgiving (dynamic)
- Christmas (Dec 15)

## Content Publishing

### New Recipe Schedule
- **Frequency**: 2 per site per week
- **Best Days**: Monday, Thursday
- **Time**: 9:00 AM

### Monthly Themes

| Month | Theme | Focus |
|-------|-------|-------|
| January | New Year Health Goals | high protein, low calorie, meal prep |
| February | Valentine's Day | chocolate, romantic, date night |
| March | Spring Fresh | light, fresh, seasonal |
| April | Easter & Spring | easter, spring baking, family |
| May | Summer Prep | summer body, outdoor, quick |
| June | Summer Treats | no-bake, refreshing, easy |
| July | Independence Day | bbq, patriotic, outdoor |
| August | Back to School | meal prep, lunchbox, quick |
| September | Fall Flavors | pumpkin, apple, cinnamon |
| October | Halloween | spooky, fun, kid-friendly |
| November | Thanksgiving | holiday, comfort, family |
| December | Holiday Season | christmas, gifts, festive |

## Export Options

### CSV Export
Import into Google Sheets, Excel, or any spreadsheet tool.

### iCal Export
Import into Google Calendar, Apple Calendar, Outlook.

### Tool-Specific Export

```javascript
import { exportForTool } from '@protein-empire/content-calendar/social';

// Buffer format
const bufferPosts = exportForTool(calendar, 'buffer');

// Hootsuite format
const hootsuitePosts = exportForTool(calendar, 'hootsuite');

// Later format
const laterPosts = exportForTool(calendar, 'later');
```

## Quarterly Goals

Each quarter includes targets for:
- New recipes published
- Traffic growth
- Email list growth
- SEO ranking improvements

## License

UNLICENSED - Protein Empire Internal Use Only
