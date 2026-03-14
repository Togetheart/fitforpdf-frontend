'use client';

import React, { useState, useMemo } from 'react';

const MINUTES_PER_EXPORT = 45;
const HOURLY_RATE = 75;

function recommendPlan(exports) {
  if (exports <= 1) return 'Single export';
  if (exports <= 10) return 'Starter 10-pack';
  return 'Volume 100-pack';
}

export default function RoiCalculator() {
  const [exports, setExports] = useState(10);

  const { hours, dollars, plan } = useMemo(() => {
    const mins = exports * MINUTES_PER_EXPORT;
    const hrs = Math.round((mins / 60) * 10) / 10;
    return {
      hours: hrs,
      dollars: Math.round(hrs * HOURLY_RATE),
      plan: recommendPlan(exports),
    };
  }, [exports]);

  return (
    <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-[var(--color-text)]">
        How much time could you save?
      </h3>

      {/* Slider */}
      <label className="mt-5 block">
        <span className="text-sm font-medium text-[var(--color-muted)]">
          Exports per month
        </span>
        <div className="mt-2 flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={500}
            step={1}
            value={exports}
            onChange={(e) => setExports(Number(e.target.value))}
            className="roi-slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border)]"
          />
          <span className="w-12 shrink-0 text-right text-base font-semibold tabular-nums text-[var(--color-text)]">
            {exports}
          </span>
        </div>
      </label>

      {/* Results */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-[var(--color-bg-warm)] px-4 py-3 text-center">
          <p className="text-2xl font-bold text-[var(--color-text)]">{hours}<span className="text-base font-normal">h</span></p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">saved / month</p>
        </div>
        <div className="rounded-xl bg-[var(--color-bg-warm)] px-4 py-3 text-center">
          <p className="text-2xl font-bold text-[var(--color-text)]">${dollars.toLocaleString()}</p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">at $75/hr</p>
        </div>
        <div className="rounded-xl bg-[var(--color-bg-warm)] px-4 py-3 text-center">
          <p className="text-sm font-semibold text-accent">{plan}</p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">recommended</p>
        </div>
      </div>

      {/* Slider track styling */}
      <style>{`
        .roi-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #2563EB;
          border: 2px solid #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .roi-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #2563EB;
          border: 2px solid #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .roi-slider::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 9999px;
        }
        .roi-slider::-moz-range-track {
          height: 6px;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
