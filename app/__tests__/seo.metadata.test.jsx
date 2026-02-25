import { describe, test, expect } from 'vitest';
import { SEO } from '../siteCopy.mjs';

describe('SEO constants', () => {
  test('siteUrl is production domain', () => {
    expect(SEO.siteUrl).toBe('https://www.fitforpdf.com');
  });

  test.each(['home', 'pricing', 'privacy', 'excelCutoff', 'fitOnePage', 'csvPdf', 'auditPdf'])(
    '%s has title and description',
    (page) => {
      expect(typeof SEO[page].title).toBe('string');
      expect(SEO[page].title.length).toBeGreaterThan(10);
      expect(typeof SEO[page].description).toBe('string');
      expect(SEO[page].description.length).toBeGreaterThan(30);
    },
  );

  test('content page slugs are defined', () => {
    expect(SEO.excelCutoff.slug).toBe('excel-to-pdf-columns-cut-off');
    expect(SEO.fitOnePage.slug).toBe('fit-excel-sheet-on-one-page-pdf');
    expect(SEO.csvPdf.slug).toBe('csv-to-structured-pdf');
    expect(SEO.auditPdf.slug).toBe('audit-report-excel-to-pdf-tips');
  });
});
