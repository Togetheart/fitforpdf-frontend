import assert from 'node:assert/strict';
import test from 'node:test';
import { POST } from './route.js';

test('POST /api/auth/logout forwards cookies and passes Set-Cookie back', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/auth/logout');
    assert.ok(options.headers.Cookie.includes('ffp_session=s'));
    const r = new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    r.headers.append('set-cookie', 'ffp_session=; Path=/; Max-Age=0');
    return r;
  };
  const req = new Request('https://www.fitforpdf.com/api/auth/logout', { method: 'POST', headers: { cookie: 'ffp_session=s; tracking=x' } });
  const res = await POST(req);
  assert.equal(res.status, 200);
  assert.ok(res.headers.getSetCookie().some((c) => c.startsWith('ffp_session=')));
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});
