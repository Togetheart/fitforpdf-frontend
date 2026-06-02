import { upstreamUrl, buildUpstreamHeaders, copySetCookies } from '../../lib/authProxy.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function redirect(location, extraHeaders) {
  const headers = extraHeaders || new Headers();
  headers.set('location', location);
  return new Response(null, { status: 302, headers });
}

export async function GET(req) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return redirect('/login?error=invalid');

  const url = upstreamUrl('/auth/verify');
  if (!url) return redirect('/login?error=server');

  let up;
  try {
    up = await fetch(url, {
      method: 'POST',
      headers: { ...buildUpstreamHeaders(req), 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    return redirect('/login?error=server');
  }

  if (!up.ok) return redirect('/login?error=expired');

  const headers = new Headers();
  copySetCookies(up, headers);
  return redirect('/app', headers);
}
