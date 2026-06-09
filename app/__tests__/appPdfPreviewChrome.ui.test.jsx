import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen, fireEvent, within } from '@testing-library/react';

import { PdfPreviewPane } from '../components/ConversionTool.jsx';

// Desktop viewport (matchMedia max-width → false) so the inline <object> + chrome
// render and MobilePdfPreview takes its no-op fallback (no pdf.js load).
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() {} }),
  });
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
  if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {};
});
afterEach(() => { cleanup(); document.body.style.overflow = ''; });

const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });

describe('PdfPreviewPane, viewer chrome', () => {
  test('shows the page count, pluralized', () => {
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" pageCount={26} />);
    expect(screen.getByText(/26 pages/)).toBeTruthy();
  });

  test('singularizes a one-page count', () => {
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" pageCount={1} />);
    expect(screen.getByText(/·\s*1 page$/)).toBeTruthy();
  });

  test('omits the page count when none is known', () => {
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" />);
    expect(screen.queryByText(/pages?$/)).toBeNull();
  });

  test('Open opens in a new tab; Download carries the filename', () => {
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" pageCount={3} />);
    const open = screen.getByTestId('app-pdf-open');
    expect(open.getAttribute('target')).toBe('_blank');
    expect(open.getAttribute('rel')).toMatch(/noopener/);
    expect(screen.getByTestId('app-pdf-download-inline').getAttribute('download')).toBe('report.pdf');
  });

  test('Fullscreen opens an overlay dialog; Escape and Close both dismiss it', () => {
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" pageCount={3} />);
    expect(screen.queryByTestId('app-pdf-fullscreen-overlay')).toBeNull();

    fireEvent.click(screen.getByTestId('app-pdf-fullscreen'));
    const overlay = screen.getByTestId('app-pdf-fullscreen-overlay');
    expect(overlay.getAttribute('role')).toBe('dialog');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('app-pdf-fullscreen-overlay')).toBeNull();

    fireEvent.click(screen.getByTestId('app-pdf-fullscreen'));
    expect(screen.getByTestId('app-pdf-fullscreen-overlay')).toBeTruthy();
    fireEvent.click(screen.getByTestId('app-pdf-fullscreen-close'));
    expect(screen.queryByTestId('app-pdf-fullscreen-overlay')).toBeNull();
  });

  test('locks body scroll while fullscreen is open and restores the previous value on close', () => {
    document.body.style.overflow = 'scroll';
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" pageCount={3} />);
    fireEvent.click(screen.getByTestId('app-pdf-fullscreen'));
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('scroll');
  });

  test('moves focus into the dialog on open and restores it to the trigger on close', () => {
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" pageCount={3} />);
    const trigger = screen.getByTestId('app-pdf-fullscreen');
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByTestId('app-pdf-fullscreen-close'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
  });

  test('the fullscreen toolbar keeps the safe Open/Download attributes (separate from the inline toolbar)', () => {
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" pageCount={3} />);
    fireEvent.click(screen.getByTestId('app-pdf-fullscreen'));
    const overlay = screen.getByTestId('app-pdf-fullscreen-overlay');
    const open = within(overlay).getByRole('link', { name: /open pdf in a new tab/i });
    expect(open.getAttribute('target')).toBe('_blank');
    expect(open.getAttribute('rel')).toMatch(/noopener/);
    expect(within(overlay).getByRole('link', { name: /download pdf/i }).getAttribute('download')).toBe('report.pdf');
  });

  test('a removed preview (pdfBlob → null) closes the overlay and does not auto-reopen for a new blob', () => {
    const { rerender } = render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" pageCount={3} />);
    fireEvent.click(screen.getByTestId('app-pdf-fullscreen'));
    expect(screen.getByTestId('app-pdf-fullscreen-overlay')).toBeTruthy();

    rerender(<PdfPreviewPane pdfBlob={null} filename="report.pdf" pageCount={3} />);
    expect(screen.queryByTestId('app-pdf-fullscreen-overlay')).toBeNull();
    expect(screen.queryByTestId('app-pdf-preview')).toBeNull();

    const blob2 = new Blob(['%PDF-1.4 v2'], { type: 'application/pdf' });
    rerender(<PdfPreviewPane pdfBlob={blob2} filename="report2.pdf" pageCount={5} />);
    expect(screen.queryByTestId('app-pdf-fullscreen-overlay')).toBeNull();
    expect(screen.getByTestId('app-pdf-preview')).toBeTruthy();
  });
});
