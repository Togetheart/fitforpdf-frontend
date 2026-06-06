import { getNeatExportApiKey } from '../../lib/backendKeys.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getJobsUrl() {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  return `${upstream.replace(/\/+$/, '')}/jobs`;
}

// Forward the anon device cookie AND the signed session cookie so the backend
// resolves the LOGGED-IN account identity (sessionAuth). Without ffp_session this
// proxy queries the anon device, not the account → empty export history.
const FORWARDABLE_COOKIES = ['anon_id', 'ffp_session'];

function extractForwardableCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const kept = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .filter((c) => FORWARDABLE_COOKIES.some((name) => c.startsWith(`${name}=`)));
  return kept.length ? kept.join('; ') : null;
}

function buildHeaders(req) {
  const headers = {};
  const apiKey = getNeatExportApiKey();
  if (apiKey) {
    headers['X-NEATEXPORT-KEY'] = apiKey;
  }
  const cookieHeader = req?.headers?.get('cookie');
  const forwardCookie = extractForwardableCookies(cookieHeader);
  if (forwardCookie) {
    headers.Cookie = forwardCookie;
  }
  const forwardedFor = req?.headers?.get('x-forwarded-for');
  if (forwardedFor) {
    headers['X-Forwarded-For'] = forwardedFor;
  }
  return headers;
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.min(parsed, 100);
}

function normalizeCursor(value) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function normalizeStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === 'all') return 'all';
  if (normalized === 'pending' || normalized === 'running' || normalized === 'done' || normalized === 'failed') {
    return normalized;
  }
  return null;
}

export async function GET(req) {
  const jobsUrl = getJobsUrl();
  if (!jobsUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['CLEAN_SHEET_API_URL'] },
    });
  }

  const url = new URL(req?.url || 'https://www.fitforpdf.com/api/jobs');
  const limit = normalizeLimit(url.searchParams.get('limit'));
  const cursor = normalizeCursor(url.searchParams.get('cursor'));
  const status = normalizeStatus(url.searchParams.get('status'));
  const upstreamUrl = new URL(jobsUrl);
  if (Number.isFinite(limit)) {
    upstreamUrl.searchParams.set('limit', String(limit));
  }
  if (Number.isFinite(cursor) && cursor > 0) {
    upstreamUrl.searchParams.set('cursor', String(cursor));
  }
  if (status && status !== 'all') {
    upstreamUrl.searchParams.set('status', status);
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: buildHeaders(req),
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Upstream request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
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
