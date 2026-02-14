import React from 'react';

const CTA_BASE =
  'inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition';
const CTA_PRIMARY =
  `${CTA_BASE} border-[#D92D2A] bg-[#D92D2A] text-white`;
const CTA_SECONDARY =
  `${CTA_BASE} border-slate-300 bg-white text-slate-900 hover:bg-slate-50`;

const GRID_CLASS = 'grid grid-cols-1 gap-3 md:grid-cols-3';
const CARD_CLASS = 'rounded-[12px] border border-slate-200 bg-white p-5';
const RECOMMENDED_CARD_CLASS = 'border-[#D92D2A]/35 ring-1 ring-[#D92D2A]/20';

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
      <a href={plan.actionHref} className={CTA_SECONDARY}>
        {plan.actionLabel}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={plan.disabled ? `${CTA_SECONDARY} opacity-70` : `${CTA_PRIMARY}`}
      disabled={plan.disabled}
      title={plan.tooltip}
    >
      {plan.actionLabel}
    </button>
  );
}

export default function PricingCardsSection({
  plans,
  gridTestId = 'pricing-grid',
  headingTag: HeadingTag = 'h2',
  showActions = true,
}) {
  return (
    <div className={GRID_CLASS} data-testid={gridTestId}>
      {plans.map((plan) => (
        <article
          key={plan.id}
          className={`${CARD_CLASS} ${plan.recommended ? RECOMMENDED_CARD_CLASS : ''}`}
        >
          <HeadingTag className="text-lg font-semibold">{plan.title}</HeadingTag>
          {plan.recommended ? (
            <p className="mt-2 text-xs font-medium text-[#D92D2A]">Recommended</p>
          ) : null}
          <p className="mt-2 text-lg font-semibold text-[#D92D2A]">{plan.priceLine}</p>
          {plan.points.length ? (
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
              {plan.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
          {showActions ? <div className="mt-5">{renderAction(plan)}</div> : null}
        </article>
      ))}
    </div>
  );
}
