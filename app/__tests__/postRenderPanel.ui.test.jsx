import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import UploadCard from '../components/UploadCard';

/**
 * Locks the CEO-validated post-render UX contract:
 *
 *   - OK heading "Your client-ready PDF is ready"
 *   - WARN heading "PDF ready — quick check recommended"
 *   - score / verdict / pages / shape (rows×cols) shown when available
 *   - primary Download PDF button
 *   - secondary Render another file button
 *   - dedicated post-render pricing + contact CTAs (separate from nav)
 *   - no review/share link in the primary post-render decision row
 *   - trust line: "No storage · No LLM · Files processed ephemerally."
 */

function baseProps(overrides = {}) {
  return {
    toolTitle: 'Generate a client-ready PDF',
    toolSubcopy: 'Free exports. No account required.',
    file: null,
    freeExportsLeft: 3,
    includeBranding: true,
    truncateLongText: false,
    isLoading: false,
    hasResultBlob: true,
    onFileSelect: () => {},
    onRemoveFile: () => {},
    onBrandingChange: () => {},
    onTruncateChange: () => {},
    onSubmit: () => {},
    onDownloadAgain: vi.fn(),
    onRenderAnother: vi.fn(),
    onPostRenderPricingClick: vi.fn(),
    onPostRenderContactClick: vi.fn(),
    onCopyShareLink: vi.fn(),
    onTrySample: () => {},
    downloadedFileName: 'customers-100.pdf',
    verdict: 'OK',
    conversionProgress: null,
    renderId: 'rid_show',
    shareState: { status: 'idle', jobId: null },
    confidence: {
      verdict: 'OK',
      score: 92,
      reasons: [],
      metrics: { rowCount: 240, columnCount: 12 },
    },
    debugMetrics: { pageCount: 8 },
    wasDemoLastUpload: false,
    ...overrides,
  };
}

function clickLinkWithoutNavigation(link) {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  event.preventDefault();
  link.dispatchEvent(event);
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('PostRenderPanel — UploadCard success state', () => {
  test('shows the success heading, score, verdict, pages and shape', () => {
    render(<UploadCard {...baseProps()} />);
    const panel = screen.getByTestId('post-render-panel');
    expect(panel).toBeTruthy();
    expect(panel.textContent).toContain('Your client-ready PDF is ready');
    expect(panel.textContent).toContain('Ready: customers-100.pdf');
    expect(panel.textContent).not.toContain('Downloaded:');
    const summary = screen.getByTestId('post-render-summary');
    expect(summary.textContent).toContain('OK');
    expect(summary.textContent).toContain('92/100');
    expect(summary.textContent).toContain('8'); // pages
    expect(summary.textContent).toContain('240×12');
    expect(summary.getAttribute('class')).toContain('flex');
  });

  test('WARN result is honest without implying the PDF can be edited', () => {
    render(<UploadCard {...baseProps({
      verdict: 'WARN',
      confidence: {
        verdict: 'WARN',
        score: 80,
        reasons: [],
        metrics: { rowCount: 240, columnCount: 12 },
      },
    })} />);

    const panel = screen.getByTestId('post-render-panel');
    expect(panel.textContent).toContain('PDF ready — quick check recommended');
    expect(panel.textContent).toContain('Download it and confirm the layout is acceptable before sending.');
    expect(panel.textContent).not.toContain('Your client-ready PDF is ready');
    expect(panel.textContent).not.toContain('Some columns may need');
    expect(panel.textContent).not.toContain('80/100');
    expect(panel.textContent).not.toContain('WARN');
    expect(panel.textContent).not.toContain('Layout confidence');
    expect(panel.textContent).not.toContain('Medium');
    expect(screen.queryByTestId('post-render-summary')).toBeNull();
    expect(screen.getByTestId('post-render-status-icon')).toBeTruthy();
    expect(panel.getAttribute('class') || '').not.toContain('border-amber');
  });

  test('Download PDF calls onDownloadAgain', () => {
    const props = baseProps();
    render(<UploadCard {...props} />);
    fireEvent.click(screen.getByTestId('download-again'));
    expect(props.onDownloadAgain).toHaveBeenCalledTimes(1);
  });

  test('Render another file calls onRenderAnother', () => {
    const props = baseProps();
    render(<UploadCard {...props} />);
    const renderAnother = screen.getByTestId('render-another');
    expect(renderAnother.getAttribute('class') || '').not.toContain('w-full');
    fireEvent.click(renderAnother);
    expect(props.onRenderAnother).toHaveBeenCalledTimes(1);
  });

  test('does not show the unclear review link in the post-render decision row', () => {
    const props = baseProps();
    render(<UploadCard {...props} />);
    expect(screen.queryByTestId('copy-review-link')).toBeNull();
    expect(screen.queryByText(/copy review link/i)).toBeNull();
    expect(props.onCopyShareLink).not.toHaveBeenCalled();
  });

  test('post-render pricing link calls onPostRenderPricingClick and is separate from nav', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const props = baseProps();
    render(<UploadCard {...props} />);
    const pricingLink = screen.getByTestId('post-render-pricing');
    expect(pricingLink.getAttribute('href')).toBe('/pricing');
    clickLinkWithoutNavigation(pricingLink);
    expect(props.onPostRenderPricingClick).toHaveBeenCalledTimes(1);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(consoleError).not.toHaveBeenCalled();
  });

  test('post-render contact link calls onPostRenderContactClick', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const props = baseProps();
    render(<UploadCard {...props} />);
    const contactLink = screen.getByTestId('post-render-contact');
    expect(contactLink.getAttribute('href')).toBe('/contact');
    clickLinkWithoutNavigation(contactLink);
    expect(props.onPostRenderContactClick).toHaveBeenCalledTimes(1);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(consoleError).not.toHaveBeenCalled();
  });

  test('post-render intent row keeps pricing highlighted and other actions quiet', () => {
    render(<UploadCard {...baseProps()} />);
    const pricingLink = screen.getByTestId('post-render-pricing');
    const contactLink = screen.getByTestId('post-render-contact');

    expect(pricingLink.getAttribute('class') || '').toContain('text-emerald-200');
    expect(contactLink.getAttribute('class') || '').toContain('text-white/50');
  });

  test('trust copy is present next to the result', () => {
    render(<UploadCard {...baseProps()} />);
    const panel = screen.getByTestId('post-render-panel');
    expect(panel.textContent).toContain('No storage');
    expect(panel.textContent).toContain('No LLM');
    expect(panel.textContent).toContain('ephemerally');
  });

  test('demo success keeps its compact strip and does not show the result panel', () => {
    const props = baseProps({ wasDemoLastUpload: true });
    render(<UploadCard {...props} />);
    expect(screen.queryByTestId('post-render-panel')).toBeNull();
    expect(screen.getByTestId('demo-success-strip')).toBeTruthy();
  });

  test('summary only renders the cells whose values are known', () => {
    const props = baseProps({
      confidence: { verdict: 'OK', score: null, reasons: [], metrics: null },
      debugMetrics: null,
    });
    render(<UploadCard {...props} />);
    const summary = screen.getByTestId('post-render-summary');
    expect(summary.textContent).toContain('OK');
    expect(summary.textContent).not.toContain('/100');
  });
});
