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
});
