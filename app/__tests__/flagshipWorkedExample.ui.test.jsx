import { describe, test, expect, afterEach } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import ExcelCutoffPage from '../excel-to-pdf-columns-cut-off/page.jsx';
import FitOnePagePage from '../fit-excel-sheet-on-one-page-pdf/page.jsx';

afterEach(() => cleanup());

describe.each([
  ['excel-to-pdf-columns-cut-off', ExcelCutoffPage],
  ['fit-excel-sheet-on-one-page-pdf', FitOnePagePage],
])('%s worked example', (_, Component) => {
  test('renders a worked-example section ahead of the FAQ', () => {
    render(<Component />);
    expect(screen.getByTestId('seo-example')).toBeTruthy();
    expect(screen.getByTestId('seo-faq')).toBeTruthy();
  });

  test('labels the diagram as conceptual without invented measurements or completeness claims', () => {
    const { container } = render(<Component />);
    const example = screen.getByTestId('seo-example').textContent;
    expect(example).toMatch(/conceptual/i);
    expect(example).not.toMatch(/\d+\s*(?:%|pt|columns|sections|col\b)|all\s+\d+\s+columns/i);
    const article = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((script) => JSON.parse(script.textContent))
      .find((data) => data['@type'] === 'Article');
    expect(article.dateModified).toBe('2026-09-23');
  });
});
