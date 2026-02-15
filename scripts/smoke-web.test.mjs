import { describe, expect, test } from 'vitest';

import { buildSmokeUrl, parseContentDispositionFilename } from './smoke-web.mjs';

describe('smoke-web URL builder and header parser', () => {
  test('builds /api URLs with query params', () => {
    const url = buildSmokeUrl('https://www.fitforpdf.com', '/api/render', {
      mode: 'compact',
      columnMap: 'force',
    });
    expect(url).toBe('https://www.fitforpdf.com/api/render?mode=compact&columnMap=force');
  });

  test('parses content-disposition filename from common variants', () => {
    expect(parseContentDispositionFilename('attachment; filename="customers-100.pdf"')).toBe('customers-100.pdf');
    expect(parseContentDispositionFilename("attachment; filename*=UTF-8''customers-100.pdf")).toBe(
      'customers-100.pdf',
    );
  });
});
