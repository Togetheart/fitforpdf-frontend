import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildRenderUrl,
  getFailKind,
  getPageBurdenUiCopy,
  isPageBurdenFail,
  normalizePageBurdenRecommendations,
  recommendationLabel,
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
  assert.equal(copy.title, 'Document trop volumineux pour un envoi direct');
  assert.equal(copy.primaryCta, 'Générer une version compacte');
});

test('compact CTA rerenders with mode=compact and columnMap=force', () => {
  const url = new URL(buildRenderUrl('http://localhost:3000', 'compact'));
  assert.equal(url.pathname, '/render');
  assert.equal(url.searchParams.get('mode'), 'compact');
  assert.equal(url.searchParams.get('columnMap'), 'force');
  assert.equal(url.searchParams.get('mode'), 'compact');
});

test('truncate_long_text opt-in appends request param when enabled', () => {
  const url = new URL(buildRenderUrl('http://localhost:3000', 'normal', { truncateLongText: true }));
  assert.equal(url.pathname, '/render');
  assert.equal(url.searchParams.get('truncate_long_text'), 'true');
  assert.equal(url.searchParams.get('columnMap'), 'force');
});

test('truncate_long_text is absent by default and remains opt-in only', () => {
  const normalUrl = new URL(buildRenderUrl('http://localhost:3000', 'normal'));
  assert.equal(normalUrl.searchParams.get('columnMap'), 'force');
  assert.equal(normalUrl.searchParams.get('truncate_long_text'), null);

  const optimizedUrl = new URL(buildRenderUrl('http://localhost:3000', 'optimized'));
  assert.equal(optimizedUrl.searchParams.get('truncate_long_text'), null);
  assert.equal(optimizedUrl.searchParams.get('mode'), 'optimized');
  assert.equal(optimizedUrl.searchParams.get('columnMap'), 'force');
});

test('buildRenderUrl supports same-origin proxy base paths', () => {
  const compactPath = buildRenderUrl('/api', 'compact');
  assert.equal(compactPath.startsWith('/api/render?'), true);
  assert.equal(compactPath.includes('mode=compact'), true);
  assert.equal(compactPath.includes('columnMap=force'), true);

  const normalPath = buildRenderUrl('/api', 'normal');
  assert.equal(normalPath, '/api/render?columnMap=force');
  const normalUrl = new URL(normalPath, 'http://localhost');
  assert.equal(normalUrl.searchParams.get('columnMap'), 'force');
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
  assert.equal(recommendationLabel('mode_compact'), 'Essayez le mode compact.');
  assert.equal(recommendationLabel('scope_reduce'), 'Réduisez le nombre de lignes ou de colonnes.');
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
