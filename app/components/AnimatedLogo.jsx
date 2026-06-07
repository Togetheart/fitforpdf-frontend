'use client';

import { useEffect, useRef } from 'react';
import { cn } from '../lib/cn.mjs';

const BRACKET_SPREAD = 10; // px brackets start outward from final position
// Bar widths: start wide (overflowing), end at final logo size
const BARS = [
  { selector: '[data-bar="top"]', finalWidth: 26, startWidth: 40 },
  { selector: '[data-bar="mid"]', finalWidth: 18, startWidth: 30 },
  { selector: '[data-bar="bot"]', finalWidth: 11, startWidth: 20 },
];

export default function AnimatedLogo({ className }) {
  const svgRef = useRef(null);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    const svg = svgRef.current;
    if (!svg) return;

    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const bracketL = svg.querySelector('[data-bracket="left"]');
    const bracketR = svg.querySelector('[data-bracket="right"]');

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

    // Initial state: brackets spread wide, bars overflowing
    gsap.set(bracketL, { x: -BRACKET_SPREAD });
    gsap.set(bracketR, { x: BRACKET_SPREAD });
    for (const bar of BARS) {
      const el = svg.querySelector(bar.selector);
      if (el) gsap.set(el, { attr: { width: bar.startWidth } });
    }

    // Animate: brackets squeeze inward, bars shrink to fit
    tl.to(bracketL, { x: 0, duration: 0.7 }, 0)
      .to(bracketR, { x: 0, duration: 0.7 }, 0);

    for (const bar of BARS) {
      const el = svg.querySelector(bar.selector);
      if (el) tl.to(el, { attr: { width: bar.finalWidth }, duration: 0.65 }, 0.08);
    }
  }, []);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 44"
      width={48}
      height={44}
      role="img"
      aria-label="FitForPDF"
      className={cn('object-contain text-[var(--color-text)]', className)}
    >
      {/* Brackets */}
      <path
        data-bracket="left"
        d="M 7,2 L 2,2 L 2,42 L 7,42"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        data-bracket="right"
        d="M 41,2 L 46,2 L 46,42 L 41,42"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* F bars — start wide, shrink to fit inside brackets */}
      <rect data-bar="top" x="11" y="8" width="26" height="5" rx="1.5" fill="currentColor" />
      <rect data-bar="mid" x="11" y="19" width="18" height="5" rx="1.5" fill="#2563EB" />
      <rect data-bar="bot" x="11" y="30" width="11" height="5" rx="1.5" fill="#2563EB" opacity="0.4" />
    </svg>
  );
}
