import assert from 'node:assert/strict';
import test from 'node:test';
import { POST } from './route.js';

function withMockFetch(handler) {
  const calls = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    return handler({ url, options });
  };
  return {
    calls,
    restore: () => {
      global.fetch = originalFetch;
    },
  };
}

function setupEnv(value) {
  const previous = process.env.CLEAN_SHEET_API_URL;
  if (value === undefined) {
    delete process.env.CLEAN_SHEET_API_URL;
  } else {
    process.env.CLEAN_SHEET_API_URL = value;
  }
  return () => {
    if (previous === undefined) {
      delete process.env.CLEAN_SHEET_API_URL;
    } else {
      process.env.CLEAN_SHEET_API_URL = previous;
    }
  };
}

test('POST /api/contact requires CLEAN_SHEET_API_URL', async () => {
  const restoreEnv = setupEnv(undefined);
  const req = new Request('https://www.fitforpdf.com/api/contact', {
    method: 'POST',
    body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'Hello' }),
    headers: { 'content-type': 'application/json' },
  });

  const res = await POST(req);
  const payload = await res.json();

  assert.equal(res.status, 500);
  assert.equal(payload.error, 'Missing required environment variable(s)');
  assert.deepEqual(payload.details, { missing: ['CLEAN_SHEET_API_URL'] });

  restoreEnv();
});

test('POST /api/contact forwards payload and returns upstream status', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/v1/contact');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['content-type'], 'application/json');
    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'Hello' }),
  });
  const res = await POST(req);
  const text = await res.text();

  assert.equal(res.status, 201);
  assert.equal(text, JSON.stringify({ ok: true }));
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/contact returns 502 on upstream fetch failure', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(() => {
    throw new Error('network down');
  });

  const req = new Request('https://www.fitforpdf.com/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'Hello' }),
  });
  const res = await POST(req);
  const payload = await res.json();

  assert.equal(res.status, 502);
  assert.equal(payload.error, 'Upstream request failed');
  assert.equal(payload.details.error, 'network down');

  fetchMock.restore();
  restoreEnv();
});

