# Full Site Audit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring fitforpdf.com to 2026 standards — fix visual inconsistencies, add dark mode, social proof, marketing features, content pages, and micro-interactions.

**Architecture:** CSS custom properties + `[data-theme="dark"]` for dark mode. Shared page templates for content pages. Interactive API widget using existing `/api/render` endpoint. ROI calculator as standalone component.

**Tech Stack:** Next.js App Router, Tailwind CSS, GSAP (existing), CSS custom properties, localStorage for theme persistence.

---

## Phase 1: Visual Fixes & Polish

### Task 1: Fix comparison table mobile overflow

**Files:**
- Modify: `app/page.jsx` (lines 336-360, the `#comparison` section table)

**Step 1:** Wrap the table in a scrollable container and add a mobile-friendly stacked layout.

In `app/page.jsx`, find the comparison section table. Replace the outer div with:
```jsx
<div className="overflow-x-auto rounded-2xl border border-black/10">
```

Add responsive text sizing to table cells — on mobile (`text-xs`) scaling up to `sm:text-sm`. Also add `min-w-[640px]` to the `<table>` element so it scrolls horizontally on very narrow screens rather than clipping.

**Step 2:** Verify on mobile viewport (375px) that the table scrolls without clipping.

**Step 3:** Commit — `fix: comparison table mobile overflow`

---

### Task 2: Fix hero mobile spacing and headline clipping

**Files:**
- Modify: `app/components/HeroHeadline.jsx` (line 198)

**Step 1:** The headline uses `text-[2.25rem]` on mobile which is too wide for 375px with brackets. Change to `text-[1.875rem] sm:text-[2.25rem] md:text-5xl`. Add `px-2` to the headline wrapper to prevent edge clipping.

**Step 2:** For the empty space above hero on mobile — check if the scroll spacer height is causing it. The hero uses a sticky scroll pattern; on mobile the spacer may be too tall. In `PageHero.jsx`, check if there's a min-height or spacer that can be reduced for mobile.

**Step 3:** Verify on mobile viewport — headline should not clip, no large empty space above.

**Step 4:** Commit — `fix: hero headline mobile spacing and clipping`

---

### Task 3: Fix glass system inconsistency

**Files:**
- Modify: `app/globals.css` (lines 88-93)

**Step 1:** Differentiate `glass-elevated` from `glass`:
```css
.glass-elevated {
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: rgba(255, 255, 255, 0.65);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
```

**Step 2:** Commit — `fix: differentiate glass-elevated from glass tier`

---

### Task 4: Font-weight consistency in PlanCards

**Files:**
- Modify: `app/components/PlanCard.jsx` (line ~153)

**Step 1:** The feature list `<ul>` uses default weight (400). Add `font-medium` to match the rest of the site's feature list styling:
```jsx
<ul className="flex-1 space-y-2.5 text-sm font-medium text-slate-700">
```

**Step 2:** Commit — `fix: consistent font-weight in pricing feature lists`

---

### Task 5: Reusable badge system

**Files:**
- Create: `app/components/ui/Badge.jsx`

**Step 1:** Create a Badge component with 3 variants:
```jsx
import cn from '../../lib/cn.mjs';

const VARIANTS = {
  default: 'border-black/10 bg-black/[0.03] text-black/60',
  accent: 'border-cta/20 bg-cta/[0.06] text-cta',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em]',
      VARIANTS[variant],
      className,
    )}>
      {children}
    </span>
  );
}
```

**Step 2:** Replace the hero "ENGINE FOR WIDE TABLES" badge to use this component. Update other badge usages (pricing badges) for consistency.

**Step 3:** Commit — `feat: reusable Badge component with variants`

---

### Task 6: Sticky CTA on mobile

**Files:**
- Create: `app/components/StickyMobileCTA.jsx`
- Modify: `app/page.jsx` (add component at bottom)

**Step 1:** Create a sticky bottom bar that appears on mobile when the hero CTA scrolls out of view:
```jsx
'use client';
import { useEffect, useState } from 'react';

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white/90 px-4 py-3 backdrop-blur-lg sm:hidden">
      <a
        href="/#tool"
        className="flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-semibold text-white"
      >
        Upload a file
      </a>
    </div>
  );
}
```

**Step 2:** Verify on mobile — bar appears after scrolling past hero, disappears at top.

**Step 3:** Commit — `feat: sticky mobile CTA bar`

---

### Task 7: Skeleton loading for ProofShowcase images

**Files:**
- Modify: `app/components/ProofShowcase.jsx` (image sections around lines 314-319)

**Step 1:** Add a skeleton placeholder that shows before images load. Wrap each `<img>` with a loading state using `onLoad` callback and animated placeholder div.

**Step 2:** Commit — `feat: skeleton loading for proof showcase images`

---

### Task 8: "Who this is for" section icons

**Files:**
- Modify: `app/page.jsx` (the "who-this-is-for" section)

**Step 1:** Add inline SVG icons for each category in the "Works with" / "Not designed for" cards. Use simple 20x20 stroke-based SVGs matching existing icon style.

**Step 2:** Commit — `feat: add category icons to "Who this is for" section`

---

## Phase 2: Dark Mode

### Task 9: Dark mode CSS variables

**Files:**
- Modify: `app/globals.css` (after `:root` block, line ~45)

**Step 1:** Add dark theme variables:
```css
[data-theme="dark"] {
  --color-accent: #E2E8F0;
  --color-accent-hover: #F1F5F9;
  --color-text: #E2E8F0;
  --color-muted: #94A3B8;
  --color-border: rgba(255, 255, 255, 0.10);
  --color-bg: #0F1117;
  --color-bg-hero: #161822;
  --color-cta-bg: #3B82F6;
  --color-cta-text: #FFFFFF;
  --color-cta-hover: #2563EB;
  --color-badge-free: #1E293B;
  --color-badge-hot: #1E3A5F;
}

[data-theme="dark"] body {
  background: var(--color-bg);
  color: var(--color-text);
}
```

**Step 2:** Update glass system for dark mode with inverted opacities.

**Step 3:** Commit — `feat: dark mode CSS custom properties`

---

### Task 10: Theme toggle component

**Files:**
- Create: `app/components/ThemeToggle.jsx`

**Step 1:** Create toggle with sun/moon SVG icons. Uses `localStorage` for persistence and `prefers-color-scheme` for initial value. Sets `data-theme` attribute on `document.documentElement`.

**Step 2:** Commit — `feat: theme toggle component`

---

### Task 11: Integrate theme toggle into header + FOUC prevention

**Files:**
- Modify: `app/components/SiteHeader.jsx` (line ~68, before CTA button)
- Modify: `app/layout.js` (add inline script in head for FOUC prevention)

**Step 1:** Import and add `<ThemeToggle />` in the desktop nav and mobile menu.

**Step 2:** Add an inline script in `<head>` of layout.js that reads localStorage and sets `data-theme` before React hydrates — this prevents flash of light theme on dark-mode users. Use a Next.js `<Script strategy="beforeInteractive">` component for safe inline script injection.

**Step 3:** Commit — `feat: integrate dark mode toggle in header`

---

### Task 12: Audit all hardcoded colors for dark mode

**Files:**
- Modify: Multiple components

**Step 1:** Search and replace hardcoded colors with CSS variable equivalents. Key files:
- `SiteHeader.jsx`: `bg-[#FAF8F5]` → `bg-[var(--color-bg-hero)]`
- `SiteFooter.jsx`: `text-black/50` → `text-[var(--color-muted)]`
- `app/layout.js`: body classes
- `PlanCard.jsx`: `text-slate-700` → variable-based
- `UploadCard.jsx`: hardcoded whites and blacks
- `page.jsx`: all `bg-hero`, `text-black`, `bg-white` references
- All other components with hardcoded color values

**Step 2:** Test dark mode toggle — all pages readable with no white-on-white or black-on-black text.

**Step 3:** Commit — `feat: audit and fix hardcoded colors for dark mode`

---

## Phase 3: Social Proof & Marketing

### Task 13: Wall of Love — anonymous quotes section

**Files:**
- Create: `app/components/WallOfLove.jsx`
- Modify: `app/page.jsx` (add section between FAQ and footer)
- Modify: `app/siteCopy.mjs` (add quote data)

**Step 1:** Add 5 anonymous quotes to siteCopy.mjs — realistic quotes from audit, SaaS, finance, consulting, engineering personas.

**Step 2:** Create WallOfLove component — grid of glass cards with quote, role, company. Staggered scroll animation.

**Step 3:** Commit — `feat: Wall of Love anonymous testimonials section`

---

### Task 14: Use-case cards

**Files:**
- Create: `app/components/UseCaseCards.jsx`
- Modify: `app/page.jsx` (replace or augment "who-uses" section)

**Step 1:** Create 4 cards: Audit Firms, SaaS Reporting, Finance Teams, Consultants. Each with icon, title, before→after stat, time saved.

**Step 2:** Commit — `feat: use-case cards with specific metrics`

---

### Task 15: Interactive API teaser widget on homepage

**Files:**
- Create: `app/components/ApiTeaser.jsx`
- Modify: `app/page.jsx` (replace text-only API teaser)

**Step 1:** Build widget: left panel code block (curl/JS/Python tabs, CSS-only syntax highlighting), right panel result area. "Run" button POSTs sample to `/api/sample/premium`. Shows PDF result inline.

**Step 2:** Add syntax highlight CSS classes in globals.css for both light/dark themes.

**Step 3:** Commit — `feat: interactive API teaser widget on homepage`

---

### Task 16: ROI Calculator in pricing

**Files:**
- Create: `app/components/RoiCalculator.jsx`
- Modify: `app/pricing/page.jsx` or `app/components/PricingToggleSection.jsx`

**Step 1:** Slider: "exports per month" (1-500). Hourly rate input (default $75). Displays: hours saved, money saved, recommended plan with cost comparison. Animated number transitions.

**Step 2:** Commit — `feat: ROI calculator on pricing page`

---

### Task 17: Enterprise tier placeholder

**Files:**
- Modify: `app/siteCopy.mjs` (add enterprise plan data)
- Modify: `app/components/PricingToggleSection.jsx`

**Step 1:** Add Enterprise card: "Custom" price, features (SLA, SSO, dedicated support), CTA "Contact us".

**Step 2:** Commit — `feat: enterprise tier placeholder in pricing`

---

### Task 18: Changelog page

**Files:**
- Create: `app/changelog/page.jsx`
- Create: `app/changelog/layout.js`

**Step 1:** Simple timeline page with 3 placeholder entries (Launch, Pro Plan, API Beta). Date on left, title + description on right.

**Step 2:** Commit — `feat: changelog page with placeholder entries`

---

### Task 19: Footer enrichment

**Files:**
- Modify: `app/components/SiteFooter.jsx`

**Step 1:** Add social links (LinkedIn, X/Twitter icons), changelog link in Product column, newsletter signup (email input + submit button, UI only).

**Step 2:** Commit — `feat: enriched footer with social links and newsletter`

---

## Phase 4: Content Pages

### Task 20: Shared VsPage template

**Files:**
- Create: `app/components/VsPage.jsx`

**Step 1:** Reusable comparison page: hero ("fitforpdf vs {competitor}"), comparison table, code example section, CTA.

**Step 2:** Commit — `feat: VsPage shared template`

---

### Task 21: Comparison pages (3)

**Files:**
- Create: `app/vs/wkhtmltopdf/page.jsx` + `layout.js`
- Create: `app/vs/puppeteer/page.jsx` + `layout.js`
- Create: `app/vs/reportlab/page.jsx` + `layout.js`

**Step 1:** Each page uses VsPage template with competitor-specific comparison rows and code examples showing complexity vs fitforpdf simplicity.

**Step 2:** Add to sitemap.js and footer Resources.

**Step 3:** Commit — `feat: comparison pages vs wkhtmltopdf, puppeteer, reportlab`

---

### Task 22: Shared VerticalPage template

**Files:**
- Create: `app/components/VerticalPage.jsx`

**Step 1:** Reusable industry landing: contextualized hero, problem section, solution, features subset, pricing CTA.

**Step 2:** Commit — `feat: VerticalPage shared template`

---

### Task 23: Vertical landing pages (4)

**Files:**
- Create: `app/for/audit-firms/page.jsx` + `layout.js`
- Create: `app/for/saas-reporting/page.jsx` + `layout.js`
- Create: `app/for/finance-teams/page.jsx` + `layout.js`
- Create: `app/for/consultants/page.jsx` + `layout.js`

**Step 1:** Industry-specific content for each. Add to sitemap.js and footer.

**Step 2:** Commit — `feat: vertical landing pages for 4 industries`

---

## Phase 5: Micro-Interactions & Final Polish

### Task 24: Page transitions

**Files:**
- Create: `app/loading.jsx`

**Step 1:** Minimal loading spinner for page transitions.

**Step 2:** Commit — `feat: page transition loading state`

---

### Task 25: Success animation post-generation

**Files:**
- Modify: `app/components/UploadCard.jsx` (result/download state)
- Modify: `app/globals.css` (checkmark draw animation)

**Step 1:** Animated checkmark SVG on successful generation (stroke-dasharray draw-on effect). Download button fade-in with translateY.

**Step 2:** Commit — `feat: success animation after PDF generation`

---

### Task 26: Feature card hover previews

**Files:**
- Modify: `app/page.jsx` (features section)
- Modify: `app/globals.css` (hover expand CSS)

**Step 1:** Extend feature cards with hidden description that reveals on hover (max-height + opacity transition).

**Step 2:** Commit — `feat: feature card hover expand effect`

---

### Task 27: Final dark mode testing & fixes

**Step 1:** Navigate every page in dark mode and fix remaining issues.
**Step 2:** Test mobile dark mode.
**Step 3:** Commit — `fix: dark mode polish pass`

---

## Verification

After all phases:
1. `npm run build` — no build errors
2. `npm test` — existing tests pass
3. Preview every page at desktop (1280px) and mobile (375px)
4. Toggle dark mode on every page
5. Test API teaser widget with sample file
6. Test ROI calculator slider
7. Verify all new pages in sitemap
8. Check footer links
9. Lighthouse audit on homepage
