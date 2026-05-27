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

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === 'undefined') return;
    const target = document.getElementById('generate') || document.getElementById('tool');
    if (!target) return;
    let y = 0;
    let cur = target;
    while (cur) {
      y += cur.offsetTop;
      cur = cur.offsetParent;
    }
    window.scrollTo({ top: Math.max(0, y - 80), behavior: 'smooth' });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur-lg sm:hidden">
      {/* Programmatic scroll instead of href="/#generate" — native scroll-to-hash
          races with our JS handler and can land at the pre-reveal position of
          #generate. See app/page.jsx handleHeroGenerateClick for full rationale. */}
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
