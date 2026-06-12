# Convert Sample Pages — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 3 dataset-specific SEO landing pages (DGFiP 🇫🇷, IRS SOI 🇺🇸, World Bank 🌍), each with a real downloadable trimmed file and a static before/after preview, by extending the existing `seoArticles` engine — plus link the persona pages to them (hub→spoke).

**Architecture:** Extend `app/lib/seoArticles.mjs` (registry) and `app/components/SeoArticle.jsx` (template) with an optional `demo` block + per-page `lang`. Add 3 thin `app/<slug>/page.jsx` files (existing 4-line pattern). Trimmed CSVs live in `public/CSV/`, PDF page-1 previews in `public/convert/`. `app/sitemap.js` already iterates `SEO_ARTICLES`, so new pages auto-appear. NO live demo / NO backend change in Phase 1 (that is Phase 2).

**Tech Stack:** Next.js 14.2 (app router, `params` is a plain object), React, Tailwind (CSS vars `--color-*`), vitest + `@testing-library/react`, `node --test` for `.test.mjs`. Run from repo root `fitforpdf-frontend` with node on PATH (`/Users/sneusch/.nvm/versions/node/v22.22.3/bin`).

**Branch:** `feat/convert-sample-pages` (already created off `origin/main`).

**Phase 2 (separate plan, NOT here):** generalize `?sample=<slug>` (client + server allowlist) and register the 3 trimmed-file content-hashes in `fitforpdf-backend` so the "Try this file" button renders live without burning quota.

---

## File Structure

**Create:**
- `public/CSV/dgfip-balance-comptable.csv` — trimmed DGFiP (one commune)
- `public/CSV/irs-soi-tax-stats.csv` — trimmed IRS SOI (US + 3 states × 10 brackets)
- `public/CSV/world-bank-gdp.csv` — trimmed World Bank GDP (~10 economies)
- `public/convert/dgfip-balance-comptable-after.png` — rendered PDF page-1 preview
- `public/convert/irs-soi-tax-stats-after.png`
- `public/convert/world-bank-gdp-after.png`
- `scripts/build-convert-samples.mjs` — fetch+trim the 3 datasets into `public/CSV/`
- `app/convertir-balance-comptable-csv-en-pdf/page.jsx` — thin page (DGFiP, fr)
- `app/irs-tax-stats-csv-to-pdf/page.jsx` — thin page (IRS, en)
- `app/world-bank-gdp-csv-to-pdf/page.jsx` — thin page (World Bank, en)
- `app/__tests__/convertSamplesArticles.test.mjs` — registry/demo-field validation (node --test)
- `app/__tests__/seoArticleDemo.ui.test.jsx` — demo block render test (vitest)

**Modify:**
- `app/lib/seoArticles.mjs` — add 3 entries with `lang` + `demo`; add a `DEMO_ARTICLE_SLUGS` export
- `app/components/SeoArticle.jsx` — render the `demo` block; set `lang` on the wrapper div
- `app/components/VerticalPage.jsx` — optional `relatedArticles` prop → "Examples" block
- `app/for-finance/page.jsx`, `app/for-consultants/page.jsx` — pass `relatedArticles`

---

## Task 1: Curate the 3 trimmed sample CSVs

**Files:**
- Create: `scripts/build-convert-samples.mjs`
- Create (output): `public/CSV/dgfip-balance-comptable.csv`, `public/CSV/irs-soi-tax-stats.csv`, `public/CSV/world-bank-gdp.csv`

- [ ] **Step 1: Write the fetch/trim script**

Create `scripts/build-convert-samples.mjs`:

```js
// Authoring-time tool: download the 3 open datasets and write trimmed CSVs to
// public/CSV/. Trimmed so each renders well under the 200-page free cap.
// Run: node scripts/build-convert-samples.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const OUT = join(process.cwd(), 'public', 'CSV');
mkdirSync(OUT, { recursive: true });

// 1) DGFiP — one recognizable commune via the Opendatasoft where-filter.
//    Swap COMMUNE if the chosen one renders over the cap or is uninteresting.
const COMMUNE = 'ANNECY';
const dgfipUrl =
  'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/' +
  'balances-comptables-des-communes-en-2024/exports/csv' +
  `?where=lbudg%3D%22${encodeURIComponent(COMMUNE)}%22&delimiter=%3B`;
execSync(`curl -fsSL "${dgfipUrl}" -o "${join(OUT, 'dgfip-balance-comptable.csv')}"`, { stdio: 'inherit' });

// 2) IRS SOI Historic Table 2 (2022). Full file = 163 cols x 595 rows; keep the
//    US total + a few states across all 10 AGI brackets so it stays under cap.
const irsRaw = execSync(
  'curl -fsSL "https://www.irs.gov/pub/irs-soi/22in55cmcsv.csv"',
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
);
{
  const lines = irsRaw.split(/\r?\n/);
  const header = lines[0];
  const KEEP = new Set(['US', 'CA', 'NY', 'TX']); // STATE is column 1
  const kept = lines.slice(1).filter((l) => {
    const m = l.match(/^"?([A-Z]{2})"?,/);
    return m && KEEP.has(m[1]);
  });
  writeFileSync(join(OUT, 'irs-soi-tax-stats.csv'), [header, ...kept].join('\n') + '\n');
}

// 3) World Bank GDP (current US$). ZIP -> data CSV; keep ~10 economies, drop the
//    4-line preamble so the header is row 1 (cleaner demo).
execSync('curl -fsSL "https://api.worldbank.org/v2/en/indicator/NY.GDP.MKTP.CD?downloadformat=csv" -o /tmp/wb.zip', { stdio: 'inherit' });
execSync('rm -rf /tmp/wb && mkdir -p /tmp/wb && unzip -o /tmp/wb.zip -d /tmp/wb >/dev/null', { stdio: 'inherit' });
const wbFile = execSync('ls /tmp/wb/API_NY.GDP.MKTP.CD_*.csv', { encoding: 'utf8' }).trim();
{
  const raw = execSync(`cat "${wbFile}"`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const lines = raw.split(/\r?\n/);
  const header = lines[4]; // line 5 (0-indexed 4) is the real header after the 4-line preamble
  const KEEP = new Set(['World', 'United States', 'China', 'France', 'Germany', 'Japan', 'India', 'Brazil', 'United Kingdom', 'Canada']);
  const kept = lines.slice(5).filter((l) => {
    const m = l.match(/^"([^"]+)"/);
    return m && KEEP.has(m[1]);
  });
  writeFileSync(join(OUT, 'world-bank-gdp.csv'), [header, ...kept].join('\n') + '\n');
}

console.log('Wrote 3 trimmed CSVs to public/CSV/');
```

- [ ] **Step 2: Run the script**

Run: `node scripts/build-convert-samples.mjs`
Expected: prints "Wrote 3 trimmed CSVs to public/CSV/" and the 3 files exist.

- [ ] **Step 3: Verify the files are non-trivial and reasonably sized**

Run: `wc -l public/CSV/dgfip-balance-comptable.csv public/CSV/irs-soi-tax-stats.csv public/CSV/world-bank-gdp.csv`
Expected: DGFiP ~50-300 rows, IRS ~40 rows, World Bank ~10 rows; each file > 1 KB. If DGFiP is 0 rows, the commune name was wrong — pick another (e.g. `LYON`, `BORDEAUX`) and re-run.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-convert-samples.mjs public/CSV/dgfip-balance-comptable.csv public/CSV/irs-soi-tax-stats.csv public/CSV/world-bank-gdp.csv
git commit -m "feat(convert): add trimmed open-dataset sample CSVs + build script"
```

---

## Task 2: Add the 3 registry entries (with lang + demo fields)

**Files:**
- Modify: `app/lib/seoArticles.mjs` (append 3 entries to `SEO_ARTICLES`; add a `DEMO_ARTICLE_SLUGS` export)
- Test: `app/__tests__/convertSamplesArticles.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `app/__tests__/convertSamplesArticles.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SEO_ARTICLES, DEMO_ARTICLE_SLUGS, getArticleBySlug } from '../lib/seoArticles.mjs';

const EXPECTED = [
  'convertir-balance-comptable-csv-en-pdf',
  'irs-tax-stats-csv-to-pdf',
  'world-bank-gdp-csv-to-pdf',
];

test('the 3 demo articles are registered with unique slugs', () => {
  for (const slug of EXPECTED) {
    assert.ok(getArticleBySlug(slug), `missing article: ${slug}`);
  }
  const slugs = SEO_ARTICLES.map((a) => a.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'slugs must be unique');
  assert.deepEqual([...DEMO_ARTICLE_SLUGS].sort(), [...EXPECTED].sort());
});

test('each demo article has required + demo fields, valid lang, and an existing sample file', () => {
  for (const slug of EXPECTED) {
    const a = getArticleBySlug(slug);
    for (const f of ['title', 'description', 'h1', 'lead']) {
      assert.equal(typeof a[f], 'string');
      assert.ok(a[f].length > 8, `${slug}.${f} too short`);
    }
    assert.ok(['fr', 'en'].includes(a.lang), `${slug}.lang invalid`);
    assert.ok(a.title.length <= 60, `${slug}.title > 60 chars`);
    assert.ok(a.description.length <= 160, `${slug}.description > 160 chars`);
    assert.ok(Array.isArray(a.faqs) && a.faqs.length >= 1);
    const d = a.demo;
    assert.ok(d, `${slug} missing demo`);
    for (const f of ['sampleFile', 'afterImage', 'beforeSnippet', 'downloadName', 'license', 'sampleSlug']) {
      assert.ok(d[f], `${slug}.demo.${f} missing`);
    }
    assert.ok(d.sampleFile.startsWith('/CSV/'), `${slug}.demo.sampleFile must be a /CSV/ public path`);
    assert.ok(
      existsSync(join(process.cwd(), 'public', d.sampleFile)),
      `${slug}.demo.sampleFile not found in public${d.sampleFile}`,
    );
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test app/__tests__/convertSamplesArticles.test.mjs`
Expected: FAIL — `DEMO_ARTICLE_SLUGS` is not exported / articles missing.

- [ ] **Step 3: Add the entries + export**

In `app/lib/seoArticles.mjs`, append these 3 objects inside the `SEO_ARTICLES` array (before the closing `]`). Then add the export below the array.

```js
  // ── Dataset demo pages (real open data + before/after + downloadable file) ──
  {
    slug: 'convertir-balance-comptable-csv-en-pdf',
    lang: 'fr',
    eyebrow: 'Comptabilité',
    title: 'Balance comptable CSV en PDF lisible | fitforpdf',
    description:
      "Transformez une balance comptable (export CSV DGFiP, trop large pour Excel) en PDF propre, paginé et prêt à envoyer au client. Sans mise en page manuelle.",
    h1: 'Convertir une balance comptable (CSV DGFiP) en PDF lisible',
    lead:
      "Les balances comptables exportées en CSV — point-virgule, des dizaines de colonnes de codes (COMPTE, BEDEB, SD/SC) — sont illisibles dans Excel et à l'impression. Voici comment en faire un PDF propre, paginé, prêt à envoyer.",
    sections: [
      {
        h2: 'Pourquoi une balance CSV casse à l’impression',
        list: [
          'Trop de colonnes : les soldes débit/crédit passent hors page et sont tronqués.',
          'Délimiteur point-virgule + encodage (UTF-8/BOM ou Latin-1 selon l’export) : tout colle dans une seule colonne si l’outil se trompe.',
          'Aucune répétition d’en-têtes : page 2 et suivantes deviennent indéchiffrables.',
        ],
      },
      {
        h2: 'La conversion structurée avec fitforpdf',
        body:
          "fitforpdf détecte le délimiteur et l’encodage, regroupe les colonnes en sections lisibles, répète les colonnes-clés (numéro de compte, libellé) sur chaque page, et pagine proprement — y compris pour une balance de plusieurs centaines de lignes.",
      },
    ],
    faqs: [
      {
        q: 'Mon CSV utilise des points-virgules et des accents — est-ce géré ?',
        a: "Oui. fitforpdf détecte le délimiteur (`;`, `,` ou tabulation) et l’encodage (UTF-8 et Windows-1252/Latin-1), donc les accents et les colonnes restent corrects.",
      },
      {
        q: 'Combien de colonnes une balance peut-elle avoir ?',
        a: 'Jusqu’à 150 colonnes sont rendues automatiquement en sections lisibles ; les balances DGFiP (~28 colonnes) passent sans réglage.',
      },
    ],
    related: [
      { label: 'Convertir un gros CSV en PDF', href: '/convert-large-csv-to-pdf' },
      { label: 'Rapport financier (tableur) en PDF', href: '/financial-report-spreadsheet-to-pdf' },
      { label: 'Pour les équipes finance', href: '/for-finance' },
    ],
    cta: {
      title: 'Convertissez votre balance maintenant',
      body: 'Déposez votre export CSV et récupérez un PDF propre, prêt à envoyer. 3 exports gratuits.',
      label: 'Essayer gratuitement',
    },
    demo: {
      sampleSlug: 'dgfip-balance-comptable',
      sampleFile: '/CSV/dgfip-balance-comptable.csv',
      downloadName: 'balance-comptable-dgfip-demo.csv',
      afterImage: '/convert/dgfip-balance-comptable-after.png',
      beforeSnippet:
        'EXER;IDENT;NDEPT;LBUDG;INSEE;...;COMPTE;BEDEB;BECRE;...;SD;SC\n2024;...;ANNECY;...;6450000;"12 345,67";"0,00";...;"12 345,67";"0,00"',
      license: 'Source : DGFiP / Ministère de l’Économie — Licence Ouverte / Etalab 2.0.',
    },
  },
  {
    slug: 'irs-tax-stats-csv-to-pdf',
    lang: 'en',
    eyebrow: 'Tax & finance data',
    title: 'IRS Tax-Stats (SOI) CSV to PDF | fitforpdf',
    description:
      'Turn the IRS SOI Historic Table 2 CSV — 160+ cryptic columns, numbers quoted with commas — into a clean, paginated, printable PDF. No spreadsheet wrangling.',
    h1: 'Convert IRS tax-stats (SOI) CSV to a printable PDF',
    lead:
      'The IRS Statistics of Income "Historic Table 2" ships as a 163-column CSV with cryptic codes (A00100, N02650) and numbers stored as quoted strings like "159,651,330". Here is how to turn it into a readable PDF.',
    sections: [
      {
        h2: 'Why this CSV is unreadable as-is',
        list: [
          '163 columns: open it in Excel and print, and most columns fall off the page.',
          'Codes, not labels: A-prefixed = dollar amounts, N-prefixed = counts, per AGI bracket.',
          'Numbers are quoted strings with thousands separators ("159,651,330") and negatives — naive parsers mangle them.',
        ],
      },
      {
        h2: 'The structured conversion',
        body:
          'fitforpdf groups the columns into readable sections, repeats the state / AGI-bracket identifier columns on every page, parses the quoted numbers correctly, and paginates — so a 160-column federal table becomes a PDF you can actually read.',
      },
    ],
    faqs: [
      {
        q: 'Can fitforpdf handle a 160-column CSV?',
        a: 'Yes — up to 150 columns are auto-grouped into readable sections with repeated identifier columns; wider files are split across sections with consistent headers.',
      },
      {
        q: 'Will the quoted numbers like "159,651,330" stay correct?',
        a: 'Yes. fitforpdf parses quoted cells with embedded thousands separators and negatives without splitting them into wrong columns.',
      },
    ],
    related: [
      { label: 'Wide-table PDF export', href: '/wide-table-pdf-export' },
      { label: 'Keep all columns: XLSX to PDF', href: '/xlsx-to-pdf-keep-all-columns' },
      { label: 'For auditors', href: '/for-auditors' },
    ],
    cta: {
      title: 'Convert your tax-stats CSV',
      body: 'Drop the CSV and get a clean, paginated PDF with every column accounted for. 3 free exports.',
      label: 'Try it free',
    },
    demo: {
      sampleSlug: 'irs-soi-tax-stats',
      sampleFile: '/CSV/irs-soi-tax-stats.csv',
      downloadName: 'irs-soi-tax-stats-demo.csv',
      afterImage: '/convert/irs-soi-tax-stats-after.png',
      beforeSnippet:
        'STATE,AGI_STUB,N1,MARS1,...,A00100,N02650,A02650,N00200,A00200,...\n"US","1","...",...,"159,651,330","...","-160,983,232",...',
      license: 'Source: IRS Statistics of Income, Historic Table 2 — U.S. federal public domain.',
    },
  },
  {
    slug: 'world-bank-gdp-csv-to-pdf',
    lang: 'en',
    eyebrow: 'Open data',
    title: 'World Bank GDP CSV to PDF Table | fitforpdf',
    description:
      'Convert a World Bank GDP-by-country Open Data CSV — a column for every year since 1960 — into a tidy, printable PDF table. No reshaping, no messy Excel.',
    h1: 'Convert a World Bank GDP CSV into a clean PDF table',
    lead:
      'The World Bank GDP CSV is the classic "wide format": a metadata preamble, then one column per year from 1960 to today, all quoted. Here is how to turn it into a tidy, printable PDF.',
    sections: [
      {
        h2: 'Why the World Bank CSV is awkward',
        list: [
          'A 4-line preamble means the real header is not on row 1 — many tools mis-detect columns.',
          '60+ year columns run far off any printed page.',
          'Every field is quoted and recent years are empty — ragged, sparse rows.',
        ],
      },
      {
        h2: 'The structured conversion',
        body:
          'fitforpdf reads past the preamble, groups the year columns into readable sections, repeats the country name on every page, and paginates — turning the notorious wide CSV into a clean PDF table.',
      },
    ],
    faqs: [
      {
        q: 'Does it handle the World Bank CSV preamble and wide year columns?',
        a: 'Yes — fitforpdf detects the real header and groups the year columns into readable, paginated sections with the country column repeated.',
      },
      {
        q: 'Can I do this with any World Bank indicator export?',
        a: 'Yes. Any wide indicator CSV (one column per year) converts the same way.',
      },
    ],
    related: [
      { label: 'Wide-table PDF export', href: '/wide-table-pdf-export' },
      { label: 'Convert a large CSV to PDF', href: '/convert-large-csv-to-pdf' },
      { label: 'For consultants', href: '/for-consultants' },
    ],
    cta: {
      title: 'Convert your World Bank CSV',
      body: 'Drop the GDP CSV and get a clean, paginated PDF table. 3 free exports.',
      label: 'Try it free',
    },
    demo: {
      sampleSlug: 'world-bank-gdp',
      sampleFile: '/CSV/world-bank-gdp.csv',
      downloadName: 'world-bank-gdp-demo.csv',
      afterImage: '/convert/world-bank-gdp-after.png',
      beforeSnippet:
        '"Country Name","Country Code","Indicator Name","Indicator Code","1960",...,"2024"\n"World","WLD","GDP (current US$)","NY.GDP.MKTP.CD","...",...,"..."',
      license: 'Source: The World Bank — GDP (current US$), World Development Indicators (CC BY 4.0).',
    },
  },
```

Then, immediately after the `export const SEO_ARTICLES = [ ... ];` closing line, add:

```js
/** Slugs of the dataset pages that render the before/after + download demo block. */
export const DEMO_ARTICLE_SLUGS = [
  'convertir-balance-comptable-csv-en-pdf',
  'irs-tax-stats-csv-to-pdf',
  'world-bank-gdp-csv-to-pdf',
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test app/__tests__/convertSamplesArticles.test.mjs`
Expected: PASS (both tests). If "sample file not found", Task 1 must have produced the file at the asserted path.

- [ ] **Step 5: Commit**

```bash
git add app/lib/seoArticles.mjs app/__tests__/convertSamplesArticles.test.mjs
git commit -m "feat(convert): register 3 dataset demo articles (lang + demo fields)"
```

---

## Task 3: Render the demo block in SeoArticle + set per-page lang

**Files:**
- Modify: `app/components/SeoArticle.jsx`
- Test: `app/__tests__/seoArticleDemo.ui.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `app/__tests__/seoArticleDemo.ui.test.jsx`:

```jsx
import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import SeoArticle from '../components/SeoArticle.jsx';
import { getArticleBySlug } from '../lib/seoArticles.mjs';

afterEach(cleanup);

describe('SeoArticle demo block', () => {
  test('renders before/after, a download link, and the license for a demo article', () => {
    const article = getArticleBySlug('world-bank-gdp-csv-to-pdf');
    render(<SeoArticle article={article} />);

    const demo = screen.getByTestId('seo-demo');
    expect(demo).toBeTruthy();

    // download link points at the public sample with the download attribute
    const dl = within(demo).getByTestId('seo-demo-download');
    expect(dl.getAttribute('href')).toBe(article.demo.sampleFile);
    expect(dl.hasAttribute('download')).toBe(true);

    // the rendered-PDF preview image uses the afterImage
    const img = within(demo).getByTestId('seo-demo-after');
    expect(img.getAttribute('src')).toContain(article.demo.afterImage);

    // license attribution is shown
    expect(demo.textContent).toContain('World Bank');
  });

  test('sets lang on the article wrapper for a French page', () => {
    const article = getArticleBySlug('convertir-balance-comptable-csv-en-pdf');
    const { container } = render(<SeoArticle article={article} />);
    expect(container.querySelector('[lang="fr"]')).toBeTruthy();
  });

  test('articles without a demo render no demo block', () => {
    const article = getArticleBySlug('wide-table-pdf-export');
    render(<SeoArticle article={article} />);
    expect(screen.queryByTestId('seo-demo')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/__tests__/seoArticleDemo.ui.test.jsx`
Expected: FAIL — no element with `data-testid="seo-demo"`; `[lang="fr"]` not found.

- [ ] **Step 3: Implement the demo block + lang in `SeoArticle.jsx`**

3a. Set `lang` on the wrapper. Change the outermost element:

```jsx
  return (
    <div lang={article.lang || 'en'} className="min-h-screen bg-[var(--color-bg-hero)]">
```

3b. Render the demo block. Immediately AFTER the `lead` paragraph block (the `<p className="mb-10 ...">{article.lead}</p>`) and BEFORE `{article.sections.map(...)}`, insert:

```jsx
        {article.demo ? (
          <section data-testid="seo-demo" className="mb-12">
            <div className="grid gap-4 sm:grid-cols-2">
              <figure className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  The raw CSV
                </figcaption>
                <pre className="overflow-x-auto whitespace-pre text-[11px] leading-snug text-[var(--color-muted)]">
{article.demo.beforeSnippet}
                </pre>
              </figure>
              <figure className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  The fitforpdf PDF
                </figcaption>
                <img
                  data-testid="seo-demo-after"
                  src={article.demo.afterImage}
                  alt={`${article.h1} — rendered PDF preview`}
                  loading="lazy"
                  className="w-full rounded-lg border border-[var(--color-border)]"
                />
              </figure>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <a
                data-testid="seo-demo-download"
                href={article.demo.sampleFile}
                download={article.demo.downloadName}
                className="inline-block rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] underline-offset-2 hover:bg-black/5"
              >
                Download this sample CSV
              </a>
              <p className="text-xs text-[var(--color-muted)]">{article.demo.license}</p>
            </div>
          </section>
        ) : null}
```

NOTE: do NOT add the "Try this file" button here — that is Phase 2.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/__tests__/seoArticleDemo.ui.test.jsx`
Expected: PASS (all 3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/SeoArticle.jsx app/__tests__/seoArticleDemo.ui.test.jsx
git commit -m "feat(convert): render before/after + download demo block in SeoArticle + per-page lang"
```

---

## Task 4: Add the 3 thin page.jsx files

**Files:**
- Create: `app/convertir-balance-comptable-csv-en-pdf/page.jsx`
- Create: `app/irs-tax-stats-csv-to-pdf/page.jsx`
- Create: `app/world-bank-gdp-csv-to-pdf/page.jsx`

- [ ] **Step 1: Create the DGFiP page (follow the existing 4-line pattern)**

`app/convertir-balance-comptable-csv-en-pdf/page.jsx`:

```jsx
import SeoArticle, { articleMetadata } from '../components/SeoArticle';
import { getArticleBySlug } from '../lib/seoArticles.mjs';

const article = getArticleBySlug('convertir-balance-comptable-csv-en-pdf');
export const metadata = articleMetadata(article);

export default function Page() {
  return <SeoArticle article={article} />;
}
```

- [ ] **Step 2: Create the IRS page**

`app/irs-tax-stats-csv-to-pdf/page.jsx`:

```jsx
import SeoArticle, { articleMetadata } from '../components/SeoArticle';
import { getArticleBySlug } from '../lib/seoArticles.mjs';

const article = getArticleBySlug('irs-tax-stats-csv-to-pdf');
export const metadata = articleMetadata(article);

export default function Page() {
  return <SeoArticle article={article} />;
}
```

- [ ] **Step 3: Create the World Bank page**

`app/world-bank-gdp-csv-to-pdf/page.jsx`:

```jsx
import SeoArticle, { articleMetadata } from '../components/SeoArticle';
import { getArticleBySlug } from '../lib/seoArticles.mjs';

const article = getArticleBySlug('world-bank-gdp-csv-to-pdf');
export const metadata = articleMetadata(article);

export default function Page() {
  return <SeoArticle article={article} />;
}
```

- [ ] **Step 4: Verify the routes build**

Run: `node --test app/__tests__/convertSamplesArticles.test.mjs && npx vitest run app/__tests__/seoArticleDemo.ui.test.jsx`
Expected: PASS (the pages reuse already-tested article + template; this re-confirms nothing regressed).

- [ ] **Step 5: Commit**

```bash
git add app/convertir-balance-comptable-csv-en-pdf app/irs-tax-stats-csv-to-pdf app/world-bank-gdp-csv-to-pdf
git commit -m "feat(convert): add 3 dataset SEO landing pages"
```

---

## Task 5: Generate the before/after preview images

**Files:**
- Create: `public/convert/dgfip-balance-comptable-after.png`, `public/convert/irs-soi-tax-stats-after.png`, `public/convert/world-bank-gdp-after.png`

This is an asset task (no unit test). It renders each trimmed CSV to PDF via the backend and exports page 1 as a PNG. Requires the backend reachable (local `http://127.0.0.1:3000` with `NEATEXPORT_API_KEY`, or prod `https://api.fitforpdf.com/render` with a valid key) and `pdftoppm` (poppler) OR macOS `sips`/Preview for PDF→PNG.

- [ ] **Step 1: Create the output dir**

Run: `mkdir -p public/convert`

- [ ] **Step 2: Render each sample to a PDF**

For each `<name>` in `dgfip-balance-comptable`, `irs-soi-tax-stats`, `world-bank-gdp`:

```bash
curl -fsS -X POST "$RENDER_URL" \
  -H "X-NEATEXPORT-KEY: $RENDER_KEY" \
  -F "file=@public/CSV/<name>.csv" \
  -o "/tmp/<name>.pdf"
```
Expected: a `%PDF` file in `/tmp`. If any returns HTTP 422 (page burden), trim that CSV further in Task 1 and re-run.

- [ ] **Step 3: Export page 1 of each PDF to PNG and place in public/convert/**

With poppler:
```bash
for n in dgfip-balance-comptable irs-soi-tax-stats world-bank-gdp; do
  pdftoppm -png -f 1 -l 1 -r 150 "/tmp/$n.pdf" "public/convert/$n-after"
  # pdftoppm appends -1; normalize the name:
  mv "public/convert/$n-after-1.png" "public/convert/$n-after.png" 2>/dev/null || true
done
```
macOS fallback (no poppler): `sips -s format png /tmp/<name>.pdf --out public/convert/<name>-after.png` (or open in Preview → Export page 1 as PNG).

- [ ] **Step 4: Verify the 3 PNGs exist and are non-empty**

Run: `ls -la public/convert/*.png`
Expected: 3 PNGs, each > 5 KB.

- [ ] **Step 5: Commit**

```bash
git add public/convert/dgfip-balance-comptable-after.png public/convert/irs-soi-tax-stats-after.png public/convert/world-bank-gdp-after.png
git commit -m "feat(convert): add rendered PDF before/after preview images"
```

---

## Task 6: Persona hub → spoke links

**Files:**
- Modify: `app/components/VerticalPage.jsx` (add optional `relatedArticles` prop + render block)
- Modify: `app/for-finance/page.jsx`, `app/for-consultants/page.jsx`
- Test: extend `app/__tests__/seoArticleDemo.ui.test.jsx` (or a new `app/__tests__/personaHubLinks.ui.test.jsx`)

- [ ] **Step 1: Write the failing test**

Create `app/__tests__/personaHubLinks.ui.test.jsx`:

```jsx
import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import VerticalPage from '../components/VerticalPage.jsx';

afterEach(cleanup);

describe('VerticalPage relatedArticles', () => {
  const base = {
    vertical: 'For Finance Teams',
    headline: 'x',
    subheadline: 'y',
    painPoints: [],
    benefits: [],
  };

  test('renders related-article links when provided', () => {
    render(
      <VerticalPage
        {...base}
        relatedArticles={[
          { label: 'Convertir une balance comptable (CSV DGFiP) en PDF', href: '/convertir-balance-comptable-csv-en-pdf' },
        ]}
      />,
    );
    const link = screen.getByRole('link', { name: /balance comptable/i });
    expect(link.getAttribute('href')).toBe('/convertir-balance-comptable-csv-en-pdf');
  });

  test('renders no examples block when relatedArticles is omitted', () => {
    render(<VerticalPage {...base} />);
    expect(screen.queryByTestId('vertical-examples')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/__tests__/personaHubLinks.ui.test.jsx`
Expected: FAIL — link not found / no `relatedArticles` handling.

- [ ] **Step 3: Add the prop + block to `VerticalPage.jsx`**

Add `relatedArticles` to the component's destructured props (alongside `painPoints`, `benefits`):

```jsx
  relatedArticles,
```

Then, just before the related-verticals `<Section>` (the block that lists other verticals), insert:

```jsx
      {relatedArticles && relatedArticles.length > 0 ? (
        <Section id="examples">
          <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text)]">
            Concrete examples
          </h2>
          <ul data-testid="vertical-examples" className="space-y-2">
            {relatedArticles.map((a) => (
              <li key={a.href}>
                <a href={a.href} className={LINK_STYLE}>{a.label}</a>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/__tests__/personaHubLinks.ui.test.jsx`
Expected: PASS.

- [ ] **Step 5: Wire the persona pages**

In `app/for-finance/page.jsx`, add the prop to the `<VerticalPage ... />` call:

```jsx
        relatedArticles={[
          { label: 'Convertir une balance comptable (CSV DGFiP) en PDF', href: '/convertir-balance-comptable-csv-en-pdf' },
          { label: 'Convert IRS tax-stats (SOI) CSV to a printable PDF', href: '/irs-tax-stats-csv-to-pdf' },
          { label: 'Financial report spreadsheet to PDF', href: '/financial-report-spreadsheet-to-pdf' },
        ]}
```

In `app/for-consultants/page.jsx`, add:

```jsx
        relatedArticles={[
          { label: 'Convert a World Bank GDP CSV into a clean PDF table', href: '/world-bank-gdp-csv-to-pdf' },
          { label: 'Wide-table PDF export', href: '/wide-table-pdf-export' },
        ]}
```

- [ ] **Step 6: Run the persona test again + commit**

Run: `npx vitest run app/__tests__/personaHubLinks.ui.test.jsx`
Expected: PASS.

```bash
git add app/components/VerticalPage.jsx app/for-finance/page.jsx app/for-consultants/page.jsx app/__tests__/personaHubLinks.ui.test.jsx
git commit -m "feat(convert): link persona hubs to the dataset pages (hub->spoke)"
```

---

## Task 7: Full verification (tests + build + sitemap)

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all `node --test` files + `vitest run` pass, including the 3 new test files. If unrelated pre-existing failures appear, note them but do not fix in this plan.

- [ ] **Step 2: Build (confirms the 3 new routes compile + are statically generated)**

Run: `npm run build`
Expected: build succeeds; the build output lists `/convertir-balance-comptable-csv-en-pdf`, `/irs-tax-stats-csv-to-pdf`, `/world-bank-gdp-csv-to-pdf` as routes.

- [ ] **Step 3: Confirm the 3 pages are in the sitemap**

Run: `node -e "import('./app/sitemap.js').then(m => console.log(m.default().map(e => e.url).filter(u => /irs-tax-stats|world-bank-gdp|balance-comptable/.test(u))))"`
Expected: prints the 3 absolute URLs (they flow automatically from `SEO_ARTICLES`).

- [ ] **Step 4: Commit any build-output config if needed**

(Usually nothing to commit here. If `npm run build` modified a generated file that is tracked, review and commit it.)

---

## Self-Review (completed by plan author)

- **Spec coverage:** registry-driven pages (Task 2), demo before/after + download (Task 3/5), 3 datasets + trim (Task 1), per-page lang (Task 3), hub→spoke (Task 6), sitemap (auto — verified Task 7), tests (Tasks 2/3/6/7), FAQ/breadcrumb JSON-LD (already in `SeoArticle`). Phase-2 items (live `?sample=<slug>`, backend hash registration) are explicitly OUT of this plan. ✅
- **Placeholder scan:** the only intentional parameter is the DGFiP `COMMUNE` value (`ANNECY`, with a documented swap procedure) and the `beforeSnippet` strings (illustrative real-shaped rows). No "TBD/implement later." ✅
- **Type/name consistency:** `demo.{sampleFile,afterImage,beforeSnippet,downloadName,license,sampleSlug}` and `lang` are used identically in the test (Task 2), the template (Task 3), and the registry (Task 2). `DEMO_ARTICLE_SLUGS`, `getArticleBySlug`, `articleMetadata` match the existing exports. `relatedArticles` prop name matches across Task 6. ✅

---

## Execution note

Phase 1 ships standalone (full SEO value, no backend dependency). After it merges, write the
**Phase 2 plan**: generalize the `?sample=1` mechanism to `?sample=<slug>` (client registry +
server allowlist `app/api/sample/[slug]`), and register the 3 trimmed-file content hashes in
`fitforpdf-backend` so the "Try this file" button auto-renders without burning quota. The
`demo.sampleSlug` field is already in the registry for that wiring.
