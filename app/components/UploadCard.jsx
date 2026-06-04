import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  ShoppingCart,
} from 'lucide-react';

import AnimatedCheckmark from './AnimatedCheckmark';
import AnimatedShieldIcon from './AnimatedShieldIcon';
import Button from './ui/Button';
import UploadDropzone from './UploadDropzone';
import Switch from './ui/Switch';
import { PAYG_PACKS } from '../siteCopy.mjs';
import { recommendationLabel } from '../pageUiLogic.mjs';

const PROGRESS_STEPS = ['Uploading', 'Structuring (column grouping)', 'Generating PDF'];
const PROGRESS_STEP_STATES = {
  completed: {
    circle: 'border border-emerald-300 bg-emerald-50 text-emerald-700',
    label: 'text-[var(--color-text)]',
  },
  active: {
    circle: 'border border-accent bg-accent text-white',
    label: 'text-[var(--color-text)] font-medium',
  },
  pending: {
    circle: 'border border-[var(--color-border)] bg-[var(--color-bg-hero)] text-muted',
    label: 'text-muted',
  },
};

const CREDIT_PACKS = PAYG_PACKS.map((p) => ({
  pack: p.stripePackId,
  exportsLabel: p.exportsLabel,
  price: p.priceDisplay,
}));

const PAYWALL_PACKS = PAYG_PACKS.filter((p) => p.id !== 'single');
const HISTORY_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'done', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
  { value: 'running', label: 'Running' },
  { value: 'pending', label: 'Queued' },
];

function getProgressStepLabel(progress, stepIndex) {
  if (progress?.label) return progress.label;
  const safeIndex = Math.min(Math.max(stepIndex, 0), PROGRESS_STEPS.length - 1);
  return PROGRESS_STEPS[safeIndex];
}

function StepIndicator({ activeStepIndex }) {
  const safeActiveStepIndex = Number.isInteger(activeStepIndex)
    ? Math.min(Math.max(activeStepIndex, 0), PROGRESS_STEPS.length - 1)
    : 0;

  return (
    <div
      role="list"
      aria-label="conversion steps"
      className="h-14 flex items-center gap-3"
    >
      {PROGRESS_STEPS.map((step, index) => {
        const isCompleted = index < safeActiveStepIndex;
        const isActive = index === safeActiveStepIndex;
        const state = isCompleted ? 'completed' : isActive ? 'active' : 'pending';
        const stateClasses = PROGRESS_STEP_STATES[state];
        return (
          <div
            key={step}
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
            className="min-w-0 flex flex-1 items-center gap-2"
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors duration-200 ${stateClasses.circle}`}
            >
              {index + 1}
            </span>
            <span className={`text-xs leading-snug ${stateClasses.label} sm:text-sm sm:leading-5`}>{step}</span>
          </div>
        );
      })}
    </div>
  );
}

function getProgressPercent(progress) {
  if (!progress || !Number.isFinite(progress.percent)) return 0;
  return Math.min(100, Math.max(0, Math.round(progress.percent)));
}

const EXPORT_BADGE_STYLES = {
  neutral: 'border-amber-200/60 bg-[#FEF3C7]/80 text-amber-800',
  warning: 'border-amber-200/60 bg-[#FEF3C7]/80 text-amber-800',
  warningStrong: 'border-amber-200/60 bg-[#FEF3C7]/80 text-amber-800',
  danger: 'border-red-300 bg-red-600 text-white',
};

function toFiniteInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function getBadgeRemainder(planType, freeExportsLeft, remainingInPeriod, usedThisPeriod, periodLimit) {
  const normalizedPlan = String(planType || '').toLowerCase();
  const remaining = toFiniteInt(freeExportsLeft);
  const periodRemaining = toFiniteInt(remainingInPeriod);
  const periodUsed = toFiniteInt(usedThisPeriod);
  const limit = toFiniteInt(periodLimit);

  if (normalizedPlan === 'api_enterprise') return null;

  if (normalizedPlan === 'pro') {
    if (periodRemaining != null) return Math.max(0, periodRemaining);
    if (limit != null && periodUsed != null) return Math.max(0, limit - periodUsed);
    if (remaining != null) return Math.max(0, remaining);
    if (limit != null) return limit;
    return null;
  }

  if (remaining != null) return Math.max(0, remaining);
  return null;
}

function getQuotaBadgeText(planType, freeExportsLeft, remainingInPeriod, usedThisPeriod, periodLimit) {
  const normalizedPlan = String(planType || '').toLowerCase();
  const remaining = toFiniteInt(freeExportsLeft);
  const periodRemaining = toFiniteInt(remainingInPeriod);
  const periodUsed = toFiniteInt(usedThisPeriod);
  const limit = toFiniteInt(periodLimit);
  const safeRemaining = getBadgeRemainder(planType, freeExportsLeft, remainingInPeriod, usedThisPeriod, periodLimit);

  if (normalizedPlan === 'api_enterprise') {
    return 'Admin · unlimited exports';
  }

  if (normalizedPlan === 'pro') {
    if (periodRemaining != null) {
      return `Pro · ${periodRemaining} exports left this month`;
    }
    if (periodUsed != null && limit != null) {
      return `Pro · ${periodUsed}/${limit}`;
    }
    if (safeRemaining != null) {
      return `Pro · ${safeRemaining} exports left`;
    }
    return 'Pro';
  }

  if (normalizedPlan === 'credits') {
    if (safeRemaining == null) {
      return 'Credits';
    }
    return `Credits · ${safeRemaining} exports left`;
  }

  if (!Number.isFinite(remaining)) return 'Free';

  return `Free · ${safeRemaining} exports left`;
}

function freeExportsText(value) {
  const safeValue = toFiniteInt(value) ?? 0;
  if (safeValue <= 0) return '0 exports left';
  if (safeValue === 1) return '1 export left';
  return `${safeValue} exports left`;
}

function formatHistoryDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
}

function formatHistoryStatus(item = {}) {
  const state = String(item.exportState || item.status || '').toLowerCase();
  const quotaConsumed = item.quotaConsumed === true;
  if (state === 'artifact_available') return 'Export ready';
  if (state === 'delivered_inline') return 'Export ready';
  if (state === 'render_running') return 'Rendering PDF';
  if (state === 'render_pending') return 'Export queued';
  if (state === 'render_failed_retryable' || state === 'render_failed_non_retryable') {
    return quotaConsumed ? 'Export failed, quota consumed' : 'Export failed, quota not consumed';
  }
  return 'Unknown';
}

function formatHistoryQuota(item = {}) {
  return item.quotaConsumed ? 'Quota consumed' : 'Quota not consumed';
}

function formatHistoryMismatch(code) {
  const normalized = String(code || '').trim();
  if (!normalized) return null;
  if (normalized === 'missing_identity_for_provisioning_check') {
    return 'Payment received, provisioning blocked: missing checkout identity';
  }
  if (normalized === 'entitlement_not_yet_provisioned') {
    return 'Payment received, provisioning access';
  }
  if (normalized === 'provisioning_lookup_failed') {
    return 'Payment received, provisioning verification unavailable';
  }
  return normalized;
}

function getFreeExportsBadgeClass(exportsLeft) {
  const safeValue = toFiniteInt(exportsLeft);
  if (safeValue === null) return EXPORT_BADGE_STYLES.neutral;
  if (safeValue <= 0) return EXPORT_BADGE_STYLES.danger;
  if (safeValue === 1) return EXPORT_BADGE_STYLES.warningStrong;
  if (safeValue === 2) return EXPORT_BADGE_STYLES.warning;
  return EXPORT_BADGE_STYLES.neutral;
}

function verdictVisualStyle(verdict) {
  if (verdict === 'WARN') {
    return {
      badge: 'border-blue-200 bg-blue-50 text-blue-700',
      icon: 'text-blue-700',
    };
  }

  if (verdict === 'FAIL') {
    return {
      badge: 'border-rose-200 bg-rose-50 text-rose-700',
      icon: 'text-rose-700',
    };
  }

  return {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: 'text-emerald-700',
  };
}

function getVerdictIcon(verdict) {
  if (verdict === 'OK') return CheckCircle2;
  return AlertCircle;
}

function getPostRenderStatus(verdict) {
  if (verdict === 'WARN') {
    return {
      heading: 'PDF ready — quick check recommended',
      detail: 'Download it and confirm the layout is acceptable before sending.',
      tone: 'warn',
      panelClass: 'border-white/10 bg-white/5',
      iconClass: 'border-amber-300/25 bg-amber-300/10 text-amber-200',
    };
  }

  if (verdict === 'FAIL') {
    return {
      heading: 'PDF generated — review before sending',
      detail: 'Open the PDF and confirm the layout before sending.',
      tone: 'warn',
      panelClass: 'border-rose-300/25 bg-rose-400/10',
      iconClass: 'border-rose-300/25 bg-rose-300/10 text-rose-200',
    };
  }

  return {
    heading: 'Your client-ready PDF is ready',
    detail: null,
    tone: 'ok',
    panelClass: 'border-emerald-500/20 bg-emerald-500/5',
    iconClass: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200',
  };
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
  disabled,
  rowTestId,
  showBottomBorder = true,
}) {
  const handleTextToggle = (event) => {
    if (disabled) return;
    event.preventDefault();
    onChange(!checked);
  };

  return (
    <div
      className={`flex w-full items-start justify-between gap-6 px-0 py-4 ${showBottomBorder ? 'border-b border-[var(--color-border)]' : ''}`}
    >
      <div
        data-testid={rowTestId}
        tabIndex={-1}
        className="min-w-0"
      >
        <button
          type="button"
          tabIndex={0}
          className="w-full cursor-pointer px-1 py-0.5 text-left transition-colors hover:bg-[var(--color-bg-hero)] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25"
          onClick={handleTextToggle}
        >
          <div className="text-sm font-semibold text-[var(--color-text)]">{title}</div>
          <div
            className="mt-1 text-sm text-muted"
          >
            {description}
          </div>
        </button>
      </div>

      <div className="shrink-0 flex w-12 justify-end pt-0.5">
        <Switch checked={checked} onChange={() => onChange(!checked)} disabled={disabled} ariaLabel={title} />
      </div>
    </div>
  );
}

function normalizeFreeExportsLeft(value) {
  return toFiniteInt(value);
}

function isJsdomEnvironment() {
  if (typeof navigator === 'undefined') return false;
  return /jsdom/i.test(String(navigator.userAgent || ''));
}

function getPlanTypeLabel(planType) {
  return String(planType || 'free').toLowerCase();
}

function getLayoutNudgeLabel(key) {
  if (key === 'overview') {
    return 'overview';
  }
  if (key === 'headers') {
    return 'headers';
  }
  if (key === 'footer') {
    return 'footer';
  }
  return 'layout';
}

function getLayoutNudgeCopy(key) {
  return {
    title: 'Unlock layout controls',
    description: `Remove ${getLayoutNudgeLabel(key)} in advanced plans only.`,
  };
}

/* ── Post-render result panel ─────────────────────────────────────
 * The commercial moment. After a successful render we no longer
 * auto-download the PDF — the user must see "your file is ready"
 * with a verdict / score / shape, then a loud Download button and
 * the secondary CTAs that prove intent (render another, pricing,
 * contact). All clicks land in PostHog via the analytics helpers
 * wired through useConversion. */
function PostRenderPanel({
  isLoading,
  verdict,
  confidence,
  debugMetrics,
  downloadedFileName,
  onDownloadAgain,
  onRenderAnother,
  onPostRenderPricingClick,
  onPostRenderContactClick,
  compactSuggestion,
  onRetryCompact,
  retainSourceConsent,
}) {
  const score = Number.isFinite(confidence?.score) ? confidence.score : null;
  const verdictUpper = verdict ? String(verdict).toUpperCase() : null;
  const rowCount = Number.isFinite(confidence?.metrics?.rowCount)
    ? confidence.metrics.rowCount
    : (Number.isFinite(debugMetrics?.rowCount) ? debugMetrics.rowCount : null);
  const colCount = Number.isFinite(confidence?.metrics?.columnCount)
    ? confidence.metrics.columnCount
    : (Number.isFinite(debugMetrics?.columnCount) ? debugMetrics.columnCount : null);
  const pageCount = Number.isFinite(debugMetrics?.pageCount)
    ? debugMetrics.pageCount
    : (Number.isFinite(debugMetrics?.page_count) ? debugMetrics.page_count : null);

  const status = getPostRenderStatus(verdictUpper);
  const isWarn = verdictUpper === 'WARN';
  const visibleVerdict = isWarn ? null : verdictUpper;
  const visibleScore = isWarn ? null : score;
  const shouldShowSummary = !isWarn
    && (visibleVerdict || visibleScore != null || rowCount != null || colCount != null || pageCount != null);

  return (
    <section
      data-testid="post-render-panel"
      aria-live="polite"
      className={`flex w-full max-w-[720px] flex-col gap-5 rounded-2xl border p-5 sm:p-6 ${status.panelClass}`}
    >
      <header className="flex flex-col items-center gap-2 text-center">
        {status.tone === 'ok' ? (
          <AnimatedCheckmark size={44} />
        ) : (
          <span
            data-testid="post-render-status-icon"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${status.iconClass}`}
          >
            <AlertCircle aria-hidden="true" className="h-4 w-4" />
          </span>
        )}
        <p className="text-base font-semibold text-white">
          {status.heading}
        </p>
        {status.detail ? (
          <p data-testid="post-render-status-detail" className="max-w-md text-xs leading-5 text-white/60">
            {status.detail}
          </p>
        ) : null}
        {downloadedFileName ? (
          <p className="truncate text-xs text-white/60">Ready: {downloadedFileName}</p>
        ) : null}
      </header>

      {shouldShowSummary ? (
        <dl
          data-testid="post-render-summary"
          className="flex flex-wrap items-center justify-center gap-2 text-left"
        >
          {visibleVerdict ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <dt className="text-[10px] uppercase tracking-wide text-white/50">Verdict</dt>
              <dd className="text-xs font-semibold text-white">{visibleVerdict}</dd>
            </div>
          ) : null}
          {visibleScore != null ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <dt className="text-[10px] uppercase tracking-wide text-white/50">Score</dt>
              <dd className="text-xs font-semibold text-white">{visibleScore}/100</dd>
            </div>
          ) : null}
          {pageCount != null ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <dt className="text-[10px] uppercase tracking-wide text-white/50">Pages</dt>
              <dd className="text-xs font-semibold text-white">{pageCount}</dd>
            </div>
          ) : null}
          {rowCount != null && colCount != null ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <dt className="text-[10px] uppercase tracking-wide text-white/50">Shape</dt>
              <dd className="text-xs font-semibold text-white">{rowCount}×{colCount}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="primary"
          className="w-full"
          data-testid="download-again"
          onClick={onDownloadAgain}
          disabled={isLoading}
        >
          Download PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          className="mx-auto h-9 w-auto min-w-[220px] border-white/15 bg-white/10 px-5 text-white/75 hover:bg-white/15 hover:text-white"
          data-testid="render-another"
          onClick={onRenderAnother}
          disabled={isLoading}
        >
          Render another file
        </Button>
      </div>

      <div
        data-testid="post-render-intent"
        className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left"
      >
        <p className="text-sm text-white/80">
          Need this every week? Recurring or batch reports?
        </p>
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <a
            href="/pricing"
            data-testid="post-render-pricing"
            onClick={() => onPostRenderPricingClick()}
            className="text-sm font-semibold text-emerald-200 underline-offset-2 hover:underline"
          >
            View pricing
          </a>
          <a
            href="/contact"
            data-testid="post-render-contact"
            onClick={() => onPostRenderContactClick()}
            className="text-sm font-medium text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
          >
            Talk to us
          </a>
        </div>
      </div>

      {compactSuggestion ? (
        <div
          data-testid="compact-suggestion"
          className="flex flex-col gap-3 rounded-xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left"
        >
          <p className="text-sm text-white/80">
            This sheet may fit better in compact mode.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mx-auto h-9 w-auto min-w-[190px] border-white/15 bg-white/10 px-5 text-white/75 hover:bg-white/15 hover:text-white sm:mx-0"
            onClick={onRetryCompact}
            disabled={isLoading}
          >
            Generate compact version
          </Button>
        </div>
      ) : null}

      <p className="text-center text-[11px] text-white/40">
        {retainSourceConsent
          ? 'Source kept 7 days at your request · No LLM · auto-deleted.'
          : 'No storage · No LLM · Files processed ephemerally.'}
      </p>
    </section>
  );
}

export default function UploadCard({
  toolTitle,
  toolSubcopy,
  file,
  freeExportsLeft,
  includeBranding,
  truncateLongText,
  isLoading,
  error,
  notice,
  hasResultBlob,
  onFileSelect,
  onRemoveFile,
  onBrandingChange,
  onTruncateChange,
  retainSourceConsent = false,
  onRetainConsentChange = () => {},
  onSubmit,
  onDownloadAgain,
  onCopyShareLink = () => {},
  onTrySample,
  downloadedFileName,
  verdict,
  conversionProgress,
  onBuyCredits = () => {},
  showBuyCreditsForTwo = false,
  isPro = false,
  onUpgrade = () => {},
  onEvent = () => {},
  onLayoutChange = () => {},
  layout = {
    overview: true,
    headers: true,
    footer: true,
  },
  planType = 'free',
  isQuotaLocked = false,
  remainingInPeriod = null,
  usedInPeriod = null,
  periodLimit = 500,
  paywallReason = '',
  showBuyCreditsPanel = false,
  onCloseBuyPanel = () => {},
  onBuyCreditsPack = () => {},
  purchaseMessage = '',
  onGoPro = onUpgrade,
  initialOptionsExpanded = false,
  exportHistory = [],
  isHistoryLoading = false,
  historyError = null,
  onRefreshHistory = () => {},
  historyStatus = 'all',
  onHistoryStatusChange = () => {},
  hasMoreHistory = false,
  onLoadMoreHistory = () => {},
  renderId = null,
  shareState = { status: 'idle', jobId: null },
  variant = 'light',
  failKind = 'none',
  failureRecommendations = [],
  pageBurdenCopy = null,
  onRetryCompact = () => {},
  wasDemoLastUpload = false,
  onTryYourFile = () => {},
  onRenderAnother = () => {},
  onPostRenderPricingClick = () => {},
  onPostRenderContactClick = () => {},
  compactSuggestion = null,
  confidence = null,
  debugMetrics = null,
}) {
  const isDark = variant === 'dark';
  const isAdvancedPlan = getPlanTypeLabel(planType) !== 'free' || isPro;
  const showProBanner = getPlanTypeLabel(planType) === 'pro' || isPro;
  const canUseAdvanced = isAdvancedPlan;
  const progressStepIndex = Number.isInteger(conversionProgress?.stepIndex)
    ? conversionProgress.stepIndex
    : 0;
  const progressPercent = getProgressPercent(conversionProgress);
  const progressStepLabel = getProgressStepLabel(conversionProgress, progressStepIndex);
  const VerdictIcon = getVerdictIcon(verdict ? String(verdict).toUpperCase() : '');
  const verdictStyle = verdictVisualStyle(verdict ? String(verdict).toUpperCase() : '');
  const shouldShowVerdict = !isLoading && verdict;
  const normalizedFreeExportsLeft = normalizeFreeExportsLeft(freeExportsLeft);
  const badgeClassValue = getBadgeRemainder(planType, freeExportsLeft, remainingInPeriod, usedInPeriod, periodLimit);
  const freeExportsBadgeClass = getFreeExportsBadgeClass(badgeClassValue);
  const showBuyCredits = (
    Number.isFinite(normalizedFreeExportsLeft)
      ? normalizedFreeExportsLeft <= 1
      : false
  ) || (showBuyCreditsForTwo && normalizedFreeExportsLeft === 2);
  const quotaText = getQuotaBadgeText(planType, freeExportsLeft, remainingInPeriod, usedInPeriod, periodLimit);
  const [showBrandingUpgradeNudge, setShowBrandingUpgradeNudge] = React.useState(false);
  const [nudgeTarget, setNudgeTarget] = React.useState('branding');
  const [nudgeData, setNudgeData] = React.useState(null);
  const [isOptionsExpanded, setIsOptionsExpanded] = React.useState(initialOptionsExpanded);
  const articleRef = React.useRef(null);
  const scrollToCard = () => {
    const node = articleRef.current;
    if (!node || typeof node.scrollIntoView !== 'function') return;
    try {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      // no-op for non-browser test environments
    }
  };
  const [showBuyCreditsPanelInternal, setShowBuyCreditsPanelInternal] = React.useState(false);
  const effectiveShowBuyCreditsPanel = showBuyCreditsPanel || showBuyCreditsPanelInternal;
  const isCurrentShareLoading = shareState?.status === 'loading' && shareState?.jobId === renderId;
  const isCurrentShareCopied = shareState?.status === 'copied' && shareState?.jobId === renderId;
  const isRegularResult = hasResultBlob && !wasDemoLastUpload;
  const shouldShowDemoTry = !file && !hasResultBlob && !wasDemoLastUpload;
  const currentFileName = file?.name || downloadedFileName;

  const trackEvent = (name) => {
    if (typeof onEvent === 'function') onEvent(name);
  };

  const requestNudge = (feature) => {
    setNudgeTarget(feature);
    if (feature === 'branding') {
      setNudgeData({
        title: 'Remove branding is a Pro feature',
        description: 'Upgrade to remove fitforpdf branding from exported PDFs.',
      });
      trackEvent('paywall_branding_attempt');
      return;
    }

    const copy = getLayoutNudgeCopy(feature);
    setNudgeData(copy);
    trackEvent('paywall_layout_attempt');
  };

  const openNudge = (feature) => {
    // An explicit toggle click is a clear user intent — always surface the
    // nudge. Suppression (after "Not now") must only stop AUTO popups, never
    // turn a clicked toggle into a silent dead no-op. (bug fix 2026-05-28)
    requestNudge(feature);
    setShowBuyCreditsPanelInternal(false);
    setShowBrandingUpgradeNudge(true);
  };

  const handleBrandingChange = (nextChecked) => {
    const shouldGateBrandingOff = !canUseAdvanced && includeBranding && !nextChecked;
    if (shouldGateBrandingOff) {
      openNudge('branding');
      return;
    }

    setShowBrandingUpgradeNudge(false);
    onBrandingChange(nextChecked);
  };

  const handleLayoutChange = (key, nextChecked) => {
    const shouldGateLayoutOff = !canUseAdvanced && Boolean(layout?.[key]) && !nextChecked;
    if (shouldGateLayoutOff) {
      openNudge(key);
      return;
    }

    setShowBrandingUpgradeNudge(false);
    onLayoutChange(key, nextChecked);
  };

  const handleBrandingUpgrade = () => {
    onBuyCredits();
    setShowBrandingUpgradeNudge(false);
    setShowBuyCreditsPanelInternal(true);
    trackEvent('paywall_upgrade_clicked');
  };

  const handleProUpgrade = () => {
    onGoPro();
    setShowBrandingUpgradeNudge(false);
    trackEvent('paywall_upgrade_clicked');
  };

  const handleBrandingNudgeDismiss = () => {
    // "Not now" only closes the nudge for this session. Clicking the gated
    // toggle again re-surfaces it — never silently swallow an explicit click.
    trackEvent('paywall_dismissed');
    setShowBrandingUpgradeNudge(false);
  };

  const handleBuyCreditsPanelClose = () => {
    setShowBuyCreditsPanelInternal(false);
    onCloseBuyPanel();
  };

  React.useEffect(() => {
    if (canUseAdvanced) {
      setShowBrandingUpgradeNudge(false);
    }
  }, [canUseAdvanced]);

  React.useEffect(() => {
    if (showBuyCreditsPanel) {
      setIsOptionsExpanded(true);
    }
  }, [showBuyCreditsPanel]);

  const buyCreditsButtonText = paywallReason ? 'Buy credits' : 'Buy credits';

  const gearRef = React.useRef(null);
  const optionsPanelRef = React.useRef(null);

  // Close dropdown on outside click.
  //
  // BUG FIX (2026-05-28): previously this only checked `gearRef` (the gear
  // BUTTON). The options panel (#upload-options) renders separately, OUTSIDE
  // gearRef, so a mousedown on any toggle inside the panel was treated as an
  // "outside" click and closed the dropdown before the toggle's onClick could
  // fire. Result: the Branding/overview/headers/footer/truncate toggles felt
  // un-clickable. Now we treat a click as "outside" only when it's outside
  // BOTH the gear button AND the panel.
  React.useEffect(() => {
    if (!isOptionsExpanded) return;
    const handleClick = (e) => {
      const inGear = gearRef.current && gearRef.current.contains(e.target);
      const inPanel = optionsPanelRef.current && optionsPanelRef.current.contains(e.target);
      if (!inGear && !inPanel) {
        setIsOptionsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOptionsExpanded]);

  // Scroll so both the upload pill and the options dropdown are fully visible
  React.useEffect(() => {
    if (!isOptionsExpanded || !gearRef.current) return;
    const id = setTimeout(() => {
      const rect = gearRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Target: gear button sits ~80px from top, leaving ~440px for the dropdown below
      const idealGearTop = 55;
      const currentGearTop = rect.top;
      const delta = currentGearTop - idealGearTop;
      if (Math.abs(delta) > 20) {
        if (!isJsdomEnvironment() && typeof window.scrollBy === 'function') {
          try {
            window.scrollBy({ top: delta, behavior: 'smooth' });
          } catch {
            // no-op for non-browser test environments
          }
        }
      }
    }, 10);
    return () => clearTimeout(id);
  }, [isOptionsExpanded]);

  return (
    <article
      ref={articleRef}
      data-testid="upload-card"
      className={`relative overflow-hidden rounded-xl w-full scroll-mt-20 ${isDark ? 'bg-transparent border-0 p-0' : 'bg-white/20 backdrop-blur-[5px] border border-black/10 p-4 sm:p-6'}`}
    >
      {!isDark && (
        <>
          <div
            aria-hidden="true"
            data-testid="uploadcard-glass-backdrop"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.75),transparent_52%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.45),transparent_65%)]"
          />
          <div
            aria-hidden="true"
            data-testid="uploadcard-glass-highlight"
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-20 rounded-xl bg-gradient-to-b from-white/40 to-transparent"
          />
        </>
      )}
      {/* Card header — ROI-style: badge + lock + title */}
      <div className="mb-4 flex items-center justify-between w-full">
        <span data-testid="quota-pill" className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400 tracking-wide" aria-label="remaining exports">
          {quotaText}
        </span>
        {isDark && (
          <span
            ref={(el) => {
              if (!el || el.dataset.lockObserved) return;
              el.dataset.lockObserved = '1';
              const pageLoadTime = Date.now();
              const obs = new IntersectionObserver(
                ([e]) => {
                  if (!e.isIntersecting) return;
                  const elapsed = Date.now() - pageLoadTime;
                  if (elapsed < 1500) {
                    /* Page just loaded — wait for user to scroll away and back */
                    return;
                  }
                  setTimeout(() => el.classList.add('lock-closed'), 300);
                  obs.disconnect();
                },
                { threshold: 0.3 },
              );
              obs.observe(el);
            }}
            className="lock-icon inline-flex items-center gap-1 text-emerald-400 text-xs font-medium"
            aria-label="Files are secure"
          >
            <a href="/privacy" className="underline underline-offset-2 hover:text-emerald-300 transition-colors">No file storage</a>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lock-icon-svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path className="lock-shackle" d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        )}
      </div>
      {isDark && !wasDemoLastUpload && !isRegularResult && (
        <h3 className="mb-6 text-xl sm:text-2xl font-bold text-white tracking-tight">
          Uploading client data? We don&apos;t keep it. Ever.
        </h3>
      )}

      <form className="relative" onSubmit={onSubmit}>
        {/* ── The Pill — unmounted on the demo result state to keep a
             single decision visible (Try with your file). ───────────── */}
        {!wasDemoLastUpload && !isRegularResult && (
        <div
          className="scroll-mt-24 upload-pill flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-5 sm:py-3.5"
        >
          <UploadDropzone
            inputId="fitforpdf-file-input"
            file={file}
            onFileSelect={onFileSelect}
            onFileSelected={onFileSelect}
            onRemoveFile={onRemoveFile}
            accept=".csv,.xlsx"
            disabled={isLoading}
          />

          {/* Gear + Generate — same row, Generate fills remaining space on mobile */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          {/* Gear button */}
          <div ref={gearRef} className="relative shrink-0">
            <button
              type="button"
              data-testid="options-accordion-toggle"
              aria-expanded={isOptionsExpanded}
              aria-controls="upload-options"
              onClick={() => { setIsOptionsExpanded((c) => !c); scrollToCard(); }}
              // h-11 w-11 = 44px hit target (iOS HIG min). Was h-9 w-9 = 36px.
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition text-muted hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hero)] ${isOptionsExpanded ? 'border-accent/30 bg-[var(--color-bg-hero)] text-[var(--color-text)]' : 'border-[var(--color-border)]'}`}
              aria-label="Advanced options"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>

            {/* Gear button only — dropdown moved below pill */}
          </div>

          {/* Generate button — inside the pill */}
          {!isQuotaLocked && <Button
            type="submit"
            variant="primary"
            className={`shrink-0 flex-1 sm:flex-none h-10 rounded-xl px-5 ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : ''}`}
            disabled={isLoading || !file}
            onClick={scrollToCard}
          >
            {isLoading ? (
              <>
                <Loader2 aria-hidden="true" className="mr-1.5 h-4 w-4 animate-spin" />
                {/* Always show label, including on mobile — silent spinners
                    cause anxiety. Mobile-audit fix. */}
                <span>Generating…</span>
              </>
            ) : (
              <>
                Generate PDF
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </Button>}
          </div>{/* close gear+generate wrapper */}
        </div>
        )}

        {isRegularResult ? (
          <div
            data-testid="current-file-strip"
            className="scroll-mt-24 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60"
          >
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-300" />
            <span>Current file:</span>
            <span className="truncate font-medium text-white/80">{currentFileName || 'rendered export'}</span>
          </div>
        ) : null}

        {/* Quota badge removed — now in card header */}

        {/* ── Options dropdown — in document flow below pill ── */}
        {isOptionsExpanded ? (
          <div
            ref={optionsPanelRef}
            id="upload-options"
            data-testid="upload-options"
            className="mt-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg p-4"
            aria-live="polite"
          >
            <div className="min-h-0 divide-y divide-[var(--color-border)]">
              {effectiveShowBuyCreditsPanel ? (
                <section className="rounded-xl glass-subtle p-4 mb-3" data-testid="credits-purchase-panel">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--color-text)]">Buy credits</p>
                    <button type="button" onClick={handleBuyCreditsPanelClose} className="text-xs font-semibold text-muted underline">Close</button>
                  </div>
                  {CREDIT_PACKS.map((pack) => (
                    <button
                      key={pack.pack}
                      type="button"
                      disabled={isLoading}
                      onClick={() => onBuyCreditsPack(pack.pack)}
                      className="mt-2 flex w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>{pack.exportsLabel}</span>
                      <span>{pack.price}</span>
                    </button>
                  ))}
                  {purchaseMessage ? <p className="mt-3 text-sm text-[var(--color-text)]">{purchaseMessage}</p> : null}
                </section>
              ) : null}

              {showBrandingUpgradeNudge ? (
                <div data-testid="branding-upgrade-nudge-slot" aria-live="polite">
                  <section className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mb-3" data-testid="branding-upgrade-nudge">
                    <p className="text-sm font-semibold text-[var(--color-text)]">{nudgeData?.title || 'Upgrade to unlock this feature'}</p>
                    <p className="mt-1 text-sm text-muted">{nudgeData?.description || 'Upgrade to unlock this feature.'}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleBrandingUpgrade}
                        className="inline-flex h-8 items-center rounded-full border border-accent bg-accent px-3 text-xs font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Buy credits
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleProUpgrade}
                        className="inline-flex h-8 items-center rounded-full border border-accent px-3 text-xs font-semibold text-[var(--color-text)] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Go Pro
                      </button>
                      <button type="button" onClick={handleBrandingNudgeDismiss} className="inline-flex h-8 items-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg-hero)]">Not now</button>
                    </div>
                  </section>
                </div>
              ) : null}

              <SettingRow title="Branding" description="Adds a lightweight brand treatment by default" checked={includeBranding} onChange={handleBrandingChange} rowTestId="setting-row-branding" disabled={isLoading} />
              <SettingRow title="Keep overview" description="Show overview summary page in the export." checked={layout?.overview !== false} onChange={(v) => handleLayoutChange('overview', v)} rowTestId="setting-row-overview" disabled={isLoading} />
              <SettingRow title="Keep headers" description="Keep repeated headers for multi-page outputs." checked={layout?.headers !== false} onChange={(v) => handleLayoutChange('headers', v)} rowTestId="setting-row-headers" disabled={isLoading} />
              <SettingRow title="Keep footer" description="Keep footer metadata in the exported PDF." checked={layout?.footer !== false} onChange={(v) => handleLayoutChange('footer', v)} rowTestId="setting-row-footer" disabled={isLoading} />
              <SettingRow title="Truncate long text" description="Auto-crops very long content to keep layout stable" checked={truncateLongText} onChange={onTruncateChange} rowTestId="setting-row-truncate" disabled={isLoading} />
              <SettingRow title="Keep my source file (7 days)" description="Lets us improve the product and fix your export manually if it breaks. Optional — your file is deleted after 7 days." checked={retainSourceConsent} onChange={onRetainConsentChange} rowTestId="setting-row-retain-consent" disabled={isLoading} showBottomBorder={false} />
            </div>
          </div>
        ) : null}

        {/* ── Below-pill zone ─────────────────────── */}
        <div className="mt-4 pb-2 flex flex-col items-center gap-3 text-center">
          {/* Quota + Pro badge — unmounted in demo result state */}
          {!wasDemoLastUpload && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {showBuyCredits ? (
              <button
                type="button"
                data-testid="quota-buy-slot"
                aria-label="Buy credits"
                onClick={onBuyCredits}
                disabled={isLoading}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm font-semibold text-muted transition hover:bg-[var(--color-bg-hero)] hover:text-[var(--color-text)]"
              >
                <ShoppingCart aria-hidden="true" className="h-4 w-4" />
                <span>Buy credits</span>
              </button>
            ) : null}
            {showProBanner ? (
              <span data-testid="pro-top-banner" className="text-xs font-semibold text-[var(--color-text)]">
                Pro · {Number.isFinite(remainingInPeriod) ? `${remainingInPeriod} exports left this month` : '500 exports/month'}
              </span>
            ) : null}
          </div>
          )}

          {/* Helper subcopy — hidden when quota badge already shows the same info */}

          {shouldShowDemoTry ? (
          <div data-testid="demo-try-row">
            {isDark ? (
              <button
                type="button"
                onClick={onTrySample}
                disabled={isLoading}
                data-testid="demo-try-button"
                className="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold text-white/55 underline-offset-4 transition duration-150 hover:text-white hover:underline disabled:opacity-50"
              >
                See an example first
              </button>
            ) : (
              <button
                type="button"
                onClick={onTrySample}
                disabled={isLoading}
                data-testid="demo-try-button"
                className="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold text-muted underline-offset-4 transition duration-150 hover:text-[var(--color-text)] hover:underline disabled:opacity-50"
              >
                See an example first
              </button>
            )}
          </div>
          ) : null}

          {/* Progress */}
          {isLoading && conversionProgress ? (
            <div className="w-full max-w-[640px] space-y-3 rounded-xl glass-subtle p-4" data-testid="upload-progress">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-[var(--color-text)]">Converting your file</p>
                <p className="font-semibold text-muted">{progressPercent}%</p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div className="h-full rounded-full bg-accent transition-all duration-200 ease-out" style={{ width: `${progressPercent}%` }} />
              </div>
              <p data-testid="upload-progress-label" className="text-xs font-medium text-muted">{progressStepLabel}</p>
              <StepIndicator activeStepIndex={progressStepIndex} />
            </div>
          ) : null}

          {/* Paywall */}
          {isQuotaLocked && !hasResultBlob ? (
            <section data-testid="upload-paywall" className="w-full max-w-[640px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">You've used your free exports.</p>
                <p className="text-xs text-muted">Pick a credit pack — one-time purchase, no subscription.</p>
              </div>
              <div className="grid grid-cols-2 gap-2" data-testid="quota-upgrade-inline">
                {PAYWALL_PACKS.map((p, i) => (
                  i === 0 ? (
                    <button
                      key={p.stripePackId}
                      type="button"
                      disabled={isLoading}
                      onClick={() => onBuyCreditsPack(p.stripePackId)}
                      className="group flex flex-col items-start gap-0.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-left transition hover:border-accent/40 hover:bg-accent/5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="text-xs font-medium text-muted">{p.exportsLabel}</span>
                      <span className="text-lg font-bold tracking-tight text-[var(--color-text)] group-hover:text-cta transition-colors">{p.priceDisplay}</span>
                    </button>
                  ) : (
                    <button
                      key={p.stripePackId}
                      type="button"
                      disabled={isLoading}
                      onClick={() => onBuyCreditsPack(p.stripePackId)}
                      className="group relative flex flex-col items-start gap-0.5 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-left transition hover:border-accent/60 hover:bg-accent/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="absolute right-2.5 top-2 rounded-full bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">Best value</span>
                      <span className="text-xs font-medium text-muted">{p.exportsLabel}</span>
                      <span className="text-lg font-bold tracking-tight text-accent">{p.priceDisplay}</span>
                    </button>
                  )
                ))}
              </div>
              <p className="text-center text-xs text-muted">
                Need more?{' '}
                <a href="/contact" className="text-muted underline underline-offset-2 hover:text-[var(--color-text)] transition-colors">Contact us for Team/API</a>
              </p>
            </section>
          ) : hasResultBlob && wasDemoLastUpload ? (
            /* Demo success state — single-decision UI. The only loud action
             * is "Now try with your file"; everything else fades into a
             * compact strip and a discreet text link. The full demo→upload
             * CTA card is rendered below in the shared layout. */
            <div className="flex w-full max-w-[640px] flex-col gap-2">
              <div
                data-testid="demo-success-strip"
                className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="font-medium">Demo ready</span>
                {downloadedFileName ? (
                  <span className="truncate text-emerald-300/70">· {downloadedFileName}</span>
                ) : null}
              </div>
            </div>
          ) : hasResultBlob ? (
            <PostRenderPanel
              isLoading={isLoading}
              verdict={verdict}
              confidence={confidence}
              debugMetrics={debugMetrics}
              downloadedFileName={downloadedFileName}
              onDownloadAgain={onDownloadAgain}
              onRenderAnother={onRenderAnother}
              onPostRenderPricingClick={onPostRenderPricingClick}
              onPostRenderContactClick={onPostRenderContactClick}
              compactSuggestion={compactSuggestion}
              onRetryCompact={onRetryCompact}
              retainSourceConsent={retainSourceConsent}
            />
          ) : null}

          {!hasResultBlob && !wasDemoLastUpload && (downloadedFileName || shouldShowVerdict) ? (
            <div className="flex flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              {downloadedFileName ? <p>Ready: {downloadedFileName}</p> : null}
              {shouldShowVerdict ? (
                <span className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-xs font-semibold ${verdictStyle.badge}`}>
                  <VerdictIcon aria-hidden="true" className={`h-3.5 w-3.5 ${verdictStyle.icon}`} />
                  {String(verdict).toUpperCase()}
                </span>
              ) : null}
            </div>
          ) : null}

          {failKind === 'page_burden' && pageBurdenCopy ? (
            <div
              data-testid="page-burden-block"
              role="alert"
              className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-left"
            >
              <div className="space-y-1">
                <p className="text-base font-semibold text-amber-900">
                  {pageBurdenCopy.title}
                </p>
                {pageBurdenCopy.description ? (
                  <p className="text-sm text-amber-900/80">{pageBurdenCopy.description}</p>
                ) : null}
              </div>
              {Array.isArray(failureRecommendations) && failureRecommendations.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900/90">
                  {failureRecommendations.map((token) => (
                    <li key={token}>{recommendationLabel(token)}</li>
                  ))}
                </ul>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="accent"
                  onClick={onRetryCompact}
                  disabled={isLoading}
                >
                  {pageBurdenCopy.primaryCta || 'Generate compact version'}
                </Button>
              </div>
            </div>
          ) : null}

          {wasDemoLastUpload && (downloadedFileName || hasResultBlob) ? (
            <div
              data-testid="try-your-file-cta-block"
              className="flex w-full max-w-[640px] flex-col items-center gap-4 text-center"
            >
              <div className="space-y-1">
                <p className="text-base font-semibold text-white">
                  Now run it on yours.
                </p>
                <p className="text-sm text-white/60">
                  Same magic, your data.
                </p>
              </div>
              <Button
                type="button"
                data-testid="try-your-file-cta"
                variant="primary"
                onClick={onTryYourFile}
                disabled={isLoading}
                className="w-full"
              >
                Try with your file
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1.5 opacity-70"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
              <button
                type="button"
                data-testid="demo-download-link"
                onClick={onDownloadAgain}
                disabled={isLoading}
                className="text-xs text-white/50 underline-offset-2 transition-colors hover:text-white/80 hover:underline disabled:opacity-50"
              >
                Or download the demo PDF
              </button>
            </div>
          ) : null}

          {!isQuotaLocked && notice ? <p className="text-sm text-[var(--color-text)]">{notice}</p> : null}
          {!isQuotaLocked && error && <p className="text-sm text-rose-700">{error}</p>}

          {Array.isArray(exportHistory) && exportHistory.length > 0 && (
          <details data-testid="export-history" className="w-full max-w-[640px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-left">
            <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 select-none">
              <p className="text-sm font-semibold text-[var(--color-text)]">Export history</p>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onRefreshHistory(); }}
                disabled={isHistoryLoading}
                className="inline-flex h-8 items-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg-hero)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isHistoryLoading ? 'Refreshing…' : 'Refresh'}
              </button>
            </summary>
            <div className="px-4 pb-4">
            <div className="mb-3 flex items-center gap-2">
              <label htmlFor="history-status-filter" className="text-xs font-semibold text-muted">Status</label>
              <select
                id="history-status-filter"
                aria-label="History status filter"
                value={historyStatus}
                onChange={(event) => onHistoryStatusChange(event.target.value)}
                disabled={isHistoryLoading}
                className="h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-xs text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {HISTORY_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            {historyError ? (
              <p className="text-xs text-rose-700">{historyError}</p>
            ) : null}
            {!historyError && (!Array.isArray(exportHistory) || exportHistory.length === 0) ? (
              <p className="text-xs text-muted">No exports yet.</p>
            ) : null}
            {Array.isArray(exportHistory) && exportHistory.length > 0 ? (
              <ul className="space-y-2">
                {exportHistory.map((item) => (
                  <li key={item.id || item.supportId || item.createdAt} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-hero)] px-3 py-2">
                    <p className="text-xs font-semibold text-[var(--color-text)]">{formatHistoryStatus(item)}</p>
                    <p className="mt-1 text-xs text-muted">{formatHistoryDate(item.createdAt)}</p>
                    <p className="mt-1 text-xs text-muted">File: {item.sourceFileName || 'Unknown'}</p>
                    <p className="mt-1 text-xs text-muted">{formatHistoryQuota(item)}</p>
                    <p className="mt-1 text-xs text-muted">Support ID: {item.supportId || 'N/A'}</p>
                    {item.options && typeof item.options === 'object' ? (
                      <p className="mt-1 text-xs text-muted">Options: {Object.keys(item.options).join(', ') || 'None'}</p>
                    ) : null}
                    {item.entitlementMismatch ? (
                      <p className="mt-1 text-xs text-amber-700">Provisioning mismatch: {formatHistoryMismatch(item.entitlementMismatch)}</p>
                    ) : null}
                    {item.artifactAvailable && item.pdfUrl ? (
                      <a className="mt-1 inline-block text-xs font-semibold text-emerald-700 underline underline-offset-2" href={item.pdfUrl}>
                        Download artifact
                      </a>
                    ) : null}
                    {item.artifactAvailable && item.id ? (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => onCopyShareLink(item.id, 'export_history')}
                          disabled={shareState?.status === 'loading' && shareState?.jobId === item.id}
                          className="inline-flex h-8 items-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {shareState?.status === 'loading' && shareState?.jobId === item.id ? 'Creating review link…' : shareState?.status === 'copied' && shareState?.jobId === item.id ? 'Review link copied' : 'Copy review link'}
                        </button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {!historyError && hasMoreHistory && Array.isArray(exportHistory) && exportHistory.length > 0 ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onLoadMoreHistory}
                  disabled={isHistoryLoading}
                  className="inline-flex h-8 items-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg-hero)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isHistoryLoading ? 'Loading…' : 'Load more'}
                </button>
              </div>
            ) : null}
            </div>
          </details>
          )}
        </div>
      </form>
    </article>
  );
}
