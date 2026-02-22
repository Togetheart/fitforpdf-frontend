import React from 'react';
import { Check, X } from 'lucide-react';

import Card from './Card';
import Button from './ui/Button';
import Badge from './Badge';
import { cn } from '../lib/cn.mjs';

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
        variant={plan.recommended ? 'primary' : 'outline'}
        disabled
        title={plan.tooltip}
        className={plan.recommended ? 'opacity-85' : ''}
      >
        {plan.actionLabel}
      </Button>
    );
  }

  if (typeof plan.onAction === 'function') {
    return (
      <Button
        type="button"
        variant={plan.recommended ? 'primary' : 'outline'}
        onClick={plan.onAction}
      >
        {plan.actionLabel}
      </Button>
    );
  }

  if (plan.actionType === 'link') {
    return (
      <Button variant={plan.recommended ? 'primary' : 'outline'} href={plan.actionHref}>
        {plan.actionLabel}
      </Button>
    );
  }

  return (
    <Button type="button" variant={plan.recommended ? 'primary' : 'outline'} href={plan.actionHref}>
      {plan.actionLabel}
    </Button>
  );
}

/**
 * Splits a price-line like "100 exports · €19" into { label, price }.
 * Returns null if the line doesn't match.
 */
function splitPriceLine(line) {
  const match = /^(.+?)\s*[·•]\s*([€$£].+)$/.exec(line);
  if (!match) return null;
  return { label: match[1].trim(), price: match[2].trim() };
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

  // Separate the first line (topline descriptor) from price entries
  const topline = priceLines[0];
  const pricePairs = priceLines.slice(1).map(splitPriceLine).filter(Boolean);

  return (
    <Card
      as="article"
      data-testid={dataTestId}
      data-featured={isFeatured ? 'true' : 'false'}
      className={cn(
        'relative flex flex-col overflow-visible p-6 transition-all duration-150',
        isFeatured
          ? `md:${featuredScaleClass} border-2 border-black/10`
          : 'hover:-translate-y-0.5',
      )}
      aria-label={plan.title}
    >
      {/* Badge — overflow-visible lets it sit on the edge */}
      {isFeatured ? (
        <>
          <span aria-hidden="true" className="sr-only" data-testid="plan-credits" data-highlight="true" />
          <div className="absolute -top-3 right-4 z-10">
            <Badge variant="popular" testId="plan-highlighted" data-highlight="true">
              {plan.badge || 'Most popular'}
            </Badge>
          </div>
        </>
      ) : (
        plan.badge ? (
          <div className="absolute -top-3 right-4 z-10">
            <Badge testId={includeTestId ? 'pricing-badge' : undefined}>{plan.badge}</Badge>
          </div>
        ) : null
      )}

      {includeTestId ? <span className="sr-only" data-testid={includeTestId} aria-hidden="true" /> : null}

      {/* Title */}
      <HeadingTag className="text-xl font-semibold tracking-tight">{plan.title}</HeadingTag>

      {/* Price hero — big visible price or topline */}
      <div className="mt-4">
        {pricePairs.length > 0 ? (
          <>
            <p className="text-sm text-muted">{topline}</p>
            <div className="mt-3 space-y-2">
              {pricePairs.map(({ label, price }) => (
                <div key={label} className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-muted">{label}</span>
                  <span className="text-xl font-bold tracking-tight text-slate-900">{price}</span>
                </div>
              ))}
            </div>
            {plan.perExport ? (
              <p className="mt-1.5 text-right text-xs text-muted/70">{plan.perExport}</p>
            ) : null}
          </>
        ) : (
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {topline}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-slate-200/80" />

      {/* Features */}
      {plan.points?.length ? (
        <ul className="flex-1 space-y-2.5 text-sm text-slate-700">
          {plan.points.map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              {isNegativePoint(point) ? (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted/70" />
              ) : (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              )}
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* CTA */}
      {showAction ? <div className="mt-6">{renderAction(plan)}</div> : null}
      {plan.ctaNote ? <p className="mt-2.5 text-center text-xs text-muted/70">{plan.ctaNote}</p> : null}
    </Card>
  );
}
