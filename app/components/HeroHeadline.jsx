'use client';

import React from 'react';
import { useEffect, useRef } from 'react';
import { LANDING_COPY } from '../siteCopy.mjs';
import Badge from './ui/Badge';
import loadGsap from '../lib/loadGsap.mjs';

export default function HeroHeadline() {
  const accentRef = useRef(null);
  const bracketRowRef = useRef(null);
  const bracketLRef = useRef(null);
  const bracketRRef = useRef(null);
  const containerRef = useRef(null);
  const fBarsRef = useRef(null);
  const eyebrowRef = useRef(null);
  const initialWidthRef = useRef(null);

  const hasWindow = typeof window !== 'undefined';
  const reducedMotion =
    hasWindow && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // ── Gradient shimmer animation ──
  // GSAP (~37KB) is dynamically imported so it lands in a deferred chunk
  // instead of the synchronous first-load bundle — it isn't needed to paint
  // the headline, only to shimmer it after hydration.
  useEffect(() => {
    if (!hasWindow || reducedMotion) return;

    const accentNode = accentRef.current;
    if (!accentNode) return;

    let timeline = null;
    let cancelled = false;

    loadGsap().then((gsap) => {
      if (cancelled || !gsap) return;
      timeline = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: { ease: 'sine.inOut' },
      });

      timeline.to(accentNode, {
        backgroundPosition: '100% 50%',
        filter: 'brightness(1.08)',
        duration: 12,
      });
    }).catch(() => {
      // Decorative shimmer — never surface a GSAP error as an unhandled rejection.
    });

    return () => {
      cancelled = true;
      if (timeline) {
        timeline.kill();
      }
    };
  }, [hasWindow, reducedMotion]);

  // ── Scroll-driven animation ──
  // Phase 1: bracket squeeze + text clip + [F] logo reveal  (scrollY 10–130)
  // Phase 2: hero content fades out, comparison fades in     (scrollY 200–500)
  // Phase 3: everything fades out                            (scrollY 550–750)
  useEffect(() => {
    if (!hasWindow || reducedMotion) return;

    const row = bracketRowRef.current;
    const container = containerRef.current;
    if (!row || !container) return;
    const text = container;

    const bL = bracketLRef.current;
    const bR = bracketRRef.current;
    const fBars = fBarsRef.current;
    const eyebrow = eyebrowRef.current;
    if (!bL || !bR || !fBars) return;

    // External elements driven by phase 2
    const fadeables = Array.from(document.querySelectorAll('[data-hero-fadeable]'));
    const comparison = document.querySelector('[data-hero-comparison]');
    const heroContent = document.querySelector('[data-testid="hero-section"] > .relative.z-10');
    let bgLines = null;

    // Clear leftover styles from StrictMode double-mount
    text.style.clipPath = '';
    bL.style.transform = '';
    bR.style.transform = '';
    fBars.style.opacity = '0';
    if (eyebrow) eyebrow.style.opacity = '';

    if (comparison) {
      comparison.style.opacity = '0';
      comparison.style.transform = 'translateY(16px)';
    }
    for (const el of fadeables) {
      el.style.opacity = '';
      el.style.transform = '';
    }
    // Half the container width = distance each bracket travels to meet at center
    const half = container.offsetWidth / 2;

    let current = 0;   // phase 1 lerp
    let target = 0;
    let phase2Current = 0;
    let rafId = 0;
    let running = true;
    let settled = true; // true when lerps have converged — no RAF needed

    const tick = () => {
      if (!running) return;

      const sy = window.scrollY;

      // ─── Phase 1: bracket squeeze (UNTOUCHED logic) ───────────────────
      target = Math.max(0, Math.min(1, (sy - 10) / 120));
      current += (target - current) * 0.1;
      if (Math.abs(current - target) < 0.001) current = target;

      if (current < 0.001) {
        text.style.clipPath = '';
        bL.style.transform = '';
        bR.style.transform = '';
        bL.style.opacity = '';
        bR.style.opacity = '';
        fBars.style.opacity = '0';
        if (eyebrow) eyebrow.style.opacity = '';
      } else {
        // clipPath squeeze: text is clipped to a shrinking central window
        // as the brackets slide inward. The "mid-letter" frame only shows
        // in frozen screenshots — in live 60fps animation each frame is
        // ~16ms and not perceptible. Linear opacity alternatives created
        // worse visible bugs (empty-bracket state or bracket/text overlap)
        // so we kept the original clipPath approach (V4.2, 2026-04-15).
        const clip = current * 50;
        text.style.clipPath = `inset(0 ${clip}% 0 ${clip}%)`;
        bL.style.transform = `translateX(${half * current}px)`;
        bR.style.transform = `translateX(${-half * current}px)`;

        // Logo fades in during last 30%, hero brackets fade out
        const logoT = current > 0.7 ? (current - 0.7) / 0.3 : 0;
        fBars.style.opacity = String(logoT);
        bL.style.opacity = String(1 - logoT);
        bR.style.opacity = String(1 - logoT);

        // Eyebrow fades alongside phase 1 — avoids a lonely muted trust
        // line hanging in mid-air once the headline is gone. Linear fade
        // matching bracket travel (1 - current).
        if (eyebrow) eyebrow.style.opacity = String(Math.max(0, 1 - current));
      }

      // ─── Phase 2: comparison reveal ───────────────────────────────────
      const p2Target = Math.max(0, Math.min(1, (sy - 200) / 300));
      phase2Current += (p2Target - phase2Current) * 0.08;
      if (Math.abs(phase2Current - p2Target) < 0.001) phase2Current = p2Target;

      // Fade out subtitle, fade in comparison (CTA stays visible)
      for (const el of fadeables) {
        // Kill CSS animation fill-mode that overrides inline opacity
        if (phase2Current > 0.001) {
          el.style.animation = 'none';
        } else {
          el.style.animation = '';
        }
        el.style.opacity = String(1 - phase2Current);
        el.style.transform = `translateY(${-16 * phase2Current}px)`;
      }
      if (comparison) {
        comparison.style.opacity = String(phase2Current);
        comparison.style.transform = `translateY(${16 * (1 - phase2Current)}px)`;
      }
      // Fade out background lines as comparison appears
      if (!bgLines) bgLines = document.querySelector('[data-hero-bg-lines]');
      if (bgLines) {
        bgLines.style.opacity = String(1 - phase2Current);
      }
      // Lift hero content up to make room for comparison below viewport edge
      if (heroContent) {
        if (phase2Current > 0.001) {
          heroContent.style.transform = `translateY(${-160 * phase2Current}px)`;
        } else {
          heroContent.style.transform = '';
        }
      }

      // Stop the loop once lerps have converged — restart on next scroll
      const isSettled =
        Math.abs(current - target) < 0.001 &&
        Math.abs(phase2Current - p2Target) < 0.001;
      if (isSettled) {
        settled = true;
        return; // don't schedule another frame
      }
      rafId = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (settled) {
        settled = false;
        rafId = requestAnimationFrame(tick);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial tick to set correct state
    rafId = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      text.style.clipPath = '';
      bL.style.transform = '';
      bR.style.transform = '';
      bL.style.opacity = '';
      bR.style.opacity = '';
      fBars.style.opacity = '0';
      if (eyebrow) eyebrow.style.opacity = '';
      if (comparison) {
        comparison.style.opacity = '0';
        comparison.style.transform = '';
      }
      if (heroContent) {
        heroContent.style.transform = '';
      }
      if (bgLines) {
        bgLines.style.opacity = '';
      }
      for (const el of fadeables) {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.animation = '';
      }
    };
  }, [hasWindow, reducedMotion]);

  return (
    <>
    <div ref={eyebrowRef} className="hero-headline-line flex justify-center mb-4 will-change-[opacity]">
      <p className="text-xs font-medium uppercase tracking-[0.14em]">
        {(() => {
          // Each pillar gets a color from the [F] logo palette (top→bottom
          // = left→right): dark text, accent blue, accent blue at 50%.
          // This mirrors the three horizontal bars inside the logo mark.
          const PILLAR_CLASSES = [
            'font-semibold text-[var(--color-text)]',           // NO LLM — top bar (dark)
            'text-[var(--color-cta-bg)]',                       // ZERO STORAGE — mid bar (accent)
            'text-[var(--color-cta-bg)] opacity-50',            // EU-HOSTED — bottom bar (accent faded)
          ];
          const pillars = LANDING_COPY.heroTrustEyebrow.split(' · ');
          return pillars.map((pillar, i) => (
            <span key={i}>
              {i > 0 && <span className="text-[var(--color-muted)]"> · </span>}
              <span className={PILLAR_CLASSES[i] || 'text-[var(--color-muted)]'}>{pillar}</span>
            </span>
          ));
        })()}
      </p>
    </div>
    <h1 className="mx-auto flex w-full max-w-[1220px] flex-col space-y-1 sm:space-y-2 leading-[1.15] tracking-tight text-2xl font-semibold sm:text-[2.25rem] md:text-5xl overflow-hidden">
      <span ref={bracketRowRef} className="hero-headline-line flex justify-center">
        <span className="relative inline-flex items-stretch">
          {/* Left bracket */}
          <svg ref={bracketLRef} className="shrink-0 w-[10px] self-stretch text-[var(--color-text)] will-change-transform" viewBox="0 0 10 44" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 7,2 L 2,2 L 2,42 L 7,42" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {/* Text container — clips on scroll, wraps on mobile */}
          <span ref={containerRef} className="inline-block text-center sm:whitespace-nowrap">
            <span
              ref={accentRef}
              data-testid="hero-headline-accent"
              data-anim={reducedMotion ? 'off' : 'on'}
              className="hero-accent hero-accent--sections inline-block"
            >
              {LANDING_COPY.heroHeadlineL1}
            </span>
          </span>
          {/* Right bracket */}
          <svg ref={bracketRRef} className="shrink-0 w-[10px] self-stretch text-[var(--color-text)] will-change-transform" viewBox="0 0 10 44" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 3,2 L 8,2 L 8,42 L 3,42" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {/* Full [F] logo — appears at center when brackets close */}
          <svg
            ref={fBarsRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            width={48}
            height={44}
            viewBox="0 0 48 44"
            aria-hidden="true"
            style={{ opacity: 0 }}
          >
            <path d="M 7,2 L 2,2 L 2,42 L 7,42" fill="none" stroke="var(--color-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 41,2 L 46,2 L 46,42 L 41,42" fill="none" stroke="var(--color-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="11" y="8" width="26" height="5" rx="1.5" fill="var(--color-text)" />
            <rect x="11" y="19" width="18" height="5" rx="1.5" fill="var(--color-cta-bg)" />
            <rect x="11" y="30" width="11" height="5" rx="1.5" fill="var(--color-cta-bg)" opacity="0.4" />
          </svg>
        </span>
      </span>
      <span className="hero-headline-line block text-[var(--color-text)]">
        {LANDING_COPY.heroHeadlineL2}
      </span>
    </h1>
    </>
  );
}
