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

test('POST /api/plan/pro/checkout forwards to backend checkout endpoint', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/plan/pro/checkout');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['content-type'], 'application/json');
    const parsed = JSON.parse(options.body);
    assert.equal(parsed.source, 'landing');
    return new Response(JSON.stringify({ url: 'https://checkout.test/pro' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/plan/pro/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ source: 'landing' }),
  });
  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.url, 'https://checkout.test/pro');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/plan/pro/checkout forwards idempotency key', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/plan/pro/checkout');
    assert.equal(options.headers['x-idempotency-key'], 'checkout-idem-pro-api');
    const parsed = JSON.parse(options.body);
    assert.equal(parsed.idempotencyKey, 'checkout-idem-pro-api');
    return new Response(JSON.stringify({ url: 'https://checkout.test/pro' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/plan/pro/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ source: 'landing', idempotencyKey: 'checkout-idem-pro-api' }),
  });
  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.url, 'https://checkout.test/pro');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/plan/pro/checkout forwards trace headers and returns upstream trace ids', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/plan/pro/checkout');
    assert.equal(options.headers['x-request-id'], 'frontend-req-pro');
    assert.equal(options.headers['x-trace-id'], 'frontend-req-pro');
    assert.equal(JSON.parse(options.body).source, 'landing');
    return new Response(JSON.stringify({ url: 'https://checkout.test/pro' }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'backend-req-pro',
        'x-trace-id': 'backend-trace-pro',
      },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/plan/pro/checkout', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'frontend-req-pro',
    },
    body: JSON.stringify({ source: 'landing' }),
  });
  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.url, 'https://checkout.test/pro');
  assert.equal(res.headers.get('x-request-id'), 'backend-req-pro');
  assert.equal(res.headers.get('x-trace-id'), 'backend-trace-pro');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/plan/pro/checkout returns 405 for missing backend URL', async () => {
  const restoreEnv = setupEnv(undefined);
  const fetchMock = withMockFetch(() => {
    throw new Error('unexpected upstream call');
  });

  const req = new Request('https://www.fitforpdf.com/api/plan/pro/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ source: 'landing' }),
  });
  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 500);
  assert.equal(json.error, 'Missing required environment variable(s)');
  assert.equal(fetchMock.calls.length, 0);

  fetchMock.restore();
  restoreEnv();
});
