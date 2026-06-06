# Editable section colors ("Section name & color")

**Date:** 2026-06-06 · **Status:** Approved (option A — preset swatches) · **Cross-repo** (frontend + backend)

## Goal
Let the user pick each PDF section's color from a **preset palette of swatches**, in the
workbench editor renamed **"Section names" → "Section name & color"**. The chosen color
applies to the **PDF section header** AND the workbench (pills + column names).

## Contract (the wire)
- `sectionColors`: a JSON object map `{ "<positionalLabel>": "#RRGGBB" }`, e.g. `{"A":"#EF4444","C":"#8B5CF6"}`.
  Positional labels (A, B, C…) match the existing `columnGroups` / `sectionTitles` scheme.
  Only sections the user recolored appear; others use the default positional palette.
- Sent in the **`/render` request FormData** alongside `columnGroups` + `sectionTitles`
  (`useConversion`). The `/api/render` proxy already forwards the whole FormData — **no proxy change**.
- Backend (`/render`, app.js) parses `req.body.sectionColors`; V1 API is unaffected
  (it does not accept custom sections).
- Swatch palette = the section palette hexes (mirrors backend `SECTION_COLOR_PALETTE`):
  `#2563EB #22C55E #F59E0B #EF4444 #8B5CF6 #0891B2 #EC4899 #059669 …`.

## Backend (fitforpdf-backend — pdfRenderer.js + app.js)
1. `getSectionColorHex(groupIndex, headers, sectionColors)`: if `normalizeColorHex(sectionColors[sectionLabel(groupIndex)])`
   is valid, return it; else `getSectionPalette(groupIndex).strong`. Pass `options.sectionColors`
   at both render call sites (≈5762, ≈6038); the overview inherits via `projectedGroups[].sectionColorHex`.
2. `lightForStrong(strongHex)`: return the matched `light` from `SECTION_COLOR_PALETTE` (case-insensitive
   strong match); else derive a light tint (mix strong ~90% toward white); fallback `#F8FAFC`.
   Use it in `normalizeSectionPalette`'s bare-strong-hex branch (so a forced/custom strong gets a
   matched/derived light instead of the positional fallback light).
3. `app.js`: `parseSectionColorsOption(raw)` (mirror `parseSectionTitlesOption`): accept an object map,
   keep entries whose key is a section label and value a valid `#RRGGBB`, cap ~26, else null. Parse
   from `req.body.sectionColors`, include in the parsed options, and forward into the render-options
   assembly next to `sectionTitles`.
4. Tests: renderer honors `sectionColors:{A:'#EF4444'}` (header strong = #EF4444 + matched light, via
   `returnMeta`); `parseSectionColorsOption` unit (valid kept / bad hex dropped); `renderRoute` forwards
   the body field to the renderer. Verify: `npm test -- --runInBand`.

## Frontend (fitforpdf-frontend — pageUiLogic.mjs + useConversion.mjs + ConversionTool.jsx)
1. `pageUiLogic.mjs`: add `SECTION_COLOR_HEXES` (strong hexes, index-aligned with `SECTION_COLOR_CLASSES`);
   `classesForHex(hex)` → the `{pill,name}` classes for a palette hex (by index; fallback positional).
   `buildGroupingPayload` also returns `sectionColors` = `{ [posLabel(i)]: s.color }` for sections with a
   valid color. `reassignColumn`/`reorder` preserve each section's `color`.
2. `useConversion.mjs`: `sectionDraft` items may carry `color`; expose `setSectionColor(index, hex)`;
   append `sectionColors` JSON to the render FormData when non-empty.
3. `ConversionTool.jsx`: rename the InspectorSection to **"Section name & color"**; each row in
   `SectionNamesEditor` gets a swatch picker (a small row/popover of preset swatches; clicking sets the
   section color). Pills + column names use the section's chosen color (`classesForHex`) when set, else
   the positional `sectionColorClasses`.
4. Tests: `buildGroupingPayload` emits `sectionColors`; `useConversion` sends it; the editor renders
   swatches and picking one recolors the pill/name; (no proxy change). Verify: `npm test`.

## Out of scope
Free-form color picker (option B) — presets only for now. Per-column colors. V1 API support.
