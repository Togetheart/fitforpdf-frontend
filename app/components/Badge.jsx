import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  className = '',
  testId,
}) {
  const baseClass =
    'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]';
  const variantClass = variant === 'popular'
    ? 'border-accent/25 bg-white text-accent-hover'
    : 'border-slate-200 bg-white text-slate-700';

  return (
    <span
      data-testid={testId}
      className={`${baseClass} ${variantClass} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
