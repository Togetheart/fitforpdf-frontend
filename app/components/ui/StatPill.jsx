import { cn } from '../../lib/cn.mjs';

const CLOCK_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function StatPill({ children, icon = CLOCK_ICON, className }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.06] px-4 py-1.5 text-sm font-semibold text-blue-600',
      className,
    )}>
      {icon}
      {children}
    </span>
  );
}
