import { getNeatExportApiKey } from '../../lib/backendKeys.js';

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

function extractAnonCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').map((c) => c.trim()).find((c) => c.startsWith('anon_id='));
  return match || null;
}

function buildHeaders(req) {
  const headers = {};
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

export async function GET(req) {
  const quotaUrl = getQuotaUrl();
  if (!quotaUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['CLEAN_SHEET_API_URL'] },
    });
  }

  const MAX_ATTEMPTS = 2;
  const RETRY_DELAY_MS = 600;
  const TIMEOUT_MS = 8000;

  let upstreamResponse;
  let lastError;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      upstreamResponse = await fetch(quotaUrl, {
        method: 'GET',
        headers: buildHeaders(req),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      break;
    } catch (error) {
      lastError = error;
      console.error(`[api/quota] attempt ${attempt + 1}/${MAX_ATTEMPTS} failed:`, error?.message || 'unknown');
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  if (!upstreamResponse) {
    return jsonResponse(502, {
      error: 'Upstream request failed',
      details: { error: lastError instanceof Error ? lastError.message : 'unknown' },
    });
  }

  const body = await upstreamResponse.text();
  const responseHeaders = { 'content-type': upstreamResponse.headers.get('content-type') || 'application/json' };
  const setCookie = upstreamResponse.headers.get('set-cookie');
  if (setCookie) {
    responseHeaders['set-cookie'] = setCookie;
  }
  return new Response(body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function POST() {
  return jsonResponse(405, { error: 'Method Not Allowed' });
}
