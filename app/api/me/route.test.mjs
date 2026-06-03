import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from './route.js';

test('GET /api/me forwards session cookie and returns upstream status+body', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/me');
    assert.ok(options.headers.Cookie.includes('ffp_session=s'));
    return new Response(JSON.stringify({ account: { email: 'x@y.com' } }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const req = new Request('https://www.fitforpdf.com/api/me', { headers: { cookie: 'ffp_session=s' } });
  const res = await GET(req);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).account.email, 'x@y.com');
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('GET /api/me passes through a 401', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: 'not_authenticated' }), { status: 401, headers: { 'content-type': 'application/json' } });
  const res = await GET(new Request('https://www.fitforpdf.com/api/me'));
  assert.equal(res.status, 401);
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});
