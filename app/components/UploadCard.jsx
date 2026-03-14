import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  ShoppingCart,
} from 'lucide-react';

import AnimatedCheckmark from './AnimatedCheckmark';
import Button from './ui/Button';
import UploadDropzone from './UploadDropzone';
import Switch from './ui/Switch';
import { PAYG_PACKS } from '../siteCopy.mjs';

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
    circle: 'border border-[var(--color-border)] bg-[var(--color-bg-warm)] text-muted/70',
    label: 'text-muted/70',
  },
};

const CREDIT_PACKS = PAYG_PACKS.map((p) => ({
  pack: p.stripePackId,
  exportsLabel: p.exportsLabel,
  price: p.priceDisplay,
}));

const PAYWALL_PACKS = PAYG_PACKS.filter((p) => p.id !== 'single');

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

const BRANDING_UPGRADE_NUDGE_SUPPRESSION_KEY = 'fitforpdf_branding_nudge_suppressed_until';
const BRANDING_UPGRADE_NUDGE_SUPPRESS_MS = 10 * 60 * 1000;
let inMemoryBrandingNudgeSuppression = 0;

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
          className="w-full cursor-pointer px-1 py-0.5 text-left transition-colors hover:bg-[var(--color-bg-warm)] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25"
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

function safeLocalStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getBrandingNudgeSuppressedUntil() {
  const storage = safeLocalStorage();
  if (storage) {
    try {
      const value = storage.getItem(BRANDING_UPGRADE_NUDGE_SUPPRESSION_KEY);
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        if (parsed > Date.now()) return parsed;
        storage.removeItem(BRANDING_UPGRADE_NUDGE_SUPPRESSION_KEY);
      }
    } catch {
      // fall through to in-memory value
    }
  }

  return inMemoryBrandingNudgeSuppression;
}

function setBrandingNudgeSuppressedUntil(ts) {
  const safeTs = Number.parseInt(ts, 10);
  if (!Number.isFinite(safeTs)) return;

  inMemoryBrandingNudgeSuppression = safeTs;
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(BRANDING_UPGRADE_NUDGE_SUPPRESSION_KEY, String(safeTs));
  } catch {
    // no-op
  }
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
  onSubmit,
  onDownloadAgain,
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
}) {
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
  const [showBuyCreditsPanelInternal, setShowBuyCreditsPanelInternal] = React.useState(false);
  const effectiveShowBuyCreditsPanel = showBuyCreditsPanel || showBuyCreditsPanelInternal;
  const isBrandingNudgeSuppressed = React.useCallback(() => getBrandingNudgeSuppressedUntil() > Date.now(), []);

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
    if (!isBrandingNudgeSuppressed()) {
      requestNudge(feature);
      setShowBuyCreditsPanelInternal(false);
      setShowBrandingUpgradeNudge(true);
    }
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
    trackEvent('paywall_dismissed');
    setBrandingNudgeSuppressedUntil(Date.now() + BRANDING_UPGRADE_NUDGE_SUPPRESS_MS);
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

  const buyCreditsButtonText = paywallReason ? 'Buy credits' : 'Buy credits';

  const gearRef = React.useRef(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!isOptionsExpanded) return;
    const handleClick = (e) => {
      if (gearRef.current && !gearRef.current.contains(e.target)) {
        setIsOptionsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOptionsExpanded]);

  return (
    <article
      data-testid="upload-card"
      className="w-full"
    >
      <form className="relative" onSubmit={onSubmit}>
        {/* ── The Pill ─────────────────────────────── */}
        <div id="generate" className="scroll-mt-24 upload-pill flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
          <UploadDropzone
            inputId="fitforpdf-file-input"
            file={file}
            onFileSelect={onFileSelect}
            onFileSelected={onFileSelect}
            onRemoveFile={onRemoveFile}
            accept=".csv,.xlsx"
            disabled={isLoading}
          />

          {/* Gear button */}
          <div ref={gearRef} className="relative shrink-0">
            <button
              type="button"
              data-testid="options-accordion-toggle"
              aria-expanded={isOptionsExpanded}
              aria-controls="upload-options"
              onClick={() => setIsOptionsExpanded((c) => !c)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition text-muted hover:text-[var(--color-text)] hover:bg-[var(--color-bg-warm)] ${isOptionsExpanded ? 'border-accent/30 bg-[var(--color-bg-warm)] text-[var(--color-text)]' : 'border-[var(--color-border)]'}`}
              aria-label="Advanced options"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>

            {/* Gear dropdown */}
            {isOptionsExpanded ? (
              <div
                id="upload-options"
                data-testid="upload-options"
                className="absolute right-0 top-full mt-2 w-[340px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg z-20 p-4"
                data-testid-shell="upload-options-shell"
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
                        <button type="button" key={pack.pack} onClick={() => onBuyCreditsPack(pack.pack)} className="mt-2 flex w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm font-medium">
                          <span>{pack.exportsLabel}</span>
                          <span>{pack.price}</span>
                        </button>
                      ))}
                      {purchaseMessage ? <p className="mt-3 text-sm text-[var(--color-text)]">{purchaseMessage}</p> : null}
                    </section>
                  ) : null}

                  {showBrandingUpgradeNudge && !isBrandingNudgeSuppressed() ? (
                    <div data-testid="branding-upgrade-nudge-slot" aria-live="polite">
                      <section className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mb-3" data-testid="branding-upgrade-nudge">
                        <p className="text-sm font-semibold text-[var(--color-text)]">{nudgeData?.title || 'Upgrade to unlock this feature'}</p>
                        <p className="mt-1 text-sm text-muted">{nudgeData?.description || 'Upgrade to unlock this feature.'}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button type="button" onClick={handleBrandingUpgrade} className="inline-flex h-8 items-center rounded-full border border-accent bg-accent px-3 text-xs font-semibold text-white hover:bg-accent-hover">Buy credits</button>
                          <button type="button" onClick={handleProUpgrade} className="inline-flex h-8 items-center rounded-full border border-accent px-3 text-xs font-semibold text-[var(--color-text)] hover:bg-blue-50">Go Pro</button>
                          <button type="button" onClick={handleBrandingNudgeDismiss} className="inline-flex h-8 items-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg-warm)]">Not now</button>
                        </div>
                      </section>
                    </div>
                  ) : null}

                  <SettingRow title="Branding" description="Adds a lightweight brand treatment by default" checked={includeBranding} onChange={handleBrandingChange} rowTestId="setting-row-branding" disabled={isLoading} />
                  <SettingRow title="Keep overview" description="Show overview summary page in the export." checked={layout?.overview !== false} onChange={(v) => handleLayoutChange('overview', v)} rowTestId="setting-row-overview" disabled={isLoading} />
                  <SettingRow title="Keep headers" description="Keep repeated headers for multi-page outputs." checked={layout?.headers !== false} onChange={(v) => handleLayoutChange('headers', v)} rowTestId="setting-row-headers" disabled={isLoading} />
                  <SettingRow title="Keep footer" description="Keep footer metadata in the exported PDF." checked={layout?.footer !== false} onChange={(v) => handleLayoutChange('footer', v)} rowTestId="setting-row-footer" disabled={isLoading} />
                  <SettingRow title="Truncate long text" description="Auto-crops very long content to keep layout stable" checked={truncateLongText} onChange={onTruncateChange} rowTestId="setting-row-truncate" disabled={isLoading} showBottomBorder={false} />
                </div>
              </div>
            ) : null}
          </div>

          {/* Generate button — inside the pill */}
          <Button
            type="submit"
            variant="primary"
            className="shrink-0 !h-10 !rounded-xl !px-5"
            disabled={isLoading || !file}
          >
            {isLoading ? (
              <>
                <Loader2 aria-hidden="true" className="mr-1.5 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Generating…</span>
              </>
            ) : (
              <>
                Generate
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </Button>
        </div>

        {/* ── Below-pill zone ─────────────────────── */}
        <div className="mt-4 flex flex-col items-center gap-3 text-center">
          {/* Quota + Pro badge */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {showProBanner ? (
              <span data-testid="pro-top-banner" className="text-xs font-semibold text-[var(--color-text)]">
                Pro · {Number.isFinite(remainingInPeriod) ? `${remainingInPeriod} exports left this month` : '500 exports/month'}
              </span>
            ) : (
              <span data-testid="quota-pill" className="text-xs font-medium text-muted" aria-label="remaining exports">
                {quotaText}
              </span>
            )}
            {showBuyCredits ? (
              <button
                type="button"
                onClick={onBuyCredits}
                data-testid="quota-buy-slot"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <ShoppingCart aria-hidden="true" className="h-3.5 w-3.5" />
                Buy credits
              </button>
            ) : null}
          </div>

          {/* Try demo */}
          <Button
            variant="accent"
            onClick={onTrySample}
            disabled={isLoading}
            data-testid="demo-try-button"
          >
            Try with a demo file
          </Button>

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
          {isQuotaLocked ? (
            <section data-testid="upload-paywall" className="w-full max-w-[640px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">You've used your free exports.</p>
                <p className="text-xs text-muted">{paywallReason || 'Pick a credit pack — one-time purchase, no subscription.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2" data-testid="quota-upgrade-inline">
                {PAYWALL_PACKS.map((p, i) => (
                  i === 0 ? (
                    <button key={p.stripePackId} type="button" onClick={() => onBuyCreditsPack(p.stripePackId)} className="group flex flex-col items-start gap-0.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-left transition hover:border-accent/40 hover:bg-accent/5 active:scale-[0.98]">
                      <span className="text-xs font-medium text-muted">{p.exportsLabel}</span>
                      <span className="text-lg font-bold tracking-tight text-[var(--color-text)] group-hover:text-accent transition-colors">{p.priceDisplay}</span>
                    </button>
                  ) : (
                    <button key={p.stripePackId} type="button" onClick={() => onBuyCreditsPack(p.stripePackId)} className="group relative flex flex-col items-start gap-0.5 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-left transition hover:border-accent/60 hover:bg-accent/10 active:scale-[0.98]">
                      <span className="absolute right-2.5 top-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">Best value</span>
                      <span className="text-xs font-medium text-muted">{p.exportsLabel}</span>
                      <span className="text-lg font-bold tracking-tight text-accent">{p.priceDisplay}</span>
                    </button>
                  )
                ))}
              </div>
              <p className="text-center text-xs text-muted/70">
                Need more?{' '}
                <a href="mailto:hello@fitforpdf.com" className="text-muted underline underline-offset-2 hover:text-[var(--color-text)] transition-colors">Contact us for Team/API</a>
              </p>
            </section>
          ) : hasResultBlob ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-[640px]">
              <AnimatedCheckmark size={48} />
              <p className="text-emerald-600 text-sm font-medium">PDF generated successfully!</p>
              <Button type="button" variant="primary" className="w-full" data-testid="download-again" onClick={onDownloadAgain} disabled={isLoading}>
                Download again
              </Button>
            </div>
          ) : (
            <p data-testid="upload-privacy-messages" className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 text-xs font-medium text-blue-700">
              <span aria-label="European Union flag">🇪🇺</span>
              GDPR Compliant · Data processed in France · Files deleted after conversion · No content stored
            </p>
          )}

          {downloadedFileName || shouldShowVerdict ? (
            <div className="flex flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              {downloadedFileName ? <p>Downloaded: {downloadedFileName}</p> : null}
              {shouldShowVerdict ? (
                <span className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold ${verdictStyle.badge}`}>
                  <VerdictIcon aria-hidden="true" className={`h-3.5 w-3.5 ${verdictStyle.icon}`} />
                  {String(verdict).toUpperCase()}
                </span>
              ) : null}
            </div>
          ) : null}

          {notice ? <p className="text-sm text-[var(--color-text)]">{notice}</p> : null}
          {error && <p className="text-sm text-rose-700">{error}</p>}
        </div>
      </form>
    </article>
  );
}

export { getBrandingNudgeSuppressedUntil, setBrandingNudgeSuppressedUntil };
