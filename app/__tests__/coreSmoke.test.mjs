/**
 * Smoke tests — verify the core flow (health, sample CSV, upload→PDF) works
 * against the LIVE backend. Catches backend-down / misconfigured regressions.
 *
 * Run:  SMOKE_BACKEND_URL=https://cleansheet-api.neatexport.com npm run smoke:core
 *
 * These tests hit the real backend with a tiny CSV. No credits are consumed
 * (uses the free tier / smoke header).
 */

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const BACKEND_URL = process.env.SMOKE_BACKEND_URL || process.env.CLEAN_SHEET_API_URL;
const API_KEY = process.env.NEATEXPORT_API_KEY || '';

const TINY_CSV = 'Name,Amount,Date\nAlice,1234.56,2026-01-15\nBob,789.00,2026-02-20\nCharlie,456.78,2026-03-10\n';

function skip(reason) {
  console.log(`⏭  Skipping core smoke tests: ${reason}`);
  return true;
}

describe('core smoke tests (live backend)', { skip: !BACKEND_URL && skip('SMOKE_BACKEND_URL not set') }, () => {

  // ── Health endpoint ───────────────────────────────────────────────

  test('GET /health → 200', async () => {
    const url = `${BACKEND_URL.replace(/\/+$/, '')}/health`;
    const res = await fetch(url);
    assert.equal(res.status, 200, `Backend health check failed: HTTP ${res.status}`);
  });

  // ── Sample CSV endpoint ───────────────────────────────────────────

  test('GET /sample/premium.csv → 200 + CSV content', async () => {
    const url = `${BACKEND_URL.replace(/\/+$/, '')}/sample/premium.csv`;
    const res = await fetch(url);
    assert.equal(res.status, 200, `Sample CSV endpoint failed: HTTP ${res.status}`);

    const text = await res.text();
    assert.ok(text.length > 100, `Sample CSV is too short (${text.length} chars)`);
    assert.ok(text.includes(','), 'Sample CSV does not look like CSV (no commas)');
  });

  // ── Render (upload CSV → get PDF) ────────────────────────────────

  test('POST /render with tiny CSV → 200 + PDF response', { skip: !API_KEY && 'NEATEXPORT_API_KEY not set' }, async () => {
    const url = `${BACKEND_URL.replace(/\/+$/, '')}/render?columnMap=auto`;

    const boundary = '----SmokeTestBoundary' + Date.now();
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="smoke-test.csv"',
      'Content-Type: text/csv',
      '',
      TINY_CSV,
      `--${boundary}--`,
    ].join('\r\n');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        ...(API_KEY ? { 'X-NEATEXPORT-KEY': API_KEY } : {}),
      },
      body,
    });

    assert.equal(res.status, 200, `Render failed: HTTP ${res.status}, ${await res.text().catch(() => '(no body)')}`);

    const contentType = res.headers.get('content-type') || '';
    assert.ok(
      contentType.includes('pdf'),
      `Expected PDF content-type, got: ${contentType}`,
    );

    const buffer = await res.arrayBuffer();
    assert.ok(buffer.byteLength > 500, `PDF is suspiciously small: ${buffer.byteLength} bytes`);
  });

  // ── Local sample CSV file exists at expected path ─────────────────

  test('local sample CSV file exists at public/CSV/enterprise-invoices-demo.csv', async () => {
    const csvPath = path.join(process.cwd(), 'public', 'CSV', 'enterprise-invoices-demo.csv');
    const content = await readFile(csvPath, 'utf8');
    assert.ok(content.length > 100, `Local sample CSV is too short (${content.length} chars)`);
    assert.ok(content.includes(','), 'Local sample CSV does not look like CSV');
  });
});
