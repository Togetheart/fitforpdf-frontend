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

// --- Section reordering (drag-and-drop) ---
//
// Sections render in the order of the columnGroups array sent to the backend
// (it reorders dataIndices by group order). These pure helpers let the workbench
// reorder sections via drag-and-drop and emit columnGroups in that order, without
// coupling order to titles or column membership (all keyed by the stable section
// label A, B, C, etc.).

// Reserved group label for pinned/anchor columns repeated in every section.
// Single source of truth (also imported by ConversionTool).
export const FIXED_GROUP_LABEL = '__fixed__';

// Move the item at `from` to `to`, returning a NEW array. Bounds-safe: an
// out-of-range index (or from === to) yields an unchanged copy. Never mutates.
export function reorder(list, from, to) {
  const arr = Array.isArray(list) ? list.slice() : [];
  if (
    from === to
    || from < 0 || to < 0
    || from >= arr.length || to >= arr.length
  ) {
    return arr;
  }
  const [moved] = arr.splice(from, 1);
  arr.splice(to, 0, moved);
  return arr;
}

// Order a list of {label,...} items so labels present in `order` come first (in
// that order), then any remaining items in their original order. Unknown labels
// in `order` are ignored. Empty/absent `order` yields the original order (copy).
function orderByLabel(items, order) {
  const list = Array.isArray(items) ? items.slice() : [];
  if (!Array.isArray(order) || order.length === 0) return list;
  const byLabel = new Map(list.map((it) => [it.label, it]));
  const used = new Set();
  const out = [];
  for (const label of order) {
    if (byLabel.has(label) && !used.has(label)) {
      out.push(byLabel.get(label));
      used.add(label);
    }
  }
  for (const it of list) if (!used.has(it.label)) out.push(it);
  return out;
}

// Display order for the "Section names" panel: rendered sections reordered to
// match `sectionOrder` (labels first in that order, the rest natural).
export function orderSectionsForDisplay(renderedSections, sectionOrder) {
  return orderByLabel(Array.isArray(renderedSections) ? renderedSections : [], sectionOrder);
}

// Build the columnGroups array to send on render, ordered by `sectionOrder`.
// - When the user edited groups (columnGroupsOverride set): reorder its non-Fixed
//   groups by sectionOrder, keep the Fixed group (appended).
// - When only the order changed: build groups from the rendered sections, plus a
//   Fixed group from frozen columns so pinning is preserved.
// Returns null when nothing is customized (no override AND order unchanged), so
// the caller sends no columnGroups and the backend auto-groups as before.
export function buildSubmitColumnGroups({
  renderedSections,
  columnGroupsOverride,
  sectionOrder,
  frozenColumns,
} = {}) {
  const sections = Array.isArray(renderedSections) ? renderedSections : [];
  const frozen = Array.isArray(frozenColumns) ? frozenColumns : [];
  const hasOverride = Array.isArray(columnGroupsOverride) && columnGroupsOverride.length > 0;

  let groups;
  if (hasOverride) {
    groups = columnGroupsOverride.map((g) => ({
      label: g.label,
      columns: Array.isArray(g.columns) ? g.columns.slice() : [],
    }));
  } else {
    groups = sections.map((s) => ({
      label: s.label,
      columns: Array.isArray(s.columns) ? s.columns.slice() : [],
    }));
    if (frozen.length) groups.push({ label: FIXED_GROUP_LABEL, columns: frozen.slice() });
  }

  const fixed = groups.filter((g) => g.label === FIXED_GROUP_LABEL);
  const nonFixed = groups.filter((g) => g.label !== FIXED_GROUP_LABEL);
  const orderedNonFixed = orderByLabel(nonFixed, sectionOrder);

  const orderCustomized = orderedNonFixed.map((g) => g.label).join(' ')
    !== nonFixed.map((g) => g.label).join(' ');

  if (!hasOverride && !orderCustomized) return null;

  return [...orderedNonFixed, ...fixed];
}
