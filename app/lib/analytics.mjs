/**
 * PostHog event helpers — frontend only.
 *
 * Backend render events stay in Supabase (render_events table).
 * This module covers the user-behaviour events captured on the web app.
 */
function capture(event, properties) {
  if (typeof window === 'undefined') return;
  if (typeof window.posthog === 'undefined') return;
  try {
    window.posthog.capture(event, properties);
  } catch {
    // PostHog not yet initialized — silently skip
  }
}

// ── Public helpers ──────────────────────────────────────────

export function trackUploadStarted({ fileType, fileSize }) {
  capture('upload_started', { file_type: fileType, file_size: fileSize });
}

export function trackDemoFileUsed() {
  capture('demo_file_used');
}

/**
 * Fired when the demo PDF has actually been generated and shown to the user.
 * Distinct from `demo_file_used` (which tracks the click) — this measures
 * how many visitors actually consume the demo PDF, then drop off without
 * uploading their own file.
 */
export function trackDemoPdfShown() {
  capture('demo_pdf_shown');
}

/**
 * Fired when a user uploads their own real file in the same session as a
 * preceding demo render. Critical funnel signal — demo → upload conversion
 * is currently 0% per the in-app dashboard, so we need to know whether
 * any change actually moves it.
 */
export function trackUploadAfterDemo(context = {}) {
  const { fileType, fileSize } = context || {};
  capture('upload_after_demo', {
    file_type: fileType,
    file_size: fileSize,
  });
}

/**
 * Fired on every completed render (success OR failure with confidence).
 *
 * Captures every dimension we have so we can later run the diagnostic
 * "is XLSX scoring worse than CSV at equivalent file sizes?" — answering
 * the parser-bug hypothesis vs the selection-bias hypothesis.
 *
 * Properties are emitted in snake_case to match the existing convention
 * (`file_type`, `file_size`).
 *
 * Missing fields are stripped so PostHog doesn't store noise like
 * "wrap_pressure": null on every event from a backend that doesn't
 * surface it yet.
 */
export function trackRenderCompleted(metrics = {}) {
  const {
    fileType,
    fileSize,
    mode,
    score,
    verdict,
    colCount,
    rowCount,
    pageCount,
    wrapPressure,
    overflowCells,
    renderMs,
    reasons,
    isDemo,
  } = metrics || {};

  const properties = {};
  if (fileType !== undefined) properties.file_type = fileType;
  if (fileSize !== undefined) properties.file_size = fileSize;
  if (mode !== undefined) properties.mode = mode;
  if (score !== undefined) properties.score = score;
  if (verdict !== undefined) properties.verdict = verdict;
  if (colCount !== undefined && colCount !== null) properties.col_count = colCount;
  if (rowCount !== undefined && rowCount !== null) properties.row_count = rowCount;
  if (pageCount !== undefined && pageCount !== null) properties.page_count = pageCount;
  if (wrapPressure !== undefined && wrapPressure !== null) properties.wrap_pressure = wrapPressure;
  if (overflowCells !== undefined && overflowCells !== null) properties.overflow_cells = overflowCells;
  if (renderMs !== undefined && renderMs !== null) properties.render_ms = renderMs;
  if (Array.isArray(reasons)) properties.reasons = reasons;
  if (isDemo !== undefined) properties.is_demo = isDemo;

  capture('render_completed', properties);
}

export function trackPaymentStarted({ plan, pack }) {
  capture('payment_started', { plan, pack });
}

export function trackPaymentCompleted({ plan, pack }) {
  capture('payment_completed', { plan, pack });
}

export function trackShareLinkCopied({ surface, jobId }) {
  capture('share_link_copied', {
    surface,
    job_id: jobId,
  });
}

// ── Lead capture (post-render soft email gate) ────────────────────
// Wired by app/components/LeadCaptureModal.jsx. Lets us measure the funnel:
// lead_modal_shown → (lead_captured | lead_skipped). Source tags the surface
// so we can A/B-test alternative trigger points (download, share, etc.).

export function trackLeadModalShown({ source, renderId }) {
  capture('lead_modal_shown', { source, render_id: renderId });
}

export function trackLeadCaptured({ source, renderId }) {
  capture('lead_captured', { source, render_id: renderId });
}

export function trackLeadSkipped({ source, renderId }) {
  capture('lead_skipped', { source, render_id: renderId });
}
