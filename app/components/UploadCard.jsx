import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  ChevronDown,
  Loader2,
  ShoppingCart,
} from 'lucide-react';

import Button from './Button';
import UploadDropzone from './UploadDropzone';
import Switch from './ui/Switch';

const PROGRESS_STEPS = ['Uploading', 'Structuring (column grouping)', 'Generating PDF'];
const PROGRESS_STEP_STATES = {
  completed: {
    circle: 'border border-emerald-300 bg-emerald-50 text-emerald-700',
    label: 'text-slate-700',
  },
  active: {
    circle: 'border border-rose-600 bg-rose-600 text-white',
    label: 'text-slate-900 font-medium',
  },
  pending: {
    circle: 'border border-slate-200 bg-slate-100 text-slate-400',
    label: 'text-slate-400',
  },
};

const CREDIT_PACKS = [
  { pack: 'credits_50', exportsLabel: '50 exports', price: '€9' },
  { pack: 'credits_200', exportsLabel: '200 exports', price: '€29' },
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
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-colors duration-200 ${stateClasses.circle}`}
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
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  warning: 'border-amber-200 bg-amber-400 text-white',
  warningStrong: 'border-amber-300 bg-amber-600 text-white',
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
      badge: 'border-amber-200 bg-amber-50 text-amber-700',
      icon: 'text-amber-700',
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

function InfoTooltip({ label, text }) {
  return (
    <button
      type="button"
      aria-label={`${label} info`}
      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-600"
      title={text}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />
    </button>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
  tooltip,
  disabled,
  rowTestId,
}) {
  const handleTextToggle = (event) => {
    if (disabled) return;
    event.preventDefault();
    onChange(!checked);
  };

  return (
    <div className="flex w-full items-start justify-between gap-6 rounded-sm py-4">
      <div
        data-testid={rowTestId}
        tabIndex={-1}
        className="min-w-0"
      >
        <div
          className="rounded-md px-1 py-0.5 transition-colors cursor-pointer hover:bg-slate-50"
          onClick={handleTextToggle}
        >
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            {tooltip ? (
              <span
                className="shrink-0"
                onClick={(event) => event.stopPropagation()}
              >
                {tooltip}
              </span>
            ) : null}
          </div>
          <div
            className="mt-1 text-sm text-slate-500"
          >
            {description}
          </div>
        </div>
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
  const isBrandingNudgeSuppressed = React.useCallback(() => getBrandingNudgeSuppressedUntil() > Date.now(), []);

  const trackEvent = (name) => {
    if (typeof onEvent === 'function') onEvent(name);
  };

  const requestNudge = (feature) => {
    setNudgeTarget(feature);
    if (feature === 'branding') {
      setNudgeData({
        title: 'Remove branding is a Pro feature',
        description: 'Upgrade to remove FitForPDF branding from exported PDFs.',
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

  React.useEffect(() => {
    if (canUseAdvanced) {
      setShowBrandingUpgradeNudge(false);
    }
  }, [canUseAdvanced]);

  const buyCreditsButtonText = paywallReason ? 'Buy credits' : 'Buy credits';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5" data-testid="upload-card">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
            <h2
              id="generate"
              className="scroll-mt-24 text-2xl font-semibold leading-snug sm:text-3xl"
            >
              {toolTitle}
            </h2>
            <p className="text-sm text-slate-500">{toolSubcopy}</p>
          </div>
          {showProBanner ? (
            <p
              data-testid="pro-top-banner"
              className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Pro · {Number.isFinite(remainingInPeriod) ? `${remainingInPeriod} exports left this month` : '500 exports/month'}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <span
              data-testid="quota-buy-slot"
              className="flex h-9 w-9 shrink-0 items-center justify-center"
              aria-hidden={showBuyCredits ? 'false' : 'true'}
            >
              {showBuyCredits ? (
                <span className="group relative inline-flex">
                  <button
                    type="button"
                    aria-label="Buy credits"
                    aria-describedby="buy-credits-tooltip"
                    title="Buy credits"
                    onClick={onBuyCredits}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80"
                  >
                    <ShoppingCart aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <span
                    id="buy-credits-tooltip"
                    role="tooltip"
                    className="pointer-events-none absolute right-0 top-full mt-1 translate-y-0.5 whitespace-nowrap rounded-md border border-slate-200 bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 group-focus:opacity-100"
                  >
                    {buyCreditsButtonText}
                  </span>
                </span>
              ) : null}
            </span>
            <span
              data-testid="quota-pill"
              className={`inline-flex h-9 min-w-0 items-center rounded-full border px-4 text-xs font-medium shadow-sm ${freeExportsBadgeClass}`}
              aria-label="remaining exports"
            >
              {quotaText}
            </span>
          </div>
        </div>

        <UploadDropzone
          inputId="fitforpdf-file-input"
          file={file}
          onFileSelect={onFileSelect}
          onFileSelected={onFileSelect}
          onRemoveFile={onRemoveFile}
          accept=".csv,.xlsx"
          disabled={isLoading}
        />

        {isLoading && conversionProgress ? (
          <div
            className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
            data-testid="upload-progress"
          >
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium text-slate-800">Converting your file</p>
              <p className="font-semibold text-slate-600">{progressPercent}%</p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#D92D2A] transition-all duration-200 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p data-testid="upload-progress-label" className="text-xs font-medium text-slate-600">
              {progressStepLabel}
            </p>
            <StepIndicator activeStepIndex={progressStepIndex} />
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            data-testid="options-accordion-toggle"
            aria-expanded={isOptionsExpanded}
            aria-controls="upload-options"
            onClick={() => setIsOptionsExpanded((current) => !current)}
            className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left"
          >
            <span className="text-sm font-semibold text-slate-900">Options</span>
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 text-slate-500 transition-transform duration-150 ${isOptionsExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {isOptionsExpanded ? (
            <div
              id="upload-options"
              data-testid="upload-options"
              className="px-5 py-4"
              aria-live="polite"
            >
              <div className="min-h-0 divide-y divide-slate-200">
                <div
                  data-testid="branding-upgrade-nudge-slot"
                  aria-live="polite"
                  className={`overflow-hidden transition-all duration-200 ${showBrandingUpgradeNudge && !isBrandingNudgeSuppressed() ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {showBrandingUpgradeNudge && !isBrandingNudgeSuppressed() ? (
                    <section
                      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
                      data-testid="branding-upgrade-nudge"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {nudgeData?.title || 'Upgrade to unlock this feature'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {nudgeData?.description || 'Upgrade to unlock this feature.'}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleBrandingUpgrade}
                          className="inline-flex h-9 items-center justify-center text-center text-sm font-semibold text-white transition-colors rounded-full border border-[#D92D2A] bg-[#D92D2A] px-4 hover:bg-[#b92524]"
                        >
                          Buy credits
                        </button>
                        <button
                          type="button"
                          onClick={handleProUpgrade}
                          className="inline-flex h-9 items-center justify-center text-center text-sm font-semibold text-slate-700 transition-colors rounded-full border border-[#D92D2A] px-4 hover:bg-[#FDECEC]"
                        >
                          Go Pro
                        </button>
                        <button
                          type="button"
                          onClick={handleBrandingNudgeDismiss}
                          className="inline-flex h-9 items-center rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          Not now
                        </button>
                      </div>
                    </section>
                  ) : null}
                </div>

                <section
                  className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 ${showBuyCreditsPanel ? 'max-h-96 opacity-100' : 'max-h-0 border-slate-100 bg-transparent p-0 opacity-0'}`}
                  data-testid={showBuyCreditsPanel && isOptionsExpanded ? 'credits-purchase-panel' : 'credits-purchase-panel-inline'}
                  aria-hidden={!showBuyCreditsPanel}
                >
                  <div className={`transition-opacity duration-150 ${showBuyCreditsPanel ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Buy credits</p>
                      <button
                        type="button"
                        onClick={onCloseBuyPanel}
                        className="text-xs font-semibold text-slate-600 underline"
                      >
                        Close
                      </button>
                    </div>
                    {CREDIT_PACKS.map((pack) => (
                      <button
                        type="button"
                        key={pack.pack}
                        onClick={() => onBuyCreditsPack(pack.pack)}
                        className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
                      >
                        <span>{pack.exportsLabel}</span>
                        <span>{pack.price}</span>
                      </button>
                    ))}
                    {purchaseMessage ? (
                      <p className="mt-3 text-sm text-slate-700">{purchaseMessage}</p>
                    ) : null}
                  </div>
                </section>

                <SettingRow
                  title="Branding"
                  description="Adds a lightweight brand treatment by default"
                  checked={includeBranding}
                  onChange={handleBrandingChange}
                  tooltip={<InfoTooltip label="Branding" text="Keep this on to display the FitForPDF styling in exports." />}
                  rowTestId="setting-row-branding"
                  disabled={isLoading}
                />

                <SettingRow
                  title="Keep overview"
                  description="Show overview summary page in the export."
                  checked={layout?.overview !== false}
                  onChange={(nextChecked) => handleLayoutChange('overview', nextChecked)}
                  tooltip={<InfoTooltip label="Keep overview" text="Keep overview content in the generated PDF." />}
                  rowTestId="setting-row-overview"
                  disabled={isLoading}
                />

                <SettingRow
                  title="Keep headers"
                  description="Keep repeated headers for multi-page outputs."
                  checked={layout?.headers !== false}
                  onChange={(nextChecked) => handleLayoutChange('headers', nextChecked)}
                  tooltip={<InfoTooltip label="Keep headers" text="Keep your table headers visible on each page." />}
                  rowTestId="setting-row-headers"
                  disabled={isLoading}
                />

                <SettingRow
                  title="Keep footer"
                  description="Keep footer metadata in the exported PDF."
                  checked={layout?.footer !== false}
                  onChange={(nextChecked) => handleLayoutChange('footer', nextChecked)}
                  tooltip={<InfoTooltip label="Keep footer" text="Keep the footer content in the exported PDF." />}
                  rowTestId="setting-row-footer"
                  disabled={isLoading}
                />

                <SettingRow
                  title="Truncate long text"
                  description="Auto-crops very long content to keep layout stable"
                  checked={truncateLongText}
                  onChange={onTruncateChange}
                  tooltip={<InfoTooltip label="Truncate long text" text="Enable this to avoid rows pushing beyond column width." />}
                  rowTestId="setting-row-truncate"
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : null}
        </div>

        {showBuyCreditsPanel && !isOptionsExpanded ? (
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4" data-testid="credits-purchase-panel">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Buy credits</p>
              <button
                type="button"
                onClick={onCloseBuyPanel}
                className="text-xs font-semibold text-slate-600 underline"
              >
                Close
              </button>
            </div>
            {CREDIT_PACKS.map((pack) => (
              <button
                type="button"
                key={pack.pack}
                onClick={() => onBuyCreditsPack(pack.pack)}
                className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
              >
                <span>{pack.exportsLabel}</span>
                <span>{pack.price}</span>
              </button>
            ))}
            {purchaseMessage ? (
              <p className="mt-3 text-sm text-slate-700">{purchaseMessage}</p>
            ) : null}
          </section>
        ) : null}

        {isQuotaLocked ? (
          <>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled
            >
              Generate PDF
            </Button>
            <section
              data-testid="upload-paywall"
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-xs text-slate-600">{paywallReason || 'You have reached your exports limit for this plan.'}</p>
              <div className="mt-3 flex flex-wrap gap-2" data-testid="quota-upgrade-inline">
                <Button
                  type="button"
                  variant="primary"
                  onClick={onBuyCredits}
                  className="min-w-0"
                >
                  Buy credits
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onGoPro}
                  className="min-w-0"
                >
                  Go Pro
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                <a href="mailto:hello@fitforpdf.com" className="underline">Contact us for Team/API</a>
              </p>
            </section>
          </>
        ) : hasResultBlob ? (
          <Button
            type="button"
            variant="primary"
            className="w-full"
            data-testid="download-again"
            onClick={onDownloadAgain}
            disabled={isLoading}
          >
            Download again
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading || !file}
          >
            {isLoading ? (
              <>
                <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              'Generate PDF'
            )}
          </Button>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p>Files are deleted immediately after conversion.</p>
          <p>PDF available for up to 15 minutes.</p>
          <p>No file content stored in logs.</p>
        </div>

        {downloadedFileName || shouldShowVerdict ? (
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            {downloadedFileName ? <p>Downloaded: {downloadedFileName}</p> : null}
            {shouldShowVerdict ? (
              <span
                className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold ${verdictStyle.badge}`}
              >
                <VerdictIcon aria-hidden="true" className={`h-3.5 w-3.5 ${verdictStyle.icon}`} />
                {String(verdict).toUpperCase()}
              </span>
            ) : null}
          </div>
        ) : null}

        {notice ? <p className="text-sm text-slate-700">{notice}</p> : null}
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </form>
    </article>
  );
}

export { getBrandingNudgeSuppressedUntil, setBrandingNudgeSuppressedUntil };
