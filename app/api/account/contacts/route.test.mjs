import assert from 'node:assert/strict';
import test from 'node:test';
import { GET, DELETE } from './route.js';

test('GET /api/account/contacts forwards session cookie and returns upstream status+body', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/account/contacts');
    assert.equal(options.method, 'GET');
    assert.ok(options.headers.Cookie.includes('ffp_session=s'));
    return new Response(JSON.stringify({ items: [{ id: 'c1', email: 'a@b.com' }], total: 1 }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const req = new Request('https://www.fitforpdf.com/api/account/contacts', { headers: { cookie: 'ffp_session=s' } });
  const res = await GET(req);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.total, 1);
  assert.equal(body.items[0].email, 'a@b.com');
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('GET /api/account/contacts passes through a 401', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: 'not_authenticated' }), { status: 401, headers: { 'content-type': 'application/json' } });
  const res = await GET(new Request('https://www.fitforpdf.com/api/account/contacts'));
  assert.equal(res.status, 401);
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('DELETE /api/account/contacts proxies with method DELETE and returns upstream JSON/status', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/account/contacts');
    assert.equal(options.method, 'DELETE');
    assert.ok(options.headers.Cookie.includes('ffp_session=s'));
    return new Response(JSON.stringify({ ok: true, deleted: 3 }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const req = new Request('https://www.fitforpdf.com/api/account/contacts', { method: 'DELETE', headers: { cookie: 'ffp_session=s' } });
  const res = await DELETE(req);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.deleted, 3);
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('GET 500 when CLEAN_SHEET_API_URL missing', async () => {
  delete process.env.CLEAN_SHEET_API_URL;
  const res = await GET(new Request('https://www.fitforpdf.com/api/account/contacts'));
  assert.equal(res.status, 500);
});

test('DELETE 500 when CLEAN_SHEET_API_URL missing', async () => {
  delete process.env.CLEAN_SHEET_API_URL;
  const res = await DELETE(new Request('https://www.fitforpdf.com/api/account/contacts', { method: 'DELETE' }));
  assert.equal(res.status, 500);
});
