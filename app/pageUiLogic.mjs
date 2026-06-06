export const PAGE_BURDEN_REASON_CODE = 'page_burden_high';
const RECOMMENDATION_MODE_COMPACT = 'mode_compact';
const RECOMMENDATION_SCOPE_REDUCE = 'scope_reduce';

export function buildRenderUrl(apiUrl, mode, options = {}) {
  const truncateLongText = Boolean(options && options.truncateLongText === true);
  const params = new URLSearchParams();
  // columnMap is user-controllable (off/auto/force). Default 'auto' — the proxy
  // previously hardcoded 'auto', overriding the old 'force' default, so 'auto'
  // is the real effective behavior; keeping it preserves render output.
  const requestedColumnMap = options && options.columnMap;
  const columnMap = ['off', 'auto', 'force'].includes(requestedColumnMap) ? requestedColumnMap : 'auto';
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
  return { columnGroups, sectionTitles };
}

// Move a column between sections / Fixed in the draft. `target` is 'fixed', an
// existing section index, or any index >= length to start a new trailing
// section. Removes the column from wherever it was; drops emptied sections.
// Pure: returns a new { sectionDraft, frozenColumns }.
export function reassignColumn({ sectionDraft, frozenColumns, column, target } = {}) {
  const col = column;
  let draft = (Array.isArray(sectionDraft) ? sectionDraft : []).map((s) => ({
    title: s.title,
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
