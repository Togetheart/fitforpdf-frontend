'use client';

import { useEffect, useState } from 'react';

// GDPR/CNIL consent for analytics + session replay. PostHog inits opted-out by
// default (see layout.js), so NOTHING is captured or recorded until "Accept".
// The choice persists in localStorage; the footer "Cookie preferences" control
// dispatches `ffp:open-consent` to re-open this for withdrawal (as easy to undo
// as to grant — a CNIL requirement).
const CONSENT_KEY = 'ffp-analytics-consent';

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let decided = true;
    try {
      decided = Boolean(localStorage.getItem(CONSENT_KEY));
    } catch {
      decided = true; // storage blocked → don't nag, and don't capture either
    }
    if (!decided) setVisible(true);
    const open = () => setVisible(true);
    window.addEventListener('ffp:open-consent', open);
    return () => window.removeEventListener('ffp:open-consent', open);
  }, []);

  function decide(choice) {
    try { localStorage.setItem(CONSENT_KEY, choice); } catch {}
    try {
      if (choice === 'granted') window.posthog?.opt_in_capturing?.();
      else window.posthog?.opt_out_capturing?.();
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Privacy and analytics consent"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[0_16px_40px_rgba(15,23,42,0.18)] sm:inset-x-auto sm:left-4"
    >
      <p className="text-sm font-semibold text-[var(--color-text)]">Help us improve fitforpdf?</p>
      <p className="mt-1 text-[13px] leading-5 text-[var(--color-muted)]">
        We use privacy-friendly, EU-hosted analytics — including session replay — to see where the product trips people up. Nothing runs until you choose, and your files are never part of it.{' '}
        <a href="/privacy" className="font-medium text-[var(--color-text)] underline underline-offset-2">
          Privacy policy
        </a>.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => decide('granted')}
          className="flex-1 rounded-full bg-cta py-2 text-sm font-semibold text-cta-text transition hover:bg-cta-hover"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => decide('denied')}
          className="flex-1 rounded-full border border-[var(--color-line)] py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-sunken)]"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
