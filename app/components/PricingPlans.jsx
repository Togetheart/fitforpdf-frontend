import React from 'react';

import { PRICING_CARDS } from '../siteCopy.mjs';
import PlanCard from './PlanCard';

export default function PricingPlans({
  plans = PRICING_CARDS,
  variant = 'home',
  headingTag = 'h3',
  gridTestId = 'pricing-grid',
  cardTestId,
  featuredScaleClass = 'scale-105',
  className = '',
}) {
  const showActions = variant === 'pricing';
  const gridClassName = ['grid grid-cols-1 gap-5', 'md:grid-cols-3', className]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <div className={gridClassName} data-testid={gridTestId}>
      {plans.map((plan, index) => {
        const shouldIncludePlanTestId = variant === 'home' ? cardTestId : undefined;
        const isHighlighted = Boolean(plan.recommended);
        const cardLabel = isHighlighted ? 'Most popular' : plan.badge;
        const cardPlan = isHighlighted || plan.badge
          ? { ...plan, badge: cardLabel }
          : plan;

        return (
          <PlanCard
            key={plan.id || `${plan.title}-${index}`}
            plan={cardPlan}
            headingTag={headingTag}
            showAction={showActions}
            dataTestId="plan-card"
            includeTestId={shouldIncludePlanTestId}
            featuredScaleClass={featuredScaleClass}
          />
        );
      })}
    </div>
  );
}
