import React from 'react';

const BASE_CLASS =
  'inline-flex items-center justify-center rounded-full px-6 text-sm font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS = {
  primary:
    'h-11 bg-cta text-cta-text shadow-sm hover:bg-cta-hover active:scale-[0.99]',
  accent:
    'h-11 bg-accent text-white shadow-sm hover:bg-accent-hover active:scale-[0.99]',
  secondary:
    'h-11 border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-hero)]',
  outline:
    'h-11 border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-hero)] active:scale-[0.99]',
};

export default function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}) {
  const classes = `${BASE_CLASS} ${VARIANTS[variant] || VARIANTS.secondary} ${className}`.trim();
  if (props.href) {
    return (
      <a className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
