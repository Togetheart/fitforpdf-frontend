export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonError(status, message, details) {
  const body = { error: message };
  if (details !== undefined) {
    body.details = details;
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function sanitizeFilenameBase(filename) {
  const trimmed = String(filename || '').trim();
  if (!trimmed) return 'document';
  const baseName = trimmed.split(/[\\/]/).pop();
  const withoutExt = baseName.replace(/\.[^/.]+$/u, '');
  const safe = withoutExt.replace(/[<>:"/\\|?*]/gu, '_').trim();
  return safe || 'document';
}

function pdfFilenameFromSourceHeader(raw) {
  const base = sanitizeFilenameBase(raw);
  return `${base}.pdf`;
}

function buildUpstreamUrl(reqUrl, upstream) {
  const source = new URL(reqUrl);
  const base = upstream.replace(/\/$/, '');
  const target = new URL(`${base}/render`);
  for (const [key, value] of source.searchParams.entries()) {
    target.searchParams.set(key, value);
  }
  target.searchParams.set('columnMap', 'force');
  return target;
}

function buildUpstreamHeaders(apiKey, req) {
  const headers = {
    'X-NEATEXPORT-KEY': apiKey,
  };
  const flowId = req.headers.get('x-cleansheet-flow-id');
  if (flowId) headers['X-CleanSheet-Flow-Id'] = flowId;
  const branding = req.headers.get('x-fitforpdf-branding');
  if (branding) headers['X-FitForPDF-Branding'] = branding;
  return headers;
}

function copyPassThroughHeaders(from) {
  const out = new Headers();
  const passHeaders = [
    'content-type',
    'content-disposition',
    'x-cleansheet-score',
    'x-cleansheet-verdict',
    'x-cleansheet-reasons',
    'x-cleansheet-debug-metrics',
    'x-cleansheet-branding',
    'x-cleansheet-column-map-mode',
    'x-cleansheet-column-map-rendered',
    'x-cleansheet-column-map-entries',
  ];
  for (const header of passHeaders) {
    const value = from.get(header);
    if (value != null) out.set(header, value);
  }
  return out;
}

export async function POST(req) {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  const apiKey = process.env.NEATEXPORT_API_KEY;

  const missing = [];
  if (!upstream) missing.push('CLEAN_SHEET_API_URL');
  if (!apiKey) missing.push('NEATEXPORT_API_KEY');
  if (missing.length > 0) {
    return jsonError(500, 'Missing required environment variable(s)', { missing });
  }

  const sourceFilename = req.headers.get('x-fitforpdf-source-filename') || '';
  const targetUrl = buildUpstreamUrl(req.url, upstream);

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    return jsonError(400, 'Expected multipart/form-data');
  }

  const formData = await req.formData();
  const upstreamHeaders = buildUpstreamHeaders(apiKey, req);

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: upstreamHeaders,
      body: formData,
    });
  } catch (error) {
    return jsonError(502, 'Upstream request failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
  }

  const headers = copyPassThroughHeaders(upstreamResponse.headers);
  const upstreamContentType = (upstreamResponse.headers.get('content-type') || '').toLowerCase();
  if (upstreamContentType.includes('application/pdf')) {
    headers.set('content-disposition', `attachment; filename="${pdfFilenameFromSourceHeader(sourceFilename)}"`);
  }

  if (upstreamContentType.includes('application/json')) {
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

export async function GET() {
  return jsonError(405, 'Method Not Allowed');
}
