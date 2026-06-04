import assert from 'node:assert/strict';
import test from 'node:test';
import { GET, DELETE } from './route.js';

test('GET /api/account/retained-sources/:id proxies the file and passes through content-disposition', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/account/retained-sources/x1');
    assert.equal(options.method, 'GET');
    assert.ok(options.headers.Cookie.includes('ffp_session=s'));
    return new Response('col1,col2\n1,2\n', {
      status: 200,
      headers: {
        'content-type': 'text/csv',
        'content-disposition': 'attachment; filename="clients.csv"',
      },
    });
  };
  const req = new Request('https://www.fitforpdf.com/api/account/retained-sources/x1', { headers: { cookie: 'ffp_session=s' } });
  const res = await GET(req, { params: { id: 'x1' } });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-disposition'), 'attachment; filename="clients.csv"');
  assert.equal(res.headers.get('content-type'), 'text/csv');
  const text = await res.text();
  assert.ok(text.includes('col1,col2'));
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('DELETE /api/account/retained-sources/:id proxies with method DELETE and returns upstream JSON/status', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/account/retained-sources/x1');
    assert.equal(options.method, 'DELETE');
    assert.ok(options.headers.Cookie.includes('ffp_session=s'));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const req = new Request('https://www.fitforpdf.com/api/account/retained-sources/x1', { method: 'DELETE', headers: { cookie: 'ffp_session=s' } });
  const res = await DELETE(req, { params: { id: 'x1' } });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('DELETE passes through a 404 when not owned', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { 'content-type': 'application/json' } });
  const res = await DELETE(new Request('https://www.fitforpdf.com/api/account/retained-sources/nope', { method: 'DELETE' }), { params: { id: 'nope' } });
  assert.equal(res.status, 404);
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('GET 500 when CLEAN_SHEET_API_URL missing', async () => {
  delete process.env.CLEAN_SHEET_API_URL;
  const res = await GET(new Request('https://www.fitforpdf.com/api/account/retained-sources/x1'), { params: { id: 'x1' } });
  assert.equal(res.status, 500);
});
