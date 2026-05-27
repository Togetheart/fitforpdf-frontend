# Mobile Funnel Audit — fitforpdf

**Date:** 2026-05-26
**Trigger:** PostHog reported 29% mobile visitors but only ~10% of total page-views,
meaning mobile users were dropping off after ~1 page vs ~8 pages on desktop.
**Method:** Static analysis of the upload funnel components + landing-page anchors.

---

## 🚨 BLOCKER FIXED — `/#tool` anchor was dead

**Severity:** Critical — affected every "Try free" CTA on the site.

The site has 11 CTAs linking to `/#tool` (Sticky mobile CTA, header, footer,
SeoArticle template, ExampleCard, ProofShowcase, /about, /audit-report-tips,
/examples, /developers). **None of them worked**: there is no element with
`id="tool"` on the landing page. The upload pill uses `id="generate"`.

So when a mobile user (or anyone) tapped "Try free", the page scrolled to the
very top instead of the upload pill — invisible failure with massive funnel
impact. Particularly bad on mobile because the upload pill sits below the fold.

✅ **Fixed** in this audit: replaced all `/#tool` with `/#generate` across 9 files.

---

## ✅ Mobile UX papercuts fixed

| # | Issue | Fix | File |
|---|---|---|---|
| 1 | Dropzone copy said "Drop here / click to upload" — meaningless on touch | Show "Tap to choose a CSV or XLSX file" on mobile via `sm:hidden` swap | `UploadDropzone.jsx` |
| 2 | `accept=".csv,.xlsx"` — iOS Safari sometimes filters out valid files in Files/Mail pickers (no MIME) | Added MIME types: `text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `UploadDropzone.jsx` |
| 3 | Remove-file (X) button was `p-0.5` — hit target ~18px (iOS HIG minimum is 44px) | Bumped to `p-2` | `UploadDropzone.jsx` |
| 4 | "Generating…" text hidden on mobile (`hidden sm:inline`) — only the spinner was visible. Silent UI = anxiety | Always show label | `UploadCard.jsx` |

---

## 🟡 Findings not auto-fixed (need design/product decision)

### 1. Tap targets still small in several places
- Gear button (Advanced options): `h-9 w-9` = 36px (close to but below 44px iOS HIG)
- Header hamburger: `h-9 w-9` = 36px (same)
- These pass WCAG AA (24px) but fail Apple HIG. Suggest bumping to `h-11 w-11` (44px).

### 2. Step indicator wraps badly on mobile
`UploadCard.jsx:54-88` renders 3 horizontal columns with text labels:
- "Uploading"
- "Structuring (column grouping)" ← wraps to 2 lines on small screens
- "Generating PDF"

Suggest: hide labels on mobile (`hidden sm:inline`), show only numbered circles +
the current step's label below.

### 3. Sticky mobile CTA may obscure content
`StickyMobileCTA.jsx` shows a 56px-tall bar over the bottom of the viewport once
`scrollY > 600`. It can cover the final CTA on short-content pages and the
contact form on `/contact`. Suggest: add `pb-20 sm:pb-0` to `<main>` containers
on mobile-heavy pages, OR auto-hide the bar when scrolled past `data-cta-zone`.

### 4. Hero image on `/developers` is unoptimised for mobile
`<img src="/brand-origami.png" className="h-48 sm:h-56" />` — full-width PNG with
no `srcset`, no `sizes`, no `loading="lazy"`. On a 3G mobile this could be 200KB+
above the fold. Suggest: convert to `.webp` + add `loading="lazy"` if it's not
the LCP element, OR `<Image>` from `next/image` for automatic responsive sizing.

### 5. Forms not optimised for mobile keyboards
The `/developers` request-access form and `/contact` form don't set
`inputMode="email"` or `autoComplete` hints. iOS shows the generic keyboard
when it could show the email-optimised one. Easy win.

### 6. PostHog tracks localhost in production
Out of audit scope but reported earlier: `localhost:3001` and `localhost:3002`
appear in the PostHog referring-domain list, meaning dev sessions hit prod
analytics. Fix in `PostHogProvider.jsx`:

```js
if (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)/.test(window.location.hostname)) {
  return; // skip init in local dev
}
```

---

## 📋 Suggested follow-up plan (impact-ranked)

1. **Manual mobile QA pass on real iPhone + Android** (15min) — verify the
   `/#generate` fix is now reaching the upload pill, and the "Tap to choose"
   copy lands cleanly. The static fixes above should remove the funnel block.
2. **Bump tap targets** (10min) — `h-9 w-9` → `h-11 w-11` on the gear,
   hamburger, and any other 36px button.
3. **Hide step labels on mobile / show only active** (20min).
4. **Add `inputMode` + `autoComplete` to forms** (15min).
5. **Lazy-load the developers hero image + use webp** (15min).
6. **Filter localhost in PostHogProvider** (5min).

Total: < 2 hours of focused work for the rest of the mobile cleanup.

---

## Why this matters quantitatively

Mobile = 29% of visitors but only 10% of pageviews (PostHog, last 90d).
If we get mobile to even the median engagement (~3 pageviews/visitor), it would
add ~250 pageviews/month at current traffic — and more importantly, save the
*funnel* of mobile users who clicked "Try free" and never reached the upload pill.
