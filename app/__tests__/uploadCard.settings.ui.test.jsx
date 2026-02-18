import React, { useState } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import UploadCard from '../components/UploadCard';

afterEach(() => {
  cleanup();
});

function SettingsHarness({
  initialBranding = true,
  initialTruncate = false,
  isPro = true,
}) {
  return function Harness() {
    const [branding, setBranding] = useState(initialBranding);
    const [truncate, setTruncate] = useState(initialTruncate);

    return (
      <UploadCard
        toolTitle="Generate a client-ready PDF"
        toolSubcopy="Free exports. No account required."
        file={null}
        freeExportsLeft={3}
        includeBranding={branding}
        truncateLongText={truncate}
        isLoading={false}
        hasResultBlob={false}
        onFileSelect={() => {}}
        onRemoveFile={() => {}}
        onBrandingChange={setBranding}
        onTruncateChange={setTruncate}
        onSubmit={() => {}}
        onDownloadAgain={() => {}}
        onTrySample={() => {}}
        downloadedFileName={null}
        verdict={null}
        isPro={isPro}
        initialOptionsExpanded
      />
    );
  };
}

describe('UploadCard settings row smoke tests', () => {
  test('renders both setting switches and keeps stable row layout classes', () => {
    const Harness = SettingsHarness({ initialBranding: true, initialTruncate: false });
    render(<Harness />);

    const brandingSwitch = screen.getByRole('switch', { name: 'Branding' });
    const truncateSwitch = screen.getByRole('switch', { name: 'Truncate long text' });

    expect(screen.getByText('Adds a lightweight brand treatment by default')).toBeTruthy();
    expect(screen.getByText('Auto-crops very long content to keep layout stable')).toBeTruthy();

    expect(brandingSwitch.getAttribute('aria-checked')).toBe('true');
    expect(truncateSwitch.getAttribute('aria-checked')).toBe('false');
    expect(Boolean(brandingSwitch.closest('div.w-12'))).toBe(true);
    expect(Boolean(truncateSwitch.closest('div.w-12'))).toBe(true);
    expect(brandingSwitch.getAttribute('type')).toBe('button');
  });

  test('toggles branding via text row click', () => {
    const Harness = SettingsHarness({ initialBranding: true, initialTruncate: false });
    render(<Harness />);

    const brandingSwitch = screen.getByRole('switch', { name: 'Branding' });
    const brandingRow = screen.getByTestId('setting-row-branding');
    const brandingTitle = within(brandingRow).getByText('Branding');

    expect(brandingSwitch.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(brandingTitle);
    expect(brandingSwitch.getAttribute('aria-checked')).toBe('false');
  });

  test('row is not keyboard-focusable while switch remains accessible', () => {
    const Harness = SettingsHarness({ initialBranding: true, initialTruncate: false });
    render(<Harness />);

    const brandingRow = screen.getByTestId('setting-row-branding');
    const brandingSwitch = screen.getByRole('switch', { name: 'Branding' });

    expect(brandingRow.getAttribute('tabindex')).toBe('-1');
    fireEvent.keyDown(brandingRow, { key: ' ' });
    fireEvent.keyDown(brandingRow, { key: 'Enter' });

    expect(brandingSwitch.getAttribute('aria-checked')).toBe('true');
  });

  test('toggles reach all four combinations via click', () => {
    const Harness = SettingsHarness({ initialBranding: true, initialTruncate: false });
    render(<Harness />);

    const brandingSwitch = screen.getByRole('switch', { name: 'Branding' });
    const truncateSwitch = screen.getByRole('switch', { name: 'Truncate long text' });

    expect(brandingSwitch.getAttribute('aria-checked')).toBe('true');
    expect(truncateSwitch.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(truncateSwitch);
    expect(brandingSwitch.getAttribute('aria-checked')).toBe('true');
    expect(truncateSwitch.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(brandingSwitch);
    expect(brandingSwitch.getAttribute('aria-checked')).toBe('false');
    expect(truncateSwitch.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(truncateSwitch);
    expect(brandingSwitch.getAttribute('aria-checked')).toBe('false');
    expect(truncateSwitch.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(brandingSwitch);
    expect(brandingSwitch.getAttribute('aria-checked')).toBe('true');
    expect(truncateSwitch.getAttribute('aria-checked')).toBe('false');
  });
});
