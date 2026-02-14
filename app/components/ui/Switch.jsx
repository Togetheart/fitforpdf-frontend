import React from 'react';

export default function Switch({
  checked,
  label,
  onChange,
  disabled = false,
}) {
  const handleToggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-slate-700">{label}</span>
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
    </label>
  );
}
