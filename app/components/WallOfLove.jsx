'use client';

import React, { useEffect, useRef } from 'react';
import { TESTIMONIAL_QUOTES } from '../siteCopy.mjs';

const ROLE_ICONS = {
  audit: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  ),
  saas: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5Z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  ops: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  finance: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  dev: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  consulting: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
};

/**
 * Bento-style testimonial grid.
 * Items with `featured: true` span 2 columns on lg screens.
 */
export default function WallOfLove() {
  const gridRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const cards = gridRef.current?.querySelectorAll('[data-testimonial-card]');
    if (!cards || cards.length === 0) return;

    // Slide from left/right — alternating sides, far offscreen
    cards.forEach((card, i) => {
      const fromLeft = i % 2 === 0;
      card.style.opacity = '0';
      card.style.transform = `translateX(${fromLeft ? '-120%' : '120%'})`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          cards.forEach((card, i) => {
            const delay = i * 120;
            setTimeout(() => {
              card.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
              card.style.opacity = '1';
              card.style.transform = 'translateX(0)';
            }, delay);
          });
          observer.disconnect();
        });
      },
      { threshold: 0.1 },
    );

    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-3 [grid-auto-flow:dense]"
    >
      {TESTIMONIAL_QUOTES.map((item, i) => {
        const cards = [];

        // Insert brand visual card after 3rd testimonial (middle of grid)
        if (i === 3) {
          cards.push(
            <div
              key="brand-visual"
              data-testimonial-card
              className="relative overflow-hidden rounded-2xl lg:col-span-2 lg:row-span-1"
              aria-hidden="true"
            >
              <img
                // og-image.webp = 276K vs .png 2.3MB (8× smaller).
                // The .png is kept in /public for the OG meta tag (Twitter
                // crawler legacy) — only in-DOM uses got the WebP swap.
                src="/og-image.webp"
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                style={{ minHeight: '160px', maxHeight: '220px' }}
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 to-transparent" />
              <p className="absolute bottom-4 left-5 text-sm font-semibold text-white/90 tracking-wide">
                Structured data, beautiful output.
              </p>
            </div>,
          );
        }

        cards.push(
          <div
            key={i}
            data-testimonial-card
            data-delay={i * 80}
            className={`group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-[rgba(37,99,235,0.2)] ${
              item.featured ? 'lg:col-span-2' : ''
            }`}
          >
            {/* Blue accent bar */}
            <div className="absolute top-0 left-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-blue-500 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Quote mark */}
            <span
              className="pointer-events-none absolute -top-1 right-5 select-none text-[5rem] font-serif leading-none text-blue-500/[0.07]"
              aria-hidden="true"
            >
              &rdquo;
            </span>

            <div className={`relative ${item.featured ? 'lg:flex lg:items-start lg:gap-6' : ''}`}>
              <p className={`text-sm leading-relaxed text-[var(--color-text)] ${item.featured ? 'lg:text-base' : ''}`}>
                &ldquo;{item.quote}&rdquo;
              </p>

              <div className={`mt-4 flex items-center gap-3 ${item.featured ? 'lg:mt-0 lg:shrink-0' : ''}`}>
                {/* Role icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/[0.08] text-blue-600 dark:text-blue-400">
                  {ROLE_ICONS[item.icon] || ROLE_ICONS.consulting}
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-[var(--color-text)]">{item.role}</span>
                  <br />
                  <span className="text-[var(--color-muted)]">{item.company}</span>
                </div>
              </div>
            </div>
          </div>,
        );

        return cards;
      })}
    </div>
  );
}
