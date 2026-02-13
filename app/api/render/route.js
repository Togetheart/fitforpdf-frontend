export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
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

  if (!upstream) return jsonError(500, 'Missing CLEAN_SHEET_API_URL');
  if (!apiKey) return jsonError(500, 'Missing NEATEXPORT_API_KEY');

  const requestUrl = new URL(req.url);
  const query = requestUrl.searchParams.toString();
  const base = upstream.replace(/\/$/, '');
  const targetUrl = `${base}/render${query ? `?${query}` : ''}`;

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    return jsonError(400, 'Expected multipart/form-data');
  }

  const formData = await req.formData();
  const upstreamHeaders = {
    'X-NEATEXPORT-KEY': apiKey,
  };

  const flowId = req.headers.get('x-cleansheet-flow-id');
  if (flowId) upstreamHeaders['X-CleanSheet-Flow-Id'] = flowId;

  const columnMap = req.headers.get('x-cleansheet-column-map');
  if (columnMap) upstreamHeaders['X-CleanSheet-Column-Map'] = columnMap;

  const upstreamResponse = await fetch(targetUrl, {
    method: 'POST',
    headers: upstreamHeaders,
    body: formData,
  });

  const headers = copyPassThroughHeaders(upstreamResponse.headers);
  const upstreamContentType = (upstreamResponse.headers.get('content-type') || '').toLowerCase();

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
