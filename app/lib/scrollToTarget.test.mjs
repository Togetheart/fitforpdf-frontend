import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// Use jsdom programmatically — no Vitest needed for this pure-logic test.
import { JSDOM } from 'jsdom';
import { scrollToTarget } from './scrollToTarget.mjs';

let dom;
let scrollCalls;

beforeEach(() => {
  dom = new JSDOM(`<!doctype html><html><body>
    <div id="hero" style="height:1000px;"></div>
    <div id="generate" data-testid="upload">upload pill</div>
    <div id="tool" data-testid="wrapper">wrapper</div>
  </body></html>`, { url: 'http://localhost/' });
  global.window = dom.window;
  global.document = dom.window.document;
  scrollCalls = [];
  // Stub scrollTo so we can observe what was scrolled.
  global.window.scrollTo = (opts) => scrollCalls.push(opts);
  // jsdom returns 0 for getBoundingClientRect by default — make it predictable.
  Object.defineProperty(dom.window, 'pageYOffset', { value: 0, configurable: true, writable: true });
  document.getElementById('generate').getBoundingClientRect = () => ({ top: 2400, bottom: 2500, left: 0, right: 600, width: 600, height: 100 });
  document.getElementById('tool').getBoundingClientRect = () => ({ top: 2200, bottom: 3400, left: 0, right: 600, width: 600, height: 1200 });
});

afterEach(async () => {
  // Wait for any pending corrective-scroll timers to fire before tearing
  // down globals — otherwise their delayed handler hits a stripped window.
  await new Promise((r) => setTimeout(r, 80));
});

test('scrollToTarget, scrolls to first matching id with headerOffset', () => {
  scrollToTarget(['generate', 'tool']);
  assert.equal(scrollCalls.length, 1);
  assert.equal(scrollCalls[0].behavior, 'smooth');
  // 2400 (rect.top) + 0 (pageYOffset) - 80 (headerOffset) = 2320
  assert.equal(scrollCalls[0].top, 2320);
});

test('scrollToTarget, falls back to second id when first not found', () => {
  scrollToTarget(['nonexistent', 'tool']);
  assert.equal(scrollCalls.length, 1);
  // 2200 - 80 = 2120
  assert.equal(scrollCalls[0].top, 2120);
});

test('scrollToTarget, no-op when no targets found', () => {
  scrollToTarget(['nope', 'also-nope']);
  assert.equal(scrollCalls.length, 0);
});

test('scrollToTarget, accepts custom headerOffset', () => {
  scrollToTarget(['generate'], { headerOffset: 200 });
  // 2400 - 200 = 2200
  assert.equal(scrollCalls[0].top, 2200);
});

test('scrollToTarget, clamps negative scroll positions to 0', () => {
  document.getElementById('generate').getBoundingClientRect = () => ({ top: 50, bottom: 150, left: 0, right: 600, width: 600, height: 100 });
  scrollToTarget(['generate']);
  // 50 - 80 = -30 → clamped to 0
  assert.equal(scrollCalls[0].top, 0);
});

test('scrollToTarget, returns a cancel function that stops corrective scroll', async () => {
  const cancel = scrollToTarget(['generate'], { correctionDelay: 50, correctionThreshold: 0 });
  assert.equal(typeof cancel, 'function');
  cancel();
  await new Promise((r) => setTimeout(r, 80));
  // Only the initial scroll fired — corrective was cancelled.
  assert.equal(scrollCalls.length, 1);
});

test('scrollToTarget, corrective scroll fires when target drifts', async () => {
  scrollToTarget(['generate'], { correctionDelay: 30, correctionThreshold: 10 });
  // Simulate a layout shift between pass 1 and pass 2: move the target.
  document.getElementById('generate').getBoundingClientRect = () => ({ top: 3000, bottom: 3100, left: 0, right: 600, width: 600, height: 100 });
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(scrollCalls.length, 2);
  // 2nd scroll uses new rect: 3000 - 80 = 2920
  assert.equal(scrollCalls[1].top, 2920);
});

test('scrollToTarget, user-initiated scroll cancels the corrective pass', async () => {
  scrollToTarget(['generate'], { correctionDelay: 50, correctionThreshold: 0 });
  // Simulate user wheel event before the corrective timer fires.
  window.dispatchEvent(new dom.window.Event('wheel'));
  await new Promise((r) => setTimeout(r, 80));
  assert.equal(scrollCalls.length, 1, 'should NOT have fired corrective scroll');
});
