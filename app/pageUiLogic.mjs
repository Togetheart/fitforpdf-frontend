export const PAGE_BURDEN_REASON_CODE = 'page_burden_high';
const RECOMMENDATION_MODE_COMPACT = 'mode_compact';
const RECOMMENDATION_SCOPE_REDUCE = 'scope_reduce';

export function buildRenderUrl(apiUrl, mode, options = {}) {
  const truncateLongText = Boolean(options && options.truncateLongText === true);
  const params = new URLSearchParams();
  // columnMap is user-controllable (off/auto). Default 'auto'. 'force' is retired
  // (it behaved identically to 'auto'); any legacy/invalid value falls back to auto.
  const requestedColumnMap = options && options.columnMap;
  const columnMap = ['off', 'auto'].includes(requestedColumnMap) ? requestedColumnMap : 'auto';
  params.set('columnMap', columnMap);
  if (mode === 'optimized') {
    params.set('mode', 'optimized');
  }
  if (mode === 'compact') {
    params.set('mode', 'compact');
  }
  if (truncateLongText) {
    params.set('truncate_long_text', 'true');
  }

  const base = String(apiUrl || '').trim();
  const query = params.toString();
  if (/^https?:\/\//i.test(base)) {
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    const url = new URL('render', normalizedBase);
    for (const [key, value] of params.entries()) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  const normalizedPath = base ? base.replace(/\/+$/, '') : '';
  const path = `${normalizedPath}/render`;
  return query ? `${path}?${query}` : path;
}

export function isPageBurdenFail(confidence) {
  if (!confidence || confidence.verdict !== 'FAIL') return false;
  const reasons = Array.isArray(confidence.reasons) ? confidence.reasons : [];
  return reasons.includes(PAGE_BURDEN_REASON_CODE);
}

export function getFailKind(confidence) {
  if (!confidence || confidence.verdict !== 'FAIL') return 'none';
  return isPageBurdenFail(confidence) ? 'page_burden' : 'generic';
}

export function getPageBurdenUiCopy() {
  return {
    title: 'Document too large for direct sending',
    description: 'This PDF would exceed a reasonable volume for human review.',
    primaryCta: 'Generate compact version',
    secondaryCta: 'Adjust scope (coming soon)',
  };
}

export function normalizePageBurdenRecommendations(rawRecommendations) {
  if (!Array.isArray(rawRecommendations)) return [];
  const normalized = [];
  for (const raw of rawRecommendations) {
    const token = String(raw || '').trim().toLowerCase();
    if (!token) continue;
    if (
      token === RECOMMENDATION_MODE_COMPACT
      || token.includes('mode=compact')
      || token.includes('mode compact')
      || token.includes('try mode=compact')
    ) {
      normalized.push(RECOMMENDATION_MODE_COMPACT);
      continue;
    }
    if (
      token === RECOMMENDATION_SCOPE_REDUCE
      || token.includes('scope')
      || token.includes('reduce rows')
      || token.includes('reduce rows or columns')
    ) {
      normalized.push(RECOMMENDATION_SCOPE_REDUCE);
      continue;
    }
  }
  return [...new Set(normalized)];
}

export function recommendationLabel(token) {
  if (token === RECOMMENDATION_MODE_COMPACT) return 'Try compact mode.';
  if (token === RECOMMENDATION_SCOPE_REDUCE) return 'Reduce rows or columns.';
  return String(token || '');
}

// --- Section reorder v2 (position-based) ---
//
// The backend labels sections POSITIONALLY by the columnGroups array order
// (1st group -> "A", 2nd -> "B", ...) and maps sectionTitles by that positional
// label. So the workbench keeps a position-indexed working copy of the sections
// (no label identity) and emits both columnGroups and sectionTitles by position.

// Reserved group label (matches the backend) for pinned columns repeated in
// every section. Single source of truth (also imported by ConversionTool).
export const FIXED_GROUP_LABEL = '__fixed__';

// Section colors — MUST mirror the backend SECTION_COLOR_PALETTE (strong hex) in
// fitforpdf-backend/src/pdfRenderer.js so the workbench shows the EXACT colors the
// PDF prints. Indexed by section position (cycles). `pill` = the section's color as
// a filled badge (white text, matches the PDF section bar); `name` = the same hue
// in a readable shade for colored text on white. Curated, deeper/"inked" editorial
// palette (anchored on ink-blue + teal/ochre/rose accents). The Tailwind shades
// equal the backend hexes exactly: blue-700 #1D4ED8, teal-600 #0D9488, amber-600
// #D97706, rose-600 #E11D48, violet-600 #7C3AED, cyan-700 #0E7490, orange-700
// #C2410C, emerald-700 #047857, fuchsia-700 #A21CAF, indigo-600 #4F46E5, sky-700
// #0369A1, pink-700 #BE185D.
export const SECTION_COLOR_CLASSES = [
  { pill: 'bg-blue-700', name: 'text-blue-700' },        // A ink blue
  { pill: 'bg-teal-600', name: 'text-teal-700' },        // B teal
  { pill: 'bg-amber-600', name: 'text-amber-700' },      // C ochre
  { pill: 'bg-rose-600', name: 'text-rose-700' },        // D rose
  { pill: 'bg-violet-600', name: 'text-violet-700' },    // E violet
  { pill: 'bg-cyan-700', name: 'text-cyan-800' },        // F steel
  { pill: 'bg-orange-700', name: 'text-orange-800' },    // G terracotta
  { pill: 'bg-emerald-700', name: 'text-emerald-800' },  // H emerald
  { pill: 'bg-fuchsia-700', name: 'text-fuchsia-800' },  // I plum
  { pill: 'bg-indigo-600', name: 'text-indigo-700' },    // J indigo
  { pill: 'bg-sky-700', name: 'text-sky-800' },          // K sky
  { pill: 'bg-pink-700', name: 'text-pink-800' },        // L pink
];

// The strong section palette hexes, index-aligned with SECTION_COLOR_CLASSES and
// mirroring the backend SECTION_COLOR_PALETTE (so a chosen swatch maps 1:1 to the
// color the PDF section header prints). The swatch picker offers exactly these.
export const SECTION_COLOR_HEXES = [
  '#1D4ED8', // A ink blue   (blue-700)
  '#0D9488', // B teal       (teal-600)
  '#D97706', // C ochre      (amber-600)
  '#E11D48', // D rose       (rose-600)
  '#7C3AED', // E violet     (violet-600)
  '#0E7490', // F steel      (cyan-700)
  '#C2410C', // G terracotta (orange-700)
  '#047857', // H emerald    (emerald-700)
  '#A21CAF', // I plum       (fuchsia-700)
  '#4F46E5', // J indigo     (indigo-600)
  '#0369A1', // K sky        (sky-700)
  '#BE185D', // L pink       (pink-700)
];

// The pill/name color classes for section index i (cycles through the palette).
export function sectionColorClasses(i) {
  const idx = ((Number(i) % SECTION_COLOR_CLASSES.length) + SECTION_COLOR_CLASSES.length) % SECTION_COLOR_CLASSES.length;
  return SECTION_COLOR_CLASSES[Number.isFinite(Number(i)) ? idx : 0];
}

// A chosen section color is any valid #RRGGBB hex (free-form via the native color
// picker). The preset hexes above are only the picker's per-section default value;
// the user may pick any color. The backend accepts any #RRGGBB and derives a
// matched/light tint for it (lightForStrong).
export function isValidSectionColor(hex) {
  return typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex.trim());
}

// Positional section label for index i: 0 -> 'A', 1 -> 'B', ...
function posLabel(i) {
  return String.fromCharCode(65 + i);
}

// Move the item at `from` to `to`, returning a NEW array. Bounds-safe (an
// out-of-range index or from === to yields an unchanged copy). Never mutates.
export function reorder(list, from, to) {
  const arr = Array.isArray(list) ? list.slice() : [];
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const [moved] = arr.splice(from, 1);
  arr.splice(to, 0, moved);
  return arr;
}

// Turn the position-indexed section draft into the render payload the backend
// expects: columnGroups (positional labels, in draft order, + Fixed group) and
// sectionTitles (positional label -> title, blanks omitted).
export function buildGroupingPayload({ sectionDraft, frozenColumns } = {}) {
  const draft = Array.isArray(sectionDraft) ? sectionDraft : [];
  const frozen = Array.isArray(frozenColumns) ? frozenColumns : [];
  const columnGroups = draft.map((s, i) => ({
    label: posLabel(i),
    columns: Array.isArray(s.columns) ? s.columns.slice() : [],
  }));
  if (frozen.length) columnGroups.push({ label: FIXED_GROUP_LABEL, columns: frozen.slice() });
  const sectionTitles = {};
  draft.forEach((s, i) => {
    if (typeof s.title === 'string' && s.title.trim()) sectionTitles[posLabel(i)] = s.title.trim();
  });
  // sectionColors: positional label -> chosen palette hex, only for sections the
  // user recolored with a valid preset swatch. Blank/invalid colors are skipped so
  // those sections keep the default positional palette in the PDF.
  const sectionColors = {};
  draft.forEach((s, i) => {
    if (isValidSectionColor(s.color)) sectionColors[posLabel(i)] = s.color;
  });
  return { columnGroups, sectionTitles, sectionColors };
}

/**
 * Decide the `includeColumns` payload from the picker selection.
 * Returns the list of columns to KEEP, or null to OMIT the field entirely
 * (which makes the backend render all columns — the byte-unchanged default).
 *
 * @param {{ allColumns?: string[], excludedColumns?: string[] }} [opts]
 * @returns {string[] | null}
 */
export function buildIncludeColumns({ allColumns, excludedColumns } = {}) {
  const all = Array.isArray(allColumns) ? allColumns.filter((c) => typeof c === 'string') : [];
  if (all.length === 0) return null;
  const excludedSet = new Set(Array.isArray(excludedColumns) ? excludedColumns : []);
  if (excludedSet.size === 0) return null; // nothing curated -> render all
  const kept = all.filter((c) => !excludedSet.has(c));
  if (kept.length === 0) return null; // never send an empty list -> render all
  if (kept.length === all.length) return null; // excluded only stale names -> no-op
  return kept;
}

// Move a column between sections / Fixed in the draft. `target` is 'fixed', an
// existing section index, or any index >= length to start a new trailing
// section. Removes the column from wherever it was; drops emptied sections.
// Pure: returns a new { sectionDraft, frozenColumns }.
export function reassignColumn({ sectionDraft, frozenColumns, column, target } = {}) {
  const col = column;
  let draft = (Array.isArray(sectionDraft) ? sectionDraft : []).map((s) => ({
    title: s.title,
    // Carry the section's chosen color through column moves (was being dropped).
    ...(s.color != null ? { color: s.color } : {}),
    columns: (Array.isArray(s.columns) ? s.columns : []).filter((c) => c !== col),
  }));
  let frozen = (Array.isArray(frozenColumns) ? frozenColumns : []).filter((c) => c !== col);

  if (target === 'fixed') {
    frozen = [...frozen, col];
  } else {
    const idx = Number(target);
    if (Number.isInteger(idx) && idx >= 0 && idx < draft.length) {
      draft[idx] = { ...draft[idx], columns: [...draft[idx].columns, col] };
    } else {
      draft = [...draft, { title: '', columns: [col] }];
    }
  }

  draft = draft.filter((s) => s.columns.length > 0);
  return { sectionDraft: draft, frozenColumns: frozen };
}

/* "Update preview" re-renders the SAME content, so it must keep the mode the
 * user last rendered with (e.g. the demo sample renders in 'compact'); falling
 * back to 'normal' silently changed the layout — QA saw 33 pages become 36 on
 * an unchanged regeneration. A fresh upload has no PDF yet → default mode. */
export function resolveResubmitMode(hasExistingPdf, lastRequestMode) {
  return hasExistingPdf && lastRequestMode ? lastRequestMode : 'normal';
}
