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
  const previous = process.env.BACKEND_CHECKOUT_URL;
  if (value === undefined) {
    delete process.env.BACKEND_CHECKOUT_URL;
  } else {
    process.env.BACKEND_CHECKOUT_URL = value;
  }
  return () => {
    if (previous === undefined) {
      delete process.env.BACKEND_CHECKOUT_URL;
    } else {
      process.env.BACKEND_CHECKOUT_URL = previous;
    }
  };
}

test('POST /api/checkout returns URL returned by backend', async () => {
  const restoreEnv = setupEnv('https://checkout.api.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://checkout.api.local/api/checkout');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['content-type'], 'application/json');
    assert.equal(JSON.parse(options.body).pack, 'credits_100');
    return new Response(JSON.stringify({ url: 'https://checkout.stripe.com/session/abc123' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pack: 'credits_100' }),
  });

  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.url, 'https://checkout.stripe.com/session/abc123');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/checkout forwards request/trace id and returns upstream trace headers', async () => {
  const restoreEnv = setupEnv('https://checkout.api.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://checkout.api.local/api/checkout');
    assert.equal(options.headers['x-request-id'], 'trace-request-001');
    assert.equal(options.headers['x-trace-id'], 'trace-request-001');
    assert.equal(JSON.parse(options.body).pack, 'credits_100');
    return new Response(JSON.stringify({ url: 'https://checkout.stripe.com/session/abc123' }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'backend-req-999',
        'x-trace-id': 'backend-trace-999',
      },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/checkout', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'trace-request-001',
    },
    body: JSON.stringify({ pack: 'credits_100' }),
  });
  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.url, 'https://checkout.stripe.com/session/abc123');
  assert.equal(res.headers.get('x-request-id'), 'backend-req-999');
  assert.equal(res.headers.get('x-trace-id'), 'backend-trace-999');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/checkout forwards idempotency key from payload', async () => {
  const restoreEnv = setupEnv('https://checkout.api.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://checkout.api.local/api/checkout');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['x-idempotency-key'], 'checkout-idem-frontend');
    const body = JSON.parse(options.body);
    assert.equal(body.idempotencyKey, 'checkout-idem-frontend');
    return new Response(JSON.stringify({ url: 'https://checkout.stripe.com/session/abc123' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      pack: 'credits_100',
      idempotencyKey: 'checkout-idem-frontend',
    }),
  });

  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.url, 'https://checkout.stripe.com/session/abc123');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/checkout returns 400 when pack is missing', async () => {
  const restoreEnv = setupEnv('https://checkout.api.local');
  const fetchMock = withMockFetch(() => {
    throw new Error('unexpected backend call');
  });

  const req = new Request('https://www.fitforpdf.com/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });

  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 400);
  assert.equal(json.error, 'Invalid pack');
  assert.equal(fetchMock.calls.length, 0);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/checkout sanitizes upstream errors and never leaks Stripe details', async () => {
  const restoreEnv = setupEnv('https://checkout.api.local');
  const leak = 'Expired API Key provided: sk_live_51abcDEFghi****On5o';
  const fetchMock = withMockFetch(() => new Response(
    JSON.stringify({ error: leak, raw: { message: leak } }),
    { status: 401, headers: { 'content-type': 'application/json' } },
  ));
  const logged = [];
  const originalError = console.error;
  console.error = (...args) => { logged.push(args); };

  const req = new Request('https://www.fitforpdf.com/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pack: 'credits_100' }),
  });
  const res = await POST(req);
  const json = await res.json();
  console.error = originalError;

  const serialized = JSON.stringify(json);
  assert.equal(res.status, 401);
  assert.ok(!('details' in json), 'must not echo the upstream payload');
  assert.ok(!serialized.includes('sk_live'), 'must not leak the Stripe key');
  assert.ok(!serialized.includes('Expired API Key'), 'must not leak the raw Stripe message');
  assert.match(json.error, /nothing was charged/);
  assert.ok(
    logged.some((args) => JSON.stringify(args).includes('sk_live')),
    'records the real upstream detail server-side',
  );

  fetchMock.restore();
  restoreEnv();
});
