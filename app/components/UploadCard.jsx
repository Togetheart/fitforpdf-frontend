import React from 'react';
import { FileCheck, Loader2 } from 'lucide-react';

import Button from './Button';
import Toggle from './Toggle';
import UploadDropzone from './UploadDropzone';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
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
  downloadedFileName,
  verdict,
}) {
  const isOverQuota = freeExportsLeft <= 0;
  const isReady = Boolean(file);
  const inputId = 'fitforpdf-file-input';
  const verdictNormalized = verdict ? String(verdict).toUpperCase() : '';

  return (
    <article data-testid="upload-card" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">{toolTitle}</h2>
            <p className="text-sm text-slate-500">{toolSubcopy}</p>
          </div>
          <span
            data-testid="quota-pill"
            className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm"
            aria-label="free exports remaining"
          >
            Free: {freeExportsLeft} exports left
          </span>
        </div>

        <UploadDropzone
          inputId={inputId}
          onFileSelect={onFileSelect}
          accept=".csv,.xlsx"
          disabled={isLoading}
        />

        {file ? (
          <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileCheck aria-hidden="true" className="h-4 w-4 text-[#D92D2A]" />
                <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
              </div>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={onRemoveFile}
              disabled={isLoading}
              className="!h-9 px-3 text-xs"
            >
              Remove
            </Button>
          </div>
        ) : null}

        <div className="space-y-3">
          <Toggle
            label="Branding"
            checked={includeBranding}
            disabled={!isReady || isLoading}
            onChange={onBrandingChange}
          />
          <Toggle
            label="Truncate long text"
            checked={truncateLongText}
            disabled={!isReady || isLoading}
            onChange={onTruncateChange}
          />
        </div>

        {isOverQuota ? (
          <Button
            variant="primary"
            href="/pricing"
            className="w-full"
          >
            Upgrade to continue
          </Button>
        ) : hasResultBlob ? (
          <Button
            type="button"
            variant="primary"
            className="w-full"
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
            disabled={!isReady || isLoading}
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

        {hasResultBlob && downloadedFileName ? (
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Downloaded: {downloadedFileName}</p>
            {verdictNormalized ? (
              <span className="inline-flex h-7 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 text-[11px] font-medium text-emerald-700">
                {verdictNormalized}
              </span>
            ) : null}
          </div>
        ) : null}

        <p className="text-xs text-slate-500">
          Files are deleted immediately after conversion. PDF available for 15 minutes.
        </p>
        {notice && <p className="text-sm text-slate-700">{notice}</p>}
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </form>
    </article>
  );
}
