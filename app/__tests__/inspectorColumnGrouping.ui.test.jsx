import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import { ConversionInspector } from '../components/ConversionTool.jsx';

// Mock conversion covering the fields the Column-grouping + Section-names UI reads.
// Defaults populate sections/draft so the customization blocks render in 'auto'.
function makeConversion(overrides = {}) {
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
    columnGroupsOverride: [], setColumnGroupsOverride: () => {},
    sectionTitleOverrides: {}, setSectionTitleOverrides: () => {},
    accentColor: '', setAccentColor: () => {},
    logoFile: null, setLogoFile: () => {},
    footerText: '', setFooterText: () => {},
    handleSubmit: () => {}, handleDownloadAnyway: () => {}, handleRenderAnother: () => {},
    ...overrides,
  };
}

const quota = { planType: 'free', freeExportsLeft: 2, isQuotaLocked: false };

afterEach(() => cleanup());

describe('Column grouping — Force option removed', () => {
  test('toggle offers only Off and Auto (no Force)', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    expect(screen.getByRole('button', { name: 'Off' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Auto' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Force' })).toBeNull();
  });
});

describe('Column grouping — "Off" hides section customization', () => {
  test('Auto shows the pills, Custom sections list, and Section names', () => {
    render(<ConversionInspector conversion={makeConversion({ columnMap: 'auto' })} quota={quota} />);
    expect(screen.getByTestId('app-group-pills')).toBeTruthy();
    expect(screen.getByText('Custom sections')).toBeTruthy();
    expect(screen.getByTestId('app-custom-groups')).toBeTruthy();
    expect(screen.getByText('Section names')).toBeTruthy();
  });

  test('Off hides the pills, Custom sections list, and Section names', () => {
    render(<ConversionInspector conversion={makeConversion({ columnMap: 'off' })} quota={quota} />);
    expect(screen.queryByTestId('app-group-pills')).toBeNull();
    expect(screen.queryByText('Custom sections')).toBeNull();
    expect(screen.queryByTestId('app-custom-groups')).toBeNull();
    expect(screen.queryByText('Section names')).toBeNull();
    // The toggle itself stays so the user can switch back to Auto.
    expect(screen.getByTestId('app-columnmap')).toBeTruthy();
  });
});
