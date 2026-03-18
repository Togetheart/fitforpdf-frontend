import { getNeatExportApiKey } from '../../../lib/backendKeys.js';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  });
}

function buildRequestId(req) {
  const explicit = req?.headers?.get?.('x-request-id') || req?.headers?.get?.('x-trace-id');
  if (typeof explicit === 'string') {
    const trimmed = explicit.trim();
    if (trimmed) return trimmed;
  }
  return randomUUID();
}

function buildTraceHeaders(requestId) {
  return {
    'x-request-id': requestId,
    'x-trace-id': requestId,
  };
}

function buildResponseHeaders(requestId, upstreamResponse) {
  const upstreamRequestId = upstreamResponse?.headers?.get?.('x-request-id');
  const upstreamTraceId = upstreamResponse?.headers?.get?.('x-trace-id');
  return {
    'content-type': 'application/json',
    'x-request-id': upstreamRequestId || requestId,
    'x-trace-id': upstreamTraceId || upstreamRequestId || requestId,
  };
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
  const requestId = buildRequestId(req);
  const upstreamUrl = getStatusUrl();
  if (!upstreamUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['CLEAN_SHEET_API_URL'] },
    }, buildResponseHeaders(requestId));
  }

  const search = new URL(req.url).searchParams;
  const sessionId = search.get('session_id') || search.get('sessionId');
  if (!sessionId) {
    return jsonResponse(400, { error: 'Missing session_id query parameter.' }, buildResponseHeaders(requestId));
  }

  let upstreamResponse;
  try {
    const statusUrl = new URL(upstreamUrl);
    statusUrl.searchParams.set('session_id', sessionId);
    upstreamResponse = await fetch(statusUrl.toString(), {
      method: 'GET',
      headers: {
        ...buildHeaders(),
        ...buildTraceHeaders(requestId),
      },
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Backend status request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
    }, buildResponseHeaders(requestId));
  }

  const contentType = (upstreamResponse.headers.get('content-type') || '').toLowerCase();
  let responsePayload = {};
  if (contentType.includes('application/json')) {
    responsePayload = await upstreamResponse.json().catch(() => ({}));
  } else {
    responsePayload = await upstreamResponse.text().catch(() => ({}));
  }

  if (!upstreamResponse.ok) {
    return jsonResponse(upstreamResponse.status, responsePayload, buildResponseHeaders(requestId, upstreamResponse));
  }

  return jsonResponse(200, responsePayload, buildResponseHeaders(requestId, upstreamResponse));
}

export async function POST(req) {
  const requestId = buildRequestId(req);
  return jsonResponse(405, { error: 'Method Not Allowed' }, buildResponseHeaders(requestId));
}
