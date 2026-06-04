import { afterEach, describe, expect, test, vi } from 'vitest';
import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import UploadCard from '../components/UploadCard';

const SAMPLE_FILE = new File(['invoice_id,client,total\nA102,ACME Corp,4230.00'], 'report.csv', {
  type: 'text/csv',
});

// Mirror the sibling uploadCardRetainConsent.ui.test.jsx harness mechanism: render
// UploadCard with the options panel expanded (initialOptionsExpanded), a selected
// file, and the contacts-consent props threaded through.
function renderContactsConsentHarness({
  contactsConsent = false,
  onContactsConsentChange = () => {},
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
        retainSourceConsent={false}
        onRetainConsentChange={() => {}}
        contactsConsent={contactsConsent}
        onContactsConsentChange={onContactsConsentChange}
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

describe('UploadCard contacts-consent row', () => {
  afterEach(() => {
    cleanup();
  });

  test('contacts-consent row is OFF by default', () => {
    renderContactsConsentHarness({ contactsConsent: false, onContactsConsentChange: vi.fn() });

    const row = screen.getByTestId('setting-row-contacts-consent');
    expect(row).toBeTruthy();

    // Mirror the branding-row assertion in the sibling test: the SettingRow's
    // Switch exposes role="switch" with ariaLabel === the title, and aria-checked
    // reflects the `checked` prop. OFF by default => aria-checked === 'false'.
    const consentSwitch = screen.getByRole('switch', {
      name: 'Save this file to build a contacts database (beta)',
    });
    expect(consentSwitch.getAttribute('aria-checked')).toBe('false');
  });

  test('contacts-consent row reflects ON state when opted in', () => {
    renderContactsConsentHarness({ contactsConsent: true, onContactsConsentChange: vi.fn() });

    const consentSwitch = screen.getByRole('switch', {
      name: 'Save this file to build a contacts database (beta)',
    });
    expect(consentSwitch.getAttribute('aria-checked')).toBe('true');
  });

  test('toggling the contacts-consent row calls onContactsConsentChange(true)', () => {
    const onContactsConsentChange = vi.fn();
    renderContactsConsentHarness({ contactsConsent: false, onContactsConsentChange });

    fireEvent.click(
      within(screen.getByTestId('setting-row-contacts-consent')).getByText(
        /save this file to build a contacts database/i,
      ),
    );

    expect(onContactsConsentChange).toHaveBeenCalledWith(true);
  });
});
