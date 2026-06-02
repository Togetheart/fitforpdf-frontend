import assert from 'node:assert/strict';
import test from 'node:test';
import { upstreamUrl, filterForwardableCookies, buildUpstreamHeaders, copySetCookies } from './authProxy.mjs';

test('upstreamUrl joins base + path, strips trailing slash; null when unset', () => {
  const prev = process.env.CLEAN_SHEET_API_URL;
  process.env.CLEAN_SHEET_API_URL = 'https://api.example.com/';
  assert.equal(upstreamUrl('/auth/verify'), 'https://api.example.com/auth/verify');
  delete process.env.CLEAN_SHEET_API_URL;
  assert.equal(upstreamUrl('/me'), null);
  if (prev !== undefined) process.env.CLEAN_SHEET_API_URL = prev;
});

test('filterForwardableCookies keeps only anon_id + ffp_session', () => {
  const out = filterForwardableCookies('anon_id=a; ffp_session=s; tracking=x; _ph=y');
  assert.ok(out.includes('anon_id=a'));
  assert.ok(out.includes('ffp_session=s'));
  assert.ok(!out.includes('tracking='));
  assert.ok(!out.includes('_ph='));
  assert.equal(filterForwardableCookies(''), null);
  assert.equal(filterForwardableCookies('tracking=x'), null);
});

test('buildUpstreamHeaders sets key, forwarded cookies, xff', () => {
  const prevKey = process.env.NEATEXPORT_API_KEY;
  process.env.NEATEXPORT_API_KEY = 'secret-key';
  const req = new Request('https://www.fitforpdf.com/x', {
    headers: { cookie: 'anon_id=a; tracking=x', 'x-forwarded-for': '1.2.3.4' },
  });
  const h = buildUpstreamHeaders(req);
  assert.equal(h['X-NEATEXPORT-KEY'], 'secret-key');
  assert.equal(h.Cookie, 'anon_id=a');
  assert.equal(h['X-Forwarded-For'], '1.2.3.4');
  if (prevKey === undefined) delete process.env.NEATEXPORT_API_KEY; else process.env.NEATEXPORT_API_KEY = prevKey;
});

test('copySetCookies appends every upstream Set-Cookie', () => {
  const upstream = new Response('{}', { status: 200 });
  upstream.headers.append('set-cookie', 'ffp_session=s; HttpOnly; Path=/');
  upstream.headers.append('set-cookie', 'anon_id=; Path=/; Max-Age=0');
  const out = new Headers();
  copySetCookies(upstream, out);
  const all = out.getSetCookie();
  assert.equal(all.length, 2);
  assert.ok(all.some((c) => c.startsWith('ffp_session=')));
  assert.ok(all.some((c) => c.startsWith('anon_id=')));
});
