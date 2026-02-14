import React from 'react';

const CTA_BASE =
  'inline-flex h-11 w-full items-center justify-center rounded-full border px-4 text-sm font-semibold transition duration-150 ease-out';
const CTA_PRIMARY =
  `${CTA_BASE} border-[#D92D2A] bg-[#D92D2A] text-white hover:bg-[#c82727] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92D2A]/40 focus-visible:ring-offset-2`;
const CTA_SECONDARY =
  `${CTA_BASE} border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2`;

function renderAction(plan) {
  if (plan.actionType === 'link') {
    if (plan.disabled) {
      return (
        <a
          href={plan.actionHref}
          className={`${CTA_SECONDARY} opacity-70`}
          aria-disabled="true"
        >
          {plan.actionLabel}
        </a>
      );
    }

    return (
      <a href={plan.actionHref} className={plan.recommended ? CTA_PRIMARY : CTA_SECONDARY}>
        {plan.actionLabel}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={plan.disabled ? `${CTA_SECONDARY} opacity-70` : `${CTA_PRIMARY} opacity-85`}
      disabled={plan.disabled}
      title={plan.tooltip}
    >
      {plan.actionLabel}
    </button>
  );
}

export default function PricingCards({
  plans,
  headingTag = 'h3',
  showActions = true,
  featuredScaleClass = 'scale-105',
  gridTestId = 'pricing-grid',
}) {
  const HeadingTag = headingTag;
  const GRID_CLASS = 'grid grid-cols-1 gap-4 md:grid-cols-3';

  return (
    <div className={GRID_CLASS} data-testid={gridTestId}>
      {plans.map((plan) => {
        const cardClass = [
          'relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md',
          plan.recommended ? 'border-2 border-[#D92D2A]/50 shadow-[0_10px_35px_-22px_rgba(0,0,0,0.35)] md:scale-[1.03]' : '',
          plan.recommended ? `md:${featuredScaleClass}` : '',
        ]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        const cardDataFeatured = plan.recommended ? 'true' : 'false';

        return (
          <article
            key={plan.id}
            data-featured={cardDataFeatured}
            data-card-id={plan.id}
            className={cardClass}
          >
            {plan.badge ? (
              <div className="absolute -top-3 right-3">
                <span
                  data-testid="pricing-badge"
                  className="inline-flex rounded-full border border-[#D92D2A]/30 bg-[#D92D2A]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#D92D2A]"
                >
                  {plan.badge}
                </span>
              </div>
            ) : null}
            <HeadingTag className="text-lg font-semibold tracking-tight">{plan.title}</HeadingTag>
            <div className="mt-3 space-y-2">
              {(plan.priceLines && plan.priceLines.length ? plan.priceLines : [plan.priceLine]).map((line) => (
                <p key={line} className="text-sm text-slate-900">
                  {line}
                </p>
              ))}
            </div>

            {plan.points?.length ? (
              <ul className="mt-3 space-y-1.5 pl-5 text-sm text-slate-700 list-disc">
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}

            {showActions ? <div className="mt-6">{renderAction(plan)}</div> : null}
            {plan.ctaNote ? (
              <p className="mt-2 text-xs text-slate-500">{plan.ctaNote}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
