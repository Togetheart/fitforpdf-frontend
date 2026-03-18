import { getNeatExportApiKey } from '../../../../lib/backendKeys.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getStatusUrl() {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  return `${upstream.replace(/\/+$/, '')}/checkout/session-status`;
}

function buildHeaders() {
  const headers = { 'content-type': 'application/json' };
  const apiKey = getNeatExportApiKey();
  if (apiKey) {
    headers['X-NEATEXPORT-KEY'] = apiKey;
  }
  return headers;
}

export async function GET(req) {
  const upstreamUrl = getStatusUrl();
  if (!upstreamUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['CLEAN_SHEET_API_URL'] },
    });
  }

  const search = new URL(req.url).searchParams;
  const sessionId = search.get('session_id') || search.get('sessionId');
  if (!sessionId) {
    return jsonResponse(400, { error: 'Missing session_id query parameter.' });
  }

  let upstreamResponse;
  try {
    const statusUrl = new URL(upstreamUrl);
    statusUrl.searchParams.set('session_id', sessionId);
    upstreamResponse = await fetch(statusUrl.toString(), {
      method: 'GET',
      headers: buildHeaders(),
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Backend status request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
    });
  }

  const contentType = (upstreamResponse.headers.get('content-type') || '').toLowerCase();
  let responsePayload = {};
  if (contentType.includes('application/json')) {
    responsePayload = await upstreamResponse.json().catch(() => ({}));
  } else {
    responsePayload = await upstreamResponse.text().catch(() => ({}));
  }

  if (!upstreamResponse.ok) {
    return jsonResponse(upstreamResponse.status, responsePayload);
  }

  return jsonResponse(200, responsePayload);
}

export async function POST() {
  return jsonResponse(405, { error: 'Method Not Allowed' });
}
