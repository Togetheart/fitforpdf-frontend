'use client';

import React from 'react';

/**
 * Hero background: converging column lines.
 * Dense on edges, wide gap in center — "wide table → fit to page".
 * Broken symmetry with a few offset lines for organic feel.
 * Radial blue glow at center. Subtle drift animation.
 */

// Seeded pseudo-random for consistent SSR/client rendering
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function HeroIllustration() {
  const W = 1200;
  const H = 500;
  const center = W / 2;
  const count = 24;
  const rand = seededRandom(42);

  // Steeper power curve (3.0) → much denser at edges, very sparse at center
  const lines = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const x = center * Math.pow(t, 3.0);
    lines.push(x);
    lines.push(W - x);
  }

  // Break symmetry: 4 irregular lines at varied positions
  const irregulars = [
    { x: 95, opacity: 0.18 },
    { x: 320, opacity: 0.12 },
    { x: W - 280, opacity: 0.14 },
    { x: W - 110, opacity: 0.2 },
  ];

  lines.sort((a, b) => a - b);

  return (
    <div
      data-hero-bg-lines
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center"
      style={{
        height: '65%',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 50%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 50%)',
      }}
    >
      {/* Tweak 5: radial blue aura behind center */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse 50% 60% at 50% 55%, rgba(37,99,235,0.05), transparent 70%)',
        }}
      />

      {/* Tweak 4: subtle drift animation */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[1400px] h-full animate-[heroDrift_14s_ease-in-out_infinite_alternate]"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="hFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="6%" stopColor="white" stopOpacity="1" />
            <stop offset="94%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="edgeFade">
            <rect width={W} height={H} fill="url(#hFade)" />
          </mask>
        </defs>

        <g mask="url(#edgeFade)">
          {/* Main converging lines */}
          {lines.map((x, i) => {
            const distFromCenter = Math.abs(x - center) / center;
            const opacity = 0.08 + distFromCenter * 0.5;
            const sw = 0.6 + distFromCenter * 1.0;
            // Slight random height variation for organic feel
            const yOffset = rand() * 40;
            return (
              <line
                key={`m${i}`}
                x1={x}
                y1={yOffset}
                x2={x}
                y2={H}
                stroke="#94A3B8"
                strokeWidth={sw}
                opacity={opacity}
              />
            );
          })}

          {/* Tweak 2: irregular offset lines breaking symmetry */}
          {irregulars.map((l, i) => (
            <line
              key={`ir${i}`}
              x1={l.x}
              y1={0}
              x2={l.x}
              y2={H}
              stroke="#94A3B8"
              strokeWidth={1.2}
              opacity={l.opacity}
              strokeDasharray="4 8"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
