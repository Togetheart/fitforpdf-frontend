'use client';

import React from 'react';
import { FileText, FolderOpen, Layers3, Settings2 } from 'lucide-react';
import useQuota from '../hooks/useQuota.mjs';
import useConversion from '../hooks/useConversion.mjs';
import UploadCard from './UploadCard';

/*
 * ConversionTool - the reusable conversion surface.
 *
 *   useQuota -\
 *             +-> wires ~50 props -> <UploadCard/>
 * useConversion-/
 *
 * Owns its own quota + conversion state, so it is a single-owner, drop-in
 * tool. Used by the /app Workbench. The landing (page.jsx) keeps its inline
 * wiring because it shares conversion state with the lead modal + hero CTAs;
 * migrating it onto this component is a separate, tested follow-up (T-task).
 */

function ConversionInspector({ conversion, className = '' }) {
  return (
    <aside
      aria-label="Conversion settings"
      data-testid="app-inspector"
      className={[
        'rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-900/5 backdrop-blur',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="mb-4 flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-950">Controls</h2>
      </div>

      <label htmlFor="app-report-title" className="block text-xs font-semibold uppercase tracking-[0.06em] text-muted">
        Report title <span className="font-normal normal-case text-[var(--color-muted)]">(optional)</span>
      </label>
      <input
        id="app-report-title"
        type="text"
        value={conversion.reportTitle}
        onChange={(e) => conversion.setReportTitle(e.target.value)}
        placeholder="e.g. Acme Co. - Q4 2025 export"
        maxLength={200}
        className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-cta-bg)]"
      />
      <p className="mt-2 text-xs text-muted">Appears as the title of your PDF. Leave blank to use the file name.</p>

      <div className="mt-4">
        <span className="block text-xs font-semibold uppercase tracking-[0.06em] text-muted">Column grouping</span>
        <div data-testid="app-columnmap" className="mt-2 inline-flex overflow-hidden rounded-lg border border-[var(--color-border)]">
          {[
            { v: 'auto', label: 'Auto' },
            { v: 'force', label: 'Always split' },
            { v: 'off', label: 'Off' },
          ].map((opt, i) => {
            const active = conversion.columnMap === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                aria-pressed={active}
                onClick={() => conversion.setColumnMap(opt.v)}
                className={[
                  'min-h-10 px-3 py-1.5 text-xs font-medium transition',
                  i > 0 ? 'border-l border-[var(--color-border)]' : '',
                  active ? 'bg-[var(--color-cta-bg)] text-white' : 'bg-[var(--color-bg)] text-muted hover:text-[var(--color-text)]',
                ].join(' ')}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">How wide tables are split across pages. Auto decides for you.</p>
      </div>

      {Array.isArray(conversion.renderedSections) && conversion.renderedSections.length > 0 ? (
        <div data-testid="app-section-rename" className="mt-4 border-t border-[var(--color-border)] pt-4">
          <span className="block text-xs font-semibold uppercase tracking-[0.06em] text-muted">Section names</span>
          <p className="mt-1 text-xs text-muted">Rename the auto-generated sections, then regenerate.</p>
          <div className="mt-2 flex flex-col gap-2">
            {conversion.renderedSections.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted">{s.label}</span>
                <input
                  type="text"
                  defaultValue={conversion.sectionTitleOverrides[s.label] ?? s.title}
                  maxLength={80}
                  onChange={(e) =>
                    conversion.setSectionTitleOverrides((cur) => ({ ...cur, [s.label]: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-cta-bg)]"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => conversion.handleSubmit()}
            disabled={conversion.isLoading}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--color-cta-bg)] px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Apply names & regenerate
            <span className="text-xs font-normal opacity-80">· uses 1 export</span>
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function WorkbenchRail({ conversion }) {
  const recentExports = Array.isArray(conversion.exportHistory) ? conversion.exportHistory.slice(0, 4) : [];
  const sections = Array.isArray(conversion.renderedSections) ? conversion.renderedSections : [];

  return (
    <aside
      aria-label="Recent exports and sections"
      data-testid="app-left-rail"
      className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-white shadow-sm shadow-slate-900/10 lg:min-h-[calc(100vh-6.5rem)]"
    >
      <div className="flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold">Recent exports</h2>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        PDF artifacts only. Source spreadsheets are not stored.
      </p>

      <div className="mt-4 space-y-2">
        {recentExports.length > 0 ? (
          recentExports.map((item) => (
            <a
              key={item.id || item.supportId || item.createdAt}
              href={item.pdfUrl || '#'}
              className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs transition hover:bg-white/10"
            >
              <span className="block truncate font-semibold text-white">{item.sourceFileName || item.supportId || 'Export'}</span>
              <span className="mt-1 block text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent render'}</span>
            </a>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-white/15 px-3 py-3 text-xs text-slate-400">
            No exports yet.
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold">Sections</h2>
        </div>
        <div className="mt-3 space-y-2">
          {sections.length > 0 ? (
            sections.map((section) => (
              <div key={section.label} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-white/10 font-semibold text-white">
                  {section.label}
                </span>
                <span className="truncate">{section.title}</span>
              </div>
            ))
          ) : (
            <p className="text-xs leading-5 text-slate-400">Sections appear after the first render.</p>
          )}
        </div>
      </div>
    </aside>
  );
}

function UploadSurface({ conversion, quota, toolTitle, resolvedSubcopy, variant }) {
  return (
    <UploadCard
      toolTitle={toolTitle}
      toolSubcopy={resolvedSubcopy}
      file={conversion.file}
      freeExportsLeft={quota.freeExportsLeft}
      includeBranding={conversion.includeBranding}
      truncateLongText={conversion.truncateLongText}
      isLoading={conversion.isLoading}
      notice={conversion.notice}
      error={conversion.error}
      hasResultBlob={Boolean(conversion.pdfBlob)}
      onFileSelect={(nextFile) => conversion.handleFileSelect(nextFile)}
      onRemoveFile={conversion.handleRemoveFile}
      onBrandingChange={conversion.setIncludeBranding}
      onTruncateChange={conversion.setTruncateLongText}
      onSubmit={conversion.handleSubmit}
      onDownloadAgain={conversion.handleDownloadAnyway}
      onCopyShareLink={conversion.handleCopyShareLink}
      onTrySample={conversion.handleTrySample}
      downloadedFileName={Boolean(conversion.pdfBlob) ? conversion.resolvedPdfFilename : null}
      verdict={conversion.renderVerdict}
      conversionProgress={conversion.conversionProgress}
      onBuyCredits={quota.openBuyCreditsPanel}
      isPro={quota.planType === 'pro'}
      showBuyCreditsForTwo={false}
      isQuotaLocked={quota.isQuotaLocked}
      planType={quota.planType}
      remainingInPeriod={quota.remainingInPeriod}
      usedInPeriod={quota.usedInPeriod}
      periodLimit={quota.periodLimit}
      paywallReason={quota.paywallReason}
      onBuyCreditsPack={conversion.handleBuyCreditsPack}
      showBuyCreditsPanel={quota.showBuyCreditsPanel}
      onCloseBuyPanel={quota.closeBuyCreditsPanel}
      purchaseMessage={quota.purchaseMessage}
      onGoPro={conversion.handleGoProCheckout}
      onLayoutChange={conversion.handleLayoutChange}
      layout={conversion.layout}
      exportHistory={conversion.exportHistory}
      isHistoryLoading={conversion.isHistoryLoading}
      historyError={conversion.historyError}
      historyStatus={conversion.historyStatus}
      onHistoryStatusChange={conversion.onHistoryStatusChange}
      hasMoreHistory={conversion.hasMoreHistory}
      onLoadMoreHistory={conversion.loadMoreExportHistory}
      onRefreshHistory={conversion.refreshExportHistory}
      renderId={conversion.renderId}
      shareState={conversion.shareState}
      variant={variant}
      failKind={conversion.failKind}
      failureRecommendations={conversion.failureRecommendations}
      pageBurdenCopy={conversion.pageBurdenCopy}
      onRetryCompact={conversion.handleGenerateCompact}
      compactSuggestion={conversion.compactSuggestion}
      wasDemoLastUpload={conversion.wasDemoLastUpload}
      onTryYourFile={conversion.handleSwitchToRealUpload}
      onRenderAnother={conversion.handleRenderAnother}
      onPostRenderPricingClick={conversion.handlePostRenderPricingClick}
      onPostRenderContactClick={conversion.handlePostRenderContactClick}
      confidence={conversion.confidence}
      debugMetrics={conversion.debugMetrics}
    />
  );
}

function PdfPreviewPane({ pdfBlob, filename }) {
  const [previewUrl, setPreviewUrl] = React.useState(null);

  React.useEffect(() => {
    if (!pdfBlob || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      setPreviewUrl(null);
      return undefined;
    }

    const nextUrl = URL.createObjectURL(pdfBlob);
    setPreviewUrl(nextUrl);
    return () => {
      if (typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(nextUrl);
      }
    };
  }, [pdfBlob]);

  if (!previewUrl) {
    return (
      <div
        data-testid="app-pdf-preview-empty"
        className="mt-5 flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center"
      >
        <div>
          <p className="text-sm font-semibold text-slate-800">PDF preview appears here after render.</p>
          <p className="mt-1 text-xs text-slate-500">Configure once, generate once, then inspect before downloading.</p>
        </div>
      </div>
    );
  }

  const safeFilename = filename || 'report.pdf';
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-2">
        <p className="truncate text-sm font-semibold text-slate-800">Preview: {safeFilename}</p>
        <span className="text-xs font-medium text-slate-500">PDF</span>
      </div>
      <object
        aria-label={`PDF preview: ${safeFilename}`}
        data-testid="app-pdf-preview"
        data={previewUrl}
        title={`PDF preview: ${safeFilename}`}
        type="application/pdf"
        className="h-[520px] w-full bg-white"
      >
        <div className="p-5 text-sm text-slate-600">
          PDF preview is not available in this browser. Use Download PDF to open it.
        </div>
      </object>
    </div>
  );
}

export default function ConversionTool({ toolTitle, toolSubcopy, variant = 'dark', showInspector = false, layout = 'inline' }) {
  const quota = useQuota();
  const conversion = useConversion({ quota });

  const resolvedSubcopy = (() => {
    if (toolSubcopy) return toolSubcopy;
    if (quota.planType === 'credits') {
      const count = Number.isFinite(quota.freeExportsLeft) ? quota.freeExportsLeft : 0;
      if (count <= 0) return 'No exports left. Get more to continue.';
      return `${count} purchased export${count === 1 ? '' : 's'} remaining.`;
    }
    if (quota.planType === 'pro') return 'Pro plan. 500 exports/month.';
    const count = Number.isFinite(quota.freeExportsLeft)
      ? quota.freeExportsLeft
      : Number.isFinite(quota.freeExportsLimit)
        ? quota.freeExportsLimit
        : 3;
    return `${count} free export${count === 1 ? '' : 's'}. No account required.`;
  })();

  const uploadSurface = (
    <UploadSurface
      conversion={conversion}
      quota={quota}
      toolTitle={toolTitle}
      resolvedSubcopy={resolvedSubcopy}
      variant={variant}
    />
  );

  if (layout === 'workbench') {
    return (
      <div
        data-testid="tool"
        className="grid min-h-[calc(100vh-3.5rem)] gap-4 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)_320px] lg:px-5"
      >
        <WorkbenchRail conversion={conversion} />

        <section
          aria-label="Upload and PDF workspace"
          data-testid="app-canvas"
          className="min-w-0 rounded-xl border border-slate-200 bg-white/75 p-4 shadow-sm shadow-slate-900/5 backdrop-blur sm:p-6"
        >
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Configure - Generate - View
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Turn a messy export into a readable PDF
              </h1>
              <p className="mt-2 max-w-[62ch] text-sm leading-6 text-slate-600">
                Drop a wide Excel or CSV. Wide tables get split into sections,
                anchor columns repeat, and you get a clean table of contents.
              </p>
            </div>
          </div>

          {uploadSurface}
          <PdfPreviewPane pdfBlob={conversion.pdfBlob} filename={conversion.resolvedPdfFilename} />
        </section>

        <ConversionInspector conversion={conversion} className="lg:sticky lg:top-[4.5rem] lg:self-start" />
      </div>
    );
  }

  return (
    <>
      {showInspector ? <ConversionInspector conversion={conversion} className="mb-5" /> : null}
      {uploadSurface}
    </>
  );
}
