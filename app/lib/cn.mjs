import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely.
 * Combines clsx (conditional logic) with tailwind-merge (conflict resolution).
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-accent', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
