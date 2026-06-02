import assert from 'node:assert/strict';
import test from 'node:test';
import { POST } from './route.js';

function mockFetch(handler) {
  const calls = [];
  const original = global.fetch;
  global.fetch = async (url, options = {}) => { calls.push({ url, options }); return handler({ url, options }); };
  return { calls, restore: () => { global.fetch = original; } };
}

test('POST /api/auth/request-link forwards to backend and returns its body', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const m = mockFetch(({ url, options }) => {
    assert.equal(url, 'https://api.test.local/auth/request-link');
    assert.equal(options.method, 'POST');
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  const req = new Request('https://www.fitforpdf.com/api/auth/request-link', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'a@b.com' }),
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(m.calls.length, 1);
  m.restore(); delete process.env.CLEAN_SHEET_API_URL;
});

test('POST /api/auth/request-link 500 when CLEAN_SHEET_API_URL missing', async () => {
  delete process.env.CLEAN_SHEET_API_URL;
  const m = mockFetch(() => { throw new Error('should not call'); });
  const req = new Request('https://www.fitforpdf.com/api/auth/request-link', { method: 'POST', body: '{}' });
  const res = await POST(req);
  assert.equal(res.status, 500);
  assert.equal(m.calls.length, 0);
  m.restore();
});
