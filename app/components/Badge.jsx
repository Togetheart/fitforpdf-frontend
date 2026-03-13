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
    ? 'border-accent/25 bg-[var(--color-bg)] text-accent-hover'
    : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]';

  return (
    <span
      data-testid={testId}
      className={`${baseClass} ${variantClass} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
