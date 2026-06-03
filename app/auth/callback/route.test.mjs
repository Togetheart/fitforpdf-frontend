import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from './route.js';

test('valid token → calls upstream /auth/verify, sets cookies, 302 to /app', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/auth/verify');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { token: 'tok123' });
    assert.ok(options.headers.Cookie.includes('anon_id=a'));
    const r = new Response(JSON.stringify({ account: { email: 'x@y.com' } }), { status: 200, headers: { 'content-type': 'application/json' } });
    r.headers.append('set-cookie', 'ffp_session=s; HttpOnly; Path=/');
    r.headers.append('set-cookie', 'anon_id=; Path=/; Max-Age=0');
    return r;
  };
  const req = new Request('https://www.fitforpdf.com/auth/callback?token=tok123', { headers: { cookie: 'anon_id=a' } });
  const res = await GET(req);
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), '/app');
  const cookies = res.headers.getSetCookie();
  assert.ok(cookies.some((c) => c.startsWith('ffp_session=s')));
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('missing token → 302 to /login?error=invalid', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async () => { throw new Error('should not call'); };
  const res = await GET(new Request('https://www.fitforpdf.com/auth/callback'));
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), '/login?error=invalid');
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('upstream rejects token → 302 to /login?error=expired', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: 'invalid_or_expired_token' }), { status: 400, headers: { 'content-type': 'application/json' } });
  const res = await GET(new Request('https://www.fitforpdf.com/auth/callback?token=bad'));
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), '/login?error=expired');
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});
