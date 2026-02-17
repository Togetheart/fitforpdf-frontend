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
}) {
  return function Harness() {
    const [branding, setBranding] = useState(initialBranding);
    const [truncate, setTruncate] = useState(initialTruncate);

    return (
      <UploadCard
        toolTitle="Generate a client-ready PDF"
        toolSubcopy="3 free exports. No account."
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
    const brandingTooltip = screen.getByRole('button', { name: 'Branding info' });
    const truncateTooltip = screen.getByRole('button', { name: 'Truncate long text info' });

    expect(screen.getByText('Adds a lightweight brand treatment by default')).toBeTruthy();
    expect(screen.getByText('Auto-crops very long content to keep layout stable')).toBeTruthy();

    expect(brandingSwitch.getAttribute('aria-checked')).toBe('true');
    expect(truncateSwitch.getAttribute('aria-checked')).toBe('false');
    expect(Boolean(brandingSwitch.closest('div.w-12'))).toBe(true);
    expect(Boolean(truncateSwitch.closest('div.w-12'))).toBe(true);
    expect(brandingSwitch.getAttribute('type')).toBe('button');

    expect(brandingTooltip.getAttribute('aria-label')).toBe('Branding info');
    expect(truncateTooltip.getAttribute('aria-label')).toBe('Truncate long text info');
  });

  test('toggles branding via text row and not via tooltip click', () => {
    const Harness = SettingsHarness({ initialBranding: true, initialTruncate: false });
    render(<Harness />);

    const brandingSwitch = screen.getByRole('switch', { name: 'Branding' });
    const brandingRow = screen.getByTestId('setting-row-branding');
    const brandingTitle = within(brandingRow).getByText('Branding');
    const brandingTooltip = screen.getByRole('button', { name: 'Branding info' });

    expect(brandingSwitch.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(brandingTooltip);
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
