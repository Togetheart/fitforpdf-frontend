import { pathToFileURL } from 'node:url';

const SAMPLE_CSV = `invoice_id,client,total
A102,ACME Corp,4230.00
A103,Northline,1120.00
A104,Widget Co,6900.00
`;

export function buildSmokeUrl(baseUrl, pathname, query = {}) {
  const base = String(baseUrl || '').trim();
  const target = new URL(pathname, `${base.endsWith('/') ? base : `${base}/`}`);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    target.searchParams.set(key, String(value));
  }
  return target.toString();
}

export function parseContentDispositionFilename(contentDisposition) {
  if (!contentDisposition) return null;
  const match = /filename\*=UTF-8''([^;]+)|filename\*=([^;]+)|filename\s*=\s*\"([^\"]+)\"|filename=([^;]+)/i.exec(
    contentDisposition,
  );
  if (!match) return null;
  const raw = match[1] || match[2] || match[3] || match[4];
  if (!raw) return null;
  const cleaned = raw.replace(/^\"|\"$/g, '').trim();
  try {
    return decodeURIComponent(cleaned);
  } catch {
    return cleaned;
  }
}

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const baseUrl = process.env.BASE_URL;
  ensure(baseUrl, 'BASE_URL is required (example: https://www.fitforpdf.com)');

  const getResponse = await fetch(buildSmokeUrl(baseUrl, '/api/render'));
  ensure(
    getResponse.status === 405,
    `GET /api/render expected 405, got ${getResponse.status}`,
  );

  const formData = new FormData();
  formData.append('file', new Blob([SAMPLE_CSV], { type: 'text/csv' }), 'customers-100.csv');

  const postUrl = buildSmokeUrl(baseUrl, '/api/render', {
    mode: 'compact',
    columnMap: 'force',
  });
  const postResponse = await fetch(postUrl, {
    method: 'POST',
    headers: {
      'X-FitForPDF-Source-Filename': 'customers-100.csv',
    },
    body: formData,
  });

  ensure(postResponse.status === 200, `POST /api/render expected 200, got ${postResponse.status}`);
  const postContentType = (postResponse.headers.get('content-type') || '').toLowerCase();
  ensure(
    postContentType.includes('application/pdf'),
    `POST /api/render expected application/pdf, got ${postContentType || '(empty)'}`,
  );

  ensure(
    postResponse.headers.get('x-cleansheet-column-map-rendered') === '1',
    `Expected x-cleansheet-column-map-rendered: 1, got ${postResponse.headers.get('x-cleansheet-column-map-rendered')}`,
  );

  const contentDisposition = postResponse.headers.get('content-disposition');
  const outputFile = parseContentDispositionFilename(contentDisposition);
  ensure(outputFile === 'customers-100.pdf', `Expected filename customers-100.pdf, got ${outputFile}`);

  await postResponse.arrayBuffer();
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(`[smoke:web] ${error.message}`);
    process.exitCode = 1;
  });
}
