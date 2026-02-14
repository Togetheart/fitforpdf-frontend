'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import {
  buildRenderUrl,
  getFailKind,
  getPageBurdenUiCopy,
  isPageBurdenFail,
  normalizePageBurdenRecommendations,
  recommendationLabel,
} from './pageUiLogic.mjs';
import {
  canExport,
  freeLeft,
  incrementUsedCount,
  resetDevOnly,
} from './paywall.mjs';
import {
  LANDING_COPY,
  TELEGRAM_BOT_URL,
  LANDING_COPY_KEYS,
} from './siteCopy.mjs';
import { getCtaLayout, getLayoutMode } from './ui/responsive.mjs';
import BeforeAfter from './components/BeforeAfter.mjs';

const API_BASE = '/api';

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
  try {
    return decodeURIComponent(raw.replace(/^\"|\"$/g, '').trim());
  } catch {
    return raw.replace(/^\"|\"$/g, '').trim() || fallback;
  }
}

function parseReasons(rawReasons) {
  if (!rawReasons || rawReasons === 'N/A') return [];
  return String(rawReasons)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseConfidenceFromHeaders(headers) {
  const verdict = headers.get('x-cleansheet-verdict');
  if (!verdict || verdict === 'N/A') return null;
  const scoreRaw = headers.get('x-cleansheet-score');
  const score = Number.parseInt(scoreRaw || '', 10);
  const reasons = parseReasons(headers.get('x-cleansheet-reasons'));
  return {
    verdict,
    score: Number.isFinite(score) ? score : null,
    reasons,
    metrics: null,
  };
}

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

function reasonLabel(reason) {
  const normalized = String(reason || '').trim();
  return REASON_LABELS[normalized] || normalized;
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

function parseDebugMetricsHeader(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function parseColumnMapDebugFromHeaders(headers) {
  const mode = headers.get('x-cleansheet-column-map-mode');
  const renderedRaw = headers.get('x-cleansheet-column-map-rendered');
  const entriesRaw = headers.get('x-cleansheet-column-map-entries');
  if (!mode && !renderedRaw && !entriesRaw) return null;
  const rendered = renderedRaw === '1' ? 'yes' : renderedRaw === '0' ? 'no' : (renderedRaw || 'unknown');
  const entries = Number.parseInt(entriesRaw || '', 10);
  return {
    mode: mode || 'unknown',
    rendered,
    entries: Number.isFinite(entries) ? entries : null,
  };
}

async function parseConfidenceFromJsonIfAvailable(res) {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) return null;
  try {
    const data = await res.clone().json();
    if (!data || typeof data !== 'object') return null;
    if (data.confidence && typeof data.confidence === 'object') return data.confidence;
    if (data.verdict || data.score || Array.isArray(data.reasons)) {
      return {
        verdict: data.verdict || null,
        score: data.score ?? null,
        reasons: Array.isArray(data.reasons) ? data.reasons : [],
        metrics: data.metrics || null,
      };
    }
  } catch (_) {
    return null;
  }
  return null;
}

const CTA_BASE = 'inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition duration-150';
const CTA_PRIMARY = `${CTA_BASE} border-[#D92D2A] bg-[#D92D2A] text-white`;
const CTA_SECONDARY = `${CTA_BASE} border-slate-300 bg-white text-slate-900 hover:bg-slate-50`;
const PANEL = 'rounded-xl border border-slate-200 bg-white';

const pricingCards = [
  {
    title: 'Free',
    copy: ['3 exports total'],
  },
  {
    title: 'Credits',
    copy: ['100 exports • €19', '500 exports • €79'],
  },
  {
    title: 'Pro and API',
    copy: ['Pro: €29/month', 'API: usage-based'],
    note: 'coming soon',
  },
];

function SectionShell({ id, index, children, testId }) {
  return (
    <section
      id={id}
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
      data-section-bg={index % 2 === 0 ? 'white' : 'gray'}
      data-testid={testId ?? `section-${id}`}
    >
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12 md:py-14">
        {children}
      </div>
    </section>
  );
}

export default function Page() {
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
  const [freeExportsLeft, setFreeExportsLeft] = useState(() => freeLeft());
  const [showPaywall, setShowPaywall] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const debugParam = new URLSearchParams(window.location.search).get('debug');
    setDebugByQuery(debugParam === '1');
    setFreeExportsLeft(freeLeft());

    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const ctaLayout = getCtaLayout({ isMobile });
  const beforeAfterLayout = getLayoutMode({ isMobile });
  const canShowDebug = process.env.NODE_ENV !== 'production' || debugByQuery;
  const canShowPanel = showPaywall || freeExportsLeft <= 0;
  const shouldHidePaywallReset = process.env.NODE_ENV === 'production' && !debugByQuery;
  const ctaStackClass = ctaLayout === 'stack' ? 'grid grid-cols-1' : 'grid grid-cols-1 sm:grid-cols-3';

  function refreshFreeExports() {
    setFreeExportsLeft(freeLeft());
  }

  function openPaywallPanel() {
    setShowPaywall(true);
  }

  function handleResetPaywallForDev() {
    resetDevOnly();
    refreshFreeExports();
    setShowPaywall(false);
    setError(null);
    setNotice(null);
  }

  async function submitRender(mode = 'normal', opts = {}) {
    const { isFallback = false, preserveNotice = false, flowIdOverride = null } = opts;
    if (!file) {
      setError('Select a file');
      return;
    }

    if (!canExport()) {
      setError('You\'ve used your 3 free exports.');
      setNotice('You\'ve used your 3 free exports.');
      openPaywallPanel();
      return;
    }

    const activeFlowId = flowIdOverride || flowId || createFlowId();

    setError(null);
    if (!preserveNotice) setNotice(null);
    setFailureRecommendations([]);
    setColumnMapDebug(null);
    setIsLoading(true);
    setFlowId(activeFlowId);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('branding', includeBranding ? '1' : '0');

      const res = await fetch(buildRenderUrl(API_BASE, mode, { truncateLongText }), {
        method: 'POST',
        body: formData,
        headers: {
          'X-CleanSheet-Flow-Id': activeFlowId,
          'X-FitForPDF-Source-Filename': file.name || '',
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const confidenceFromErrorHeaders = parseConfidenceFromHeaders(res.headers);
        const failureConfidence = normalizeConfidence(
          (data && data.confidence) || confidenceFromErrorHeaders
        );
        const headerReasonCodes = parseReasons(res.headers.get('x-cleansheet-reasons'));
        const bodyReasonCodes = normalizeReasons(data?.confidence?.reasons);
        const pageBurdenDetected = (
          (failureConfidence && isPageBurdenFail(failureConfidence))
          || headerReasonCodes.includes('page_burden_high')
          || bodyReasonCodes.includes('page_burden_high')
        );
        if (pageBurdenDetected) {
          setConfidence(failureConfidence || {
            verdict: 'FAIL',
            score: null,
            reasons: ['page_burden_high'],
            metrics: null,
          });
          setPdfBlob(null);
          setLastRequestMode(mode);
          setShowDetails(false);
          setFailureRecommendations(
            normalizePageBurdenRecommendations(data.recommendations)
          );
          return;
        }

        if (mode === 'optimized' && !isFallback) {
          setNotice('Optimized mode unavailable; standard version generated.');
          await submitRender('normal', { isFallback: true, preserveNotice: true, flowIdOverride: activeFlowId });
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
        getPdfFilenameFromSourceFile(file),
      );

      if (isPdfResponse) {
        const used = incrementUsedCount();
        const remaining = 3 - used;
        setFreeExportsLeft(Math.max(0, remaining));
        if (used >= 3) openPaywallPanel();
      }

      setPdfBlob(blob);
      setResolvedPdfFilename(responseFilename);
      setConfidence(confidenceData);
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
        setPdfBlob(null);
        setConfidence(null);
        setFlowId(null);
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextFlowId = createFlowId();
    setFlowId(nextFlowId);
    await submitRender('normal', { flowIdOverride: nextFlowId });
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

  const verdict = confidence?.verdict;
  const stillRiskAfterOptimized = lastRequestMode === 'optimized' && (verdict === 'WARN' || verdict === 'FAIL');
  const stillRiskAfterCompact = lastRequestMode === 'compact' && verdict === 'FAIL';
  const failKind = getFailKind(confidence);
  const pageBurdenCopy = getPageBurdenUiCopy();
  const warnReasons = (confidence?.reasons || []).map(reasonLabel).slice(0, 2);
  const failReasons = (confidence?.reasons || []).map(reasonLabel).slice(0, 3);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SectionShell id={LANDING_COPY_KEYS.topBar} index={0}>
        <header className="flex items-center justify-between gap-3">
          <a href="/" className="text-xl font-semibold text-[#D92D2A]" data-testid="wordmark">
            {LANDING_COPY.logoText}
          </a>
          <nav className="ml-auto flex items-center gap-3" aria-label="Main navigation">
            {LANDING_COPY.topBarLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-slate-900 hover:opacity-80">
                {link.label}
              </a>
            ))}
            <a href={TELEGRAM_BOT_URL} className="text-sm text-slate-900 hover:opacity-80">
              {LANDING_COPY.telegramCta}
            </a>
          </nav>
        </header>
      </SectionShell>

      <SectionShell id={LANDING_COPY_KEYS.hero} index={1} testId="hero-section">
        <section className="space-y-4">
          <h1 className="text-[44px] font-[650] leading-tight tracking-tight sm:text-6xl">
            {LANDING_COPY.heroTitle}
          </h1>
          <p className="max-w-[58ch] text-base text-slate-600">{LANDING_COPY.heroSubheadline}</p>
          <p className="max-w-[58ch] text-sm text-slate-500">{LANDING_COPY.heroTrustLine}</p>
          <div className="mt-8">
            <a
              href="#tool"
              data-testid="primary-cta"
              className="inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-7 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:scale-[0.99] transition"
            >
              {LANDING_COPY.heroPrimaryCta}
            </a>
          </div>
        </section>
      </SectionShell>

      <SectionShell id={LANDING_COPY_KEYS.problem} index={2}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">{LANDING_COPY.problemTitle}</h2>
          <ul className="ml-4 list-disc space-y-2 text-slate-700">
            {LANDING_COPY.problemBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </SectionShell>

      <SectionShell id={LANDING_COPY_KEYS.beforeAfter} index={3}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">
            {LANDING_COPY.beforeAfterTitle}
          </h2>
          <BeforeAfter
            beforeLabel={LANDING_COPY.beforeLabel}
            afterLabel={LANDING_COPY.afterLabel}
            isMobile={isMobile}
            layoutMode={beforeAfterLayout}
          />
        </div>
      </SectionShell>

      <SectionShell id={LANDING_COPY_KEYS.clientReady} index={4}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">{LANDING_COPY.clientReadyTitle}</h2>
          <ul className="ml-4 list-disc space-y-2 text-slate-700">
            {LANDING_COPY.clientReadyBullets.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </SectionShell>

      <SectionShell id={LANDING_COPY_KEYS.upload} index={5} testId="tool-section">
        <div className="space-y-4">
          <article className={`${PANEL} p-4 sm:p-6`}>
            <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">
              {LANDING_COPY.toolTitle}
            </h2>
            <p className="text-sm text-slate-500">{LANDING_COPY.toolSubcopy}</p>
            <p className="mt-3 font-semibold text-slate-900">
              Free exports left: {freeExportsLeft} / 3
              {freeExportsLeft === 0 ? <span className="ml-2 text-red-700">Free limit reached</span> : null}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <label htmlFor="fitforpdf-file" className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-slate-300 px-4 text-sm font-medium">
                Select a file (CSV / XLSX)
                <input
                  id="fitforpdf-file"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-slate-600">{file ? file.name : 'No file selected'}</p>

              <label className="flex items-center text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={includeBranding}
                  onChange={(e) => setIncludeBranding(e.target.checked)}
                  disabled={isLoading}
                  className="mr-2 h-4 w-4"
                />
                {LANDING_COPY.brandingOptionLabel}
              </label>

              <label className="flex items-center text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={truncateLongText}
                  onChange={(e) => setTruncateLongText(e.target.checked)}
                  disabled={isLoading}
                  className="mr-2 h-4 w-4"
                />
                {LANDING_COPY.truncateOptionLabel}
              </label>

              {!truncateLongText ? (
                <p className="text-xs text-rose-700">{LANDING_COPY.truncateNotice}</p>
              ) : null}

              <div className={`${ctaStackClass} w-full gap-3`}>
                <button className={CTA_PRIMARY} type="submit" disabled={isLoading}>
                  {isLoading ? 'Generating…' : LANDING_COPY.heroPrimaryCta}
                </button>
                {!shouldHidePaywallReset ? (
                  <button
                    type="button"
                    className={CTA_SECONDARY}
                    onClick={handleResetPaywallForDev}
                    disabled={isLoading}
                  >
                    Reset free exports (dev)
                  </button>
                ) : null}
              </div>
            </form>

            {notice && <p className="mt-2 text-sm text-amber-700">{notice}</p>}
            {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}

            {canShowPanel ? (
              <section className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p className="mb-2 font-semibold text-rose-700">You&apos;ve used your 3 free exports.</p>
                <a href="/pricing" className={CTA_SECONDARY}>See pricing</a>
              </section>
            ) : null}
          </article>

          {verdict === 'WARN' && (
            <section className={`${PANEL} p-4`}>
              <p>
                <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  Recommended check
                </span>
                {confidence?.score != null ? <span className="ml-2 text-slate-700">Score: {confidence.score}</span> : null}
              </p>
              {warnReasons.length > 0 && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowDetails((v) => !v)}
                    aria-expanded={showDetails}
                    className={CTA_SECONDARY}
                  >
                    {showDetails ? 'Hide details' : 'Show details'}
                  </button>
                  {showDetails && (
                    <ul className="mt-3 space-y-1 list-disc pl-6 text-sm text-slate-700">
                      {warnReasons.map((reason, idx) => (
                        <li key={`${reason}-${idx}`}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button className={CTA_SECONDARY} type="button" onClick={handleDownloadAnyway} disabled={isLoading || !pdfBlob}>
                  Download anyway
                </button>
                {!stillRiskAfterOptimized && (
                  <button className={CTA_SECONDARY} type="button" onClick={handleGenerateOptimized} disabled={isLoading}>
                    Generate optimized version
                  </button>
                )}
              </div>
              {stillRiskAfterOptimized ? (
                <p className="mt-3 text-sm text-slate-700">
                  Optimized version generated. Please review before using.
                </p>
              ) : null}
            </section>
          )}

          {verdict === 'FAIL' && failKind === 'page_burden' && (
            <section className={`${PANEL} p-4`}>
              <p className="font-semibold text-amber-700">{pageBurdenCopy.title}</p>
              <p className="mt-3 text-sm text-amber-800">{pageBurdenCopy.description}</p>
              {failureRecommendations.length > 0 && (
                <ul className="mt-3 space-y-1 list-disc pl-6 text-sm text-slate-700">
                  {failureRecommendations.map((recommendation, idx) => (
                    <li key={`${recommendation}-${idx}`}>{recommendationLabel(recommendation)}</li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button className={CTA_SECONDARY} type="button" onClick={handleGenerateCompact} disabled={isLoading || stillRiskAfterCompact}>
                  {pageBurdenCopy.primaryCta}
                </button>
                <button className={CTA_SECONDARY} type="button" disabled title="Coming soon">
                  {pageBurdenCopy.secondaryCta}
                </button>
              </div>
              {stillRiskAfterCompact ? (
                <p className="mt-3 text-sm text-slate-700">
                  Even in compact mode it is still too large. Reduce scope.
                </p>
              ) : null}
            </section>
          )}

          {verdict === 'FAIL' && failKind !== 'page_burden' && (
            <section className={`${PANEL} p-4`}>
              <p className="font-semibold text-rose-700">
                PDF risk {confidence?.score != null ? `(Score: ${confidence.score})` : ''}
              </p>
              {failReasons.length > 0 && (
                <ul className="mt-3 space-y-1 list-disc pl-6 text-sm text-slate-700">
                  {failReasons.map((reason, idx) => (
                    <li key={`${reason}-${idx}`}>{reason}</li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                {stillRiskAfterOptimized ? (
                  <button className={CTA_SECONDARY} type="button" onClick={handleDownloadAnyway} disabled={isLoading || !pdfBlob}>
                    Download anyway
                  </button>
                ) : (
                  <>
                    <button className={CTA_SECONDARY} type="button" onClick={handleGenerateOptimized} disabled={isLoading}>
                      Generate optimized version
                    </button>
                    <button className={CTA_SECONDARY} type="button" onClick={handleDownloadAnyway} disabled={isLoading || !pdfBlob}>
                      Download anyway
                    </button>
                  </>
                )}
              </div>
              {stillRiskAfterOptimized ? (
                <p className="mt-3 text-sm text-slate-700">
                  Optimized version generated. Please review before using.
                </p>
              ) : null}
            </section>
          )}

          {canShowDebug && (debugMetrics || columnMapDebug) && (
            <section className={`${PANEL} p-4`}>
              <button
                type="button"
                onClick={() => setShowDebug((v) => !v)}
                aria-expanded={showDebug}
                className={CTA_SECONDARY}
              >
                {showDebug ? 'Hide debug' : 'Debug'}
              </button>
              {showDebug && (
                <>
                  {columnMapDebug && (
                    <div className="mt-3 space-y-1 text-sm text-slate-700">
                      <p className="font-semibold">Column Map</p>
                      <p>mode: {columnMapDebug.mode}</p>
                      <p>rendered: {columnMapDebug.rendered}</p>
                      <p>sections: {columnMapDebug.entries ?? 'unknown'}</p>
                    </div>
                  )}
                  {debugMetrics && (
                    <pre className="mt-3 max-h-48 overflow-auto text-xs text-slate-700">
                      {JSON.stringify(debugMetrics, null, 2)}
                    </pre>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </SectionShell>

      <SectionShell id={LANDING_COPY_KEYS.pricingPreview} index={6}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">
            {LANDING_COPY.pricingPreviewTitle}
          </h2>
          <p className="text-sm text-slate-500">{LANDING_COPY.pricingPreviewSubline}</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3" data-section="pricing-grid" data-testid="pricing-grid">
            {pricingCards.map((item) => (
              <article key={item.title} className={`${PANEL} p-4`}>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {item.copy.map((line) => <li key={line}>{line}</li>)}
                </ul>
                {item.note ? <p className="mt-2 text-xs text-amber-700">{item.note}</p> : null}
              </article>
            ))}
          </div>
          <a href="/pricing" className={`${CTA_SECONDARY} w-fit`}>
            {LANDING_COPY.pricingPreviewCta}
          </a>
        </div>
      </SectionShell>

      <SectionShell id={LANDING_COPY_KEYS.privacyStrip} index={7}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">{LANDING_COPY.privacyStripTitle}</h2>
          <ul className="ml-4 list-disc space-y-2 text-slate-700">
            {LANDING_COPY.privacyStripBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a href="/privacy" className={`${CTA_SECONDARY} w-fit`}>{LANDING_COPY.privacyStripCta}</a>
        </div>
      </SectionShell>

      <SectionShell index={8}>
        <footer className="flex flex-col gap-3">
          <nav className="flex flex-wrap items-center gap-4" aria-label="Footer links">
            {LANDING_COPY.footerLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-slate-700">
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-sm text-slate-500">{LANDING_COPY.footerCopyright}</p>
        </footer>
      </SectionShell>
    </main>
  );
}
