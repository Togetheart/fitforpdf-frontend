import React from 'react';
import PricingPlans from './PricingPlans';

export default function PricingCards({
  plans,
  headingTag = 'h3',
  showActions = true,
  featuredScaleClass = 'scale-105',
  gridTestId = 'pricing-grid',
  cardTestId,
}) {
  return (
    <PricingPlans
      plans={plans}
      headingTag={headingTag}
      variant={showActions ? 'pricing' : 'home'}
      featuredScaleClass={featuredScaleClass}
      gridTestId={gridTestId}
      cardTestId={cardTestId}
    />
  );
}
