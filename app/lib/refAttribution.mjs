/**
 * Channel attribution for the distribution sprint (S1, 2026-06-10).
 *
 * Convention: every link we publish carries ?ref=<channel> —
 *   hn (Show HN) · ph (Product Hunt) · li (LinkedIn outreach) ·
 *   compta (accounting communities) · mcp (MCP registries) ·
 *   betalist / microlaunch (legacy promo refs, see REF_TO_PROMO).
 *
 * First-touch wins for `ffp_ref` (the acquisition channel that brought this
 * browser the first time); `ffp_ref_last` keeps the most recent touch for
 * session-level analysis. The first EXTERNAL referrer is stored once.
 * Verdict criterion 3 ("a channel delivers ≥50 activated users/week for two
 * consecutive weeks") is measured by breaking down `app_open` and
 * `render_completed` on these properties in PostHog.
 */
export function captureRefAttribution() {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const current = (params.get('ref') || '').trim().toLowerCase() || null;
    if (current) {
      try {
        if (!localStorage.getItem('ffp_ref')) localStorage.setItem('ffp_ref', current);
        localStorage.setItem('ffp_ref_last', current);
      } catch {}
    }
    const referrer = typeof document !== 'undefined' ? document.referrer || '' : '';
    if (referrer) {
      try {
        const u = new URL(referrer);
        if (u.hostname !== window.location.hostname && !localStorage.getItem('ffp_first_referrer')) {
          localStorage.setItem('ffp_first_referrer', referrer);
        }
      } catch {}
    }
    let stored = {};
    try {
      stored = {
        first: localStorage.getItem('ffp_ref'),
        last: localStorage.getItem('ffp_ref_last'),
        referrer: localStorage.getItem('ffp_first_referrer'),
      };
    } catch {}
    return {
      ref: current || stored.last || stored.first || null,
      initialRef: stored.first || current || null,
      initialReferrer: stored.referrer || null,
    };
  } catch {
    return {};
  }
}
