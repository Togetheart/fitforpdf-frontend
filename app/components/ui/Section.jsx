'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Section — staggered reveal-on-scroll wrapper.
 *
 * Was: GSAP + ScrollTrigger plugin (~62 KB combined gzipped).
 * Now: native IntersectionObserver + inline CSS transitions (~0 KB).
 *
 * Behavioural parity:
 *   - direct children fade in (opacity 0 → 1) + translate (y:24 → 0)
 *   - 100ms stagger between children
 *   - 700ms ease-out per child
 *   - fires once when the section enters the viewport (rootMargin trims
 *     the trigger 15% from the bottom — matches GSAP "top 85%")
 *   - respects prefers-reduced-motion (skips the hide-then-reveal entirely)
 *
 * Why removed GSAP here: this was the page's biggest bundle cost +
 * caused layout shifts during smooth scroll (the "Fix your export
 * lands at the wrong place" bug). See docs/LIGHTHOUSE_AUDIT.md.
 */
export default function Section({
  id,
  index = 0,
  children,
  testId,
  className = '',
  bg,
  maxWidth = 'max-w-content',
}) {
  const BG_MAP = {
    'bg-hero': 'bg-[var(--color-bg-hero)]',
    'bg-white': 'bg-[var(--color-bg)]',
  };
  const resolvedBg = BG_MAP[bg] ?? bg ?? 'bg-[var(--color-bg)]';
  const testIdValue = testId ?? `section-${id}`;
  const innerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = innerRef.current;
    if (!el) return;
    const targets = Array.from(el.children);
    if (targets.length === 0) return;

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Set initial hidden state via inline style (no className thrash — keeps
    // tests + Tailwind purge stable). transition is set up too so the reveal
    // is a single property flip later.
    targets.forEach((t, i) => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(24px)';
      t.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
      t.style.transitionDelay = `${Math.min(i, 6) * 100}ms`;
      // willChange tells the compositor to promote — same hint GSAP gives.
      t.style.willChange = 'opacity, transform';
    });

    // IntersectionObserver is supported in every browser we care about
    // (Safari ≥12, Chrome ≥51). No polyfill needed.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          targets.forEach((t) => {
            t.style.opacity = '1';
            t.style.transform = 'translateY(0)';
          });
          // Clear willChange after the animation finishes — the GPU layer
          // is no longer worth it for a static element.
          window.setTimeout(() => {
            targets.forEach((t) => { t.style.willChange = 'auto'; });
          }, 1500);
          observer.disconnect();
          return;
        }
      },
      // rootMargin: -15% from bottom mirrors GSAP "trigger: top 85%"
      { threshold: 0, rootMargin: '0px 0px -15% 0px' }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      // If we unmount mid-reveal, restore visibility so the next render
      // doesn't briefly show opacity:0 content.
      targets.forEach((t) => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
        t.style.willChange = 'auto';
      });
    };
  }, []);

  return (
    <section
      id={id}
      className={`${resolvedBg} ${className}`}
      data-section-bg={resolvedBg === 'bg-gray-50' ? 'gray' : 'white'}
      data-testid={testIdValue}
    >
      <div
        ref={innerRef}
        className={`mx-auto flex w-full flex-col gap-8 ${maxWidth} px-4 py-10 sm:px-6 sm:py-14 lg:px-10 xl:px-12`}
      >
        {children}
      </div>
    </section>
  );
}
