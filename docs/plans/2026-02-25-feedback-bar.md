# FeedbackBar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface a sticky 👍/👎 feedback bar 2s after each PDF delivery, collecting a vote + optional reason/comment, sending it to `POST /api/render/feedback`.

**Architecture:** `renderId` extracted in `useConversion` hook from the `X-Render-Id` response header, threaded as a prop through `page.jsx → UploadCard → FeedbackBar`. `FeedbackBar` is a self-contained `'use client'` component with an internal state machine. CSS-only animations via two new `@keyframes` in `globals.css`.

**Tech Stack:** React 18 hooks, Tailwind CSS, Vitest + Testing Library (fake timers for delay tests), Next.js 14 App Router API route.

---

### Task 1: Forward `X-Render-Id` through the proxy

**Files:**
- Modify: `app/api/render/route.js:133-144`

**Step 1: Add `'x-render-id'` to the passthrough list**

In `copyPassThroughHeaders()`, the `passHeaders` array ends at line 143 (`'x-cleansheet-column-map-entries'`). Add one entry:

```js
// app/api/render/route.js — inside copyPassThroughHeaders(), passHeaders array
'x-cleansheet-column-map-entries',
'x-render-id',           // ← add this line
```

**Step 2: Verify with grep**

```bash
grep 'x-render-id' app/api/render/route.js
# Expected: '  x-render-id',
```

**Step 3: Commit**

```bash
git add app/api/render/route.js
git commit -m "feat: forward X-Render-Id header through render proxy"
```

---

### Task 2: Add feedback proxy route

**Files:**
- Create: `app/api/render/feedback/route.js`

**Step 1: Create the file**

```js
// app/api/render/feedback/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const upstream = process.env.CLEAN_SHEET_API_URL;
  const apiKey = process.env.NEATEXPORT_API_KEY;

  if (!upstream || !apiKey) {
    return new Response(JSON.stringify({ error: 'Missing env vars' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(`${upstream}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NEATEXPORT-KEY': apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Upstream unreachable' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  const text = await upstreamResponse.text();
  return new Response(text, {
    status: upstreamResponse.status,
    headers: { 'content-type': 'application/json' },
  });
}
```

**Step 2: Commit**

```bash
git add app/api/render/feedback/route.js
git commit -m "feat: add /api/render/feedback proxy route"
```

---

### Task 3: Add `renderId` state to `useConversion.mjs`

**Files:**
- Modify: `app/hooks/useConversion.mjs`

**Step 1: Add state declaration** (after `renderVerdict` state, around line 202)

```js
// after: const [renderVerdict, setRenderVerdict] = useState(null);
const [renderId, setRenderId] = useState(null);
```

**Step 2: Extract header after successful PDF** (after line 342 `setPdfBlob(blob)`)

```js
setPdfBlob(blob);
setRenderId(res.headers.get('x-render-id') ?? null);  // ← add this line
setResolvedPdfFilename(responseFilename);
```

**Step 3: Reset on new submission** — find the block that calls `setPdfBlob(null)` at the start of `submitRender` (around line 311). Add the reset alongside it:

```js
setPdfBlob(null);
setRenderId(null);   // ← add this line
```

**Step 4: Export from hook return** (around line 497, in the `// result` section):

```js
// result
pdfBlob,
renderId,            // ← add this line
confidence,
```

**Step 5: Verify**

```bash
grep 'renderId' app/hooks/useConversion.mjs
# Expected: 4 lines (useState, setRenderId in reset, setRenderId in success, renderId in return)
```

**Step 6: Commit**

```bash
git add app/hooks/useConversion.mjs
git commit -m "feat: extract and expose X-Render-Id from render response"
```

---

### Task 4: Write failing tests for FeedbackBar

**Files:**
- Create: `app/__tests__/FeedbackBar.ui.test.jsx`

**Step 1: Write the test file**

```jsx
// app/__tests__/FeedbackBar.ui.test.jsx
import { describe, test, expect, afterEach, vi, beforeEach } from 'vitest';
import React from 'react';
import { cleanup, render, screen, fireEvent, act } from '@testing-library/react';
import FeedbackBar from '../components/FeedbackBar.jsx';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.useFakeTimers();
  global.fetch = vi.fn().mockResolvedValue({ status: 201 });
});

describe('FeedbackBar', () => {
  test('renders nothing when renderId is null', () => {
    const { container } = render(<FeedbackBar renderId={null} visible={true} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when visible is false', () => {
    const { container } = render(<FeedbackBar renderId="abc" visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('appears after 2s when visible=true and renderId is set', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    expect(screen.queryByRole('region', { name: /feedback/i })).toBeNull();
    await act(async () => { vi.advanceTimersByTime(2001); });
    expect(screen.getByRole('region', { name: /feedback/i })).toBeTruthy();
  });

  test('shows thumbs-up and thumbs-down buttons in idle state', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    expect(screen.getByRole('button', { name: /ok/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /probl/i })).toBeTruthy();
  });

  test('thumbs-up submits vote=up and shows "Merci !"', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /ok/i })); });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/render/feedback',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"vote":"up"'),
      }),
    );
    expect(screen.getByText(/merci/i)).toBeTruthy();
  });

  test('thumbs-down shows reason pills', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /probl/i })); });
    expect(screen.getByRole('button', { name: /mise en page/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /autre/i })).toBeTruthy();
  });

  test('clicking a reason (non-Autre) submits vote=down with reason', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /probl/i })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /mise en page/i })); });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/render/feedback',
      expect.objectContaining({
        body: expect.stringContaining('"vote":"down"'),
      }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/render/feedback',
      expect.objectContaining({
        body: expect.stringContaining('"reason":"layout"'),
      }),
    );
  });

  test('clicking Autre shows textarea', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /probl/i })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /autre/i })); });
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  test('Autre textarea submit sends comment', async () => {
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /probl/i })); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /autre/i })); });
    await act(async () => { fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Mon commentaire' } }); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /envoyer/i })); });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/render/feedback',
      expect.objectContaining({
        body: expect.stringContaining('"comment":"Mon commentaire"'),
      }),
    );
  });

  test('409 response shows "Déjà envoyé"', async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 409 });
    render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /ok/i })); });
    expect(screen.getByText(/d.j. envoy/i)).toBeTruthy();
  });

  test('auto-hides after 60s without interaction', async () => {
    const { container } = render(<FeedbackBar renderId="abc" visible={true} />);
    await act(async () => { vi.advanceTimersByTime(2001); });
    expect(container.firstChild).not.toBeNull();
    await act(async () => { vi.advanceTimersByTime(60_001); });
    // After 60s the bar should begin exiting (no longer in idle state)
    expect(screen.queryByRole('button', { name: /ok/i })).toBeNull();
  });
});
```

**Step 2: Run to verify RED**

```bash
npx vitest run app/__tests__/FeedbackBar.ui.test.jsx 2>&1 | tail -10
# Expected: FAIL — "Cannot find module '../components/FeedbackBar.jsx'"
```

**Step 3: Commit the failing test**

```bash
git add app/__tests__/FeedbackBar.ui.test.jsx
git commit -m "test(red): FeedbackBar — 10 failing tests"
```

---

### Task 5: Add CSS animations to `globals.css`

**Files:**
- Modify: `app/globals.css`

**Step 1: Add keyframes after the existing `proofSlideUp` block** (around line 343, after the `@media (prefers-reduced-motion)` block for proof-slide-up)

```css
  @keyframes feedbackSlideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .feedback-bar-enter {
    animation: feedbackSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes feedbackFadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  .feedback-bar-exit {
    animation: feedbackFadeOut 0.2s ease-in forwards;
  }

  @media (prefers-reduced-motion: reduce) {
    .feedback-bar-enter,
    .feedback-bar-exit {
      animation: none;
    }
  }
```

**Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: add feedbackSlideUp and feedbackFadeOut CSS animations"
```

---

### Task 6: Implement `FeedbackBar.jsx` (GREEN)

**Files:**
- Create: `app/components/FeedbackBar.jsx`

**Step 1: Create the component**

```jsx
// app/components/FeedbackBar.jsx
'use client';
import { useState, useEffect, useRef } from 'react';

const REASONS = [
  { key: 'layout',  label: '📐 Mise en page' },
  { key: 'content', label: '📝 Contenu' },
  { key: 'font',    label: '🔤 Police' },
  { key: 'slow',    label: '🐌 Lent' },
  { key: 'other',   label: '❓ Autre' },
];

// phase: 'idle' | 'reasons' | 'comment' | 'submitting' | 'thanks' | 'already_sent'
export default function FeedbackBar({ renderId, visible }) {
  const [shown, setShown]     = useState(false);
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase]     = useState('idle');
  const [comment, setComment] = useState('');

  const showTimer    = useRef(null);
  const autoHide     = useRef(null);
  const dismissTimer = useRef(null);

  // Show 2s after PDF arrives
  useEffect(() => {
    if (!visible || !renderId) return;
    showTimer.current = setTimeout(() => setShown(true), 2000);
    return () => clearTimeout(showTimer.current);
  }, [visible, renderId]);

  // Auto-hide 60s after appearing
  useEffect(() => {
    if (!shown || phase !== 'idle') return;
    autoHide.current = setTimeout(dismiss, 60_000);
    return () => clearTimeout(autoHide.current);
  }, [shown, phase]);

  // Cleanup on unmount
  useEffect(() => () => {
    clearTimeout(showTimer.current);
    clearTimeout(autoHide.current);
    clearTimeout(dismissTimer.current);
  }, []);

  function dismiss() {
    clearTimeout(autoHide.current);
    setExiting(true);
  }

  function handleExitEnd() {
    if (!exiting) return;
    setShown(false);
    setExiting(false);
    setPhase('idle');
    setComment('');
  }

  async function submit(vote, reason = null, commentText = null) {
    setPhase('submitting');
    clearTimeout(autoHide.current);
    try {
      const res = await fetch('/api/render/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renderId,
          vote,
          reason,
          comment: commentText || null,
          channel: 'web',
        }),
      });
      setPhase(res.status === 409 ? 'already_sent' : 'thanks');
    } catch {
      dismiss();
      return;
    }
    dismissTimer.current = setTimeout(dismiss, 2000);
  }

  if (!shown) return null;

  return (
    <div
      role="region"
      aria-label="Feedback sur le PDF"
      className={`fixed bottom-4 left-1/2 z-[200] w-[calc(100%-2rem)] max-w-[480px] -translate-x-1/2 rounded-2xl bg-[#1a1a2e] px-5 py-4 shadow-2xl backdrop-blur-[8px] ${
        exiting ? 'feedback-bar-exit' : 'feedback-bar-enter'
      }`}
      onAnimationEnd={handleExitEnd}
    >
      {/* Idle — thumbs */}
      {phase === 'idle' && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/80">Ce PDF vous convient ?</p>
          <div className="flex gap-2">
            <button
              onClick={() => submit('up')}
              className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:scale-105 hover:bg-white/20"
            >
              👍 OK
            </button>
            <button
              onClick={() => setPhase('reasons')}
              className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:scale-105 hover:bg-white/20"
            >
              👎 Problème
            </button>
          </div>
        </div>
      )}

      {/* Reasons */}
      {phase === 'reasons' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-white/80">Quel problème ?</p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => key === 'other' ? setPhase('comment') : submit('down', key)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:scale-105 hover:bg-white/20"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comment (Autre) */}
      {phase === 'comment' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-white/80">Dites-nous en plus :</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 140))}
            placeholder="Max 140 caractères"
            rows={2}
            className="w-full resize-none rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPhase('reasons')}
              className="rounded-full px-3 py-1 text-xs text-white/50 hover:text-white/80"
            >
              Retour
            </button>
            <button
              disabled={!comment.trim()}
              onClick={() => submit('down', 'other', comment.trim())}
              className="rounded-full bg-white/20 px-4 py-1 text-xs font-semibold text-white disabled:opacity-40 hover:bg-white/30"
            >
              Envoyer
            </button>
          </div>
        </div>
      )}

      {/* Submitting */}
      {phase === 'submitting' && (
        <p className="text-center text-sm text-white/60">Envoi…</p>
      )}

      {/* Thanks */}
      {phase === 'thanks' && (
        <p className="text-center text-sm font-semibold text-white">Merci ! 🙏</p>
      )}

      {/* Already sent */}
      {phase === 'already_sent' && (
        <p className="text-center text-sm text-white/70">Déjà envoyé ✓</p>
      )}
    </div>
  );
}
```

**Step 2: Run tests — should be GREEN**

```bash
npx vitest run app/__tests__/FeedbackBar.ui.test.jsx 2>&1 | tail -10
# Expected: 10 tests passed
```

**Step 3: Run full suite**

```bash
npx vitest run 2>&1 | tail -5
# Expected: all previously passing tests still pass
```

**Step 4: Commit**

```bash
git add app/components/FeedbackBar.jsx
git commit -m "feat: implement FeedbackBar component (10 tests green)"
```

---

### Task 7: Wire FeedbackBar into page.jsx → UploadCard

**Files:**
- Modify: `app/page.jsx` (pass `renderId` prop)
- Modify: `app/components/UploadCard.jsx` (accept prop, render FeedbackBar)

**Step 1: In `page.jsx`, add `renderId` prop to `GenerateModule`** — find the existing `hasResultBlob` line (around line 243) and add next to it:

```jsx
hasResultBlob={Boolean(conversion.pdfBlob)}
renderId={conversion.renderId}          {/* ← add */}
```

**Step 2: In `UploadCard.jsx`, accept the new prop** — add `renderId = null` to the destructured props (around line 357, after `initialOptionsExpanded = false`):

```jsx
  initialOptionsExpanded = false,
  renderId = null,           // ← add
}) {
```

**Step 3: Import and render FeedbackBar at the bottom of UploadCard's JSX** — find the closing `</div>` of the main card container (search for the outermost return wrapper). Add before it:

```jsx
      {/* Feedback bar — fixed overlay, appears 2s after PDF delivery */}
      <FeedbackBar renderId={renderId} visible={hasResultBlob} />
```

And add the import at the top of the file:

```jsx
import FeedbackBar from './FeedbackBar.jsx';
```

**Step 4: Run full test suite**

```bash
npx vitest run 2>&1 | tail -5
# Expected: all tests pass (≥207 with 10 new FeedbackBar tests)
```

**Step 5: Commit**

```bash
git add app/page.jsx app/components/UploadCard.jsx
git commit -m "feat: wire FeedbackBar into UploadCard — renderId from useConversion"
```

---

### Task 8: Push

```bash
git push
```

---

## Verification

After all tasks:

```bash
npx vitest run
# All tests pass

npx next dev
# Navigate to localhost:3000, upload a file
# → After PDF delivery, sticky bar slides up from bottom after 2s
# → 👍 click → POST /api/render/feedback → "Merci !"
# → 👎 click → reason pills appear
# → bar auto-dismisses after 60s idle
```
