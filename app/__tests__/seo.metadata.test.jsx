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

  test('homepage title matches the send-ready positioning shown on-page (no client-ready promise)', () => {
    // S1 sprint (2026-06-10): "client-ready" left the HOME title promise —
    // the consulting segment hears corporate-grade fidelity in it (anti-scope,
    // Kunj 2026-05-28). The SEO sub-pages below keep their own wording for
    // search-intent continuity; only the home positioning pivots.
    expect(SEO.home.title).toMatch(/send-ready/i);
    expect(SEO.home.title).not.toMatch(/client-ready/i);
    expect(SEO.home.title).toMatch(/excel/i);
    expect(SEO.home.title).toMatch(/csv/i);
    expect(SEO.home.title).toMatch(/pdf/i);
  });

  test.each([
    ['developers', SEO.developers],
    ['auditors', SEO.forAuditors],
    ['consultants', SEO.forConsultants],
    ['finance', SEO.forFinance],
    ['saas', SEO.forSaas],
  ])('%s SEO title keeps the client-ready promise aligned', (_, page) => {
    expect(page.title).toMatch(/client-ready/i);
    expect(page.title).toMatch(/pdf/i);
  });
});
