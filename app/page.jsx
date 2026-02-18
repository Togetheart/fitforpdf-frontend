'use client';

import React from 'react';
import { useEffect, useState, useRef } from 'react';
import {
  buildRenderUrl,
  getFailKind,
  getPageBurdenUiCopy,
  isPageBurdenFail,
  normalizePageBurdenRecommendations,
  recommendationLabel,
} from './pageUiLogic.mjs';
import {
  LANDING_COPY,
  LANDING_COPY_KEYS,
  PRICING_CARDS,
  HOME_FAQ,
} from './siteCopy.mjs';
import UploadCard from './components/UploadCard';
import Accordion from './components/Accordion';
import Section from './components/ui/Section';
import PricingPlans from './components/PricingPlans';
import PageHero from './components/PageHero';
import HeroHeadline from './components/HeroHeadline';
import Button from './components/ui/Button';

const API_BASE = '/api';
const CONVERSION_PROGRESS_MIN_MS = 1800;
const PRO_PERIOD_LIMIT_DEFAULT = 500;
const CHECKOUT_COMING_SOON_MESSAGE = 'Payments coming soon. Contact us.';
const QUOTA_STATUS_BY_RENDER_CODE = {
  free_quota_exhausted: 'free',
  credits_exhausted: 'credits',
  pro_quota_exhausted: 'pro',
};
const QUOTA_EXHAUSTION_MESSAGE = {
  free: 'You have reached your free export limit.',
  credits: 'You have used your credits.',
  pro: 'You have reached your monthly Pro export limit.',
};

function toFiniteInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function normalizePlanType(value) {
  const normalized = String(value || 'free').trim().toLowerCase();
  return normalized || 'free';
}

function pickFirstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return null;
}

function getQuotaExhaustedMessage(planType, rawCode) {
  if (rawCode && rawCode === 'free_quota_exhausted') return QUOTA_EXHAUSTION_MESSAGE.free;
  if (rawCode && rawCode === 'credits_exhausted') return QUOTA_EXHAUSTION_MESSAGE.credits;
  if (rawCode && rawCode === 'pro_quota_exhausted') return QUOTA_EXHAUSTION_MESSAGE.pro;
  const normalizedPlan = normalizePlanType(planType);
  return QUOTA_EXHAUSTION_MESSAGE[normalizedPlan] || 'You have reached your exports limit.';
}

function normalizeQuotaState(raw = {}) {
  const planType = normalizePlanType(raw.plan_type || raw.planType || raw.plan || 'free');
  const freePayload = raw && typeof raw.free === 'object' && !Array.isArray(raw.free) ? raw.free : null;
  const freeScalar = raw && (typeof raw.free === 'number' || typeof raw.free === 'string')
    ? raw.free
    : null;
  const freeExportsLeft = (() => {
    const value = pickFirstDefined(
      freePayload?.remaining,
      raw.free_exports_left,
      raw.freeExportsLeft,
      raw.free_left,
      freeScalar,
      raw.remaining,
    );
    const parsed = toFiniteInt(value);
    if (Number.isFinite(parsed)) return Math.max(0, parsed);
    return null;
  })();
  const freeExportsLimit = toFiniteInt(
    pickFirstDefined(
      freePayload?.limit,
      raw.free_limit,
      raw.freeLimit,
    ),
  );

  const remainingInPeriod = toFiniteInt(
    pickFirstDefined(
      raw.remaining_in_period,
      raw.remainingInPeriod,
      raw.remaining,
      raw.remainingThisPeriod,
      raw.monthly_remaining,
    ),
  );
  const usedInPeriod = toFiniteInt(
    pickFirstDefined(
      raw.used_in_period,
      raw.usedInPeriod,
      raw.used,
      raw.usedThisPeriod,
      raw.monthly_used,
    ),
  );
  const periodLimit = toFiniteInt(
    pickFirstDefined(
      raw.period_limit,
      raw.periodLimit,
      raw.monthly_limit,
      raw.monthlyLimit,
    ),
  );

  return {
    planType,
    freeExportsLeft: Number.isFinite(freeExportsLeft) ? freeExportsLeft : null,
    freeExportsLimit: Number.isFinite(freeExportsLimit) ? freeExportsLimit : null,
    remainingInPeriod: Number.isFinite(remainingInPeriod)
      ? remainingInPeriod
      : (planType === 'pro' ? PRO_PERIOD_LIMIT_DEFAULT : null),
    usedInPeriod: Number.isFinite(usedInPeriod) ? usedInPeriod : null,
    periodLimit: Number.isFinite(periodLimit) ? periodLimit : (planType === 'pro' ? PRO_PERIOD_LIMIT_DEFAULT : null),
  };
}

function getPlanExhausted(planType, remaining, remainingInPeriod) {
  if (normalizePlanType(planType) === 'pro') {
    return Number.isFinite(remainingInPeriod) ? remainingInPeriod <= 0 : false;
  }

  return Number.isFinite(remaining) ? remaining <= 0 : false;
}

function getQuotaErrorCode(response, payload) {
  const headerCode = response?.headers?.get?.('x-cleansheet-code');
  const headerError = response?.headers?.get?.('x-error-code');
  const payloadCode = payload && (payload.code || payload.errorCode || payload.error_code);
  return headerCode || headerError || payloadCode || null;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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

const CTA_SECONDARY = 'inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition duration-150 border-slate-300 bg-white text-slate-900 hover:bg-slate-50';
const PANEL = 'rounded-xl border border-slate-200 bg-white';

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
  const [renderVerdict, setRenderVerdict] = useState(null);
  const [planType, setPlanType] = useState('free');
  const [freeExportsLeft, setFreeExportsLeft] = useState(null);
  const [freeExportsLimit, setFreeExportsLimit] = useState(null);
  const [remainingInPeriod, setRemainingInPeriod] = useState(null);
  const [usedInPeriod, setUsedInPeriod] = useState(null);
  const [periodLimit, setPeriodLimit] = useState(PRO_PERIOD_LIMIT_DEFAULT);
  const [showBuyCreditsPanel, setShowBuyCreditsPanel] = useState(false);
  const [paywallReason, setPaywallReason] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [layout, setLayout] = useState({
    overview: true,
    headers: true,
    footer: true,
  });
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
  const isQuotaLocked = getPlanExhausted(planType, freeExportsLeft, remainingInPeriod);

  useEffect(() => {
    void syncQuotaState();
  }, []);
  const canShowDebug = process.env.NODE_ENV !== 'production' || debugByQuery;

  async function syncQuotaState() {
    try {
      const response = await fetch('/api/quota', {
        method: 'GET',
      });
      if (!response.ok) return;
      const raw = await response.json().catch(() => null);
      if (!raw || typeof raw !== 'object') return;
      const normalized = normalizeQuotaState(raw);
      setPlanType(normalized.planType);
      setFreeExportsLeft(normalized.freeExportsLeft);
      setFreeExportsLimit(normalized.freeExportsLimit);
      setRemainingInPeriod(normalized.remainingInPeriod);
      setUsedInPeriod(normalized.usedInPeriod);
      setPeriodLimit(normalized.periodLimit);
      setPaywallReason('');
      setPurchaseMessage('');
      setShowBuyCreditsPanel(false);
    } catch {
      // keep current quota state when sync fails
    }
  }

  function applyQuotaExhaustion(code, payload = {}) {
    const normalizedCode = String(code || '').trim();
    const nextPlan = QUOTA_STATUS_BY_RENDER_CODE[normalizedCode] || 'free';
    const nextMessage = getQuotaExhaustedMessage(nextPlan, normalizedCode);
    setPlanType(nextPlan);
    setPaywallReason(nextMessage);
    setError(nextMessage);
    setNotice(nextMessage);
    if (nextPlan === 'pro') {
      const overrideUsed = toFiniteInt(payload?.used_in_period)
        ?? toFiniteInt(payload?.usedInPeriod)
        ?? toFiniteInt(payload?.used)
        ?? 0;
      const overrideLimit = toFiniteInt(payload?.period_limit)
        ?? toFiniteInt(payload?.periodLimit)
        ?? toFiniteInt(payload?.monthly_limit)
        ?? toFiniteInt(payload?.monthlyLimit)
        ?? PRO_PERIOD_LIMIT_DEFAULT;
      setRemainingInPeriod(0);
      setUsedInPeriod(overrideUsed);
      setPeriodLimit(overrideLimit);
      setFreeExportsLeft(0);
    } else {
      const overrideFreeLeft = toFiniteInt(payload?.free_exports_left)
        ?? toFiniteInt(payload?.freeExportsLeft)
        ?? toFiniteInt(payload?.free_left)
        ?? toFiniteInt(payload?.free?.remaining)
        ?? 0;
      setFreeExportsLeft(Math.max(0, overrideFreeLeft));
      const overrideFreeLimit = toFiniteInt(payload?.free?.limit)
        ?? toFiniteInt(payload?.free_limit)
        ?? toFiniteInt(payload?.freeLimit);
      setFreeExportsLimit(Number.isFinite(overrideFreeLimit) ? overrideFreeLimit : freeExportsLimit);
      setRemainingInPeriod(null);
      setUsedInPeriod(0);
      setPeriodLimit(overrideLimit(nextPlan, payload));
    }
  }

  function overrideLimit(currentPlanType, payload = {}) {
    if (currentPlanType === 'pro') {
      return toFiniteInt(payload?.period_limit)
        ?? toFiniteInt(payload?.periodLimit)
        ?? toFiniteInt(payload?.monthly_limit)
        ?? toFiniteInt(payload?.monthlyLimit)
        ?? PRO_PERIOD_LIMIT_DEFAULT;
    }

    return null;
  }

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
    setConversionProgress({
      running: true,
      stepIndex: 0,
      percent: 14,
      label: 'Uploading',
    });

    progressTimersRef.current = [
      setTimeout(() => {
        setConversionProgress({
          running: true,
          stepIndex: 1,
          percent: 44,
          label: 'Structuring (column grouping)',
        });
      }, 520),
      setTimeout(() => {
        setConversionProgress({
          running: true,
          stepIndex: 2,
          percent: 74,
          label: 'Generating PDF',
        });
      }, 1080),
      setTimeout(() => {
        setConversionProgress({
          running: true,
          percent: 92,
          stepIndex: 2,
          label: 'Generating PDF',
        });
      }, 1720),
    ];
  }

  function finishConversionProgress() {
    clearConversionProgressTimers();
    setConversionProgress({
      running: false,
      stepIndex: 2,
      percent: 100,
      label: 'Generating PDF',
    });
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
    if (!targetFile) {
      setError('Select a file');
      return;
    }

    const activeFlowId = flowIdOverride || flowId || createFlowId();

    setError(null);
    if (!preserveNotice) setNotice(null);
    setRenderVerdict(null);
    setFailureRecommendations([]);
    setColumnMapDebug(null);
    setIsLoading(true);
    setFlowId(activeFlowId);
    if (!skipProgress) {
      startConversionProgress();
    }
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
          applyQuotaExhaustion(quotaCode, data);
          return;
        }
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
          await submitRender('normal', {
            isFallback: true,
            skipProgress: true,
            preserveNotice: true,
            flowIdOverride: activeFlowId,
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
      const blob = await res.blob();
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      const isPdfResponse = res.status === 200 && contentType.includes('application/pdf');
      const responseFilename = getFilenameFromContentDisposition(
        res.headers.get('content-disposition'),
        getPdfFilenameFromSourceFile(targetFile),
      );

      await syncQuotaState();
      if (!isPdfResponse) {
        setError('PDF response is missing.');
        return;
      }

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
      if (remainingDelay > 0) {
        await sleep(remainingDelay);
      }
      finishConversionProgress();
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isQuotaLocked) {
      return;
    }
    const nextFlowId = createFlowId();
    setFlowId(nextFlowId);
    await submitRender('normal', { flowIdOverride: nextFlowId });
  }

  function handleFileSelect(nextFile) {
    setRenderVerdict(null);
    setFile(nextFile);
    if (nextFile) {
      setError(null);
      setNotice(null);
    }
    setPdfBlob(null);
  }

  async function handleTrySample() {
    try {
      const sampleResponse = await fetch('/api/sample/premium');
      if (!sampleResponse.ok) {
        throw new Error(`Failed to load sample CSV (${sampleResponse.status})`);
      }
      const sampleCsv = await sampleResponse.text();
      const sample = new File([sampleCsv], 'enterprise-invoices-demo.csv', {
        type: 'text/csv',
      });
      handleFileSelect(sample);
      const nextFlowId = createFlowId();
      setFlowId(nextFlowId);
      await submitRender('compact', { flowIdOverride: nextFlowId, sourceFile: sample });
    } catch (error) {
      setError(error.message || 'Unable to load demo file');
    }
  }

  function showCheckoutComingSoon() {
    setShowBuyCreditsPanel(false);
    setPurchaseMessage(CHECKOUT_COMING_SOON_MESSAGE);
  }

  function handleHeroGenerateClick(event) {
    if (!event) return;
    event.preventDefault();
    const target = document.getElementById('generate');
    if (!target) return;

    const scrollOptions = {
      behavior: 'smooth',
      block: 'start',
    };

    if (typeof target.scrollIntoView === 'function') {
      target.scrollIntoView(scrollOptions);
      return;
    }

    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      const top = typeof target.getBoundingClientRect === 'function'
        ? target.getBoundingClientRect().top + window.pageYOffset - 24
        : 0;
      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    }
  }

  async function postCheckout(url, payload = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (response.status === 501) {
      showCheckoutComingSoon();
      return { ok: false, response, data, shouldStop: true };
    }

    if (!response.ok) {
      setNotice(data?.error || 'Checkout request failed.');
      return { ok: false, response, data, shouldStop: true };
    }

    const checkoutUrl = data?.url;
    if (typeof checkoutUrl === 'string' && checkoutUrl) {
      if (typeof window !== 'undefined') {
        window.location.assign(checkoutUrl);
      }
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

  function openBuyCreditsPanel() {
    setPurchaseMessage('');
    setShowBuyCreditsPanel(true);
  }

  function closeBuyCreditsPanel() {
    setShowBuyCreditsPanel(false);
    setPurchaseMessage('');
  }

  function handleLayoutChange(nextKey, nextChecked) {
    setLayout((current) => {
      if (!current || typeof current !== 'object') {
        return {
          overview: true,
          headers: true,
          footer: true,
          [nextKey]: Boolean(nextChecked),
        };
      }
      return {
        ...current,
        [nextKey]: Boolean(nextChecked),
      };
    });
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

  const verdict = confidence?.verdict;
  const stillRiskAfterOptimized = lastRequestMode === 'optimized' && (verdict === 'WARN' || verdict === 'FAIL');
  const stillRiskAfterCompact = lastRequestMode === 'compact' && verdict === 'FAIL';
  const failKind = getFailKind(confidence);
  const pageBurdenCopy = getPageBurdenUiCopy();
  const warnReasons = (confidence?.reasons || []).map(reasonLabel).slice(0, 2);
  const failReasons = (confidence?.reasons || []).map(reasonLabel).slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PageHero
        heroTestId="hero-section"
        variant="home"
        eyebrow={LANDING_COPY.heroLabel}
        align="center"
        height="min-h-screen"
        title={<HeroHeadline />}
        subtitle={LANDING_COPY.heroSubheadline}
        contentClassName="items-center gap-8 text-center"
        contentMaxWidthClassName="max-w-7xl"
        subtitleClassName="w-full max-w-none lg:whitespace-nowrap"
        className="py-0 w-full"
        >
        <div className="space-y-6">
          <Button
            variant="primary"
            href="#generate"
            data-testid="hero-primary-cta"
            className="w-fit px-7"
            onClick={handleHeroGenerateClick}
          >
            {LANDING_COPY.heroPrimaryCta}
          </Button>
          <p className="max-w-prose text-sm text-slate-500">{LANDING_COPY.heroTrustLine}</p>
          <div
            id={LANDING_COPY_KEYS.upload}
            data-testid={LANDING_COPY_KEYS.upload}
            className="mt-8"
          >
            <UploadCard
              toolTitle={LANDING_COPY.toolTitle}
              toolSubcopy={(() => {
                if (planType !== 'free') return LANDING_COPY.toolSubcopy;
                if (Number.isFinite(freeExportsLimit)) {
                  return `${freeExportsLimit} free exports. No account required.`;
                }
                return 'Free exports. No account required.';
              })()}
              file={file}
              freeExportsLeft={freeExportsLeft}
              includeBranding={includeBranding}
              truncateLongText={truncateLongText}
              isLoading={isLoading}
              notice={notice}
              error={error}
              hasResultBlob={Boolean(pdfBlob)}
              onFileSelect={(nextFile) => handleFileSelect(nextFile)}
              onRemoveFile={handleRemoveFile}
              onBrandingChange={setIncludeBranding}
              onTruncateChange={setTruncateLongText}
              onSubmit={handleSubmit}
              onDownloadAgain={handleDownloadAnyway}
              onTrySample={handleTrySample}
              downloadedFileName={Boolean(pdfBlob) ? resolvedPdfFilename : null}
              verdict={renderVerdict}
              conversionProgress={conversionProgress}
              onBuyCredits={openBuyCreditsPanel}
              isPro={planType === 'pro'}
              showBuyCreditsForTwo={false}
              isQuotaLocked={isQuotaLocked}
              planType={planType}
              remainingInPeriod={remainingInPeriod}
              usedInPeriod={usedInPeriod}
              periodLimit={periodLimit}
              paywallReason={paywallReason}
              onBuyCreditsPack={handleBuyCreditsPack}
              showBuyCreditsPanel={showBuyCreditsPanel}
              onCloseBuyPanel={closeBuyCreditsPanel}
              purchaseMessage={purchaseMessage}
              onGoPro={handleGoProCheckout}
              onLayoutChange={handleLayoutChange}
              layout={layout}
            />
          </div>
        </div>
      </PageHero>

      <Section id={LANDING_COPY_KEYS.beforeAfter} index={1} className="py-12">
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-semibold leading-snug sm:text-3xl">
            From raw data to structured document.
          </h2>
          <div
            data-testid="home-preview-card"
            className="home-preview-float mx-auto max-w-7xl rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm backdrop-blur md:p-8"
          >
            <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  CSV input
                </p>
                <pre className="mt-2 min-h-[212px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-4 text-slate-700">
{`invoice_id,client,total
A102,ACME Corp,4230.00
A103,Northline,1120.00
A104,Widget,6900.00`}
                </pre>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Structured PDF (v8)
                </p>
                <figure className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                  <img
                    src="/fitforpdf-proof-v8.svg"
                    alt="FitForPDF v8 structured document preview with overview and grouped columns"
                    className="h-auto w-full rounded-lg object-cover"
                    data-testid="proof-pdf-image"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="how-it-works" index={2} className="py-12" bg="bg-gray-50">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">How it works</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">1</p>
              <h3 className="text-lg font-semibold">Upload your file</h3>
              <p className="mt-2 text-sm text-slate-700">Drop CSV or XLSX into the secure converter.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">2</p>
              <h3 className="text-lg font-semibold">Generate structure</h3>
              <p className="mt-2 text-sm text-slate-700">We build a client-ready PDF with overview and sections.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">3</p>
              <h3 className="text-lg font-semibold">Download</h3>
              <p className="mt-2 text-sm text-slate-700">Get a polished file in seconds and send it immediately.</p>
            </article>
          </div>
        </div>
      </Section>

      <Section id={LANDING_COPY_KEYS.pricingPreview} index={3} className="py-12" bg="bg-white">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">
            {LANDING_COPY.pricingPreviewTitle}
          </h2>
          <p className="text-sm text-slate-500">{LANDING_COPY.pricingPreviewSubline}</p>
          <PricingPlans
            plans={PRICING_CARDS}
            variant="home"
            gridTestId="pricing-grid"
            cardTestId="pricing-preview-card"
          />
          <p className="text-sm text-slate-700">
            Need higher limits, API access or team plans? <a href="mailto:hello@fitforpdf.com" className="underline">Contact us</a>.
          </p>
          <a href="/pricing" className={CTA_SECONDARY}>
            {LANDING_COPY.pricingPreviewCta}
          </a>
        </div>
      </Section>

      <section
        id={LANDING_COPY_KEYS.privacyStrip}
        className="bg-slate-50 py-16 sm:py-20"
        data-testid="privacy-section"
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Your data. Not our business.
          </h2>
          <div className="mt-6 space-y-2 text-base leading-relaxed text-slate-500">
            <p>Files are deleted immediately after conversion.</p>
            <p>The generated PDF is available for up to 15 minutes.</p>
            <p>No file content is stored in logs.</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" data-testid="faq-section">
        <div className="mx-auto w-full max-w-7xl px-6" data-testid="faq-section-inner">
          <h2 className="text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            <Accordion items={HOME_FAQ} testId="home-faq" />
          </div>
        </div>
      </section>

    </div>
  );
}
