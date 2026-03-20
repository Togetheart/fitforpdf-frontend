import { getNeatExportApiKey } from '../../../lib/backendKeys.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getPromoUrl() {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  return `${upstream.replace(/\/+$/, '')}/v1/promo/redeem`;
}

function extractAnonCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').map((c) => c.trim()).find((c) => c.startsWith('anon_id='));
  return match || null;
}

function buildHeaders(req) {
  const headers = { 'content-type': 'application/json' };
  const apiKey = getNeatExportApiKey();
  if (apiKey) {
    headers['X-NEATEXPORT-KEY'] = apiKey;
  }
  const cookieHeader = req?.headers?.get('cookie');
  const anonCookie = extractAnonCookie(cookieHeader);
  if (anonCookie) {
    headers.Cookie = anonCookie;
  }
  const forwardedFor = req?.headers?.get('x-forwarded-for');
  if (forwardedFor) {
    headers['X-Forwarded-For'] = forwardedFor;
  }
  return headers;
}

export async function POST(req) {
  const promoUrl = getPromoUrl();
  if (!promoUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(promoUrl, {
      method: 'POST',
      headers: buildHeaders(req),
      body: JSON.stringify(body),
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Upstream request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
    });
  }

  const responseBody = await upstreamResponse.text();
  const responseHeaders = {
    'content-type': upstreamResponse.headers.get('content-type') || 'application/json',
  };
  const setCookie = upstreamResponse.headers.get('set-cookie');
  if (setCookie) {
    responseHeaders['set-cookie'] = setCookie;
  }
  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
