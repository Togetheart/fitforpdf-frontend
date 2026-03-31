# FitForPDF Frontend

## What is this

SaaS B2B — transforms messy Excel/CSV exports into clean, structured PDFs.
Users upload a spreadsheet, the backend generates a PDF with proper pagination, split sections, repeated key columns, and a table of contents.

## Stack

- **Framework**: Next.js 14 (App Router), React 18
- **Styling**: Tailwind CSS 3, CSS variables for theming (`data-theme` attribute, light/dark)
- **Animation**: GSAP 3
- **Analytics**: PostHog (EU, reverse-proxied via `/ingest/*`), Microsoft Clarity
- **Icons**: Lucide React
- **Fonts**: Satoshi (preloaded), Lora (Google Fonts)
- **Tests**: Node built-in test runner + Vitest (dual runner)
- **Deployment**: Vercel

## Commands

```bash
npm run dev          # Dev server on port 3001
npm test             # Node test runner + Vitest (run both)
npm run build        # Production build
npm run smoke:web    # Smoke tests
```

## Architecture

```
app/
├── page.jsx              # Landing page (hero, features, pricing preview, ROI calculator)
├── layout.js             # Root layout (theme, analytics, fonts)
├── siteCopy.mjs          # Centralized marketing copy + SEO metadata
├── globals.css           # Theme variables, typography
├── api/                  # Route handlers (proxy to backend)
│   ├── render/           # Core PDF generation (streams response from backend)
│   ├── checkout/         # Stripe payment + status polling
│   ├── subscribe/        # Subscription management
│   ├── credits/          # Credit purchase flows
│   ├── plan/pro/         # Pro plan enrollment
│   ├── quota/            # Usage quota check
│   ├── jobs/             # Job status + share links
│   ├── contact/          # Contact form
│   ├── promo/            # Promo code validation
│   └── sample/           # Sample PDF generation
├── components/           # ~47 reusable components
│   ├── UploadCard.jsx    # File upload interface
│   ├── SiteShell.jsx     # Layout wrapper (header + footer)
│   ├── VerticalPage.jsx  # Template for /for-* pages
│   ├── VsPage.jsx        # Template for /vs-* comparison pages
│   ├── JsonLd.jsx        # Structured data component
│   └── ui/               # Base UI primitives
├── hooks/                # useQuota, useConversion
├── lib/                  # Analytics, classnames, backend auth
└── [pages]/              # Route segments (see below)
```

## Page types

- **Marketing verticals**: `/for-auditors`, `/for-consultants`, `/for-finance`, `/for-saas` — use `VerticalPage.jsx`
- **Comparison pages**: `/vs-puppeteer`, `/vs-reportlab`, `/vs-wkhtmltopdf` — use `VsPage.jsx`
- **Blog/SEO articles**: `/csv-to-structured-pdf`, `/excel-to-pdf-columns-cut-off`, etc.
- **Core pages**: `/pricing`, `/about`, `/brand`, `/developers`, `/contact`
- **Legal**: `/privacy`, `/terms`, `/mentions-legales`

## Conventions

- **JSX** (not TSX) — the project does not use TypeScript for components
- **`.mjs`** for scripts, tests, and utility modules
- **Copy centralisée** dans `app/siteCopy.mjs` — toute la copy marketing et les métadonnées SEO y vivent
- **CSS variables** pour le theming, pas de classes Tailwind dark: directement
- **Composants réutilisables** : `VerticalPage` et `VsPage` sont les templates pour nouvelles pages marketing

## Rules

- **Never expose `API_KEY` client-side.** Les API routes server-side ajoutent le header `x-api-key` avant de proxy vers `BACKEND_URL`.
- **PostHog reverse proxy** configuré dans `next.config.mjs` — ne pas modifier les rewrites `/ingest/*`.
- **Redirections www** : non-www → www en 308 permanent dans `next.config.mjs`.
- **Toujours lancer `npm test` avant de commit.** Le test runner est dual (Node + Vitest).
- **SEO obligatoire** sur chaque page : title, description, OG/Twitter meta, JSON-LD (SoftwareApplication ou Article selon le type).

## Monetization

- 3 exports gratuits (pas de compte nécessaire)
- Packs one-time à partir de $19
- Abonnement Pro mensuel
- Codes promo supportés (betalist, microlaunch, free3)
