export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getUpstreamUrl() {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  return `${upstream.replace(/\/+$/, '')}/v1/subscribe`;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: { code: 'invalid_json', message: 'Invalid JSON body' } });
  }

  const { email } = body;
  if (!email || !email.includes('@')) {
    return jsonResponse(400, { error: { code: 'invalid_email', message: 'A valid email is required' } });
  }

  const url = getUpstreamUrl();
  if (!url) {
    // Fallback: log to stdout so it's captured in deployment logs
    console.log('[newsletter-subscribe]', { email, ts: new Date().toISOString() });
    return jsonResponse(200, { ok: true });
  }

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
    });
  } catch (error) {
    // If upstream fails, still return success
    console.error('[newsletter-subscribe] upstream failed:', error);
    console.log('[newsletter-subscribe]', { email, ts: new Date().toISOString() });
    return jsonResponse(200, { ok: true });
  }
}
