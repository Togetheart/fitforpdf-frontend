# Design: FeedbackBar component

**Date:** 2026-02-25
**Status:** Approved

## Context

The backend now exposes:
- `X-Render-Id` header in `POST /render` responses
- `POST /feedback` endpoint — `{ renderId, vote, reason?, comment?, channel }` → 201 / 400 / 409

Goal: collect a quick 👍/👎 vote from the user after each PDF delivery, without disrupting the workflow.

## Architecture decision

**Hook + UploadCard (Option A)** — `renderId` stored in `useConversion` alongside `pdfBlob`. `UploadCard` mounts `<FeedbackBar>` as a fixed overlay. Minimal refactor, consistent with existing post-render UI patterns.

**Animations:** pure CSS (`@keyframes` in globals.css) — consistent with the rest of the project.

## Data flow

```
Backend POST /render response
  X-Render-Id: <uuid>
    ↓
  app/api/render/route.js
    copyPassThroughHeaders() + 'x-render-id'
    ↓
  useConversion.mjs submitRender()
    const renderId = res.headers.get('x-render-id')
    setRenderId(renderId)
    ↓
  UploadCard.jsx
    <FeedbackBar renderId={renderId} visible={Boolean(pdfBlob)} />
    ↓
  /api/render/feedback  →  backend POST /feedback
```

## State machine

```
HIDDEN
  → (2s after pdfBlob delivered) → IDLE

IDLE
  → [👍 OK] → SUBMITTING → THANKS (2s) → HIDDEN
  → [👎 Problème] → REASONS
  → (60s timeout) → HIDDEN

REASONS  [📐 Mise en page | 📝 Contenu | 🔤 Police | 🐌 Lent | ❓ Autre]
  → [any reason except Autre] → SUBMITTING → THANKS (2s) → HIDDEN
  → [Autre] → COMMENT

COMMENT  [textarea 140 chars + Envoyer button]
  → [Envoyer] → SUBMITTING → THANKS (2s) → HIDDEN

SUBMITTING
  → 201 → THANKS
  → 409 → ALREADY_SENT (2s) → HIDDEN
  → other error → HIDDEN (silent fail)
```

## API route

`app/api/render/feedback/route.js` — POST only:
- Reads `CLEAN_SHEET_API_URL` + `NEATEXPORT_API_KEY` from env
- Forwards body JSON verbatim to `${upstream}/feedback`
- Returns upstream status + body

## UI/Design spec

- **Position:** fixed bottom center, z-index `z-[200]` (above content, below lightbox z-9999)
- **Width:** full-width mobile, `max-w-[480px]` desktop
- **Background:** dark card `bg-[#1a1a2e]` with `backdrop-blur-[8px]`
- **Enter:** `feedbackSlideUp` — translate-Y from +100% to 0, 400ms ease-out
- **Exit:** `feedbackFadeOut` — opacity 1→0, 200ms ease-in
- **Reason transition:** cross-fade via `opacity` + `pointer-events` toggle
- **Buttons:** pill shape, `hover:scale-105` transition
- **Responsive:** `px-4 sm:px-0` centering

## Files

| File | Action |
|---|---|
| `app/api/render/route.js` | + `'x-render-id'` in `copyPassThroughHeaders` |
| `app/api/render/feedback/route.js` | ✨ new proxy POST |
| `app/hooks/useConversion.mjs` | + `renderId` state, extract from response headers |
| `app/components/FeedbackBar.jsx` | ✨ new component |
| `app/components/UploadCard.jsx` | + mount `<FeedbackBar>` |
| `app/globals.css` | + `@keyframes feedbackSlideUp`, `feedbackFadeOut` |
| `app/__tests__/FeedbackBar.ui.test.jsx` | ✨ TDD — states, submission, 409 |

## Testing

TDD cycle (RED → GREEN):
- Renders nothing when `renderId` is null
- Shows bar 2s after `visible=true` (fake timers)
- 👍 click → POST to `/api/render/feedback` → shows "Merci !"
- 👎 click → shows reason pills
- Reason click (non-Autre) → submits directly
- Reason "Autre" → shows textarea → submit button enabled when non-empty
- 409 response → shows "Déjà envoyé"
- Auto-hides after 60s (fake timers)
