# Design Audit — FitForPDF Frontend

**Date:** 2026-03-14
**Approach:** Partial redesign (Approach B — "Apple contrast")
**References:** OpenAI, Anthropic, Perplexity, Apple
**Branch:** `design-audit`

---

## 1. Palette & Tokens

### Light mode

| Token | Value | Notes |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Page base |
| `--color-bg-warm` | `#FAF8F5` | Cream sections (replaces `--color-bg-hero` — see migration notes) |
| `--color-text` | `#0F172A` | Unchanged |
| `--color-muted` | `#64748B` | Unchanged (note: CSS var is `--color-muted`, not `--color-text-muted`) |
| `--color-accent` | `#2563EB` | From logo (was `#0F172A` = same as text — broken) |
| `--color-accent-muted` | `rgba(37, 99, 235, 0.4)` | Logo bottom bar opacity |
| `--color-accent-hover` | `#1D4ED8` | Unchanged |
| `--color-border` | `rgba(0, 0, 0, 0.06)` | Softer than current 0.10 |

### Dark mode

| Token | Value | Notes |
|---|---|---|
| `--color-bg` | `#0A0A0B` | Neutral near-black (was navy `#0F1117`) |
| `--color-bg-warm` | `#111113` | Dark sections |
| `--color-text` | `#F1F0ED` | Warm white |
| `--color-muted` | `#94A3B8` | Unchanged (currently exists as `--color-muted`) |
| `--color-accent` | `#3B82F6` | Blue-500 |
| `--color-accent-muted` | `rgba(59, 130, 246, 0.4)` | Dark mode equivalent |
| `--color-accent-hover` | `#60A5FA` | Lighter blue for dark hover |
| `--color-border` | `rgba(255, 255, 255, 0.08)` | |

### Token consolidation: accent ↔ CTA

Currently two overlapping token sets exist:
- `--color-accent: #0F172A` + `--color-accent-hover: #1D4ED8` (broken — accent = text)
- `--color-cta-bg: #2563EB` + `--color-cta-text: #FFFFFF` + `--color-cta-hover: #1D4ED8`

**Action:** Merge into a single accent family. `--color-accent: #2563EB` replaces both. Remove `--color-cta-bg`, `--color-cta-text`, `--color-cta-hover`. The Tailwind `cta` color and `accent` color both resolve to the same blue.

**Blast radius:** ~30 components use `bg-accent`/`text-accent`. Currently these render as dark navy (`#0F172A`). After change, they render as blue (`#2563EB`). This is **intentionally desired** — these are all action elements (buttons, badges, switches, progress bars) that should have been blue all along. The `accent` variant on `Button.jsx` becomes equivalent to `primary` — consolidate into one.

### `--color-bg-hero` → `--color-bg-warm` migration

The rename affects:
- `globals.css`: CSS variable declaration + all `var(--color-bg-hero)` references
- `tailwind.config.js`: `colors.hero` → `colors.warm` (used as `bg-hero` in Tailwind classes)
- `Section.jsx`: `BG_MAP` entry `'bg-hero'` → `'bg-warm'`
- `page.jsx`: `CTA_SECONDARY` const (line 28) references `--color-bg-hero` inline — must update
- `page.jsx`: 8+ `<Section bg="bg-hero">` instances (lines 283, 363, 415, 477, 565, 598, 619, 643) — all resolved via `Section.jsx` `BG_MAP` single point of change
- All other components using `bg-[var(--color-bg-hero)]`

### `tokens.mjs` update

Update `/app/ui/tokens.mjs` to match all new values. This file is documented as "source of truth" but has drifted (e.g., `h2.weight: 620` does not match usage). Sync it completely.

### Zone layout (no more zebra-stripes)

```
Hero            → dark    #0A0A0B
Proof + Features → cream   #FAF8F5
Apple-grid      → dark    #0A0A0B
Pricing + FAQ   → cream   #FAF8F5
Footer          → dark    #0A0A0B
```

3-4 dark↔cream transitions total. Hard cuts between zones (Apple style).

**Dark zones in light mode vs dark mode toggle:** The dark zones (hero, apple-grid, footer) use hardcoded dark backgrounds — they are dark regardless of the `data-theme` toggle. The global dark mode toggle only affects the cream zones (which become `#111113`). This is orthogonal: zone layout is structural, dark mode is a user preference.

---

## 2. Typography

Two weights only: **400** and **600**.

**Font files:** Only `satoshi-400.woff2` and `satoshi-700.woff2` exist. Satoshi is a variable font — weight 600 requires either obtaining `satoshi-600.woff2` or (preferred) switching to the variable font file `satoshi-variable.woff2` which supports the full 300-900 range. If the variable file is unavailable, use `font-semibold` (Tailwind) which maps to 600 and will be synthesized from the 400/700 pair.

| Role | Size | Weight | Extra |
|---|---|---|---|
| Display | `clamp(2.5rem, 5vw, 4rem)` | 600 | Hero headline only |
| h2 | `clamp(1.75rem, 3vw, 2.5rem)` | 600 | Section titles |
| h3 | `clamp(1.25rem, 2vw, 1.5rem)` | 600 | Card titles, sub-sections |
| Subtitle | `clamp(1.125rem, 2vw, 1.375rem)` | 400 | Hero subtitle, section intros |
| Body | `1rem` (16px) | 400 | |
| Small | `0.8125rem` (13px) | 400 | Labels, captions |
| Eyebrow | `0.75rem` (12px) | 600, uppercase, `tracking-[0.08em]` | Badges, section labels (use `font-semibold`) |

### Cleanup

- Remove `font-[650]` → use `font-semibold` (600) — found in 12 files across SEO pages + components
- Remove `font-bold` / `font-[700]` → use `font-semibold` (600) — ~110 occurrences across 20 files. Bulk find-replace `font-bold` → `font-semibold`, `font-[700]` → `font-semibold`
- Remove `text-[11px]` → use Small tier (13px)
- Use `clamp()` for fluid scaling — remove breakpoint-based `sm:text-[2.5rem]` patterns (found in 11+ files)
- Note: `font-[620]` referenced in `tokens.mjs` but does not appear in any JSX — fix tokens.mjs only

---

## 3. Hero

Dark background (`#0A0A0B`). White text.

### Structure
1. Eyebrow badge — "Engine for wide tables" — uses `--color-accent-muted` tint bg
2. Display headline — "Readable PDFs" — gradient shimmer **inverted for dark bg** (white → blue gradient instead of dark → blue)
3. Bracket animation — "[from wide Excel tables.]" — keep unchanged (signature). Brackets and text use white (`--color-text` on dark = `#F1F0ED`)
4. Subtitle — "Your wide spreadsheets, fitted into clean, readable PDFs." — 22px, weight 400, `rgba(255,255,255,0.6)`
5. CTAs — primary pill blue + secondary ghost link (white border)
6. Background lines — keep, reduce base opacity to 60%

### Gradient shimmer on dark bg
Current shimmer uses dark-to-blue gradient. On dark hero bg this would be invisible. Invert to: `linear-gradient(135deg, #F1F0ED, #3B82F6, #F1F0ED)` — white-to-blue shimmer on dark bg.

### Animation changes
- Hero entrance: `800ms` Flow tier (was `2000ms` via `heroLineIn`)
- Kill `heroLineIn` keyframe — use Flow tier
- Bracket animation: unchanged
- Gradient shimmer: unchanged timing, new colors

### Nav on hero
- Transparent bg, links `rgba(255,255,255,0.7)`, hover → white
- Transitions to frosted glass (`rgba(250,248,245,0.8)` + `backdrop-blur(12px)`) when scrolling past hero into cream zone
- Implementation: scroll threshold tied to hero section height (not a fixed `scrollY > 16`). Use IntersectionObserver on the hero section boundary.

---

## 4. Proof Showcase

Cream zone (`#FAF8F5`).

### Layout clarification
The current ProofShowcase already uses a side-by-side layout (`grid-cols-[38fr_62fr]`): spreadsheet preview left, PDF output right. Tabs switch between different example types (Financial, Invoice, etc.).

**Changes:**
- Increase the before (spreadsheet) column to equal width: `grid-cols-2` (50/50) for more visual balance
- Add a subtle animated arrow `→` between the two images
- Move tab pills below the images (currently above)

### Styling
- Images: `border-radius: 16px`, shadow `0 8px 32px rgba(0,0,0,0.08)`
- No glass morphism (cream bg = opaque cards)
- No skeleton loading (already removed)

---

## 5. Cards & Components

### Single card style
- **Light zone:** bg `#FFFFFF`, border `rgba(0,0,0,0.06)`, shadow `0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)`
- **Dark zone:** bg `rgba(255,255,255,0.05)`, border `rgba(255,255,255,0.08)`, no shadow
- **Border-radius:** `16px` everywhere (was mixed 12/14/20px — includes apple-grid cards which were 20px)

### Hover
- No `translateY` — replaced by border-color transition to `rgba(0,0,0,0.12)` + shadow boost
- Optional `scale(1.005)` for "alive" feel
- Transition: `200ms ease`

### Featured pricing card
- Background: `rgba(37, 99, 235, 0.05)` flat (not gradient)
- Border: `1px solid rgba(37, 99, 235, 0.2)`
- No `scale-105` — same size, color differentiates

### Glass morphism
- Keep only in dark zones (apple-grid) where blur is visible
- Cream zones → opaque white cards

### Badge consolidation
Two Badge components exist:
- `app/components/ui/Badge.jsx` (variants: default, accent, success)
- `app/components/Badge.jsx` (variants: default, popular)

**Action:** Merge into one `app/components/ui/Badge.jsx` with all variants. Delete `app/components/Badge.jsx`. Update imports in `PlanCard.jsx` and anywhere else.

### Existing Button component
`app/components/ui/Button.jsx` already exists with variants: `primary`, `accent`, `secondary`, `outline`.

**Action:** Extend (not create) this component:
- Add `ghost` variant (text-only with hover underline)
- Consolidate `primary` and `accent` variants (they become the same with the accent color change)
- Ensure pill shape `rounded-full` is already applied (it is)
- Update padding and sizing to match spec: `h-11 px-6`

---

## 6. Animations & Timing

### Three tiers

| Tier | Duration | Easing | Usage |
|---|---|---|---|
| Micro | `150ms` | `ease` | Hover, focus, border, opacity |
| Move | `400ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Section entrances, card reveals, tabs |
| Flow | `800ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero entrance, page transitions |

### Changes
- Section GSAP entrance: `y: 12px` (was 24), `400ms` (was 700ms), stagger `0.06s` (was 0.1s)
- Hero entrance: `800ms` Flow tier (was 2000ms) — consistent with tier definition
- Apple-grid card hover: `200ms` Micro tier (was 500ms)
- One easing for Move+Flow: `cubic-bezier(0.16, 1, 0.3, 1)` (Anthropic's "snappy decelerate")
- Bracket scroll animation: unchanged
- Reduced motion: already in place, keep

### FAQ accordion
Current `FaqAccordion.jsx` uses `max-height` with `transition-[max-height,opacity]`. **Change to:** `grid-template-rows: 0fr → 1fr` with `400ms` Move tier. This avoids the max-height guessing problem and gives smoother animation.

---

## 7. Navigation & Footer

### Navigation
- On dark hero: transparent bg, links `rgba(255,255,255,0.7)`, hover → white
- On scroll past hero (cream zone): `rgba(250,248,245,0.8)` + `backdrop-blur(12px)` frosted glass
- Height: `52px`
- CTA: "Try it free" pill blue — always visible
- Implementation: IntersectionObserver on hero section, not fixed scrollY threshold

### Footer
- Dark bg `#0A0A0B` — bookends with hero
- 2-column layout: brand/tagline/CTA left, links right
- Links: `rgba(255,255,255,0.5)`, hover → white
- Remove `mailto:` newsletter form → replace with primary CTA pill ("Try it free")
- Copyright bar at bottom with `1px` separator line `rgba(255,255,255,0.08)`

---

## 8. Pricing

### Layout
- Cream zone (`#FAF8F5`)
- No dark hero backdrop (simplicity)
- 3 cards at same size, same height

### Featured card
- Tinted blue bg `rgba(37, 99, 235, 0.05)`
- Blue border `rgba(37, 99, 235, 0.2)`
- CTA: filled pill blue
- Others: white bg, ghost pill CTA

### FAQ
- Same cream zone, no section break
- Accordion with `grid-template-rows: 0fr → 1fr` height animation (see Section 6)

---

## 9. Global CTAs

- **Shape:** pill `border-radius: 9999px` everywhere (already applied via `rounded-full` on Button)
- **Primary:** bg `#2563EB`, text white, `h-11 px-6`
- **Secondary:** ghost, border `rgba(37, 99, 235, 0.3)`, text `#2563EB`
- Extend existing `Button` component (see Section 5)
- Eliminate inline 130+ char className strings — use `<Button variant="primary">` instead

---

## 10. Cleanup

### Max-widths consolidation
- Current: `max-w-content` (1360px), `max-w-wide` (1440px), `max-w-narrow` (1240px), `max-w-tight` (860px) + token `maxWidth: 960px`
- **New:** `max-w-content` (1200px — tighter, more editorial), `max-w-narrow` (860px — current `tight` renamed)
- Remove `max-w-wide` and `max-w-narrow` (1240px). Remove inline `max-w-[1440px]`, `max-w-[1360px]`, `max-w-[1200px]`
- Note: this shrinks main content from 1360px to 1200px — creates more whitespace (intentional, matches reference sites)

### Section padding
- Fix double-padding on `<Section>`: outer `<section>` and inner wrapper both apply `py-*`
- Standardize to single padding source in `Section.jsx` inner wrapper only

### Component scope
The following components inherit token changes passively (no explicit redesign):
- WallOfLove, UseCaseCards, ApiTeaserWidget, RoiCalculator — inherit new colors, weights, radii via tokens
- ImageLightbox — inherits `rounded-2xl` (keep as-is, close enough to 16px)
- UploadCard / upload section — has its own gradient backgrounds in `globals.css` (lines 211-284). Review these gradient values after token changes to ensure they harmonize with new palette. No layout changes.

### Content pages
SEO pages (`excel-to-pdf-columns-cut-off`, `csv-to-structured-pdf`, `fit-excel-sheet-on-one-page-pdf`, `audit-report-excel-to-pdf-tips`) and `mentions-legales` all use `font-[650]` and need the weight cleanup. These inherit token changes automatically — the only manual work is the `font-[650]` → `font-semibold` replacement.

### Hover classes cleanup
- `.apple-grid-card` hover (`globals.css` ~line 339): remove `translateY(-2px)` and `0.5s` timing, apply Micro tier (200ms) border-color transition
- `.feature-card-hover` (`globals.css` ~line 366): remove `translateY(-3px)` and `350ms` timing, apply same Micro tier hover pattern

### CSS custom property cleanup
- Remove `--max-width: 960px` from `:root` in `globals.css` (line 42) — conflicts with new `max-w-content: 1200px`
- Update `tokens.mjs` `maxWidth` from `960px` to `1200px`

### Specific `text-[11px]` locations
- `page.jsx` lines 160, 162, 166 (ROI slider labels)
- `ProofShowcase.jsx` lines 275, 296

### Specific `font-[650]` locations
- `ProofShowcase.jsx` lines 243, 275
- SEO pages: `excel-to-pdf-columns-cut-off`, `csv-to-structured-pdf`, `fit-excel-sheet-on-one-page-pdf`, `audit-report-excel-to-pdf-tips`
- `mentions-legales/page.jsx`

### Stale code
- Remove duplicate `Badge.jsx` (see Section 5)
- Remove orphaned CSS variables after CTA→accent merge
- Remove `heroLineIn` keyframe from `globals.css`
