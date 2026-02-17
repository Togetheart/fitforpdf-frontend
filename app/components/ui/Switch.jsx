import React from 'react';

export default function Switch({
  checked,
  label,
  description,
  tooltip,
  ariaLabel,
  onClick,
  onChange,
  disabled = false,
}) {
  const handleToggle = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (onClick) onClick(event);
    if (disabled) return;
    onChange?.(!checked);
  };

  const switchLabel = ariaLabel || label || 'toggle';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={switchLabel}
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
  );
}
