# Convert/[slug] sample pages — programmatic SEO with a real demo

- **Date:** 2026-06-12
- **Status:** Design approved (brainstorming complete) — pending spec review → implementation plan
- **Repos:** `fitforpdf-frontend` (primary), `fitforpdf-backend` (Phase 2 dependency only)

## Problem

The five persona landing pages (`/for-finance`, `/for-consultants`, `/for-auditors`,
`/for-saas`, `/for-agents`) are thin wrappers around one shared `VerticalPage` component:
same layout, same CTA to `/app`, only the copy strings swapped per persona. To search
engines this reads as **templated/near-duplicate content**, and persona-swapped pages
funnelling to a single destination are the textbook shape of **doorway pages / scaled
content** that Google's helpful-content and spam systems discount. Adding more near-
identical persona pages makes this worse, not better.

Our growth bottleneck is **distribution, not features**, and our SEO is "sound but young."
So the right investment is content that carries genuine, hard-to-duplicate unique value.

## Insight / approach

Organize by **artifact, not persona**. Anchor each new page to a **specific, real, public
dataset** + its format quirk + a **live render demo** + a **downloadable file**. The dataset
is the unique content that defeats thinness, and it maps to a real long-tail query
("convert <dataset> CSV to PDF"). The interactive before/after on a recognizable file is the
moat — a competitor or an AI-spun page can't cheaply duplicate it.

**Hub-and-spoke:** keep the persona pages but upgrade them into hubs that link to the
concrete file pages; each file page links back to its hub and to sibling file pages. Strong
internal linking is the SEO lever.

## Goals

- A dynamic, registry-driven route `/convert/[slug]`, one page per curated dataset.
- Each page: unique H1/title/meta, the messy-CSV story, a static before/after, a download
  link, a one-click "Try this file" live demo, FAQ + breadcrumb JSON-LD, license
  attribution, hub/sibling links, and its own page `lang`.
- Persona pages become hubs (add an "examples" block linking to relevant `/convert/*`).
- Pilot of 3 diverse pages (FR + US + global, 3 sectors) to validate the pattern before
  scaling.

## Non-goals (Phase 3+, YAGNI)

- Full bilingual / hreflang mirrors.
- Datasets beyond the pilot 3 (USAspending, Eurostat, IMF, SaaS/Stripe, AI-eval, audit
  trial-balance) — added later, guided by Search Console impressions.
- Automated SERP/rank tracking.

## Decisions (from brainstorming)

1. **Demo depth = both, in two phases.** Static before/after first (frontend-only), then the
   live "Try this file" button.
2. **Structure = hub-and-spoke, by EXTENDING the existing `seoArticles.mjs` + `SeoArticle.jsx`
   system** — the proven long-tail SEO engine (11 live pages, born from the one page that
   brings organic traffic). **Top-level keyword slugs** (the established convention), NOT
   `/convert/[slug]`. Persona pages link to the new articles (hub→spoke); articles cross-link
   via the existing `related` field (spoke→hub, spoke↔spoke). _(Adjustment 2026-06-12 after
   discovering the existing system — supersedes the `/convert/[slug]` + `convertSamples.mjs`
   wording in the Architecture section below.)_
3. **Language follows the dataset's audience.** FR dataset → French page; US/global → English.
   Per-page `lang`, no i18n routing, no hreflang (no mirror translations).
4. **Pilot = 3 datasets** (below).
5. **Phase 2 quota = register the 3 sample hashes on the backend** (best UX) — chosen over
   "load without auto-render."

## Architecture

> **Updated 2026-06-12 — extend the existing system.** The repo already has a registry-driven
> SEO-article engine: `app/lib/seoArticles.mjs` (the `SEO_ARTICLES` array, helper
> `getArticleBySlug`), the shared template `app/components/SeoArticle.jsx` (renders eyebrow/h1/
> lead/sections/faqs/related/cta + Article/FAQ/Breadcrumb JSON-LD; exports `articleMetadata()`),
> and one thin `app/<slug>/page.jsx` per entry (top-level slug). `app/sitemap.js` already
> iterates `SEO_ARTICLES` (line ~73), so new entries auto-appear in the sitemap. **We extend
> this**, we do not build a parallel `/convert/[slug]` route or a `convertSamples.mjs` registry.
>
> Concretely: (a) add 3 entries to `SEO_ARTICLES`, each with an optional new `demo` field and a
> `lang` field; (b) extend `SeoArticle.jsx` to render a **demo block** when `article.demo` is
> present (raw-CSV before snippet ↔ rendered-PDF `afterImage`, a download link, the license
> attribution line, and — Phase 2 — the "Try this file" button) and to set `lang` on the
> article wrapper `<div lang={article.lang || 'en'}>` for per-page language; (c) add 3 thin
> `app/<slug>/page.jsx` files following the existing 4-line pattern; (d) link the persona pages
> to the new articles (hub→spoke) via a small `relatedArticles` addition to `VerticalPage`.
> The subsections below are the original `/convert/[slug]` framing — kept for history but
> superseded by this note for routing/registry/sitemap.

### Route & registry
- New dynamic route `app/convert/[slug]/page.jsx` (Next.js app router, SSG via
  `generateStaticParams`, per-entry `generateMetadata`).
- Single source of truth: **`app/lib/convertSamples.mjs`** — a frozen array of entries.
  Everything derives from it: the pages, `generateStaticParams`, `sitemap.js`, the persona
  hub "examples" links, and the `?sample=<slug>` client/server allowlists.
- Fold the existing one-off `app/convert-large-csv-to-pdf` into this system (keep its URL via
  an entry or a redirect; reconcile during implementation).

### Registry entry shape (per dataset)
```
{
  slug, lang ('fr'|'en'), hub ('for-finance'|...),
  title, h1, subhead, metaDescription,
  dataset: { name, source, sourceUrl, license, attribution },
  sampleFile,            // path under /public/CSV/<slug>.csv (the trimmed file)
  beforeSnippet,         // few real raw rows/cols to show the "messy" state
  afterImage,            // /public path to the pre-rendered PDF page-1 preview
  body,                  // 2-3 unique paragraphs (what it is / why it breaks / what the PDF gives)
  faq: [{ q, a }],       // -> FAQPage JSON-LD
  sampleMode,            // render mode for the live demo (e.g. 'compact')
}
```

### Page content model (`/convert/[slug]`)
Unique H1 + subhead · before/after block (raw CSV snippet ↔ `afterImage`) · **"Try this
file" button** (Phase 2) · **download link** for the sample file (backlink magnet) · 2-3
unique paragraphs · FAQ + Breadcrumb JSON-LD · license attribution line · links to its hub +
1-2 sibling pages · `lang` set per entry. Reuses the existing design system (Satoshi, cream
paper) — no net-new visual design.

### Persona hubs
Extend `VerticalPage` (or wrap it) with an "Exemples concrets" section that renders the
registry entries whose `hub` matches, linking to each `/convert/*`.

### Sitemap
`app/sitemap.js` iterates the registry to emit `/convert/<slug>` entries (today it lists
routes manually — this removes the omission risk).

## The 3 pilot datasets (grounding-verified)

| slug (top-level) | lang | dataset | format / mess | license | trim |
|---|---|---|---|---|---|
| `convertir-balance-comptable-csv-en-pdf` | fr | DGFiP balances comptables des communes 2024 | CSV `;`, UTF-8+BOM, CRLF, 28 cols; cryptic FR accounting codes (COMPTE, BEDEB/BECRE, SD/SC) | Licence Ouverte / Etalab 2.0 — **attribution** ("DGFiP" + dataset name) | full file 95.8 MB → 422; export ONE commune via Opendatasoft `where=lbudg="<COMMUNE>"&delimiter=%3B` (~227 rows, 36 KB) |
| `irs-tax-stats-csv-to-pdf` | en | IRS SOI Historic Table 2 (individual income & tax by state × AGI) | CSV comma, ASCII, **163 cols** × 595 rows; cryptic codes (`A00100`, `N02650`), numbers as quoted strings with thousands separators (`"159,651,330"`) and negatives | US federal — **public domain** (no attribution required) | keep US total + ~3 states × 10 AGI brackets (~40 rows); verify < 200-page cap |
| `world-bank-gdp-csv-to-pdf` | en | World Bank GDP (current US$), `NY.GDP.MKTP.CD` | ZIP→CSV; 4-line preamble before the real header, ~66 year columns + phantom trailing-comma column, all-quoted, sparse recent years | **CC BY 4.0** — **attribution required in the rendered PDF/footer** | unzip `API_NY...csv`; keep ~10 recognizable economies (World, US, China, France, Germany, Japan, India, Brazil…) |

Direct sources (implementation reference):
- DGFiP: `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/balances-comptables-des-communes-en-2024/exports/csv?where=lbudg="<COMMUNE>"&delimiter=%3B`
- IRS SOI: `https://www.irs.gov/pub/irs-soi/22in55cmcsv.csv`
- World Bank: `https://api.worldbank.org/v2/en/indicator/NY.GDP.MKTP.CD?downloadformat=csv`

Notes: SEC EDGAR was rejected (long-format TSV dumps / XBRL JSON — not a wide CSV). USAspending
is a future page (282 cols but GB-scale, hard to trim/document).

## Live "Try this file" mechanism (Phase 2)

The `?sample=1` deep link already exists for one hardcoded sample. The flow:
`/app?sample=1` → `ConversionTool` on-mount effect (`ConversionTool.jsx:~2303`) →
`handleTrySample()` (`useConversion.mjs:~806`) → `fetch('/api/sample/premium')` → wrap as
`File` → `handleFileSelect` (same slot a real upload lands in) → `submitRender('compact')`.

**Generalize, don't fork:**
- Client registry maps `slug → { endpoint, filename, mode }`. `filename` MUST equal the
  canonical name the backend hash-keys on.
- `handleTrySample(slug = 'enterprise-invoices')` looks up the registry; unknown slug → error,
  no fetch.
- Deep-link effect: `slug = raw === '1' ? 'enterprise-invoices' : raw`; only call for known
  slugs. **Keep `?sample=1` as the default alias** so existing CTAs + tests stay green.
- Server: convert `app/api/sample/premium/route.js` into `app/api/sample/[slug]/route.js`
  resolving slug against a **hardcoded allowlist** (no raw slug in fs path — path-traversal
  guard); keep `/premium` as a thin alias. Reads only `public/CSV/<file>`.
- Auto-render on load stays (matches current peak-intent UX), gated to known slugs, once per
  mount.

### ⚠️ Backend dependency (the load-bearing caveat)
The sample avoids burning quota **only because the backend hash-matches the canonical demo
bytes and refunds the export.** Therefore every new sample's **exact trimmed bytes must be
registered in the backend's refunded-hash list before its "Try it" link ships** — otherwise a
visitor at their quota cap is surprise-charged. Phase 2 includes a small backend change
(register the 3 sample hashes) in `fitforpdf-backend`.

## Phasing

- **Phase 1 — frontend only, no backend *runtime/deploy* dependency.** The 3 `/convert/*`
  pages with static before/after + download link, persona hubs upgraded, registry + sitemap.
  Ships standalone; carries the full SEO value. (Generating the `afterImage` previews calls a
  render once at *authoring* time — see the pipeline below — which is distinct from the
  Phase 2 runtime quota-refund dependency.)
- **Phase 2 — live demo.** Generalize `?sample=<slug>` (client + server allowlist) + register
  the 3 sample hashes on the backend → enable the "Try this file" button.

## Before/after asset pipeline

For each entry, generate once: render the trimmed sample CSV through the backend, capture PDF
page 1 as an optimized PNG/WebP into `/public`. The raw-CSV snippet is a few real rows/cols.
A small script (committed) regenerates these so they stay in sync if a sample is re-trimmed.

## SEO specifics

- Per-page `title` (<60 chars), `metaDescription` (<155), unique H1, canonical, `lang`.
- DGFiP: title "Balance comptable CSV en PDF lisible | FitForPDF"; H1 "Convertir une balance
  comptable (CSV DGFiP) en PDF lisible".
- World Bank: H1 "Convert a World Bank GDP CSV into a clean PDF table".
- IRS SOI: H1 "Convert IRS tax-stats (SOI) CSV to a printable PDF".
- Do **not** target saturated head terms (`csv to pdf` — Smallpdf/Zamzar/etc.); target the
  dataset-specific long-tail. Body differentiator to emphasize: repeated header rows per page,
  auto landscape + column fit for wide tables, correct delimiter/encoding handling (semicolon
  + Latin-1/Win-1252 for FR exports — ties to the just-fixed crash).
- FAQ + Breadcrumb JSON-LD per page; registry-driven sitemap.

## Testing

- Registry validation: unique slugs, every `sampleFile` exists in `/public/CSV`, every
  `afterImage` exists, required fields present.
- Per-page metadata test (extend existing `app/__tests__/seo.metadata.test.jsx`): title/meta/
  canonical/lang present and unique.
- Each trimmed sample renders **under the 200-page free cap** (guards the demo always
  succeeds).
- `?sample=1` and the default sample filename stay green (existing demo-flow tests must not
  regress).
- Phase 2: a known `?sample=<slug>` loads + the unknown-slug path errors cleanly.

## Risks / dependencies

- **Cross-repo (Phase 2):** backend sample-hash registration must land before the live links.
- **Page-burden cap:** every trimmed file must reliably render < 200 pages.
- **Attribution:** World Bank (CC BY 4.0) requires an attribution line in the rendered
  output/footer; DGFiP requires source attribution on the page.
- **Product freeze:** confirm this fits the sprint freeze (the "sandbox sample" was already
  greenlit, so this is adjacent/in-scope).
