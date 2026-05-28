import assert from 'node:assert/strict';
import test from 'node:test';
import { GET, POST } from './route.js';

function makeRequestBody(filename = 'customers-100.csv') {
  const formData = new FormData();
  formData.append('file', new Blob(['a,b\n1,2'], { type: 'text/csv' }), filename);
  return formData;
}

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

function setupEnv(vars) {
  const previous = {
    CLEAN_SHEET_API_URL: process.env.CLEAN_SHEET_API_URL,
    NEATEXPORT_API_KEY: process.env.NEATEXPORT_API_KEY,
    FITFORPDF_BENCHMARK_KEY: process.env.FITFORPDF_BENCHMARK_KEY,
  };

  if (vars?.CLEAN_SHEET_API_URL === undefined) {
    delete process.env.CLEAN_SHEET_API_URL;
  } else {
    process.env.CLEAN_SHEET_API_URL = vars.CLEAN_SHEET_API_URL;
  }

  if (vars?.NEATEXPORT_API_KEY === undefined) {
    delete process.env.NEATEXPORT_API_KEY;
  } else {
    process.env.NEATEXPORT_API_KEY = vars.NEATEXPORT_API_KEY;
  }

  if (vars?.FITFORPDF_BENCHMARK_KEY === undefined) {
    delete process.env.FITFORPDF_BENCHMARK_KEY;
  } else {
    process.env.FITFORPDF_BENCHMARK_KEY = vars.FITFORPDF_BENCHMARK_KEY;
  }

  return () => {
    if (previous.CLEAN_SHEET_API_URL === undefined) {
      delete process.env.CLEAN_SHEET_API_URL;
    } else {
      process.env.CLEAN_SHEET_API_URL = previous.CLEAN_SHEET_API_URL;
    }
    if (previous.NEATEXPORT_API_KEY === undefined) {
      delete process.env.NEATEXPORT_API_KEY;
    } else {
      process.env.NEATEXPORT_API_KEY = previous.NEATEXPORT_API_KEY;
    }
    if (previous.FITFORPDF_BENCHMARK_KEY === undefined) {
      delete process.env.FITFORPDF_BENCHMARK_KEY;
    } else {
      process.env.FITFORPDF_BENCHMARK_KEY = previous.FITFORPDF_BENCHMARK_KEY;
    }
  };
}

function assertContentDispositionHeaderFromBinary(response) {
  const value = response.headers.get('content-disposition');
  assert.equal(value, 'attachment; filename="customers-100.pdf"');
}

test('POST /api/render errors when CLEAN_SHEET_API_URL is missing', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: undefined,
    NEATEXPORT_API_KEY: 'k',
  });

  const req = new Request('https://www.fitforpdf.com/api/render', {
    method: 'POST',
    body: makeRequestBody(),
  });
  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 500);
  assert.equal(json.error, 'Missing required environment variable(s)');
  assert.deepEqual(json.details, { missing: ['CLEAN_SHEET_API_URL'] });
  restoreEnv();
});

test('POST /api/render errors when NEATEXPORT_API_KEY is missing', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: undefined,
  });

  const req = new Request('https://www.fitforpdf.com/api/render', {
    method: 'POST',
    body: makeRequestBody(),
  });
  const res = await POST(req);
  const json = await res.json();

  assert.equal(res.status, 500);
  assert.equal(json.error, 'Missing required environment variable(s)');
  assert.deepEqual(json.details, { missing: ['NEATEXPORT_API_KEY'] });
  restoreEnv();
});

test('POST /api/render accepts FITFORPDF_BENCHMARK_KEY as alias', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: undefined,
    FITFORPDF_BENCHMARK_KEY: 'benchmark-key',
  });

  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="server.pdf"',
    },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody('customers-100.csv'),
  });
  const res = await POST(req);

  assert.equal(res.status, 200);
  const { calls } = fetchMock;
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.headers['X-NEATEXPORT-KEY'], 'benchmark-key');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render sets columnMap=auto and derives PDF filename from X-FitForPDF-Source-Filename', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-cleansheet-score': '88',
      'content-disposition': 'inline; filename="server.pdf"',
      connection: 'keep-alive',
    },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody('customers-100.csv'),
    headers: {
      'X-FitForPDF-Source-Filename': 'customers-100.csv',
      'X-CleanSheet-Flow-Id': 'flow-123',
    },
  });
  const res = await POST(req);

  assert.equal(res.status, 200);
  assertContentDispositionHeaderFromBinary(res);
  assert.equal(res.headers.get('x-cleansheet-score'), '88');
  assert.equal(res.headers.get('connection'), null);

  const { calls } = fetchMock;
  assert.equal(calls.length, 1);
  const called = new URL(calls[0].url);
  assert.equal(called.pathname, '/render');
  assert.equal(called.searchParams.get('mode'), 'normal');
  assert.equal(called.searchParams.get('columnMap'), 'auto');
  assert.equal(calls[0].options.headers['X-NEATEXPORT-KEY'], 'backend-key');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render appends locale=en when not provided', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-cleansheet-score': '88',
      'content-disposition': 'inline; filename="server.pdf"',
    },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody('customers-100.csv'),
  });
  const res = await POST(req);

  assert.equal(res.status, 200);

  const { calls } = fetchMock;
  assert.equal(calls.length, 1);
  const called = new URL(calls[0].url);
  assert.equal(called.searchParams.get('locale'), 'en');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render forwards x-locale header as locale query param', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-cleansheet-score': '88',
      'content-disposition': 'inline; filename="server.pdf"',
    },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody('customers-100.csv'),
    headers: {
      'x-locale': 'fr',
    },
  });
  const res = await POST(req);

  assert.equal(res.status, 200);

  const { calls } = fetchMock;
  assert.equal(calls.length, 1);
  const called = new URL(calls[0].url);
  assert.equal(called.searchParams.get('locale'), 'fr');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render exposes render and score timing headers', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-cleansheet-score': '88',
      'x-cleansheet-debug-metrics': JSON.stringify({
        score_ms: 47,
        render_ms: 123,
      }),
    },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=compact', {
    method: 'POST',
    body: makeRequestBody('report.csv'),
    headers: {
      'X-FitForPDF-Source-Filename': 'report.csv',
    },
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  const renderMs = Number.parseInt(res.headers.get('x-render-ms'), 10);
  const scoreMs = Number.parseInt(res.headers.get('x-score-ms'), 10);
  assert.equal(renderMs, 123);
  assert.equal(scoreMs, 47);
  assert.equal(Number.parseInt(res.headers.get('x-total-ms'), 10), 170);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render emits metrics log for render timing', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const originalInfo = console.info;
  const logs = [];
  console.info = (...args) => {
    logs.push(args);
  };

  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
    },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render', {
    method: 'POST',
    body: makeRequestBody('report.csv'),
    headers: {
      'X-FitForPDF-Source-Filename': 'report.csv',
    },
  });
  const res = await POST(req);
  assert.equal(res.status, 200);

  assert.ok(logs.some(([message, payload]) => message === '[fitforpdf-metrics] render' && typeof payload === 'string'));
  const [json] = logs
    .filter(([message]) => message === '[fitforpdf-metrics] render')
    .map(([, payload]) => payload)
    .filter((value) => value);
  const parsed = JSON.parse(json);
  assert.equal(parsed.route, '/api/render');
  assert.equal(parsed.status, 200);
  assert.equal(parsed.sourceFilename, 'report.csv');

  fetchMock.restore();
  console.info = originalInfo;
  restoreEnv();
});

test('POST /api/render does not rewrite content-disposition for non-PDF upstream response', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(JSON.stringify({ error: 'bad' }), {
    status: 400,
    headers: {
      'content-type': 'application/json',
      'content-disposition': 'attachment; filename="fallback.json"',
    },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=compact&columnMap=auto', {
    method: 'POST',
    body: makeRequestBody('customers-100.xlsx'),
    headers: {
      'X-FitForPDF-Source-Filename': 'customers-100.xlsx',
    },
  });

  const res = await POST(req);
  const responseJson = await res.json();

  assert.equal(res.status, 400);
  assert.equal(res.headers.get('content-disposition'), 'attachment; filename="fallback.json"');
  assert.equal(responseJson.error, 'bad');

  const { calls } = fetchMock;
  assert.equal(calls.length, 1);
  const called = new URL(calls[0].url);
  assert.equal(called.pathname, '/render');
  assert.equal(called.searchParams.get('mode'), 'compact');
  assert.equal(called.searchParams.get('columnMap'), 'auto');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render forwards anon_id cookie to upstream', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: { 'content-type': 'application/pdf' },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody(),
    headers: { cookie: 'anon_id=signed-token-xyz' },
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  assert.equal(fetchMock.calls.length, 1);
  const upstreamHeaders = fetchMock.calls[0].options.headers;
  assert.ok(upstreamHeaders.Cookie, 'anon_id cookie must be forwarded to upstream');
  assert.ok(upstreamHeaders.Cookie.includes('anon_id=signed-token-xyz'));

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render forwards only anon_id cookie, not other cookies', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: { 'content-type': 'application/pdf' },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody(),
    headers: { cookie: 'anon_id=token-abc; session=secret; _ga=GA1.2.123' },
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  const upstreamCookie = fetchMock.calls[0].options.headers.Cookie;
  assert.ok(upstreamCookie.includes('anon_id=token-abc'), 'must forward anon_id');
  assert.ok(!upstreamCookie.includes('session='), 'must not forward session cookie');
  assert.ok(!upstreamCookie.includes('_ga='), 'must not forward analytics cookie');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render forwards set-cookie from upstream response', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'set-cookie': 'anon_id=new-token-from-backend; HttpOnly; SameSite=Lax; Path=/',
    },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody(),
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'set-cookie from upstream must be forwarded to browser');
  assert.ok(setCookie.includes('anon_id=new-token-from-backend'));

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render forwards x-forwarded-for to upstream', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: { 'content-type': 'application/pdf' },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody(),
    headers: { 'x-forwarded-for': '82.123.45.67' },
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  assert.equal(fetchMock.calls.length, 1);
  const upstreamHeaders = fetchMock.calls[0].options.headers;
  assert.equal(upstreamHeaders['X-Forwarded-For'], '82.123.45.67');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render forwards explicit X-Export-Intent and X-Idempotency-Key to upstream', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: { 'content-type': 'application/pdf' },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody(),
    headers: {
      'X-Export-Intent': 'intent-abc',
      'X-Idempotency-Key': 'id-abc',
    },
  });
  const res = await POST(req);
  assert.equal(res.status, 200);

  assert.equal(fetchMock.calls.length, 1);
  const upstreamHeaders = fetchMock.calls[0].options.headers;
  assert.equal(upstreamHeaders['X-Export-Intent'], 'intent-abc');
  assert.equal(upstreamHeaders['X-Idempotency-Key'], 'id-abc');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render infers upstream idempotency headers from flow id when absent', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: { 'content-type': 'application/pdf' },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody(),
    headers: {
      'X-CleanSheet-Flow-Id': 'flow-xyz',
    },
  });
  const res = await POST(req);
  assert.equal(res.status, 200);

  assert.equal(fetchMock.calls.length, 1);
  const upstreamHeaders = fetchMock.calls[0].options.headers;
  assert.equal(upstreamHeaders['X-Export-Intent'], 'flow-xyz');
  assert.equal(upstreamHeaders['X-Idempotency-Key'], 'flow-xyz');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render forwards explicit request id headers and returns request id', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-request-id': 'upstream-999',
      'x-trace-id': 'trace-999',
    },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody(),
    headers: {
      'X-Request-Id': 'req-frontend-1',
      'X-Trace-Id': 'trace-in-1',
    },
  });
  const res = await POST(req);
  assert.equal(res.status, 200);

  const upstreamHeaders = fetchMock.calls[0].options.headers;
  assert.equal(upstreamHeaders['X-Request-Id'], 'req-frontend-1');
  assert.equal(upstreamHeaders['X-Trace-Id'], 'trace-in-1');
  assert.equal(res.headers.get('x-request-id'), 'upstream-999');
  assert.equal(res.headers.get('x-trace-id'), 'trace-999');

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render synthesizes request id when missing and returns it', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-trace-id': 'trace-generated',
    },
  }));

  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody(),
  });
  const res = await POST(req);
  assert.equal(res.status, 200);

  const upstreamHeaders = fetchMock.calls[0].options.headers;
  const requestId = upstreamHeaders['X-Request-Id'];
  assert.ok(typeof requestId === 'string' && requestId.length > 0, 'request id should be generated');
  assert.equal(res.headers.get('x-trace-id'), 'trace-generated');
  assert.equal(res.headers.get('x-request-id'), requestId);

  fetchMock.restore();
  restoreEnv();
});

/* ── Header contract (CEO-validated plan, May 2026) ──────────────
 * The post-render result panel relies on these headers reaching the
 * browser. They must survive the proxy unmodified:
 *   - x-render-id   → ties Supabase render rows to PostHog events
 *   - x-cleansheet-score / verdict / reasons → drives result UI
 *   - x-render-ms / x-score-ms / x-total-ms → timings already covered
 * Also: the public V1 API surfaces the same data under X-FitForPDF-*.
 * The proxy must accept those as aliases so we can swap upstream
 * without breaking the front.
 */
test('POST /api/render passes upstream x-render-id through unchanged', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-render-id': 'r_2026_abc_xyz',
    },
  }));
  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody(),
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-render-id'), 'r_2026_abc_xyz');
  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render aliases upstream x-request-id into x-render-id when render id is missing', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-request-id': 'req_v1_current_backend',
    },
  }));
  const req = new Request('https://www.fitforpdf.com/api/render?mode=normal', {
    method: 'POST',
    body: makeRequestBody(),
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-request-id'), 'req_v1_current_backend');
  assert.equal(res.headers.get('x-render-id'), 'req_v1_current_backend');
  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render passes upstream x-cleansheet score/verdict/reasons through', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-cleansheet-score': '92',
      'x-cleansheet-verdict': 'OK',
      'x-cleansheet-reasons': 'min_font_low,high_wrap_rate',
    },
  }));
  const req = new Request('https://www.fitforpdf.com/api/render', {
    method: 'POST',
    body: makeRequestBody(),
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-cleansheet-score'), '92');
  assert.equal(res.headers.get('x-cleansheet-verdict'), 'OK');
  assert.equal(res.headers.get('x-cleansheet-reasons'), 'min_font_low,high_wrap_rate');
  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render aliases X-FitForPDF-* response headers into x-cleansheet-*', async () => {
  /* If the upstream evolves to the V1 API (X-FitForPDF-Score / Verdict /
   * Reasons), the front must keep working without code changes. The proxy
   * mirrors them into the legacy header names. */
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-fitforpdf-score': '88',
      'x-fitforpdf-verdict': 'WARN',
      'x-fitforpdf-reasons': 'high_wrap_rate',
      'x-fitforpdf-render-id': 'r_v1_abc',
    },
  }));
  const req = new Request('https://www.fitforpdf.com/api/render', {
    method: 'POST',
    body: makeRequestBody(),
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  // Original V1 headers still exposed
  assert.equal(res.headers.get('x-fitforpdf-score'), '88');
  assert.equal(res.headers.get('x-fitforpdf-verdict'), 'WARN');
  // Aliased into x-cleansheet-* so existing front parser keeps working
  assert.equal(res.headers.get('x-cleansheet-score'), '88');
  assert.equal(res.headers.get('x-cleansheet-verdict'), 'WARN');
  assert.equal(res.headers.get('x-cleansheet-reasons'), 'high_wrap_rate');
  assert.equal(res.headers.get('x-render-id'), 'r_v1_abc');
  fetchMock.restore();
  restoreEnv();
});

test('POST /api/render prefers explicit x-cleansheet-* over X-FitForPDF-* when both are present', async () => {
  const restoreEnv = setupEnv({
    CLEAN_SHEET_API_URL: 'https://cleansheet-api.neatexport.com',
    NEATEXPORT_API_KEY: 'backend-key',
  });
  const fetchMock = withMockFetch(() => new Response(new Uint8Array([37, 80, 68, 70]), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'x-cleansheet-score': '92',
      'x-cleansheet-verdict': 'OK',
      'x-fitforpdf-score': '11',
      'x-fitforpdf-verdict': 'FAIL',
    },
  }));
  const req = new Request('https://www.fitforpdf.com/api/render', {
    method: 'POST',
    body: makeRequestBody(),
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-cleansheet-score'), '92');
  assert.equal(res.headers.get('x-cleansheet-verdict'), 'OK');
  fetchMock.restore();
  restoreEnv();
});

test('GET /api/render is not allowed', async () => {
  const res = await GET();
  const json = await res.json();

  assert.equal(res.status, 405);
  assert.equal(json.error, 'Method Not Allowed');
});
