'use client';
import { useEffect, useState } from 'react';
import { LANDING_COPY } from '../siteCopy.mjs';
import { scrollToTarget } from '../lib/scrollToTarget.mjs';

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    // Shared helper — same scroll behaviour as every other "Fix your export"
    // CTA on the page (see lib/scrollToTarget.mjs for full rationale).
    scrollToTarget(['generate', 'tool']);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur-lg sm:hidden">
      <button
        type="button"
        onClick={handleClick}
        className="flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-semibold text-white"
      >
        {LANDING_COPY.heroCta}
      </button>
    </div>
  );
}
