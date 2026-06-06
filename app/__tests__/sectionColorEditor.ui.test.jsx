import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { ConversionInspector } from '../components/ConversionTool.jsx';
import { SECTION_COLOR_HEXES } from '../pageUiLogic.mjs';

// Mock conversion covering the fields the Section-name-&-color editor reads.
function makeConversion(overrides = {}) {
  return {
    pdfBlob: new Blob(['%PDF']),
    file: new File(['a,b\n1,2'], 'a.csv', { type: 'text/csv' }),
    isLoading: false,
    reportTitle: '', setReportTitle: () => {},
    columnMap: 'auto', setColumnMap: () => {},
    renderedSections: [
      { label: 'A', title: 'Info', columns: ['c1'] },
      { label: 'B', title: 'Orders', columns: ['c2'] },
    ],
    renderedFrozenColumns: [],
    sectionDraft: [
      { title: 'Info', columns: ['c1'] },
      { title: 'Orders', columns: ['c2'] },
    ],
    frozenDraft: [],
    reassignSectionColumn: () => {}, reorderSection: () => {}, renameSection: () => {},
    setSectionColor: vi.fn(),
    accentColor: '', setAccentColor: () => {},
    logoFile: null, setLogoFile: () => {},
    footerText: '', setFooterText: () => {},
    handleSubmit: () => {}, handleDownloadAnyway: () => {}, handleRenderAnother: () => {},
    ...overrides,
  };
}

const quota = { planType: 'free', freeExportsLeft: 2, isQuotaLocked: false };

afterEach(() => cleanup());

describe('Section name & color editor', () => {
  test('renames the inspector section "Section names" -> "Section name & color"', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    expect(screen.getByText('Section name & color')).toBeTruthy();
    expect(screen.queryByText('Section names')).toBeNull();
  });

  test('renders a swatch picker with the preset palette per section row', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    const editor = screen.getByTestId('app-section-rename');
    // Every preset hex is offered as a swatch for the first section (index 0).
    for (const hex of SECTION_COLOR_HEXES) {
      expect(within(editor).getByRole('button', { name: `Color section 1 ${hex}` })).toBeTruthy();
    }
    // Plus a "default" (clear) option per row.
    expect(within(editor).getByRole('button', { name: 'Default color for section 1' })).toBeTruthy();
  });

  test('clicking a swatch calls setSectionColor with the row index and the chosen hex', () => {
    const conversion = makeConversion();
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const editor = screen.getByTestId('app-section-rename');
    fireEvent.click(within(editor).getByRole('button', { name: 'Color section 2 #EF4444' }));
    expect(conversion.setSectionColor).toHaveBeenCalledWith(1, '#EF4444');
  });

  test('clicking "default" calls setSectionColor with an empty hex (clears the choice)', () => {
    const conversion = makeConversion();
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const editor = screen.getByTestId('app-section-rename');
    fireEvent.click(within(editor).getByRole('button', { name: 'Default color for section 1' }));
    expect(conversion.setSectionColor).toHaveBeenCalledWith(0, '');
  });

  test('pills use the section CHOSEN color when set, else the positional palette', () => {
    const conversion = makeConversion({
      // Section A recolored red (#EF4444 = index 3 -> bg-red-500); B left default
      // (index 1 -> bg-green-500).
      sectionDraft: [
        { title: 'Info', columns: ['c1'], color: '#EF4444' },
        { title: 'Orders', columns: ['c2'] },
      ],
    });
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const pills = screen.getByTestId('app-group-pills');
    const pillEls = within(pills).getAllByText(/^Section /);
    expect(pillEls[0].className).toContain('bg-red-500'); // chosen
    expect(pillEls[1].className).toContain('bg-green-500'); // positional default (B)
  });
});
