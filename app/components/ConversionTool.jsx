'use client';

import React from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Code2, Download, FileText, Layers3, PanelLeft, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Plus, RefreshCw, SlidersHorizontal, Upload, X } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import useQuota from '../hooks/useQuota.mjs';
import useConversion from '../hooks/useConversion.mjs';
import useSession from '../hooks/useSession.mjs';
import useIsDesktop from '../hooks/useIsDesktop.mjs';
import UploadCard from './UploadCard';
import AccountMenu from './AccountMenu';
import AnimatedLogo from './AnimatedLogo';
import ThemeToggle from './ThemeToggle';
import PlanBadge from './ui/PlanBadge';
import { PAYG_PACKS } from '../siteCopy.mjs';
import { recommendationLabel, sectionColorClasses, SECTION_COLOR_HEXES } from '../pageUiLogic.mjs';
import { renderPdfFirstPageImage } from '../lib/pdfPreviewImage.mjs';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// One labelled block in the inspector. The old per-section "Live"/"Soon" status
// pills were dropped — when every control is live, the badge is pure noise.
function InspectorSection({ title, hint, children }) {
  return (
    <section className="border-b border-[var(--color-line)] pb-5">
      <div className="mb-1.5 text-[var(--color-text)]">
        <span className="font-serif text-[14.5px] font-bold tracking-[-0.01em]">{title}</span>
      </div>
      {hint ? <p className="mb-3 text-[11.5px] leading-5 text-[var(--color-text-subtle)]">{hint}</p> : null}
      {children}
    </section>
  );
}

// PanelTabs — a small, accessible segmented control used at the top of each
// workbench side panel to group its controls (mirrors the Off/Auto toggle for
// the light inspector; a subtle white/10 highlight for the dark rail).
//
// tabs:  [{ id, label }]
// value: the active tab id; onChange(id) is called on click / arrow-key nav.
// tone:  'light' (inspector) | 'dark' (rail) — themes the active highlight.
// ariaLabel: names the tablist for screen readers + tests.
//
// role="tablist" with role="tab" buttons + aria-selected; Left/Right arrow keys
// move focus + activate the previous/next tab (wrapping at the ends).
function PanelTabs({ tabs, value, onChange, tone = 'light', ariaLabel }) {
  const refs = React.useRef([]);
  const index = Math.max(0, tabs.findIndex((t) => t.id === value));

  const focusTab = (i) => {
    const tab = tabs[i];
    if (!tab) return;
    onChange(tab.id);
    const node = refs.current[i];
    if (node && typeof node.focus === 'function') node.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusTab((index + 1) % tabs.length);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusTab((index - 1 + tabs.length) % tabs.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusTab(tabs.length - 1);
    }
  };

  const isDark = tone === 'dark';
  const wrapClass = isDark
    ? 'flex overflow-hidden rounded-lg border border-white/10 bg-white/5 p-0.5'
    : 'flex overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-sunken)] p-0.5';

  return (
    <div role="tablist" aria-label={ariaLabel} onKeyDown={handleKeyDown} className={wrapClass}>
      {tabs.map((tab, i) => {
        const active = tab.id === value;
        const tabClass = isDark
          ? [
              'min-h-9 flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition lg:min-h-8',
              active ? 'bg-white/10 font-semibold text-white' : 'bg-transparent text-[var(--color-text-subtle)] hover:text-white',
            ].join(' ')
          : [
              'min-h-9 flex-1 rounded-md px-2 py-1.5 text-xs transition lg:min-h-8',
              active ? 'bg-[var(--color-surface)] font-semibold text-[var(--color-text)] shadow-sm' : 'bg-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]',
            ].join(' ');
        return (
          <button
            key={tab.id}
            ref={(node) => { refs.current[i] = node; }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={tabClass}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// Reserved target value for pinned columns repeated in every section.
const FIXED_TARGET = 'fixed';
// Positional section label for index i: 0 -> 'A', 1 -> 'B', ...
const sectionLabel = (i) => String.fromCharCode(65 + i);
// Section colors. Default (no override) uses the shared SECTION_COLOR_CLASSES palette
// (Tailwind classes that mirror the backend SECTION_COLOR_PALETTE exactly). When a
// section has a CHOSEN color (free-form, from the native picker), that exact hex is
// applied INLINE (no Tailwind class can represent an arbitrary hex), so the workbench
// shows precisely what the PDF will print.
const SECTION_HEX_RE = /^#[0-9a-fA-F]{6}$/;
function chosenSectionColor(sectionDraft, i) {
  const c = Array.isArray(sectionDraft) && sectionDraft[i] ? sectionDraft[i].color : null;
  return typeof c === 'string' && SECTION_HEX_RE.test(c.trim()) ? c.trim() : null;
}
// The color the picker shows for section i when there is no override (its positional default).
function defaultSectionHex(i) {
  const n = SECTION_COLOR_HEXES.length;
  return SECTION_COLOR_HEXES[((Number(i) % n) + n) % n];
}
// Pill: chosen hex -> inline background; else the positional palette class.
function sectionPillProps(sectionDraft, i) {
  const hex = chosenSectionColor(sectionDraft, i);
  return hex ? { style: { backgroundColor: hex }, className: '' } : { style: undefined, className: sectionColorClasses(i).pill };
}
// Column-name text: chosen hex -> inline color; else the positional palette class.
function sectionNameProps(sectionDraft, i) {
  const hex = chosenSectionColor(sectionDraft, i);
  return hex ? { style: { color: hex }, className: 'truncate font-semibold' } : { style: undefined, className: `truncate font-semibold ${sectionColorClasses(i).name}` };
}

/*
 * CustomGroupsControl — assign EVERY column to a section, then re-render.
 * Operates on the position-based section draft (conversion.sectionDraft) plus
 * the pinned columns (conversion.frozenDraft), so order/titles set elsewhere are
 * preserved. Moving a column calls conversion.reassignSectionColumn(col, target)
 * where target is 'fixed', a section index, or the next index (new section).
 */
function CustomGroupsControl({ conversion }) {
  const sectionDraft = Array.isArray(conversion.sectionDraft) ? conversion.sectionDraft : [];
  const frozenDraft = Array.isArray(conversion.frozenDraft) ? conversion.frozenDraft : [];
  const sectionColumns = sectionDraft.flatMap((s) => (Array.isArray(s.columns) ? s.columns : []));
  const allColumns = [...new Set([...sectionColumns, ...frozenDraft])];

  if (allColumns.length === 0) {
    return (
      <p className="mt-1 text-[11.5px] leading-5 text-[var(--color-text-subtle)]">
        Render with grouping (Auto or Always split) to assign columns to your own sections.
      </p>
    );
  }

  // Current target per column: a section index, or FIXED_TARGET.
  const frozenSet = new Set(frozenDraft);
  const targetOf = (col) => {
    if (frozenSet.has(col)) return FIXED_TARGET;
    const idx = sectionDraft.findIndex((s) => (s.columns || []).includes(col));
    return idx >= 0 ? String(idx) : '0';
  };
  // The column name takes its section's color (chosen hex inline, or positional
  // palette class); fixed columns (every section) stay neutral.
  const nameProps = (col) => {
    const t = targetOf(col);
    if (t === FIXED_TARGET) return { className: 'truncate', style: undefined };
    return sectionNameProps(sectionDraft, Number(t));
  };

  const options = [
    { value: FIXED_TARGET, label: 'Fixed (every section)' },
    ...sectionDraft.map((s, i) => ({
      value: String(i),
      label: s.title ? `Section ${s.title}` : `Section ${sectionLabel(i)}`,
    })),
    { value: String(sectionDraft.length), label: 'New section' },
  ];

  return (
    <div data-testid="app-custom-groups" className="mt-2 flex flex-col gap-1.5">
      <p className="text-[11.5px] leading-5 text-[var(--color-text-subtle)]">
        Move columns between sections, then update the preview. &ldquo;Fixed&rdquo; columns repeat in every section.
      </p>
      {allColumns.map((col) => {
        const np = nameProps(col);
        return (
        <div key={col} className="flex items-center gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-[12.5px] text-[var(--color-text)]">
            <span className={np.className} style={np.style}>{col}</span>
            {frozenSet.has(col) ? (
              <span className="shrink-0 rounded bg-[var(--color-surface-sunken)] px-1 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                fixed
              </span>
            ) : null}
          </span>
          <select
            aria-label={`Section for ${col}`}
            value={targetOf(col)}
            onChange={(e) => {
              const v = e.target.value;
              conversion.reassignSectionColumn(col, v === FIXED_TARGET ? FIXED_TARGET : Number(v));
            }}
            className="min-h-11 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 text-[12.5px] text-[var(--color-text)] outline-none focus:border-[var(--color-line-strong)] lg:min-h-8"
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        );
      })}
    </div>
  );
}

// Native color picker for one section (free-form, like the Branding accent color).
// Picking a color calls onSetColor(index, hex); "Reset" clears it back to the
// section's positional default. The 1-based human number (index + 1) is used in the
// aria-labels so screen readers / tests can target "section 1", "section 2", … .
function SectionColorPicker({ index, color, onSetColor }) {
  const num = index + 1;
  const chosen = typeof color === 'string' && SECTION_HEX_RE.test(color.trim()) ? color.trim() : null;
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label={`Color for section ${num}`}
        value={chosen || defaultSectionHex(index)}
        onChange={(e) => onSetColor(index, e.target.value)}
        className="h-7 w-9 cursor-pointer rounded border border-[var(--color-line)] bg-[var(--color-surface)]"
      />
      <span className="text-[11.5px] text-[var(--color-muted)]">{chosen || 'Default'}</span>
      {chosen ? (
        <button
          type="button"
          aria-label={`Reset color for section ${num}`}
          onClick={() => onSetColor(index, '')}
          className="ml-auto text-[11px] font-medium text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2 hover:decoration-[var(--color-text)]"
        >
          Reset
        </button>
      ) : null}
    </div>
  );
}

// One draggable + renamable section row. The `::` handle is the drag affordance
// (so the title input stays editable). Reordering reaches preview + download via
// the positional columnGroups order sent on the next "Update preview". Each row
// also carries a preset color picker (swatches) whose choice colors the pill +
// column names and is sent to the backend as the PDF section header color.
function SortableSectionRow({ id, index, title, color, onRename, onSetColor }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Reorder section ${title || sectionLabel(index)}`}
          className="cursor-grab touch-none select-none px-0.5 text-sm leading-none text-[var(--color-text-subtle)] hover:text-[var(--color-muted)]"
          {...attributes}
          {...listeners}
        >
          ::
        </button>
        <input
          type="text"
          value={title}
          maxLength={80}
          onChange={(e) => onRename(index, e.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-[12.5px] text-[var(--color-text)] outline-none focus:border-[var(--color-line-strong)] lg:min-h-9"
        />
      </div>
      <div className="pl-5">
        <SectionColorPicker index={index} color={color} onSetColor={onSetColor} />
      </div>
    </div>
  );
}

// "Section names" editor: drag-to-reorder (mouse/touch/keyboard) + rename, on the
// position-based section draft. Each row id is its current index (stable within a
// render); onDragEnd maps ids back to from/to indices.
function SectionNamesEditor({ conversion }) {
  const draft = Array.isArray(conversion.sectionDraft) ? conversion.sectionDraft : [];
  const ids = draft.map((_, i) => `section-${i}`);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (draft.length === 0) {
    return (
      <div className="space-y-2 opacity-55">
        {['Customer info', 'Orders'].map((name) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-sm leading-none text-[var(--color-text-subtle)]">::</span>
            <input
              type="text"
              value={name}
              disabled
              readOnly
              className="min-w-0 flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-[12.5px] text-[var(--color-text)]"
            />
          </div>
        ))}
      </div>
    );
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    if (from === -1 || to === -1) return;
    conversion.reorderSection(from, to);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div data-testid="app-section-rename" className="flex flex-col gap-2">
          {draft.map((s, i) => (
            <SortableSectionRow
              key={ids[i]}
              id={ids[i]}
              index={i}
              title={typeof s.title === 'string' ? s.title : ''}
              color={typeof s.color === 'string' ? s.color : ''}
              onRename={conversion.renameSection}
              onSetColor={conversion.setSectionColor}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

const INSPECTOR_TABS = [
  { id: 'sections', label: 'Sections' },
  { id: 'export', label: 'Export' },
];

export function ConversionInspector({ conversion, quota, className = '', onCollapse, collapsed = false }) {
  const [activeTab, setActiveTab] = React.useState('sections');
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
        'order-2 flex min-h-[620px] flex-col overflow-visible bg-[var(--color-surface)] px-[18px] pt-[22px] lg:order-none lg:h-[calc(100vh-57px)] lg:overflow-hidden',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="shrink-0 bg-[var(--color-surface)] pb-4">
        <div className="flex items-start gap-2">
          <h2 className="font-serif text-[18px] font-bold tracking-[-0.01em] text-[var(--color-text)]">Adjust output</h2>
          {onCollapse && !collapsed ? (
            <span className="ml-auto">
              <CollapseToggle side="right" collapsed={collapsed} onToggle={onCollapse} />
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
          {conversion.pdfBlob
            ? 'Change anything, then update the preview. Re-render costs one export.'
            : 'Set options now, or refine them after your first render.'}
        </p>
      </div>

      <div
        data-testid="app-inspector-options"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
      >
        <div className="mb-4">
          <PanelTabs
            tabs={INSPECTOR_TABS}
            value={activeTab}
            onChange={setActiveTab}
            tone="light"
            ariaLabel="Adjust output sections"
          />
        </div>

        <div className="flex flex-col gap-4 pb-4">
        {activeTab === 'sections' ? (
          <>
        <InspectorSection title="Column grouping" hint="How wide tables get split across pages.">
          <div data-testid="app-columnmap" className="flex overflow-hidden rounded-lg border border-[var(--color-line)]">
            {[
              { v: 'off', label: 'Off' },
              { v: 'auto', label: 'Auto' },
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
                    i > 0 ? 'border-l border-[var(--color-line)]' : '',
                    active ? 'bg-[var(--color-surface-sunken)] font-semibold text-[var(--color-text)]' : 'bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)]',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {/* Pre-render: keep it calm. The toggle is the one pre-render choice;
              section names, colors and custom grouping are derived from the first
              render, so they appear only once a PDF exists. The inspector header
              already states they refine after the first render — so a short, positive
              reassurance is enough here. */}
          {!conversion.pdfBlob && conversion.columnMap !== 'off' ? (
            <p className="mt-2 text-[11.5px] leading-5 text-[var(--color-text-subtle)]">Auto suits most files.</p>
          ) : null}
          {/* Section customization is meaningful only when grouping is on AND a
              render exists. In "Off" the backend ignores custom sections. */}
          {conversion.columnMap !== 'off' && conversion.pdfBlob && (
            <>
              {Array.isArray(conversion.renderedSections) && conversion.renderedSections.length > 0 ? (
                <div data-testid="app-group-pills" className="mt-2 flex flex-wrap gap-1.5">
                  {conversion.renderedSections.map((s, i) => {
                    const pp = sectionPillProps(conversion.sectionDraft, i);
                    return (
                      <span
                        key={s.label}
                        style={pp.style}
                        className={['rounded-full px-2.5 py-1 text-[11px] font-semibold text-white', pp.className].join(' ')}
                      >
                        Section {s.label}
                      </span>
                    );
                  })}
                </div>
              ) : null}
              <div className="mt-3 text-[13px] font-semibold text-[var(--color-text)]">Custom sections</div>
              <CustomGroupsControl conversion={conversion} />
            </>
          )}
        </InspectorSection>

        {conversion.columnMap !== 'off' && conversion.pdfBlob && (
          <InspectorSection title="Section name & color" hint="Drag to reorder, rename, pick a color, then update preview.">
            <SectionNamesEditor conversion={conversion} />
          </InspectorSection>
        )}
          </>
        ) : (
          <>
        <InspectorSection title="Report title">
          <input
            id="app-report-title"
            aria-label="Report title"
            type="text"
            value={conversion.reportTitle}
            onChange={(e) => conversion.setReportTitle(e.target.value)}
            placeholder="e.g. Acme Co. - Q4 2025 export"
            maxLength={200}
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[12.5px] text-[var(--color-text)] outline-none focus:border-[var(--color-line-strong)]"
          />
        </InspectorSection>

        <InspectorSection title="Branding" hint="Title, accent color, logo & footer for paid exports.">
          <label className="mb-1 flex items-center justify-between gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            <span>Logo &amp; branding</span>
            <input
              type="checkbox"
              aria-label="Logo & branding"
              data-testid="app-branding-toggle"
              checked={conversion.includeBranding !== false}
              onChange={(e) => conversion.setIncludeBranding(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
          </label>
          <p className="mb-3 text-[11px] text-[var(--color-text-subtle)]">Désactivé = PDF sans aucun logo (ni FitForPDF, ni le vôtre).</p>
          <label htmlFor="app-accent-color" className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            <span>Accent color</span>
          </label>
          <div className="mb-3 flex items-center gap-2">
            <input
              id="app-accent-color"
              type="color"
              aria-label="Accent color"
              value={/^#[0-9a-fA-F]{6}$/.test(conversion.accentColor) ? conversion.accentColor : '#2563EB'}
              onChange={(e) => conversion.setAccentColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-[var(--color-line)] bg-[var(--color-surface)]"
            />
            <span className="text-[12px] text-[var(--color-muted)]">{conversion.accentColor || 'Default'}</span>
            {conversion.accentColor ? (
              <button type="button" onClick={() => conversion.setAccentColor('')} className="ml-auto text-[11.5px] font-medium text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2 hover:decoration-[var(--color-text)]">Reset</button>
            ) : null}
          </div>
          <div className="mb-2 text-[13px] font-semibold text-[var(--color-text)]">Logo</div>
          <div className="mb-3">
            <input
              type="file"
              aria-label="Logo image (PNG or JPG)"
              accept="image/png,image/jpeg"
              onChange={(e) => conversion.handleLogoSelect(e.target.files?.[0] || null)}
              className="block w-full text-[12px] text-[var(--color-muted)] file:mr-2 file:min-h-9 file:rounded-lg file:border file:border-[var(--color-line)] file:bg-[var(--color-surface)] file:px-3 file:text-[12px] file:font-semibold file:text-[var(--color-text)]"
            />
            {conversion.logoError ? (
              <p data-testid="app-logo-error" className="mt-1 text-[11px] font-medium text-[var(--color-danger-text)]">{conversion.logoError}</p>
            ) : (
              <p className="mt-1 text-[11px] text-[var(--color-text-subtle)]">
                {conversion.logoFile ? `Selected: ${conversion.logoFile.name}` : 'PNG or JPG, up to 256 KB.'}
              </p>
            )}
            {conversion.logoFile ? (
              <button
                type="button"
                data-testid="app-logo-remove"
                onClick={() => conversion.removeLogo()}
                className="mt-1 text-[11.5px] font-medium text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2 hover:decoration-[var(--color-text)]"
              >
                Retirer le logo
              </button>
            ) : null}
          </div>
          <label htmlFor="app-footer-text" className="mb-2 block text-[13px] font-semibold text-[var(--color-text)]">Footer text</label>
          <input
            id="app-footer-text"
            type="text"
            aria-label="Footer text"
            value={conversion.footerText}
            maxLength={120}
            onChange={(event) => conversion.setFooterText(event.target.value)}
            placeholder="Confidential - internal use"
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[12.5px] text-[var(--color-text)] outline-none focus:border-[var(--color-line-strong)]"
          />
          <p className="mt-2 text-[11px] text-[var(--color-text-subtle)]">Branding applies to paid exports.</p>
        </InspectorSection>

        <InspectorSection title="Layout" hint="Drop the summary page, repeated headers, or the page footer.">
          <label className="mb-2 flex items-center justify-between gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            <span>Summary page</span>
            <input
              type="checkbox"
              aria-label="Summary page"
              data-testid="app-layout-overview-toggle"
              checked={conversion.layout?.overview !== false}
              onChange={(e) => conversion.handleLayoutChange('overview', e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="mb-2 flex items-center justify-between gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            <span>Repeat headers on every page</span>
            <input
              type="checkbox"
              aria-label="Repeat headers on every page"
              data-testid="app-layout-headers-toggle"
              checked={conversion.layout?.headers !== false}
              onChange={(e) => conversion.handleLayoutChange('headers', e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="mb-1 flex items-center justify-between gap-2 text-[13px] font-semibold text-[var(--color-text)]">
            <span>Page footer</span>
            <input
              type="checkbox"
              aria-label="Page footer"
              data-testid="app-layout-footer-toggle"
              checked={conversion.layout?.footer !== false}
              onChange={(e) => conversion.handleLayoutChange('footer', e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
          </label>
          <p className="mt-2 text-[11px] text-[var(--color-text-subtle)]">The summary page lists your sections; turn it off for a plain table.</p>
        </InspectorSection>
          </>
        )}
      </div>
      </div>

      <div
        data-testid="app-inspector-actions"
        className="sticky bottom-0 z-10 -mx-[18px] mt-auto shrink-0 border-t border-[var(--color-line)] bg-[var(--color-surface)] px-[18px] pb-[18px] pt-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)]"
      >
        {/* Hierarchy: Download is the one primary (solid). "Update preview" is the
            secondary re-render step (and states its cost). Pre-render the inspector
            doesn't compete with the canvas's Generate button — it just states what
            the buttons will do. */}
        {conversion.pdfBlob ? (
          <button
            type="button"
            onClick={() => conversion.handleSubmit({ preventDefault: () => {} })}
            disabled={conversion.isLoading || !conversion.file || quotaLocked}
            className="mb-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[13px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-sunken)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Update preview
            <span className="text-[10px] font-medium text-[var(--color-text-subtle)]">applies changes · 1 export</span>
          </button>
        ) : (
          <p className="mb-2 text-center text-[11.5px] leading-5 text-[var(--color-text-subtle)]">
            Generate your file to download it and fine-tune sections here.
          </p>
        )}
        {quotaLocked ? (
          <p data-testid="app-inspector-quota-lock" className="mb-2 text-center text-[11.5px] text-[var(--color-warn-text)]">
            No exports left. <a href="/pricing" className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2">Buy credits</a> to re-render.
          </p>
        ) : null}
        {conversion.pdfBlob ? (
          <button
            type="button"
            onClick={conversion.handleDownloadAnyway}
            disabled={conversion.isLoading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[var(--color-cta-bg)] px-3 py-3 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.28)] transition hover:bg-[var(--color-cta-hover)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PDF
          </button>
        ) : null}
        {conversion.pdfBlob ? (
          <button
            type="button"
            onClick={conversion.handleRenderAnother}
            className="mt-1 min-h-10 w-full rounded-lg bg-transparent px-3 py-2 text-[13px] font-medium text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
          >
            Render another file
          </button>
        ) : null}
        {/* When quota is locked, the amber "No exports left · Buy credits" line above
            already states the plan status + pricing CTA — so we drop this duplicate. */}
        {!quotaLocked ? (
          <div className="mt-1.5 text-center text-[11.5px] text-[var(--color-text-subtle)]">
            {quotaSummary} - <a href="/pricing" className="font-medium text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2">View pricing</a>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

// Left rail (dark "Recent exports" + "Sections"). `className` owns the layout
// concern so the same markup serves both branches: the mobile grid passes the
// `order-3 hidden … lg:flex` grid-cell classes (rail is hidden on mobile),
// while the desktop PanelGroup passes panel-fit classes (`flex-1`) and an
// `onCollapse` handler that renders the header collapse toggle.
// The rail's read-only structure view is the document "Outline" — distinct from
// the inspector's "Sections" tab (where you EDIT them). Renaming it frees the word
// "Section" to mean exactly one thing in the UI.
const RAIL_TABS = [
  { id: 'sections', label: 'Outline' },
  { id: 'recent', label: 'Recent Exports' },
];

function WorkbenchRail({
  conversion,
  className = 'order-3 hidden lg:order-none lg:flex lg:h-[calc(100vh-57px)]',
  onCollapse,
  collapsed = false,
}) {
  const [activeTab, setActiveTab] = React.useState('recent');
  const recentExports = Array.isArray(conversion.exportHistory) ? conversion.exportHistory.slice(0, 4) : [];
  const sections = Array.isArray(conversion.renderedSections) ? conversion.renderedSections : [];

  return (
    <aside
      aria-label="Recent exports and outline"
      data-testid="app-left-rail"
      className={['flex-col overflow-y-auto bg-[#0F172A] px-3.5 py-[18px] text-white', className].filter(Boolean).join(' ')}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <PanelTabs
            tabs={RAIL_TABS}
            value={activeTab}
            onChange={setActiveTab}
            tone="dark"
            ariaLabel="Recent exports and outline"
          />
        </div>
        {onCollapse && !collapsed ? (
          <CollapseToggle side="left" collapsed={collapsed} onToggle={onCollapse} />
        ) : null}
      </div>

      {activeTab === 'recent' ? (
        <>
          <p className="mt-3 text-xs leading-5 text-[var(--color-text-subtle)]">
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
                  <span className="mt-1 block text-[var(--color-text-subtle)]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent render'}</span>
                </a>
              ))
            ) : (
              <div className="px-3 py-2 text-[12.5px] leading-5 text-[var(--color-muted)]">
                No exports yet. Drop a spreadsheet to start.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={conversion.handleRenderAnother}
            className="mt-3 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 px-3 text-[13px] font-medium text-[var(--color-text-subtle)] transition hover:border-white/30 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New export
          </button>
        </>
      ) : (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-[var(--color-text-subtle)]" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Outline</h2>
          </div>
          <div className="mt-3 space-y-2">
            {sections.length > 0 ? (
              sections.map((section) => (
                <div key={section.label} className="flex items-center gap-2 text-xs text-[var(--color-text-subtle)]">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-white/10 font-semibold text-white">
                    {section.label}
                  </span>
                  <span className="truncate">{section.title}</span>
                </div>
              ))
            ) : (
              <p className="text-xs leading-5 text-[var(--color-text-subtle)]">The document outline appears after your first render.</p>
            )}
          </div>
        </div>
      )}

      {!conversion.pdfBlob ? (
        <div className="mt-auto flex items-center gap-2 px-2 pb-1 pt-3 text-[11px] text-[var(--color-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
          Processed ephemerally - never stored
        </div>
      ) : null}
    </aside>
  );
}

export { WorkbenchRail };

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
      className="mt-5 w-full max-w-[560px] rounded-[10px] border border-[var(--color-warn-border)] bg-[var(--color-warn-bg)] px-4 py-3 text-left"
    >
      <div className="flex gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warn-text)]" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[var(--color-warn-text)]">You've used your free exports.</p>
          <p className="mt-1 text-[12.5px] leading-5 text-[var(--color-warn-text)]">
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
                className="min-h-10 rounded-lg bg-[var(--color-accent)] px-3 text-[12.5px] font-bold text-[var(--color-accent-text)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="rounded-[12px] border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
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
        className="flex min-h-[356px] cursor-pointer flex-col items-center justify-center rounded-[11px] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-6 py-12 text-center outline-none transition hover:border-[var(--color-line-strong)] hover:bg-[var(--color-surface-sunken)] focus-visible:border-[var(--color-line-strong)] focus-visible:ring-2 focus-visible:ring-[var(--color-line-strong)]"
      >
        <Upload className="mb-4 h-10 w-10 text-[var(--color-text-subtle)]" strokeWidth={1.4} aria-hidden="true" />
        <h2 className="max-w-[320px] text-[18px] font-semibold leading-tight text-[var(--color-text)]">
          {conversion.file ? conversion.file.name : 'Drop your Excel or CSV here'}
        </h2>
        <p className="mt-2 text-[13.5px] text-[var(--color-muted)]">.xlsx, .xls, .csv - up to 4 MB</p>
        <div className="my-[18px] text-[12.5px] text-[var(--color-text-subtle)]">{hasFile ? 'ready' : 'or'}</div>
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
                className="min-h-11 rounded-[10px] bg-[var(--color-cta-bg)] px-7 text-sm font-bold text-white transition hover:bg-[var(--color-cta-hover)] disabled:cursor-not-allowed disabled:opacity-50"
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
                className="min-h-11 rounded-[10px] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-line-strong)] hover:bg-[var(--color-surface-sunken)] disabled:cursor-not-allowed disabled:opacity-50"
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
            className="min-h-11 rounded-[10px] border border-[var(--color-line)] bg-[var(--color-surface)] px-7 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-line-strong)] hover:bg-[var(--color-surface-sunken)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Browse files
          </button>
        )}
        {(conversion.failKind === 'page_burden' || conversion.error) ? (
          <div
            data-testid="generate-error"
            role="alert"
            onClick={(event) => event.stopPropagation()}
            className="mt-4 w-full max-w-[460px] rounded-[10px] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-4 py-3 text-left"
          >
            {conversion.failKind === 'page_burden' ? (
              <>
                <p className="text-[13.5px] font-semibold text-[var(--color-danger-text)]">
                  {conversion.pageBurdenCopy?.title
                    || 'This export is too large to render as a clean, sendable PDF.'}
                </p>
                {conversion.pageBurdenCopy?.description ? (
                  <p className="mt-1 text-[12.5px] text-[var(--color-danger-text)]">{conversion.pageBurdenCopy.description}</p>
                ) : null}
                {Array.isArray(conversion.failureRecommendations) && conversion.failureRecommendations.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[12.5px] text-[var(--color-danger-text)]">
                    {conversion.failureRecommendations.map((token) => (
                      <li key={token}>{recommendationLabel(token)}</li>
                    ))}
                  </ul>
                ) : null}
                {/* One-click recovery: condense long text (cap tall cells to a few
                    lines) and re-render the same file, which drops the projected
                    page count under the cap. Hidden once already condensed. */}
                {!conversion.truncateLongText ? (
                  <button
                    type="button"
                    data-testid="generate-condense-retry"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!conversion.isLoading) void conversion.handleCondenseAndRetry?.();
                    }}
                    disabled={conversion.isLoading}
                    className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-[10px] bg-[var(--color-cta-bg)] px-4 text-[13px] font-bold text-white transition hover:bg-[var(--color-cta-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {conversion.isLoading ? 'Condensing…' : 'Condense long text & retry'}
                  </button>
                ) : (
                  <p className="mt-3 text-[12.5px] text-[var(--color-danger-text)]">
                    Long text is already condensed and this export is still too large — try splitting the file or removing very long columns.
                  </p>
                )}
              </>
            ) : (
              <p className="text-[13.5px] font-medium text-[var(--color-danger-text)]">{conversion.error}</p>
            )}
          </div>
        ) : null}

        <div className="mt-[22px] flex flex-wrap justify-center gap-x-[18px] gap-y-2 text-xs font-medium text-[var(--color-muted)]">
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
    <aside className="flex min-h-[356px] flex-col rounded-[12px] border border-[var(--color-line)] bg-[var(--color-surface)] p-[18px] shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
      <h2 className="font-serif text-[15px] font-bold tracking-[-0.01em] text-[var(--color-text)]">Try a sample</h2>
      <p className="mb-3 mt-1 text-xs leading-5 text-[var(--color-muted)]">Preview a finished PDF from this CSV — no upload needed.</p>
      <div className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-sunken)] p-3 font-mono text-[11px] leading-[1.8] text-[var(--color-muted)]">
        <span className="text-[var(--color-text-subtle)]">id,name,region,plan,mrr...</span>
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
        className="mt-3 inline-flex min-h-10 items-center gap-1.5 self-start text-[12.5px] font-semibold text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2 transition hover:decoration-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Render this sample
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </aside>
  );
}

function WorkbenchEmptyCanvas({ conversion, quota }) {
  return (
    <>
      <div className="mb-[22px] max-w-[600px]">
        <h1 className="font-serif text-[27px] font-semibold tracking-[-0.01em] text-[var(--color-text)]">
          Start a new export
        </h1>
        <p className="mt-2 max-w-[60ch] text-[14.5px] leading-[1.55] text-[var(--color-muted)]">
          Drop a wide spreadsheet below — we split it into clean sections and repeat your key
          columns on every page. Nothing cut off.
        </p>
      </div>
      <div className="grid gap-[18px] xl:grid-cols-[minmax(0,1fr)_250px]">
        <WorkbenchDropzone conversion={conversion} quota={quota} />
        <WorkbenchSampleCard conversion={conversion} />
      </div>
    </>
  );
}

function WorkbenchRenderedCanvas({ conversion, quota }) {
  // After a "Condense long text & retry", the export was made to fit by shortening
  // long cells — a degraded result. We surface that honestly and turn it into the
  // upgrade nudge (full, untruncated fidelity is the paid lever). Free users only:
  // paid plans render in full, so they don't see this.
  const isPaidPlan = Boolean(
    quota && (quota.isUnlimited === true
      || ['pro', 'credits', 'api_enterprise'].includes(quota.planType)),
  );
  const showCondensedNote = conversion.truncateLongText === true && !isPaidPlan;
  return (
    <div className="ffp-reveal">
      <div className="mb-[18px] flex max-w-[620px] items-center gap-3 rounded-[10px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
        <FileText className="h-5 w-5 text-[var(--color-text-subtle)]" aria-hidden="true" />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold text-[var(--color-text)]">
            {conversion.file?.name || conversion.resolvedPdfFilename}
          </p>
          <p className="text-xs text-[var(--color-muted)]">Preview ready. Adjust output, then update preview.</p>
        </div>
        <button
          type="button"
          onClick={conversion.handleRenderAnother}
          className="ml-auto inline-flex min-h-11 shrink-0 items-center px-1 text-[12.5px] font-semibold text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2 hover:decoration-[var(--color-text)] lg:min-h-0"
        >
          Change file
        </button>
      </div>
      {showCondensedNote ? (
        <div
          data-testid="condensed-upgrade-note"
          className="mb-[18px] max-w-[620px] rounded-[10px] border border-[var(--color-warn-border)] bg-[var(--color-warn-bg)] px-4 py-3 text-[12.5px] leading-5 text-[var(--color-warn-text)]"
        >
          <span className="font-semibold">Long text was condensed to fit.</span>{' '}
          Long cells were shortened to keep this export under the free page limit.{' '}
          <a
            href="/pricing"
            className="font-semibold text-[var(--color-warn-text)] underline decoration-[var(--color-warn-border)] underline-offset-2 hover:decoration-[var(--color-warn-text)]"
          >
            Upgrade for full, untruncated text →
          </a>
        </div>
      ) : null}
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--color-muted)]">
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        Preview
        <span className="ml-1 inline-flex items-center gap-1 text-[13.5px] normal-case tracking-normal text-[var(--color-success-text)]">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden="true" />
          Ready
        </span>
      </div>
      <PdfPreviewPane pdfBlob={conversion.pdfBlob} filename={conversion.resolvedPdfFilename} />
    </div>
  );
}

export function PdfPreviewPane({ pdfBlob, filename }) {
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
    <div className="mt-5 max-w-[620px] overflow-hidden rounded-[9px] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_8px_40px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2">
        <p className="truncate text-sm font-semibold text-[var(--color-text)]">Preview: {safeFilename}</p>
        <span className="text-xs font-medium text-[var(--color-muted)]">PDF</span>
      </div>
      {/* Desktop: inline <object> embed (works on large screens). */}
      <object
        aria-label={`PDF preview: ${safeFilename}`}
        data-testid="app-pdf-preview"
        data={previewUrl}
        title={`PDF preview: ${safeFilename}`}
        type="application/pdf"
        className="hidden h-[560px] w-full bg-[var(--color-surface)] lg:block"
      >
        <div className="p-5 text-sm text-[var(--color-muted)]">
          PDF preview is not available in this browser. Use Download PDF to open it.
        </div>
      </object>
      {/* Mobile browsers (esp. iOS Safari) render an empty <object> box, so on
          small screens we render the first page to an image instead — a real
          inline preview that works everywhere. */}
      <div data-testid="app-pdf-preview-mobile" className="flex flex-col items-center gap-3 px-4 py-5 text-center lg:hidden">
        <MobilePdfPreview pdfBlob={pdfBlob} previewUrl={previewUrl} filename={safeFilename} />
      </div>
    </div>
  );
}

// Mobile-only first-page image preview. Renders the PDF's first page to an image
// (works where <object> embeds don't), falling back to an iOS-safe "Open PDF"
// link if rendering isn't possible. pdf.js is only loaded on a mobile viewport
// with a real canvas, so desktop + jsdom never pull it in (see renderPdfFirstPageImage).
function MobilePdfPreview({ pdfBlob, previewUrl, filename }) {
  const [imageUrl, setImageUrl] = React.useState(null);
  const [status, setStatus] = React.useState('idle'); // idle | rendering | image | fallback

  React.useEffect(() => {
    const isMobile = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 1023px)').matches
      : false;
    if (!isMobile || !pdfBlob) {
      setStatus('fallback');
      setImageUrl(null);
      return undefined;
    }
    let cancelled = false;
    setStatus('rendering');
    setImageUrl(null);
    renderPdfFirstPageImage(pdfBlob).then((url) => {
      if (cancelled) return;
      if (url) { setImageUrl(url); setStatus('image'); } else { setStatus('fallback'); }
    });
    return () => { cancelled = true; };
  }, [pdfBlob]);

  // iOS-safe: a same-tab navigation to the blob URL renders the PDF (no `download`
  // / `target=_blank`, which Safari mishandles for blob: PDFs).
  const openLink = (label, variant) => (
    <a
      href={previewUrl}
      rel="noopener"
      data-testid="app-pdf-preview-mobile-open"
      className={variant === 'subtle'
        ? 'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[var(--color-line)] px-4 py-2 text-[13px] font-semibold text-[var(--color-text)]'
        : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-cta-bg)] px-5 py-2.5 text-sm font-bold text-white'}
    >
      {label}
    </a>
  );

  if (status === 'image' && imageUrl) {
    return (
      <>
        <img
          src={imageUrl}
          alt={`First page preview: ${filename}`}
          data-testid="app-pdf-preview-mobile-image"
          className="w-full max-w-[520px] rounded-md border border-[var(--color-line)] shadow-sm"
        />
        <p className="text-xs text-[var(--color-muted)]">First page shown. Open the full PDF below.</p>
        {openLink('Open full PDF', 'subtle')}
      </>
    );
  }

  return (
    <>
      <p className="text-sm text-[var(--color-muted)]">
        {status === 'rendering' ? 'Preparing preview…' : 'Your PDF is ready.'}
      </p>
      {openLink('Open PDF')}
    </>
  );
}

// Drawer DOM ids shared by the mobile toggles (aria-controls) and the off-canvas
// drawers (panel id) so the two are programmatically associated.
const LEFT_DRAWER_ID = 'app-drawer-left';
const RIGHT_DRAWER_ID = 'app-drawer-right';

function AppToolbar({ conversion, quota, session, openDrawer = null, setOpenDrawer }) {
  // The breadcrumb only earns its place once there's a document to name. At the
  // empty "New export" state it was pure noise next to the brand, so we drop it
  // and let the centered mark stand alone (per design harmonization).
  const crumb = conversion.file?.name
    || (conversion.pdfBlob ? conversion.resolvedPdfFilename : null);
  const setDrawer = typeof setOpenDrawer === 'function' ? setOpenDrawer : () => {};

  const railPillClass =
    'inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 ' +
    'text-[13px] font-semibold text-[var(--color-text)] transition ' +
    'hover:border-[var(--color-line-strong)] hover:bg-[var(--color-surface-sunken)]';

  return (
    <header
      data-testid="app-toolbar"
      className="grid h-[57px] grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-bg-hero)] px-4 sm:px-[22px]"
    >
      {/* Left zone: exit-to-site, then the document title once a file is loaded. */}
      <div className="flex min-w-0 items-center gap-3 justify-self-start">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">fitforpdf.com</span>
        </a>
        {crumb ? (
          <>
            <div className="hidden h-5 w-px bg-[var(--color-line)] sm:block" aria-hidden="true" />
            <div data-testid="app-crumb" className="hidden min-w-0 truncate sm:block">
              <span className="font-serif italic text-[15px] text-[var(--color-text)]">{crumb}</span>
            </div>
          </>
        ) : null}
      </div>

      {/* Center zone: the brand mark, truly centered (1fr | auto | 1fr grid).
          Picto only — the wordmark stays on the marketing header. Links home. */}
      <a
        href="/"
        aria-label="fitforpdf — accueil"
        className="justify-self-center rounded-md transition hover:opacity-80"
      >
        <AnimatedLogo className="h-7 w-7" />
      </a>

      {/* Right zone: drawer toggles (mobile) · API · plan · theme · account. */}
      <div className="flex items-center gap-3 justify-self-end">
        {/* Mobile-only drawer toggles. Each opens its off-canvas drawer (one at a
            time): "Recent" -> left rail, "Options" -> right inspector. Hidden on
            desktop (lg) where the resizable PanelGroup is used instead. */}
        <button
          type="button"
          data-testid="app-drawer-toggle-left"
          aria-label="Open recent exports panel"
          aria-expanded={openDrawer === 'left'}
          aria-controls={LEFT_DRAWER_ID}
          onClick={() => setDrawer(openDrawer === 'left' ? null : 'left')}
          className={railPillClass + ' lg:hidden'}
        >
          <PanelLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Recent</span>
        </button>
        <button
          type="button"
          data-testid="app-drawer-toggle-right"
          aria-label="Open options panel"
          aria-expanded={openDrawer === 'right'}
          aria-controls={RIGHT_DRAWER_ID}
          onClick={() => setDrawer(openDrawer === 'right' ? null : 'right')}
          className={railPillClass + ' lg:hidden'}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Options</span>
        </button>
        {/* API entry — same wording + "Free" signal as the marketing header. */}
        <a href="/developers" className={'hidden sm:inline-flex ' + railPillClass}>
          <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
          API
          <span className="ml-0.5 rounded-full border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-success-text)]">
            Free
          </span>
        </a>
        <PlanBadge quota={quota} className="hidden sm:inline-flex" />
        <ThemeToggle />
        <AccountMenu account={session?.account || null} onLogout={session?.logout || (() => {})} />
      </div>
    </header>
  );
}

// Center workspace (upload dropzone / rendered PDF preview). Shared by both the
// desktop PanelGroup and the mobile stacked layout so the markup lives once.
// `className` lets each branch own its sizing: the grid uses `order-1 … lg:…`
// for the stacked/grid cell, the panel uses `h-full` to fill its Panel.
function WorkbenchWorkspace({ conversion, quota, className = '' }) {
  return (
    <section
      aria-label="Upload and PDF workspace"
      data-testid="app-canvas"
      className={['min-w-0 px-4 py-6 sm:px-8 sm:py-[30px]', className].filter(Boolean).join(' ')}
    >
      {conversion.pdfBlob ? (
        <WorkbenchRenderedCanvas conversion={conversion} quota={quota} />
      ) : (
        <WorkbenchEmptyCanvas conversion={conversion} quota={quota} />
      )}
      <div className="mt-6 flex items-center gap-2 text-[12.5px] text-[var(--color-muted)]">
        <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
        Need this every week? <a href="/developers" className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2 hover:decoration-[var(--color-text)]">Automate it with the API</a>
      </div>
    </section>
  );
}

// A draggable divider between two panels. react-resizable-panels already gives
// PanelResizeHandle role="separator" + arrow-key resizing; we only add a visible
// grab affordance: a thin slate divider that widens + colors on hover/active to
// match the light workbench theme.
function WorkbenchResizeHandle() {
  return (
    <PanelResizeHandle className="group/handle relative flex w-2 shrink-0 items-stretch justify-center bg-transparent outline-none">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 -left-1 -right-1 z-10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-9 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-text-subtle)] transition-colors group-hover/handle:bg-[var(--color-text)] group-data-[resize-handle-state=drag]/handle:bg-[var(--color-text)] group-focus-visible/handle:bg-[var(--color-text)]"
      />
    </PanelResizeHandle>
  );
}

// A thin always-visible edge rail shown WHERE a collapsed panel used to be, so the
// user can re-open it. Uses the macOS-style panel-open icon (lucide PanelLeftOpen /
// PanelRightOpen) in a clean white rounded button, on the gray gutter.
function CollapsedEdgeReopen({ side, label, onExpand }) {
  const isLeft = side === 'left';
  const Icon = isLeft ? PanelLeftOpen : PanelRightOpen;
  return (
    <div
      data-testid={`workbench-${side}-reopen`}
      className="flex h-full w-10 shrink-0 flex-col items-center bg-transparent py-2"
    >
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={onExpand}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] shadow-sm transition hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)]"
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    </div>
  );
}

// Header-row collapse toggle wired to a Panel imperative ref. Uses the macOS-style
// panel-toggle icon (lucide PanelLeftClose / PanelRightClose, like Claude Code).
// Themed light (right inspector, white) or dark (left rail, slate-950). aria-label
// is exactly "Collapse/Expand left|right panel" so tests + screen readers target it.
function CollapseToggle({ side, collapsed, onToggle }) {
  const word = collapsed ? 'Expand' : 'Collapse';
  const label = `${word} ${side} panel`;
  const isLeft = side === 'left';
  const Icon = isLeft ? PanelLeftClose : PanelRightClose;
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={!collapsed}
      onClick={onToggle}
      title={label}
      className={[
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition',
        isLeft
          ? 'text-[var(--color-text-subtle)] hover:bg-white/10 hover:text-white'
          : 'text-[var(--color-text-subtle)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)]',
      ].join(' ')}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
    </button>
  );
}

// The desktop-only resizable / collapsible workbench. Renders a horizontal
// PanelGroup: collapsible left rail | center workspace | collapsible inspector.
// Sizes + collapsed state persist via autoSaveId (localStorage). Each
// collapsible panel carries a header toggle (imperative collapse/expand) and,
// when collapsed, a thin edge re-open affordance.
function WorkbenchDesktopPanels({ conversion, quota }) {
  const leftRef = React.useRef(null);
  const rightRef = React.useRef(null);
  const [leftCollapsed, setLeftCollapsed] = React.useState(false);
  const [rightCollapsed, setRightCollapsed] = React.useState(false);

  const toggleLeft = () => {
    const panel = leftRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  };
  const toggleRight = () => {
    const panel = rightRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  };

  // Edge re-open buttons live OUTSIDE the PanelGroup. With collapsedSize={0} a
  // collapsed panel has zero width and would clip any in-panel affordance, so the
  // thin re-open rail sits as a flex sibling on the group's edge and stays
  // visible. Each is mounted only while its panel is collapsed.
  // Each panel's content sits in a floating "card" (rounded, ring, shadow) on a gray
  // gutter, with the gutter showing through the gaps + resize handles — the Anthropic
  // app look. CARD owns the rounding/inset so the shared content components are reused
  // untouched (their square corners are clipped by overflow-hidden).
  const CARD = 'm-1.5 flex min-w-0 flex-1 overflow-hidden rounded-xl bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.14)] ring-1 ring-[var(--color-line)]';
  return (
    <div className="bg-paper flex h-[calc(100vh-57px)] w-full">
      {leftCollapsed ? (
        <CollapsedEdgeReopen side="left" label="Expand left panel" onExpand={toggleLeft} />
      ) : null}

      <PanelGroup
        direction="horizontal"
        autoSaveId="ffp-workbench-panels"
        data-testid="workbench-panel-group"
        className="min-w-0 flex-1"
      >
        <Panel
          ref={leftRef}
          collapsible
          defaultSize={18}
          minSize={12}
          collapsedSize={0}
          onCollapse={() => setLeftCollapsed(true)}
          onExpand={() => setLeftCollapsed(false)}
          className="flex"
        >
          <div className={CARD}>
            <WorkbenchRail
              conversion={conversion}
              className="flex h-full min-w-0 flex-1"
              onCollapse={toggleLeft}
              collapsed={leftCollapsed}
            />
          </div>
        </Panel>

        <WorkbenchResizeHandle />

        <Panel minSize={30} className="flex" data-testid="workbench-center-panel">
          <div className={`${CARD} bg-[var(--color-surface)]`}>
            <WorkbenchWorkspace conversion={conversion} quota={quota} className="h-full flex-1 overflow-y-auto" />
          </div>
        </Panel>

        <WorkbenchResizeHandle />

        <Panel
          ref={rightRef}
          collapsible
          defaultSize={22}
          minSize={16}
          collapsedSize={0}
          onCollapse={() => setRightCollapsed(true)}
          onExpand={() => setRightCollapsed(false)}
          className="flex"
        >
          <div className={`${CARD} bg-[var(--color-surface)]`}>
            <ConversionInspector
              conversion={conversion}
              quota={quota}
              className="h-full min-w-0 flex-1"
              onCollapse={toggleRight}
              collapsed={rightCollapsed}
            />
          </div>
        </Panel>
      </PanelGroup>

      {rightCollapsed ? (
        <CollapsedEdgeReopen side="right" label="Expand right panel" onExpand={toggleRight} />
      ) : null}
    </div>
  );
}

// One off-canvas drawer (mobile). Its content is ALWAYS mounted; open/closed is
// expressed purely via the translate-x transition so the panels stay in the DOM
// (preserving input state + keeping existing mobile content queries resolvable).
// side: 'left' | 'right' — decides the slide direction + close-state transform.
function MobileDrawer({ id, side, label, open, onClose, children }) {
  const isLeft = side === 'left';
  const closedTranslate = isLeft ? '-translate-x-full' : 'translate-x-full';
  return (
    <div
      id={id}
      role="dialog"
      aria-label={label}
      // A closed drawer is off-screen: mark it inert (removes its content from the
      // a11y tree + focus order) and not a modal. aria-modal applies only while open.
      {...(open ? { 'aria-modal': 'true' } : { inert: '' })}
      data-testid={`app-drawer-${side}`}
      data-open={open ? 'true' : 'false'}
      className={[
        'fixed top-[57px] bottom-0 z-50 flex w-[88vw] max-w-[360px] flex-col bg-[var(--color-surface)] shadow-2xl transition-transform duration-300 ease-out lg:hidden',
        isLeft ? 'left-0' : 'right-0',
        open ? 'translate-x-0' : `${closedTranslate} pointer-events-none`,
      ].join(' ')}
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-3">
        <span className="text-[13px] font-semibold text-[var(--color-text)]">{label}</span>
        <button
          type="button"
          aria-label={`Close ${label} panel`}
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-subtle)] transition hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  );
}

// Mobile (< lg) layout: a full-width center workspace plus the left rail + right
// inspector rendered as fixed off-canvas DRAWERS that slide OVER the center, with
// a shared scrim. One drawer open at a time (openDrawer is 'left' | 'right' | null,
// owned by ConversionTool). Escape closes; body scroll is locked while open.
function WorkbenchMobileLayout({ conversion, quota, openDrawer, setOpenDrawer }) {
  const isOpen = openDrawer === 'left' || openDrawer === 'right';
  const close = React.useCallback(() => setOpenDrawer(null), [setOpenDrawer]);

  // Escape closes the open drawer.
  React.useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  // Lock body scroll while a drawer is open; restore on close / unmount.
  React.useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  return (
    <div data-testid="tool" className="relative min-h-[calc(100vh-57px)] overflow-x-hidden">
      <WorkbenchWorkspace conversion={conversion} quota={quota} className="w-full" />

      {/* Scrim: only present while a drawer is open. Clicking it closes. */}
      {isOpen ? (
        <button
          type="button"
          aria-label="Close panel"
          data-testid="app-drawer-scrim"
          onClick={close}
          className="fixed inset-0 top-[57px] z-40 bg-slate-950/40 lg:hidden"
        />
      ) : null}

      {/* Both drawers stay mounted; translate-x shows/hides them. */}
      <MobileDrawer
        id={LEFT_DRAWER_ID}
        side="left"
        label="Recent exports"
        open={openDrawer === 'left'}
        onClose={close}
      >
        <WorkbenchRail conversion={conversion} className="flex h-full w-full" />
      </MobileDrawer>

      <MobileDrawer
        id={RIGHT_DRAWER_ID}
        side="right"
        label="Options"
        open={openDrawer === 'right'}
        onClose={close}
      >
        <ConversionInspector conversion={conversion} quota={quota} className="h-full w-full border-t-0" />
      </MobileDrawer>
    </div>
  );
}

export default function ConversionTool({ toolTitle, toolSubcopy, variant = 'dark', showInspector = false, layout = 'inline' }) {
  const quota = useQuota();
  const conversion = useConversion({ quota });
  const session = useSession();
  const isDesktop = useIsDesktop();
  // Which mobile off-canvas drawer is open: 'left' (rail), 'right' (inspector),
  // or null. One at a time. Desktop ignores this (it uses the PanelGroup).
  const [openDrawer, setOpenDrawer] = React.useState(null);

  // Load "Recent exports" on mount, and refresh after each render (renderId changes).
  // useConversion only fetched history on a manual status change / load-more, so the
  // workbench panel always showed "No exports yet".
  React.useEffect(() => {
    void conversion.refreshExportHistory({ cursor: 0, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversion.renderId]);

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
        <AppToolbar
          conversion={conversion}
          quota={quota}
          session={session}
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
        />
        {isDesktop ? (
          // Desktop (>= lg): resizable / collapsible PanelGroup. data-testid="tool"
          // is kept here so existing selectors that scope to the workbench still work.
          <div data-testid="tool" className="overflow-hidden">
            <WorkbenchDesktopPanels conversion={conversion} quota={quota} />
          </div>
        ) : (
          // Mobile (< lg): full-width center workspace + off-canvas drawers (left
          // rail / right inspector) sliding over it, with a scrim. Same content
          // components as the desktop branch — no duplicated markup.
          <WorkbenchMobileLayout
            conversion={conversion}
            quota={quota}
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
          />
        )}
      </>
    );
  }

  return (
    <>
      {showInspector ? <ConversionInspector conversion={conversion} quota={quota} className="mb-5 min-h-0 rounded-xl border border-[var(--color-line)]" /> : null}
      {uploadSurface}
    </>
  );
}
