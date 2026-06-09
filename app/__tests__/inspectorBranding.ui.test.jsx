import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';

import { ConversionInspector } from '../components/ConversionTool.jsx';

function makeConversion(overrides = {}) {
  return {
    pdfBlob: new Blob(['%PDF']),
    file: new File(['a,b\n1,2'], 'a.csv', { type: 'text/csv' }),
    isLoading: false,
    reportTitle: '', setReportTitle: () => {},
    columnMap: 'auto', setColumnMap: () => {},
    renderedSections: [], renderedFrozenColumns: [], columnGroupsOverride: [], setColumnGroupsOverride: () => {},
    sectionTitleOverrides: {}, setSectionTitleOverrides: () => {},
    accentColor: '', setAccentColor: () => {},
    logoFile: null, logoError: '', handleLogoSelect: () => {}, removeLogo: () => {}, setLogoFile: () => {},
    includeBranding: true, setIncludeBranding: () => {},
    footerText: '', setFooterText: () => {},
    handleSubmit: () => {}, handleDownloadAnyway: () => {}, handleRenderAnother: () => {},
    ...overrides,
  };
}

const quota = { planType: 'api_enterprise', freeExportsLeft: null, isQuotaLocked: false };

afterEach(() => cleanup());

// Branding lives behind the inspector's "Export" tab (Phase 3). Open it first.
function openExportTab() {
  fireEvent.click(screen.getByRole('tab', { name: 'Export' }));
}

describe('ConversionInspector, branding + logo controls', () => {
  test('branding toggle reflects includeBranding and flips it (one-click no-logo)', () => {
    const setIncludeBranding = vi.fn();
    render(<ConversionInspector conversion={makeConversion({ includeBranding: true, setIncludeBranding })} quota={quota} />);
    openExportTab();
    const toggle = screen.getByTestId('app-branding-toggle');
    // Now an accessible switch (role="switch" + aria-checked) rather than a
    // right-aligned native checkbox.
    expect(toggle.getAttribute('role')).toBe('switch');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(toggle);
    expect(setIncludeBranding).toHaveBeenCalledWith(false);
  });

  test('renders the logo validation error when present', () => {
    render(<ConversionInspector conversion={makeConversion({ logoError: 'Logo too large: 256 KB max.' })} quota={quota} />);
    openExportTab();
    expect(screen.getByTestId('app-logo-error').textContent).toMatch(/256 KB/);
  });

  test('shows "Remove logo" when a logo is set and calls removeLogo', () => {
    const removeLogo = vi.fn();
    render(<ConversionInspector
      conversion={makeConversion({ logoFile: new File(['x'], 'logo.png', { type: 'image/png' }), removeLogo })}
      quota={quota}
    />);
    openExportTab();
    fireEvent.click(screen.getByTestId('app-logo-remove'));
    expect(removeLogo).toHaveBeenCalled();
  });

  test('no "Remove logo" button when no logo is selected', () => {
    render(<ConversionInspector conversion={makeConversion({ logoFile: null })} quota={quota} />);
    openExportTab();
    expect(screen.queryByTestId('app-logo-remove')).toBeNull();
  });
});
