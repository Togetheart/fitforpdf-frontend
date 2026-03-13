'use client';

import { cn } from '../lib/cn.mjs';

export default function AnimatedCheckmark({ size = 48, className }) {
  const id = 'anim-check-' + Math.random().toString(36).slice(2, 8);

  return (
    <>
      <style>{`
        @keyframes ${id}-circle {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ${id}-check {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .${id}-circle {
          animation: ${id}-circle 0.4s ease-out forwards;
        }
        .${id}-check {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: ${id}-check 0.4s ease-out 0.4s forwards;
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(className)}
        aria-label="Success checkmark"
        role="img"
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="#10B981"
          className={`${id}-circle`}
        />
        <path
          d="M14 24.5L21 31.5L34 18.5"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${id}-check`}
        />
      </svg>
    </>
  );
}
