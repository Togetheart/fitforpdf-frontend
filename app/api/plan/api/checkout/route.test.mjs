import assert from 'node:assert/strict';
import test from 'node:test';
import { POST, GET } from './route.js';

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

function buildRequest(body) {
  return new Request('https://www.fitforpdf.com/api/plan/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('POST /api/plan/api/checkout forwards to /v1/checkout/api with the buyer key', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/v1/checkout/api');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['content-type'], 'application/json');
    // The subscription attaches to the buyer's key identity, so the proxy
    // authenticates upstream with the buyer's key — never the server key.
    assert.equal(options.headers['X-FITFORPDF-KEY'], 'ffp_live_buyer');
    const parsed = JSON.parse(options.body);
    assert.equal(parsed.plan, 'api_starter');
    assert.equal(parsed.apiKey, undefined);
    return new Response(JSON.stringify({ url: 'https://checkout.test/api-starter' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const res = await POST(buildRequest({ plan: 'api_starter', apiKey: 'ffp_live_buyer' }));
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.url, 'https://checkout.test/api-starter');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/plan/api/checkout rejects unknown plans', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(() => {
    throw new Error('must not reach upstream');
  });

  const res = await POST(buildRequest({ plan: 'pro', apiKey: 'ffp_live_buyer' }));

  assert.equal(res.status, 400);
  assert.equal(fetchMock.calls.length, 0);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/plan/api/checkout rejects a missing API key', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(() => {
    throw new Error('must not reach upstream');
  });

  const res = await POST(buildRequest({ plan: 'api_scale' }));

  assert.equal(res.status, 400);
  assert.equal(fetchMock.calls.length, 0);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/plan/api/checkout ignores off-domain redirect URLs', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ options }) => {
    const parsed = JSON.parse(options.body);
    assert.equal(parsed.success_url, 'https://www.fitforpdf.com/success');
    assert.equal(parsed.cancel_url, 'https://www.fitforpdf.com/developers');
    return new Response(JSON.stringify({ url: 'https://checkout.test/api-scale' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const res = await POST(buildRequest({
    plan: 'api_scale',
    apiKey: 'ffp_live_buyer',
    success_url: 'https://evil.example/phish',
    cancel_url: 'http://fitforpdf.com/not-https',
  }));

  assert.equal(res.status, 200);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/plan/api/checkout surfaces upstream errors', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(() => new Response(
    JSON.stringify({ error: { code: 'placeholder_price_id', message: 'price not configured' } }),
    { status: 503, headers: { 'content-type': 'application/json' } },
  ));

  const res = await POST(buildRequest({ plan: 'api_starter', apiKey: 'ffp_live_buyer' }));
  const json = await res.json();

  assert.equal(res.status, 503);
  assert.ok(json.error);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/plan/api/checkout fails fast without upstream config', async () => {
  const restoreEnv = setupEnv(undefined);
  const fetchMock = withMockFetch(() => {
    throw new Error('must not reach upstream');
  });

  const res = await POST(buildRequest({ plan: 'api_starter', apiKey: 'ffp_live_buyer' }));

  assert.equal(res.status, 500);
  assert.equal(fetchMock.calls.length, 0);

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/plan/api/checkout is not allowed', async () => {
  const res = await GET(new Request('https://www.fitforpdf.com/api/plan/api/checkout'));
  assert.equal(res.status, 405);
});
