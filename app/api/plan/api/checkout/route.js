import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_REDIRECT_HOSTS = new Set(['www.fitforpdf.com', 'fitforpdf.com']);
const ALLOWED_PLANS = new Set(['api_starter', 'api_scale']);

// Security (F-3): only honor client-supplied Stripe redirect URLs on our own
// domains; otherwise fall back to the server default (open-redirect / phishing).
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

function getCheckoutUrl() {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  return `${upstream.replace(/\/+$/, '')}/v1/checkout/api`;
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
  if (!req || req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' }, buildResponseHeaders(buildRequestId(req)));
  }

  const checkoutUrl = getCheckoutUrl();
  const requestId = buildRequestId(req);
  if (!checkoutUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['CLEAN_SHEET_API_URL'] },
    }, buildResponseHeaders(requestId));
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const plan = typeof payload?.plan === 'string' ? payload.plan.trim() : '';
  if (!ALLOWED_PLANS.has(plan)) {
    return jsonResponse(400, {
      error: 'Invalid plan. Allowed: api_starter, api_scale',
    }, buildResponseHeaders(requestId));
  }

  // The buyer's own public API key — the subscription attaches to the key's
  // identity, so the backend authenticates this request with the key itself
  // (X-FITFORPDF-KEY), never with the server key.
  const apiKey = typeof payload?.apiKey === 'string' ? payload.apiKey.trim() : '';
  if (!apiKey) {
    return jsonResponse(400, {
      error: 'Missing API key. Paste the key the plan should attach to.',
    }, buildResponseHeaders(requestId));
  }

  let upstreamResponse;
  try {
    const successUrl = safeRedirectUrl(payload?.success_url, 'https://www.fitforpdf.com/success');
    const cancelUrl = safeRedirectUrl(payload?.cancel_url, 'https://www.fitforpdf.com/developers');
    const idempotencyKey = getIdempotencyKey(req, payload);
    upstreamResponse = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-FITFORPDF-KEY': apiKey,
        ...buildTraceHeaders(requestId),
        ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {}),
      },
      body: JSON.stringify({
        plan,
        success_url: successUrl,
        cancel_url: cancelUrl,
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
