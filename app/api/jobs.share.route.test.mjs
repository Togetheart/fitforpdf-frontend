import assert from 'node:assert/strict';
import test from 'node:test';

import { POST } from './jobs/[jobId]/share/route.js';

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

test('POST /api/jobs/:jobId/share proxies to backend share endpoint and forwards anon cookie only', async () => {
  const restoreEnv = setupEnv('https://api.fitforpdf.neatexport.local');
  const fetchMock = withMockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.fitforpdf.neatexport.local/jobs/job_123/share');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Cookie, 'anon_id=signed-token');
    assert.equal(options.headers['X-Forwarded-For'], '82.123.45.67');
    return new Response(JSON.stringify({
      sharePath: '/jobs/job_123/shared-pdf?token=abc&exp=123',
      expiresAt: '2026-03-26T12:15:00.000Z',
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const req = new Request('https://www.fitforpdf.com/api/jobs/job_123/share', {
    method: 'POST',
    headers: {
      cookie: 'anon_id=signed-token; session=secret123',
      'x-forwarded-for': '82.123.45.67',
    },
  });
  const res = await POST(req, { params: { jobId: 'job_123' } });
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.deepEqual(json, {
    shareUrl: 'https://www.fitforpdf.com/s/job_123?token=abc&exp=123',
    expiresAt: '2026-03-26T12:15:00.000Z',
  });
  assert.equal(fetchMock.calls.length, 1);

  fetchMock.restore();
  restoreEnv();
});

test('POST /api/jobs/:jobId/share requires CLEAN_SHEET_API_URL', async () => {
  const restoreEnv = setupEnv(undefined);
  const fetchMock = withMockFetch(() => {
    throw new Error('unexpected upstream call');
  });

  const req = new Request('https://www.fitforpdf.com/api/jobs/job_123/share', {
    method: 'POST',
  });
  const res = await POST(req, { params: { jobId: 'job_123' } });
  const json = await res.json();

  assert.equal(res.status, 500);
  assert.equal(json.error, 'Missing required environment variable(s)');
  assert.deepEqual(json.details, { missing: ['CLEAN_SHEET_API_URL'] });
  assert.equal(fetchMock.calls.length, 0);

  fetchMock.restore();
  restoreEnv();
});
