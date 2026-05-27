/**
 * Shared smooth-scroll helper used by every "Fix your export" CTA on the
 * landing page (hero, how-it-works, final CTA, StickyMobileCTA).
 *
 * Why this exists as a single helper (not inline per call site):
 *   - Bug history is real: an earlier version used <a href="#generate"> +
 *     onClick. The browser's native scroll-to-hash raced with React's
 *     onClick and the user landed at the wrong place. Removing href fixed
 *     that, but then 4 different CTAs needed the same scroll-with-offset
 *     logic. Duplication → bug drift (the StickyMobileCTA missed the
 *     corrective second scroll once already).
 *
 * Why getBoundingClientRect instead of an offsetTop walk:
 *   - offsetTop only sums up offsetParent positioning. It IGNORES the
 *     scroll position of any ancestor with position:sticky, and breaks
 *     when an ancestor has `transform` / `will-change` / `filter` set
 *     (which establishes a new containing block but a different
 *     offsetParent). Both occur on the landing page (PageHero is sticky,
 *     apple-grid-bg has will-change:transform on its ::before).
 *   - getBoundingClientRect always returns the element's CURRENT visual
 *     position relative to the viewport, robust to any ancestor.
 *
 * Why a corrective second scroll:
 *   - Sections between hero and #generate use GSAP ScrollTrigger to
 *     fade-in + translate (y:24 → 0) when entering the viewport. They
 *     fire mid-scroll and shift the layout by 100-300px. A single
 *     scroll lands above the target. We re-measure ~900ms later and
 *     correct only if drift > 40px.
 *   - But: if the user has manually scrolled in the meantime, we cancel
 *     the correction (otherwise we yank them back, which is worse than
 *     being off-target).
 */

const DEFAULT_HEADER_OFFSET = 80;     // sticky header + small breathing room
const DEFAULT_CORRECTION_DELAY = 900; // ms — GSAP reveal is 700ms + margin
const DEFAULT_CORRECTION_THRESHOLD = 40; // px — only correct if drift > this

/**
 * Smooth-scroll to the first matching element id, with offset + corrective
 * second pass (cancelled on user-initiated scroll).
 *
 * @param {string[]} ids — ordered list of fallback element ids
 * @param {object}   [opts]
 * @param {number}   [opts.headerOffset=80] — px subtracted from target top
 * @param {number}   [opts.correctionDelay=900] — ms before corrective pass
 * @param {number}   [opts.correctionThreshold=40] — only correct if drift > this
 */
export function scrollToTarget(ids, opts = {}) {
  if (typeof window === 'undefined') return;

  const headerOffset = Number.isFinite(opts.headerOffset)
    ? opts.headerOffset
    : DEFAULT_HEADER_OFFSET;
  const correctionDelay = Number.isFinite(opts.correctionDelay)
    ? opts.correctionDelay
    : DEFAULT_CORRECTION_DELAY;
  const correctionThreshold = Number.isFinite(opts.correctionThreshold)
    ? opts.correctionThreshold
    : DEFAULT_CORRECTION_THRESHOLD;

  function findTarget() {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  // Robust to position:sticky / transform / filter ancestors:
  // getBoundingClientRect always returns the element's current visual
  // position relative to the viewport (no offsetParent gymnastics).
  function targetY(el) {
    const rect = el.getBoundingClientRect();
    return Math.max(0, rect.top + window.pageYOffset - headerOffset);
  }

  const target = findTarget();
  if (!target) return;

  // Pass 1 — smooth scroll to current target position.
  window.scrollTo({ top: targetY(target), behavior: 'smooth' });

  // Pass 2 — corrective scroll after GSAP reveal animations settle.
  // Cancelled if the user starts scrolling manually (they're now in control).
  let cancelled = false;
  function cancel() { cancelled = true; }
  // Use capture + passive to catch scroll input before our timer fires.
  const userScrollEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  userScrollEvents.forEach((ev) =>
    window.addEventListener(ev, cancel, { passive: true, capture: true, once: true })
  );

  const timer = window.setTimeout(() => {
    userScrollEvents.forEach((ev) => window.removeEventListener(ev, cancel, true));
    if (cancelled) return;
    const t = findTarget();
    if (!t) return;
    const desired = targetY(t);
    if (Math.abs(window.pageYOffset - desired) > correctionThreshold) {
      window.scrollTo({ top: desired, behavior: 'smooth' });
    }
  }, correctionDelay);

  // Defensive cleanup if user cancels: stop the timer too. (We can't fire
  // both cancel + cleanup from one handler without state, so the timer
  // still fires but is a no-op when cancelled. Negligible cost.)
  return () => {
    cancelled = true;
    window.clearTimeout(timer);
    userScrollEvents.forEach((ev) => window.removeEventListener(ev, cancel, true));
  };
}
