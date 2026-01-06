# Protein Empire Design Integration Notes

## Current Site Color Scheme (to preserve)

The existing ProteinXYZ.co sites use this Tailwind config:

```javascript
colors: {
    brand: {
        50: '#fffbeb',   // Light cream
        100: '#fef3c7',  // Light yellow
        500: '#f59e0b',  // Amber/Orange
        600: '#d97706',  // Darker amber
        900: '#451a03',  // Dark brown
    },
    accent: {
        500: '#10b981',  // Emerald green
    }
}
```

**Typography:**
- Headlines: Anton (bold, uppercase feel)
- Body: Inter (clean, readable)

## Reference Templates Provided

| File | Purpose |
|:---|:---|
| intent_landing_page.html | Main landing page layout for meal-prep/intent pages |
| exit_intent_capture_screen.html | Full-screen exit intent popup modal |
| exit_success_confirmation.html | Success screen after exit intent signup |
| pdf_pack_lead_magnet_modal.html | Modal for PDF download lead capture |
| download_success_screen.html | Success screen after PDF download |
| print_friendly_recipe_layout.html | Print-optimized recipe layout |
| recipe_detail_view.html | Full recipe page layout |

## Components to Integrate Across ALL Sites

1. **Exit Intent Popup** - Triggers on mouse leave, offers free guide
2. **PDF Pack Modal** - Triggered by CTA buttons, captures email for PDF
3. **Sticky Footer CTA** - Appears after scroll, email capture
4. **Print-Friendly Layout** - Print button on recipe pages
5. **Download Success Screen** - Redirect after successful signup

## SendGrid Integration Required

- Email capture forms need to POST to SendGrid API
- Success redirect to download page with PDF link
- UTM parameter tracking for attribution

## Color Mapping: Dotoro → Protein Empire

| Dotoro (wellness) | Protein Empire | Usage |
|:---|:---|:---|
| sage (#7B8E7E) | accent-500 (#10b981) | Primary accent |
| forest (#3A4D39) | brand-900 (#451a03) | Dark text/headers |
| cream (#FDFBF7) | brand-50 (#fffbeb) | Background |
| sand (#F5EFE6) | brand-100 (#fef3c7) | Light sections |
| terracotta (#D4A373) | brand-500 (#f59e0b) | CTA buttons |
