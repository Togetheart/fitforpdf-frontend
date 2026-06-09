import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

// Mock the lazy PDF renderer so the test never loads pdf.js; we drive both the
// success (image) and failure (fallback) paths deterministically.
vi.mock('../lib/pdfPreviewImage.mjs', () => ({ renderPdfFirstPageImage: vi.fn() }));
import { renderPdfFirstPageImage } from '../lib/pdfPreviewImage.mjs';
import { PdfPreviewPane } from '../components/ConversionTool.jsx';

function setMatchMedia({ mobile }) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: (q) => ({
      matches: mobile && /max-width/.test(q),
      media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() {},
    }),
  });
}

beforeEach(() => {
  setMatchMedia({ mobile: true });
  if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock';
  if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {};
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });

describe('PdfPreviewPane, inline first-page image on mobile', () => {
  test('shows the rendered first-page image inline when rendering succeeds', async () => {
    renderPdfFirstPageImage.mockResolvedValue('data:image/png;base64,AAAA');
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" />);
    const img = await screen.findByTestId('app-pdf-preview-mobile-image');
    expect(img.getAttribute('src')).toBe('data:image/png;base64,AAAA');
    // Still offers a way to open the full PDF.
    expect(screen.getByTestId('app-pdf-preview-mobile-open')).toBeTruthy();
  });

  test('falls back to an iOS-safe Open-PDF link when rendering returns null', async () => {
    renderPdfFirstPageImage.mockResolvedValue(null);
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" />);
    await waitFor(() => expect(screen.getByTestId('app-pdf-preview-mobile-open')).toBeTruthy());
    expect(screen.queryByTestId('app-pdf-preview-mobile-image')).toBeNull();
    // No `download` / `target=_blank` — those break blob PDFs on iOS Safari; the
    // link is a same-tab navigation that iOS renders.
    const open = screen.getByTestId('app-pdf-preview-mobile-open');
    expect(open.getAttribute('download')).toBeNull();
    expect(open.getAttribute('target')).toBeNull();
  });

  test('does not attempt image rendering on desktop widths (keeps the <object> embed)', async () => {
    setMatchMedia({ mobile: false });
    render(<PdfPreviewPane pdfBlob={blob} filename="report.pdf" />);
    // The desktop inline embed is still present.
    expect(await screen.findByTestId('app-pdf-preview')).toBeTruthy();
    expect(renderPdfFirstPageImage).not.toHaveBeenCalled();
  });
});
