import assert from 'node:assert/strict';
import test from 'node:test';
import { GET, POST } from './route.js';

/* ── fetch mocking ───────────────────────────────────────── */
function withMockFetch(handler) {
  const calls = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    return handler({ url, options, index: calls.length - 1 });
  };
  return {
    calls,
    restore: () => { global.fetch = originalFetch; },
  };
}

function setupEnv(vars = {}) {
  const prev = {
    CLEAN_SHEET_API_URL: process.env.CLEAN_SHEET_API_URL,
    NEATEXPORT_API_KEY: process.env.NEATEXPORT_API_KEY,
  };
  process.env.CLEAN_SHEET_API_URL = vars.CLEAN_SHEET_API_URL || 'https://upstream.test';
  process.env.NEATEXPORT_API_KEY = vars.NEATEXPORT_API_KEY || 'test-key';
  return () => {
    for (const k of Object.keys(prev)) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  };
}

function jsonRequest(body) {
  return new Request('http://localhost:3000/api/agent/render', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/* ── method guard ─────────────────────────────────────────── */
test('GET returns 405', async () => {
  const res = await GET();
  assert.equal(res.status, 405);
});

/* ── validation ───────────────────────────────────────────── */
test('POST without file_url returns 400 with explicit error code', async () => {
  const restore = setupEnv();
  const res = await POST(jsonRequest({ mode: 'normal' }));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'file_url_required');
  restore();
});

test('POST rejects non-HTTPS file_url', async () => {
  const restore = setupEnv();
  const res = await POST(jsonRequest({ file_url: 'file:///etc/passwd' }));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'file_url_invalid');
  restore();
});

test('POST rejects http:// (only https allowed, prevents SSRF)', async () => {
  const restore = setupEnv();
  const res = await POST(jsonRequest({ file_url: 'http://internal.company/export.csv' }));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'file_url_invalid');
  restore();
});

test('POST rejects unsupported mode', async () => {
  const restore = setupEnv();
  const res = await POST(jsonRequest({
    file_url: 'https://example.com/data.csv',
    mode: 'weird',
  }));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'mode_invalid');
  restore();
});

/* ── happy path ───────────────────────────────────────────── */
test('POST with file_url downloads, forwards as multipart, returns base64 JSON', async () => {
  const restore = setupEnv();
  const fakePdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // "%PDF-1.4"
  const { calls, restore: restoreFetch } = withMockFetch(async ({ url }) => {
    if (String(url).endsWith('/data.csv')) {
      return new Response(new Blob(['a,b\n1,2'], { type: 'text/csv' }), {
        status: 200,
        headers: { 'content-type': 'text/csv' },
      });
    }
    // upstream /render
    return new Response(fakePdfBytes, {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'x-render-id': 'rid_123',
        'x-cleansheet-score': '95',
        'x-cleansheet-verdict': 'OK',
        'x-render-ms': '412',
      },
    });
  });

  const res = await POST(jsonRequest({
    file_url: 'https://example.com/data.csv',
    mode: 'compact',
    branding: false,
  }));
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /application\/json/);

  const body = await res.json();
  assert.equal(typeof body.pdf_base64, 'string');
  assert.ok(body.pdf_base64.length > 0);
  assert.equal(body.render_id, 'rid_123');
  assert.equal(body.verdict, 'OK');
  assert.equal(body.score, 95);
  assert.ok(
    body.pages === null || body.pages === undefined || typeof body.pages === 'number',
    'pages must be number or nullish',
  );

  // decoded base64 must match the PDF bytes
  const decoded = Buffer.from(body.pdf_base64, 'base64');
  assert.equal(decoded[0], 0x25);
  assert.equal(decoded[4], 0x2d);

  // Two calls: download + upstream render
  assert.equal(calls.length, 2);
  assert.equal(String(calls[0].url), 'https://example.com/data.csv');
  assert.match(String(calls[1].url), /\/render/);

  // API key forwarded
  assert.equal(calls[1].options.headers['X-NEATEXPORT-KEY'], 'test-key');

  // Mode forwarded as query
  assert.match(String(calls[1].url), /mode=compact/);

  restoreFetch();
  restore();
});

test('POST returns 502 when file download fails', async () => {
  const restore = setupEnv();
  const { restore: restoreFetch } = withMockFetch(async () => (
    new Response('Not Found', { status: 404 })
  ));
  const res = await POST(jsonRequest({
    file_url: 'https://example.com/missing.csv',
  }));
  assert.equal(res.status, 502);
  const body = await res.json();
  assert.equal(body.error, 'file_download_failed');
  restoreFetch();
  restore();
});

test('POST rejects file over 10 MB', async () => {
  const restore = setupEnv();
  const { restore: restoreFetch } = withMockFetch(async () => (
    new Response('x', {
      status: 200,
      headers: {
        'content-type': 'text/csv',
        'content-length': String(11 * 1024 * 1024),
      },
    })
  ));
  const res = await POST(jsonRequest({ file_url: 'https://example.com/huge.csv' }));
  assert.equal(res.status, 413);
  const body = await res.json();
  assert.equal(body.error, 'file_too_large');
  restoreFetch();
  restore();
});

test('POST surfaces upstream 422 page-burden with recommendations', async () => {
  const restore = setupEnv();
  const { restore: restoreFetch } = withMockFetch(async ({ url }) => {
    if (String(url).includes('example.com')) {
      return new Response(new Blob(['a,b']), { status: 200, headers: { 'content-type': 'text/csv' } });
    }
    return new Response(
      JSON.stringify({
        error: 'page_burden_high',
        recommendations: ['mode_compact', 'scope_reduce'],
      }),
      { status: 422, headers: { 'content-type': 'application/json' } },
    );
  });
  const res = await POST(jsonRequest({ file_url: 'https://example.com/big.csv' }));
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.equal(body.error, 'page_burden_high');
  assert.deepEqual(body.recommendations, ['mode_compact', 'scope_reduce']);
  restoreFetch();
  restore();
});

test('POST returns 500 when env vars missing', async () => {
  const prev = {
    CLEAN_SHEET_API_URL: process.env.CLEAN_SHEET_API_URL,
    NEATEXPORT_API_KEY: process.env.NEATEXPORT_API_KEY,
  };
  delete process.env.CLEAN_SHEET_API_URL;
  delete process.env.NEATEXPORT_API_KEY;

  const res = await POST(jsonRequest({ file_url: 'https://example.com/data.csv' }));
  assert.equal(res.status, 500);
  const body = await res.json();
  assert.equal(body.error, 'server_misconfigured');

  if (prev.CLEAN_SHEET_API_URL !== undefined) process.env.CLEAN_SHEET_API_URL = prev.CLEAN_SHEET_API_URL;
  if (prev.NEATEXPORT_API_KEY !== undefined) process.env.NEATEXPORT_API_KEY = prev.NEATEXPORT_API_KEY;
});
