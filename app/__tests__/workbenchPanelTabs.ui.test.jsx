import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { ConversionInspector, WorkbenchRail } from '../components/ConversionTool.jsx';

// ---------------------------------------------------------------------------
// Phase 3 — workbench panel tabs.
//
// Each side panel gets a small segmented tab control at its top to group its
// controls. These tests lock the tab contracts:
//   - Left rail: "Sections" | "Recent Exports", default = Recent Exports.
//   - Right inspector: "Sections" | "Export", default = Sections.
// and that switching a tab reveals the right content.
// ---------------------------------------------------------------------------

function makeInspectorConversion(overrides = {}) {
  return {
    pdfBlob: new Blob(['%PDF']),
    file: new File(['a,b\n1,2'], 'a.csv', { type: 'text/csv' }),
    isLoading: false,
    reportTitle: '', setReportTitle: () => {},
    columnMap: 'auto', setColumnMap: () => {},
    renderedSections: [{ label: 'A', title: 'Info', columns: ['c1'] }],
    renderedFrozenColumns: [],
    sectionDraft: [{ title: 'Info', columns: ['c1'] }],
    frozenDraft: [],
    reassignSectionColumn: () => {}, reorderSection: () => {}, renameSection: () => {},
    setSectionColor: () => {},
    columnGroupsOverride: [], setColumnGroupsOverride: () => {},
    sectionTitleOverrides: {}, setSectionTitleOverrides: () => {},
    accentColor: '', setAccentColor: () => {},
    logoFile: null, logoError: '', handleLogoSelect: () => {}, removeLogo: () => {}, setLogoFile: () => {},
    includeBranding: true, setIncludeBranding: () => {},
    footerText: '', setFooterText: () => {},
    handleSubmit: () => {}, handleDownloadAnyway: () => {}, handleRenderAnother: () => {},
    ...overrides,
  };
}

function makeRailConversion(overrides = {}) {
  return {
    exportHistory: [
      { id: 'e1', sourceFileName: 'march-leads.csv', createdAt: '2026-06-01T10:00:00Z', pdfUrl: '#m' },
    ],
    renderedSections: [
      { label: 'A', title: 'Customer info' },
      { label: 'B', title: 'Orders' },
    ],
    pdfBlob: new Blob(['%PDF']),
    handleRenderAnother: () => {},
    ...overrides,
  };
}

const quota = { planType: 'free', freeExportsLeft: 2, isQuotaLocked: false };

afterEach(() => cleanup());

describe('Right inspector — Sections / Export tabs', () => {
  test('renders a tablist with "Sections" and "Export" tabs; Sections is the default', () => {
    render(<ConversionInspector conversion={makeInspectorConversion()} quota={quota} />);
    const tablist = screen.getByRole('tablist', { name: /adjust output sections/i });
    const sectionsTab = within(tablist).getByRole('tab', { name: 'Sections' });
    const exportTab = within(tablist).getByRole('tab', { name: 'Export' });
    expect(sectionsTab.getAttribute('aria-selected')).toBe('true');
    expect(exportTab.getAttribute('aria-selected')).toBe('false');
  });

  test('each tab carries an icon, and aria-label preserves the name when labels collapse to icon-only', () => {
    render(<ConversionInspector conversion={makeInspectorConversion()} quota={quota} />);
    const sectionsTab = screen.getByRole('tab', { name: 'Sections' });
    const exportTab = screen.getByRole('tab', { name: 'Export' });
    // Icon is rendered inside each tab button (lucide → <svg>).
    expect(sectionsTab.querySelector('svg')).toBeTruthy();
    expect(exportTab.querySelector('svg')).toBeTruthy();
    // aria-label is the accessible-name anchor that survives narrow → icon-only.
    expect(sectionsTab.getAttribute('aria-label')).toBe('Sections');
    expect(exportTab.getAttribute('aria-label')).toBe('Export');
  });

  test('default Sections tab shows Column grouping + Section name & color, hides Branding/Report title', () => {
    render(<ConversionInspector conversion={makeInspectorConversion()} quota={quota} />);
    expect(screen.getByTestId('app-columnmap')).toBeTruthy();
    expect(screen.getByText('Section name & color')).toBeTruthy();
    // Export-tab content is not mounted while Sections is active.
    expect(screen.queryByLabelText(/Accent color/i)).toBeNull();
    expect(screen.queryByLabelText(/Report title/i)).toBeNull();
    expect(screen.queryByText('Branding')).toBeNull();
  });

  test('clicking Export reveals Report title + Branding (accent color, footer, logo) and hides Sections content', () => {
    render(<ConversionInspector conversion={makeInspectorConversion()} quota={quota} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Export' }));
    expect(screen.getByLabelText(/Report title/i)).toBeTruthy();
    expect(screen.getByText('Branding')).toBeTruthy();
    expect(screen.getByLabelText(/Accent color/i)).toBeTruthy();
    expect(screen.getByLabelText(/Footer text/i)).toBeTruthy();
    expect(screen.getByLabelText(/Logo image/i)).toBeTruthy();
    // Sections-tab content is hidden while Export is active.
    expect(screen.queryByTestId('app-columnmap')).toBeNull();
    expect(screen.queryByText('Section name & color')).toBeNull();
  });

  test('header and sticky action footer stay outside the tabs (always visible)', () => {
    render(<ConversionInspector conversion={makeInspectorConversion()} quota={quota} />);
    expect(screen.getByText(/Change anything/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Update preview/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeTruthy();
    // Still there after switching tabs.
    fireEvent.click(screen.getByRole('tab', { name: 'Export' }));
    expect(screen.getByText(/Change anything/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeTruthy();
  });

  test('Left/Right arrow keys move between tabs', () => {
    render(<ConversionInspector conversion={makeInspectorConversion()} quota={quota} />);
    const sectionsTab = screen.getByRole('tab', { name: 'Sections' });
    sectionsTab.focus();
    fireEvent.keyDown(sectionsTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Export' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByLabelText(/Report title/i)).toBeTruthy();
  });
});

describe('Left rail — Outline / Recent Exports tabs', () => {
  test('renders a tablist with "Outline" and "Recent Exports"; Recent Exports is the default', () => {
    render(<WorkbenchRail conversion={makeRailConversion()} className="flex" />);
    const tablist = screen.getByRole('tablist', { name: /recent exports and outline/i });
    const outlineTab = within(tablist).getByRole('tab', { name: 'Outline' });
    const recentTab = within(tablist).getByRole('tab', { name: 'Recent Exports' });
    expect(recentTab.getAttribute('aria-selected')).toBe('true');
    expect(outlineTab.getAttribute('aria-selected')).toBe('false');
  });

  test('each tab carries an icon, and aria-label preserves the name when labels collapse to icon-only', () => {
    render(<WorkbenchRail conversion={makeRailConversion()} className="flex" />);
    const outlineTab = screen.getByRole('tab', { name: 'Outline' });
    const recentTab = screen.getByRole('tab', { name: 'Recent Exports' });
    expect(outlineTab.querySelector('svg')).toBeTruthy();
    expect(recentTab.querySelector('svg')).toBeTruthy();
    expect(outlineTab.getAttribute('aria-label')).toBe('Outline');
    expect(recentTab.getAttribute('aria-label')).toBe('Recent Exports');
  });

  test('default Recent Exports tab shows the export list + New export button', () => {
    render(<WorkbenchRail conversion={makeRailConversion()} className="flex" />);
    expect(screen.getByText('march-leads.csv')).toBeTruthy();
    expect(screen.getByRole('button', { name: /New export/i })).toBeTruthy();
    // Outline rows are not shown by default.
    expect(screen.queryByText('Customer info')).toBeNull();
  });

  test('clicking Outline reveals the rendered-sections list and hides recent exports', () => {
    render(<WorkbenchRail conversion={makeRailConversion()} className="flex" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Outline' }));
    expect(screen.getByText('Customer info')).toBeTruthy();
    expect(screen.getByText('Orders')).toBeTruthy();
    expect(screen.queryByText('march-leads.csv')).toBeNull();
    expect(screen.queryByRole('button', { name: /New export/i })).toBeNull();
  });

  test('Outline tab shows the empty state when there are no rendered sections', () => {
    render(<WorkbenchRail conversion={makeRailConversion({ renderedSections: [] })} className="flex" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Outline' }));
    expect(screen.getByText(/The document outline appears after your first render\./i)).toBeTruthy();
  });

  test('the "Processed ephemerally" footer stays outside the tabs when there is no pdfBlob', () => {
    render(<WorkbenchRail conversion={makeRailConversion({ pdfBlob: null })} className="flex" />);
    expect(screen.getByText(/Processed ephemerally/i)).toBeTruthy();
    // Still present after switching tabs.
    fireEvent.click(screen.getByRole('tab', { name: 'Outline' }));
    expect(screen.getByText(/Processed ephemerally/i)).toBeTruthy();
  });
});
