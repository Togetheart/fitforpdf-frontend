import { getNeatExportApiKey } from '../../lib/backendKeys.js';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PACKS = new Set(['credits_1', 'credits_10', 'credits_100', 'credits_500']);
const SUCCESS_URL = 'https://www.fitforpdf.com/success';
const CANCEL_URL = 'https://www.fitforpdf.com/';

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

function normalizeCheckoutUrl(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return null;
  const normalized = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  if (/\/api\/checkout$/i.test(normalized)) {
    return normalized;
  }
  return `${normalized}/api/checkout`;
}

const ALLOWED_REDIRECT_HOSTS = new Set(['www.fitforpdf.com', 'fitforpdf.com']);

// Security (F-3): only accept client-supplied Stripe redirect URLs that point at
// our own domains; otherwise fall back to the server default. Stops an attacker
// from minting a branded Stripe session that redirects victims to a phishing
// page after a real payment.
function safeRedirectUrl(raw, fallback) {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    const u = new URL(raw);
    if (u.protocol === 'https:' && ALLOWED_REDIRECT_HOSTS.has(u.hostname)) {
      return u.toString();
    }
  } catch {
    // fall through to fallback
  }
  return fallback;
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
  const neatExportApiKey = getNeatExportApiKey();
  const requestId = buildRequestId(req);
  const responseHeaders = buildResponseHeaders(requestId);

  let payload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON payload' }, responseHeaders);
  }

  const pack = payload?.pack;
  if (!ALLOWED_PACKS.has(pack)) {
    return jsonResponse(400, { error: 'Invalid pack' }, responseHeaders);
  }

  const backendCheckoutUrl = normalizeCheckoutUrl(process.env.BACKEND_CHECKOUT_URL);
  if (!backendCheckoutUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['BACKEND_CHECKOUT_URL'] },
    }, responseHeaders);
  }

  let checkoutResponse;
  try {
    const successUrl = safeRedirectUrl(payload?.success_url, SUCCESS_URL);
    const cancelUrl = safeRedirectUrl(payload?.cancel_url, CANCEL_URL);
    const idempotencyKey = getIdempotencyKey(req, payload);
    checkoutResponse = await fetch(backendCheckoutUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...buildTraceHeaders(requestId),
        ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {}),
        ...(neatExportApiKey
          ? { 'X-NEATEXPORT-KEY': neatExportApiKey }
          : {}),
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
    }, responseHeaders);
  }

  const contentType = (checkoutResponse.headers.get('content-type') || '').toLowerCase();
  let checkoutPayload = {};
  if (contentType.includes('application/json')) {
    checkoutPayload = await checkoutResponse.json().catch(() => ({}));
  }

  if (!checkoutResponse.ok) {
    return jsonResponse(checkoutResponse.status, {
      error: checkoutPayload?.error || 'Checkout failed',
      details: checkoutPayload,
    }, {
      ...buildResponseHeaders(requestId, checkoutResponse),
    });
  }

  const checkoutUrl = typeof checkoutPayload?.url === 'string' ? checkoutPayload.url.trim() : '';
  if (!checkoutUrl) {
    return jsonResponse(502, {
      error: 'Invalid checkout response',
      details: checkoutPayload,
    }, {
      ...buildResponseHeaders(requestId, checkoutResponse),
    });
  }

  return jsonResponse(200, { url: checkoutUrl }, buildResponseHeaders(requestId, checkoutResponse));
}

export async function GET(req) {
  const requestId = buildRequestId(req);
  return jsonResponse(405, { error: 'Method Not Allowed' }, buildResponseHeaders(requestId));
}
