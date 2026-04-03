#!/usr/bin/env node

/**
 * generate-examples.mjs
 *
 * Fetches CSV datasets from data.gouv.fr, sends them to the FitForPDF
 * backend for PDF rendering, takes a screenshot of page 1, and writes
 * the metadata to app/examples/examplesData.mjs.
 *
 * Usage:
 *   node scripts/generate-examples.mjs                  # all examples
 *   node scripts/generate-examples.mjs --slug budget-communal-2024  # one
 *
 * Env vars:
 *   CLEANSHEET_API_URL  — backend URL (default: from .env.local)
 *   CLEANSHEET_API_KEY  — API key   (default: from .env.local)
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_DIR = join(ROOT, 'public', 'examples');
const DATA_FILE = join(ROOT, 'app', 'examples', 'examplesData.mjs');

/* ─── Load env from .env.local if present ─── */
function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const API_URL = process.env.CLEANSHEET_API_URL || process.env.BACKEND_URL;
const API_KEY = process.env.CLEANSHEET_API_KEY || process.env.API_KEY;

if (!API_URL || !API_KEY) {
  console.error('Missing CLEANSHEET_API_URL / CLEANSHEET_API_KEY. Set them in .env.local or env vars.');
  process.exit(1);
}

/* ─── Dataset config ─── */
const DATASETS = [
  {
    slug: 'budget-communal-2024',
    title: 'Municipal Budgets 2024',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/balances-comptables-des-communes/',
    csvUrl: 'https://www.data.gouv.fr/fr/datasets/r/5e5e12f6-2e42-4068-8e64-a6040e2672c7',
    maxRows: 400,
    descriptionTemplate: (rows, cols) =>
      `Annual French municipal budget data — ${cols} financial columns covering revenues, expenses, and balance sheets across ${rows} municipalities.`,
  },
  {
    slug: 'elections-legislatives-2024',
    title: 'Legislative Election Results 2024',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-definitifs-du-1er-tour/',
    csvUrl: 'https://www.data.gouv.fr/fr/datasets/r/27a20e76-d54e-4c70-b3b0-16d5c73e738f',
    maxRows: 600,
    descriptionTemplate: (rows, cols) =>
      `First-round legislative election results — ${cols} columns with candidate names, votes, and turnout per constituency.`,
  },
  {
    slug: 'etablissements-sante-finess',
    title: 'Health Facilities Directory (FINESS)',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/finess-extraction-du-fichier-des-etablissements/',
    csvUrl: 'https://www.data.gouv.fr/fr/datasets/r/2ce43ade-8d2c-4d1d-81da-ca06c82abc68',
    maxRows: 500,
    descriptionTemplate: (rows, cols) =>
      `Directory of French health facilities — ${cols} columns including type, capacity, address, and regulatory status.`,
  },
  {
    slug: 'sirene-entreprises',
    title: 'Business Registry (SIRENE extract)',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
    csvUrl: 'https://www.data.gouv.fr/fr/datasets/r/0651fb76-bcf3-4f6a-a38d-bc04fa708576',
    maxRows: 400,
    descriptionTemplate: (rows, cols) =>
      `French business registry extract — ${cols} columns of company data including legal form, activity codes, workforce, and addresses.`,
  },
];

/* ─── Helpers ─── */

async function fetchCsv(url, maxRows) {
  console.log(`  Fetching CSV from ${url}`);
  const resp = await fetch(url, { redirect: 'follow' });
  if (!resp.ok) throw new Error(`CSV fetch failed: ${resp.status} ${resp.statusText}`);

  const text = await resp.text();
  const lines = text.split('\n').filter((l) => l.trim());
  const header = lines[0];
  const columns = header.split(/[,;\t]/).length;

  // Limit rows (header + maxRows data rows)
  const limited = [header, ...lines.slice(1, maxRows + 1)].join('\n');
  const rows = Math.min(lines.length - 1, maxRows);

  console.log(`  ${rows} rows × ${columns} columns (limited from ${lines.length - 1} rows)`);
  return { csv: limited, rows, columns };
}

async function renderPdf(csvContent, filename) {
  console.log(`  Rendering PDF via ${API_URL}/render`);
  const formData = new FormData();
  formData.append('file', new Blob([csvContent], { type: 'text/csv' }), filename);

  const resp = await fetch(`${API_URL}/render`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY },
    body: formData,
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Render failed: ${resp.status} — ${body.slice(0, 200)}`);
  }

  const pdfBuffer = Buffer.from(await resp.arrayBuffer());
  const sections = parseInt(resp.headers.get('x-fitforpdf-sections') || '0', 10);
  console.log(`  PDF received: ${(pdfBuffer.length / 1024).toFixed(0)}KB, ${sections || '?'} sections`);
  return { pdfBuffer, sections };
}

function countSectionsFromPdf(pdfBuffer) {
  // Simple heuristic: count "SECTION " occurrences in PDF text
  const text = pdfBuffer.toString('latin1');
  const matches = text.match(/SECTION [A-Z]/g);
  return matches ? matches.length : 0;
}

function writeExamplesData(examples) {
  const entries = examples.map((ex) => `  {
    slug: '${ex.slug}',
    title: '${ex.title.replace(/'/g, "\\'")}',
    source: '${ex.source}',
    sourceUrl: '${ex.sourceUrl}',
    description:
      '${ex.description.replace(/'/g, "\\'")}',
    rows: ${ex.rows},
    columns: ${ex.columns},
    sections: ${ex.sections},
    imageSrc: '/examples/${ex.slug}/overview.webp',
    imageSrcSet:
      '/examples/${ex.slug}/overview.webp 1x, /examples/${ex.slug}/overview@2x.webp 2x',
    imageAlt: 'PDF generated from ${ex.title.replace(/'/g, "\\'")} data by fitforpdf — ${ex.columns} columns split into ${ex.sections} sections',
    pdfHref: '/examples/${ex.slug}/output.pdf',
  }`);

  const content = `/**
 * Static data for the /examples page.
 * Auto-generated by scripts/generate-examples.mjs — do not edit manually.
 * Last updated: ${new Date().toISOString().slice(0, 10)}
 */
export const EXAMPLES = [
${entries.join(',\n')},
];
`;

  writeFileSync(DATA_FILE, content, 'utf8');
  console.log(`\n✅ Updated ${DATA_FILE}`);
}

/* ─── Main ─── */

async function processDataset(dataset) {
  const outDir = join(PUBLIC_DIR, dataset.slug);
  mkdirSync(outDir, { recursive: true });

  console.log(`\n▶ ${dataset.title} (${dataset.slug})`);

  // 1. Fetch CSV
  const { csv, rows, columns } = await fetchCsv(dataset.csvUrl, dataset.maxRows);

  // 2. Render PDF
  const { pdfBuffer, sections: headerSections } = await renderPdf(csv, `${dataset.slug}.csv`);

  // 3. Count sections (from header or heuristic)
  const sections = headerSections || countSectionsFromPdf(pdfBuffer);

  // 4. Save PDF
  const pdfPath = join(outDir, 'output.pdf');
  writeFileSync(pdfPath, pdfBuffer);
  console.log(`  Saved PDF to ${pdfPath}`);

  // 5. Screenshot (placeholder message — requires Playwright)
  const overviewPath = join(outDir, 'overview.webp');
  if (!existsSync(overviewPath) || readFileSync(overviewPath).length < 1000) {
    console.log(`  ⚠ Screenshot not generated — run with Playwright for real screenshots`);
    console.log(`    Placeholder image kept at ${overviewPath}`);
  }

  return {
    slug: dataset.slug,
    title: dataset.title,
    source: dataset.source,
    sourceUrl: dataset.sourceUrl,
    description: dataset.descriptionTemplate(rows, columns),
    rows,
    columns,
    sections: sections || 4,
  };
}

async function main() {
  const slugArg = process.argv.find((a) => a === '--slug');
  const slugFilter = slugArg ? process.argv[process.argv.indexOf('--slug') + 1] : null;

  const targets = slugFilter
    ? DATASETS.filter((d) => d.slug === slugFilter)
    : DATASETS;

  if (targets.length === 0) {
    console.error(`No dataset found for slug: ${slugFilter}`);
    process.exit(1);
  }

  console.log(`Generating ${targets.length} example(s)...`);

  const results = [];
  for (const dataset of targets) {
    try {
      const result = await processDataset(dataset);
      results.push(result);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  if (results.length > 0) {
    // If partial update (--slug), merge with existing data
    if (slugFilter) {
      const { EXAMPLES: existing } = await import(DATA_FILE);
      const merged = existing.map((ex) => {
        const updated = results.find((r) => r.slug === ex.slug);
        return updated ? { ...ex, ...updated } : ex;
      });
      writeExamplesData(merged);
    } else {
      writeExamplesData(results);
    }
  }

  console.log(`\nDone. ${results.length}/${targets.length} examples generated.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
