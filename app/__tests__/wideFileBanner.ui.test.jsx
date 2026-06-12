import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { WorkbenchRenderedCanvas } from '../components/ConversionTool.jsx';

function makeConversion(overrides = {}) {
  return {
    pdfBlob: new Blob(['%PDF']),
    file: new File(['a'], 'wide.csv', { type: 'text/csv' }),
    resolvedPdfFilename: 'wide.pdf',
    handleRenderAnother: () => {},
    debugMetrics: {},
    confidence: {},
    renderedSections: [],
    frozenDraft: [],
    allColumnsMaster: Array.from({ length: 30 }, (_, i) => `col${i + 1}`),
    excludedColumns: [],
    ...overrides,
  };
}

afterEach(() => cleanup());

describe('Wide-file banner', () => {
  test('shows for a wide, uncurated file and reports the column count', () => {
    render(<WorkbenchRenderedCanvas conversion={makeConversion()} quota={{}} onEditOptions={() => {}} />);
    const banner = screen.getByTestId('app-wide-file-banner');
    expect(banner.textContent).toContain('30 columns');
  });

  test('clicking the action calls onEditOptions', () => {
    const onEditOptions = vi.fn();
    render(<WorkbenchRenderedCanvas conversion={makeConversion()} quota={{}} onEditOptions={onEditOptions} />);
    fireEvent.click(screen.getByRole('button', { name: /choose which columns/i }));
    expect(onEditOptions).toHaveBeenCalled();
  });

  test('hidden once the user has curated (excludedColumns non-empty)', () => {
    render(<WorkbenchRenderedCanvas conversion={makeConversion({ excludedColumns: ['col5'] })} quota={{}} onEditOptions={() => {}} />);
    expect(screen.queryByTestId('app-wide-file-banner')).toBeNull();
  });

  test('hidden for a narrow file', () => {
    render(<WorkbenchRenderedCanvas conversion={makeConversion({ allColumnsMaster: ['a', 'b', 'c'] })} quota={{}} onEditOptions={() => {}} />);
    expect(screen.queryByTestId('app-wide-file-banner')).toBeNull();
  });
});
