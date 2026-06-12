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

// Generic upsell/paywall event (e.g. paywall_branding_attempt,
// paywall_upgrade_clicked). `name` is the event; `properties` tags the surface.
export function trackPaywallEvent(name, properties = {}) {
  if (typeof name !== 'string' || !name) return;
  capture(name, properties);
}

export function trackUploadStarted({ fileType, fileSize }) {
  capture('upload_started', { file_type: fileType, file_size: fileSize });
}

export function trackUploadFileTooLarge({ fileSize, limitBytes, fileType } = {}) {
  capture('upload_file_too_large', {
    file_size: fileSize,
    limit_bytes: limitBytes,
    file_type: fileType,
  });
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

// ── Distribution-sprint funnel (S1, 2026-06-10) ──────────────────
// app_open → (demo_file_used | upload_started) → render_completed →
// control_used → paywall_view → payment_completed, each breakable by
// ref/initial_ref so the 31 July verdict (criterion 3: a channel delivers
// ≥50 activated users/week, 2 consecutive weeks) is measurable.

/**
 * Fired once per /app mount. Registers `ref` as a session super property and
 * pins first-touch attribution on the person via $set_once.
 */
export function trackAppOpened({ surface, ref, initialRef, initialReferrer } = {}) {
  const properties = {};
  if (surface !== undefined) properties.surface = surface;
  if (ref) properties.ref = ref;
  if (initialRef || initialReferrer) {
    properties.$set_once = {};
    if (initialRef) properties.$set_once.initial_ref = initialRef;
    if (initialReferrer) properties.$set_once.initial_referrer = initialReferrer;
  }
  if (ref && typeof window !== 'undefined' && typeof window.posthog !== 'undefined') {
    try {
      window.posthog.register({ ref });
    } catch {}
  }
  capture('app_open', properties);
}

// One event per control per app_open — a Set dedupes so typing 40 chars in
// the title field stays ONE control_used. Reset on every app_open mount.
const firedControls = new Set();

export function resetControlUsageTracking() {
  firedControls.clear();
}

/**
 * Fired the FIRST time a given inspector control is touched in this app
 * session. `control` ∈ column_grouping | custom_groups | section_rename |
 * section_reorder | section_color | report_title | accent_color | logo |
 * footer_text. Answers "which V2 controls do real users actually reach for"
 * — the question the V1 tester could never generate data for.
 */
export function trackControlUsed({ control, surface } = {}) {
  if (typeof control !== 'string' || !control) return;
  if (firedControls.has(control)) return;
  firedControls.add(control);
  const properties = { control };
  if (surface !== undefined) properties.surface = surface;
  capture('control_used', properties);
}

/**
 * Fired when a quota paywall becomes VISIBLE (distinct from the existing
 * paywall_*_clicked events, which only fire on interaction). paywall_view →
 * payment_started → payment_completed is the monetization sub-funnel.
 */
export function trackPaywallViewed({ surface, plan } = {}) {
  const properties = {};
  if (surface !== undefined) properties.surface = surface;
  if (plan !== undefined) properties.plan = plan;
  capture('paywall_view', properties);
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

// ── Post-render conversion funnel ────────────────────────────────
// The result screen is where real intent shows up: did the user
// actually download, click pricing/contact, or start a second
// render? Each helper carries render_id + flow_id so PostHog can
// stitch the loop together.

function buildPostRenderProps({ renderId, flowId, isDemo, verdict, score, fileType } = {}) {
  const properties = {};
  if (renderId !== undefined) properties.render_id = renderId;
  if (flowId !== undefined) properties.flow_id = flowId;
  if (isDemo !== undefined) properties.is_demo = isDemo;
  if (verdict !== undefined) properties.verdict = verdict;
  if (score !== undefined && score !== null) properties.score = score;
  if (fileType !== undefined) properties.file_type = fileType;
  return properties;
}

export function trackDownloadClicked(context = {}) {
  capture('download_clicked', buildPostRenderProps(context));
}

export function trackDownloadCompleted(context = {}) {
  capture('download_completed', buildPostRenderProps(context));
}

export function trackPostRenderPricingClicked(context = {}) {
  capture('post_render_pricing_clicked', buildPostRenderProps(context));
}

export function trackPostRenderContactClicked(context = {}) {
  capture('post_render_contact_clicked', buildPostRenderProps(context));
}

export function trackSecondRealRenderStarted({ previousRenderId, flowId } = {}) {
  const properties = {};
  if (previousRenderId !== undefined) properties.previous_render_id = previousRenderId;
  if (flowId !== undefined) properties.flow_id = flowId;
  capture('second_real_render_started', properties);
}
