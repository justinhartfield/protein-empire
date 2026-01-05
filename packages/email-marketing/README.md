# @protein-empire/email-marketing

Email marketing automation for the Protein Empire. Generates welcome sequences, newsletters, and cross-promotion campaigns.

## Features

- **Welcome Sequence**: 5-email automated sequence for new subscribers
- **Weekly Newsletter**: Recipe of the week + tips + cross-promotion
- **Recipe Roundups**: Themed collections (highest protein, quickest, etc.)
- **Cross-Promotion**: Promote sister sites to existing subscribers
- **Re-engagement**: Win back inactive subscribers
- **Export Formats**: SendGrid, ConvertKit, MailerLite compatible

## Installation

```bash
pnpm install
```

## Usage

### Generate All Campaigns

```bash
# Generate for all sites with recipe data
node packages/email-marketing/src/generate-campaigns.js

# Generate for a specific site
node packages/email-marketing/src/generate-campaigns.js --site=proteincookies.co

# Generate only welcome sequences
node packages/email-marketing/src/generate-campaigns.js --type=welcome
```

### Programmatic Usage

```javascript
import { 
  generateSiteWelcomeSequence,
  generateSiteNewsletter,
  generateCrossPromoEmail,
  exportToSendGridFormat
} from '@protein-empire/email-marketing';

// Generate welcome sequence
const welcomeSequence = generateSiteWelcomeSequence(siteConfig, {
  packName: 'Cookie Starter Pack',
  downloadUrl: 'https://example.com/pack.pdf',
  empireSites
});

// Export to SendGrid format
const sendgridAutomation = exportToSendGridFormat(welcomeSequence);

// Generate newsletter
const newsletter = generateSiteNewsletter(siteConfig, recipes, {
  weekNumber: 1,
  crossPromoSite: otherSite
});
```

## Output Structure

Generated content is saved to `data/email-campaigns/{domain}/`:

```
data/email-campaigns/
├── proteincookies-co/
│   ├── welcome-sequence.json
│   ├── welcome-sequence-sendgrid.json
│   ├── newsletter-schedule.json
│   ├── full-package.json
│   └── previews/
│       ├── welcome-1-day0.html
│       ├── welcome-2-day2.html
│       ├── welcome-3-day4.html
│       ├── welcome-4-day6.html
│       ├── welcome-5-day8.html
│       └── newsletter-week1.html
├── empire/
│   ├── empire-newsletter.json
│   └── empire-newsletter.html
```

## Welcome Sequence

The 5-email welcome sequence nurtures new subscribers:

| Email | Day | Purpose |
|-------|-----|---------|
| 1 | 0 (Immediate) | PDF delivery |
| 2 | 2 | Personal welcome story |
| 3 | 4 | Value-add tips |
| 4 | 6 | Cross-promotion |
| 5 | 8 | Social proof |

## Newsletter Schedule

Weekly newsletters include:
- Recipe of the week (featured)
- 3 additional recipe recommendations
- Pro tip of the week
- Cross-site promotion

## Email Templates

All templates are:
- Mobile-responsive
- Compatible with major email clients
- Branded with site colors
- GDPR compliant (unsubscribe links)

### Customization

Edit templates in `src/templates/`:
- `base.js` - Base HTML wrapper and components
- `welcome-sequence.js` - Welcome email templates
- `newsletter.js` - Newsletter templates

## Integration

### SendGrid

1. Generate campaigns: `node generate-campaigns.js`
2. Import `welcome-sequence-sendgrid.json` as automation
3. Set trigger: "Contact added to list"
4. Configure sender verification

### ConvertKit

1. Generate campaigns
2. Use `exportToConvertKitFormat()` for compatible format
3. Create sequence in ConvertKit
4. Copy email content from generated files

### MailerLite

1. Generate campaigns
2. Use `exportToMailerLiteFormat()` for compatible format
3. Create automation workflow
4. Import email content

## Best Practices

### Sending Schedule

- **Welcome Sequence**: Automated, triggered on signup
- **Weekly Newsletter**: Sunday 10 AM (subscriber's timezone)
- **Cross-Promotion**: Monthly, after welcome sequence completes

### Subject Lines

Generated subject lines follow best practices:
- Under 50 characters
- Include emoji for visibility
- Personalized when possible
- A/B test variations

### Deliverability

- All templates include unsubscribe links
- Plain text versions included
- Preheader text optimized
- Mobile-responsive design

## License

UNLICENSED - Protein Empire Internal Use Only
