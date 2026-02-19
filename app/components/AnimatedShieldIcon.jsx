'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Shield icon with animated checkmark.
 * - animateOnMount=true  → draws the check immediately on mount (privacy page)
 * - animateOnMount=false → draws the check when scrolled into view (home page)
 */
export default function AnimatedShieldIcon({ animateOnMount = true, size = 36 }) {
  const [drawn, setDrawn] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (animateOnMount) {
      // Small delay so the transition is perceptible after page paint
      const t = setTimeout(() => setDrawn(true), 120);
      return () => clearTimeout(t);
    }

    // Scroll-triggered via IntersectionObserver
    const el = ref.current;
    if (!el) return;

    const mountedAt = Date.now();
    const SCROLL_DELAY_MS = 600;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && Date.now() - mountedAt > SCROLL_DELAY_MS) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animateOnMount]);

  // Approximate stroke length of "m9 12 2 2 4-4" at viewBox 24×24
  const checkLength = 14;

  return (
    <span
      ref={ref}
      className="privacy-shield inline-flex items-center justify-center text-emerald-500"
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Shield outline — static */}
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />

        {/* Checkmark — draws on */}
        <path
          d="m9 12 2 2 4-4"
          strokeDasharray={checkLength}
          strokeDashoffset={drawn ? 0 : checkLength}
          style={{
            transition: drawn
              ? 'stroke-dashoffset 0.45s cubic-bezier(0.4,0,0.2,1) 0.05s'
              : 'none',
          }}
        />
      </svg>
    </span>
  );
}
