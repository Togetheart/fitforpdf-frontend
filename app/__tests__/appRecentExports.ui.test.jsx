import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import { WorkbenchRail } from '../components/ConversionTool.jsx';

afterEach(() => cleanup());

function makeConversion(overrides = {}) {
  return {
    exportHistory: [],
    renderId: null,
    renderedSections: [],
    handleRenderAnother: () => {},
    ...overrides,
  };
}

const history = [
  { id: 'render_123', sourceFileName: 'CSV • 15.3 KB', createdAt: '2026-06-08T12:30:00.000Z', status: 'done', pdfUrl: 'https://x/1.pdf' },
  { id: 'render_999', sourceFileName: 'CSV • 15.3 KB', createdAt: '2026-06-08T09:05:00.000Z', status: 'failed', pdfUrl: '#' },
];

describe('WorkbenchRail, recent exports identifiability', () => {
  test('marks the active export (matching renderId) with aria-current + a "Current" marker', () => {
    render(<WorkbenchRail conversion={makeConversion({ exportHistory: history, renderId: 'render_123' })} className="flex" />);
    const items = screen.getAllByTestId('app-recent-export');
    expect(items).toHaveLength(2);
    const active = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(active).toHaveLength(1);
    expect(active[0].getAttribute('aria-current')).toBe('true');
    expect(active[0].textContent).toMatch(/Current/);
  });

  test('surfaces a Failed status badge for a failed export', () => {
    render(<WorkbenchRail conversion={makeConversion({ exportHistory: history, renderId: 'render_123' })} className="flex" />);
    expect(screen.getByText('Failed')).toBeTruthy();
  });

  test('surfaces a Running badge for both running and pending exports', () => {
    const inFlight = [
      { id: 'r1', sourceFileName: 'a.csv', createdAt: '2026-06-08T10:00:00.000Z', status: 'running', pdfUrl: '#' },
      { id: 'r2', sourceFileName: 'b.csv', createdAt: '2026-06-08T10:01:00.000Z', status: 'pending', pdfUrl: '#' },
    ];
    render(<WorkbenchRail conversion={makeConversion({ exportHistory: inFlight, renderId: 'x' })} className="flex" />);
    expect(screen.getAllByText('Running')).toHaveLength(2);
  });

  test('shows a HH:MM time so same-file exports are distinguishable', () => {
    render(<WorkbenchRail conversion={makeConversion({ exportHistory: history, renderId: 'render_123' })} className="flex" />);
    // TZ-agnostic: just assert a clock time is present (date alone was the old behavior).
    expect(screen.getAllByTestId('app-recent-export')[0].textContent).toMatch(/\d{1,2}:\d{2}/);
  });

  test('renders the empty state when there is no history', () => {
    render(<WorkbenchRail conversion={makeConversion()} className="flex" />);
    expect(screen.queryAllByTestId('app-recent-export')).toHaveLength(0);
    expect(screen.getByText(/No exports yet/)).toBeTruthy();
  });
});
