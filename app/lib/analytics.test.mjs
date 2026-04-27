import assert from 'node:assert/strict';
import test from 'node:test';

import {
  trackDemoFileUsed,
  trackDemoPdfShown,
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
