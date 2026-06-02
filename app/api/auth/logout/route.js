import { upstreamUrl, buildUpstreamHeaders, copySetCookies, missingEnvResponse } from '../../../lib/authProxy.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const url = upstreamUrl('/auth/logout');
  if (!url) return missingEnvResponse();
  let up;
  try {
    up = await fetch(url, { method: 'POST', headers: buildUpstreamHeaders(req), signal: AbortSignal.timeout(8000) });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
  const text = await up.text();
  const headers = new Headers({ 'content-type': up.headers.get('content-type') || 'application/json' });
  copySetCookies(up, headers);
  return new Response(text, { status: up.status, headers });
}
