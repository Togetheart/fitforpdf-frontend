import assert from 'node:assert/strict';
import test from 'node:test';
import { POST } from './route.js';

test('POST forwards to backend /account/billing-portal and returns {url}', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/account/billing-portal');
    assert.equal(options.method, 'POST');
    assert.ok(options.headers.Cookie.includes('ffp_session=s'));
    return new Response(JSON.stringify({ url: 'https://portal.stripe/x' }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const req = new Request('https://www.fitforpdf.com/api/account/billing-portal', { method: 'POST', headers: { cookie: 'ffp_session=s; tracking=x' } });
  const res = await POST(req);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).url, 'https://portal.stripe/x');
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('passes through 400 no_billing', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: 'no_billing' }), { status: 400, headers: { 'content-type': 'application/json' } });
  const res = await POST(new Request('https://www.fitforpdf.com/api/account/billing-portal', { method: 'POST' }));
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'no_billing');
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('500 when CLEAN_SHEET_API_URL missing', async () => {
  delete process.env.CLEAN_SHEET_API_URL;
  const res = await POST(new Request('https://www.fitforpdf.com/api/account/billing-portal', { method: 'POST' }));
  assert.equal(res.status, 500);
});
