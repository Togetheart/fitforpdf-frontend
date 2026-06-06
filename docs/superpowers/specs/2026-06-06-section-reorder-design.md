# Drag-and-drop section reordering — design

- Date: 2026-06-06
- Status: approved (design), pending implementation
- Scope: frontend only (`fitforpdf-frontend`). Backend already renders sections in `columnGroups` array order (`buildExplicitColumnGroups`, pdfRenderer.js) — no backend change.

## Goal

In the `/app` workbench "Section names" inspector panel, let the user **drag-and-drop to reorder sections**. The new order must flow through to the **preview** and the **downloaded PDF**. Works on desktop (mouse) **and** touch (mobile/tablet), with keyboard accessibility.

## Current state

- The `::` glyphs in the panel are decorative (`cursor-grab`) — there is **no** drag handling on section rows.
- Section order today = the backend's returned order. The column-groups editor's `reassign()` (ConversionTool.jsx ~line 114) **force-sorts groups alphabetically by label**, so output order is locked to A, B, C…
- `columnGroups` (an array `[{label, columns}]`) is already built and sent on render (useConversion.mjs ~549). The backend honors its **array order** for section order.
- No drag-drop library is installed.

## Design

### Three orthogonal pieces of state, all keyed by section `label` (A, B, C…)

| State | Role | Status |
|---|---|---|
| `sectionTitleOverrides` | renamed titles | existing |
| `columnGroupsOverride` | which columns belong to each section | existing |
| **`sectionOrder`** (array of labels, e.g. `['A','C','B']`) | the **order** of sections | **new** |

Keeping order separate from membership and titles avoids coupling — each can change independently, all reconciled by `label`.

### Flow

1. The "Section names" panel renders `renderedSections` **ordered by `sectionOrder`**. Labels not present in `sectionOrder` (e.g. right after a fresh render) fall back to the backend's natural order, appended in order. Default `sectionOrder = []` ⇒ natural order.
2. Drag-drop (via the `::` handle) reorders the list using a **pure** helper `reorder(list, fromIndex, toIndex)` and writes the result to `sectionOrder`. No re-render is triggered yet.
3. On **"Update preview"** (existing button; same gesture used for renaming): when building the render `FormData`, emit `columnGroups` with the groups **ordered by `sectionOrder`**, each `{label, columns}` using the section's current column membership (from `columnGroupsOverride` if the user edited groups, else the rendered section's columns). The backend renders in that order ⇒ preview + download follow. The reserved **Fixed group** (pinned/anchor columns, `FIXED_GROUP_LABEL`) is **not** part of `sectionOrder` and is emitted alongside the ordered sections exactly as today (its columns repeat in every section regardless of order).
4. Remove the forced alphabetical sort in `reassign()` so the chosen order is preserved when columns are also reassigned. Group **order** is owned by `sectionOrder`; `reassign()` only changes membership.
5. `sectionOrder` resets (to `[]`) whenever the sections change — new file, remove file, or a render returns a different set of labels. (Same reset points as `renderedSections`/`sectionTitleOverrides`.)

### Drag-drop mechanism

`@dnd-kit/core` + `@dnd-kit/sortable` (chosen for robust mouse + touch + keyboard support and autoscroll; ~10 KB gz). A vertical `SortableContext` over the section rows; the `::` glyph is the drag handle (so the title `<input>` stays editable and selectable). `onDragEnd` → `reorder()` → `setSectionOrder`.

## Out of scope

- No backend changes (order already honored).
- No change to the download path (download uses the already-rendered PDF, which follows the order).
- Reordering of columns *within* a section (that's the separate column-groups editor).

## Testing

- **Pure logic (unit, vitest):** `reorder(list, from, to)` — moves item, bounds-safe, no-op when from===to. And the "build `columnGroups` in `sectionOrder` order" derivation: given sections + a `sectionOrder`, the emitted groups are in that order with correct `{label, columns}`.
- **Wiring (component/hook):** after setting `sectionOrder`, submitting includes `columnGroups` in the chosen order in the FormData (assert via the mocked-fetch render call, like existing appWorkbench.e2e tests).
- **DnD glue:** kept thin; jsdom can't simulate real drag, so the interaction itself is verified manually in the browser. The reorder + emit logic (the part that can break the output) is fully unit-tested.
- Full frontend suite stays green.

## Files (anticipated)

- `app/hooks/useConversion.mjs` — `sectionOrder` state + reset wiring; order `columnGroups` by `sectionOrder` at submit; export `sectionOrder` + `setSectionOrder`.
- `app/pageUiLogic.mjs` (or a small util) — pure `reorder()` + the ordered-`columnGroups` builder.
- `app/components/ConversionTool.jsx` — sortable "Section names" list (dnd-kit), drag handle on `::`; drop the alphabetical sort in `reassign()`.
- `package.json` — add `@dnd-kit/core`, `@dnd-kit/sortable`.
- Tests under `app/__tests__/`.
