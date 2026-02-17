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

function parseNumber(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function extractScoreMsFromDebugHeader(raw) {
  if (!raw) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const candidates = [
    'score_ms',
    'scoreMs',
    'score_millis',
    'scoreMillis',
    'score_ms_total',
    'scoreDurationMs',
  ];
  for (const key of candidates) {
    const value = parseNumber(parsed?.[key]);
    if (value != null) return Math.round(value);
  }
  return null;
}

function extractRenderMsFromDebugHeader(raw) {
  if (!raw) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const candidates = [
    'render_ms',
    'renderMs',
    'render_millis',
    'renderMillis',
    'render_time_ms',
    'renderTimeMs',
  ];
  for (const key of candidates) {
    const value = parseNumber(parsed?.[key]);
    if (value != null) return Math.round(value);
  }
  return null;
}

function emitRenderMetrics({
  upstreamStatus,
  renderMs,
  scoreMs,
  sourceFilename,
  requestSearch,
  flowId,
}) {
  console.info('[fitforpdf-metrics] render', JSON.stringify({
    route: '/api/render',
    status: upstreamStatus,
    sourceFilename: sourceFilename || '',
    search: requestSearch || '',
    flowId: flowId || '',
    renderMs,
    scoreMs,
  }));
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
  const startMs = performance.now();

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
  const requestMs = performance.now() - startMs;
  const debugMetricsHeader = upstreamResponse.headers.get('x-cleansheet-debug-metrics');
  const debugScoreMs = extractScoreMsFromDebugHeader(debugMetricsHeader);
  const debugRenderMs = extractRenderMsFromDebugHeader(debugMetricsHeader);
  const upstreamScoreMs = parseNumber(upstreamResponse.headers.get('x-cleansheet-score-ms'))
    || parseNumber(upstreamResponse.headers.get('x-score-ms'));

  const scoreMs = Number.isFinite(upstreamScoreMs) ? upstreamScoreMs : debugScoreMs;
  const finalRenderMs = debugRenderMs ?? Math.round(requestMs);
  const totalMs = Number.isFinite(scoreMs) ? scoreMs + finalRenderMs : finalRenderMs;
  const responseHeaders = copyPassThroughHeaders(upstreamResponse.headers);

  responseHeaders.set('X-Render-MS', String(finalRenderMs));
  responseHeaders.set('X-Score-MS', String(scoreMs != null ? scoreMs : finalRenderMs));
  responseHeaders.set('X-Total-MS', String(totalMs));

  emitRenderMetrics({
    upstreamStatus: upstreamResponse.status,
    renderMs: finalRenderMs,
    scoreMs,
    sourceFilename,
    requestSearch: targetUrl.search,
    flowId: req.headers.get('x-cleansheet-flow-id'),
  });

  const upstreamContentType = (upstreamResponse.headers.get('content-type') || '').toLowerCase();
  if (upstreamContentType.includes('application/pdf')) {
    responseHeaders.set('content-disposition', `attachment; filename="${pdfFilenameFromSourceHeader(sourceFilename)}"`);
  }

  if (upstreamContentType.includes('application/json')) {
    const text = await upstreamResponse.text();
    return new Response(text, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET() {
  return jsonError(405, 'Method Not Allowed');
}
