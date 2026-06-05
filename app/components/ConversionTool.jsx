'use client';

import React from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Code2, Download, FileText, FolderOpen, Layers3, Plus, RefreshCw, Upload } from 'lucide-react';
import useQuota from '../hooks/useQuota.mjs';
import useConversion from '../hooks/useConversion.mjs';
import useSession from '../hooks/useSession.mjs';
import UploadCard from './UploadCard';
import AccountMenu from './AccountMenu';
import { PAYG_PACKS } from '../siteCopy.mjs';

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

const WORKBENCH_CREDIT_PACKS = PAYG_PACKS.filter((pack) => pack.id !== 'single').slice(0, 2);

function StatusBadge({ tone, children }) {
  return (
    <span
      className={[
        'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.05em]',
        tone === 'live' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700',
      ].join(' ')}
    >
      {children}
    </span>
  );
}

function InspectorSection({ title, status, hint, children }) {
  return (
    <section className="border-b border-slate-200/70 pb-4">
      <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-slate-950">
        <span>{title}</span>
        <StatusBadge tone={status}>{status === 'live' ? 'Live' : 'Soon'}</StatusBadge>
      </div>
      {hint ? <p className="mb-3 text-[11.5px] leading-5 text-slate-400">{hint}</p> : null}
      {children}
    </section>
  );
}

// Reserved group label (matches the backend) naming columns pinned to every
// section. Real groups are the data sections (A, B, ...).
const FIXED_GROUP_LABEL = '__fixed__';
const groupOptionLabel = (l) => (l === FIXED_GROUP_LABEL ? 'Fixed (every section)' : `Group ${l}`);

/*
 * CustomGroupsControl — assign EVERY column to a group, then re-render.
 * Columns come from the render response: the per-section data columns
 * (conversion.renderedSections[].columns) PLUS the pinned/anchor columns
 * (conversion.renderedFrozenColumns), so nothing is hidden. Pinned columns
 * default to "Fixed" (repeated in every section); moving one into a real group
 * un-pins it. Reassigning rebuilds the columnGroups override (including the
 * reserved Fixed group) sent on the next "Update preview".
 */
function CustomGroupsControl({ conversion }) {
  const sections = Array.isArray(conversion.renderedSections) ? conversion.renderedSections : [];
  const frozenColumns = Array.isArray(conversion.renderedFrozenColumns) ? conversion.renderedFrozenColumns : [];
  const sectionColumns = sections.flatMap((s) => (Array.isArray(s.columns) ? s.columns : []));
  // Every column the user can place: section data columns + the pinned ones.
  const allColumns = [...new Set([...sectionColumns, ...frozenColumns])];

  if (allColumns.length === 0) {
    return (
      <p className="mt-1 text-[11.5px] leading-5 text-slate-400">
        Render with grouping (Auto or Always split) to assign columns to your own groups.
      </p>
    );
  }

  const frozenSet = new Set(frozenColumns);
  // Current assignment: column -> group label. From the override if set, else
  // from the rendered sections; pinned columns default to Fixed.
  const assignment = {};
  if (Array.isArray(conversion.columnGroupsOverride)) {
    for (const g of conversion.columnGroupsOverride) {
      for (const c of g.columns || []) assignment[c] = g.label;
    }
  } else {
    for (const s of sections) {
      for (const c of s.columns || []) assignment[c] = s.label;
    }
    for (const c of frozenColumns) assignment[c] = FIXED_GROUP_LABEL;
  }
  for (const c of allColumns) {
    if (!assignment[c]) assignment[c] = frozenSet.has(c) ? FIXED_GROUP_LABEL : (sections[0]?.label || 'A');
  }

  const labels = sections.map((s) => s.label);
  const nextLabel = String.fromCharCode(65 + labels.length); // allow one new group
  const options = [FIXED_GROUP_LABEL, ...labels, nextLabel];

  function reassign(column, label) {
    const next = { ...assignment, [column]: label };
    const byLabel = new Map();
    for (const c of allColumns) {
      const l = next[c];
      if (!byLabel.has(l)) byLabel.set(l, []);
      byLabel.get(l).push(c);
    }
    const groups = [...byLabel.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, columns]) => ({ label, columns }));
    conversion.setColumnGroupsOverride(groups);
  }

  return (
    <div data-testid="app-custom-groups" className="mt-2 flex flex-col gap-1.5">
      <p className="text-[11.5px] leading-5 text-slate-400">
        Move columns between groups, then update the preview. &ldquo;Fixed&rdquo; columns repeat in every section.
      </p>
      {allColumns.map((col) => (
        <div key={col} className="flex items-center gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-[12.5px] text-slate-700">
            <span className="truncate">{col}</span>
            {assignment[col] === FIXED_GROUP_LABEL ? (
              <span className="shrink-0 rounded bg-slate-100 px-1 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-slate-400">
                fixed
              </span>
            ) : null}
          </span>
          <select
            aria-label={`Group for ${col}`}
            value={assignment[col]}
            onChange={(e) => reassign(col, e.target.value)}
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-2 text-[12.5px] text-slate-950 outline-none focus:border-blue-600 lg:min-h-8"
          >
            {options.map((l) => (
              <option key={l} value={l}>{groupOptionLabel(l)}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export function ConversionInspector({ conversion, quota, className = '' }) {
  const isUnlimited = quota.planType === 'api_enterprise' || quota.isUnlimited === true;
  const exportsLeft = Number.isFinite(quota.freeExportsLeft)
    ? quota.freeExportsLeft
    : Number.isFinite(quota.freeExportsLimit)
      ? quota.freeExportsLimit
      : 3;
  const planLabel = isUnlimited ? 'Admin' : quota.planType === 'pro' ? 'Pro' : quota.planType === 'credits' ? 'Credits' : 'Free';
  const quotaLocked = Boolean(quota.isQuotaLocked);
  const quotaSummary = isUnlimited
    ? 'Admin - unlimited'
    : `${planLabel} - ${exportsLeft} exports left`;

  return (
    <aside
      aria-label="Conversion settings"
      data-testid="app-inspector"
      className={[
        'order-2 flex min-h-[620px] flex-col overflow-visible border-t border-slate-200 bg-white px-[18px] pt-[22px] lg:order-none lg:h-[calc(100vh-57px)] lg:overflow-hidden lg:border-l lg:border-t-0',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="shrink-0 bg-white pb-4">
        <h2 className="text-[15px] font-bold text-slate-950">Adjust output</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {conversion.pdfBlob
            ? 'Change anything, then update the preview. Re-render costs one export.'
            : 'Fine-tune the PDF before you download it.'}
        </p>
      </div>

      <div
        data-testid="app-inspector-options"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
      >
        {!conversion.pdfBlob ? (
          <div className="mb-5 rounded-[10px] border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-[12.5px] leading-5 text-slate-400">
            Unlocks after your first render.
            <br />
            Rename sections, regroup columns, add branding.
          </div>
        ) : null}

        <div className="flex flex-col gap-4 pb-4">
        <InspectorSection title="Report title" status="live">
          <input
            id="app-report-title"
            aria-label="Report title"
            type="text"
            value={conversion.reportTitle}
            onChange={(e) => conversion.setReportTitle(e.target.value)}
            placeholder="e.g. Acme Co. - Q4 2025 export"
            maxLength={200}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12.5px] text-slate-950 outline-none focus:border-blue-600"
          />
        </InspectorSection>

        <InspectorSection title="Column grouping" status="live" hint="How wide tables get split across pages.">
          <div data-testid="app-columnmap" className="flex overflow-hidden rounded-lg border border-slate-200">
            {[
              { v: 'off', label: 'Off' },
              { v: 'auto', label: 'Auto' },
              { v: 'force', label: 'Force' },
            ].map((opt, i) => {
              const active = conversion.columnMap === opt.v;
              return (
                <button
                  key={opt.v}
                  type="button"
                  aria-pressed={active}
                  onClick={() => conversion.setColumnMap(opt.v)}
                  className={[
                    'min-h-11 flex-1 px-2 py-1.5 text-xs transition lg:min-h-9',
                    i > 0 ? 'border-l border-slate-200' : '',
                    active ? 'bg-blue-50 font-semibold text-blue-600' : 'bg-white text-slate-500 hover:text-slate-950',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {Array.isArray(conversion.renderedSections) && conversion.renderedSections.length > 0 ? (
            <div data-testid="app-group-pills" className="mt-2 flex flex-wrap gap-1.5">
              {conversion.renderedSections.map((s, i) => (
                <span
                  key={s.label}
                  className={[
                    'rounded-full px-2.5 py-1 text-[11px] font-semibold text-white',
                    ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-violet-600'][i % 4],
                  ].join(' ')}
                >
                  Group {s.label}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-slate-950">
            <span>Custom groups</span>
            <StatusBadge tone="live">Live</StatusBadge>
          </div>
          <CustomGroupsControl conversion={conversion} />
        </InspectorSection>

        <InspectorSection title="Section names" status="live" hint={conversion.pdfBlob ? 'Rename the auto-generated titles, then update preview.' : 'Available after the first render.'}>
          {Array.isArray(conversion.renderedSections) && conversion.renderedSections.length > 0 ? (
            <div data-testid="app-section-rename" className="flex flex-col gap-2">
              {conversion.renderedSections.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="cursor-grab text-sm leading-none text-slate-300">::</span>
                  <input
                    type="text"
                    // Controlled: bound to the override (falling back to the
                    // current title) so the field always reflects state and
                    // never goes stale across regenerates.
                    value={conversion.sectionTitleOverrides[s.label] ?? s.title}
                    maxLength={80}
                    onChange={(e) =>
                      conversion.setSectionTitleOverrides((cur) => ({ ...cur, [s.label]: e.target.value }))
                    }
                    className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] text-slate-950 outline-none focus:border-blue-600 lg:min-h-9"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 opacity-55">
              {['Customer info', 'Orders'].map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-sm leading-none text-slate-300">::</span>
                  <input
                    type="text"
                    value={name}
                    disabled
                    readOnly
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] text-slate-950"
                  />
                </div>
              ))}
            </div>
          )}
        </InspectorSection>

        <InspectorSection title="Branding" status="live" hint="Title, accent color, logo & footer for paid exports.">
          <label htmlFor="app-accent-color" className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-slate-950">
            <span>Accent color</span>
          </label>
          <div className="mb-3 flex items-center gap-2">
            <input
              id="app-accent-color"
              type="color"
              aria-label="Accent color"
              value={/^#[0-9a-fA-F]{6}$/.test(conversion.accentColor) ? conversion.accentColor : '#2563EB'}
              onChange={(e) => conversion.setAccentColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-slate-200 bg-white"
            />
            <span className="text-[12px] text-slate-500">{conversion.accentColor || 'Default'}</span>
            {conversion.accentColor ? (
              <button type="button" onClick={() => conversion.setAccentColor('')} className="ml-auto text-[11.5px] text-blue-600">Reset</button>
            ) : null}
          </div>
          <div className="mb-2 text-[13px] font-semibold text-slate-950">Logo</div>
          <div className="mb-3">
            <input
              type="file"
              aria-label="Logo image (PNG or JPG)"
              accept="image/png,image/jpeg"
              onChange={(e) => conversion.setLogoFile(e.target.files?.[0] || null)}
              className="block w-full text-[12px] text-slate-600 file:mr-2 file:min-h-9 file:rounded-lg file:border file:border-slate-200 file:bg-white file:px-3 file:text-[12px] file:font-semibold file:text-slate-700"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              {conversion.logoFile ? `Selected: ${conversion.logoFile.name}` : 'PNG or JPG, up to 256 KB.'}
            </p>
          </div>
          <label htmlFor="app-footer-text" className="mb-2 block text-[13px] font-semibold text-slate-950">Footer text</label>
          <input
            id="app-footer-text"
            type="text"
            aria-label="Footer text"
            value={conversion.footerText}
            maxLength={120}
            onChange={(event) => conversion.setFooterText(event.target.value)}
            placeholder="Confidential - internal use"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12.5px] text-slate-950 outline-none focus:border-blue-600"
          />
          <p className="mt-2 text-[11px] text-slate-400">Branding applies to paid exports.</p>
        </InspectorSection>
      </div>
      </div>

      <div
        data-testid="app-inspector-actions"
        className="sticky bottom-0 z-10 -mx-[18px] mt-auto shrink-0 border-t border-slate-200 bg-white px-[18px] pb-[18px] pt-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)]"
      >
        <button
          type="button"
          onClick={() => conversion.handleSubmit({ preventDefault: () => {} })}
          disabled={conversion.isLoading || !conversion.file || quotaLocked}
          className="mb-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-blue-600 bg-white px-3 py-2 text-[13.5px] font-bold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Update preview
          <span className="text-[10px] font-medium text-slate-400">- re-renders on click</span>
        </button>
        {quotaLocked ? (
          <p data-testid="app-inspector-quota-lock" className="mb-2 text-center text-[11.5px] text-amber-700">
            No exports left. <a href="/pricing" className="font-semibold text-blue-600">Buy credits</a> to re-render.
          </p>
        ) : null}
        <button
          type="button"
          onClick={conversion.handleDownloadAnyway}
          disabled={!conversion.pdfBlob || conversion.isLoading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-blue-600 px-3 py-3 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.28)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download PDF
        </button>
        <button
          type="button"
          onClick={conversion.handleRenderAnother}
          className="mt-1 min-h-10 w-full rounded-lg bg-transparent px-3 py-2 text-[13px] font-medium text-slate-500 transition hover:text-slate-950"
        >
          Render another file
        </button>
        {/* When quota is locked, the amber "No exports left · Buy credits" line above
            already states the plan status + pricing CTA — so we drop this duplicate. */}
        {!quotaLocked ? (
          <div className="mt-1 text-center text-[11.5px] text-slate-400">
            {quotaSummary} - <a href="/pricing" className="text-blue-600">View pricing</a>
          </div>
        ) : null}
      </div>
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
      className="order-3 hidden flex-col overflow-hidden bg-slate-950 px-3.5 py-[18px] text-white lg:order-none lg:flex lg:h-[calc(100vh-57px)]"
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
          <div className="px-3 py-2 text-[12.5px] leading-5 text-slate-500">
            No exports yet. Drop a spreadsheet to start.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={conversion.handleRenderAnother}
        className="mt-3 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 px-3 text-[13px] font-medium text-slate-300 transition hover:border-white/30 hover:text-white"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        New export
      </button>

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
      {!conversion.pdfBlob ? (
        <div className="mt-auto flex items-center gap-2 px-2 pb-1 pt-3 text-[11px] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
          Processed ephemerally - never stored
        </div>
      ) : null}
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
      retainSourceConsent={conversion.retainSourceConsent}
      onRetainConsentChange={conversion.setRetainSourceConsent}
      contactsConsent={conversion.contactsConsent}
      onContactsConsentChange={conversion.setContactsConsent}
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

function WorkbenchQuotaPaywall({ conversion }) {
  return (
    <div
      role="alert"
      data-testid="workbench-quota-paywall"
      className="mt-5 w-full max-w-[560px] rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-left"
    >
      <div className="flex gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-amber-950">You've used your free exports.</p>
          <p className="mt-1 text-[12.5px] leading-5 text-amber-900/80">
            Buy credits to generate this PDF. Your selected file stays ready.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {WORKBENCH_CREDIT_PACKS.map((pack) => (
              <button
                key={pack.stripePackId}
                type="button"
                disabled={conversion.isLoading}
                onClick={(event) => {
                  event.stopPropagation();
                  conversion.handleBuyCreditsPack(pack.stripePackId);
                }}
                className="min-h-10 rounded-lg bg-slate-950 px-3 text-[12.5px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pack.actionLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkbenchDropzone({ conversion, quota }) {
  const inputRef = React.useRef(null);
  const hasFile = Boolean(conversion.file);
  const isQuotaLocked = Boolean(quota?.isQuotaLocked);

  const selectFile = (nextFile) => {
    if (!nextFile || conversion.isLoading) return;
    conversion.handleFileSelect(nextFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    selectFile(event.dataTransfer?.files?.[0]);
  };

  const openPicker = () => {
    if (!conversion.isLoading) inputRef.current?.click();
  };

  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-3.5 shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
      <div
        data-testid="generate-dropzone"
        role="button"
        tabIndex={conversion.isLoading ? -1 : 0}
        aria-label="Upload CSV or XLSX file"
        onClick={() => {
          if (!hasFile) openPicker();
        }}
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          openPicker();
        }}
        className="flex min-h-[356px] cursor-pointer flex-col items-center justify-center rounded-[11px] border-2 border-dashed border-blue-600 bg-slate-50/20 px-6 py-12 text-center transition hover:bg-blue-50/30"
      >
        <Upload className="mb-4 h-[50px] w-[50px] text-blue-600" strokeWidth={1.6} aria-hidden="true" />
        <h2 className="max-w-[320px] text-[18px] font-semibold leading-tight text-slate-950">
          {conversion.file ? conversion.file.name : 'Drop your Excel or CSV here'}
        </h2>
        <p className="mt-2 text-[13.5px] text-slate-500">.xlsx, .xls, .csv - up to 20 MB</p>
        <div className="my-[18px] text-[12.5px] text-slate-400">{hasFile ? 'ready' : 'or'}</div>
        {hasFile ? (
          <>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (isQuotaLocked) return;
                  void conversion.handleSubmit({ preventDefault: () => {} });
                }}
                disabled={conversion.isLoading || isQuotaLocked}
                className="min-h-11 rounded-[10px] bg-blue-600 px-7 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {conversion.isLoading ? 'Generating...' : 'Generate PDF'}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openPicker();
                }}
                disabled={conversion.isLoading}
                className="min-h-11 rounded-[10px] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Change file
              </button>
            </div>
            {isQuotaLocked ? <WorkbenchQuotaPaywall conversion={conversion} /> : null}
          </>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openPicker();
            }}
            disabled={conversion.isLoading}
            className="min-h-11 rounded-[10px] bg-blue-600 px-7 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Browse files
          </button>
        )}
        <div className="mt-[22px] flex flex-wrap justify-center gap-x-[18px] gap-y-2 text-xs font-medium text-slate-500">
          {['No storage', 'No LLM in the data path', 'EU-hosted'].map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
      <input
        ref={inputRef}
        id="fitforpdf-file-input"
        data-testid="generate-file-input"
        type="file"
        accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        disabled={conversion.isLoading}
        onChange={(event) => selectFile(event.target.files?.[0])}
      />
    </div>
  );
}

function WorkbenchSampleCard({ conversion }) {
  return (
    <aside className="flex min-h-[356px] flex-col rounded-[12px] border border-slate-200 bg-white p-[18px] shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
      <h2 className="text-[13px] font-semibold text-slate-950">New here?</h2>
      <p className="mb-3 mt-1 text-xs leading-5 text-slate-500">See a render before uploading your own file.</p>
      <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-[1.8] text-slate-600">
        <span className="text-slate-400">id,name,region,plan,mrr...</span>
        <br />
        1,Northwind,EU,Pro,840
        <br />
        2,Acme,US,Team,1240
        <br />
        3,Globex,EU,Pro,520
        <br />
        4,Initech,APAC,Free,0
      </div>
      <button
        type="button"
        onClick={conversion.handleTrySample}
        disabled={conversion.isLoading}
        className="mt-3 inline-flex min-h-10 items-center gap-1.5 self-start text-[12.5px] font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        See an example
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </aside>
  );
}

function WorkbenchEmptyCanvas({ conversion, quota }) {
  return (
    <>
      <div className="mb-[22px] max-w-[600px]">
        <h1 className="text-[25px] font-bold tracking-tight text-slate-950">
          Turn a messy export into a <span className="font-serif italic font-normal">readable</span> PDF
        </h1>
        <p className="mt-[7px] max-w-[62ch] text-[14.5px] leading-[1.5] text-slate-500">
          Drop a wide Excel or CSV. We split wide tables into sections, repeat the anchor columns,
          and build a clean table of contents - no cut-off columns.
        </p>
      </div>
      <div className="grid gap-[18px] xl:grid-cols-[minmax(0,1fr)_250px]">
        <WorkbenchDropzone conversion={conversion} quota={quota} />
        <WorkbenchSampleCard conversion={conversion} />
      </div>
    </>
  );
}

function WorkbenchRenderedCanvas({ conversion }) {
  return (
    <>
      <div className="mb-[18px] flex max-w-[620px] items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-4 py-3 shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
        <FileText className="h-5 w-5 text-slate-400" aria-hidden="true" />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold text-slate-950">
            {conversion.file?.name || conversion.resolvedPdfFilename}
          </p>
          <p className="text-xs text-slate-500">Preview ready. Adjust output, then update preview.</p>
        </div>
        <button
          type="button"
          onClick={conversion.handleRenderAnother}
          className="ml-auto inline-flex min-h-11 shrink-0 items-center px-1 text-[12.5px] font-semibold text-blue-600 lg:min-h-0"
        >
          Change file
        </button>
      </div>
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500">
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        Preview
        <span className="ml-1 inline-flex items-center gap-1 text-[13.5px] normal-case tracking-normal text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden="true" />
          Ready
        </span>
      </div>
      <PdfPreviewPane pdfBlob={conversion.pdfBlob} filename={conversion.resolvedPdfFilename} />
    </>
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
    return null;
  }

  const safeFilename = filename || 'report.pdf';
  return (
    <div className="mt-5 max-w-[620px] overflow-hidden rounded-[9px] border border-slate-200 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-2">
        <p className="truncate text-sm font-semibold text-slate-800">Preview: {safeFilename}</p>
        <span className="text-xs font-medium text-slate-500">PDF</span>
      </div>
      {/* Inline embed on desktop. Mobile browsers (esp. iOS Safari) render an
          empty <object> box, so on small screens we show an explicit open/
          download CTA instead of a blank pane. */}
      <object
        aria-label={`PDF preview: ${safeFilename}`}
        data-testid="app-pdf-preview"
        data={previewUrl}
        title={`PDF preview: ${safeFilename}`}
        type="application/pdf"
        className="hidden h-[560px] w-full bg-white lg:block"
      >
        <div className="p-5 text-sm text-slate-600">
          PDF preview is not available in this browser. Use Download PDF to open it.
        </div>
      </object>
      <div data-testid="app-pdf-preview-mobile" className="flex flex-col items-center gap-3 px-5 py-8 text-center lg:hidden">
        <p className="text-sm text-slate-600">Your PDF is ready. Open it to review on your device.</p>
        <a
          href={previewUrl}
          download={safeFilename}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-blue-600 px-5 py-2.5 text-sm font-bold text-white"
        >
          Open PDF
        </a>
      </div>
    </div>
  );
}

function AppToolbar({ conversion, quota, session }) {
  const isUnlimited = quota.planType === 'api_enterprise' || quota.isUnlimited === true;
  const exportsLeft = Number.isFinite(quota.freeExportsLeft)
    ? quota.freeExportsLeft
    : Number.isFinite(quota.freeExportsLimit)
      ? quota.freeExportsLimit
      : 3;
  const quotaLabel = isUnlimited ? 'Admin - unlimited' : `Free - ${exportsLeft} left`;
  const crumb = conversion.file?.name || (conversion.pdfBlob ? conversion.resolvedPdfFilename : 'New export');

  return (
    <header
      data-testid="app-toolbar"
      className="flex h-[57px] items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-[22px]"
    >
      <a href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-slate-950">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        fitforpdf.com
      </a>
      <div className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden="true" />
      <div className="text-base font-black tracking-tight text-slate-950">FitForPDF</div>
      <div data-testid="app-crumb" className="min-w-0 truncate text-[13.5px] text-slate-500">
        <span className="font-serif italic text-[15px] text-slate-950">{crumb}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <a
          href="/developers"
          className="hidden min-h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-[13px] font-semibold text-slate-950 transition hover:border-slate-950 hover:bg-slate-50 sm:inline-flex"
        >
          <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
          Use the API
        </a>
        <span data-testid="app-quota" className="rounded-full bg-[#F1F0ED] px-3 py-1.5 text-xs font-semibold text-slate-500">
          {quotaLabel}
        </span>
        <AccountMenu account={session?.account || null} onLogout={session?.logout || (() => {})} />
      </div>
    </header>
  );
}

export default function ConversionTool({ toolTitle, toolSubcopy, variant = 'dark', showInspector = false, layout = 'inline' }) {
  const quota = useQuota();
  const conversion = useConversion({ quota });
  const session = useSession();

  const resolvedSubcopy = (() => {
    if (toolSubcopy) return toolSubcopy;
    if (quota.planType === 'api_enterprise' || quota.isUnlimited === true) {
      return 'Admin account. Unlimited test exports.';
    }
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
      <>
        <AppToolbar conversion={conversion} quota={quota} session={session} />
        <div
          data-testid="tool"
          className="grid min-h-[calc(100vh-57px)] grid-cols-1 overflow-visible lg:h-[calc(100vh-57px)] lg:grid-cols-[264px_minmax(0,1fr)_320px] lg:overflow-hidden"
        >
          <WorkbenchRail conversion={conversion} />

          <section
            aria-label="Upload and PDF workspace"
            data-testid="app-canvas"
            className="order-1 min-w-0 px-4 py-6 sm:px-8 sm:py-[30px] lg:order-none lg:h-[calc(100vh-57px)] lg:overflow-y-auto"
          >
            {conversion.pdfBlob ? (
              <WorkbenchRenderedCanvas conversion={conversion} />
            ) : (
              <WorkbenchEmptyCanvas conversion={conversion} quota={quota} />
            )}
            <div className="mt-6 flex items-center gap-2 text-[12.5px] text-slate-500">
              <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
              Need this every week? <a href="/developers" className="font-semibold text-blue-600">Automate it with the API</a>
            </div>
          </section>

          <ConversionInspector conversion={conversion} quota={quota} />
        </div>
      </>
    );
  }

  return (
    <>
      {showInspector ? <ConversionInspector conversion={conversion} quota={quota} className="mb-5 min-h-0 rounded-xl border border-slate-200" /> : null}
      {uploadSurface}
    </>
  );
}
