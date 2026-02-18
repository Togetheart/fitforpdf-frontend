import React from 'react';

export const GLASS_CARD_BASE_CLASS = [
  'relative overflow-hidden rounded-2xl',
  'border border-white/40 bg-white/55',
  'backdrop-blur-[5px] shadow-[0_12px_30px_rgba(2,6,23,0.10)]',
  'ring-1 ring-black/5',
].join(' ');

export default function Card({ children, className = '', as = 'article', ...props }) {
  const Component = as;

  const classes = [
    GLASS_CARD_BASE_CLASS,
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
