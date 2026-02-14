import React from 'react';

const inputId = 'fitforpdf-file';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function ToggleSwitch({ checked, label, onChange, disabled }) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
          checked ? 'bg-[#D92D2A]' : 'bg-slate-300'
        } ${disabled ? 'opacity-55' : ''}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  );
}

export default function GenerateModule({
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
}) {
  const isOverQuota = freeExportsLeft <= 0;
  const isReady = Boolean(file);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">{toolTitle}</h2>
            <p className="text-sm text-slate-500">{toolSubcopy}</p>
          </div>
          <span className="inline-flex h-9 items-center rounded-full border border-slate-200 px-4 text-sm text-slate-700">
            Free. {freeExportsLeft} exports left
          </span>
        </div>

        <div
          className="rounded-xl border border-dashed border-slate-300 bg-gray-50 px-6 py-8 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const dropped = event.dataTransfer.files?.[0];
            if (dropped) onFileSelect(dropped);
          }}
        >
          <div className="mx-auto flex w-fit rounded-full border border-black/10 bg-white p-2">
            <svg aria-hidden="true" className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v11m0 0 3-3m-3 3-3-3M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-700">Drop CSV or XLSX here</p>
          <label htmlFor={inputId} className="mt-3 inline-flex text-sm font-medium text-[#D92D2A]">
            <span>or choose a file</span>
          </label>
          <input
            id={inputId}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            data-testid="generate-file-input"
            onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
          />
        </div>

        {file ? (
          <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              disabled={isLoading}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ) : null}

        <div className="space-y-3">
          <ToggleSwitch
            label="Branding"
            checked={includeBranding}
            disabled={!isReady || isLoading}
            onChange={onBrandingChange}
          />
          <ToggleSwitch
            label="Truncate long text"
            checked={truncateLongText}
            disabled={!isReady || isLoading}
            onChange={onTruncateChange}
          />
        </div>
        <p className="text-xs text-slate-500">Truncation is optional to reduce payload.</p>

        {isOverQuota ? (
          <a
            href="/pricing"
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#D92D2A] px-7 text-sm font-semibold text-white hover:bg-[#b92524] transition"
          >
            Upgrade to continue
          </a>
        ) : hasResultBlob ? (
          <button
            type="button"
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#D92D2A] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b92524] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onDownloadAgain}
            disabled={isLoading}
          >
            Download again
          </button>
        ) : (
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#D92D2A] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b92524] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isReady || isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating…
              </>
            ) : (
              'Generate PDF'
            )}
          </button>
        )}

        {hasResultBlob && <p className="text-sm font-medium text-emerald-700">Download ready.</p>}

        <p className="text-xs text-slate-500">
          Files are deleted immediately after conversion. PDF available for 15 minutes.
        </p>
        {notice && <p className="text-sm text-slate-700">{notice}</p>}
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </form>
    </article>
  );
}
