import { describe, test, expect, afterEach } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import ExcelCutoffPage from '../excel-to-pdf-columns-cut-off/page.jsx';
import FitOnePagePage from '../fit-excel-sheet-on-one-page-pdf/page.jsx';
import CsvPdfPage from '../csv-to-structured-pdf/page.jsx';
import AuditPdfPage from '../audit-report-excel-to-pdf-tips/page.jsx';
import { SEO } from '../siteCopy.mjs';

afterEach(() => cleanup());

const pages = [
  { Component: ExcelCutoffPage, meta: SEO.excelCutoff, h1: /cuts off columns/i },
  { Component: FitOnePagePage, meta: SEO.fitOnePage, h1: /fit a large excel/i },
  { Component: CsvPdfPage, meta: SEO.csvPdf, h1: /csv.*structured/i },
  { Component: AuditPdfPage, meta: SEO.auditPdf, h1: /audit.*excel/i },
];

describe.each(pages)('SEO page: $meta.slug', ({ Component, h1 }) => {
  test('renders h1 matching page intent', () => {
    render(<Component />);
    expect(screen.getByRole('heading', { level: 1, name: h1 })).toBeTruthy();
    cleanup();
  });

  test('has FAQ section', () => {
    render(<Component />);
    expect(screen.getByTestId('seo-faq')).toBeTruthy();
    cleanup();
  });

  test('has CTA linking to home', () => {
    render(<Component />);
    expect(screen.getByTestId('seo-cta').querySelector('a[href="/"]')).toBeTruthy();
    cleanup();
  });
});
