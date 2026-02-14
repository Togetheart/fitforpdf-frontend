import React from 'react';
import { Check, X } from 'lucide-react';

import Button from './Button';
import Badge from './Badge';

const CTA_BASE =
  'inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

function isNegativePoint(point) {
  return (
    /^no\b/i.test(point) ||
    /^coming soon\b/i.test(point) ||
    /^unlimited$/i.test(point) ||
    /^soon$/i.test(point)
  );
}

function renderAction(plan) {
  if (plan.disabled) {
    return (
      <Button
        type="button"
        variant={plan.recommended ? 'primary' : 'secondary'}
        disabled
        title={plan.tooltip}
        className={plan.recommended ? 'opacity-85' : ''}
      >
        {plan.actionLabel}
      </Button>
    );
  }

  if (plan.actionType === 'link') {
    return (
      <Button variant={plan.recommended ? 'primary' : 'secondary'} href={plan.actionHref}>
        {plan.actionLabel}
      </Button>
    );
  }

  return (
    <Button type="button" variant={plan.recommended ? 'primary' : 'secondary'} href={plan.actionHref}>
      {plan.actionLabel}
    </Button>
  );
}

export default function PlanCard({
  plan,
  headingTag = 'h3',
  showAction = true,
  dataTestId = 'plan-card',
  includeTestId,
  featuredScaleClass = 'scale-105',
}) {
  const HeadingTag = headingTag;
  const isFeatured = Boolean(plan.recommended);
  const priceLines = Array.isArray(plan.priceLines) && plan.priceLines.length
    ? plan.priceLines
    : [plan.priceLine];

  const cardClasses = [
    'relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150',
    isFeatured
      ? `md:${featuredScaleClass} border-2 border-[#D92D2A]/35 shadow-[0_14px_45px_-34px_rgba(0,0,0,0.45)]`
      : 'hover:-translate-y-0.5 hover:shadow-md',
    CTA_BASE.includes('rounded-full') ? 'will-change-transform' : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <article
      data-testid={dataTestId}
      data-featured={isFeatured ? 'true' : 'false'}
      className={cardClasses}
      aria-label={plan.title}
    >
      {isFeatured ? (
        <div className="absolute -top-3 right-3">
          <Badge variant="popular" testId="plan-highlighted" data-highlight="true">
            {plan.badge || 'Most popular'}
          </Badge>
        </div>
      ) : (
        plan.badge ? (
          <div className="absolute -top-3 right-3">
            <Badge testId={includeTestId ? 'pricing-badge' : undefined}>{plan.badge}</Badge>
          </div>
        ) : null
      )}

      {includeTestId ? <span className="sr-only" data-testid={includeTestId} aria-hidden="true" /> : null}

      <HeadingTag className="text-lg font-semibold tracking-tight">{plan.title}</HeadingTag>

      <div className="mt-3 space-y-2">
        {priceLines.map((line) => (
          <p key={line} className="text-sm font-semibold text-slate-900">
            {line}
          </p>
        ))}
      </div>

      {plan.points?.length ? (
        <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
          {plan.points.map((point) => (
            <li key={point} className="flex items-start gap-2">
              {isNegativePoint(point) ? (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              ) : (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              )}
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {showAction ? <div className="mt-6">{renderAction(plan)}</div> : null}
      {plan.ctaNote ? <p className="mt-2 text-xs text-slate-500">{plan.ctaNote}</p> : null}
    </article>
  );
}
