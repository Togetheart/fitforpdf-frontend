'use client';

import React, { useEffect, useRef } from 'react';
import { USE_CASES } from '../siteCopy.mjs';

const USE_CASE_ICONS = {
  audit: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M9 10l2 2 4-4" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  ),
  saas: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 19a4.5 4.5 0 0 1-.5-8.95A7 7 0 0 1 18.5 9a4.5 4.5 0 0 1 .5 8.95" />
      <path d="M12 13v6M9 16l3-3 3 3" />
    </svg>
  ),
  finance: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  consulting: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="2" y1="13" x2="22" y2="13" />
    </svg>
  ),
};

export default function UseCaseCards() {
  const gridRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = gridRef.current?.querySelectorAll('[data-usecase-card]');
    if (!cards?.length) return;

    cards.forEach((c) => { c.style.opacity = '0'; c.style.transform = 'translateY(20px)'; });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const c = e.target;
          const d = parseInt(c.dataset.delay || '0', 10);
          setTimeout(() => {
            c.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            c.style.opacity = '1';
            c.style.transform = 'translateY(0)';
          }, d);
          obs.unobserve(c);
        });
      },
      { threshold: 0.15 },
    );

    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Built for real workflows
        </h2>
        <p className="text-[var(--color-muted)]">
          From quarterly audits to automated SaaS exports.
        </p>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {USE_CASES.map((uc, i) => {
          const Wrapper = uc.href ? 'a' : 'div';
          const linkProps = uc.href ? { href: uc.href } : {};
          return (
          <Wrapper
            key={uc.icon}
            {...linkProps}
            data-usecase-card
            data-delay={i * 80}
            className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center sm:text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300 no-underline"
          >
            <span className="text-blue-500 inline-block" aria-hidden="true">
              {USE_CASE_ICONS[uc.icon] || null}
            </span>
            <h3 className="mt-4 text-base font-semibold text-[var(--color-text)]">
              {uc.title}
            </h3>
            <p className="mt-2 text-sm text-muted">{uc.stat}</p>
            <p className="mt-1 text-xs font-medium text-blue-500">{uc.time}</p>
          </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
