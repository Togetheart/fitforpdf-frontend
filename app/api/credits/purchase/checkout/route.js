import { getNeatExportApiKey } from '../../../../lib/backendKeys.js';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PACKS = new Set(['credits_1', 'credits_10', 'credits_100', 'credits_500']);

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

function buildHeaders() {
  const headers = { 'content-type': 'application/json' };
  const apiKey = getNeatExportApiKey();
  if (apiKey) {
    headers['X-NEATEXPORT-KEY'] = apiKey;
  }
  return headers;
}

function getCheckoutUrl() {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  return `${upstream.replace(/\/+$/, '')}/credits/purchase/checkout`;
}

function getIdempotencyKey(req, payload) {
  const header = req?.headers?.get?.('x-idempotency-key') || req?.headers?.get?.('idempotency-key');
  return (
    header
    || payload?.idempotencyKey
    || payload?.idempotency_key
  );
}

export async function POST(req) {
  const requestId = buildRequestId(req);
  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: buildResponseHeaders(requestId),
    });
  }

  const pack = payload?.pack;
  if (!ALLOWED_PACKS.has(pack)) {
    return jsonResponse(400, { error: 'Invalid pack' }, buildResponseHeaders(requestId));
  }

  const checkoutUrl = getCheckoutUrl();
  if (!checkoutUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['CLEAN_SHEET_API_URL'] },
    }, buildResponseHeaders(requestId));
  }

  let upstreamResponse;
  try {
    const successUrl = payload?.success_url || 'https://www.fitforpdf.com/success';
    const cancelUrl = payload?.cancel_url || 'https://www.fitforpdf.com/';
    const idempotencyKey = getIdempotencyKey(req, payload);
    upstreamResponse = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        ...buildHeaders(),
        ...buildTraceHeaders(requestId),
        ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {}),
      },
      body: JSON.stringify({
        pack,
        success_url: successUrl,
        cancel_url: cancelUrl,
        ...(idempotencyKey ? { idempotencyKey } : {}),
      }),
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Backend checkout request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
    }, buildResponseHeaders(requestId));
  }

  const contentType = (upstreamResponse.headers.get('content-type') || '').toLowerCase();
  let responsePayload = {};
  if (contentType.includes('application/json')) {
    responsePayload = await upstreamResponse.json().catch(() => ({}));
  }

  if (!upstreamResponse.ok) {
    return jsonResponse(upstreamResponse.status, {
      error: responsePayload?.error || 'Checkout failed',
      details: responsePayload,
    }, buildResponseHeaders(requestId, upstreamResponse));
  }

  const checkoutRedirect = typeof responsePayload?.url === 'string' ? responsePayload.url.trim() : '';
  if (!checkoutRedirect) {
    return jsonResponse(502, {
      error: 'Invalid checkout response',
      details: responsePayload,
    }, buildResponseHeaders(requestId, upstreamResponse));
  }

  return jsonResponse(200, { url: checkoutRedirect }, buildResponseHeaders(requestId, upstreamResponse));
}

export async function GET(req) {
  const requestId = buildRequestId(req);
  return jsonResponse(405, { error: 'Method Not Allowed' }, buildResponseHeaders(requestId));
}
