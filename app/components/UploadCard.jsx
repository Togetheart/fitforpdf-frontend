import React from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import Button from './Button';
import Toggle from './Toggle';
import UploadDropzone from './UploadDropzone';

const PROGRESS_STEPS = ['Uploading', 'Structuring (column grouping)', 'Generating PDF'];

function getProgressStepLabel(progress, stepIndex) {
  if (progress?.label) return progress.label;
  const safeIndex = Math.min(Math.max(stepIndex, 0), PROGRESS_STEPS.length - 1);
  return PROGRESS_STEPS[safeIndex];
}

function getProgressPercent(progress) {
  if (!progress || !Number.isFinite(progress.percent)) return 0;
  return Math.min(100, Math.max(0, Math.round(progress.percent)));
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
  if (value <= 0) return '0 exports left';
  if (value === 1) return '1 export left';
  return `${value} exports left`;
}

function getVerdictIcon(verdict) {
  if (verdict === 'OK') return CheckCircle2;
  return AlertCircle;
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

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5" data-testid="upload-card">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">{toolTitle}</h2>
            <p className="text-sm text-slate-500">{toolSubcopy}</p>
          </div>
          <span
            data-testid="quota-pill"
            className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm"
            aria-label="free exports remaining"
          >
            Free. {freeExportsText(freeExportsLeft)}
          </span>
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
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-3">
              {PROGRESS_STEPS.map((step, idx) => (
                <p
                  key={step}
                  data-testid={`upload-progress-step-${idx}`}
                  className={`rounded-full px-2 py-1 text-center ${idx <= progressStepIndex ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}
                >
                  {step}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <Toggle
            label="Branding"
            checked={includeBranding}
            description="Adds a lightweight brand treatment by default"
            tooltip="Keep this on to display the FitForPDF styling in exports."
            disabled={isLoading}
            onChange={onBrandingChange}
          />
          <Toggle
            label="Truncate long text"
            checked={truncateLongText}
            description="Auto-crops very long content to keep layout stable"
            tooltip="Enable this to avoid rows pushing beyond column width."
            disabled={isLoading}
            onChange={onTruncateChange}
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
            <button
              type="button"
              onClick={onTrySample}
              disabled={isLoading}
              className="inline-flex h-10 items-center text-sm font-semibold text-slate-700 transition hover:text-[#D92D2A]"
            >
              Try premium demo (120 rows · 15 columns)
            </button>
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
