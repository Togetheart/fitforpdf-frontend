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
  min_font_low: 'Texte trop petit pour un envoi fiable',
  overflow_cells: 'Certaines cellules dépassent la zone disponible',
  high_wrap_rate: 'Beaucoup de lignes passent sur plusieurs lignes',
  high_truncation: 'Des contenus ont été tronqués',
  max_row_height_hit: 'Certaines lignes ont été limitées en hauteur',
  zero_width_column: 'Une colonne est devenue illisible',
  page_burden_high: 'Document trop volumineux pour un envoi direct',
  // Legacy/fallback codes from scoreV2 path.
  column_collapse: 'Les colonnes sont trop compressées pour rester lisibles',
  wrap_severe: 'La mise en page provoque des retours à la ligne excessifs',
  missing_rows_severe: 'Des lignes semblent manquantes dans le rendu',
  small_font: 'La taille de texte est trop petite',
  header_not_repeated: 'L’en-tête n’est pas correctement répété',
  missing_rows: 'Le rendu semble incomplet',
  empty_or_header_only: 'Le document semble vide ou incomplet',
  blank_pages: 'Une ou plusieurs pages semblent vides',
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
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const debugParam = new URLSearchParams(window.location.search).get('debug');
    setDebugByQuery(debugParam === '1');
    setFreeExportsLeft(freeLeft());
  }, []);

  const canShowDebug = process.env.NODE_ENV !== 'production' || debugByQuery;
  const canShowPanel = showPaywall || freeExportsLeft <= 0;
  const shouldHidePaywallReset = process.env.NODE_ENV === 'production' && !debugByQuery;

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
          setNotice('Mode optimisé indisponible, version standard générée.');
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

  async function handleCheckout(pack) {
    if (isCheckoutLoading) return;
    setError(null);
    setNotice(null);
    setIsCheckoutLoading(true);

    try {
      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pack }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.url) {
        throw new Error(payload.error || 'Checkout failed');
      }

      window.location.assign(payload.url);
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setIsCheckoutLoading(false);
    }
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
          --accent: #c81e1e;
          min-height: 100vh;
          padding: clamp(1.25rem, 2.5vw, 2.5rem);
          background: #fff;
          color: #111827;
          font-family: "Avenir Next", "Avenir", "Segoe UI", sans-serif;
        }
        .container {
          max-width: 70rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .hero {
          text-align: left;
        }
        .logo {
          font-size: 2.1rem;
          letter-spacing: 0.02em;
          color: var(--accent);
          margin: 0;
        }
        .subtitle {
          margin-top: 0.4rem;
          color: #475569;
        }
        .comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 0.85rem;
          background: #fff;
          transition: transform 160ms ease, opacity 160ms ease;
          min-height: 220px;
        }
        .card:hover {
          transform: translateY(-1px);
          opacity: 0.97;
        }
        .cardTitle {
          font-size: 0.95rem;
          margin: 0 0 0.6rem;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .placeholder {
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          height: 150px;
          display: grid;
          place-items: center;
          color: #64748b;
          text-transform: uppercase;
          font-size: 0.85rem;
          background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
        }
        .panel {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          background: #ffffff;
          box-shadow: 0 1px 0 rgba(15, 23, 42, 0.05);
        }
        .paywall {
          border: 1px solid #fecaca;
          background: #fff5f5;
        }
        .quotaLine {
          font-weight: 600;
          margin: 0 0 0.9rem;
          color: #0f172a;
        }
        .quotaLimit {
          color: #b91c1c;
          margin-left: 0.5rem;
          font-weight: 700;
        }
        .field {
          margin-bottom: 0.9rem;
          width: 100%;
          display: block;
        }
        .btn {
          border: 0;
          border-radius: 10px;
          padding: 0.58rem 1rem;
          background: var(--accent);
          color: #fff;
          font-weight: 600;
          transition: transform 140ms ease, opacity 140ms ease;
          cursor: pointer;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          opacity: 0.94;
        }
        .btn:disabled {
          opacity: 0.56;
          cursor: default;
        }
        .link {
          color: #991b1b;
          text-decoration: none;
          font-weight: 600;
        }
        .link:hover {
          text-decoration: underline;
        }
        .secondaryBtn {
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #0f172a;
          border-radius: 10px;
          padding: 0.58rem 1rem;
          cursor: pointer;
        }
        .planGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
        .planCard {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.75rem;
          background: #fff;
        }
        .planTitle {
          margin: 0;
          font-size: 0.95rem;
          color: #0f172a;
        }
        .planSub {
          margin: 0.2rem 0 0;
          color: #475569;
          font-size: 0.85rem;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          margin-top: 0.85rem;
        }
        .muted {
          color: #64748b;
        }
        @media (max-width: 780px) {
          .comparison {
            grid-template-columns: 1fr;
          }
          .planGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="container">
        <header className="hero">
          <h1 className="logo">FitForPDF</h1>
          <p className="subtitle">Upload a CSV or XLSX and generate a clean PDF in one step.</p>
        </header>

        <section className="comparison" aria-label="Before and after example">
          <article className="card">
            <h2 className="cardTitle">Before</h2>
            <div className="placeholder">CSV input</div>
          </article>
          <article className="card">
            <h2 className="cardTitle">After</h2>
            <div className="placeholder">PDF output</div>
          </article>
        </section>

        <section className="panel">
          <p className="quotaLine">
            Free exports left: {freeExportsLeft} / 3
            {freeExportsLeft === 0 ? <span className="quotaLimit">Free limit reached</span> : null}
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={isLoading}
              className="field"
            />
            <label className="field">
              <input
                type="checkbox"
                checked={includeBranding}
                onChange={(e) => setIncludeBranding(e.target.checked)}
                disabled={isLoading}
                style={{ marginRight: '0.5rem' }}
              />
              Add “Made with FitForPDF” footer
            </label>
            <label className="field">
              <input
                type="checkbox"
                checked={truncateLongText}
                onChange={(e) => setTruncateLongText(e.target.checked)}
                disabled={isLoading}
                style={{ marginRight: '0.5rem' }}
              />
              Tronquer les textes longs (réduit le volume)
            </label>
            <button className="btn" type="submit" disabled={isLoading}>
              {isLoading ? 'Generating…' : 'Generate PDF'}
            </button>
            {!shouldHidePaywallReset ? (
              <button
                type="button"
                className="secondaryBtn"
                style={{ marginLeft: '0.6rem' }}
                onClick={handleResetPaywallForDev}
                disabled={isLoading}
              >
                Reset free exports (dev)
              </button>
            ) : null}
          </form>

          {notice && <p style={{ color: '#334155', marginTop: '1rem' }}>{notice}</p>}
          {error && <p style={{ color: '#991b1b', marginTop: '1rem' }}>{error}</p>}
        </section>

        {canShowPanel ? (
          <section className="panel paywall">
            <h2 style={{ marginTop: 0 }}>You\'ve used your 3 free exports.</h2>
            <p className="muted" style={{ marginBottom: '0.6rem' }}>
              Pick a plan to continue.
            </p>
            <div className="planGrid">
              <article className="planCard">
                <h3 className="planTitle">Credits: 100 exports</h3>
                <p className="planSub">19€</p>
              </article>
              <article className="planCard">
                <h3 className="planTitle">Credits: 500 exports</h3>
                <p className="planSub">79€</p>
              </article>
              <article className="planCard">
                <h3 className="planTitle">Pro</h3>
                <p className="planSub">29€/mo — coming soon (batch export)</p>
              </article>
              <article className="planCard">
                <h3 className="planTitle">API</h3>
                <p className="planSub">Coming soon</p>
              </article>
            </div>
            <div className="actions">
              <button
                className="btn"
                type="button"
                disabled={isCheckoutLoading}
                onClick={() => handleCheckout('credits_100')}
              >
                Buy credits (100)
              </button>
              <button
                className="btn"
                type="button"
                disabled={isCheckoutLoading}
                onClick={() => handleCheckout('credits_500')}
              >
                Buy credits (500)
              </button>
            </div>
          </section>
        ) : null}

        {verdict === 'WARN' && (
          <section
            style={{
              marginTop: '1.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              background: '#fafafa',
            }}
          >
            <p style={{ margin: 0 }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '999px',
                  background: '#f1f5f9',
                  color: '#334155',
                  marginRight: '0.5rem',
                }}
              >
                Vérification recommandée
              </span>
              {confidence?.score != null ? <span style={{ color: '#555' }}>Score: {confidence.score}</span> : null}
            </p>

            {warnReasons.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowDetails((v) => !v)}
                  aria-expanded={showDetails}
                  className="secondaryBtn"
                >
                  {showDetails ? 'Masquer détails' : 'Voir détails'}
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
                Télécharger quand même
              </button>
              {!stillRiskAfterOptimized && (
                <button className="secondaryBtn" type="button" onClick={handleGenerateOptimized} disabled={isLoading}>
                  Générer une version optimisée
                </button>
              )}
            </div>
            {stillRiskAfterOptimized && (
              <p style={{ marginTop: '0.75rem', color: '#555' }}>
                Version optimisée générée. Résultat toujours à vérifier.
              </p>
            )}
          </section>
        )}

        {verdict === 'FAIL' && failKind === 'page_burden' && (
          <section
            style={{
              marginTop: '1.5rem',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '1rem',
              background: '#fffbeb',
            }}
          >
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
              <button className="secondaryBtn" type="button" disabled title="Bientôt disponible">
                {pageBurdenCopy.secondaryCta}
              </button>
            </div>
            {stillRiskAfterCompact && (
              <p style={{ marginTop: '0.75rem', color: '#555' }}>
                Meme en compact, c\'est encore trop volumineux. Reduisez le perimetre.
              </p>
            )}
          </section>
        )}

        {verdict === 'FAIL' && failKind !== 'page_burden' && (
          <section
            style={{
              marginTop: '1.5rem',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '1rem',
              background: '#fef2f2',
            }}
          >
            <p style={{ margin: 0, color: '#991b1b', fontWeight: 600 }}>
              PDF à risque {confidence?.score != null ? `(Score: ${confidence.score})` : ''}
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
                  Télécharger quand même
                </button>
              ) : (
                <>
                  <button className="secondaryBtn" type="button" onClick={handleGenerateOptimized} disabled={isLoading}>
                    Générer une version optimisée
                  </button>
                  <button className="btn" type="button" onClick={handleDownloadAnyway} disabled={isLoading || !pdfBlob}>
                    Télécharger quand même
                  </button>
                </>
              )}
            </div>
            {stillRiskAfterOptimized && (
              <p style={{ marginTop: '0.75rem', color: '#555' }}>
                Version optimisée générée. Résultat toujours à vérifier.
              </p>
            )}
          </section>
        )}

        {canShowDebug && (debugMetrics || columnMapDebug) && (
          <section style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setShowDebug((v) => !v)}
              aria-expanded={showDebug}
              className="secondaryBtn"
            >
              {showDebug ? 'Masquer debug' : 'Debug'}
            </button>
            {showDebug && (
              <>
                {columnMapDebug && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong>Column Map</strong>
                    <div>mode: {columnMapDebug.mode}</div>
                    <div>rendered: {columnMapDebug.rendered}</div>
                    <div>sections: {columnMapDebug.entries ?? 'unknown'}</div>
                  </div>
                )}
                {debugMetrics && (
                  <pre
                    style={{
                      marginTop: '0.75rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      overflow: 'auto',
                      fontSize: '0.8rem',
                    }}
                  >
                    {JSON.stringify(debugMetrics, null, 2)}
                  </pre>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
