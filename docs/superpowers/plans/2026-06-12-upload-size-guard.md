# Client-side upload size guard + PostHog instrumentation (frontend) — Plan

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. TDD, frequent commits.

**Goal:** When a user picks a source file larger than the web app can actually handle (Vercel caps the proxy request body at ~4.5 MB), show a clear message instead of a cryptic 413, AND fire a PostHog event so we can measure how often this happens — the signal that will decide whether to build the 9–20 MB direct-upload path later. Do NOT build direct upload now.

**Repo/branch:** worktree `/tmp/ffp-sizeguard`, branch `feat/upload-size-guard` (off origin/main `91bb5ed`).
**Node:** `export PATH="/Users/sneusch/.nvm/versions/node/v22.22.3/bin:$PATH"`. Single vitest file: `cd /tmp/ffp-sizeguard && npx vitest run app/__tests__/<file>.test.jsx`. Pure-module node test: `node --test app/lib/analytics.test.mjs`.
**Commit hygiene:** explicit paths only; never `git add -A` (node_modules). `git ls-files | grep -c node_modules` must stay 0.

**Threshold:** `WEB_UPLOAD_MAX_BYTES = 4 * 1024 * 1024` (4 MB). Vercel's hard body cap is ~4.5 MB; we guard a bit under to leave room for the multipart boundaries + the other form fields (columnGroups/sectionTitles JSON, optional logo) that share the same POST.

---

## Task 1: Analytics helper `trackUploadFileTooLarge`

**Files:** Modify `app/lib/analytics.mjs` (add an exported helper next to the existing ones like `trackControlUsed`). Test: `app/lib/analytics.test.mjs` (extend; it's a `node:test` file).

Context: `app/lib/analytics.mjs` has a private `capture(event, properties)` that calls `window.posthog.capture` (SSR-safe, silently skips if posthog absent) and several exported wrappers. Mirror that pattern.

- [ ] **Step 1: Failing test** — add to `app/lib/analytics.test.mjs` (mirror how existing tests stub `globalThis.window = { posthog: { capture } }` and assert the event name + properties; read the file first to match its exact stub/teardown idiom):

```js
test('trackUploadFileTooLarge captures upload_file_too_large with size + limit', () => {
  const calls = [];
  globalThis.window = { posthog: { capture: (e, p) => calls.push([e, p]) } };
  trackUploadFileTooLarge({ fileSize: 9_000_000, limitBytes: 4 * 1024 * 1024, fileType: 'csv' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'upload_file_too_large');
  assert.equal(calls[0][1].file_size, 9_000_000);
  assert.equal(calls[0][1].limit_bytes, 4 * 1024 * 1024);
  assert.equal(calls[0][1].file_type, 'csv');
  delete globalThis.window;
});
```
Add `trackUploadFileTooLarge` to the import from `./analytics.mjs` at the top of the test file.

- [ ] **Step 2: Run** `node --test app/lib/analytics.test.mjs` → CONFIRM FAIL (not exported).

- [ ] **Step 3: Implement** in `app/lib/analytics.mjs` (mirror the existing wrapper style):

```js
export function trackUploadFileTooLarge({ fileSize, limitBytes, fileType } = {}) {
  capture('upload_file_too_large', {
    file_size: fileSize,
    limit_bytes: limitBytes,
    file_type: fileType,
  });
}
```

- [ ] **Step 4: Run** `node --test app/lib/analytics.test.mjs` → CONFIRM PASS.

- [ ] **Step 5: Commit** — `git add app/lib/analytics.mjs app/lib/analytics.test.mjs && git commit -m "feat(analytics): trackUploadFileTooLarge event"`; node_modules count 0.

---

## Task 2: Size guard in `handleFileSelect` + clear error

**Files:** Modify `app/hooks/useConversion.mjs` (guard at the top of `handleFileSelect`, ~line 814; add the threshold constant; import the analytics helper). Test: `app/__tests__/uploadSizeGuard.ui.test.jsx` (create).

Context: `handleFileSelect(nextFile)` (~:814) currently accepts any file (`setFile(nextFile)` + resets). Errors surface via `setError(...)` → `conversion.error` → the danger banner in `ConversionTool.jsx` (`data-testid="generate-error"`). There is NO existing size guard on the source file (only the logo has one). The file enters via `UploadDropzone` → `onFileSelect` → `handleFileSelect`.

- [ ] **Step 1: Failing test** — create `app/__tests__/uploadSizeGuard.ui.test.jsx`. Test the hook through a tiny harness OR (preferred, simplest) the existing pattern used by other useConversion tests — read `app/__tests__/sectionReorderRoundTrip.ui.test.jsx` to see how the hook is driven, and mirror it. The assertions:

```jsx
import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { cleanup, render, screen, act } from '@testing-library/react';
import useConversion from '../hooks/useConversion.mjs';
import * as analytics from '../lib/analytics.mjs';

function Harness({ onReady }) {
  const conv = useConversion();
  onReady(conv);
  return <div data-testid="err">{conv.error || ''}</div>;
}
afterEach(() => cleanup());

function bigFile(bytes, name = 'big.csv') {
  const f = new File(['x'], name, { type: 'text/csv' });
  Object.defineProperty(f, 'size', { value: bytes });
  return f;
}

describe('client-side upload size guard', () => {
  test('a file over 4MB is rejected with an error, not accepted, and fires PostHog', () => {
    const spy = vi.spyOn(analytics, 'trackUploadFileTooLarge').mockImplementation(() => {});
    let conv;
    render(<Harness onReady={(c) => { conv = c; }} />);
    act(() => conv.handleFileSelect(bigFile(9 * 1024 * 1024)));
    expect(conv.file).toBeFalsy();                 // not accepted
    expect(screen.getByTestId('err').textContent).toMatch(/too large|4 ?MB/i);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
  test('a small file is accepted (no error, no event)', () => {
    const spy = vi.spyOn(analytics, 'trackUploadFileTooLarge').mockImplementation(() => {});
    let conv;
    render(<Harness onReady={(c) => { conv = c; }} />);
    act(() => conv.handleFileSelect(bigFile(1 * 1024 * 1024, 'small.csv')));
    expect(conv.file).toBeTruthy();
    expect(screen.getByTestId('err').textContent).toBe('');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
```
> If `useConversion()` requires args/providers that make the harness fail to mount, mirror EXACTLY how `sectionReorderRoundTrip.ui.test.jsx` instantiates it (it already drives the hook). Keep the two assertions (over-4MB → rejected+error+event; small → accepted). If `vi.spyOn` on an ES module export doesn't intercept the in-module call, instead stub `globalThis.window.posthog.capture` and assert it received `upload_file_too_large` — whichever the codebase's test setup supports.

- [ ] **Step 2: Run** → CONFIRM FAIL (big file currently accepted, no error).

- [ ] **Step 3: Implement** — at the TOP of `handleFileSelect` (before `setFile`), add the guard; add the constant near the other module constants; import the helper.

Constant (top of file with other consts):
```js
const WEB_UPLOAD_MAX_BYTES = 4 * 1024 * 1024; // ~Vercel 4.5MB proxy body cap, minus multipart/field overhead
```
Import (with the existing analytics import):
```js
import { /* existing… */ trackUploadFileTooLarge } from '../lib/analytics.mjs';
```
Guard (first lines of `handleFileSelect(nextFile)`):
```js
  if (nextFile && Number.isFinite(nextFile.size) && nextFile.size > WEB_UPLOAD_MAX_BYTES) {
    const mb = (nextFile.size / (1024 * 1024)).toFixed(1);
    const ext = (nextFile.name || '').split('.').pop()?.toLowerCase() || '';
    trackUploadFileTooLarge({ fileSize: nextFile.size, limitBytes: WEB_UPLOAD_MAX_BYTES, fileType: ext });
    setError(`This file is ${mb} MB. The web app currently supports files up to ${Math.round(WEB_UPLOAD_MAX_BYTES / (1024 * 1024))} MB. For larger files, use the API or reply to your export email and we'll help.`);
    setFile(null);
    return;
  }
```
(Place it so a rejected oversized file does NOT run the reset block / does not become the active file.)

- [ ] **Step 4: Run** the new test → CONFIRM PASS. Then run `app/__tests__/columnsControl.ui.test.jsx` + `app/__tests__/appCustomGroups.e2e.test.jsx` to confirm no regression to the file/render flow.

- [ ] **Step 5: Commit** — `git add app/hooks/useConversion.mjs app/__tests__/uploadSizeGuard.ui.test.jsx && git commit -m "feat(upload): client-side size guard with clear message + PostHog event"`; node_modules 0.

---

## Task 3: Full suite + build

- [ ] `npm test` (node `--test` phase + `vitest run`) green; `npm run build` clean. Fix only a pre-existing test our change legitimately shifted (explicit-path commit). Report.
