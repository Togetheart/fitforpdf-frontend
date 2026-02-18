import React from 'react';

const BASE_CLASS =
  'inline-flex items-center justify-center rounded-full px-6 text-sm font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS = {
  primary:
    'h-11 bg-accent text-white shadow-sm hover:bg-accent-hover active:scale-[0.99]',
  secondary:
    'h-11 border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
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
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
