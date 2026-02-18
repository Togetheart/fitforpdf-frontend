import React from 'react';
import { cn } from '../lib/cn.mjs';

export const GLASS_CARD_BASE_CLASS = 'relative overflow-hidden rounded-xl glass';

export default function Card({ children, className = '', as = 'article', ...props }) {
  const Component = as;

  return (
    <Component className={cn(GLASS_CARD_BASE_CLASS, className)} {...props}>
      {children}
    </Component>
  );
}
