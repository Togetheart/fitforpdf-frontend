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

describe('Section name & color editor (native color picker)', () => {
  test('renames the inspector section "Section names" -> "Section name & color"', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    expect(screen.getByText('Section name & color')).toBeTruthy();
    expect(screen.queryByText('Section names')).toBeNull();
  });

  test('renders a native color picker (type=color) per section row', () => {
    render(<ConversionInspector conversion={makeConversion()} quota={quota} />);
    const editor = screen.getByTestId('app-section-rename');
    const pickers = within(editor).getAllByLabelText(/^Color for section /);
    expect(pickers.length).toBe(2);
    expect(pickers[0].getAttribute('type')).toBe('color');
  });

  test('changing the picker calls setSectionColor with the row index and the chosen hex (free-form)', () => {
    const conversion = makeConversion();
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const editor = screen.getByTestId('app-section-rename');
    fireEvent.change(within(editor).getByLabelText('Color for section 2'), { target: { value: '#123456' } });
    expect(conversion.setSectionColor).toHaveBeenCalledWith(1, '#123456');
  });

  test('the picker value reflects the chosen color, else the section positional default', () => {
    const conversion = makeConversion({
      sectionDraft: [
        { title: 'Info', columns: ['c1'], color: '#123456' },
        { title: 'Orders', columns: ['c2'] },
      ],
    });
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const editor = screen.getByTestId('app-section-rename');
    expect(within(editor).getByLabelText('Color for section 1').value.toLowerCase()).toBe('#123456');
    // No override -> positional default for index 1 = SECTION_COLOR_HEXES[1] (#0D9488).
    expect(within(editor).getByLabelText('Color for section 2').value.toLowerCase())
      .toBe(SECTION_COLOR_HEXES[1].toLowerCase());
  });

  test('"Reset" clears the chosen color (empty hex) for that section', () => {
    const conversion = makeConversion({
      sectionDraft: [
        { title: 'Info', columns: ['c1'], color: '#EF4444' },
        { title: 'Orders', columns: ['c2'] },
      ],
    });
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const editor = screen.getByTestId('app-section-rename');
    fireEvent.click(within(editor).getByLabelText('Reset color for section 1'));
    expect(conversion.setSectionColor).toHaveBeenCalledWith(0, '');
  });

  test('pills use the chosen color inline when set, else the positional palette class', () => {
    const conversion = makeConversion({
      sectionDraft: [
        { title: 'Info', columns: ['c1'], color: '#EF4444' },
        { title: 'Orders', columns: ['c2'] },
      ],
    });
    render(<ConversionInspector conversion={conversion} quota={quota} />);
    const pills = screen.getByTestId('app-group-pills');
    const pillEls = within(pills).getAllByText(/^Section /);
    // jsdom normalizes inline colors to rgb(): #EF4444 -> rgb(239, 68, 68).
    expect(pillEls[0].style.backgroundColor).toBe('rgb(239, 68, 68)'); // chosen -> inline
    expect(pillEls[1].className).toContain('bg-teal-600'); // default (index 1) -> class
  });
});
