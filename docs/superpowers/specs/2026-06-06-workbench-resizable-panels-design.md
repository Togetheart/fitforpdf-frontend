# Workbench resizable / collapsible panels (Phase 1)

**Date:** 2026-06-06 · **Status:** Approved (lib = react-resizable-panels) · **Frontend-only**

## Goal (Phase 1 — desktop only)
Make the `/app` workbench's **left** (dark examples/history) and **right** (inspector) columns
**resizable** (drag handle) and **collapsible** (toggle), with sizes/collapsed state **persisted**.
The center stays fluid. **Mobile is unchanged in this phase** (Phase 2 = drawers; Phase 3 = tabs).

## Current layout (ConversionTool.jsx, `layout === 'workbench'`, ~line 1100)
A CSS grid: `lg:grid-cols-[264px_minmax(0,1fr)_320px]` on desktop, `grid-cols-1` (stacked via
`order-1/2/3`) on mobile. Left = dark `bg-slate-950` aside (~line 555); center = main workspace
(~line 1108); right = `<ConversionInspector/>` aside (~line 328).

## Design
- Use **`react-resizable-panels`** (`PanelGroup` / `Panel` / `PanelResizeHandle`).
- **Desktop only** (`min-width:1024px`): render a horizontal `PanelGroup` with
  `autoSaveId="ffp-workbench-panels"` (built-in localStorage persistence) and:
  - left `Panel` — `collapsible defaultSize={18} minSize={12} collapsedSize={0}`
  - `PanelResizeHandle`
  - center `Panel` — `minSize={30}` (no collapse)
  - `PanelResizeHandle`
  - right `Panel` — `collapsible defaultSize={22} minSize={16} collapsedSize={0}`
- Each collapsible panel gets a **collapse/expand toggle button** (chevron) wired to the panel's
  imperative ref (`ref.current.collapse()` / `.expand()` / `.isCollapsed()`), with aria-labels
  `Collapse left panel` / `Expand left panel` (and right). When a panel is collapsed, also show a
  thin **re-open affordance** (a small button on the edge) so it can be expanded again.
- **Below `lg`**: render the EXISTING stacked layout unchanged (no PanelGroup). Detect desktop with a
  client hook `useIsDesktop()` (matchMedia `(min-width:1024px)`, `useState`+`useEffect`, default
  `false` to avoid hydration mismatch). Extract the left/center/right column markup into reusable
  fragments/components so the desktop (PanelGroup) and mobile (stacked) branches share them — no
  duplication of content. (Right is already `<ConversionInspector/>`; extract the left dark aside.)

## Testability gotchas (must handle)
- Add a **`ResizeObserver` no-op stub** to `app/__tests__/setup.mjs` (jsdom lacks it; the lib needs it).
- `setup.mjs` `matchMedia` returns `matches:false` → existing workbench tests render the **mobile**
  branch (unchanged content) and keep passing. The NEW test must **override `window.matchMedia`** to
  return `matches:true` for `(min-width:1024px)` so the desktop `PanelGroup` renders.

## Tests (vitest, new file `app/__tests__/workbenchResizablePanels.ui.test.jsx`)
With matchMedia forced to desktop: the workbench renders **resize handles** (PanelResizeHandle exposes
`role="separator"`) and the **collapse toggle buttons** (`Collapse left panel`, `Collapse right panel`);
clicking a toggle flips its aria-label/state to Expand. Keep `npm test` fully green (existing 454 + node).

## Out of scope (later phases)
Phase 2: mobile off-canvas drawers (slide over center) with header toggles, replacing the stacked flow.
Phase 3: tabs in the right inspector — "Sections" (Column grouping + Section name & color) /
"Export" (Report title + Branding). Left column stays examples/history.
