# @protein-empire/social-media

Social media content generator for the Protein Empire. Automatically generates optimized content for Pinterest, Instagram, TikTok, and Facebook from recipe data.

## Features

- **Pinterest**: SEO-optimized pin titles, descriptions, hashtags, and board suggestions
- **Instagram**: Feed captions, Story content, Reel descriptions, and Carousel ideas
- **TikTok**: Video captions, hooks, content structures, and audio suggestions
- **Facebook**: Page posts, group posts, roundups, polls, and event content
- **Content Calendar**: 4-week posting schedule with platform-specific timing
- **Cross-Promotion**: Content for promoting sister sites in the empire

## Installation

```bash
pnpm install
```

## Usage

### Generate All Content

```bash
# Generate for all sites with recipe data
node packages/social-media/src/generate-all.js

# Generate for a specific site
node packages/social-media/src/generate-all.js --site=proteincookies.co

# Generate for a specific platform
node packages/social-media/src/generate-all.js --platform=pinterest
```

### Programmatic Usage

```javascript
import { 
  generateAllContent,
  generateContentCalendar,
  pinterest,
  instagram,
  tiktok,
  facebook 
} from '@protein-empire/social-media';

// Generate all platform content
const allContent = generateAllContent(recipes, siteConfig);

// Generate platform-specific content
const pins = pinterest.generatePinterestPackage(recipes, siteConfig);
const igContent = instagram.generateInstagramPackage(recipes, siteConfig);
const tikTokContent = tiktok.generateTikTokPackage(recipes, siteConfig);
const fbContent = facebook.generateFacebookPackage(recipes, siteConfig);

// Generate content calendar
const calendar = generateContentCalendar(recipes, siteConfig, 4); // 4 weeks
```

## Output Structure

Generated content is saved to `data/social-media/{domain}/`:

```
data/social-media/
├── proteincookies-co/
│   ├── pinterest.json
│   ├── instagram.json
│   ├── tiktok.json
│   ├── facebook.json
│   ├── content-calendar.json
│   ├── cross-promotion.json
│   └── all-platforms.json
├── proteinbrownies-co/
│   └── ...
```

## Platform Best Practices

### Pinterest
- Use vertical images (2:3 ratio, 1000x1500px)
- Include keywords in title and description
- Create 3 pin variations per recipe
- Use up to 15 relevant hashtags

### Instagram
- Square (1:1) or vertical (4:5) images
- Front-load important content in captions
- Mix popular and niche hashtags (max 30)
- Post Stories daily, Feed 1-2x daily

### TikTok
- Hook viewers in first 3 seconds
- Keep videos 15-60 seconds
- Use trending sounds
- Post 1-3 times daily

### Facebook
- Use eye-catching images
- Ask questions for engagement
- Post 1-2 times daily
- Best times: 1-4 PM

## Content Calendar

The generator creates a 4-week content calendar with:

- **Monday/Wednesday/Friday**: Full content push (Pinterest, Instagram, TikTok)
- **Tuesday/Thursday**: Engagement focus (Stories, Facebook, re-pins)
- **Saturday**: Weekly roundups and carousels
- **Sunday**: Light content and board organization

## Customization

### Templates

Edit `src/templates.js` to customize:
- Hashtag collections
- Emoji sets
- Call-to-action phrases
- Hook templates

### Platform-Specific

Each platform generator can be customized:
- `src/pinterest.js` - Pin formats and board suggestions
- `src/instagram.js` - Caption styles and Story templates
- `src/tiktok.js` - Video structures and audio suggestions
- `src/facebook.js` - Post types and roundup formats

## Integration with Scheduling Tools

The generated JSON files can be imported into:
- **Buffer** - Social media scheduling
- **Later** - Visual content planning
- **Hootsuite** - Enterprise scheduling
- **Tailwind** - Pinterest-specific scheduling

## License

UNLICENSED - Protein Empire Internal Use Only
