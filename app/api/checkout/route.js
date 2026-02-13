export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PACKS = new Set(['credits_100', 'credits_500']);
const SUCCESS_URL = 'https://www.fitforpdf.com/success';
const CANCEL_URL = 'https://www.fitforpdf.com/';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
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

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON payload' });
  }

  const pack = payload?.pack;
  if (!ALLOWED_PACKS.has(pack)) {
    return jsonResponse(400, { error: 'Invalid pack' });
  }

  const backendCheckoutUrl = normalizeCheckoutUrl(process.env.BACKEND_CHECKOUT_URL);
  if (!backendCheckoutUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['BACKEND_CHECKOUT_URL'] },
    });
  }

  let checkoutResponse;
  try {
    checkoutResponse = await fetch(backendCheckoutUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        pack,
        success_url: SUCCESS_URL,
        cancel_url: CANCEL_URL,
      }),
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Backend checkout request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
    });
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
    });
  }

  const checkoutUrl = typeof checkoutPayload?.url === 'string' ? checkoutPayload.url.trim() : '';
  if (!checkoutUrl) {
    return jsonResponse(502, {
      error: 'Invalid checkout response',
      details: checkoutPayload,
    });
  }

  return jsonResponse(200, { url: checkoutUrl });
}

export async function GET() {
  return jsonResponse(405, { error: 'Method Not Allowed' });
}
