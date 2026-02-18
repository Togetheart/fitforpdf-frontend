import { useState, useRef, useEffect } from 'react';
import {
  buildRenderUrl,
  getFailKind,
  getPageBurdenUiCopy,
  isPageBurdenFail,
  normalizePageBurdenRecommendations,
  recommendationLabel,
} from '../pageUiLogic.mjs';
import { QUOTA_STATUS_BY_RENDER_CODE } from './useQuota.mjs';

const API_BASE = '/api';
const CONVERSION_PROGRESS_MIN_MS = 1800;
const CHECKOUT_COMING_SOON_MESSAGE = 'Payments coming soon. Contact us.';

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

// ── Hook ──────────────────────────────────────────────────

export default function useConversion({ quota }) {
  const {
    isQuotaLocked,
    syncQuotaState,
    applyQuotaExhaustion,
    setPaywallReason,
    setPurchaseMessage,
    freeExportsLimit,
  } = quota;

  const [file, setFile] = useState(null);
  const [includeBranding, setIncludeBranding] = useState(true);
  const [truncateLongText, setTruncateLongText] = useState(false);
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
  const [resolvedPdfFilename, setResolvedPdfFilename] = useState('report.pdf');
  const [renderVerdict, setRenderVerdict] = useState(null);
  const [layout, setLayout] = useState({ overview: true, headers: true, footer: true });

  const progressTimersRef = useRef([]);
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
      flowIdOverride = null,
      skipProgress = false,
      sourceFile = null,
    } = opts;
    const targetFile = sourceFile || file;
    if (!targetFile) { setError('Select a file'); return; }

    const activeFlowId = flowIdOverride || flowId || createFlowId();
    setError(null);
    if (!preserveNotice) setNotice(null);
    setRenderVerdict(null);
    setFailureRecommendations([]);
    setColumnMapDebug(null);
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

      const res = await fetch(buildRenderUrl(API_BASE, mode, { truncateLongText }), {
        method: 'POST',
        body: formData,
        headers: {
          'X-CleanSheet-Flow-Id': activeFlowId,
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
          setLastRequestMode(mode);
          setShowDetails(false);
          setFailureRecommendations(normalizePageBurdenRecommendations(data.recommendations));
          return;
        }

        if (mode === 'optimized' && !isFallback) {
          setNotice('Optimized mode unavailable; standard version generated.');
          await submitRender('normal', { isFallback: true, skipProgress: true, preserveNotice: true, flowIdOverride: activeFlowId });
          return;
        }
        throw new Error(data.error || res.statusText || 'Upload failed');
      }

      const confidenceFromJson = await parseConfidenceFromJsonIfAvailable(res);
      const confidenceFromHeaders = parseConfidenceFromHeaders(res.headers);
      const confidenceData = normalizeConfidence(confidenceFromJson || confidenceFromHeaders);
      const debugMetricsData = parseDebugMetricsHeader(res.headers.get('x-cleansheet-debug-metrics'));
      const columnMapDebugData = parseColumnMapDebugFromHeaders(res.headers);
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
      setResolvedPdfFilename(responseFilename);
      setConfidence(confidenceData);
      setRenderVerdict(confidenceData?.verdict ?? null);
      setLastRequestMode(mode);
      setShowDetails(false);
      setDebugMetrics(debugMetricsData);
      setColumnMapDebug(columnMapDebugData);
      setShowDebug(false);
      setFailureRecommendations([]);

      const reasonCodes = Array.isArray(confidenceData?.reasons)
        ? confidenceData.reasons.filter((reason) => isReasonCode(reason))
        : [];
      console.log({
        verdict: confidenceData?.verdict ?? 'OK',
        score: confidenceData?.score ?? null,
        reasonsCount: Array.isArray(confidenceData?.reasons) ? confidenceData.reasons.length : 0,
        reasonCodes,
        mode,
        rows: confidenceData?.metrics?.rowCount ?? debugMetricsData?.rowCount ?? null,
        cols: confidenceData?.metrics?.columnCount ?? debugMetricsData?.columnCount ?? null,
      });

      if (!confidenceData) {
        console.warn('[cleansheet] confidence missing or invalid; defaulting verdict to OK');
      }

      const effectiveVerdict = confidenceData?.verdict ?? 'OK';
      if (effectiveVerdict === 'OK') {
        downloadBlob(blob, responseFilename);
        setConfidence(null);
        setFlowId(null);
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      const elapsed = Date.now() - startedAt;
      const remainingDelay = Math.max(0, CONVERSION_PROGRESS_MIN_MS - elapsed);
      if (remainingDelay > 0) await sleep(remainingDelay);
      finishConversionProgress();
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isQuotaLocked) return;
    const nextFlowId = createFlowId();
    setFlowId(nextFlowId);
    await submitRender('normal', { flowIdOverride: nextFlowId });
  }

  function handleFileSelect(nextFile) {
    setRenderVerdict(null);
    setFile(nextFile);
    if (nextFile) { setError(null); setNotice(null); }
    setPdfBlob(null);
  }

  async function handleTrySample() {
    try {
      const sampleResponse = await fetch('/api/sample/premium');
      if (!sampleResponse.ok) throw new Error(`Failed to load sample CSV (${sampleResponse.status})`);
      const sampleCsv = await sampleResponse.text();
      const sample = new File([sampleCsv], 'enterprise-invoices-demo.csv', { type: 'text/csv' });
      handleFileSelect(sample);
      const nextFlowId = createFlowId();
      setFlowId(nextFlowId);
      await submitRender('compact', { flowIdOverride: nextFlowId, sourceFile: sample });
    } catch (err) {
      setError(err.message || 'Unable to load demo file');
    }
  }

  function handleRemoveFile() {
    setFile(null);
    setPdfBlob(null);
    setRenderVerdict(null);
    setError(null);
    setNotice(null);
  }

  async function handleGenerateOptimized() {
    const verdict = confidence?.verdict;
    if (lastRequestMode === 'optimized' && (verdict === 'WARN' || verdict === 'FAIL')) return;
    await submitRender('optimized', { flowIdOverride: flowId || createFlowId() });
  }

  async function handleGenerateCompact() {
    const verdict = confidence?.verdict;
    if (lastRequestMode === 'compact' && verdict === 'FAIL') return;
    await submitRender('compact', { flowIdOverride: flowId || createFlowId() });
  }

  function handleDownloadAnyway() {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, resolvedPdfFilename);
    setFlowId(null);
  }

  function handleLayoutChange(nextKey, nextChecked) {
    setLayout((current) => {
      if (!current || typeof current !== 'object') {
        return { overview: true, headers: true, footer: true, [nextKey]: Boolean(nextChecked) };
      }
      return { ...current, [nextKey]: Boolean(nextChecked) };
    });
  }

  async function postCheckout(url, payload = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 501) {
      quota.closeBuyCreditsPanel();
      setPurchaseMessage(CHECKOUT_COMING_SOON_MESSAGE);
      return { ok: false, response, data, shouldStop: true };
    }
    if (!response.ok) {
      setNotice(data?.error || 'Checkout request failed.');
      return { ok: false, response, data, shouldStop: true };
    }
    const checkoutUrl = data?.url;
    if (typeof checkoutUrl === 'string' && checkoutUrl) {
      if (typeof window !== 'undefined') window.location.assign(checkoutUrl);
      return { ok: true, response, data, shouldStop: true };
    }
    return { ok: true, response, data, shouldStop: true };
  }

  async function handleBuyCreditsPack(pack) {
    setPurchaseMessage('');
    if (!pack) return;
    await postCheckout('/api/credits/purchase/checkout', { pack });
  }

  async function handleGoProCheckout() {
    setPaywallReason('');
    setPurchaseMessage('');
    await postCheckout('/api/plan/pro/checkout', {});
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
    layout,
    handleLayoutChange,
    // conversion
    isLoading,
    error,
    notice,
    conversionProgress,
    handleSubmit,
    handleTrySample,
    handleGenerateOptimized,
    handleGenerateCompact,
    handleDownloadAnyway,
    // result
    pdfBlob,
    confidence,
    renderVerdict,
    resolvedPdfFilename,
    lastRequestMode,
    failureRecommendations,
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
    // internals
    flowId,
    reasonLabel,
  };
}

export { CHECKOUT_COMING_SOON_MESSAGE, reasonLabel, REASON_LABELS };
