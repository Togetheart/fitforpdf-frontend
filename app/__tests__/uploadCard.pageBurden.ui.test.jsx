import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import UploadCard from '../components/UploadCard';

/**
 * Minimal prop set to render UploadCard with a completed upload in FAIL state.
 * Covers the page-burden recovery block — the dead code path that was never
 * surfaced to users before (computed but unused).
 */
function renderWithPageBurdenFail(overrides = {}) {
  const defaults = {
    toolTitle: 'Generate a client-ready PDF',
    toolSubcopy: '3 free exports. No account required.',
    file: new File(['a,b\n1,2'], 'wide-export.csv', { type: 'text/csv' }),
    freeExportsLeft: 3,
    includeBranding: true,
    truncateLongText: false,
    isLoading: false,
    hasResultBlob: false,
    onFileSelect: () => {},
    onRemoveFile: () => {},
    onBrandingChange: () => {},
    onTruncateChange: () => {},
    onSubmit: () => {},
    onDownloadAgain: () => {},
    onCopyShareLink: () => {},
    onTrySample: () => {},
    downloadedFileName: null,
    verdict: 'FAIL',
    conversionProgress: null,
    // The page-burden surface:
    failKind: 'page_burden',
    failureRecommendations: ['mode_compact', 'scope_reduce'],
    pageBurdenCopy: {
      title: 'Document too large for direct sending',
      description: 'This PDF would exceed a reasonable volume for human review.',
      primaryCta: 'Generate compact version',
      secondaryCta: 'Adjust scope (coming soon)',
    },
    onRetryCompact: vi.fn(),
    // Unused but required-ish:
    planType: 'free',
  };
  return render(<UploadCard {...defaults} {...overrides} />);
}

afterEach(() => cleanup());

describe('UploadCard — page burden FAIL surface', () => {
  test('renders the page-burden title and description', () => {
    renderWithPageBurdenFail();
    expect(
      screen.getByText('Document too large for direct sending'),
    ).toBeTruthy();
    expect(
      screen.getByText(/would exceed a reasonable volume/i),
    ).toBeTruthy();
  });

  test('renders every normalized recommendation label', () => {
    renderWithPageBurdenFail();
    expect(screen.getByText('Try compact mode.')).toBeTruthy();
    expect(screen.getByText('Reduce rows or columns.')).toBeTruthy();
  });

  test('renders a "Generate compact version" CTA that calls onRetryCompact', () => {
    const onRetryCompact = vi.fn();
    renderWithPageBurdenFail({ onRetryCompact });
    const cta = screen.getByRole('button', { name: /generate compact version/i });
    fireEvent.click(cta);
    expect(onRetryCompact).toHaveBeenCalledTimes(1);
  });

  test('does NOT render the page-burden block on a generic FAIL', () => {
    renderWithPageBurdenFail({
      failKind: 'generic',
      failureRecommendations: [],
    });
    expect(
      screen.queryByText('Document too large for direct sending'),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: /generate compact version/i }),
    ).toBeNull();
  });

  test('does NOT render the block on successful renders (no verdict)', () => {
    renderWithPageBurdenFail({
      verdict: null,
      failKind: 'none',
      failureRecommendations: [],
    });
    expect(
      screen.queryByText('Document too large for direct sending'),
    ).toBeNull();
  });
});
