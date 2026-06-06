import { useState, useRef, useEffect } from 'react';
import {
  buildRenderUrl,
  getFailKind,
  getPageBurdenUiCopy,
  isPageBurdenFail,
  normalizePageBurdenRecommendations,
  recommendationLabel,
} from '../pageUiLogic.mjs';
import { getPlanExhausted, QUOTA_STATUS_BY_RENDER_CODE } from './useQuota.mjs';
import { useCheckout } from './useCheckout.mjs';
import {
  trackUploadStarted,
  trackDemoFileUsed,
  trackDemoPdfShown,
  trackRenderCompleted,
  trackUploadAfterDemo,
  trackShareLinkCopied,
  trackDownloadClicked,
  trackDownloadCompleted,
  trackSecondRealRenderStarted,
  trackPostRenderPricingClicked,
  trackPostRenderContactClicked,
} from '../lib/analytics.mjs';

const API_BASE = '/api';
const CONVERSION_PROGRESS_MIN_MS = 1800;
const LOGO_MAX_DIM_PX = 512;

// Re-encode a logo into a clean, downscaled, baseline 8-bit PNG via <canvas> so the
// PDF renderer (PDFKit) can always embed it — PDFKit throws on interlaced/16-bit/exotic
// PNGs and then silently falls back to the default mark. Returns a new File, or null
// when the browser can't do it (server / jsdom) so the caller keeps the raw file.
export async function normalizeLogoFile(file) {
  if (!file || typeof document === 'undefined' || typeof createImageBitmap !== 'function') return null;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return null;
  }
  const srcW = bitmap.width || 1;
  const srcH = bitmap.height || 1;
  const scale = Math.min(1, LOGO_MAX_DIM_PX / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) { if (bitmap.close) bitmap.close(); return null; }
  ctx.drawImage(bitmap, 0, 0, w, h);
  if (bitmap.close) bitmap.close();
  if (typeof canvas.toBlob !== 'function') return null;
  const blob = await new Promise((resolve) => { canvas.toBlob((b) => resolve(b), 'image/png'); });
  if (!blob) return null;
  const base = String(file.name || 'logo').replace(/\.[^.]+$/, '') || 'logo';
  return new File([blob], `${base}.png`, { type: 'image/png' });
}
const CHECKOUT_COMING_SOON_MESSAGE = 'Payments coming soon. Contact us.';
const HISTORY_PAGE_LIMIT = 10;

// ── Confidence helpers ────────────────────────────────────

const VALID_VERDICTS = new Set(['OK', 'WARN', 'FAIL']);

const REASON_LABELS = Object.freeze({
  min_font_low: 'Text too small for reliable delivery',
  overflow_cells: 'Some cells exceed available space',
  high_wrap_rate: 'Many lines wrap onto multiple lines',
  high_truncation: 'Some content was truncated',
  max_row_height_hit: 'Some rows were height-limited',
  zero_width_column: 'A column became unreadable',
  page_burden_high: 'Document too large for direct sending',
  column_collapse: 'Columns are too compressed to remain readable',
  wrap_severe: 'Layout causes excessive line wraps',
  missing_rows_severe: 'Some rows appear missing in the render',
  small_font: 'The text size is too small',
  header_not_repeated: 'The header is not repeated correctly',
  missing_rows: 'The render appears incomplete',
  blank_pages: 'One or more pages appear empty',
});
const REASON_CODE_SET = new Set(Object.keys(REASON_LABELS));

function isReasonCode(value) {
  return REASON_CODE_SET.has(String(value || '').trim());
}

function reasonLabel(reason) {
  const normalized = String(reason || '').trim();
  return REASON_LABELS[normalized] || normalized;
}

function normalizeReasons(rawReasons) {
  if (!Array.isArray(rawReasons)) return [];
  return rawReasons
    .map((reason) => {
      if (reason && typeof reason === 'object' && typeof reason.code === 'string') {
        return reason.code.trim();
      }
      return String(reason || '').trim();
    })
    .filter(Boolean);
}

function normalizeConfidence(rawConfidence) {
  if (!rawConfidence || typeof rawConfidence !== 'object') return null;
  const verdictRaw = typeof rawConfidence.verdict === 'string' ? rawConfidence.verdict.toUpperCase() : null;
  if (!VALID_VERDICTS.has(verdictRaw)) return null;
  const score = Number.parseInt(String(rawConfidence.score ?? ''), 10);
  const reasons = normalizeReasons(rawConfidence.reasons);
  const metrics = rawConfidence.metrics && typeof rawConfidence.metrics === 'object' ? rawConfidence.metrics : null;
  return {
    verdict: verdictRaw,
    score: Number.isFinite(score) ? score : null,
    reasons,
    metrics,
  };
}

function parseReasons(rawReasons) {
  if (!rawReasons || rawReasons === 'N/A') return [];
  return String(rawReasons).split(',').map((s) => s.trim()).filter(Boolean);
}

function parseConfidenceFromHeaders(headers) {
  const verdict = headers.get('x-cleansheet-verdict');
  if (!verdict || verdict === 'N/A') return null;
  const scoreRaw = headers.get('x-cleansheet-score');
  const score = Number.parseInt(scoreRaw || '', 10);
  const reasons = parseReasons(headers.get('x-cleansheet-reasons'));
  return { verdict, score: Number.isFinite(score) ? score : null, reasons, metrics: null };
}

function parseRouterCompactSuggestion(headers, requestMode) {
  const routerMode = String(headers.get('x-cleansheet-router-mode') || '').trim();
  if (routerMode !== 'column_split' || requestMode === 'compact') return null;
  return {
    mode: routerMode,
    reason: String(headers.get('x-cleansheet-router-reason') || '').trim() || null,
  };
}

function identifyPostHog(identityHash) {
  if (!identityHash || typeof window === 'undefined') return;
  const posthog = window.posthog;
  if (!posthog || typeof posthog.identify !== 'function') return;
  try {
    posthog.identify(identityHash);
  } catch (_) {
    // Analytics stitching must never block rendering.
  }
}

async function parseConfidenceFromJsonIfAvailable(res) {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) return null;
  try {
    const data = await res.clone().json();
    if (!data || typeof data !== 'object') return null;
    if (data.confidence && typeof data.confidence === 'object') return data.confidence;
    if (data.verdict || data.score || Array.isArray(data.reasons)) {
      return { verdict: data.verdict || null, score: data.score ?? null, reasons: Array.isArray(data.reasons) ? data.reasons : [], metrics: data.metrics || null };
    }
  } catch (_) {
    return null;
  }
  return null;
}

function parseDebugMetricsHeader(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) { return null; }
}

function parseColumnMapDebugFromHeaders(headers) {
  const mode = headers.get('x-cleansheet-column-map-mode');
  const renderedRaw = headers.get('x-cleansheet-column-map-rendered');
  const entriesRaw = headers.get('x-cleansheet-column-map-entries');
  if (!mode && !renderedRaw && !entriesRaw) return null;
  const rendered = renderedRaw === '1' ? 'yes' : renderedRaw === '0' ? 'no' : (renderedRaw || 'unknown');
  const entries = Number.parseInt(entriesRaw || '', 10);
  return { mode: mode || 'unknown', rendered, entries: Number.isFinite(entries) ? entries : null };
}

function getQuotaErrorCode(response, payload) {
  const headerCode = response?.headers?.get?.('x-cleansheet-code');
  const headerError = response?.headers?.get?.('x-error-code');
  const payloadCode = payload && (payload.code || payload.errorCode || payload.error_code);
  return headerCode || headerError || payloadCode || null;
}

function normalizeHistoryStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized || normalized === 'all') return 'all';
  if (normalized === 'pending' || normalized === 'running' || normalized === 'done' || normalized === 'failed') {
    return normalized;
  }
  return 'all';
}

function normalizeCursor(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function sleep(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

function createFlowId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `flow_${crypto.randomUUID()}`;
  }
  return `flow_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function downloadBlob(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sanitizeFilenameBase(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return 'document';
  const baseName = trimmed.split(/[\\/]/).pop();
  const withoutExt = baseName.replace(/\.[^/.]+$/u, '');
  const cleaned = withoutExt.replace(/[<>:"/\\|?*]/gu, '_').trim();
  return cleaned || 'document';
}

function getPdfFilenameFromSourceFile(fileObj) {
  const baseName = sanitizeFilenameBase(fileObj?.name);
  return `${baseName}.pdf`;
}

function getFilenameFromContentDisposition(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const match = /filename\*=UTF-8''([^;]+)|filename\*=([^;]+)|filename\s*=\s*\"?([^\";]+)\"?/i.exec(contentDisposition);
  if (!match) return fallback;
  const raw = match[1] || match[2] || match[3];
  if (!raw) return fallback;
  try { return decodeURIComponent(raw.replace(/^\"|\"$/g, '').trim()); }
  catch { return raw.replace(/^\"|\"$/g, '').trim() || fallback; }
}

async function copyText(text) {
  const value = String(text || '').trim();
  if (!value) return false;

  const browserNavigator = (
    typeof window !== 'undefined' && window.navigator
      ? window.navigator
      : (typeof navigator !== 'undefined' ? navigator : null)
  );

  if (browserNavigator && browserNavigator.clipboard && typeof browserNavigator.clipboard.writeText === 'function') {
    await browserNavigator.clipboard.writeText(value);
    return true;
  }

  if (typeof document === 'undefined') return false;
  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', 'readonly');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.focus();
  input.select();
  let copied = false;
  try {
    copied = typeof document.execCommand === 'function' && document.execCommand('copy');
  } finally {
    document.body.removeChild(input);
  }
  return copied;
}

// Header values cross HTTP as ASCII, so non-ASCII characters (e.g. the " · "
// separator in auto-derived section titles) arrive percent-encoded ("%C2%B7").
// Decode defensively: a string with no %-escapes is returned unchanged, and a
// malformed escape falls back to the raw text instead of throwing.
function safeDecodeText(value) {
  if (typeof value !== 'string' || value.indexOf('%') === -1) return value;
  try { return decodeURIComponent(value); } catch { return value; }
}

// Parse the X-CleanSheet-Sections response header (JSON [{label,title,columns}]).
export function parseSectionsHeader(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s) => s && typeof s.label === 'string' && s.label)
      .map((s) => ({
        label: s.label,
        title: typeof s.title === 'string' ? safeDecodeText(s.title) : '',
        columns: Array.isArray(s.columns) ? s.columns.filter((c) => typeof c === 'string').map(safeDecodeText) : [],
      }));
  } catch {
    return [];
  }
}

// Pinned/anchor columns (repeated in every section). Exposed so the custom-
// groups control can list every column, not just the per-section data columns.
function parseFrozenColumnsHeader(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => typeof c === 'string' && c).map(safeDecodeText);
  } catch {
    return [];
  }
}

// ── Hook ──────────────────────────────────────────────────

export default function useConversion({ quota }) {
  const checkout = useCheckout();
  const {
    isQuotaLocked,
    syncQuotaState,
    applyQuotaExhaustion,
    setPaywallReason,
    setPurchaseMessage,
    planType: quotaPlanType,
    freeExportsLeft,
    remainingInPeriod,
  } = quota;

  const [file, setFile] = useState(null);
  const [includeBranding, setIncludeBranding] = useState(true);
  const [truncateLongText, setTruncateLongText] = useState(false);
  const [retainSourceConsent, setRetainSourceConsent] = useState(false);
  const [contactsConsent, setContactsConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [lastRequestMode, setLastRequestMode] = useState('normal');
  const [flowId, setFlowId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [debugMetrics, setDebugMetrics] = useState(null);
  const [columnMapDebug, setColumnMapDebug] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugByQuery, setDebugByQuery] = useState(false);
  const [failureRecommendations, setFailureRecommendations] = useState([]);
  const [compactSuggestion, setCompactSuggestion] = useState(null);
  const [resolvedPdfFilename, setResolvedPdfFilename] = useState('report.pdf');
  const [renderVerdict, setRenderVerdict] = useState(null);
  const [layout, setLayout] = useState({ overview: true, headers: true, footer: true });
  // Kunj control: custom report title (pre-render). Sent to the render route,
  // which forwards it to the engine (options.reportTitle). Empty => engine
  // falls back to the filename-derived title.
  const [reportTitle, setReportTitle] = useState('');
  // Kunj control: column grouping mode (pre-render). off | auto | force.
  // Default 'auto' = current effective behavior (proxy historically forced auto).
  const [columnMap, setColumnMap] = useState('auto');
  // Kunj branding control: custom footer text. Backend accepts this only when
  // branding entitlement allows it; free exports safely fall back upstream.
  const [footerText, setFooterText] = useState('');
  // Brand accent color (#RRGGBB) + logo (File). Paid branding — sent on render;
  // the backend applies them only for entitled (paid) users.
  const [accentColor, setAccentColor] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  // Logo is paid branding. Two backend gotchas: (1) it drops anything > 256 KB or
  // not PNG/JPEG; (2) PDFKit (the renderer) CANNOT embed many real-world PNGs
  // (interlaced/Adam7, 16-bit, exotic color types) and silently falls back to the
  // FitForPDF wordmark. So at selection we re-encode the logo through a <canvas>
  // into a clean, downscaled, baseline 8-bit PNG that PDFKit always accepts — which
  // also keeps it well under 256 KB. Falls back gracefully where canvas is absent.
  const [logoError, setLogoError] = useState('');
  async function handleLogoSelect(file) {
    if (!file) { setLogoError(''); setLogoFile(null); return; }
    const type = String(file.type || '').toLowerCase();
    if (type !== 'image/png' && type !== 'image/jpeg') {
      setLogoError('Logo : format PNG ou JPG uniquement.');
      return;
    }
    // Guard against decoding absurdly large inputs before we even try.
    if (Number.isFinite(file.size) && file.size > 10 * 1024 * 1024) {
      setLogoError('Logo trop lourd : 10 Mo maximum.');
      return;
    }
    let out = file;
    try {
      const normalized = await normalizeLogoFile(file);
      if (normalized) out = normalized;
    } catch {
      out = file; // canvas unavailable / decode failed → keep the raw file
    }
    // If normalization didn't shrink it (fallback path), enforce the backend cap.
    if (Number.isFinite(out.size) && out.size > 256 * 1024) {
      setLogoError('Logo trop lourd : 256 Ko maximum (essayez une image plus petite).');
      return;
    }
    setLogoError('');
    setLogoFile(out);
  }
  function removeLogo() {
    setLogoFile(null);
    setLogoError('');
  }
  // Kunj control: rename sections (post-render). renderedSections come from the
  // X-CleanSheet-Sections response header (label + current title); overrides are
  // keyed by label and sent on the next render to re-title sections.
  const [renderedSections, setRenderedSections] = useState([]);
  // Pinned/anchor columns from the last render (X-CleanSheet-Frozen-Columns).
  // Listed alongside section columns so every column is visible + assignable.
  const [renderedFrozenColumns, setRenderedFrozenColumns] = useState([]);
  const [sectionTitleOverrides, setSectionTitleOverrides] = useState({});
  // Custom column groups (Kunj T5): array of { label, columns } sent on the
  // next render. null => use the engine's automatic grouping.
  const [columnGroupsOverride, setColumnGroupsOverride] = useState(null);
  const [renderId, setRenderId] = useState(null);
  const [exportHistory, setExportHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyStatus, setHistoryStatus] = useState('all');
  const [historyNextCursor, setHistoryNextCursor] = useState(null);
  const [shareState, setShareState] = useState({ status: 'idle', jobId: null });
  /* Demo → upload funnel tracking (see app/lib/analytics.mjs).
   * `true` after a successful demo render and until the next real upload. */
  const [wasDemoLastUpload, setWasDemoLastUpload] = useState(false);

  const progressTimersRef = useRef([]);
  const renderInFlightRef = useRef(false);
  /* Mirror of wasDemoLastUpload for synchronous reads inside async event
   * handlers — React state can be stale if handleSubmit runs in the same
   * tick as the demo flag was set. */
  const wasDemoLastUploadRef = useRef(false);
  const [conversionProgress, setConversionProgress] = useState({
    running: false,
    stepIndex: 0,
    percent: 0,
    label: 'Uploading',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const debugParam = new URLSearchParams(window.location.search).get('debug');
    setDebugByQuery(debugParam === '1');
  }, []);

  const canShowDebug = process.env.NODE_ENV !== 'production' || debugByQuery;

  useEffect(() => () => {
    progressTimersRef.current.forEach(clearTimeout);
    progressTimersRef.current = [];
  }, []);

  function clearConversionProgressTimers() {
    progressTimersRef.current.forEach(clearTimeout);
    progressTimersRef.current = [];
  }

  function startConversionProgress() {
    clearConversionProgressTimers();
    setConversionProgress({ running: true, stepIndex: 0, percent: 14, label: 'Uploading' });
    progressTimersRef.current = [
      setTimeout(() => { setConversionProgress({ running: true, stepIndex: 1, percent: 44, label: 'Structuring (column grouping)' }); }, 520),
      setTimeout(() => { setConversionProgress({ running: true, stepIndex: 2, percent: 74, label: 'Generating PDF' }); }, 1080),
      setTimeout(() => { setConversionProgress({ running: true, percent: 92, stepIndex: 2, label: 'Generating PDF' }); }, 1720),
    ];
  }

  function finishConversionProgress() {
    clearConversionProgressTimers();
    setConversionProgress({ running: false, stepIndex: 2, percent: 100, label: 'Generating PDF' });
  }

  async function submitRender(mode = 'normal', opts = {}) {
    const {
      isFallback = false,
      preserveNotice = false,
      allowInFlight = false,
      flowIdOverride = null,
      skipProgress = false,
      sourceFile = null,
    } = opts;

    if (!allowInFlight && renderInFlightRef.current) return;

    const targetFile = sourceFile || file;
    if (!targetFile) { setError('Select a file'); return; }

    const activeFlowId = flowIdOverride || flowId || createFlowId();
    renderInFlightRef.current = true;
    setError(null);
    if (!preserveNotice) setNotice(null);
    setRenderVerdict(null);
    setRenderId(null);
    setFailureRecommendations([]);
    setCompactSuggestion(null);
    setColumnMapDebug(null);
    setShareState({ status: 'idle', jobId: null });
    setIsLoading(true);
    setFlowId(activeFlowId);
    if (!skipProgress) startConversionProgress();
    const startedAt = Date.now();

    try {
      const formData = new FormData();
      formData.append('file', targetFile);
      formData.append('branding', includeBranding ? '1' : '0');
      formData.append('keep_overview', layout.overview !== false ? '1' : '0');
      formData.append('keep_headers', layout.headers !== false ? '1' : '0');
      formData.append('keep_footer', layout.footer !== false ? '1' : '0');
      formData.append('retain_consent', retainSourceConsent ? '1' : '0');
      formData.append('contacts_consent', contactsConsent ? '1' : '0');
      // Custom report title (Kunj). Only sent when set; demo renders skip it.
      const isDemoRender = targetFile.name === 'enterprise-invoices-demo.csv';
      if (!isDemoRender && typeof reportTitle === 'string' && reportTitle.trim()) {
        formData.append('reportTitle', reportTitle.trim().slice(0, 200));
      }
      if (!isDemoRender && typeof footerText === 'string' && footerText.trim()) {
        formData.append('footerText', footerText.trim().slice(0, 120));
      }
      // Brand accent color + logo (paid; backend gates by entitlement).
      if (!isDemoRender && /^#[0-9a-fA-F]{6}$/.test(String(accentColor))) {
        formData.append('accentColor', accentColor);
      }
      if (!isDemoRender && logoFile) {
        formData.append('logo', logoFile);
      }
      // Custom section names (Kunj) — keyed by label, only non-empty overrides.
      if (!isDemoRender) {
        const trimmedOverrides = {};
        for (const [k, v] of Object.entries(sectionTitleOverrides)) {
          if (typeof v === 'string' && v.trim()) trimmedOverrides[k] = v.trim();
        }
        if (Object.keys(trimmedOverrides).length) {
          formData.append('sectionTitles', JSON.stringify(trimmedOverrides));
        }
      }
      // Custom column groups (Kunj T5) — only when the user defined an override.
      if (!isDemoRender && Array.isArray(columnGroupsOverride) && columnGroupsOverride.length) {
        formData.append('columnGroups', JSON.stringify(columnGroupsOverride));
      }

      const res = await fetch(buildRenderUrl(API_BASE, mode, { truncateLongText, columnMap }), {
        method: 'POST',
        body: formData,
        headers: {
          'X-CleanSheet-Flow-Id': activeFlowId,
          'X-Export-Intent': activeFlowId,
          'X-Idempotency-Key': activeFlowId,
          'X-FitForPDF-Source-Filename': targetFile.name || '',
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const quotaCode = getQuotaErrorCode(res, data);
        if (
          res.status === 402
          && quotaCode
          && Object.prototype.hasOwnProperty.call(QUOTA_STATUS_BY_RENDER_CODE, String(quotaCode))
        ) {
          const msg = applyQuotaExhaustion(quotaCode, data);
          setError(msg);
          setNotice(msg);
          return;
        }
        const confidenceFromErrorHeaders = parseConfidenceFromHeaders(res.headers);
        const failureConfidence = normalizeConfidence(
          (data && data.confidence) || confidenceFromErrorHeaders,
        );
        const headerReasonCodes = parseReasons(res.headers.get('x-cleansheet-reasons'));
        const bodyReasonCodes = normalizeReasons(data?.confidence?.reasons);
        const pageBurdenDetected = (
          (failureConfidence && isPageBurdenFail(failureConfidence))
          || headerReasonCodes.includes('page_burden_high')
          || bodyReasonCodes.includes('page_burden_high')
        );
        if (pageBurdenDetected) {
          setConfidence(failureConfidence || { verdict: 'FAIL', score: null, reasons: ['page_burden_high'], metrics: null });
          setPdfBlob(null);
          setRenderId(null);
          setLastRequestMode(mode);
          setShowDetails(false);
          setFailureRecommendations(normalizePageBurdenRecommendations(data.recommendations));
          return;
        }

        if (mode === 'optimized' && !isFallback) {
          setNotice('Optimized mode unavailable; standard version generated.');
          await submitRender('normal', {
            isFallback: true,
            skipProgress: true,
            preserveNotice: true,
            flowIdOverride: activeFlowId,
            allowInFlight: true,
          });
          return;
        }
        throw new Error(data.error || res.statusText || 'Upload failed');
      }

      const confidenceFromJson = await parseConfidenceFromJsonIfAvailable(res);
      const confidenceFromHeaders = parseConfidenceFromHeaders(res.headers);
      const confidenceData = normalizeConfidence(confidenceFromJson || confidenceFromHeaders);
      const debugMetricsData = parseDebugMetricsHeader(res.headers.get('x-cleansheet-debug-metrics'));
      const columnMapDebugData = parseColumnMapDebugFromHeaders(res.headers);
      const compactSuggestionData = parseRouterCompactSuggestion(res.headers, mode);
      identifyPostHog(res.headers.get('x-identity-hash'));
      const blob = await res.blob();
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      const isPdfResponse = res.status === 200 && contentType.includes('application/pdf');
      const responseFilename = getFilenameFromContentDisposition(
        res.headers.get('content-disposition'),
        getPdfFilenameFromSourceFile(targetFile),
      );

      await syncQuotaState();
      if (!isPdfResponse) { setError('PDF response is missing.'); return; }

      setPdfBlob(blob);
      setRenderedSections(parseSectionsHeader(res.headers.get('x-cleansheet-sections')));
      setRenderedFrozenColumns(parseFrozenColumnsHeader(res.headers.get('x-cleansheet-frozen-columns')));
      setRenderId(res.headers.get('x-render-id') ?? null);
      setResolvedPdfFilename(responseFilename);
      setConfidence(confidenceData);
      setRenderVerdict(confidenceData?.verdict ?? null);
      setLastRequestMode(mode);
      setShowDetails(false);
      setDebugMetrics(debugMetricsData);
      setColumnMapDebug(columnMapDebugData);
      setCompactSuggestion(compactSuggestionData);
      setShowDebug(false);
      setFailureRecommendations([]);

      const reasonCodes = Array.isArray(confidenceData?.reasons)
        ? confidenceData.reasons.filter((reason) => isReasonCode(reason))
        : [];

      /* Funnel diagnostic — captures every dimension we have so we can later
       * group by (file_type, size_bucket) and answer the XLSX-vs-CSV gap.
       * Backend may publish wrap_pressure under either snake_case or camelCase
       * in x-cleansheet-debug-metrics, so we read defensively. */
      const ext = (targetFile.name || '').split('.').pop()?.toLowerCase();
      const renderMsHeader = res.headers.get('x-render-ms');
      const renderMsParsed = renderMsHeader ? Number(renderMsHeader) : null;
      trackRenderCompleted({
        fileType: ext,
        fileSize: targetFile.size,
        mode,
        score: confidenceData?.score ?? null,
        verdict: confidenceData?.verdict ?? 'OK',
        colCount: confidenceData?.metrics?.columnCount ?? debugMetricsData?.columnCount ?? null,
        rowCount: confidenceData?.metrics?.rowCount ?? debugMetricsData?.rowCount ?? null,
        pageCount: debugMetricsData?.pageCount ?? debugMetricsData?.page_count ?? null,
        wrapPressure: debugMetricsData?.wrapPressure ?? debugMetricsData?.wrap_pressure ?? null,
        overflowCells: debugMetricsData?.overflowCells ?? debugMetricsData?.overflow_cells ?? null,
        renderMs: Number.isFinite(renderMsParsed) ? renderMsParsed : null,
        reasons: reasonCodes,
        isDemo: targetFile.name === 'enterprise-invoices-demo.csv',
      });

      if (!confidenceData) {
        console.warn('[cleansheet] confidence missing or invalid; defaulting verdict to OK');
      }

      /* Previously: an OK verdict triggered an automatic download and
       * cleared confidence/flowId. That made the success moment invisible —
       * users got a file in their downloads bin and the UI had nothing
       * left to sell (no score, no "render another", no pricing). The
       * post-render panel now owns the success state, so we keep
       * confidence/flowId/renderId and let the user click Download. */
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      const elapsed = Date.now() - startedAt;
      const remainingDelay = Math.max(0, CONVERSION_PROGRESS_MIN_MS - elapsed);
      if (remainingDelay > 0) await sleep(remainingDelay);
      finishConversionProgress();
      setIsLoading(false);
      renderInFlightRef.current = false;
    }
  }

  async function refreshQuotaAndBlockIfNeeded() {
    if (!isQuotaLocked) return true;
    const refreshedQuota = await syncQuotaState();
    const nextPlanType = refreshedQuota?.planType || quotaPlanType || 'free';
    const nextFreeLeft = refreshedQuota?.freeExportsLeft ?? freeExportsLeft;
    const nextRemainingInPeriod = nextPlanType === 'pro'
      ? (refreshedQuota?.remainingInPeriod ?? remainingInPeriod)
      : (refreshedQuota?.freeExportsLeft ?? freeExportsLeft);
    return !getPlanExhausted(nextPlanType, nextFreeLeft, nextRemainingInPeriod);
  }

  async function handleSubmit(e) {
    // Callers may invoke this from a form submit (real event), from the
    // dropzone (stub event), or from the inspector "Update preview" button
    // (no event). Tolerate all three — a missing/partial event must not throw.
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    let canExport = true;
    if (isQuotaLocked) {
      canExport = await refreshQuotaAndBlockIfNeeded();
    }
    if (!canExport) {
      return;
    }
    if (file) {
      const ext = (file.name || '').split('.').pop()?.toLowerCase();
      trackUploadStarted({ fileType: ext, fileSize: file.size });
      /* If a demo render was the last visible output, this real upload
       * marks a successful demo → upload conversion. Fire it once and
       * clear the flag. */
      if (wasDemoLastUploadRef.current) {
        trackUploadAfterDemo({ fileType: ext, fileSize: file.size });
        wasDemoLastUploadRef.current = false;
        setWasDemoLastUpload(false);
      }
    }
    const nextFlowId = createFlowId();
    setFlowId(nextFlowId);
    await submitRender('normal', { flowIdOverride: nextFlowId });
  }

  function handleFileSelect(nextFile) {
    setRenderVerdict(null);
    setRenderId(null);
    setShareState({ status: 'idle', jobId: null });
    setFile(nextFile);
    if (nextFile) { setError(null); setNotice(null); }
    setPdfBlob(null);
    setCompactSuggestion(null);
    // A new file invalidates any prior section/group customization.
    setSectionTitleOverrides({});
    setColumnGroupsOverride(null);
    setRenderedSections([]);
    setRenderedFrozenColumns([]);
  }

  async function handleTrySample() {
    try {
      trackDemoFileUsed();
      const sampleResponse = await fetch('/api/sample/premium');
      if (!sampleResponse.ok) throw new Error(`Failed to load sample CSV (${sampleResponse.status})`);
      const sampleCsv = await sampleResponse.text();
      const sample = new File([sampleCsv], 'enterprise-invoices-demo.csv', { type: 'text/csv' });
      handleFileSelect(sample);
      const nextFlowId = createFlowId();
      setFlowId(nextFlowId);
      await submitRender('compact', { flowIdOverride: nextFlowId, sourceFile: sample });
      /* Demo render is done — mark the session and emit the funnel event.
       * The flag stays true until a real upload (handleSubmit) clears it. */
      wasDemoLastUploadRef.current = true;
      setWasDemoLastUpload(true);
      trackDemoPdfShown();
    } catch (err) {
      setError(err.message || 'Unable to load demo file');
    }
  }

  function handleRemoveFile() {
    setFile(null);
    setPdfBlob(null);
    setRenderVerdict(null);
    setRenderId(null);
    setShareState({ status: 'idle', jobId: null });
    setError(null);
    setNotice(null);
    setCompactSuggestion(null);
    // Clearing the file invalidates the rendered structure too, so the
    // inspector's section/group controls don't linger on the old file.
    setSectionTitleOverrides({});
    setColumnGroupsOverride(null);
    setRenderedSections([]);
    setRenderedFrozenColumns([]);
  }

  /* Single-action helper for the post-demo "Try with your file" CTA.
   * Clears the demo state (file + pdfBlob + verdict) so the empty
   * dropzone reappears, then programmatically opens the OS file picker
   * on the next tick. The user goes from "I just saw the demo" to
   * "the file picker is open" in one click. */
  function handleSwitchToRealUpload() {
    handleRemoveFile();
    /* Reset the UI flag so the upload pill / hero / cart reappear, but keep
     * the tracking ref true — the next handleSubmit still counts as a
     * demo-to-upload conversion until the user actually generates. */
    setWasDemoLastUpload(false);
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      const input = document.querySelector('[data-testid="generate-file-input"]');
      if (input && typeof input.click === 'function') {
        input.click();
      }
    }, 50);
  }

  async function handleGenerateOptimized() {
    const verdict = confidence?.verdict;
    if (lastRequestMode === 'optimized' && (verdict === 'WARN' || verdict === 'FAIL')) return;
    if (!(await refreshQuotaAndBlockIfNeeded())) return;
    await submitRender('optimized', { flowIdOverride: flowId || createFlowId() });
  }

  async function handleGenerateCompact() {
    const verdict = confidence?.verdict;
    if (lastRequestMode === 'compact' && verdict === 'FAIL') return;
    if (!(await refreshQuotaAndBlockIfNeeded())) return;
    await submitRender('compact', { flowIdOverride: flowId || createFlowId() });
  }

  function handleDownloadAnyway() {
    if (!pdfBlob) return;
    const isDemo = wasDemoLastUploadRef.current;
    const fileType = (file?.name || '').split('.').pop()?.toLowerCase() || null;
    trackDownloadClicked({
      renderId,
      flowId,
      isDemo,
      verdict: confidence?.verdict ?? null,
      score: confidence?.score ?? null,
      fileType,
    });
    try {
      downloadBlob(pdfBlob, resolvedPdfFilename);
      trackDownloadCompleted({
        renderId,
        flowId,
        isDemo,
        verdict: confidence?.verdict ?? null,
        score: confidence?.score ?? null,
        fileType,
      });
    } catch (downloadErr) {
      /* Browser may block the synthetic click in rare cases; we still
       * want the click event in PostHog so we can measure the gap. */
      console.warn('[fitforpdf] download failed', downloadErr);
    }
  }

  /* "Render another file" — preserves the just-emitted render_id so we
   * can measure activation (1 successful render → 2nd attempt). */
  function handleRenderAnother() {
    const previousRenderId = renderId;
    trackSecondRealRenderStarted({ previousRenderId, flowId });
    setFile(null);
    setPdfBlob(null);
    setConfidence(null);
    setRenderVerdict(null);
    setRenderId(null);
    setFlowId(null);
    setError(null);
    setNotice(null);
    setCompactSuggestion(null);
    setShareState({ status: 'idle', jobId: null });
    // Drop the previous file's rendered structure so the inspector doesn't
    // show stale section/group controls before the next file is picked.
    setSectionTitleOverrides({});
    setColumnGroupsOverride(null);
    setRenderedSections([]);
    setRenderedFrozenColumns([]);
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      const input = document.querySelector('[data-testid="generate-file-input"]');
      if (input && typeof input.click === 'function') input.click();
    }, 50);
  }

  function handlePostRenderPricingClick() {
    trackPostRenderPricingClicked({
      renderId,
      flowId,
      isDemo: wasDemoLastUploadRef.current,
    });
  }

  function handlePostRenderContactClick() {
    trackPostRenderContactClicked({
      renderId,
      flowId,
      isDemo: wasDemoLastUploadRef.current,
    });
  }

  function handleLayoutChange(nextKey, nextChecked) {
    setLayout((current) => {
      if (!current || typeof current !== 'object') {
        return { overview: true, headers: true, footer: true, [nextKey]: Boolean(nextChecked) };
      }
      return { ...current, [nextKey]: Boolean(nextChecked) };
    });
  }

  async function refreshExportHistory({ cursor = 0, status = historyStatus, append = false } = {}) {
    const safeStatus = normalizeHistoryStatus(status);
    const safeCursor = Number.isFinite(cursor) && cursor >= 0 ? cursor : 0;
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(HISTORY_PAGE_LIMIT));
      if (safeCursor > 0) {
        params.set('cursor', String(safeCursor));
      }
      if (safeStatus !== 'all') {
        params.set('status', safeStatus);
      }
      const res = await fetch(`/api/jobs?${params.toString()}`, { method: 'GET' });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const message = payload && payload.error ? payload.error : `Unable to load export history (${res.status})`;
        setHistoryError(message);
        if (!append) {
          setExportHistory([]);
          setHistoryNextCursor(null);
        }
        return;
      }
      const payload = await res.json().catch(() => ({}));
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const nextCursor = normalizeCursor(payload?.nextCursor);
      setHistoryNextCursor(nextCursor);
      if (append) {
        setExportHistory((current) => {
          const seen = new Set(current.map((item) => item && item.id).filter(Boolean));
          const merged = [...current];
          for (const item of items) {
            if (!item || !item.id) {
              merged.push(item);
              continue;
            }
            if (seen.has(item.id)) continue;
            seen.add(item.id);
            merged.push(item);
          }
          return merged;
        });
      } else {
        setExportHistory(items);
      }
    } catch {
      setHistoryError('Unable to load export history.');
      if (!append) {
        setExportHistory([]);
        setHistoryNextCursor(null);
      }
    } finally {
      setIsHistoryLoading(false);
    }
  }

  async function handleHistoryStatusChange(nextStatus) {
    const safeStatus = normalizeHistoryStatus(nextStatus);
    setHistoryStatus(safeStatus);
    await refreshExportHistory({ cursor: 0, status: safeStatus, append: false });
  }

  async function loadMoreExportHistory() {
    if (!Number.isFinite(historyNextCursor) || historyNextCursor < 0) return;
    await refreshExportHistory({ cursor: historyNextCursor, status: historyStatus, append: true });
  }

  async function handleBuyCreditsPack(pack) {
    setPurchaseMessage('');
    if (!pack) return;
    const result = await checkout.openCreditsPack(pack);
    if (result?.error) setPurchaseMessage(result.error);
  }

  async function handleGoProCheckout() {
    setPaywallReason('');
    setPurchaseMessage('');
    const result = await checkout.openProCheckout();
    if (result?.error) setPurchaseMessage(result.error);
  }

  async function handleCopyShareLink(targetJobId = renderId, surface = 'render_success') {
    const jobId = String(targetJobId || '').trim();
    if (!jobId) {
      setError('Share link unavailable for this export.');
      return;
    }

    setShareState({ status: 'loading', jobId });
    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/share`, {
        method: 'POST',
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'Unable to create review link.');
      }
      const shareUrl = String(payload?.shareUrl || '').trim();
      if (!shareUrl) {
        throw new Error('Unable to create review link.');
      }
      const copied = await copyText(shareUrl);
      if (!copied) {
        throw new Error('Unable to copy review link.');
      }

      trackShareLinkCopied({ surface, jobId });
      setError(null);
      setNotice('Review link copied. Anyone with it can open the PDF until it expires.');
      setShareState({ status: 'copied', jobId });
    } catch (err) {
      setShareState({ status: 'error', jobId });
      setError(err instanceof Error ? err.message : 'Unable to copy review link.');
    }
  }

  const verdict = confidence?.verdict;
  const stillRiskAfterOptimized = lastRequestMode === 'optimized' && (verdict === 'WARN' || verdict === 'FAIL');
  const stillRiskAfterCompact = lastRequestMode === 'compact' && verdict === 'FAIL';
  const failKind = getFailKind(confidence);
  const pageBurdenCopy = getPageBurdenUiCopy();
  const warnReasons = (confidence?.reasons || []).map(reasonLabel).slice(0, 2);
  const failReasons = (confidence?.reasons || []).map(reasonLabel).slice(0, 3);

  return {
    // file
    file,
    handleFileSelect,
    handleRemoveFile,
    // options
    includeBranding,
    setIncludeBranding,
    truncateLongText,
    setTruncateLongText,
    retainSourceConsent,
    setRetainSourceConsent,
    contactsConsent,
    setContactsConsent,
    layout,
    handleLayoutChange,
    reportTitle,
    setReportTitle,
    columnMap,
    setColumnMap,
    footerText,
    setFooterText,
    accentColor,
    setAccentColor,
    logoFile,
    setLogoFile,
    logoError,
    handleLogoSelect,
    removeLogo,
    renderedSections,
    renderedFrozenColumns,
    sectionTitleOverrides,
    setSectionTitleOverrides,
    columnGroupsOverride,
    setColumnGroupsOverride,
    // conversion
    isLoading,
    error,
    notice,
    conversionProgress,
    handleSubmit,
    handleTrySample,
    handleSwitchToRealUpload,
    handleGenerateOptimized,
    handleGenerateCompact,
    handleDownloadAnyway,
    handleRenderAnother,
    handlePostRenderPricingClick,
    handlePostRenderContactClick,
    handleCopyShareLink,
    // result
    pdfBlob,
    renderId,
    confidence,
    renderVerdict,
    resolvedPdfFilename,
    lastRequestMode,
    failureRecommendations,
    compactSuggestion,
    wasDemoLastUpload,
    showDetails,
    setShowDetails,
    // debug
    debugMetrics,
    columnMapDebug,
    showDebug,
    setShowDebug,
    canShowDebug,
    // derived
    verdict,
    stillRiskAfterOptimized,
    stillRiskAfterCompact,
    failKind,
    pageBurdenCopy,
    warnReasons,
    failReasons,
    // checkout
    handleBuyCreditsPack,
    handleGoProCheckout,
    // history
    exportHistory,
    isHistoryLoading,
    historyError,
    historyStatus,
    hasMoreHistory: Number.isFinite(historyNextCursor) && historyNextCursor >= 0,
    onHistoryStatusChange: handleHistoryStatusChange,
    loadMoreExportHistory,
    refreshExportHistory,
    shareState,
    // internals
    flowId,
    reasonLabel,
  };
}

export { CHECKOUT_COMING_SOON_MESSAGE, reasonLabel, REASON_LABELS };
