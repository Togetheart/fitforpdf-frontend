import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from './route.js';

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

test('GET /api/quota forwards to backend /quota and returns response body', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const responsePayload = {
    plan_type: 'free',
    free_exports_left: 4,
    plan: 'free',
  };
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/quota');
    assert.equal(options.method, 'GET');
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const res = await GET();
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.deepEqual(json, responsePayload);
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/quota forwards anon_id cookie to upstream', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(() => {
    return new Response(JSON.stringify({ plan_type: 'free', free_exports_left: 2 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/quota', {
    headers: { cookie: 'anon_id=signed-token-abc' },
  });
  const res = await GET(req);
  assert.equal(res.status, 200);
  assert.equal(fetchMock.calls.length, 1);
  const upstreamHeaders = fetchMock.calls[0].options.headers;
  assert.ok(upstreamHeaders.Cookie, 'anon_id cookie must be forwarded to upstream');
  assert.ok(upstreamHeaders.Cookie.includes('anon_id=signed-token-abc'));

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/quota forwards only anon_id cookie, not other cookies', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(() => {
    return new Response(JSON.stringify({ plan_type: 'free' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/quota', {
    headers: { cookie: 'anon_id=signed-token; session=secret123; tracking=abc' },
  });
  const res = await GET(req);
  assert.equal(res.status, 200);
  const upstreamCookie = fetchMock.calls[0].options.headers.Cookie;
  assert.ok(upstreamCookie.includes('anon_id=signed-token'), 'must forward anon_id');
  assert.ok(!upstreamCookie.includes('session='), 'must not forward session cookie');
  assert.ok(!upstreamCookie.includes('tracking='), 'must not forward tracking cookie');

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/quota forwards set-cookie from upstream response', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(() => {
    return new Response(JSON.stringify({ plan_type: 'free' }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'set-cookie': 'anon_id=new-signed-token; HttpOnly; SameSite=Lax; Path=/',
      },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/quota');
  const res = await GET(req);
  assert.equal(res.status, 200);
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'set-cookie from upstream must be forwarded to browser');
  assert.ok(setCookie.includes('anon_id=new-signed-token'));

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/quota forwards x-forwarded-for to upstream', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(() => {
    return new Response(JSON.stringify({ plan_type: 'free' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/quota', {
    headers: { 'x-forwarded-for': '82.123.45.67' },
  });
  const res = await GET(req);
  assert.equal(res.status, 200);
  assert.equal(fetchMock.calls.length, 1);
  const upstreamHeaders = fetchMock.calls[0].options.headers;
  assert.equal(upstreamHeaders['X-Forwarded-For'], '82.123.45.67');

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/quota requires CLEAN_SHEET_API_URL', async () => {
  const restoreEnv = setupEnv(undefined);
  const fetchMock = withMockFetch(() => {
    throw new Error('unexpected upstream call');
  });

  const res = await GET();
  const json = await res.json();

  assert.equal(res.status, 500);
  assert.equal(json.error, 'Missing required environment variable(s)');
  assert.deepEqual(json.details, { missing: ['CLEAN_SHEET_API_URL'] });
  assert.equal(fetchMock.calls.length, 0);

  fetchMock.restore();
  restoreEnv();
});
