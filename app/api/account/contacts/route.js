import { upstreamUrl, buildUpstreamHeaders, copySetCookies, missingEnvResponse } from '../../../lib/authProxy.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = upstreamUrl('/account/contacts');
  if (!url) return missingEnvResponse();
  let up;
  try {
    up = await fetch(url, { method: 'GET', headers: buildUpstreamHeaders(req), signal: AbortSignal.timeout(8000) });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
  const text = await up.text();
  const headers = new Headers({ 'content-type': up.headers.get('content-type') || 'application/json' });
  copySetCookies(up, headers);
  return new Response(text, { status: up.status, headers });
}

export async function DELETE(req) {
  const url = upstreamUrl('/account/contacts');
  if (!url) return missingEnvResponse();
  let up;
  try {
    up = await fetch(url, { method: 'DELETE', headers: buildUpstreamHeaders(req), signal: AbortSignal.timeout(8000) });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
  const text = await up.text();
  const headers = new Headers({ 'content-type': up.headers.get('content-type') || 'application/json' });
  copySetCookies(up, headers);
  return new Response(text, { status: up.status, headers });
}
