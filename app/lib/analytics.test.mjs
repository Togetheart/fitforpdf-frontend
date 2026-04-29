import assert from 'node:assert/strict';
import test from 'node:test';

import {
  trackDemoFileUsed,
  trackDemoPdfShown,
  trackRenderCompleted,
  trackUploadAfterDemo,
  trackUploadStarted,
} from './analytics.mjs';

function withMockPostHog() {
  const calls = [];
  const originalWindow = globalThis.window;
  globalThis.window = {
    posthog: {
      capture(event, properties) {
        calls.push({ event, properties });
      },
    },
  };
  return {
    calls,
    restore: () => {
      globalThis.window = originalWindow;
    },
  };
}

function withoutWindow() {
  const original = globalThis.window;
  globalThis.window = undefined;
  return () => { globalThis.window = original; };
}

test('trackDemoFileUsed captures demo_file_used (existing helper, regression guard)', () => {
  const { calls, restore } = withMockPostHog();
  trackDemoFileUsed();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'demo_file_used');
  restore();
});

test('trackDemoPdfShown captures demo_pdf_shown', () => {
  const { calls, restore } = withMockPostHog();
  trackDemoPdfShown();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'demo_pdf_shown');
  restore();
});

test('trackUploadAfterDemo captures upload_after_demo with optional context', () => {
  const { calls, restore } = withMockPostHog();
  trackUploadAfterDemo({ fileType: 'csv', fileSize: 12345 });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'upload_after_demo');
  assert.equal(calls[0].properties.file_type, 'csv');
  assert.equal(calls[0].properties.file_size, 12345);
  restore();
});

test('trackUploadAfterDemo accepts being called without args', () => {
  const { calls, restore } = withMockPostHog();
  trackUploadAfterDemo();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'upload_after_demo');
  restore();
});

test('all helpers are no-ops outside the browser (SSR safety)', () => {
  const restore = withoutWindow();
  // None of these should throw — they are called during SSR/build.
  assert.doesNotThrow(() => trackDemoPdfShown());
  assert.doesNotThrow(() => trackUploadAfterDemo({ fileType: 'csv' }));
  assert.doesNotThrow(() => trackUploadStarted({ fileType: 'csv', fileSize: 0 }));
  restore();
});

test('helpers are no-ops when posthog SDK is absent on window', () => {
  const original = globalThis.window;
  globalThis.window = {}; // window exists, posthog does not
  assert.doesNotThrow(() => trackDemoPdfShown());
  assert.doesNotThrow(() => trackUploadAfterDemo({}));
  globalThis.window = original;
});

/* ── trackRenderCompleted ──────────────────────────────────
 * Diagnostic event for the XLSX-vs-CSV quality gap. We need every
 * metric the backend returned so we can group by (file_type, size_bucket)
 * and confirm — or invalidate — the parser-bug hypothesis.
 */
test('trackRenderCompleted captures render_completed with every metric in snake_case', () => {
  const { calls, restore } = withMockPostHog();
  trackRenderCompleted({
    fileType: 'xlsx',
    fileSize: 31900,
    mode: 'normal',
    score: 78.4,
    verdict: 'WARN',
    colCount: 6,
    rowCount: 95,
    pageCount: 37,
    wrapPressure: 0.81,
    overflowCells: 0,
    renderMs: 1603,
    reasons: ['high_wrap_rate'],
    isDemo: false,
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'render_completed');
  const p = calls[0].properties;
  assert.equal(p.file_type, 'xlsx');
  assert.equal(p.file_size, 31900);
  assert.equal(p.mode, 'normal');
  assert.equal(p.score, 78.4);
  assert.equal(p.verdict, 'WARN');
  assert.equal(p.col_count, 6);
  assert.equal(p.row_count, 95);
  assert.equal(p.page_count, 37);
  assert.equal(p.wrap_pressure, 0.81);
  assert.equal(p.overflow_cells, 0);
  assert.equal(p.render_ms, 1603);
  assert.deepEqual(p.reasons, ['high_wrap_rate']);
  assert.equal(p.is_demo, false);
  restore();
});

test('trackRenderCompleted tolerates missing optional fields (only file_type required for usefulness)', () => {
  const { calls, restore } = withMockPostHog();
  trackRenderCompleted({ fileType: 'csv', verdict: 'OK', score: 100 });
  assert.equal(calls.length, 1);
  const p = calls[0].properties;
  assert.equal(p.file_type, 'csv');
  assert.equal(p.score, 100);
  assert.equal(p.verdict, 'OK');
  // Missing fields should not be sent as undefined strings
  assert.ok(!('col_count' in p) || p.col_count == null);
  assert.ok(!('wrap_pressure' in p) || p.wrap_pressure == null);
  restore();
});

test('trackRenderCompleted is a no-op outside the browser', () => {
  const restore = withoutWindow();
  assert.doesNotThrow(() => trackRenderCompleted({ fileType: 'xlsx', score: 78 }));
  restore();
});
