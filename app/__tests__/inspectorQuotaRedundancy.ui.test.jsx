import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import { ConversionInspector } from '../components/ConversionTool.jsx';

// Minimal fake conversion covering every field ConversionInspector + its
// sub-components (CustomGroupsControl, InspectorSection) read.
function makeConversion() {
  return {
    pdfBlob: new Blob(['%PDF']),
    file: new File(['a,b\n1,2'], 'a.csv', { type: 'text/csv' }),
    isLoading: false,
    reportTitle: '', setReportTitle: () => {},
    columnMap: 'auto', setColumnMap: () => {},
    renderedSections: [], renderedFrozenColumns: [],
    columnGroupsOverride: [], setColumnGroupsOverride: () => {},
    sectionTitleOverrides: {}, setSectionTitleOverrides: () => {},
    accentColor: '', setAccentColor: () => {},
    logoFile: null, setLogoFile: () => {},
    footerText: '', setFooterText: () => {},
    handleSubmit: () => {}, handleDownloadAnyway: () => {}, handleRenderAnother: () => {},
  };
}

afterEach(() => cleanup());

describe('ConversionInspector — single paywall message (no duplicate)', () => {
  test('quota locked: amber lock line shows, grey quota summary is hidden', () => {
    render(
      <ConversionInspector
        conversion={makeConversion()}
        quota={{ planType: 'free', freeExportsLeft: 0, isQuotaLocked: true }}
      />,
    );
    // Contextual paywall message stays.
    expect(screen.getByTestId('app-inspector-quota-lock')).toBeTruthy();
    // The redundant bottom "Free - 0 exports left - View pricing" line is gone.
    expect(screen.queryByText(/View pricing/i)).toBeNull();
    expect(screen.queryByText(/Free - 0 exports left/i)).toBeNull();
  });

  test('not locked: inspector shows neither a quota summary nor a lock line (quota moved to the canvas chip)', () => {
    render(
      <ConversionInspector
        conversion={makeConversion()}
        quota={{ planType: 'free', freeExportsLeft: 2, isQuotaLocked: false }}
      />,
    );
    expect(screen.queryByTestId('app-inspector-quota-lock')).toBeNull();
    // The exports-remaining readout moved OUT of the inspector to the canvas quota
    // chip (so it's visible on mobile too); the inspector no longer repeats it.
    expect(screen.queryByText(/View pricing/i)).toBeNull();
    expect(screen.queryByText(/Free - 2 exports left/i)).toBeNull();
  });
});
