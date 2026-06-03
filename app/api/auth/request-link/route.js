import { upstreamUrl, buildUpstreamHeaders, missingEnvResponse } from '../../../lib/authProxy.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const url = upstreamUrl('/auth/request-link');
  if (!url) return missingEnvResponse();
  const body = await req.text();
  let up;
  try {
    up = await fetch(url, {
      method: 'POST',
      headers: { ...buildUpstreamHeaders(req), 'content-type': 'application/json' },
      body,
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
  const text = await up.text();
  return new Response(text, { status: up.status, headers: { 'content-type': up.headers.get('content-type') || 'application/json' } });
}

export async function GET() {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
}
