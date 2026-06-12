import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { ConversionInspector } from '../components/ConversionTool.jsx';

// Mock conversion covering the fields the Columns picker reads.
function makeConversion(overrides = {}) {
  return {
    pdfBlob: new Blob(['%PDF']),
    file: new File(['a,b\n1,2'], 'a.csv', { type: 'text/csv' }),
    isLoading: false,
    reportTitle: '', setReportTitle: () => {},
    columnMap: 'auto', setColumnMap: () => {},
    renderedSections: [
      { label: 'A', title: 'Info', columns: ['Name', 'Email'] },
      { label: 'B', title: 'Orders', columns: ['Phone', 'Keywords'] },
    ],
    renderedFrozenColumns: ['Name'],
    sectionDraft: [
      { title: 'Info', columns: ['Name', 'Email'] },
      { title: 'Orders', columns: ['Phone', 'Keywords'] },
    ],
    frozenDraft: ['Name'],
    allColumnsMaster: ['Name', 'Email', 'Phone', 'Keywords'],
    excludedColumns: [],
    toggleColumnIncluded: vi.fn(),
    includeAllColumns: vi.fn(),
    excludeAllColumns: vi.fn(),
    reassignSectionColumn: () => {}, reorderSection: () => {}, renameSection: () => {},
    setSectionColor: () => {},
    accentColor: '', setAccentColor: () => {},
    logoFile: null, setLogoFile: () => {},
    footerText: '', setFooterText: () => {},
    handleSubmit: () => {}, handleDownloadAnyway: () => {}, handleRenderAnother: () => {},
    ...overrides,
  };
}

const quota = { planType: 'free', freeExportsLeft: 2, isQuotaLocked: false, loaded: true };

afterEach(() => cleanup());

describe('Columns picker', () => {
  test('lists every master column as a checkbox, all checked by default', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    const boxes = within(picker).getAllByRole('checkbox');
    expect(boxes).toHaveLength(4);
    expect(boxes.every((b) => b.checked)).toBe(true);
  });

  test('counter shows included / total', () => {
    render(<ConversionInspector conversion={makeConversion({ excludedColumns: ['Keywords'] })} quota={quota} />);
    expect(screen.getByTestId('app-columns-counter').textContent).toContain('3 / 4');
  });

  test('an excluded column renders unchecked', () => {
    render(<ConversionInspector conversion={makeConversion({ excludedColumns: ['Keywords'] })} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    const kw = within(picker).getByRole('checkbox', { name: 'Keywords' });
    expect(kw.checked).toBe(false);
  });

  test('toggling a checkbox calls toggleColumnIncluded with the column name', () => {
    const conversion = makeConversion();
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    fireEvent.click(within(picker).getByRole('checkbox', { name: 'Email' }));
    expect(conversion.toggleColumnIncluded).toHaveBeenCalledWith('Email');
  });

  test('Clear and Select all call the right handlers', () => {
    const conversion = makeConversion({ excludedColumns: ['Email'] });
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    fireEvent.click(within(picker).getByRole('button', { name: /clear/i }));
    expect(conversion.excludeAllColumns).toHaveBeenCalled();
    fireEvent.click(within(picker).getByRole('button', { name: /select all/i }));
    expect(conversion.includeAllColumns).toHaveBeenCalled();
  });

  test('search filters the visible columns', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    fireEvent.change(within(picker).getByLabelText('Search columns'), { target: { value: 'mail' } });
    const boxes = within(picker).getAllByRole('checkbox');
    expect(boxes).toHaveLength(1);
    expect(within(picker).getByRole('checkbox', { name: 'Email' })).toBeTruthy();
  });

  test('a frozen column shows a "fixed" badge', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    const picker = screen.getByTestId('app-columns-picker');
    // "Name" is in frozenDraft -> a fixed badge appears in its row
    const nameRow = within(picker).getByRole('checkbox', { name: 'Name' }).closest('label');
    expect(within(nameRow).getByText(/fixed/i)).toBeTruthy();
  });
});
