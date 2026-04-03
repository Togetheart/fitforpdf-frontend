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

import { writeFileSync, readFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

const API_URL = process.env.CLEAN_SHEET_API_URL || process.env.CLEANSHEET_API_URL || process.env.BACKEND_URL;
const API_KEY = process.env.NEATEXPORT_API_KEY || process.env.CLEANSHEET_API_KEY || process.env.API_KEY;

if (!API_URL || !API_KEY) {
  console.error('Missing CLEANSHEET_API_URL / CLEANSHEET_API_KEY. Set them in .env.local or env vars.');
  process.exit(1);
}

/* ─── Dataset config ─── */
const DATASETS = [
  {
    slug: 'irve-bornes-recharge',
    title: 'Electric Vehicle Charging Stations',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/irve-statique-engie-vianeo/',
    csvUrl: 'https://static.data.gouv.fr/resources/irve-statique-engie-vianeo-all-janvier2025-csv/20251204-125624/data.csv',
    maxRows: 200,
    descriptionTemplate: (rows, cols) =>
      `French EV charging station network — ${cols} columns covering location, operator, connector types, power output, and accessibility across ${rows} stations.`,
  },
  {
    slug: 'elections-europeennes-2024',
    title: 'European Election Results 2024',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/resultats-elections-europeennes-2024/',
    csvUrl: 'https://static.data.gouv.fr/resources/resultats-elections-europeennes-2024-2/20240722-082537/resultats-elections-europeennes-2024.csv',
    maxRows: 200,
    descriptionTemplate: (rows, cols) =>
      `2024 European Parliament election results — ${cols} columns with votes per party, turnout, abstention rates, and blank/null ballots across ${rows} municipalities.`,
  },
  {
    slug: 'annuaire-etablissements-scolaires',
    title: 'School Directory (Orléans Métropole)',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/annuaire-des-etablissements-scolaires-orleans-metropole/',
    csvUrl: 'https://data.orleans-metropole.fr/api/explore/v2.1/catalog/datasets/om-referentiel-annuaire-education/exports/csv?use_labels=true',
    maxRows: 265,
    descriptionTemplate: (rows, cols) =>
      `School directory for Orléans metropolitan area — ${cols} columns including school type, status, address, academic zone, and geographic coordinates across ${rows} establishments.`,
  },
];

/* ─── Helpers ─── */

const MAX_COLUMNS = 50;

async function fetchCsv(url, maxRows) {
  console.log(`  Fetching CSV from ${url}`);
  const resp = await fetch(url, { redirect: 'follow' });
  if (!resp.ok) throw new Error(`CSV fetch failed: ${resp.status} ${resp.statusText}`);

  const text = await resp.text();
  const lines = text.split('\n').filter((l) => l.trim());
  const sep = lines[0].includes(';') ? ';' : ',';
  const totalColumns = lines[0].split(sep).length;

  // Limit columns if needed (backend rejects > ~55 cols)
  let columns = totalColumns;
  let processedLines = lines;
  if (totalColumns > MAX_COLUMNS) {
    console.log(`  Trimming from ${totalColumns} to ${MAX_COLUMNS} columns`);
    processedLines = lines.map((line) => line.split(sep).slice(0, MAX_COLUMNS).join(sep));
    columns = MAX_COLUMNS;
  }

  // Limit rows (header + maxRows data rows)
  const header = processedLines[0];
  const limited = [header, ...processedLines.slice(1, maxRows + 1)].join('\n');
  const rows = Math.min(processedLines.length - 1, maxRows);

  console.log(`  ${rows} rows × ${columns} columns (limited from ${lines.length - 1} rows × ${totalColumns} cols)`);
  return { csv: limited, rows, columns };
}

async function renderPdf(csvContent, filename) {
  console.log(`  Rendering PDF via ${API_URL}/render`);
  const formData = new FormData();
  formData.append('file', new Blob([csvContent], { type: 'text/csv' }), filename);

  const renderUrl = new URL(`${API_URL.replace(/\/$/, '')}/render`);
  renderUrl.searchParams.set('locale', 'en');
  renderUrl.searchParams.set('columnMap', 'auto');

  const resp = await fetch(renderUrl, {
    method: 'POST',
    headers: { 'X-NEATEXPORT-KEY': API_KEY },
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

/* ─── Screenshot ─── */

let _browser = null;
let _httpServer = null;
let _serverPort = 0;

async function ensureBrowser() {
  if (_browser) return _browser;
  const { chromium } = await import('playwright');
  // Use system Chrome (has built-in PDF viewer, unlike headless shell)
  _browser = await chromium.launch({ channel: 'chrome', headless: true });
  return _browser;
}

async function ensureServer() {
  if (_httpServer) return _serverPort;
  const http = await import('http');
  const { createReadStream, statSync } = await import('fs');

  _httpServer = http.createServer((req, res) => {
    const filePath = req.url.slice(1); // strip leading /
    try {
      const stat = statSync(filePath);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': stat.size,
        'Content-Disposition': 'inline',
      });
      createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise((resolve) => {
    _httpServer.listen(0, '127.0.0.1', () => {
      _serverPort = _httpServer.address().port;
      resolve();
    });
  });
  return _serverPort;
}

async function closeBrowserAndServer() {
  if (_browser) { await _browser.close(); _browser = null; }
  if (_httpServer) { _httpServer.close(); _httpServer = null; }
}

async function screenshotPdf(pdfPath, outDir) {
  console.log(`  Taking screenshot...`);
  try {
    const browser = await ensureBrowser();
    const port = await ensureServer();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1200, height: 900 });

    // Serve PDF via HTTP so Chromium renders it inline
    const url = `http://127.0.0.1:${port}/${pdfPath}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    const pngPath = join(outDir, '_screenshot.png');
    await page.screenshot({ path: pngPath, type: 'png' });
    await page.close();

    // Copy PNG as overview images (named .webp for consistency, browsers handle PNG data fine)
    const { copyFileSync } = await import('fs');
    copyFileSync(pngPath, join(outDir, 'overview.webp'));
    copyFileSync(pngPath, join(outDir, 'overview@2x.webp'));
    unlinkSync(pngPath);
    console.log(`  Screenshots saved`);
  } catch (err) {
    console.log(`  ⚠ Screenshot failed: ${err.message}`);
  }
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

  // 5. Screenshot via Playwright
  await screenshotPdf(pdfPath, outDir);

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

  await closeBrowserAndServer();
  console.log(`\nDone. ${results.length}/${targets.length} examples generated.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
