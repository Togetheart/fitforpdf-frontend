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
    return decodeURIComponent(raw.replace(/^"|"$/g, '').trim());
  } catch {
    return raw.replace(/^"|"$/g, '').trim() || fallback;
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const debugParam = new URLSearchParams(window.location.search).get('debug');
    setDebugByQuery(debugParam === '1');
  }, []);

  const canShowDebug = process.env.NODE_ENV !== 'production' || debugByQuery;

  async function submitRender(mode = 'normal', opts = {}) {
    const { isFallback = false, preserveNotice = false, flowIdOverride = null } = opts;
    if (!file) {
      setError('Select a file');
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
      const responseFilename = getFilenameFromContentDisposition(
        res.headers.get('content-disposition'),
        getPdfFilenameFromSourceFile(file),
      );

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
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '40rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>FitForPDF</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>Upload CSV or XLSX → download PDF</p>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={isLoading}
          style={{ display: 'block', marginBottom: '1rem' }}
        />
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={includeBranding}
            onChange={(e) => setIncludeBranding(e.target.checked)}
            disabled={isLoading}
            style={{ marginRight: '0.5rem' }}
          />
          Add “Made with FitForPDF” footer
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={truncateLongText}
            onChange={(e) => setTruncateLongText(e.target.checked)}
            disabled={isLoading}
            style={{ marginRight: '0.5rem' }}
          />
          Tronquer les textes longs (réduit le volume)
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating…' : 'Generate PDF'}
        </button>
      </form>

      {notice && <p style={{ color: '#555', marginTop: '1rem' }}>{notice}</p>}
      {error && <p style={{ color: 'crimson', marginTop: '1rem' }}>{error}</p>}

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
                style={{ background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.4rem 0.6rem' }}
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
            <button type="button" onClick={handleDownloadAnyway} disabled={isLoading || !pdfBlob}>
              Télécharger quand même
            </button>
            {!stillRiskAfterOptimized && (
              <button type="button" onClick={handleGenerateOptimized} disabled={isLoading}>
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
            <button type="button" onClick={handleGenerateCompact} disabled={isLoading || stillRiskAfterCompact}>
              {pageBurdenCopy.primaryCta}
            </button>
            <button type="button" disabled title="Bientôt disponible">
              {pageBurdenCopy.secondaryCta}
            </button>
          </div>
          {stillRiskAfterCompact && (
            <p style={{ marginTop: '0.75rem', color: '#555' }}>
              Meme en compact, c'est encore trop volumineux. Reduisez le perimetre.
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
              <button type="button" onClick={handleDownloadAnyway} disabled={isLoading || !pdfBlob}>
                Télécharger quand même
              </button>
            ) : (
              <>
                <button type="button" onClick={handleGenerateOptimized} disabled={isLoading}>
                  Générer une version optimisée
                </button>
                <button type="button" onClick={handleDownloadAnyway} disabled={isLoading || !pdfBlob}>
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
            style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: '6px', padding: '0.4rem 0.6rem' }}
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
    </main>
  );
}
