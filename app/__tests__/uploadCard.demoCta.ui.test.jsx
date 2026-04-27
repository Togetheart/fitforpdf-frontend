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

describe('UploadCard — try-your-file CTA after demo', () => {
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
});
