export const PAGE_BURDEN_REASON_CODE = 'page_burden_high';
const RECOMMENDATION_MODE_COMPACT = 'mode_compact';
const RECOMMENDATION_SCOPE_REDUCE = 'scope_reduce';

export function buildRenderUrl(apiUrl, mode, options = {}) {
  const truncateLongText = Boolean(options && options.truncateLongText === true);
  const params = new URLSearchParams();
  params.set('columnMap', 'force');
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
    title: 'Document trop volumineux pour un envoi direct',
    description: 'Ce PDF dépasserait un volume raisonnable pour une lecture humaine.',
    primaryCta: 'Générer une version compacte',
    secondaryCta: 'Modifier le périmètre (bientôt disponible)',
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
  if (token === RECOMMENDATION_MODE_COMPACT) return 'Essayez le mode compact.';
  if (token === RECOMMENDATION_SCOPE_REDUCE) return 'Réduisez le nombre de lignes ou de colonnes.';
  return String(token || '');
}
