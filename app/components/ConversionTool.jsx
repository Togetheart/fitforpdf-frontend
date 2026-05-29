'use client';

import React from 'react';
import useQuota from '../hooks/useQuota.mjs';
import useConversion from '../hooks/useConversion.mjs';
import UploadCard from './UploadCard';

/*
 * ConversionTool — the reusable conversion surface.
 *
 *   useQuota ─┐
 *             ├─▶ wires ~50 props ─▶ <UploadCard/>
 * useConversion┘
 *
 * Owns its own quota + conversion state, so it is a single-owner, drop-in
 * tool. Used by the /app Workbench. The landing (page.jsx) keeps its inline
 * wiring because it shares conversion state with the lead modal + hero CTAs;
 * migrating it onto this component is a separate, tested follow-up (T-task).
 */
export default function ConversionTool({ toolTitle, toolSubcopy, variant = 'dark', showInspector = false }) {
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

  return (
    <>
      {showInspector ? (
        <div data-testid="app-inspector" className="mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <label htmlFor="app-report-title" className="block text-xs font-semibold uppercase tracking-[0.06em] text-muted">
            Report title <span className="font-normal normal-case text-[var(--color-muted)]">(optional)</span>
          </label>
          <input
            id="app-report-title"
            type="text"
            value={conversion.reportTitle}
            onChange={(e) => conversion.setReportTitle(e.target.value)}
            placeholder="e.g. Acme Co. — Q4 2025 export"
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
                      'px-3 py-1.5 text-xs font-medium transition',
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
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--color-cta-bg)] px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Apply names & regenerate
                <span className="text-xs font-normal opacity-80">· uses 1 export</span>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
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
    </>
  );
}
