# Design Audit Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the FitForPDF frontend to 2026 premium standards (Apple contrast approach) — new palette, typography cleanup, zone-based dark/cream layout, refined animations.

**Architecture:** Token-first approach. Change CSS vars + Tailwind config first, then cascade through components. Zone layout replaces zebra-stripes. Dark hero/footer bookend cream content zones.

**Tech Stack:** Next.js App Router, Tailwind CSS, CSS custom properties, GSAP, Satoshi font

**Spec:** `docs/superpowers/specs/2026-03-14-design-audit-spec.md`

---

## Chunk 1: Foundation (tokens, config, CSS vars)

### Task 1: Create `design-audit` branch

**Files:**
- None (git only)

- [ ] **Step 1: Create branch from main**

```bash
git checkout -b design-audit
```

- [ ] **Step 2: Verify branch**

```bash
git branch --show-current
```

Expected: `design-audit`

---

### Task 2: Update CSS custom properties in globals.css

**Files:**
- Modify: `app/globals.css:26-64`

- [ ] **Step 1: Update `:root` light mode tokens**

Replace lines 26-47 in `app/globals.css`:

```css
:root {
  --color-accent: #2563EB;
  --color-accent-hover: #1D4ED8;
  --color-accent-muted: rgba(37, 99, 235, 0.4);
  --color-text: #0F172A;
  --color-muted: #64748B;
  --color-border: rgba(0, 0, 0, 0.06);
  --color-bg: #FFFFFF;
  --color-bg-warm: #FAF8F5;
  --color-badge-free: #F3F4F6;
  --color-badge-hot: #DBEAFE;
  --radius-base: 12px;
  --radius-input: 10px;
  --radius-pill: 999px;
  --button-height: 48px;
  --motion-duration: 150ms;
  --glass-spot-1: rgba(255, 255, 255, 0.75);
  --glass-spot-2: rgba(255, 255, 255, 0.45);
}
```

Key changes: removed `--color-cta-*` (merged into accent), removed `--max-width`, renamed `--color-bg-hero` → `--color-bg-warm`, accent changed from `#0F172A` to `#2563EB`.

- [ ] **Step 2: Update `[data-theme="dark"]` tokens**

Replace dark mode block:

```css
[data-theme="dark"] {
  --color-accent: #3B82F6;
  --color-accent-hover: #60A5FA;
  --color-accent-muted: rgba(59, 130, 246, 0.4);
  --color-text: #F1F0ED;
  --color-muted: #94A3B8;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-bg: #0A0A0B;
  --color-bg-warm: #111113;
  --color-badge-free: #1E293B;
  --color-badge-hot: #1E3A5F;
  --glass-spot-1: rgba(255, 255, 255, 0.06);
  --glass-spot-2: rgba(255, 255, 255, 0.03);
}
```

Key changes: removed `--color-cta-*`, bg from `#0F1117` to `#0A0A0B`, text from `#E2E8F0` to `#F1F0ED`, accent from `#E2E8F0` to `#3B82F6`, border softer.

- [ ] **Step 3: Find-replace `var(--color-bg-hero)` → `var(--color-bg-warm)` in globals.css**

Search for all occurrences of `--color-bg-hero` in globals.css and replace with `--color-bg-warm`.

- [ ] **Step 4: Find-replace `var(--color-cta-bg)` → `var(--color-accent)` in globals.css**

Also replace `var(--color-cta-text)` → `#FFFFFF` or `var(--color-bg)` and `var(--color-cta-hover)` → `var(--color-accent-hover)`.

- [ ] **Step 5: Verify no remaining `cta-bg`, `cta-text`, `cta-hover`, or `bg-hero` references in globals.css**

```bash
grep -n 'cta-bg\|cta-text\|cta-hover\|bg-hero' app/globals.css
```

Expected: no matches

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "refactor: update CSS tokens — accent/CTA merge, bg-hero→bg-warm, new palette"
```

---

### Task 3: Update Tailwind config

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Update colors and maxWidth**

Replace `theme.extend` in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,mjs,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          muted: 'rgba(37, 99, 235, 0.4)',
        },
        warm: '#FAF8F5',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Satoshi', '-apple-system', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
        narrow: '860px',
      },
      borderRadius: {
        xl: '16px',
      },
    },
  },
  plugins: [],
};
```

Key changes: removed `cta` color, accent from navy to blue, added `accent.muted`, `hero` → `warm`, removed `wide`/old `narrow`, `content` from 1360→1200, `tight` → `narrow` (860px).

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.js
git commit -m "refactor: update Tailwind config — consolidate colors, shrink max-widths"
```

---

### Task 4: Update tokens.mjs

**Files:**
- Modify: `app/ui/tokens.mjs`

- [ ] **Step 1: Rewrite tokens.mjs to match new values**

```js
export const UI_TOKENS = Object.freeze({
  colors: {
    text: '#0F172A',
    muted: '#64748B',
    border: 'rgba(0, 0, 0, 0.06)',
    bg: '#FFFFFF',
    bgWarm: '#FAF8F5',
    accent: '#2563EB',
    accentHover: '#1D4ED8',
    accentMuted: 'rgba(37, 99, 235, 0.4)',
    badgeFree: '#F3F4F6',
    badgeHot: '#DBEAFE',
  },
  spacing: {
    x4: '4px',
    x8: '8px',
    x12: '12px',
    x16: '16px',
    x24: '24px',
    x32: '32px',
    x48: '48px',
    x64: '64px',
    x96: '96px',
    x120: '120px',
  },
  radius: {
    base: '12px',
    input: '10px',
    pill: '999px',
  },
  fontFamily: "'Satoshi', -apple-system, 'SF Pro Display', 'Segoe UI', sans-serif",
  typography: {
    display: {
      size: 'clamp(2.5rem, 5vw, 4rem)',
      weight: 600,
      lineHeight: 1.05,
    },
    h2: {
      size: 'clamp(1.75rem, 3vw, 2.5rem)',
      weight: 600,
      lineHeight: 1.2,
    },
    h3: {
      size: 'clamp(1.25rem, 2vw, 1.5rem)',
      weight: 600,
      lineHeight: 1.3,
    },
    subtitle: {
      size: 'clamp(1.125rem, 2vw, 1.375rem)',
      weight: 400,
      lineHeight: 1.5,
    },
    body: {
      size: '16px',
      weight: 400,
      lineHeight: 1.5,
    },
    small: {
      size: '13px',
      weight: 400,
      lineHeight: 1.4,
    },
    eyebrow: {
      size: '12px',
      weight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
  },
  maxWidth: '1200px',
  buttonHeight: '48px',
  motion: {
    micro: '150ms',
    move: '400ms',
    flow: '800ms',
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/ui/tokens.mjs
git commit -m "refactor: sync tokens.mjs — new typography scale, motion tiers, accent colors"
```

---

### Task 5: Update Section component

**Files:**
- Modify: `app/components/ui/Section.jsx:20-53`

- [ ] **Step 1: Update BG_MAP and animation values**

In `Section.jsx`, change:
- `BG_MAP`: `'bg-hero'` → `'bg-warm'` key, `var(--color-bg-hero)` → `var(--color-bg-warm)` value
- GSAP `y: 24` → `y: 12`
- GSAP `duration: 0.7` → `duration: 0.4`
- GSAP `stagger: 0.1` → `stagger: 0.06`
- GSAP `ease: 'power2.out'` → `ease: 'power2.out'` (keep — close enough to spec easing for GSAP)

```js
const BG_MAP = {
  'bg-warm': 'bg-[var(--color-bg-warm)]',
  'bg-white': 'bg-[var(--color-bg)]',
};
```

```js
gsap.set(targets, { opacity: 0, y: 12 });
// ...
gsap.to(targets, {
  opacity: 1,
  y: 0,
  duration: 0.4,
  stagger: 0.06,
  ease: 'power2.out',
});
```

- [ ] **Step 2: Commit**

```bash
git add app/components/ui/Section.jsx
git commit -m "refactor: Section — bg-warm rename, faster entrance animation"
```

---

### Task 6: Update Button component

**Files:**
- Modify: `app/components/ui/Button.jsx`

- [ ] **Step 1: Consolidate variants and add ghost**

```jsx
import React from 'react';

const BASE_CLASS =
  'inline-flex items-center justify-center rounded-full px-6 text-sm font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS = {
  primary:
    'h-11 bg-accent text-white shadow-sm hover:bg-accent-hover active:scale-[0.99]',
  secondary:
    'h-11 border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-warm)]',
  outline:
    'h-11 border border-accent/30 text-accent bg-transparent hover:bg-accent/5 active:scale-[0.99]',
  ghost:
    'h-11 text-[var(--color-text)] hover:text-accent bg-transparent',
};

export default function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}) {
  const classes = `${BASE_CLASS} ${VARIANTS[variant] || VARIANTS.secondary} ${className}`.trim();
  if (props.href) {
    return (
      <a className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
```

Key changes: removed `accent` variant (merged into `primary` since both are now blue), `primary` uses `bg-accent` (which is now `#2563EB`), `secondary` uses `bg-warm`, added `ghost` variant, added `outline` variant with accent border.

- [ ] **Step 2: Commit**

```bash
git add app/components/ui/Button.jsx
git commit -m "refactor: Button — merge primary/accent, add ghost variant, new accent blue"
```

---

### Task 7: Run build to verify foundation changes

**Files:** None

- [ ] **Step 1: Run build**

```bash
npm run build 2>&1 | head -50
```

Expected: Build succeeds. There will likely be Tailwind warnings about removed classes (`bg-cta`, `bg-hero`, etc.) in components not yet updated — that's expected and will be fixed in Chunk 2.

- [ ] **Step 2: If build fails, fix any breaking references and re-commit**

---

## Chunk 2: Bulk renames and weight cleanup

### Task 8: Rename `bg="bg-hero"` → `bg="bg-warm"` across all pages

**Files:**
- Modify: `app/page.jsx` (~8 occurrences)
- Modify: `app/pricing/page.jsx`
- Modify: `app/developers/page.jsx`
- Modify: `app/privacy/page.jsx`
- Modify: All SEO pages and `mentions-legales`

- [ ] **Step 1: Bulk find-replace `bg="bg-hero"` → `bg="bg-warm"` across all JSX files**

```bash
grep -rl 'bg="bg-hero"' app/ | grep -v node_modules | head -20
```

Then for each file, replace `bg="bg-hero"` with `bg="bg-warm"`.

- [ ] **Step 2: Bulk find-replace `bg-[var(--color-bg-hero)]` → `bg-[var(--color-bg-warm)]` across all JSX**

```bash
grep -rl 'color-bg-hero' app/ --include='*.jsx' --include='*.tsx' | head -20
```

Replace all occurrences.

- [ ] **Step 3: Bulk find-replace `bg-hero` (Tailwind class) → `bg-warm`**

```bash
grep -rn 'bg-hero' app/ --include='*.jsx' | grep -v 'color-bg-hero' | head -20
```

Replace Tailwind class references (e.g., `hover:bg-hero` → `hover:bg-warm`).

- [ ] **Step 4: Replace `bg-cta` / `text-cta` / `text-cta-text` / `hover:bg-cta-hover` references**

```bash
grep -rn 'bg-cta\|text-cta\|hover:bg-cta' app/ --include='*.jsx' | head -30
```

Replace: `bg-cta` → `bg-accent`, `text-cta-text` → `text-white`, `text-cta` → `text-accent`, `hover:bg-cta-hover` → `hover:bg-accent-hover`, `bg-cta/[0.06]` → `bg-accent/[0.06]`, `border-cta` → `border-accent`.

- [ ] **Step 5: Verify no remaining stale references**

```bash
grep -rn 'bg-hero\|cta-bg\|cta-text\|cta-hover\|bg-cta\|text-cta\|border-cta' app/ --include='*.jsx' --include='*.mjs' --include='*.css' | grep -v node_modules | head -20
```

Expected: no matches (except possibly test files).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: rename bg-hero→bg-warm, merge cta→accent across all components"
```

---

### Task 9: Font weight cleanup

**Files:**
- Modify: All files containing `font-[650]`, `font-bold`, `font-[700]`

- [ ] **Step 1: Replace `font-[650]` → `font-semibold` everywhere**

```bash
grep -rl 'font-\[650\]' app/ --include='*.jsx' | head -20
```

Replace all occurrences.

- [ ] **Step 2: Replace `font-bold` → `font-semibold` everywhere**

```bash
grep -rl 'font-bold' app/ --include='*.jsx' | head -20
```

Replace all occurrences. Note: `font-bold` in Tailwind is weight 700 → changing to `font-semibold` (600).

- [ ] **Step 3: Replace `font-[700]` → `font-semibold` everywhere**

```bash
grep -rl 'font-\[700\]' app/ --include='*.jsx' | head -20
```

- [ ] **Step 4: Replace `text-[11px]` → `text-[13px]` everywhere**

```bash
grep -rn 'text-\[11px\]' app/ --include='*.jsx' | head -10
```

Locations: `page.jsx` ROI slider labels, `ProofShowcase.jsx`.

- [ ] **Step 5: Verify cleanup**

```bash
grep -rn 'font-\[650\]\|font-\[700\]\|font-\[620\]\|text-\[11px\]' app/ --include='*.jsx' | head -10
```

Expected: no matches.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: standardize font weights to 400/600, fix text-[11px]→13px"
```

---

### Task 10: Max-width cleanup

**Files:**
- Modify: Files with inline `max-w-[1440px]`, `max-w-[1360px]`, `max-w-[1200px]`, `max-w-wide`, `max-w-narrow` (old), `max-w-tight`

- [ ] **Step 1: Find all inline max-width values**

```bash
grep -rn 'max-w-\[1440\|max-w-\[1360\|max-w-\[1240\|max-w-\[1200\|max-w-wide\|max-w-tight' app/ --include='*.jsx' | head -20
```

- [ ] **Step 2: Replace with tokens**

- `max-w-[1440px]` → `max-w-content` (if main content) or remove
- `max-w-[1360px]` → `max-w-content`
- `max-w-[1240px]` → `max-w-content`
- `max-w-[1200px]` → `max-w-content`
- `max-w-wide` → `max-w-content`
- `max-w-tight` → `max-w-narrow`

Note: `max-w-narrow` was 1240px (old), is now 860px. Check each usage — if it was using old `narrow` (1240px), it should become `max-w-content` (1200px). If it was using `tight` (860px), it becomes `max-w-narrow`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: consolidate max-widths to content(1200) + narrow(860)"
```

---

### Task 11: Badge consolidation

**Files:**
- Modify: `app/components/ui/Badge.jsx`
- Delete: `app/components/Badge.jsx`
- Modify: `app/components/PlanCard.jsx` (update import)

- [ ] **Step 1: Check what variants the legacy Badge has**

Read `app/components/Badge.jsx` and merge its `popular` variant into `app/components/ui/Badge.jsx`.

- [ ] **Step 2: Update `app/components/ui/Badge.jsx` to include all variants**

Ensure variants: `default`, `accent`, `success`, `popular`.

- [ ] **Step 3: Update imports**

In `PlanCard.jsx`, change `import Badge from './Badge'` to `import Badge from './ui/Badge'`.

- [ ] **Step 4: Delete `app/components/Badge.jsx`**

- [ ] **Step 5: Verify no remaining imports of old Badge**

```bash
grep -rn "from.*'./Badge'" app/components/ --include='*.jsx' | head -10
```

Expected: no matches (all should use `./ui/Badge`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: consolidate Badge into single ui/Badge component"
```

---

### Task 12: Build verification

- [ ] **Step 1: Run build**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run tests**

```bash
npm test 2>&1 | tail -30
```

Fix any test failures related to color changes, class renames, or token updates. Tests may reference `bg-accent` expecting navy — update to expect blue.

- [ ] **Step 3: Commit any test fixes**

```bash
git add -A
git commit -m "test: update test expectations for new design tokens"
```

---

### Task 12b: Typography clamp() migration

**Files:**
- Modify: All files with `sm:text-[2.5rem]` or similar breakpoint-based font sizes (11+ files)

- [ ] **Step 1: Find all breakpoint-based heading sizes**

```bash
grep -rn 'sm:text-\[2\.5rem\]\|sm:text-\[2rem\]\|md:text-5xl\|sm:text-3xl\|sm:text-4xl' app/ --include='*.jsx' | head -20
```

- [ ] **Step 2: Replace with clamp() values for h2 headings**

For section h2 headings (most common pattern `text-3xl sm:text-[2.5rem]`), replace with:

```jsx
className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight"
```

For display-level headings, use:

```jsx
className="text-[clamp(2.5rem,5vw,4rem)] font-semibold tracking-tight"
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: replace breakpoint typography with clamp() fluid scaling"
```

---

### Task 12c: Border-radius consolidation

**Files:**
- Modify: `app/globals.css` (apple-grid-card: 20px → 16px)
- Modify: `app/components/Card.jsx` (verify rounded-xl maps to 16px after Tailwind config change)

- [ ] **Step 1: Update apple-grid-card border-radius in globals.css**

Find `border-radius: 20px` in `.apple-grid-card` and change to `border-radius: 16px`.

- [ ] **Step 2: Verify Card component uses rounded-xl (now 16px)**

The `GLASS_CARD_BASE_CLASS` in `Card.jsx` uses `rounded-xl` which now maps to `16px` (changed in Task 3). Verify this is correct.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: standardize border-radius to 16px everywhere"
```

---

### Task 12d: Glass morphism audit

**Files:**
- Modify: `app/components/Card.jsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Check which cards use glass morphism in cream zones**

```bash
grep -rn 'glass' app/components/ --include='*.jsx' | head -20
```

- [ ] **Step 2: Make glass conditional on dark zones**

For cards that appear in cream/light zones, replace `glass` class with opaque white card styling: `bg-[var(--color-bg)] border border-[var(--color-border)]`. Keep `glass` only for components in the apple-grid dark zone.

If the Card component uses `glass` universally via `GLASS_CARD_BASE_CLASS`, consider adding a `variant` prop or using `glass` only when parent has dark bg.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: limit glass morphism to dark zones, opaque cards in cream zones"
```

---

## Chunk 3: CSS animations and hover cleanup

### Task 13: Remove heroLineIn and update hover patterns in globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Find and remove `heroLineIn` keyframe**

```bash
grep -n 'heroLineIn' app/globals.css
```

Remove the `@keyframes heroLineIn` block and any `animation: heroLineIn` references.

- [ ] **Step 2: Update `.apple-grid-card:hover`**

Find the `.apple-grid-card:hover` rule (~line 339). Remove `translateY(-2px)`. Change transition timing to `200ms`. Apply border-color transition:

```css
.apple-grid-card {
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.apple-grid-card:hover {
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.10);
}
```

- [ ] **Step 3: Update `.feature-card-hover:hover`**

Find `.feature-card-hover` (~line 366). Remove `translateY(-3px)`. Change timing to `200ms`:

```css
.feature-card-hover {
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.feature-card-hover:hover {
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 40px rgba(0, 0, 0, 0.08);
}
```

- [ ] **Step 4: Remove `--max-width: 960px` from `:root` if still present**

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "refactor: remove heroLineIn, update hover patterns to border-color transitions"
```

---

### Task 14: Update FaqAccordion animation

**Files:**
- Modify: `app/components/FaqAccordion.jsx:68,83`

- [ ] **Step 1: Update font weight**

Line 68: `font-[650]` → `font-semibold`

- [ ] **Step 2: Change accordion animation from max-height to grid**

Replace the answer panel div (line 79-88):

```jsx
<div
  id={panelId}
  role="region"
  aria-labelledby={buttonId}
  className="grid transition-[grid-template-rows,opacity] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0 }}
>
  <div className="overflow-hidden">
    <p className="px-1 pb-1 pt-3 text-sm leading-relaxed text-muted">
      {item.a}
    </p>
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add app/components/FaqAccordion.jsx
git commit -m "refactor: FAQ accordion — grid-rows animation, font-semibold"
```

---

## Chunk 4: Hero dark mode + Navigation

### Task 15: Hero dark background

**Files:**
- Modify: `app/page.jsx` (hero section wrapper)
- Modify: `app/components/HeroHeadline.jsx` (gradient shimmer colors)
- Modify: `app/globals.css` (hero-related styles)

- [ ] **Step 1: Identify how the hero section is structured in page.jsx**

Read the hero section in `app/page.jsx` to understand how to apply dark background. Look for `data-testid="hero-section"`.

- [ ] **Step 2: Apply dark background to hero section**

The hero section wrapper should get `bg-[#0A0A0B]` and `text-white` classes. This is a hardcoded dark zone regardless of theme toggle.

- [ ] **Step 3: Invert hero gradient shimmer for dark bg**

In `app/components/HeroHeadline.jsx`, update the `.hero-accent` gradient colors. The shimmer must use light colors on dark background. Update in `globals.css` where `.hero-accent` or `.hero-accent--sections` gradient is defined:

```css
.hero-accent--sections {
  background: linear-gradient(135deg, #F1F0ED 0%, #3B82F6 50%, #F1F0ED 100%);
  background-size: 200% 200%;
  background-position: 0% 50%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 4: Update hero bracket and text colors for dark bg**

In `HeroHeadline.jsx`, the brackets use `text-[var(--color-text)]` and `stroke="var(--color-text)"`. On the dark hero, these need to be white. Use `text-white` on the bracket row, or add a CSS class scoping.

- [ ] **Step 5: Update hero subtitle styling**

Make subtitle 22px, weight 400, color `rgba(255,255,255,0.6)`. Update the subtitle element in `page.jsx`.

- [ ] **Step 6: Update hero CTAs to pill style on dark bg**

Primary: `<Button variant="primary">Try it free</Button>` (already pill blue).
Secondary: Use `outline` variant with white text override for dark bg.

- [ ] **Step 7: Update hero entrance animation timing**

In `globals.css`, find `.hero-headline-line` animation and change to `800ms` Flow tier:

```css
.hero-headline-line {
  animation: heroFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

Stagger with `animation-delay` on successive `.hero-headline-line` elements: 0s, 0.06s, 0.12s, etc.

- [ ] **Step 8: Reduce background lines opacity**

In `app/components/HeroIllustration.jsx`, reduce base opacity of lines (the `opacity` calc) by ~40%. Change `0.08 + distFromCenter * 0.5` to `0.05 + distFromCenter * 0.3`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: dark hero section — inverted shimmer, white text, 800ms entrance"
```

---

### Task 16: Navigation scroll behavior

**Files:**
- Modify: `app/components/SiteHeader.jsx`

- [ ] **Step 1: Implement IntersectionObserver for hero boundary**

Replace the `scrollY > SCROLL_THRESHOLD` approach with an IntersectionObserver that watches the hero section:

```jsx
const [pastHero, setPastHero] = useState(false);

useEffect(() => {
  const hero = document.querySelector('[data-testid="hero-section"]');
  if (!hero) return;
  const observer = new IntersectionObserver(
    ([entry]) => setPastHero(!entry.isIntersecting),
    { threshold: 0 }
  );
  observer.observe(hero);
  return () => observer.disconnect();
}, []);
```

- [ ] **Step 2: Update header styling based on pastHero (height: 52px)**

```jsx
<header
  className={cn(
    'fixed left-0 right-0 top-0 z-50 w-full h-[52px] flex items-center transition-all duration-300 ease-out',
    pastHero
      ? 'bg-[var(--color-bg-warm)]/80 backdrop-blur-xl'
      : 'bg-transparent',
    pastHero ? 'text-[var(--color-text)]' : 'text-white',
  )}
>
```

On dark hero: transparent bg, white text links.
Past hero (cream zone): frosted glass `bg-warm/80` + backdrop-blur, normal text color.

- [ ] **Step 3: Update nav link colors for hero state**

Desktop nav links need conditional coloring:
- On hero: `text-white/70 hover:text-white`
- Past hero: `text-[var(--color-muted)] hover:text-[var(--color-text)]`

- [ ] **Step 4: Commit**

```bash
git add app/components/SiteHeader.jsx
git commit -m "feat: nav — transparent on dark hero, frosted glass on scroll"
```

---

### Task 16b: Zone layout — remove zebra-stripes, apply dark/cream zones

**Files:**
- Modify: `app/page.jsx`

- [ ] **Step 1: Identify current section bg assignments**

Read through `app/page.jsx` and list every `<Section bg="bg-warm">` vs `<Section bg="bg-white">`. Currently most sections alternate `bg-warm`/`bg-white` — the zebra-stripe pattern.

- [ ] **Step 2: Restructure into zones**

Per spec zone layout:
- **Hero zone (dark):** Already handled by Task 15 (dark hero bg)
- **Proof + Features zone (cream):** All sections between hero and apple-grid should be `bg="bg-warm"` consistently (no alternation)
- **Apple-grid zone (dark):** Already dark — keep as-is
- **Pricing + FAQ zone (cream):** All sections after apple-grid and before footer should be `bg="bg-warm"` consistently
- **Footer zone (dark):** Handled by Task 17

Set all cream-zone sections to `bg="bg-warm"` — remove any `bg="bg-white"` that creates zebra alternation within a zone.

- [ ] **Step 3: Verify hard cuts between zones**

There should be no gradient or fade between dark and cream zones — just a hard bg change. The `<Section>` component handles bg per section, so adjacent sections with the same bg create a continuous zone naturally.

- [ ] **Step 4: Commit**

```bash
git add app/page.jsx
git commit -m "feat: zone layout — continuous cream zones, no more zebra-stripes"
```

---

## Chunk 5: Footer and pricing refinements

### Task 17: Footer redesign

**Files:**
- Modify: `app/components/SiteFooter.jsx`

- [ ] **Step 1: Read current footer**

Read `app/components/SiteFooter.jsx` to understand current structure.

- [ ] **Step 2: Rewrite footer with dark bg, 2-column layout**

Apply dark bg `bg-[#0A0A0B]`, 2-column layout:
- Left: logo, tagline, CTA pill
- Right: link columns (Product, Company)
- Bottom: separator `border-t border-white/[0.08]`, copyright + email

Remove the `mailto:` newsletter form entirely. Replace with CTA button.

- [ ] **Step 3: Ensure footer links use `text-white/50 hover:text-white`**

- [ ] **Step 4: Commit**

```bash
git add app/components/SiteFooter.jsx
git commit -m "feat: footer — dark bg, 2-column layout, remove mailto form"
```

---

### Task 18: Featured pricing card styling

**Files:**
- Modify: `app/components/PlanCard.jsx`

- [ ] **Step 1: Read PlanCard component**

- [ ] **Step 2: Update featured card styling**

Remove `scale-105` on featured cards. Add tinted blue background and blue border:

```jsx
// Featured card
className={cn(
  'rounded-2xl border p-6',
  featured
    ? 'bg-accent/[0.05] border-accent/20'
    : 'bg-[var(--color-bg)] border-[var(--color-border)]'
)}
```

- [ ] **Step 3: Update CTA buttons in pricing cards**

Featured: `<Button variant="primary">` (blue pill).
Others: `<Button variant="outline">` (ghost with accent border).

- [ ] **Step 4: Commit**

```bash
git add app/components/PlanCard.jsx
git commit -m "feat: pricing cards — tinted blue featured, same size, pill CTAs"
```

---

## Chunk 6: Proof Showcase and final polish

### Task 19: ProofShowcase refinements

**Files:**
- Modify: `app/components/ProofShowcase.jsx`

- [ ] **Step 1: Read current ProofShowcase layout**

- [ ] **Step 2: Update to 50/50 grid**

Change `grid-cols-[38fr_62fr]` to `grid-cols-2` for equal width columns.

- [ ] **Step 3: Update image styling**

Apply `rounded-2xl` (16px) and shadow `shadow-[0_8px_32px_rgba(0,0,0,0.08)]` to images.

- [ ] **Step 4: Commit**

```bash
git add app/components/ProofShowcase.jsx
git commit -m "refactor: ProofShowcase — 50/50 grid, 16px radius, softer shadows"
```

---

### Task 19b: Upload section gradient review

**Files:**
- Modify: `app/globals.css` (lines ~211-284, upload section styles)

- [ ] **Step 1: Review upload section gradients**

Check the upload section background gradients in `globals.css` (`.upload-section-bg` and related classes). Verify they harmonize with the new cream/dark palette. The upload section sits in a cream zone — its gradients should complement `#FAF8F5`.

- [ ] **Step 2: Adjust gradient values if needed**

If gradients reference old colors (navy `#0F172A` as accent), update to use the new blue accent `#2563EB` tints.

- [ ] **Step 3: Commit (if changes made)**

```bash
git add app/globals.css
git commit -m "refactor: harmonize upload section gradients with new palette"
```

---

### Task 20: Update test expectations

**Files:**
- Modify: `app/__tests__/landing.ui.test.jsx`
- Modify: `app/__tests__/pricing.ui.test.jsx`
- Modify: `app/__tests__/uploadCard.ui.test.jsx`
- Modify: `app/__tests__/designTokenGuard.test.mjs`
- Modify: Any other failing tests (likely `shell.nav.test.jsx`, `navbar.ui.test.jsx`, `heroHeadlineAccent.ui.test.jsx`, `pricingHighlight.test.jsx`)

- [ ] **Step 1: Run all tests to see what fails**

```bash
npm test 2>&1 | tail -50
```

- [ ] **Step 2: Fix each failing test**

Common fixes:
- `bg-accent` expectations: now blue instead of navy
- `bg-hero` → `bg-warm` class references
- `max-w-content` values (1200 not 1360)
- Font weight expectations (600 not 700)
- Token guard values (new palette)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: update all test expectations for design audit changes"
```

---

### Task 21: Full build + visual verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: success, no errors.

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 3: Start dev server and visually verify**

Start the dev server and verify:
- Hero: dark bg, white text, blue shimmer, bracket animation works
- Nav: transparent on hero, frosted glass on scroll
- Proof showcase: 50/50 grid, rounded images
- Cards: no translateY hover, border-color transitions
- Pricing: featured card has blue tint, no scale
- Footer: dark bg, 2 columns, CTA pill
- FAQ: grid-rows animation works smoothly
- Dark mode toggle: cream zones switch to dark, hero/apple-grid/footer stay dark

- [ ] **Step 4: Fix any visual issues found**

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "polish: fix visual issues from design audit verification"
```
