import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from './route.js';

test('GET /api/account/retained-sources forwards session cookie and returns upstream status+body', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/account/retained-sources');
    assert.equal(options.method, 'GET');
    assert.ok(options.headers.Cookie.includes('ffp_session=s'));
    return new Response(JSON.stringify({ items: [{ id: 'x1', original_name: 'clients.csv' }] }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const req = new Request('https://www.fitforpdf.com/api/account/retained-sources', { headers: { cookie: 'ffp_session=s' } });
  const res = await GET(req);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.items[0].original_name, 'clients.csv');
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('GET /api/account/retained-sources passes through a 401', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: 'not_authenticated' }), { status: 401, headers: { 'content-type': 'application/json' } });
  const res = await GET(new Request('https://www.fitforpdf.com/api/account/retained-sources'));
  assert.equal(res.status, 401);
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('500 when CLEAN_SHEET_API_URL missing', async () => {
  delete process.env.CLEAN_SHEET_API_URL;
  const res = await GET(new Request('https://www.fitforpdf.com/api/account/retained-sources'));
  assert.equal(res.status, 500);
});
