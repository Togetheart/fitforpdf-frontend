import assert from 'node:assert/strict';
import test from 'node:test';
import { GET, POST } from './route.js';

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

test('GET /api/checkout/status returns 500 when CLEAN_SHEET_API_URL is missing', async () => {
  const restoreEnv = setupEnv();

  const req = new Request('https://www.fitforpdf.com/api/checkout/status?session_id=cs_123');
  const res = await GET(req);
  const json = await res.json();

  assert.equal(res.status, 500);
  assert.equal(json.error, 'Missing required environment variable(s)');
  assert.deepEqual(json.details, { missing: ['CLEAN_SHEET_API_URL'] });

  restoreEnv();
});

test('GET /api/checkout/status returns 400 when session_id is missing', async () => {
  const restoreEnv = setupEnv('https://backend.api');
  const req = new Request('https://www.fitforpdf.com/api/checkout/status');
  const res = await GET(req);
  const json = await res.json();

  assert.equal(res.status, 400);
  assert.equal(json.error, 'Missing session_id query parameter.');

  restoreEnv();
});

test('GET /api/checkout/status forwards session_id to backend and returns payload', async () => {
  const restoreEnv = setupEnv('https://backend.api');
  process.env.NEATEXPORT_API_KEY = 'backend-key';

  const fetchMock = withMockFetch(({ url, options }) => {
    const called = new URL(url);
    assert.equal(called.pathname, '/checkout/session-status');
    assert.equal(called.searchParams.get('session_id'), 'cs_abc');
    assert.equal(options.headers['X-NEATEXPORT-KEY'], 'backend-key');
    return new Response(JSON.stringify({ id: 'cs_abc', status: 'complete', paymentStatus: 'paid' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/checkout/status?session_id=cs_abc');
  const res = await GET(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.id, 'cs_abc');
  assert.equal(json.status, 'complete');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
  delete process.env.NEATEXPORT_API_KEY;
});

test('GET /api/checkout/status accepts sessionId alias parameter', async () => {
  const restoreEnv = setupEnv('https://backend.api');
  const fetchMock = withMockFetch(({ url }) => {
    const called = new URL(url);
    assert.equal(called.searchParams.get('session_id'), 'cs_alias');
    return new Response(JSON.stringify({ id: 'cs_alias' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/checkout/status?sessionId=cs_alias');
  const res = await GET(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.id, 'cs_alias');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/checkout/status forwards upstream 502 payload on fetch failure', async () => {
  const restoreEnv = setupEnv('https://backend.api');
  const fetchMock = withMockFetch(() => new Response(JSON.stringify({ error: 'rate limited' }), {
    status: 502,
    headers: { 'content-type': 'application/json' },
  }));

  const req = new Request('https://www.fitforpdf.com/api/checkout/status?session_id=cs_abc');
  const res = await GET(req);
  const json = await res.json();

  assert.equal(res.status, 502);
  assert.equal(json.error, 'rate limited');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/checkout/status forwards request/trace id to backend and returns upstream trace headers', async () => {
  const restoreEnv = setupEnv('https://backend.api');
  process.env.NEATEXPORT_API_KEY = 'backend-key';

  const fetchMock = withMockFetch(({ url, options }) => {
    const called = new URL(url);
    assert.equal(called.pathname, '/checkout/session-status');
    assert.equal(called.searchParams.get('session_id'), 'cs_abc');
    assert.equal(options.headers['x-request-id'], 'frontend-status-id');
    assert.equal(options.headers['x-trace-id'], 'frontend-status-id');
    assert.equal(options.headers['X-NEATEXPORT-KEY'], 'backend-key');
    return new Response(JSON.stringify({ status: 'complete' }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'backend-status-req',
        'x-trace-id': 'backend-status-trace',
      },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/checkout/status?session_id=cs_abc', {
    headers: {
      'x-request-id': 'frontend-status-id',
    },
  });
  const res = await GET(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.status, 'complete');
  assert.equal(res.headers.get('x-request-id'), 'backend-status-req');
  assert.equal(res.headers.get('x-trace-id'), 'backend-status-trace');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
  delete process.env.NEATEXPORT_API_KEY;
});

test('GET /api/checkout/status returns 502 when fetch throws', async () => {
  const restoreEnv = setupEnv('https://backend.api');
  const fetchMock = withMockFetch(() => {
    throw new Error('network down');
  });

  const req = new Request('https://www.fitforpdf.com/api/checkout/status?session_id=cs_down');
  const res = await GET(req);
  const json = await res.json();

  assert.equal(res.status, 502);
  assert.equal(json.error, 'Backend status request failed');
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/checkout/status keeps request header and returns it when upstream returns no trace ids', async () => {
  const restoreEnv = setupEnv('https://backend.api');
  const fetchMock = withMockFetch(({ url, options }) => {
    const called = new URL(url);
    assert.equal(called.searchParams.get('session_id'), 'cs_down');
    assert.equal(options.headers['x-request-id'], 'frontend-down');
    return new Response(JSON.stringify({ status: 'open' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/checkout/status?session_id=cs_down', {
    headers: {
      'x-trace-id': 'frontend-down',
    },
  });
  const res = await GET(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.status, 'open');
  assert.equal(res.headers.get('x-request-id'), 'frontend-down');
  assert.equal(res.headers.get('x-trace-id'), 'frontend-down');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/checkout/status returns 405', async () => {
  const req = new Request('https://www.fitforpdf.com/api/checkout/status', {
    method: 'POST',
  });
  const res = await POST();
  const json = await res.json();

  assert.equal(res.status, 405);
  assert.equal(json.error, 'Method Not Allowed');
});
