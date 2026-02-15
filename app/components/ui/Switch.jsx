import React from 'react';
import { CircleHelp } from 'lucide-react';

export default function Switch({
  checked,
  label,
  description,
  tooltip,
  onChange,
  disabled = false,
}) {
  const handleToggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <label className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            {tooltip ? (
              <button
                type="button"
                aria-label={`${label} info`}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-600"
                title={tooltip}
                onClick={(event) => event.preventDefault()}
              >
                <CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          {description ? <p className="text-xs leading-relaxed text-slate-500">{description}</p> : null}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={handleToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80 ${checked ? 'bg-[#D92D2A]' : 'bg-slate-300'} ${
            disabled ? 'opacity-60' : ''
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
    </label>
  );
}
