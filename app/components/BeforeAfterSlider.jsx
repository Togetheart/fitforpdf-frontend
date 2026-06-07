'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Before/After image comparison slider.
 * Drag the handle to reveal the "after" image beneath the "before" image.
 *
 * Props:
 *  - beforeSrc / beforeAlt: "before" image (Excel/CSV source)
 *  - afterSrc / afterAlt: "after" image (PDF result)
 *  - initialPosition: 0–100, default 35 (show mostly the "after" side)
 *  - beforeLabel / afterLabel: pill labels shown over the slider
 */
export default function BeforeAfterSlider({
  beforeSrc,
  beforeAlt = 'Before',
  beforeSrcSet,
  afterSrc,
  afterAlt = 'After',
  afterSrcSet,
  initialPosition = 35,
  className = '',
  onInteract,
  beforeLabel = 'Source spreadsheet',
  afterLabel = 'Ready to send',
  // Intrinsic ratio of the "after" image so the slider reserves its box before
  // the (lazy) images load — kills the CLS this section was contributing.
  // Default matches the proof screenshots (all 1754×1241).
  width = 1754,
  height = 1241,
}) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const updatePosition = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }
  }, [hasInteracted, onInteract]);

  // Mouse events
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e) => updatePosition(e.clientX);
    const onMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, updatePosition]);

  // Touch events
  const onTouchStart = useCallback((e) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  const onTouchMove = useCallback((e) => {
    if (!isDragging) return;
    updatePosition(e.touches[0].clientX);
  }, [isDragging, updatePosition]);

  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Intro nudge animation — slide handle slightly to hint interactivity
  useEffect(() => {
    if (hasInteracted) return;
    const timer = setTimeout(() => {
      setPosition(45);
      const timer2 = setTimeout(() => setPosition(initialPosition), 600);
      return () => clearTimeout(timer2);
    }, 1200);
    return () => clearTimeout(timer);
  }, [hasInteracted, initialPosition]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl border border-[var(--color-border)] ${className}`}
      style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="slider"
      aria-label="Before and after comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 2));
        if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 2));
      }}
    >
      {/* After image (bottom layer — full width).
          Lazy-loaded: this slider is the 3rd section on the landing page (well
          below the fold). LCP audit fix. */}
      <img
        src={afterSrc}
        srcSet={afterSrcSet}
        alt={afterAlt}
        width={width}
        height={height}
        className="block h-auto w-full"
        draggable={false}
        loading="lazy"
        decoding="async"
      />

      {/* Before image (top layer — clipped, slightly dimmed for contrast) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
          filter: 'brightness(0.92) saturate(0.9)',
        }}
      >
        <img
          src={beforeSrc}
          srcSet={beforeSrcSet}
          alt={beforeAlt}
          width={width}
          height={height}
          className="block h-full w-full object-cover object-left-top"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{
          left: `${position}%`,
          transform: 'translateX(-50%)',
          width: '2px',
          background: 'rgba(255,255,255,0.9)',
          boxShadow: '0 0 8px rgba(0,0,0,0.3)',
        }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white shadow-lg"
        style={{
          left: `${position}%`,
          cursor: 'ew-resize',
          transition: isDragging ? 'none' : 'left 300ms cubic-bezier(0.25,0.1,0.25,1)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M5 3L1 8l4 5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 3l4 5-4 5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Labels */}
      <div
        className="absolute left-3 top-3 z-10 rounded-full bg-white/90 border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[#0F172A] shadow-sm backdrop-blur-sm"
        style={{
          opacity: position > 10 ? 1 : 0,
          transition: 'opacity 200ms',
        }}
      >
        {beforeLabel}
      </div>
      <div
        className="absolute right-3 top-3 z-10 rounded-full bg-[#2563EB] px-3 py-1 text-xs font-semibold text-white shadow-sm"
        style={{
          opacity: position < 90 ? 1 : 0,
          transition: 'opacity 200ms',
        }}
      >
        {afterLabel}
      </div>
    </div>
  );
}
