'use client';

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
  LANDING_SECTIONS,
} from './siteCopy.mjs';
import { UI_TOKENS } from './ui/tokens.mjs';
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

export function getLandingSections(usedLeft = 3) {
  return LANDING_SECTIONS(usedLeft);
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

    const mq = window.matchMedia('(max-width: 480px)');
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

  const sections = LANDING_SECTIONS(freeExportsLeft);
  const heroSection = sections.find((section) => section.id === LANDING_COPY_KEYS.hero);
  const uploadSection = sections.find((section) => section.id === LANDING_COPY_KEYS.upload);
  const beforeAfterSection = sections.find((section) => section.id === LANDING_COPY_KEYS.beforeAfter);

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
    <main className="page">
      <style jsx>{`
        .page {
          --accent: ${UI_TOKENS.colors.accentRed};
          --muted: ${UI_TOKENS.colors.muted};
          min-height: 100vh;
          background: ${UI_TOKENS.colors.bg};
          color: ${UI_TOKENS.colors.text};
          padding: ${UI_TOKENS.spacing.x24} ${UI_TOKENS.spacing.x16};
          font-family: -apple-system, "SF Pro Text", "SF Pro Display", "Segoe UI", sans-serif;
          font-size: ${UI_TOKENS.typography.body.size};
          line-height: ${UI_TOKENS.typography.body.lineHeight};
        }

        .container {
          max-width: ${UI_TOKENS.maxWidth};
          margin: 0 auto;
          display: grid;
          gap: ${UI_TOKENS.spacing.x64};
        }

        .topBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: ${UI_TOKENS.spacing.x12};
        }

        .wordmark {
          color: var(--accent);
          text-decoration: none;
          font-size: 1.05rem;
          font-weight: 650;
          letter-spacing: 0.01em;
        }

        .topLinks {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: ${UI_TOKENS.spacing.x16};
          flex-wrap: wrap;
        }

        .topLink {
          text-decoration: none;
          color: ${UI_TOKENS.colors.text};
        }

        .hero {
          display: grid;
          gap: ${UI_TOKENS.spacing.x16};
        }

        .heroTitle {
          margin: 0;
          font-size: ${UI_TOKENS.typography.h1.mobile};
          line-height: ${UI_TOKENS.typography.h1.lineHeight};
          font-weight: ${UI_TOKENS.typography.h1.weight};
          letter-spacing: 0.01em;
          max-width: 16ch;
        }

        .heroSub,
        .trust,
        .note {
          margin: 0;
          color: var(--muted);
          max-width: 58ch;
        }

        .ctaRow,
        .primaryActionRow {
          display: grid;
          gap: ${UI_TOKENS.spacing.x12};
        }

        .ctaRow {
          width: fit-content;
        }

        .btn {
          height: ${UI_TOKENS.buttonHeight};
          border-radius: ${UI_TOKENS.radius.input};
          border: 1px solid ${UI_TOKENS.colors.border};
          text-decoration: none;
          color: ${UI_TOKENS.colors.text};
          padding: 0 1rem;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform ${UI_TOKENS.motion.duration} ease, opacity ${UI_TOKENS.motion.duration} ease;
        }

        .btn:hover {
          transform: translateY(1px);
          opacity: 0.93;
        }

        .btnPrimary {
          color: #fff;
          background: var(--accent);
          border-color: var(--accent);
        }

        .btnSmall {
          border-radius: ${UI_TOKENS.radius.pill};
          height: auto;
          min-height: ${UI_TOKENS.buttonHeight};
          padding: 0 0.85rem;
        }

        .section {
          display: grid;
          gap: ${UI_TOKENS.spacing.x16};
        }

        .sectionTitle {
          margin: 0;
          font-size: ${UI_TOKENS.typography.h2.mobile};
          line-height: ${UI_TOKENS.typography.h2.lineHeight};
          font-weight: ${UI_TOKENS.typography.h2.weight};
        }

        .sectionList {
          margin: 0;
          padding-left: 1.2rem;
          display: grid;
          gap: ${UI_TOKENS.spacing.x12};
          color: ${UI_TOKENS.colors.text};
        }

        .toolPanel {
          gap: ${UI_TOKENS.spacing.x16};
        }

        .quota {
          margin: 0;
          font-weight: 650;
        }

        .quotaLimit {
          color: #b91c1c;
        }

        .fileLabel {
          width: fit-content;
          border: 1px solid ${UI_TOKENS.colors.border};
          border-radius: ${UI_TOKENS.radius.input};
          padding: 0.45rem 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          font-weight: 600;
        }

        .fileInput {
          display: none;
        }

        .field {
          margin: 0;
          display: grid;
          gap: 0.45rem;
        }

        .warn {
          margin: 0;
          margin-top: 0.15rem;
          color: #7a2e2e;
          font-size: ${UI_TOKENS.typography.small.size};
        }

        .notice {
          margin-top: 0.45rem;
          color: #334155;
        }

        .error {
          margin-top: 0.45rem;
          color: #b91c1c;
        }

        .paywall {
          border: 1px solid #f8caca;
          background: #fff7f7;
          border-radius: ${UI_TOKENS.radius.base};
          padding: 0.85rem;
          display: grid;
          gap: 0.45rem;
        }

        .panel {
          border: 1px solid ${UI_TOKENS.colors.border};
          border-radius: ${UI_TOKENS.radius.base};
          padding: 0.95rem;
          background: #fff;
          display: grid;
          gap: 0.7rem;
        }

        .pricingStrip {
          display: grid;
          gap: ${UI_TOKENS.spacing.x12};
          border-top: 1px solid ${UI_TOKENS.colors.border};
          border-bottom: 1px solid ${UI_TOKENS.colors.border};
          padding: ${UI_TOKENS.spacing.x32} 0;
        }

        .pricingItems {
          display: grid;
          gap: ${UI_TOKENS.spacing.x8};
        }

        .pricingItem {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: ${UI_TOKENS.spacing.x16};
          border: 1px solid ${UI_TOKENS.colors.border};
          border-radius: ${UI_TOKENS.radius.base};
          padding: 0.72rem;
        }

        .smallAction {
          width: fit-content;
          border: 1px solid ${UI_TOKENS.colors.border};
          border-radius: ${UI_TOKENS.radius.pill};
          padding: 0.35rem 0.85rem;
          text-decoration: none;
          color: ${UI_TOKENS.colors.text};
          transition: transform ${UI_TOKENS.motion.duration} ease, opacity ${UI_TOKENS.motion.duration} ease;
        }

        .smallAction:hover {
          transform: translateY(1px);
          opacity: 0.9;
        }

        .footer {
          display: grid;
          gap: ${UI_TOKENS.spacing.x12};
          color: var(--muted);
          border-top: 1px solid ${UI_TOKENS.colors.border};
          padding-top: ${UI_TOKENS.spacing.x24};
        }

        .footerLinks {
          display: flex;
          align-items: center;
          gap: ${UI_TOKENS.spacing.x16};
          flex-wrap: wrap;
        }

        .footerLinks a {
          text-decoration: none;
          color: ${UI_TOKENS.colors.text};
        }

        .muted {
          color: var(--muted);
          font-size: 0.93rem;
        }

        .micro {
          color: var(--muted);
          font-size: ${UI_TOKENS.typography.small.size};
        }

        @media (max-width: 480px) {
          .page {
            padding: ${UI_TOKENS.spacing.x24} ${UI_TOKENS.spacing.x16};
          }

          .heroTitle {
            font-size: ${UI_TOKENS.typography.h1.mobile};
          }

          .sectionTitle {
            font-size: ${UI_TOKENS.typography.h2.mobile};
          }

          .topLinks {
            width: 100%;
            justify-content: flex-start;
          }

          .ctaRow,
          .primaryActionRow {
            width: 100%;
            grid-template-columns: 1fr;
          }

          .btn,
          .btnSmall {
            width: 100%;
          }
        }

        @media (min-width: 481px) {
          .heroTitle {
            font-size: ${UI_TOKENS.typography.h1.desktop};
          }

          .sectionTitle {
            font-size: ${UI_TOKENS.typography.h2.desktop};
          }

          .ctaRow {
            grid-template-columns: repeat(3, auto);
          }

          .primaryActionRow[data-cta="row"] {
            grid-template-columns: repeat(2, auto);
          }
        }
      `}</style>

      <div className="container">
        <header className="topBar" id={LANDING_COPY_KEYS.topBar}>
          <a className="wordmark" href="/" data-testid="wordmark">{LANDING_COPY.logoText}</a>
          <nav className="topLinks" aria-label="Main navigation">
            {LANDING_COPY.topBarLinks.map((link) => (
              <a className="topLink" key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
            <a className="topLink" href={TELEGRAM_BOT_URL}>
              {LANDING_COPY.telegramCta}
            </a>
          </nav>
        </header>

        <section className="hero" id={LANDING_COPY_KEYS.hero}>
          <h1 className="heroTitle">{heroSection.title}</h1>
          <p className="heroSub">{LANDING_COPY.heroSubheadline}</p>
          <p className="trust">{heroSection.trustLines[0]}</p>
          <div className="ctaRow" data-cta={ctaLayout}>
            <a className="btn btnPrimary" href={heroSection.ctas[0].href} data-testid="primary-cta">
              {heroSection.ctas[0].label}
            </a>
            <a className="btn btnSmall" href={heroSection.ctas[1].href}>
              {heroSection.ctas[1].label}
            </a>
            <a className="btn btnSmall" href={heroSection.ctas[2].href}>
              {heroSection.ctas[2].label}
            </a>
          </div>
        </section>

        <section className="section" id={LANDING_COPY_KEYS.problem}>
          <h2 className="sectionTitle">{LANDING_COPY.problemTitle}</h2>
          <ul className="sectionList">
            {LANDING_COPY.problemBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section" id={LANDING_COPY_KEYS.beforeAfter}>
          <h2 className="sectionTitle">{beforeAfterSection.title}</h2>
          <BeforeAfter
            beforeLabel={LANDING_COPY.beforeLabel}
            afterLabel={LANDING_COPY.afterLabel}
            isMobile={isMobile}
            layoutMode={beforeAfterLayout}
          />
        </section>

        <section className="section" id={LANDING_COPY_KEYS.clientReady}>
          <h2 className="sectionTitle">{LANDING_COPY.clientReadyTitle}</h2>
          <ul className="sectionList">
            {LANDING_COPY.clientReadyBullets.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section toolPanel" id={LANDING_COPY_KEYS.upload}>
          <h2 className="sectionTitle">{uploadSection.title}</h2>
          <p className="note">{LANDING_COPY.toolSubcopy}</p>
          <p className="quota">
            {uploadSection.freeQuotaText}
            {freeExportsLeft === 0 ? <span className="quotaLimit"> Free limit reached</span> : null}
          </p>

          <form onSubmit={handleSubmit}>
            <p className="field">
              <label htmlFor="fitforpdf-file" className="fileLabel">
                Select a file (CSV / XLSX)
                <input
                  id="fitforpdf-file"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  disabled={isLoading}
                  className="fileInput"
                />
              </label>
            </p>
            <p className="field note">{file ? file.name : 'No file selected'}</p>

            <label className="field">
              <input
                type="checkbox"
                checked={includeBranding}
                onChange={(e) => setIncludeBranding(e.target.checked)}
                disabled={isLoading}
                style={{ marginRight: '0.5rem' }}
              />
              {LANDING_COPY.brandingOptionLabel}
            </label>

            <label className="field">
              <input
                type="checkbox"
                checked={truncateLongText}
                onChange={(e) => setTruncateLongText(e.target.checked)}
                disabled={isLoading}
                style={{ marginRight: '0.5rem' }}
              />
              {LANDING_COPY.truncateOptionLabel}
            </label>
            {!truncateLongText ? <p className="warn">{LANDING_COPY.truncateNotice}</p> : null}

            <div className="primaryActionRow" data-cta={ctaLayout}>
              <button className="btn btnPrimary" type="submit" disabled={isLoading}>
                {isLoading ? 'Generating…' : LANDING_COPY.heroPrimaryCta}
              </button>
              {!shouldHidePaywallReset ? (
                <button
                  type="button"
                  className="btn"
                  onClick={handleResetPaywallForDev}
                  disabled={isLoading}
                >
                  Reset free exports (dev)
                </button>
              ) : null}
            </div>
          </form>

          {notice && <p className="notice">{notice}</p>}
          {error && <p className="error">{error}</p>}

          {canShowPanel ? (
            <div className="paywall">
              <p style={{ margin: 0, fontWeight: 600 }}>You&apos;ve used your 3 free exports.</p>
              <a href="/pricing" className="btn">See pricing</a>
            </div>
          ) : null}

          {verdict === 'WARN' && (
            <section className="panel" aria-label="Warning">
              <p style={{ margin: 0 }}><span style={{
                display: 'inline-block',
                fontSize: '0.8rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '999px',
                background: '#f1f5f9',
                color: '#334155',
                marginRight: '0.5rem',
              }}>Recommended check</span>{confidence?.score != null ? <span style={{ color: '#555' }}>Score: {confidence.score}</span> : null}</p>

              {warnReasons.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowDetails((v) => !v)}
                    aria-expanded={showDetails}
                    className="btn"
                  >
                    {showDetails ? 'Hide details' : 'Show details'}
                  </button>
                  {showDetails && (
                    <ul style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                      {warnReasons.map((reason, idx) => (
                        <li key={`${reason}-${idx}`}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn" type="button" onClick={handleDownloadAnyway} disabled={isLoading || !pdfBlob}>
                  Download anyway
                </button>
                {!stillRiskAfterOptimized && (
                  <button className="btn" type="button" onClick={handleGenerateOptimized} disabled={isLoading}>
                    Generate optimized version
                  </button>
                )}
              </div>
              {stillRiskAfterOptimized && (
                <p style={{ marginTop: '0.75rem', color: '#555' }}>
                  Optimized version generated. Please review before using.
                </p>
              )}
            </section>
          )}

          {verdict === 'FAIL' && failKind === 'page_burden' && (
            <section className="panel" aria-label="Page burden">
              <p style={{ margin: 0, color: '#92400e', fontWeight: 600 }}>
                {pageBurdenCopy.title}
              </p>
              <p style={{ marginTop: '0.75rem', marginBottom: 0, color: '#78350f' }}>
                {pageBurdenCopy.description}
              </p>
              {failureRecommendations.length > 0 && (
                <ul style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  {failureRecommendations.map((recommendation, idx) => (
                    <li key={`${recommendation}-${idx}`}>{recommendationLabel(recommendation)}</li>
                  ))}
                </ul>
              )}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn" type="button" onClick={handleGenerateCompact} disabled={isLoading || stillRiskAfterCompact}>
                  {pageBurdenCopy.primaryCta}
                </button>
                <button className="btn" type="button" disabled title="Coming soon">
                  {pageBurdenCopy.secondaryCta}
                </button>
              </div>
              {stillRiskAfterCompact && (
                <p style={{ marginTop: '0.75rem', color: '#555' }}>
                  Even in compact mode it is still too large. Reduce scope.
                </p>
              )}
            </section>
          )}

          {verdict === 'FAIL' && failKind !== 'page_burden' && (
            <section className="panel" aria-label="Failure">
              <p style={{ margin: 0, color: '#991b1b', fontWeight: 600 }}>
                PDF risk {confidence?.score != null ? `(Score: ${confidence.score})` : ''}
              </p>
              {failReasons.length > 0 && (
                <ul style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  {failReasons.map((reason, idx) => (
                    <li key={`${reason}-${idx}`}>{reason}</li>
                  ))}
                </ul>
              )}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {stillRiskAfterOptimized ? (
                  <button className="btn" type="button" onClick={handleDownloadAnyway} disabled={isLoading || !pdfBlob}>
                    Download anyway
                  </button>
                ) : (
                  <>
                    <button className="btn" type="button" onClick={handleGenerateOptimized} disabled={isLoading}>
                      Generate optimized version
                    </button>
                    <button className="btn" type="button" onClick={handleDownloadAnyway} disabled={isLoading || !pdfBlob}>
                      Download anyway
                    </button>
                  </>
                )}
              </div>
              {stillRiskAfterOptimized && (
                <p style={{ marginTop: '0.75rem', color: '#555' }}>
                  Optimized version generated. Please review before using.
                </p>
              )}
            </section>
          )}

          {canShowDebug && (debugMetrics || columnMapDebug) && (
            <section className="panel" aria-label="Debug">
              <button type="button" onClick={() => setShowDebug((v) => !v)} aria-expanded={showDebug} className="btn">
                {showDebug ? 'Hide debug' : 'Debug'}
              </button>
              {showDebug && (
                <>
                  {columnMapDebug && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <strong>Column Map</strong>
                      <div>mode: {columnMapDebug.mode}</div>
                      <div>rendered: {columnMapDebug.rendered}</div>
                      <div>sections: {columnMapDebug.entries ?? 'unknown'}</div>
                    </div>
                  )}
                  {debugMetrics && (
                    <pre style={{ marginTop: '0.75rem', overflow: 'auto', fontSize: '0.8rem' }}>
                      {JSON.stringify(debugMetrics, null, 2)}
                    </pre>
                  )}
                </>
              )}
            </section>
          )}
        </section>

        <section className="pricingStrip" id={LANDING_COPY_KEYS.pricingPreview} aria-label="Simple pricing">
          <p className="sectionTitle" style={{ margin: 0 }}>{LANDING_COPY.pricingPreviewTitle}</p>
          <p className="micro">{LANDING_COPY.pricingPreviewSubline}</p>
          <div className="pricingItems">
            {LANDING_COPY.pricingPreviewItems.map((item) => (
              <div className="pricingItem" key={item.label}>
                <span>{item.label}</span>
                <span>{item.copy}</span>
              </div>
            ))}
          </div>
          <a className="smallAction" href="/pricing"> {LANDING_COPY.pricingPreviewCta}</a>
        </section>

        <section className="section" id={LANDING_COPY_KEYS.privacyStrip} aria-label={LANDING_COPY.privacyStripTitle}>
          <h2 className="sectionTitle">{LANDING_COPY.privacyStripTitle}</h2>
          <ul className="sectionList">
            {LANDING_COPY.privacyStripBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a className="smallAction" href="/privacy">{LANDING_COPY.privacyStripCta}</a>
        </section>

        <footer className="footer" aria-label="Footer">
          <nav className="footerLinks" aria-label="Footer links">
            {LANDING_COPY.footerLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <p className="muted">{LANDING_COPY.footerCopyright}</p>
        </footer>
      </div>
    </main>
  );
}
