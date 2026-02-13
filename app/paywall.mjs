export const STORAGE_KEY = 'fitforpdf_free_exports_used';
const FREE_EXPORT_LIMIT = 3;

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis.localStorage !== 'undefined') {
    return globalThis.localStorage;
  }
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function parseUsed(value) {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, FREE_EXPORT_LIMIT);
}

export function getUsedCount() {
  const storage = getStorage();
  if (!storage) return 0;
  return parseUsed(storage.getItem(STORAGE_KEY));
}

export function incrementUsedCount() {
  const storage = getStorage();
  if (!storage) return 0;
  const next = Math.min(getUsedCount() + 1, FREE_EXPORT_LIMIT);
  storage.setItem(STORAGE_KEY, String(next));
  return next;
}

export function canExport() {
  return getUsedCount() < FREE_EXPORT_LIMIT;
}

export function freeLeft() {
  return Math.max(0, FREE_EXPORT_LIMIT - getUsedCount());
}

export function resetDevOnly() {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, '0');
}
