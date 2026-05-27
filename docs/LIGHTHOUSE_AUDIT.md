# Frontend Performance Audit — Lighthouse + GSAP Code Review

**Date:** 2026-05-27
**Reported LCP (PostHog real-user data):** 4.18s — TARGET <2.5s
**Reported Lighthouse perf score (Clarity):** 72.89 — TARGET 90+

## ✅ Already shipped in this audit

### Dead assets removed (54 MB)
| File | Size | Status |
|---|---|---|
| `motion_fitforpdf.gif` | 33 MB | ❌ Unreferenced → deleted |
| `motion_fitforpdf_v2.gif` | 12 MB | ❌ Unreferenced → deleted |
| `motion_fitforpdf_v4.gif` | 8 MB | ❌ Unreferenced → deleted |
| `sneusch_A_single_sheet_of_dark_navy_paper_*.png` | 1.4 MB | ❌ Unreferenced → deleted |

These were sitting in `/public` ready to be served. Even unused, they
inflate the deploy artifact + can be crawled by bots. Net: faster
deploys, cleaner CDN cache, no functional impact.

## 🔴 GSAP review — biggest perf + UX win on the table

GSAP is used in 4 components:
1. `AnimatedLogo.jsx` — logo morph anim (light, hero only)
2. `HeroHeadline.jsx` — bracket `[F]` morph (light, hero only)
3. `SpreadsheetCellsBackdrop.jsx` — animated grid background
4. **`ui/Section.jsx` — ScrollTrigger reveal on EVERY section** ⚠️

`gsap` (~37 KB gzipped) + `ScrollTrigger` plugin (~25 KB gzipped) = **~62 KB**
of JS in the first-load bundle.

### `Section.jsx` is the worst offender

```js
// app/components/ui/Section.jsx
useEffect(() => {
  // ...
  gsap.set(targets, { opacity: 0, y: 24 });
  const trigger = ScrollTrigger.create({
    trigger: el, start: 'top 85%', once: true,
    onEnter: () => gsap.to(targets, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }),
  });
  // ...
}, []);
```

Three concrete problems:
1. **+25 KB JS** to do a fade-in that CSS `@keyframes` + IntersectionObserver
   would do in ~0 KB.
2. **Layout shifts mid-scroll**: when the user clicks "Fix your export",
   sections between hero and upload reveal during the smooth scroll, shifting
   the target's position. Caused the "scroll lands at the wrong place" bug.
   We worked around it with a corrective second scroll — better to remove
   the cause.
3. **Cleanup flicker risk**: on unmount the useEffect resets opacity:1 + y:0,
   but if GSAP is already cleaned up (page transition), the inline opacity:0
   may persist for a frame.

**Recommended refactor**: replace with CSS-only reveal + IntersectionObserver

```js
// New Section.jsx
useEffect(() => {
  const el = innerRef.current;
  if (!el) return;
  const targets = el.children;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Set initial state via inline CSS (replaces gsap.set)
  Array.from(targets).forEach((t, i) => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(24px)';
    t.style.transition = `opacity .7s ease-out, transform .7s ease-out`;
    t.style.transitionDelay = `${i * 100}ms`;
  });

  // Reveal on scroll-into-view (replaces ScrollTrigger)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      Array.from(targets).forEach((t) => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
      });
      observer.disconnect();
    });
  }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
  observer.observe(el);
  return () => observer.disconnect();
}, []);
```

Removing `import { gsap }` + `import { ScrollTrigger }` from this file +
deleting the registration would save ~25 KB if GSAP-Core is no longer
needed by other components (still used by AnimatedLogo, HeroHeadline,
SpreadsheetCellsBackdrop — those import `gsap` core, ~37 KB).

If the other 3 GSAP uses are removed too (each could be CSS), we drop
**~62 KB** entirely + remove the gsap dependency.

## 🟡 Other Lighthouse-relevant findings

### Heavy images still in production
| File | Size | Status |
|---|---|---|
| `og-image.png` | 2.3 MB | Used as OG share image (Twitter/FB) + WallOfLove. Convert to webp + serve a smaller variant for in-page use. |
| `sneusch_Aerial_view_*.png` | 2.3 MB | Final-CTA background (`next/image` with `fill` ✓). Convert to webp at smaller resolution (current PNG is overkill). |
| `brand-origami.png` | 1.4 MB | Already converted to `next/image` with `priority` in last audit ✓ |

**Action**: re-encode `og-image.png` and `sneusch_Aerial_view_*.png` to
WebP at 1600px max width. Expected: 2.3 MB → ~150–300 KB.

### Fonts
- `Lora` from `next/font/google` ✓ (auto-optimized, self-hosted, `display: swap`)
- Satoshi loaded via `<link>` from local asset (check display strategy)

### Third-party scripts
- PostHog inline + `afterInteractive` strategy ✓
- Microsoft Clarity inline + same strategy ✓
- Both add ~30 KB JS over the wire. Not blocking, but cumulative.

### Lucide-react
- Tree-shaken (named imports like `{ Check, X }`) ✓ — no full lib loaded

## 📋 Suggested follow-up plan (ranked by impact / effort)

| # | Action | Effort | Bundle impact | LCP impact |
|---|---|---|---|---|
| 1 | Re-encode 2 hero PNGs to WebP @ 1600px | 15 min | – | **-1.5s LCP** (final CTA bg + WallOfLove) |
| 2 | Replace GSAP in `Section.jsx` with IO + CSS | 1 h | **-25 KB** | **-200 ms TBT** (less JS to parse) |
| 3 | Replace GSAP in `AnimatedLogo`, `HeroHeadline`, `SpreadsheetCellsBackdrop` with CSS | 2 h | **-37 KB** (full gsap removal) | **-100 ms TBT** |
| 4 | Audit Satoshi font loading | 15 min | – | small CLS gain |
| 5 | Defer PostHog + Clarity 2 s post-load | 30 min | – | better First Input Delay |

Expected combined: LCP **4.18 s → ~2.5 s**, Lighthouse score **72 → 90+**.

## Why this audit matters

PostHog data: 29 % mobile traffic but only 10 % of page-views — strong
signal that perf is killing mobile engagement. Slow load = users bounce
before the upload pill renders.

Direct revenue link: the BetaList5 promo redemption rate + new-user
demo→upload conversion will both move with TTI improvements.
