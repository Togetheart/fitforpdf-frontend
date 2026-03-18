import { getNeatExportApiKey } from '../../../../lib/backendKeys.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
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
  return `${upstream.replace(/\/+$/, '')}/plan/pro/checkout`;
}

export async function POST(req) {
  if (!req || req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const checkoutUrl = getCheckoutUrl();
  if (!checkoutUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['CLEAN_SHEET_API_URL'] },
    });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  let upstreamResponse;
  try {
    const successUrl = payload?.success_url || 'https://www.fitforpdf.com/success';
    const cancelUrl = payload?.cancel_url || 'https://www.fitforpdf.com/';
    upstreamResponse = await fetch(checkoutUrl, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        ...payload,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Backend checkout request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
    });
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
    });
  }

  const checkoutRedirect = typeof responsePayload?.url === 'string' ? responsePayload.url.trim() : '';
  if (!checkoutRedirect) {
    return jsonResponse(502, {
      error: 'Invalid checkout response',
      details: responsePayload,
    });
  }

  return jsonResponse(200, { url: checkoutRedirect });
}

export async function GET() {
  return jsonResponse(405, { error: 'Method Not Allowed' });
}
