import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import UploadCard from '../components/UploadCard';

/**
 * Demo → upload conversion CTA.
 * The dashboard shows demo-to-upload conversion at 0%. After a demo PDF is
 * displayed, we want a clear "Try with your file" button that scrolls/focuses
 * the user back to the dropzone.
 */

function baseProps(overrides = {}) {
  return {
    toolTitle: 'Generate a client-ready PDF',
    toolSubcopy: '3 free exports.',
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
    onDownloadAgain: () => {},
    onCopyShareLink: () => {},
    onTrySample: () => {},
    downloadedFileName: 'enterprise-invoices-demo.pdf',
    verdict: 'OK',
    conversionProgress: null,
    planType: 'free',
    /* The new props that drive the CTA: */
    wasDemoLastUpload: true,
    onTryYourFile: vi.fn(),
    ...overrides,
  };
}

afterEach(() => cleanup());

describe('UploadCard, try-your-file CTA after demo', () => {
  test('renders the CTA when wasDemoLastUpload=true and result blob is present', () => {
    render(<UploadCard {...baseProps()} />);
    const cta = screen.getByTestId('try-your-file-cta');
    expect(cta).toBeTruthy();
    expect(cta.textContent.toLowerCase()).toMatch(/try.*your.*file|essaie.*ton.*fichier/);
  });

  test('CTA click invokes onTryYourFile', () => {
    const onTryYourFile = vi.fn();
    render(<UploadCard {...baseProps({ onTryYourFile })} />);
    fireEvent.click(screen.getByTestId('try-your-file-cta'));
    expect(onTryYourFile).toHaveBeenCalledTimes(1);
  });

  test('CTA is hidden when wasDemoLastUpload=false (regular upload flow)', () => {
    render(<UploadCard {...baseProps({ wasDemoLastUpload: false })} />);
    expect(screen.queryByTestId('try-your-file-cta')).toBeNull();
  });

  test('CTA is hidden when there is no result blob yet', () => {
    render(<UploadCard {...baseProps({ hasResultBlob: false, downloadedFileName: null })} />);
    expect(screen.queryByTestId('try-your-file-cta')).toBeNull();
  });

  test('default onTryYourFile prop is a no-op when omitted (no crash)', () => {
    const props = baseProps();
    delete props.onTryYourFile;
    expect(() => {
      render(<UploadCard {...props} />);
      fireEvent.click(screen.getByTestId('try-your-file-cta'));
    }).not.toThrow();
  });

  /* Demo state UX redesign — single-decision interface.
   * In wasDemoLastUpload state, we want the user's only loud option to be
   * "now upload your file". The big celebration, Download Again primary
   * button, share link, and feedback prompt all distract from that. */
  describe('demo state hides distracting result widgets', () => {
    test('hides the big "PDF generated successfully!" celebration', () => {
      render(<UploadCard {...baseProps()} />);
      expect(screen.queryByText(/pdf generated successfully/i)).toBeNull();
    });

    test('hides the prominent "Download again" primary button', () => {
      render(<UploadCard {...baseProps()} />);
      expect(screen.queryByTestId('download-again')).toBeNull();
    });

    test('hides the "Copy review link" button (sharing demo data is meaningless)', () => {
      render(<UploadCard {...baseProps({ renderId: 'rid_42' })} />);
      expect(screen.queryByText(/copy review link/i)).toBeNull();
      expect(screen.queryByText(/creating review link/i)).toBeNull();
    });

    test('still offers a discrete way to download the demo PDF', () => {
      const onDownloadAgain = vi.fn();
      render(<UploadCard {...baseProps({ onDownloadAgain })} />);
      const link = screen.getByTestId('demo-download-link');
      expect(link.textContent.toLowerCase()).toMatch(/download.*demo/);
      fireEvent.click(link);
      expect(onDownloadAgain).toHaveBeenCalledTimes(1);
    });
  });

  describe('demo state collapses the upload chrome (no decision noise)', () => {
    test('hides the security H1 ("Uploading client data?...") in dark variant', () => {
      render(<UploadCard {...baseProps({ variant: 'dark', freeExportsLeft: 1 })} />);
      expect(screen.queryByText(/uploading client data/i)).toBeNull();
    });

    test('hides the file input pill (drop zone + filename + gear)', () => {
      render(<UploadCard {...baseProps()} />);
      expect(screen.queryByTestId('options-accordion-toggle')).toBeNull();
      expect(screen.queryByTestId('generate-file-input')).toBeNull();
    });

    test('hides the redundant "Generate PDF" submit button', () => {
      render(<UploadCard {...baseProps()} />);
      expect(screen.queryByText(/generate pdf/i)).toBeNull();
    });

    test('hides the buy-credits cart icon even when freeExportsLeft <= 1', () => {
      render(<UploadCard {...baseProps({ freeExportsLeft: 1 })} />);
      expect(screen.queryByTestId('quota-buy-slot')).toBeNull();
    });
  });

  describe('regular (non-demo) success state uses the post-render panel', () => {
    test('shows the post-render result panel, download CTA, ready filename, and no review link', () => {
      render(<UploadCard {...baseProps({
        wasDemoLastUpload: false,
        renderId: 'rid_real',
        downloadedFileName: 'real-export.pdf',
      })} />);
      expect(screen.getByTestId('post-render-panel')).toBeTruthy();
      expect(screen.getByText(/your client-ready pdf is ready/i)).toBeTruthy();
      expect(screen.getByTestId('download-again')).toBeTruthy();
      expect(screen.getByTestId('download-again').textContent).toMatch(/download pdf/i);
      expect(screen.getByText(/ready: real-export\.pdf/i)).toBeTruthy();
      expect(screen.queryByTestId('copy-review-link')).toBeNull();
      expect(screen.queryByText(/copy review link/i)).toBeNull();
    });

    test('does NOT render the demo download link in regular flow', () => {
      render(<UploadCard {...baseProps({ wasDemoLastUpload: false })} />);
      expect(screen.queryByTestId('demo-download-link')).toBeNull();
    });
  });
});
