# Upload Pill Redesign

## Problem
The upload card stretches full-width (~1360px), creating a bloated "potato" appearance. The dashed dropzone border looks dated. No visual tension or focal point.

## Solution
Compact pill-style upload bar (max 640px, centered) on a blue/grey pastel section background. Gear icon opens settings dropdown. Quota and secondary actions sit below.

## Design

### Section Background
- Full-width pastel blue/grey gradient matching the fitforpdf logo tones
- Colors: soft blue-grey (#E8EDF5 to #DCE4F0) with subtle radial warm spot
- Smooth transition from the hero section above

### Pill (empty state)
- `max-w-[640px] mx-auto`, `rounded-2xl`
- White background, subtle border, soft shadow + blue glow on hover
- Layout: `[cloud-icon] [Drop CSV or XLSX · or click] [gear-btn] [Generate →]`
- Cloud icon left, gear icon before Generate button, Generate as primary CTA right
- Single-line height ~56px

### Pill (file selected)
- Cloud icon replaced by checkmark
- File name + size as chip, with X to remove
- Generate button activates (no longer disabled)

### Gear Dropdown
- Absolute positioned below the pill, same max-width
- Contains existing SettingRow toggles: branding, overview, headers, footer, truncate
- Opens/closes on gear click, closes on outside click
- White bg, border, shadow

### Below the Pill
- Quota badge: `Free · 3 exports left` as muted centered text
- "Try with a demo file" link
- Progress bar (during conversion) appears here
- Paywall panel appears here
- Buy credits panel appears here
- GDPR strip stays

### Files Changed
1. `UploadCard.jsx` — restructure layout to pill format, add gear dropdown state
2. `UploadDropzone.jsx` — inline mode (no dashed border, horizontal layout)
3. `page.jsx` — change upload Section wrapper to use pastel bg, narrow max-width
4. `globals.css` — add upload section background styles, pill glow effect

### Unchanged
- All business logic (quota, paywall, branding nudge, progress tracking)
- All props interface
- All test IDs (preserved for existing tests)
