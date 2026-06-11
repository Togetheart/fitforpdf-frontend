'use client';

import useSession from '../hooks/useSession.mjs';

// Contextual, non-blocking nudge to sign in — shown ONLY to anonymous visitors,
// at high-intention moments (just downloaded an export, or about to buy credits).
// Value-first copy, ink/secondary styling (blue stays reserved for primary
// actions), linking to the magic-link page. This is how the product actually
// captures the email that powers failure-traceability + keeps a user's exports
// and credits across devices — the account is useless if nothing ever invites
// the login. Renders nothing while loading or when already signed in.
const COPY = {
  'post-render': {
    lead: 'Want to keep these exports?',
    cta: 'Sign in to find them on any device',
  },
  paywall: {
    lead: 'Buying as a guest?',
    cta: 'Sign in so your credits stay with you',
  },
  exports: {
    lead: 'These live on this device only.',
    cta: 'Sign in to keep your history',
  },
};

export default function LoginNudge({ variant = 'post-render', className = '' }) {
  const { account, loading } = useSession();
  if (loading || account) return null;
  const copy = COPY[variant] || COPY['post-render'];
  return (
    <p className={`text-center text-[11.5px] leading-5 text-[var(--color-text-subtle)] ${className}`.trim()}>
      {copy.lead}{' '}
      <a
        href="/login"
        data-testid="login-nudge"
        className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-text-subtle)] underline-offset-2 transition hover:decoration-[var(--color-text)]"
      >
        {copy.cta}
      </a>
    </p>
  );
}
