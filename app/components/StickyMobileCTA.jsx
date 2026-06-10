'use client';
import { useEffect, useState } from 'react';
import { LANDING_COPY } from '../siteCopy.mjs';

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur-lg sm:hidden">
      {/* S1 sprint (2026-06-10): routes to the /app workbench like every
          other generate CTA — the V1 inline tool no longer exists on the
          landing, so there is nothing left to scroll to. */}
      <a
        href="/app"
        className="flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-semibold text-white"
      >
        {LANDING_COPY.heroCta}
      </a>
    </div>
  );
}
