import assert from 'node:assert/strict';
import test from 'node:test';

import { GET } from './s/[jobId]/route.js';

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

test('GET /s/:jobId proxies to backend shared PDF endpoint', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/jobs/job_123/shared-pdf?token=abc&exp=123');
    assert.equal(options.method, 'GET');
    assert.equal(options.headers['X-Forwarded-For'], '82.123.45.67');
    return new Response(new Uint8Array([37, 80, 68, 70]), {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'inline; filename="shared.pdf"',
      },
    });
  });

  const req = new Request('https://www.fitforpdf.com/s/job_123?token=abc&exp=123', {
    headers: {
      'x-forwarded-for': '82.123.45.67',
    },
  });
  const res = await GET(req, { params: { jobId: 'job_123' } });
  const bytes = new Uint8Array(await res.arrayBuffer());

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.equal(res.headers.get('content-disposition'), 'inline; filename="shared.pdf"');
  assert.deepEqual(Array.from(bytes), [37, 80, 68, 70]);
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('GET /s/:jobId requires CLEAN_SHEET_API_URL', async () => {
  const restoreEnv = setupEnv(undefined);
  const fetchMock = withMockFetch(() => {
    throw new Error('unexpected upstream call');
  });

  const req = new Request('https://www.fitforpdf.com/s/job_123?token=abc&exp=123');
  const res = await GET(req, { params: { jobId: 'job_123' } });
  const json = await res.json();

  assert.equal(res.status, 500);
  assert.equal(json.error, 'Missing required environment variable(s)');
  assert.deepEqual(json.details, { missing: ['CLEAN_SHEET_API_URL'] });
  assert.equal(fetchMock.calls.length, 0);

  fetchMock.restore();
  restoreEnv();
});
