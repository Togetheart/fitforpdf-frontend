export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getQuotaUrl() {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  return `${upstream.replace(/\/+$/, '')}/quota`;
}

function buildHeaders() {
  const headers = {};
  if (process.env.NEATEXPORT_API_KEY) {
    headers['X-NEATEXPORT-KEY'] = process.env.NEATEXPORT_API_KEY;
  }
  return headers;
}

export async function GET() {
  const quotaUrl = getQuotaUrl();
  if (!quotaUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['CLEAN_SHEET_API_URL'] },
    });
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(quotaUrl, {
      method: 'GET',
      headers: buildHeaders(),
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Upstream request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
    });
  }

  const body = await upstreamResponse.text();
  const contentType = upstreamResponse.headers.get('content-type') || 'application/json';
  return new Response(body, {
    status: upstreamResponse.status,
    headers: { 'content-type': contentType },
  });
}

export async function POST() {
  return jsonResponse(405, { error: 'Method Not Allowed' });
}

