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

test('POST /api/credits/purchase/checkout forwards to backend checkout and returns checkout URL', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/credits/purchase/checkout');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['content-type'], 'application/json');
    const parsed = JSON.parse(options.body);
    assert.equal(parsed.pack, 'credits_100');
    return new Response(JSON.stringify({ url: 'https://checkout.test/credits-50' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/credits/purchase/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pack: 'credits_100' }),
  });
  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.url, 'https://checkout.test/credits-50');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/credits/purchase/checkout forwards idempotency key', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/credits/purchase/checkout');
    assert.equal(options.headers['x-idempotency-key'], 'checkout-idem-credits-api');
    const parsed = JSON.parse(options.body);
    assert.equal(parsed.idempotencyKey, 'checkout-idem-credits-api');
    return new Response(JSON.stringify({ url: 'https://checkout.test/credits-50' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/credits/purchase/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      pack: 'credits_100',
      idempotencyKey: 'checkout-idem-credits-api',
    }),
  });

  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.url, 'https://checkout.test/credits-50');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/credits/purchase/checkout forwards trace headers and returns upstream trace ids', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/credits/purchase/checkout');
    assert.equal(options.headers['x-request-id'], 'frontend-req-credits');
    assert.equal(options.headers['x-trace-id'], 'frontend-req-credits');
    assert.equal(JSON.parse(options.body).pack, 'credits_10');
    return new Response(JSON.stringify({ url: 'https://checkout.test/credits-10' }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'backend-req-credits',
        'x-trace-id': 'backend-trace-credits',
      },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/credits/purchase/checkout', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'frontend-req-credits',
    },
    body: JSON.stringify({ pack: 'credits_10' }),
  });
  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.url, 'https://checkout.test/credits-10');
  assert.equal(res.headers.get('x-request-id'), 'backend-req-credits');
  assert.equal(res.headers.get('x-trace-id'), 'backend-trace-credits');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/credits/purchase/checkout returns 400 for unsupported pack', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(() => {
    throw new Error('unexpected upstream call');
  });

  const req = new Request('https://www.fitforpdf.com/api/credits/purchase/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pack: 'credits_999' }),
  });
  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 400);
  assert.equal(json.error, 'Invalid pack');
  assert.equal(fetchMock.calls.length, 0);

  fetchMock.restore();
  restoreEnv();
});
