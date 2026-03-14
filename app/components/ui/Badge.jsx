import { cn } from '../../lib/cn.mjs';

const VARIANTS = {
  default: 'border-[var(--color-border)] bg-[var(--color-bg-warm)] text-[var(--color-muted)]',
  accent: 'border-accent/20 bg-accent/[0.06] text-accent',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em]',
      VARIANTS[variant],
      className,
    )}>
      {children}
    </span>
  );
}
