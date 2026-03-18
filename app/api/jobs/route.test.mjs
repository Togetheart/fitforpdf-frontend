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

test('GET /api/jobs forwards to backend /jobs and returns response body', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const responsePayload = {
    items: [{ id: 'job-1', status: 'done' }],
    count: 1,
  };
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/jobs');
    assert.equal(options.method, 'GET');
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/jobs');
  const res = await GET(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.deepEqual(json, responsePayload);
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/jobs forwards limit query param', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/jobs?limit=12');
    return new Response(JSON.stringify({ items: [], count: 0 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/jobs?limit=12');
  const res = await GET(req);
  assert.equal(res.status, 200);
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/jobs forwards cursor and status query params', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/jobs?limit=10&cursor=20&status=failed');
    return new Response(JSON.stringify({ items: [], count: 0, nextCursor: null }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/jobs?limit=10&cursor=20&status=failed');
  const res = await GET(req);
  assert.equal(res.status, 200);
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/jobs forwards anon_id cookie only', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(() => {
    return new Response(JSON.stringify({ items: [], count: 0 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/jobs', {
    headers: { cookie: 'anon_id=signed-token; session=secret123; tracking=abc' },
  });
  const res = await GET(req);
  assert.equal(res.status, 200);
  const upstreamCookie = fetchMock.calls[0].options.headers.Cookie;
  assert.ok(upstreamCookie.includes('anon_id=signed-token'));
  assert.ok(!upstreamCookie.includes('session='));
  assert.ok(!upstreamCookie.includes('tracking='));

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/jobs forwards x-forwarded-for and set-cookie', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ options }) => {
    assert.equal(options.headers['X-Forwarded-For'], '82.123.45.67');
    return new Response(JSON.stringify({ items: [], count: 0 }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'set-cookie': 'anon_id=new-signed-token; HttpOnly; SameSite=Lax; Path=/',
      },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/jobs', {
    headers: { 'x-forwarded-for': '82.123.45.67' },
  });
  const res = await GET(req);
  assert.equal(res.status, 200);
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie);
  assert.ok(setCookie.includes('anon_id=new-signed-token'));

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/jobs requires CLEAN_SHEET_API_URL', async () => {
  const restoreEnv = setupEnv(undefined);
  const fetchMock = withMockFetch(() => {
    throw new Error('unexpected upstream call');
  });

  const req = new Request('https://www.fitforpdf.com/api/jobs');
  const res = await GET(req);
  const json = await res.json();

  assert.equal(res.status, 500);
  assert.equal(json.error, 'Missing required environment variable(s)');
  assert.deepEqual(json.details, { missing: ['CLEAN_SHEET_API_URL'] });
  assert.equal(fetchMock.calls.length, 0);

  fetchMock.restore();
  restoreEnv();
});
