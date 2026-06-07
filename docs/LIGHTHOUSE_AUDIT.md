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

| # | Action | Effort | Bundle impact | LCP impact | Status |
|---|---|---|---|---|---|
| 1 | Re-encode 2 hero PNGs to WebP @ 1600px | 15 min | – | **-1.5s LCP** | ✅ done (commit 59449e2 + later) |
| 2 | Replace GSAP in `Section.jsx` with IO + CSS | 1 h | **-25 KB** ScrollTrigger | **-200 ms TBT** | ✅ done |
| 3 | Replace GSAP in `AnimatedLogo`, `HeroHeadline`, `SpreadsheetCellsBackdrop` with CSS | 2 h | **-37 KB** (full gsap removal) | **-100 ms TBT** | 🟡 partial (2026-06-07): `SpreadsheetCellsBackdrop` deleted (dead); `AnimatedLogo` + `HeroHeadline` now `import('gsap')` dynamically → gsap out of the synchronous first-load bundle (deferred chunk). Full CSS removal of the dependency still open. |
| 4 | Audit Satoshi font loading | 15 min | – | small CLS gain | ✅ done (2026-06-07): preload the 500 face (LCP H1 weight) + `/fonts/*` immutable 1y cache |
| 5 | Defer PostHog + Clarity post-load | partial | – | better FID | ✅ done (hostname-gated + modules trimmed in 59449e2) |
| 6 | Server Components split of home page | 8 h | TBT save varies | minor | ❌ low ROI |

### Why we did NOT do #6 (Server Components split)

External audit recommended splitting `app/page.jsx` into Server Components
+ client islands. After tracing the imports, the home page renders:

- `UploadCard` — client (state-heavy)
- `LeadCaptureModal` — client (Portal + state)
- `HeroHeadline` — client (GSAP morph)
- `ProofShowcase` — client (tabs + format toggle + state)
- `WallOfLove` — client (carousel state)
- `ApiTeaserWidget` — client
- `RoiCalculator` — client (slider state)
- `StickyMobileCTA` — client (scroll listener)
- `Section` wrapper — client (IntersectionObserver — required after #2)

~95% of the visible above-the-fold content is genuinely interactive and
needs client hydration. Splitting would only let us move ~2 KB of pure
JSX to the server tier — not worth the refactor risk + Section
re-architecture.

If we want real TBT gains, the better path is item #3 (drop the
remaining 3 GSAP-based components → ~37 KB bundle cut) — which is
strictly less invasive.

## 2026-06-07 — render-perf quick-wins batch

Field baseline at this point (PostHog RUM, marketing p75): LCP **1314ms** / FCP
854ms / INP 68ms — all GOOD; CLS **0.21** = needs-improvement (the one real
user-facing issue). So this batch targets CLS, caching, and dead weight rather
than LCP (already healthy, down from the 4.18s baseline above).

Shipped:
- **Caching** (`next.config.mjs`): `/public` assets were `max-age=0,
  must-revalidate` (a conditional request on every navigation). Now `/fonts/*`
  = `immutable` 1y; static images = `max-age=86400, stale-while-revalidate`;
  `images.minimumCacheTTL` = 1y for the `/_next/image` optimizer output.
- **AVIF**: `images.formats = ['image/avif','image/webp']`.
- **Session recorders**: dropped Microsoft Clarity from `layout.js` — it was a
  2nd full session recorder alongside PostHog's `session_recording`. PostHog
  stays as system of record.
- **Resource hints**: `preconnect` + `dns-prefetch` to the PostHog origins
  (`eu(-assets).i.posthog.com`); none existed before.
- **GSAP**: see item #3 above (deferred via dynamic import; dead
  `SpreadsheetCellsBackdrop` removed).
- **Dead dep**: removed `posthog-js` (the React SDK in the never-mounted
  `PostHogProvider`; runtime uses the inline array.js snippet via `window.posthog`).
- **Polyfills**: added a modern `browserslist` (chrome/edge/ff ≥96, safari/iOS
  ≥15) to trim the ~40KB-gzip legacy polyfills chunk. ⚠️ drops support for
  pre-2021 browsers.
- **CLS / images**: `VerticalPage` product shot raw `<img>` PNG → `next/image`
  (AVIF/WebP + dimensions); intrinsic `width`/`height` added to the wordmark
  logos (header/footer), the `BeforeAfterSlider` proof images, and the
  `WallOfLove` brand visual; removed wasteful `priority` from the two
  scroll-revealed (hidden-at-paint) product images; `sizes` + lower `quality`
  on the decorative final-CTA background.
- **Reduced motion**: gated the hero background `heroDrift` animation (was the
  only motion slipping past the `prefers-reduced-motion` guard).

## Why this audit matters

PostHog data: 29 % mobile traffic but only 10 % of page-views — strong
signal that perf is killing mobile engagement. Slow load = users bounce
before the upload pill renders.

Direct revenue link: the BetaList5 promo redemption rate + new-user
demo→upload conversion will both move with TTI improvements.
