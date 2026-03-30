import { getNeatExportApiKey } from '../../lib/backendKeys.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getUpstreamSharePdfUrl(jobId, reqUrl) {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  if (!upstream) return null;
  const source = new URL(reqUrl || `https://www.fitforpdf.com/s/${encodeURIComponent(jobId)}`);
  const target = new URL(`${upstream.replace(/\/+$/, '')}/jobs/${encodeURIComponent(jobId)}/shared-pdf`);
  for (const [key, value] of source.searchParams.entries()) {
    target.searchParams.set(key, value);
  }
  return target.toString();
}

function buildHeaders(req) {
  const headers = {};
  const apiKey = getNeatExportApiKey();
  if (apiKey) {
    headers['X-NEATEXPORT-KEY'] = apiKey;
  }
  const forwardedFor = req?.headers?.get('x-forwarded-for');
  if (forwardedFor) {
    headers['X-Forwarded-For'] = forwardedFor;
  }
  return headers;
}

export async function GET(req, { params }) {
  const jobId = String(params?.jobId || '').trim();
  const upstreamUrl = getUpstreamSharePdfUrl(jobId, req?.url);
  if (!upstreamUrl) {
    return jsonResponse(500, {
      error: 'Missing required environment variable(s)',
      details: { missing: ['CLEAN_SHEET_API_URL'] },
    });
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: buildHeaders(req),
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'Upstream request failed',
      details: { error: error instanceof Error ? error.message : 'unknown' },
    });
  }

  const headers = new Headers();
  const contentType = upstreamResponse.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }
  const contentDisposition = upstreamResponse.headers.get('content-disposition');
  if (contentDisposition) {
    headers.set('content-disposition', contentDisposition);
  }

  if ((contentType || '').toLowerCase().includes('application/json')) {
    const text = await upstreamResponse.text();
    return new Response(text, {
      status: upstreamResponse.status,
      headers,
    });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}
