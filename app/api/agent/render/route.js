import { getNeatExportApiKey } from '../../../lib/backendKeys.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const VALID_MODES = new Set(['normal', 'compact', 'optimized']);

function jsonError(status, code, details) {
  const body = { error: code };
  if (details !== undefined) body.details = details;
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function filenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const tail = pathname.split('/').filter(Boolean).pop() || 'input';
    if (/\.(csv|xlsx|xls)$/i.test(tail)) return tail;
    // Default to csv if no extension (backend will sniff content-type)
    return /\.[a-z0-9]{1,5}$/i.test(tail) ? tail : `${tail}.csv`;
  } catch {
    return 'input.csv';
  }
}

function parseNumberHeader(res, names) {
  for (const name of names) {
    const raw = res.headers.get(name);
    if (raw == null) continue;
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/* ── POST /api/agent/render ──────────────────────────────────
 * Agent-friendly proxy:
 *   - Accepts JSON { file_url, mode?, branding?, truncate_long_text?, locale? }
 *   - Downloads the file server-side (HTTPS only, 10 MB cap)
 *   - Forwards to the existing /render upstream as multipart
 *   - Returns JSON { pdf_base64, render_id, verdict, score, pages, render_ms }
 *
 * Frontend-only implementation: no backend changes required. Reuses the same
 * API key and upstream contract the main /api/render route already uses.
 */
export async function POST(req) {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  const apiKey = getNeatExportApiKey();
  if (!upstream || !apiKey) {
    return jsonError(500, 'server_misconfigured', {
      missing: [
        !upstream ? 'CLEAN_SHEET_API_URL' : null,
        !apiKey ? 'NEATEXPORT_API_KEY' : null,
      ].filter(Boolean),
    });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return jsonError(400, 'body_invalid_json');
  }
  if (!payload || typeof payload !== 'object') {
    return jsonError(400, 'body_invalid_json');
  }

  const fileUrl = String(payload.file_url || '').trim();
  if (!fileUrl) return jsonError(400, 'file_url_required');

  let parsed;
  try {
    parsed = new URL(fileUrl);
  } catch {
    return jsonError(400, 'file_url_invalid');
  }
  if (parsed.protocol !== 'https:') return jsonError(400, 'file_url_invalid');

  const mode = payload.mode ? String(payload.mode) : 'normal';
  if (!VALID_MODES.has(mode)) return jsonError(400, 'mode_invalid');

  const branding = Boolean(payload.branding);
  const truncateLongText = Boolean(payload.truncate_long_text);
  const locale = payload.locale === 'fr' ? 'fr' : 'en';

  /* ── 1. download file ──────────────────────────────────── */
  let downloaded;
  try {
    downloaded = await fetch(fileUrl, {
      signal: AbortSignal.timeout(20000),
      redirect: 'follow',
    });
  } catch (err) {
    return jsonError(502, 'file_download_failed', {
      message: err instanceof Error ? err.message : 'unknown',
    });
  }
  if (!downloaded.ok) {
    return jsonError(502, 'file_download_failed', { upstream_status: downloaded.status });
  }

  const declaredLength = Number(downloaded.headers.get('content-length') || '0');
  if (declaredLength > MAX_FILE_BYTES) {
    return jsonError(413, 'file_too_large', { max_bytes: MAX_FILE_BYTES });
  }

  const arrayBuffer = await downloaded.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_FILE_BYTES) {
    return jsonError(413, 'file_too_large', { max_bytes: MAX_FILE_BYTES });
  }

  const filename = filenameFromUrl(fileUrl);
  const contentType =
    downloaded.headers.get('content-type') || 'application/octet-stream';

  /* ── 2. forward to upstream ─────────────────────────────── */
  const formData = new FormData();
  formData.append('file', new Blob([arrayBuffer], { type: contentType }), filename);
  formData.append('branding', branding ? '1' : '0');

  const base = upstream.replace(/\/$/, '');
  const target = new URL(`${base}/render`);
  target.searchParams.set('columnMap', 'auto');
  target.searchParams.set('locale', locale);
  if (mode !== 'normal') target.searchParams.set('mode', mode);
  if (truncateLongText) target.searchParams.set('truncate_long_text', 'true');

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(target.toString(), {
      method: 'POST',
      headers: { 'X-NEATEXPORT-KEY': apiKey },
      body: formData,
      signal: AbortSignal.timeout(55000),
    });
  } catch (err) {
    return jsonError(502, 'upstream_request_failed', {
      message: err instanceof Error ? err.message : 'unknown',
    });
  }

  const upstreamContentType = (upstreamResponse.headers.get('content-type') || '').toLowerCase();

  /* ── 3. pass through non-success as JSON ─────────────────── */
  if (!upstreamResponse.ok) {
    if (upstreamContentType.includes('application/json')) {
      const text = await upstreamResponse.text();
      return new Response(text, {
        status: upstreamResponse.status,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }
    return jsonError(upstreamResponse.status, 'upstream_error', {
      status: upstreamResponse.status,
    });
  }

  if (!upstreamContentType.includes('application/pdf')) {
    return jsonError(502, 'upstream_unexpected_response', { contentType: upstreamContentType });
  }

  /* ── 4. success — encode and wrap ───────────────────────── */
  const pdfBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
  const renderId = upstreamResponse.headers.get('x-render-id') || null;
  const verdict = upstreamResponse.headers.get('x-cleansheet-verdict') || null;
  const score = parseNumberHeader(upstreamResponse, ['x-cleansheet-score', 'x-fitforpdf-score']);
  const pages = parseNumberHeader(upstreamResponse, ['x-fitforpdf-pages', 'x-cleansheet-pages']);
  const renderMs = parseNumberHeader(upstreamResponse, ['x-render-ms']);

  console.info('[fitforpdf-metrics] agent-render', JSON.stringify({
    route: '/api/agent/render',
    status: 200,
    verdict,
    score,
    renderMs,
    fileBytes: arrayBuffer.byteLength,
    mode,
  }));

  return new Response(
    JSON.stringify({
      render_id: renderId,
      pdf_base64: pdfBuffer.toString('base64'),
      pages,
      verdict,
      score,
      render_ms: renderMs,
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'private, no-store',
      },
    },
  );
}

export async function GET() {
  return jsonError(405, 'method_not_allowed');
}
