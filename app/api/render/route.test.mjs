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

test('POST /api/render forces columnMap=force and derives PDF filename from X-FitForPDF-Source-Filename', async () => {
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
  assert.equal(called.searchParams.get('columnMap'), 'force');
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
  assert.equal(called.searchParams.get('columnMap'), 'force');

  fetchMock.restore();
  restoreEnv();
});

test('GET /api/render is not allowed', async () => {
  const res = await GET();
  const json = await res.json();

  assert.equal(res.status, 405);
  assert.equal(json.error, 'Method Not Allowed');
});
