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
  return `${upstream.replace(/\/+$/, '')}/v1/request-access`;
}

export async function POST(request) {
  const url = getUpstreamUrl();
  if (!url) {
    return jsonResponse(500, { error: 'Missing upstream config' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: { code: 'invalid_json', message: 'Invalid JSON body' } });
  }

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Upstream request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
    });
  }
}
