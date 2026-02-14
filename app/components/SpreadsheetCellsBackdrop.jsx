'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildCells(isMobile) {
  const seed = isMobile ? 0x4f8f6f9f : 0x9d2f4c6b;
  const random = createRng(seed);
  const count = isMobile ? 6 : 11;
  const cells = [];

  for (let index = 0; index < count; index += 1) {
    const width = 140 + random() * 220;
    const height = 80 + random() * 140;
    const x = clamp(random() * 1000, 0, 1000 - width);
    const y = clamp(random() * 1000, 0, 1000 - height);
    const rotate = -2 + random() * 4;
    const hasHeader = random() > 0.4;
    const opacity = isMobile ? 0.028 : 0.045 + random() * 0.01;
    cells.push({
      id: `cell-${isMobile ? 'mobile' : 'desktop'}-${index}`,
      width,
      height,
      x,
      y,
      rotate,
      hasHeader,
      opacity,
    });
  }

  return cells;
}

export default function SpreadsheetCellsBackdrop() {
  const containerRef = useRef(null);
  const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

  const matchesMotion = (query) => {
    if (!hasMatchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const isMobile = matchesMotion('(max-width: 768px)');
  const reducedMotion = matchesMotion('(prefers-reduced-motion: reduce)');
  const pointerFine = matchesMotion('(pointer: fine)');

  const cells = useMemo(() => buildCells(Boolean(isMobile)), [isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined' || reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const driftTimeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { ease: 'sine.inOut', duration: 28 },
    });

    driftTimeline.to(container, {
      x: 10,
      y: 6,
      duration: 28,
    });

    const prefersNoPointerParallax = !pointerFine;
    if (prefersNoPointerParallax) {
      return () => {
        driftTimeline.kill();
      };
    }

    const quickToX = gsap.quickTo(container, 'x', {
      duration: 0.9,
      ease: 'power3.out',
    });
    const quickToY = gsap.quickTo(container, 'y', {
      duration: 0.9,
      ease: 'power3.out',
    });
    const root = container.closest('[data-testid="app-backdrop"]');
    if (!root) {
      return () => {
        driftTimeline.kill();
      };
    }

    const onPointerMove = (event) => {
      const bounds = root.getBoundingClientRect();
      const rawX = ((event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)) * 4;
      const rawY = ((event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)) * 3;
      quickToX(clamp(rawX, -4, 4));
      quickToY(clamp(rawY, -3, 3));
    };

    const resetMotion = () => {
      quickToX(0);
      quickToY(0);
    };

    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', resetMotion);
    root.addEventListener('pointerout', resetMotion);

    return () => {
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', resetMotion);
      root.removeEventListener('pointerout', resetMotion);
      driftTimeline.kill();
    };
  }, [reducedMotion, pointerFine]);

  return (
    <svg
      data-testid="cells-backdrop"
      aria-hidden="true"
      className="app-bg-cells pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      ref={containerRef}
    >
      <g>
        {cells.map((cell) => (
          <g
            key={cell.id}
            data-cell="true"
            transform={`translate(${cell.x.toFixed(2)} ${cell.y.toFixed(2)}) rotate(${cell.rotate.toFixed(2)} ${(
              cell.width / 2
            ).toFixed(2)} ${(cell.height / 2).toFixed(2)})`}
          >
            <rect
              width={cell.width.toFixed(2)}
              height={cell.height.toFixed(2)}
              rx="6"
              fill="none"
              data-cell-outline="true"
              className="app-bg-cell-outline"
              stroke="rgba(15, 23, 42, 0.10)"
              strokeWidth="1.2"
              opacity={cell.opacity.toFixed(3)}
            />
            {cell.hasHeader ? (
              <line
                data-cell-header="true"
                x1="6"
                y1={Math.max(12, Math.round(cell.height * 0.2))}
                x2={Math.round(cell.width - 6)}
                y2={Math.max(12, Math.round(cell.height * 0.2))}
                stroke="rgba(15, 23, 42, 0.10)"
                strokeWidth="0.95"
                opacity={Math.min(0.9, cell.opacity + 0.02).toFixed(3)}
              />
            ) : null}
          </g>
        ))}
      </g>
    </svg>
  );
}
