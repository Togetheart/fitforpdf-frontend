import { getNeatExportApiKey } from './backendKeys.js';

const FORWARD_COOKIES = new Set(['anon_id', 'ffp_session']);

export function upstreamUrl(path) {
  const base = process.env.CLEAN_SHEET_API_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, '')}${path}`;
}

export function filterForwardableCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const kept = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .filter((c) => FORWARD_COOKIES.has(c.split('=')[0]));
  return kept.length ? kept.join('; ') : null;
}

export function buildUpstreamHeaders(req) {
  const headers = {};
  const key = getNeatExportApiKey();
  if (key) headers['X-NEATEXPORT-KEY'] = key;
  const cookie = filterForwardableCookies(req?.headers?.get('cookie'));
  if (cookie) headers.Cookie = cookie;
  const xff = req?.headers?.get('x-forwarded-for');
  if (xff) headers['X-Forwarded-For'] = xff;
  return headers;
}

export function copySetCookies(fromRes, toHeaders) {
  const list = typeof fromRes.headers.getSetCookie === 'function'
    ? fromRes.headers.getSetCookie()
    : (fromRes.headers.get('set-cookie') ? [fromRes.headers.get('set-cookie')] : []);
  for (const c of list) toHeaders.append('set-cookie', c);
}

export function missingEnvResponse() {
  return new Response(
    JSON.stringify({ error: 'Missing required environment variable(s)', details: { missing: ['CLEAN_SHEET_API_URL'] } }),
    { status: 500, headers: { 'content-type': 'application/json' } },
  );
}
