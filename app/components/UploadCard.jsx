import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CircleHelp,
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

function normalizeFreeExportsLeft(value) {
  const safeValue = Number.parseInt(value, 10);
  if (!Number.isFinite(safeValue)) return 0;
  if (safeValue <= 0) return 0;
  if (safeValue >= 3) return 3;
  return safeValue;
}

function safeLocalStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getBrandingNudgeSuppressedUntil() {
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
      // fall through to in-memory timestamp
    }
  }

  return inMemoryBrandingNudgeSuppression;
}

export function setBrandingNudgeSuppressedUntil(ts) {
  const safeTs = Number.parseInt(ts, 10);
  if (!Number.isFinite(safeTs)) return;

  inMemoryBrandingNudgeSuppression = safeTs;
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(BRANDING_UPGRADE_NUDGE_SUPPRESSION_KEY, String(safeTs));
  } catch {
    // no-op: fallback remains available in memory for this session
  }
}

function getFreeExportsBadgeClass(exportsLeft) {
  if (exportsLeft <= 0) return EXPORT_BADGE_STYLES.danger;
  if (exportsLeft === 1) return EXPORT_BADGE_STYLES.warningStrong;
  if (exportsLeft === 2) return EXPORT_BADGE_STYLES.warning;
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

function freeExportsText(value) {
  const safeValue = Number.isFinite(Number.parseInt(value, 10)) ? Number.parseInt(value, 10) : 0;
  if (safeValue <= 0) return '0 exports left';
  if (safeValue === 1) return '1 export left';
  return `${safeValue} exports left`;
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
}) {
  const isOverQuota = freeExportsLeft <= 0;
  const inputId = 'fitforpdf-file-input';
  const verdictNormalized = verdict ? String(verdict).toUpperCase() : '';
  const progressStepIndex = Number.isInteger(conversionProgress?.stepIndex)
    ? conversionProgress.stepIndex
    : 0;
  const progressPercent = getProgressPercent(conversionProgress);
  const progressStepLabel = getProgressStepLabel(conversionProgress, progressStepIndex);
  const VerdictIcon = getVerdictIcon(verdictNormalized);
  const verdictStyle = verdictVisualStyle(verdictNormalized);
  const shouldShowVerdict = !isLoading && verdictNormalized;
  const normalizedFreeExportsLeft = normalizeFreeExportsLeft(freeExportsLeft);
  const freeExportsBadgeClass = getFreeExportsBadgeClass(normalizedFreeExportsLeft);
  const showBuyCredits = normalizedFreeExportsLeft <= 1 || (showBuyCreditsForTwo && normalizedFreeExportsLeft === 2);
  const [showBrandingUpgradeNudge, setShowBrandingUpgradeNudge] = React.useState(false);
  const isBrandingNudgeSuppressed = React.useCallback(() => getBrandingNudgeSuppressedUntil() > Date.now(), []);

  const trackEvent = (name) => {
    if (typeof onEvent === 'function') onEvent(name);
  };

  const handleBrandingChange = (nextChecked) => {
    const shouldGateBrandingOff = !isPro && includeBranding && !nextChecked;
    if (shouldGateBrandingOff) {
      trackEvent('paywall_branding_attempt');
      if (!isBrandingNudgeSuppressed()) {
        setShowBrandingUpgradeNudge(true);
      }
      return;
    }

    setShowBrandingUpgradeNudge(false);
    onBrandingChange(nextChecked);
  };

  const handleBrandingUpgrade = () => {
    trackEvent('paywall_upgrade_clicked');
    onUpgrade();
  };

  const handleBrandingNudgeDismiss = () => {
    trackEvent('paywall_dismissed');
    setBrandingNudgeSuppressedUntil(Date.now() + BRANDING_UPGRADE_NUDGE_SUPPRESS_MS);
    setShowBrandingUpgradeNudge(false);
  };

  React.useEffect(() => {
    if (isPro) {
      setShowBrandingUpgradeNudge(false);
    }
  }, [isPro]);

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
                    Buy credits
                  </span>
                </span>
              ) : null}
            </span>
            <span
              data-testid="quota-pill"
              className={`inline-flex h-9 min-w-0 items-center rounded-full border px-4 text-xs font-medium shadow-sm ${freeExportsBadgeClass}`}
              aria-label="free exports remaining"
            >
              Free · {freeExportsText(normalizedFreeExportsLeft)}
            </span>
          </div>
        </div>

        <UploadDropzone
          inputId={inputId}
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

        <div className="rounded-xl border border-slate-200 bg-white px-4">
          <SettingRow
            title="Branding"
            description="Adds a lightweight brand treatment by default"
            checked={includeBranding}
            onChange={handleBrandingChange}
            tooltip={<InfoTooltip label="Branding" text="Keep this on to display the FitForPDF styling in exports." />}
            rowTestId="setting-row-branding"
            disabled={isLoading}
          />
          <div
            data-testid="branding-upgrade-nudge-slot"
            aria-live="polite"
            className="min-h-0 px-4 pt-2 pb-1"
          >
            {!isBrandingNudgeSuppressed() && !isPro && showBrandingUpgradeNudge ? (
              <section
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
                data-testid="branding-upgrade-nudge"
              >
                <p className="text-sm font-semibold text-slate-900">
                  Remove branding is a Pro feature
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Upgrade to remove FitForPDF branding from exported PDFs.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBrandingUpgrade}
                    className="inline-flex h-9 items-center justify-center text-center text-sm font-semibold text-white transition-colors rounded-full border border-[#D92D2A] bg-[#D92D2A] px-4 hover:bg-[#b92524]"
                  >
                    Upgrade
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

          <div className="h-px bg-slate-100" />

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

        {hasResultBlob ? (
          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={onDownloadAgain}
            disabled={isLoading}
          >
            Download again
          </Button>
        ) : isOverQuota ? (
          <section
            data-testid="upload-paywall"
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <p className="text-xs text-slate-600">You have reached your free exports.</p>
            <Button
              variant="primary"
              href="/pricing"
              className="mt-3 w-full"
            >
              Upgrade to continue
            </Button>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" data-testid="run-demo-row">
              <button
                type="button"
                onClick={onTrySample}
                disabled={isLoading}
                className="inline-flex h-10 items-center font-semibold text-slate-900 transition hover:text-[#D92D2A]"
              >
                Run the demo
              </button>
              <span className="text-slate-600">See how FitForPDF handles real-world invoice complexity.</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">120 rows · 14 columns · long descriptions</span>
            </div>
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
          </>
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
                {verdictNormalized}
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
