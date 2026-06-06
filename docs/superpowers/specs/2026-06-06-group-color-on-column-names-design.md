# Group color on column names (Custom groups panel)

**Date:** 2026-06-06
**Status:** Approved (brainstorming) — ready for implementation
**Surface:** `/app` workbench → right-hand inspector → **Column grouping → Custom groups**
**Component:** `app/components/ConversionTool.jsx` (`CustomGroupsControl`)
**Stacked on:** `feat/section-reorder-v2` (the position-based panel; not yet merged)

## Problem / intent

In the **Custom groups** list, every column row shows its name in neutral gray
(`text-slate-700`) next to a dropdown that assigns it to a group. The colored
group pills ("Group A" blue, "Group B" green, "Group C" orange) sit just above.

The user wants the **group's color to flow onto the column name itself**: a column
assigned to the blue group (A) shows its name in blue, a column in the green group
(B) shows green, etc. — so the panel reads as colored entities, not gray text +
a separate color legend. (User: « la couleur du groupe se retrouve sur le nom de
l'entité de la colonne ».)

## Design

- **Reuse the exact pill color sequence**, so a column's name color always matches
  its group's pill. The pills use, by section index `i`:
  `['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-violet-600'][i % 4]`.
  The column name uses the matching text palette (deeper shade for readability on
  white): `['text-blue-700', 'text-emerald-700', 'text-amber-700', 'text-violet-700'][i % 4]`,
  rendered **semibold** so the color reads as intentional.
- **Source of truth = the live draft** (the dropdown's current value, via the
  existing `targetOf(col)` → section index). The name recolors **immediately** when
  a column is moved to another group — no re-render required. The pills (rendered
  state) catch up on "Update preview" as today.
- **Fixed columns** (`frozenSet`, repeated in every section) belong to no single
  group → **stay neutral gray** (`text-slate-700`), keeping their existing "fixed"
  tag. Confirmed with user.
- The color goes on the **name span only**, not the "fixed" tag.

## Scope

- One file edit: `CustomGroupsControl` in `ConversionTool.jsx` (color the name
  span based on `targetOf(col)`; fixed → neutral).
- No change to the pills, the dropdown options, the section-draft logic, the
  render request, or any backend behavior. Pure presentation.

## Out of scope

- Recoloring the dropdown `<select>` or its options.
- Any change to the group pills or section reorder/rename behavior.
- Accessibility beyond using readable `-700` shades (hue is the user's explicit ask).

## Tests (TDD) — extend `app/__tests__/appCustomGroups.e2e.test.jsx`

Using the existing fixture (A=[Region, Plan], B=[Email, Phone], fixed=[Customer ID, Internal ID]):

1. Columns in group A render their name with `text-blue-700`; group B with `text-emerald-700`.
2. Fixed columns (Customer ID, Internal ID) carry **no** group color class (stay neutral).
3. Moving a fixed column into group A recolors its name to `text-blue-700` **live**
   (before any re-render), proving the color tracks the dropdown.
