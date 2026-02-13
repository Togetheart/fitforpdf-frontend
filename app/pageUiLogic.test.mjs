import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildRenderUrl,
  getFailKind,
  getPageBurdenUiCopy,
  isPageBurdenFail,
  normalizePageBurdenRecommendations,
  recommendationLabel,
} from './pageUiLogic.mjs';

test('shows page burden message and compact CTA on page_burden_high FAIL', () => {
  const confidence = { verdict: 'FAIL', reasons: ['page_burden_high'] };
  assert.equal(isPageBurdenFail(confidence), true);
  assert.equal(getFailKind(confidence), 'page_burden');

  const copy = getPageBurdenUiCopy();
  assert.equal(copy.title, 'Document trop volumineux pour un envoi direct');
  assert.equal(copy.primaryCta, 'Générer une version compacte');
});

test('compact CTA rerenders with mode=compact and columnMap=auto', () => {
  const url = new URL(buildRenderUrl('http://localhost:3000', 'compact'));
  assert.equal(url.pathname, '/render');
  assert.equal(url.searchParams.get('mode'), 'compact');
  assert.equal(url.searchParams.get('columnMap'), 'auto');
  assert.equal(url.searchParams.get('mode'), 'compact');
});

test('truncate_long_text opt-in appends request param when enabled', () => {
  const url = new URL(buildRenderUrl('http://localhost:3000', 'normal', { truncateLongText: true }));
  assert.equal(url.pathname, '/render');
  assert.equal(url.searchParams.get('truncate_long_text'), 'true');
});

test('truncate_long_text is absent by default and remains opt-in only', () => {
  const normalUrl = new URL(buildRenderUrl('http://localhost:3000', 'normal'));
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
  assert.equal(normalPath, '/api/render');
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
