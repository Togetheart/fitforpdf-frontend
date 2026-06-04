import assert from 'node:assert/strict';
import test from 'node:test';
import { DELETE } from './route.js';

test('DELETE /api/account/contacts/:id proxies with method DELETE and returns upstream JSON/status', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/account/contacts/c1');
    assert.equal(options.method, 'DELETE');
    assert.ok(options.headers.Cookie.includes('ffp_session=s'));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const req = new Request('https://www.fitforpdf.com/api/account/contacts/c1', { method: 'DELETE', headers: { cookie: 'ffp_session=s' } });
  const res = await DELETE(req, { params: { id: 'c1' } });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('DELETE passes through a 404 when not owned', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { 'content-type': 'application/json' } });
  const res = await DELETE(new Request('https://www.fitforpdf.com/api/account/contacts/nope', { method: 'DELETE' }), { params: { id: 'nope' } });
  assert.equal(res.status, 404);
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('DELETE 500 when CLEAN_SHEET_API_URL missing', async () => {
  delete process.env.CLEAN_SHEET_API_URL;
  const res = await DELETE(new Request('https://www.fitforpdf.com/api/account/contacts/c1', { method: 'DELETE' }), { params: { id: 'c1' } });
  assert.equal(res.status, 500);
});
