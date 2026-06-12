import assert from 'node:assert/strict';
import test from 'node:test';

import {
  trackDemoFileUsed,
  trackDemoPdfShown,
  trackDownloadClicked,
  trackDownloadCompleted,
  trackPostRenderContactClicked,
  trackPostRenderPricingClicked,
  trackRenderCompleted,
  trackSecondRealRenderStarted,
  trackUploadAfterDemo,
  trackUploadFileTooLarge,
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

/* ── Post-render conversion funnel ───────────────────────────
 * Last CEO-validated plan: the post-render result screen is where
 * intent (download / pricing / contact / second render) gets proven
 * or lost. These helpers must fire consistently with shared render_id
 * + flow_id so PostHog can reconstruct the loop.
 */
test('trackDownloadClicked captures download_clicked with render context', () => {
  const { calls, restore } = withMockPostHog();
  trackDownloadClicked({
    renderId: 'r_abc',
    flowId: 'flow_xyz',
    isDemo: false,
    verdict: 'OK',
    score: 92,
    fileType: 'xlsx',
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'download_clicked');
  const p = calls[0].properties;
  assert.equal(p.render_id, 'r_abc');
  assert.equal(p.flow_id, 'flow_xyz');
  assert.equal(p.is_demo, false);
  assert.equal(p.verdict, 'OK');
  assert.equal(p.score, 92);
  assert.equal(p.file_type, 'xlsx');
  restore();
});

test('trackDownloadCompleted captures download_completed', () => {
  const { calls, restore } = withMockPostHog();
  trackDownloadCompleted({ renderId: 'r_abc', flowId: 'flow_xyz', isDemo: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'download_completed');
  assert.equal(calls[0].properties.render_id, 'r_abc');
  assert.equal(calls[0].properties.is_demo, true);
  restore();
});

test('trackPostRenderPricingClicked captures post_render_pricing_clicked', () => {
  const { calls, restore } = withMockPostHog();
  trackPostRenderPricingClicked({ renderId: 'r_abc', flowId: 'flow_xyz', isDemo: false });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'post_render_pricing_clicked');
  assert.equal(calls[0].properties.render_id, 'r_abc');
  assert.equal(calls[0].properties.flow_id, 'flow_xyz');
  assert.equal(calls[0].properties.is_demo, false);
  restore();
});

test('trackPostRenderContactClicked captures post_render_contact_clicked', () => {
  const { calls, restore } = withMockPostHog();
  trackPostRenderContactClicked({ renderId: 'r_abc', flowId: 'flow_xyz', isDemo: false });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'post_render_contact_clicked');
  assert.equal(calls[0].properties.render_id, 'r_abc');
  restore();
});

test('trackSecondRealRenderStarted captures second_real_render_started', () => {
  const { calls, restore } = withMockPostHog();
  trackSecondRealRenderStarted({ previousRenderId: 'r_prev', flowId: 'flow_xyz' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'second_real_render_started');
  assert.equal(calls[0].properties.previous_render_id, 'r_prev');
  assert.equal(calls[0].properties.flow_id, 'flow_xyz');
  restore();
});

test('post-render helpers are no-ops outside the browser (SSR safety)', () => {
  const restore = withoutWindow();
  assert.doesNotThrow(() => trackDownloadClicked({ renderId: 'r' }));
  assert.doesNotThrow(() => trackDownloadCompleted({ renderId: 'r' }));
  assert.doesNotThrow(() => trackPostRenderPricingClicked({ renderId: 'r' }));
  assert.doesNotThrow(() => trackPostRenderContactClicked({ renderId: 'r' }));
  assert.doesNotThrow(() => trackSecondRealRenderStarted({}));
  restore();
});

test('post-render helpers tolerate empty arg objects', () => {
  const { calls, restore } = withMockPostHog();
  trackDownloadClicked({});
  trackPostRenderPricingClicked({});
  assert.equal(calls.length, 2);
  assert.equal(calls[0].event, 'download_clicked');
  assert.equal(calls[1].event, 'post_render_pricing_clicked');
  restore();
});

// ── S1 distribution-sprint funnel helpers (2026-06-10) ──────────────

test('trackAppOpened captures app_open with ref, registers super property, pins $set_once', async () => {
  const { trackAppOpened } = await import('./analytics.mjs');
  const calls = [];
  const registered = [];
  const originalWindow = globalThis.window;
  globalThis.window = {
    posthog: {
      capture(event, properties) { calls.push({ event, properties }); },
      register(props) { registered.push(props); },
    },
  };

  trackAppOpened({ surface: 'workbench', ref: 'hn', initialRef: 'hn', initialReferrer: 'https://news.ycombinator.com/' });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'app_open');
  assert.equal(calls[0].properties.ref, 'hn');
  assert.equal(calls[0].properties.surface, 'workbench');
  assert.deepEqual(calls[0].properties.$set_once, {
    initial_ref: 'hn',
    initial_referrer: 'https://news.ycombinator.com/',
  });
  assert.deepEqual(registered, [{ ref: 'hn' }]);

  globalThis.window = originalWindow;
});

test('trackAppOpened without ref captures app_open without $set_once or register', async () => {
  const { trackAppOpened } = await import('./analytics.mjs');
  const calls = [];
  const registered = [];
  const originalWindow = globalThis.window;
  globalThis.window = {
    posthog: {
      capture(event, properties) { calls.push({ event, properties }); },
      register(props) { registered.push(props); },
    },
  };

  trackAppOpened({ surface: 'workbench' });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].properties.$set_once, undefined);
  assert.equal(registered.length, 0);

  globalThis.window = originalWindow;
});

test('trackControlUsed dedupes per control until resetControlUsageTracking', async () => {
  const { trackControlUsed, resetControlUsageTracking } = await import('./analytics.mjs');
  const { calls, restore } = withMockPostHog();
  resetControlUsageTracking();

  trackControlUsed({ control: 'report_title', surface: 'workbench' });
  trackControlUsed({ control: 'report_title', surface: 'workbench' }); // typing again — deduped
  trackControlUsed({ control: 'section_rename', surface: 'workbench' });
  trackControlUsed({}); // no control — ignored

  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map((c) => c.properties.control), ['report_title', 'section_rename']);

  resetControlUsageTracking();
  trackControlUsed({ control: 'report_title', surface: 'workbench' });
  assert.equal(calls.length, 3, 'reset re-arms the dedupe (new app session)');

  restore();
  resetControlUsageTracking();
});

test('trackPaywallViewed captures paywall_view with surface', async () => {
  const { trackPaywallViewed } = await import('./analytics.mjs');
  const { calls, restore } = withMockPostHog();
  trackPaywallViewed({ surface: 'workbench', plan: 'free' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'paywall_view');
  assert.equal(calls[0].properties.surface, 'workbench');
  assert.equal(calls[0].properties.plan, 'free');
  restore();
});

test('trackUploadFileTooLarge captures upload_file_too_large with size + limit', () => {
  const { calls, restore } = withMockPostHog();
  trackUploadFileTooLarge({ fileSize: 9_000_000, limitBytes: 4 * 1024 * 1024, fileType: 'csv' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, 'upload_file_too_large');
  assert.equal(calls[0].properties.file_size, 9_000_000);
  assert.equal(calls[0].properties.limit_bytes, 4 * 1024 * 1024);
  assert.equal(calls[0].properties.file_type, 'csv');
  restore();
});
