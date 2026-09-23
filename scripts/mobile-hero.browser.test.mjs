import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

// Browser integration check: start the app locally, then run this file with
// node --test. Uses the repository's required gstack browser, outside unit CI.
const browser = path.join(homedir(), '.claude/skills/gstack/browse/dist/browse');
const origin = process.env.FFP_BROWSER_URL || 'http://localhost:3001';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Use a local test server');
const browse = (...args) => execFileSync(browser, args, { encoding: 'utf8' }).trim();

test('mobile product image never covers the hero or its free-tier disclosure', () => {
  const { tabId } = JSON.parse(browse('newtab', origin, '--json'));
  try {
    for (const width of [375, 390, 430]) {
      browse('viewport', `${width}x844`);
      browse('goto', origin);
      browse('wait', 'button[aria-label="View full-size product image"]');
      const bounds = JSON.parse(browse('js', `JSON.stringify({
        heroBottom: document.querySelector('[data-testid="hero-section"]').getBoundingClientRect().bottom,
        imageTop: document.querySelector('button[aria-label="View full-size product image"]').getBoundingClientRect().top,
        pageWidth: document.documentElement.scrollWidth,
        viewport: innerWidth
      })`));
      assert.ok(bounds.imageTop >= bounds.heroBottom, `${width}px: product image overlaps the hero by ${bounds.heroBottom - bounds.imageTop}px`);
      assert.ok(bounds.pageWidth <= bounds.viewport, `${width}px: horizontal overflow`);
    }
  } finally {
    browse('closetab', String(tabId));
  }
});
