import { cn } from '../../lib/cn.mjs';

const VARIANTS = {
  default: 'border-[var(--color-border)] bg-[var(--color-bg-hero)] text-[var(--color-muted)]',
  accent: 'border-cta/20 bg-cta/[0.06] text-cta',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  popular: 'border-accent/25 bg-[var(--color-bg)] text-accent-hover',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]',
      VARIANTS[variant],
      className,
    )}>
      {children}
    </span>
  );
}
