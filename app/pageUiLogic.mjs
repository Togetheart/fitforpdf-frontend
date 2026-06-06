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
// in a readable shade for colored text on white. The Tailwind shades below equal
// the backend hexes exactly: blue-600 #2563EB, green-500 #22C55E, amber-500 #F59E0B,
// red-500 #EF4444, violet-500 #8B5CF6, cyan-600 #0891B2, pink-500 #EC4899,
// emerald-600 #059669, red-600 #DC2626, violet-600 #7C3AED, sky-700 #0369A1,
// amber-600 #D97706.
export const SECTION_COLOR_CLASSES = [
  { pill: 'bg-blue-600', name: 'text-blue-700' },      // A blue
  { pill: 'bg-green-500', name: 'text-green-700' },    // B green
  { pill: 'bg-amber-500', name: 'text-amber-700' },    // C amber
  { pill: 'bg-red-500', name: 'text-red-600' },        // D red
  { pill: 'bg-violet-500', name: 'text-violet-700' },  // E violet
  { pill: 'bg-cyan-600', name: 'text-cyan-700' },      // F cyan
  { pill: 'bg-pink-500', name: 'text-pink-700' },      // G pink
  { pill: 'bg-emerald-600', name: 'text-emerald-700' }, // H emerald
  { pill: 'bg-red-600', name: 'text-red-700' },        // I red-600
  { pill: 'bg-violet-600', name: 'text-violet-800' },  // J violet-600
  { pill: 'bg-sky-700', name: 'text-sky-800' },        // K sky-700
  { pill: 'bg-amber-600', name: 'text-amber-800' },    // L amber-600
];

// The strong section palette hexes, index-aligned with SECTION_COLOR_CLASSES and
// mirroring the backend SECTION_COLOR_PALETTE (so a chosen swatch maps 1:1 to the
// color the PDF section header prints). The swatch picker offers exactly these.
export const SECTION_COLOR_HEXES = [
  '#2563EB', // A blue
  '#22C55E', // B green
  '#F59E0B', // C amber
  '#EF4444', // D red
  '#8B5CF6', // E violet
  '#0891B2', // F cyan
  '#EC4899', // G pink
  '#059669', // H emerald
  '#DC2626', // I red-600
  '#7C3AED', // J violet-600
  '#0369A1', // K sky-700
  '#D97706', // L amber-600
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
