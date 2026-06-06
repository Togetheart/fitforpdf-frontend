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

test('columnMap is user-controllable (off/auto/force); invalid falls back to auto', () => {
  assert.equal(new URL(buildRenderUrl('http://localhost:3000', 'normal', { columnMap: 'off' })).searchParams.get('columnMap'), 'off');
  assert.equal(new URL(buildRenderUrl('http://localhost:3000', 'normal', { columnMap: 'force' })).searchParams.get('columnMap'), 'force');
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
