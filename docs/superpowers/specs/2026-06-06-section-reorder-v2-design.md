# Section drag-and-drop reorder — v2 (position-based) design

- Date: 2026-06-06
- Status: approved direction (revert #49 + redesign), pending implementation
- Supersedes: `2026-06-06-section-reorder-design.md` (v1, reverted in #50)

## Why v1 was reverted

v1 keyed the order (`sectionOrder`) and the rename overrides by section **label**. But the backend assigns section labels **positionally** by `columnGroups` array order (1st group → "A", 2nd → "B", …) and maps `sectionTitles` by that positional label — it **discards** the labels the client sends (`buildExplicitColumnGroups` in pdfRenderer.js builds positional ranges only). Confirmed on prod: sending `columnGroups`=[B(b_col), A(a_col), C(c_col)] + `sectionTitles={A:"X"}` returned `A→b_col title "X"`, `B→a_col`. So any render that sends `columnGroups` in a non-natural order reshuffles labels → renames land on the wrong section and the order/titles drift on every re-render. The "label = stable identity" assumption was unsound.

## Decision: fix in the frontend, position-based

The backend's "sections are positional A,B,C by group order" is a simple, internally-consistent contract. The frontend must work *with* it rather than impose label-identity. (Backend label-preservation was considered and rejected: labels aren't even carried into the grouping function; making them stable is invasive and risky.)

## Model

A single local **working copy** of the sections, positional (order = array index, no label-identity):

```
sectionDraft: Array<{ columns: string[], title: string }>   // ordered
```

- **Sync:** after every successful render, `sectionDraft = renderedSections.map(s => ({ columns: s.columns, title: s.title }))`. The draft always mirrors the latest render (positional, in render order, with echoed titles).
- **Display:** the "Section names" panel renders `sectionDraft` in order. Drag reorders it; the rename input edits `sectionDraft[i].title`.
- **Submit ("Update preview"):** once a render exists (draft non-empty), build the payload from the draft, keyed by the **positional** label each section will get:
  - `columnGroups` = `sectionDraft.map((s, i) => ({ label: posLabel(i), columns: s.columns }))` + the Fixed group `{ label: '__fixed__', columns: frozenColumns }` when there are frozen columns.
  - `sectionTitles` = `{ [posLabel(i)]: s.title }` for **all** sections. (Sending every title — not just renamed ones — freezes the titles to their current values; for un-renamed sections that equals the backend's own derived title, so the result is unchanged, and it makes renames persist across re-renders. Idempotent.)
  - `posLabel(i)` = `String.fromCharCode(65 + i)` → A, B, C…
- **Round-trip is idempotent:** the backend renders sections in the order sent, assigns positional labels A,B,C in that order, echoes the titles. The response's `renderedSections` come back in the same order with the same titles; re-syncing the draft reproduces it. No drift; titles travel with their columns.
- **Order persists** because `columnGroups` is sent on every render once a draft exists (the grouping/order is explicit, so the backend never re-auto-groups it away). Trade-off: auto-grouping is "frozen" after the first render — acceptable and predictable; changing the file resets the draft.

## Scope / coexistence

- Replaces v1's `sectionOrder` and the workbench's use of `sectionTitleOverrides` (label-keyed). The draft owns order + titles for the workbench panel.
- **Column-groups editor** (`columnGroupsOverride`, membership): kept working. When the user reassigns columns, the draft's `columns` are rebuilt from the resulting groups (membership flows in), preserving the draft's order where labels still line up. Combined reorder + heavy regrouping is best-effort; the common path (reorder + rename of auto-detected sections) is the target and is fully correct.
- DnD lib: `@dnd-kit` (mouse + touch + keyboard), re-added.

## Testing

- **Pure (node:test):**
  - `reorder(list, from, to)` — move / bounds / no-mutation.
  - `buildGroupingPayload({ sectionDraft, frozenColumns })` → `{ columnGroups, sectionTitles }` positional: labels A,B,C by index; titles by positional label; Fixed appended; `null`/empty when no draft.
- **Wiring (real hook + mocked fetch):**
  - Reorder then submit → FormData `columnGroups` order + `sectionTitles` keyed by positional label match the dragged order.
  - **Round-trip / no-drift (the v1 bug):** render → rename section A "Cat" → reorder so a different section is first → submit; assert the rename stays on its own section and a second submit does **not** drift the titles. This is the regression test that v1 failed.
- DnD interaction (the drag gesture) is verified manually (jsdom can't simulate real drag); all payload + sync logic is unit-tested.
- Full frontend suite green.
