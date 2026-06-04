import { afterEach, describe, expect, test, vi } from 'vitest';
import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import UploadCard from '../components/UploadCard';

const SAMPLE_FILE = new File(['invoice_id,client,total\nA102,ACME Corp,4230.00'], 'report.csv', {
  type: 'text/csv',
});

// Mirror the sibling uploadCard.ui.test.jsx harness mechanism: render UploadCard
// with the options panel expanded (initialOptionsExpanded), a selected file, and
// the retain-consent props threaded through.
function renderRetainConsentHarness({
  retainSourceConsent = false,
  onRetainConsentChange = () => {},
} = {}) {
  function Harness() {
    const [currentFile, setCurrentFile] = useState(SAMPLE_FILE);
    const [brandingEnabled, setBrandingEnabled] = useState(true);
    const [truncateEnabled, setTruncateEnabled] = useState(false);

    return (
      <UploadCard
        toolTitle="Generate a client-ready PDF"
        toolSubcopy="Free exports. No account required."
        file={currentFile}
        freeExportsLeft={3}
        includeBranding={brandingEnabled}
        truncateLongText={truncateEnabled}
        isLoading={false}
        hasResultBlob={false}
        onFileSelect={setCurrentFile}
        onRemoveFile={() => setCurrentFile(null)}
        onBrandingChange={setBrandingEnabled}
        onTruncateChange={setTruncateEnabled}
        retainSourceConsent={retainSourceConsent}
        onRetainConsentChange={onRetainConsentChange}
        onSubmit={() => {}}
        onDownloadAgain={() => {}}
        onCopyShareLink={() => {}}
        onTrySample={() => {}}
        downloadedFileName={null}
        verdict={null}
        conversionProgress={null}
        onBuyCredits={() => {}}
        isPro
        onEvent={() => {}}
        onUpgrade={() => {}}
        planType="free"
        initialOptionsExpanded
        exportHistory={[]}
        renderId={null}
        shareState={{ status: 'idle', jobId: null }}
      />
    );
  }
  render(<Harness />);
}

describe('UploadCard retain-source-consent row', () => {
  afterEach(() => {
    cleanup();
  });

  test('retain-consent row is OFF by default', () => {
    renderRetainConsentHarness({ retainSourceConsent: false, onRetainConsentChange: vi.fn() });

    const row = screen.getByTestId('setting-row-retain-consent');
    expect(row).toBeTruthy();

    // Mirror the branding-row assertion in the sibling test: the SettingRow's
    // Switch exposes role="switch" with ariaLabel === the title, and aria-checked
    // reflects the `checked` prop. OFF by default => aria-checked === 'false'.
    const consentSwitch = screen.getByRole('switch', { name: 'Keep my source file (7 days)' });
    expect(consentSwitch.getAttribute('aria-checked')).toBe('false');
  });

  test('retain-consent row reflects ON state when opted in', () => {
    renderRetainConsentHarness({ retainSourceConsent: true, onRetainConsentChange: vi.fn() });

    const consentSwitch = screen.getByRole('switch', { name: 'Keep my source file (7 days)' });
    expect(consentSwitch.getAttribute('aria-checked')).toBe('true');
  });

  test('toggling the retain-consent row calls onRetainConsentChange(true)', () => {
    const onRetainConsentChange = vi.fn();
    renderRetainConsentHarness({ retainSourceConsent: false, onRetainConsentChange });

    fireEvent.click(
      within(screen.getByTestId('setting-row-retain-consent')).getByText(/keep my source file/i),
    );

    expect(onRetainConsentChange).toHaveBeenCalledWith(true);
  });
});
