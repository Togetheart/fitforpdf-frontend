import React from 'react';

export default function Card({ children, className = '', as = 'article', ...props }) {
  const Component = as;

  const classes = [
    'rounded-2xl border border-slate-200 bg-white',
    'shadow-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
