# Workbench mobile drawers (Phase 2)

**Date:** 2026-06-07 · **Status:** Approved · **Frontend-only** · builds on Phase 1/3 (panels + tabs in `main`)

## Goal
On **mobile (< lg)**, the left rail + right inspector should **slide over** the center content as
off-canvas **drawers** (with a scrim), instead of stacking/flowing below it. Desktop (≥ lg) is
unchanged (the Phase 1 resizable `PanelGroup`).

## Design
- **Center workspace** = full width on mobile (as today).
- **Right inspector** → drawer sliding in from the **right**; **Left rail** → drawer from the **left**.
  Each: fixed-position panel, `translate-x` off-screen when closed → slides in when open, with a
  semi-transparent **scrim** behind it. Closeable via: tapping the scrim, **Escape**, or a close (X)
  button in the drawer header. **One drawer open at a time** (opening one closes the other).
- **Toggles** in the mobile header (`AppToolbar`, `lg:hidden`): an **"Options"** button (sliders icon)
  opens the right inspector drawer; a **"Recent"/panel** button opens the left rail drawer. `aria-expanded`
  + `aria-controls`. The inspector drawer carries the full inspector (tabs + options + the Update/Download
  action footer), so all controls remain reachable on mobile.
- **State** lifted to the workbench (`ConversionTool` workbench branch): `openDrawer: 'left'|'right'|null`,
  passed to `AppToolbar` (toggles) and to the mobile layout (drawers). Lock body scroll while a drawer is open.
- **Render drawer content ALWAYS** (show/hide via `translate-x`, not unmount) — so the panels stay in the
  DOM (existing mobile tests that query inspector/rail content keep working) and to preserve input state.
- Reuse the SAME content components (`WorkbenchRail`, `ConversionInspector`) inside the drawers — no
  duplication. Desktop branch (PanelGroup) untouched.

## Accessibility
Drawer = `role="dialog"` `aria-modal="true"` + `aria-label`; Escape closes; scrim is a button/labelled
overlay ("Close panel"); toggles set `aria-expanded`. Focus management (move focus into drawer on open,
restore on close) is nice-to-have.

## Tests
- New test (`workbenchMobileDrawers.ui.test.jsx`): mobile viewport (matchMedia matches:true) → the
  "Options" + "Recent" toggles render; both drawers start closed (`aria-expanded=false` / scrim absent);
  clicking a toggle opens its drawer (`aria-expanded=true`, scrim present); Escape / scrim click closes;
  opening the other toggle closes the first.
- Existing mobile tests: because drawer content stays mounted, queries for inspector/rail content should
  still resolve. If any test depends on visibility/closed-state, open the drawer first — do NOT weaken
  assertions. Run `npm test` fully green.

## Out of scope
Desktop changes. Per-column colors. Drawer swipe-gestures (toggle/scrim/Esc only).
