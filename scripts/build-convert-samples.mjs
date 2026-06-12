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
