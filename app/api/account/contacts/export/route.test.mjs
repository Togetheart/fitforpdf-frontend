import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from './route.js';

test('GET /api/account/contacts/export proxies the CSV and passes through content-type + content-disposition', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test.local/account/contacts.csv');
    assert.equal(options.method, 'GET');
    assert.ok(options.headers.Cookie.includes('ffp_session=s'));
    return new Response('email,name\na@b.com,Alice\n', {
      status: 200,
      headers: {
        'content-type': 'text/csv',
        'content-disposition': 'attachment; filename="contacts.csv"',
      },
    });
  };
  const req = new Request('https://www.fitforpdf.com/api/account/contacts/export', { headers: { cookie: 'ffp_session=s' } });
  const res = await GET(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-disposition'), 'attachment; filename="contacts.csv"');
  assert.equal(res.headers.get('content-type'), 'text/csv');
  const text = await res.text();
  assert.ok(text.includes('email,name'));
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('GET /api/account/contacts/export passes through a 401', async () => {
  process.env.CLEAN_SHEET_API_URL = 'https://api.test.local';
  const original = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: 'not_authenticated' }), { status: 401, headers: { 'content-type': 'application/json' } });
  const res = await GET(new Request('https://www.fitforpdf.com/api/account/contacts/export'));
  assert.equal(res.status, 401);
  global.fetch = original; delete process.env.CLEAN_SHEET_API_URL;
});

test('GET 500 when CLEAN_SHEET_API_URL missing', async () => {
  delete process.env.CLEAN_SHEET_API_URL;
  const res = await GET(new Request('https://www.fitforpdf.com/api/account/contacts/export'));
  assert.equal(res.status, 500);
});
