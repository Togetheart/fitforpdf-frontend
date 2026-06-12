// Authoring-time tool: download the 3 open datasets and write TIGHTLY-trimmed CSVs
// to public/CSV/. Trimmed so each renders to a short, punchy PDF (a few pages) —
// the demo's job is "messy → clean", not "convert a 50-page report". Row caps keep
// each section to one page; column caps keep the section count (and the front
// table-of-contents) small.
// Run: node scripts/build-convert-samples.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const OUT = join(process.cwd(), 'public', 'CSV');
mkdirSync(OUT, { recursive: true });

// Quote-aware CSV: split a line into fields respecting "quoted, commas" and
// re-join. Keeps cells like "159,651,330" intact when slicing columns.
function parseLine(line, delim) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (q && line[i + 1] === '"') { cur += '""'; i++; } else q = !q; cur += c; }
    else if (c === delim && !q) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
const sliceCols = (line, delim, keepIdx) => keepIdx.map((i) => parseLine(line, delim)[i] ?? '').join(delim);

// 1) DGFiP — a FEW recognizable communes, a handful of account lines each, so
//    the leading columns (commune name, INSEE, SIREN) VARY across rows (a single
//    commune makes them constant → a boring repeated block). A real DGFiP export
//    spans many communes, so this is faithful and a few pages.
const COMMUNES = ['ANNECY', 'CHAMBERY', 'GRENOBLE', 'LYON'];
const DGFIP_PER_COMMUNE = 5;
const inList = COMMUNES.map((c) => `"${c}"`).join(', ');
const dgfipUrl =
  'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/' +
  'balances-comptables-des-communes-en-2024/exports/csv' +
  `?where=${encodeURIComponent(`lbudg in (${inList})`)}&delimiter=%3B`;
{
  const raw = execSync(`curl -fsSL "${dgfipUrl}"`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = lines[0];
  const perCommune = new Map();
  const kept = [];
  for (const l of lines.slice(1)) {
    const lbudg = parseLine(l, ';')[3]; // column 4 (0-indexed 3) = LBUDG (commune)
    const n = perCommune.get(lbudg) || 0;
    if (n < DGFIP_PER_COMMUNE) { kept.push(l); perCommune.set(lbudg, n + 1); }
  }
  writeFileSync(join(OUT, 'dgfip-balance-comptable.csv'), [header, ...kept].join('\n') + '\n');
}

// 2) IRS SOI Historic Table 2 (2022). Full = 163 cols x 595 rows. Keep ONLY the
//    US total across its ~11 AGI brackets (one page of rows) and the first 40
//    columns (the headline income/deduction line items) so the section count
//    stays small. Still genuinely wide + cryptic-coded.
const IRS_COLS = 40;
{
  const raw = execSync('curl -fsSL "https://www.irs.gov/pub/irs-soi/22in55cmcsv.csv"',
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const keepIdx = Array.from({ length: IRS_COLS }, (_, i) => i);
  const header = sliceCols(lines[0], ',', keepIdx);
  const usRows = lines.slice(1)
    .filter((l) => /^"?US"?,/.test(l))
    .map((l) => sliceCols(l, ',', keepIdx));
  writeFileSync(join(OUT, 'irs-soi-tax-stats.csv'), [header, ...usRows].join('\n') + '\n');
}

// 3) World Bank GDP (current US$). Keep ~10 economies and only the LAST ~12 years
//    (drop the 4-line preamble so the header is row 1) — a tidy 3-section demo
//    instead of 17 sections of mostly-empty early decades.
const WB_RECENT_YEARS = 12;
{
  execSync('curl -fsSL "https://api.worldbank.org/v2/en/indicator/NY.GDP.MKTP.CD?downloadformat=csv" -o /tmp/wb.zip', { stdio: 'inherit' });
  execSync('rm -rf /tmp/wb && mkdir -p /tmp/wb && unzip -o /tmp/wb.zip -d /tmp/wb >/dev/null', { stdio: 'inherit' });
  const wbFile = execSync('ls /tmp/wb/API_NY.GDP.MKTP.CD_*.csv', { encoding: 'utf8' }).trim();
  const raw = execSync(`cat "${wbFile}"`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const lines = raw.split(/\r?\n/);
  const headerFields = parseLine(lines[4], ','); // line 5 = real header after the 4-line preamble
  // 4 metadata cols (Country Name/Code, Indicator Name/Code) + the last N year cols.
  // The last field is a phantom empty col (trailing comma) — drop it.
  const lastReal = headerFields.length - 1; // index of the phantom
  const yearStart = Math.max(4, lastReal - WB_RECENT_YEARS);
  const keepIdx = [0, 1, 2, 3, ...Array.from({ length: lastReal - yearStart }, (_, i) => yearStart + i)];
  const KEEP = new Set(['World', 'United States', 'China', 'France', 'Germany', 'Japan', 'India', 'Brazil', 'United Kingdom', 'Canada']);
  const header = sliceCols(lines[4], ',', keepIdx);
  const kept = lines.slice(5)
    .filter((l) => { const m = l.match(/^"([^"]+)"/); return m && KEEP.has(m[1]); })
    .map((l) => sliceCols(l, ',', keepIdx));
  writeFileSync(join(OUT, 'world-bank-gdp.csv'), [header, ...kept].join('\n') + '\n');
}

console.log('Wrote 3 tightly-trimmed CSVs to public/CSV/');
