import { getNeatExportApiKey } from '../../../../lib/backendKeys.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getShareUrl(jobId) {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  return `${upstream.replace(/\/+$/, '')}/jobs/${encodeURIComponent(jobId)}/share`;
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
  const anonCookie = extractAnonCookie(req?.headers?.get('cookie'));
  if (anonCookie) {
    headers.Cookie = anonCookie;
  }
  const forwardedFor = req?.headers?.get('x-forwarded-for');
  if (forwardedFor) {
    headers['X-Forwarded-For'] = forwardedFor;
  }
  return headers;
}

function toPublicShareUrl(req, jobId, sharePath) {
  const normalized = String(sharePath || '').trim();
  if (!normalized) return '';
  const parsed = new URL(normalized, 'https://backend.fitforpdf.local');
  const publicUrl = new URL(`/s/${encodeURIComponent(jobId)}`, req?.url || 'https://www.fitforpdf.com');
  for (const [key, value] of parsed.searchParams.entries()) {
    publicUrl.searchParams.set(key, value);
  }
  return publicUrl.toString();
}

export async function POST(req, { params }) {
  const jobId = String(params?.jobId || '').trim();
  const upstreamUrl = getShareUrl(jobId);
  if (!upstreamUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['CLEAN_SHEET_API_URL'] },
    });
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: buildHeaders(req),
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Upstream request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
    });
  }

  const payload = await upstreamResponse.json().catch(() => ({}));
  const responseHeaders = { 'content-type': 'application/json' };
  const setCookie = upstreamResponse.headers.get('set-cookie');
  if (setCookie) {
    responseHeaders['set-cookie'] = setCookie;
  }

  if (!upstreamResponse.ok) {
    return new Response(JSON.stringify(payload), {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  }

  return new Response(JSON.stringify({
    shareUrl: toPublicShareUrl(req, jobId, payload?.sharePath),
    expiresAt: payload?.expiresAt || null,
  }), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
