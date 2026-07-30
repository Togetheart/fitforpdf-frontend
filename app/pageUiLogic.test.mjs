import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildRenderUrl,
  getFailKind,
  getPageBurdenUiCopy,
  isPageBurdenFail,
  normalizePageBurdenRecommendations,
  recommendationLabel,
  reorder,
  buildGroupingPayload,
  reassignColumn,
  FIXED_GROUP_LABEL,
  SECTION_COLOR_CLASSES,
  SECTION_COLOR_HEXES,
  sectionColorClasses,
  buildIncludeColumns,
} from './pageUiLogic.mjs';
import {
  canExport,
  freeLeft,
  getUsedCount,
  incrementUsedCount,
} from './paywall.mjs';

function withMockStorage() {
  const original = globalThis.localStorage;
  const store = new Map();
  const storage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
  globalThis.localStorage = storage;
  return {
    restore: () => {
      globalThis.localStorage = original;
    },
  };
}

test('shows page burden message and compact CTA on page_burden_high FAIL', () => {
  const confidence = { verdict: 'FAIL', reasons: ['page_burden_high'] };
  assert.equal(isPageBurdenFail(confidence), true);
  assert.equal(getFailKind(confidence), 'page_burden');

  const copy = getPageBurdenUiCopy();
  assert.equal(copy.title, 'Document too large for direct sending');
  assert.equal(copy.primaryCta, 'Generate compact version');
});

test('compact CTA rerenders with mode=compact and columnMap default auto', () => {
  const url = new URL(buildRenderUrl('http://localhost:3000', 'compact'));
  assert.equal(url.pathname, '/render');
  assert.equal(url.searchParams.get('mode'), 'compact');
  // Default is 'auto' (the proxy historically overrode the old 'force' to auto).
  assert.equal(url.searchParams.get('columnMap'), 'auto');
});

test('columnMap is user-controllable (off/auto); legacy/invalid (incl. force) falls back to auto', () => {
  assert.equal(new URL(buildRenderUrl('http://localhost:3000', 'normal', { columnMap: 'off' })).searchParams.get('columnMap'), 'off');
  assert.equal(new URL(buildRenderUrl('http://localhost:3000', 'normal', { columnMap: 'force' })).searchParams.get('columnMap'), 'auto');
  assert.equal(new URL(buildRenderUrl('http://localhost:3000', 'normal', { columnMap: 'bogus' })).searchParams.get('columnMap'), 'auto');
  assert.equal(new URL(buildRenderUrl('http://localhost:3000', 'normal')).searchParams.get('columnMap'), 'auto');
});

test('truncate_long_text opt-in appends request param when enabled', () => {
  const url = new URL(buildRenderUrl('http://localhost:3000', 'normal', { truncateLongText: true }));
  assert.equal(url.pathname, '/render');
  assert.equal(url.searchParams.get('truncate_long_text'), 'true');
  assert.equal(url.searchParams.get('columnMap'), 'auto');
});

test('truncate_long_text is absent by default and remains opt-in only', () => {
  const normalUrl = new URL(buildRenderUrl('http://localhost:3000', 'normal'));
  assert.equal(normalUrl.searchParams.get('columnMap'), 'auto');
  assert.equal(normalUrl.searchParams.get('truncate_long_text'), null);

  const optimizedUrl = new URL(buildRenderUrl('http://localhost:3000', 'optimized'));
  assert.equal(optimizedUrl.searchParams.get('truncate_long_text'), null);
  assert.equal(optimizedUrl.searchParams.get('mode'), 'optimized');
  assert.equal(optimizedUrl.searchParams.get('columnMap'), 'auto');
});

test('buildRenderUrl supports same-origin proxy base paths', () => {
  const compactPath = buildRenderUrl('/api', 'compact');
  assert.equal(compactPath.startsWith('/api/render?'), true);
  assert.equal(compactPath.includes('mode=compact'), true);
  assert.equal(compactPath.includes('columnMap=auto'), true);

  const normalPath = buildRenderUrl('/api', 'normal');
  assert.equal(normalPath, '/api/render?columnMap=auto');
  const normalUrl = new URL(normalPath, 'http://localhost');
  assert.equal(normalUrl.searchParams.get('columnMap'), 'auto');
  assert.equal(normalUrl.searchParams.get('mode'), null);
});

test('generic FAIL still uses generic fail path', () => {
  const confidence = { verdict: 'FAIL', reasons: ['high_wrap_rate'] };
  assert.equal(isPageBurdenFail(confidence), false);
  assert.equal(getFailKind(confidence), 'generic');
});

test('normalizes legacy and coded recommendations for page burden', () => {
  const recommendations = normalizePageBurdenRecommendations([
    'Try mode=compact.',
    'Reduce rows or columns scope before export.',
    'mode_compact',
  ]);
  assert.deepEqual(recommendations, ['mode_compact', 'scope_reduce']);
  assert.equal(recommendationLabel('mode_compact'), 'Try compact mode.');
  assert.equal(recommendationLabel('scope_reduce'), 'Reduce rows or columns.');
});

test('export count increments only on success only', () => {
  const storage = withMockStorage();
  assert.equal(getUsedCount(), 0);
  assert.equal(freeLeft(), 3);

  incrementUsedCount();
  assert.equal(getUsedCount(), 1);
  assert.equal(freeLeft(), 2);

  const beforeFailure = getUsedCount();
  assert.equal(canExport(), true);
  assert.equal(beforeFailure, getUsedCount());

  storage.restore();
});

test('blocks after 3 successful exports (no fetch called)', () => {
  const storage = withMockStorage();
  incrementUsedCount();
  incrementUsedCount();
  incrementUsedCount();

  let fetchCalled = false;
  if (canExport()) {
    fetchCalled = true;
  }

  assert.equal(getUsedCount(), 3);
  assert.equal(freeLeft(), 0);
  assert.equal(fetchCalled, false);
  storage.restore();
});

test('free exports left computed correctly', () => {
  const storage = withMockStorage();

  incrementUsedCount();
  assert.equal(getUsedCount(), 1);
  assert.equal(freeLeft(), 2);
  incrementUsedCount();
  assert.equal(getUsedCount(), 2);
  assert.equal(freeLeft(), 1);
  incrementUsedCount();
  assert.equal(getUsedCount(), 3);
  assert.equal(freeLeft(), 0);

  storage.restore();
});

// --- Section reorder v2: position-based pure helpers ---

test('reorder moves an item forward / backward / no-op, without mutating', () => {
  assert.deepEqual(reorder(['A', 'B', 'C'], 0, 2), ['B', 'C', 'A']);
  assert.deepEqual(reorder(['A', 'B', 'C'], 2, 0), ['C', 'A', 'B']);
  const input = ['A', 'B', 'C'];
  const out = reorder(input, 1, 1);
  assert.deepEqual(out, ['A', 'B', 'C']);
  assert.deepEqual(input, ['A', 'B', 'C']);
  assert.deepEqual(reorder(['A', 'B'], 5, 0), ['A', 'B']); // bounds-safe
});

test('buildGroupingPayload: positional labels + titles, Fixed appended', () => {
  const sectionDraft = [
    { columns: ['cat'], title: 'Cat' },
    { columns: ['desc'], title: 'Descriptions' },
  ];
  const { columnGroups, sectionTitles } = buildGroupingPayload({ sectionDraft, frozenColumns: ['id'] });
  assert.deepEqual(columnGroups, [
    { label: 'A', columns: ['cat'] },
    { label: 'B', columns: ['desc'] },
    { label: FIXED_GROUP_LABEL, columns: ['id'] },
  ]);
  assert.deepEqual(sectionTitles, { A: 'Cat', B: 'Descriptions' });
});

test('buildGroupingPayload: reordered draft -> columnGroups + titles follow the new order', () => {
  const sectionDraft = [
    { columns: ['desc'], title: 'Descriptions' },
    { columns: ['cat'], title: 'Cat' },
  ];
  const { columnGroups, sectionTitles } = buildGroupingPayload({ sectionDraft, frozenColumns: [] });
  assert.deepEqual(columnGroups, [
    { label: 'A', columns: ['desc'] },
    { label: 'B', columns: ['cat'] },
  ]);
  // 'Cat' is now the SECOND section -> positional label B (no drift).
  assert.deepEqual(sectionTitles, { A: 'Descriptions', B: 'Cat' });
});

test('buildGroupingPayload: blank titles are omitted', () => {
  const { sectionTitles } = buildGroupingPayload({
    sectionDraft: [{ columns: ['a'], title: '' }, { columns: ['b'], title: '  ' }],
    frozenColumns: [],
  });
  assert.deepEqual(sectionTitles, {});
});

test('reassignColumn: move a column to another section', () => {
  const r = reassignColumn({
    sectionDraft: [{ columns: ['a', 'x'], title: 'A' }, { columns: ['b'], title: 'B' }],
    frozenColumns: [],
    column: 'x',
    target: 1,
  });
  assert.deepEqual(r.sectionDraft, [{ columns: ['a'], title: 'A' }, { columns: ['b', 'x'], title: 'B' }]);
  assert.deepEqual(r.frozenColumns, []);
});

test('reassignColumn: move a column to Fixed, and back to a section', () => {
  const toFixed = reassignColumn({
    sectionDraft: [{ columns: ['a', 'x'], title: 'A' }],
    frozenColumns: [],
    column: 'x',
    target: 'fixed',
  });
  assert.deepEqual(toFixed.frozenColumns, ['x']);
  assert.deepEqual(toFixed.sectionDraft, [{ columns: ['a'], title: 'A' }]);

  const back = reassignColumn({
    sectionDraft: [{ columns: ['a'], title: 'A' }],
    frozenColumns: ['x'],
    column: 'x',
    target: 0,
  });
  assert.deepEqual(back.frozenColumns, []);
  assert.deepEqual(back.sectionDraft, [{ columns: ['a', 'x'], title: 'A' }]);
});

test('reassignColumn: target past the end creates a new section; emptied sections are dropped', () => {
  const r = reassignColumn({
    sectionDraft: [{ columns: ['only'], title: 'A' }, { columns: ['b'], title: 'B' }],
    frozenColumns: [],
    column: 'only',
    target: 2, // === length -> new section
  });
  // 'only' left section 0 (now empty -> dropped) and became a new trailing section.
  assert.deepEqual(r.sectionDraft, [{ columns: ['b'], title: 'B' }, { columns: ['only'], title: '' }]);
});

// --- Section colors must mirror the backend PDF palette ---
// Guards that the workbench options show the EXACT colors the PDF prints, using the
// curated "inked" editorial palette (A ink-blue, B teal, C ochre, D rose, …). Keep
// in sync with fitforpdf-backend/src/pdfRenderer.js SECTION_COLOR_PALETTE.
test('section color palette mirrors the curated backend PDF palette (A ink-blue, B teal, C ochre, D rose)', () => {
  assert.equal(sectionColorClasses(0).pill, 'bg-blue-700');
  assert.equal(sectionColorClasses(1).pill, 'bg-teal-600');
  assert.equal(sectionColorClasses(2).pill, 'bg-amber-600');
  assert.equal(sectionColorClasses(3).pill, 'bg-rose-600');
  assert.equal(sectionColorClasses(4).pill, 'bg-violet-600');
});

test('section colors cycle and are bounds-safe', () => {
  const n = SECTION_COLOR_CLASSES.length;
  assert.equal(sectionColorClasses(n).pill, sectionColorClasses(0).pill); // wraps
  assert.equal(sectionColorClasses('x').pill, SECTION_COLOR_CLASSES[0].pill); // non-finite -> first
  for (const c of SECTION_COLOR_CLASSES) {
    assert.match(c.pill, /^bg-/);
    assert.match(c.name, /^text-/);
  }
});

// --- Editable section colors (free-form native picker) ---

test('SECTION_COLOR_HEXES is index-aligned with SECTION_COLOR_CLASSES (strong hexes)', () => {
  assert.equal(SECTION_COLOR_HEXES.length, SECTION_COLOR_CLASSES.length);
  // Spot-check the palette mirrors the backend SECTION_COLOR_PALETTE strong hexes.
  assert.equal(SECTION_COLOR_HEXES[0], '#1D4ED8'); // A ink blue
  assert.equal(SECTION_COLOR_HEXES[1], '#0D9488'); // B teal
  assert.equal(SECTION_COLOR_HEXES[2], '#D97706'); // C ochre
  assert.equal(SECTION_COLOR_HEXES[3], '#E11D48'); // D rose
  for (const hex of SECTION_COLOR_HEXES) {
    assert.match(hex, /^#[0-9A-F]{6}$/);
  }
});

test('buildGroupingPayload returns sectionColors for ANY valid hex (free-form), omits blank/invalid', () => {
  const sectionDraft = [
    { columns: ['cat'], title: 'Cat', color: '#EF4444' },   // preset -> kept
    { columns: ['desc'], title: 'Descriptions' },           // no color -> omitted
    { columns: ['color'], title: 'Colors', color: '' },     // blank -> omitted
    { columns: ['size'], title: 'Sizes', color: 'nope' },   // invalid -> omitted
    { columns: ['sku'], title: 'SKUs', color: '#123456' },  // free-form (non-preset) -> kept
    { columns: ['ean'], title: 'EANs', color: '#8b5cf6' },  // lower-case -> kept
  ];
  const { sectionColors } = buildGroupingPayload({ sectionDraft, frozenColumns: [] });
  // Positional labels: index 0->A, 4->E, 5->F.
  assert.deepEqual(sectionColors, { A: '#EF4444', E: '#123456', F: '#8b5cf6' });
});

test('buildGroupingPayload omits sectionColors map entries when no section has a color', () => {
  const { sectionColors } = buildGroupingPayload({
    sectionDraft: [{ columns: ['a'], title: 'A' }, { columns: ['b'], title: 'B' }],
    frozenColumns: [],
  });
  assert.deepEqual(sectionColors, {});
});

test('reassignColumn preserves each section color field', () => {
  const r = reassignColumn({
    sectionDraft: [
      { columns: ['a', 'x'], title: 'A', color: '#EF4444' },
      { columns: ['b'], title: 'B', color: '#22C55E' },
    ],
    frozenColumns: [],
    column: 'x',
    target: 1,
  });
  assert.deepEqual(r.sectionDraft, [
    { columns: ['a'], title: 'A', color: '#EF4444' },
    { columns: ['b', 'x'], title: 'B', color: '#22C55E' },
  ]);
});

test('reorder preserves the color field on moved sections (operates on whole objects)', () => {
  const draft = [
    { columns: ['a'], title: 'A', color: '#EF4444' },
    { columns: ['b'], title: 'B', color: '#22C55E' },
    { columns: ['c'], title: 'C', color: '#F59E0B' },
  ];
  const out = reorder(draft, 0, 2);
  assert.deepEqual(out, [
    { columns: ['b'], title: 'B', color: '#22C55E' },
    { columns: ['c'], title: 'C', color: '#F59E0B' },
    { columns: ['a'], title: 'A', color: '#EF4444' },
  ]);
});

test('buildIncludeColumns: omits when nothing is excluded (render all)', () => {
  assert.equal(buildIncludeColumns({ allColumns: ['a', 'b', 'c'], excludedColumns: [] }), null);
});

test('buildIncludeColumns: returns the kept columns when some are excluded', () => {
  assert.deepEqual(
    buildIncludeColumns({ allColumns: ['a', 'b', 'c', 'd'], excludedColumns: ['b', 'd'] }),
    ['a', 'c'],
  );
});

test('buildIncludeColumns: omits when every column is excluded (never send an empty list)', () => {
  assert.equal(buildIncludeColumns({ allColumns: ['a', 'b'], excludedColumns: ['a', 'b'] }), null);
});

test('buildIncludeColumns: omits when the master list is empty', () => {
  assert.equal(buildIncludeColumns({ allColumns: [], excludedColumns: ['a'] }), null);
});

test('buildIncludeColumns: stale excluded names (not in master) do not curate', () => {
  // excluded names that are not in allColumns -> kept === all -> omit
  assert.equal(buildIncludeColumns({ allColumns: ['a', 'b'], excludedColumns: ['x', 'y'] }), null);
});

test('buildIncludeColumns: tolerates missing / malformed args', () => {
  assert.equal(buildIncludeColumns(), null);
  assert.equal(buildIncludeColumns({}), null);
  assert.equal(buildIncludeColumns({ allColumns: ['a'], excludedColumns: null }), null);
});

test('resolveResubmitMode: Update preview keeps the active render mode (QA ISSUE-003: 33→36 pages on unchanged regeneration)', async () => {
  const { resolveResubmitMode } = await import('./pageUiLogic.mjs');
  // A PDF exists → this is a re-render of the same content: keep the mode.
  assert.equal(resolveResubmitMode(true, 'compact'), 'compact');
  assert.equal(resolveResubmitMode(true, 'optimized'), 'optimized');
  // Fresh upload (no existing PDF) → default mode.
  assert.equal(resolveResubmitMode(false, 'compact'), 'normal');
  assert.equal(resolveResubmitMode(true, null), 'normal');
});
