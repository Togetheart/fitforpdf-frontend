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

describe('ConversionInspector — branding + logo controls', () => {
  test('branding toggle reflects includeBranding and flips it (one-click no-logo)', () => {
    const setIncludeBranding = vi.fn();
    render(<ConversionInspector conversion={makeConversion({ includeBranding: true, setIncludeBranding })} quota={quota} />);
    const toggle = screen.getByTestId('app-branding-toggle');
    expect(toggle.checked).toBe(true);
    fireEvent.click(toggle);
    expect(setIncludeBranding).toHaveBeenCalledWith(false);
  });

  test('renders the logo validation error when present', () => {
    render(<ConversionInspector conversion={makeConversion({ logoError: 'Logo trop lourd : 256 Ko maximum.' })} quota={quota} />);
    expect(screen.getByTestId('app-logo-error').textContent).toMatch(/256 Ko/);
  });

  test('shows "Retirer le logo" when a logo is set and calls removeLogo', () => {
    const removeLogo = vi.fn();
    render(<ConversionInspector
      conversion={makeConversion({ logoFile: new File(['x'], 'logo.png', { type: 'image/png' }), removeLogo })}
      quota={quota}
    />);
    fireEvent.click(screen.getByTestId('app-logo-remove'));
    expect(removeLogo).toHaveBeenCalled();
  });

  test('no "Retirer le logo" button when no logo is selected', () => {
    render(<ConversionInspector conversion={makeConversion({ logoFile: null })} quota={quota} />);
    expect(screen.queryByTestId('app-logo-remove')).toBeNull();
  });
});
