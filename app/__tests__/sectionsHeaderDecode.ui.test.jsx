import { describe, test, expect } from 'vitest';

import { parseSectionsHeader } from '../hooks/useConversion.mjs';

describe('parseSectionsHeader — decodes percent-encoded section titles', () => {
  test('decodes %C2%B7 (·) back to the middle dot in titles', () => {
    const raw = JSON.stringify([
      { label: 'C', title: 'Color %C2%B7 Size %C2%B7 Availability', columns: ['Color', 'Size', 'Availability'] },
    ]);
    const [s] = parseSectionsHeader(raw);
    expect(s.title).toBe('Color · Size · Availability');
    expect(s.columns).toEqual(['Color', 'Size', 'Availability']);
  });

  test('decodes percent-encoded column names too', () => {
    const raw = JSON.stringify([{ label: 'A', title: 'X', columns: ['Soci%C3%A9t%C3%A9'] }]);
    expect(parseSectionsHeader(raw)[0].columns[0]).toBe('Société');
  });

  test('leaves a plain ASCII title unchanged', () => {
    const raw = JSON.stringify([{ label: 'A', title: 'Descriptions', columns: ['Notes'] }]);
    expect(parseSectionsHeader(raw)[0].title).toBe('Descriptions');
  });

  test('a title with a lone % is kept as-is (never throws)', () => {
    const raw = JSON.stringify([{ label: 'B', title: '50% off', columns: [] }]);
    expect(parseSectionsHeader(raw)[0].title).toBe('50% off');
  });

  test('empty / invalid header → empty array', () => {
    expect(parseSectionsHeader('')).toEqual([]);
    expect(parseSectionsHeader('not json')).toEqual([]);
  });
});
