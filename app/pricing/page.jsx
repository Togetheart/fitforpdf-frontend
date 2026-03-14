import { PRICING_PAGE_COPY, SEO } from '../siteCopy.mjs';
import Section from '../components/ui/Section';
import FaqAccordion from '../components/FaqAccordion';
import FeatureComparison from '../components/FeatureComparison';
import PricingToggleSection from '../components/PricingToggleSection';

export const metadata = {
  title: SEO.pricing.title,
  description: SEO.pricing.description,
};

/* ── Main page ─────────────────────────────────────────── */
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[var(--color-bg-warm)] pt-24 pb-10 sm:pt-32 sm:pb-14">
        {/* Subtle warm top glow */}
        <div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-10 xl:px-12">
          {/* Page label */}
          <p className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">Pricing</p>
          {/* Headline */}
          <h1 className="max-w-[20ch] text-[2.5rem] font-semibold leading-[1.06] tracking-tight text-[var(--color-text)] sm:text-5xl">
            <span className="block">{PRICING_PAGE_COPY.pageTitle}</span>
            <span className="block">{PRICING_PAGE_COPY.pageTitleAccent}</span>
          </h1>
          {/* Subtitle */}
          <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-[var(--color-muted)]">
            {PRICING_PAGE_COPY.pageSubtitle}
          </p>
        </div>
      </section>

      {/* ── Plans ── */}
      <Section
        id="pricing-plans"
        index={1}
        bg="bg-warm"
        className="py-16 sm:py-24"
        maxWidth="max-w-[1440px]"
      >
        <PricingToggleSection showFreeTier />
      </Section>

      {/* ── Feature comparison ── */}
      <Section
        id="pricing-comparison"
        index={2}
        bg="bg-warm"
        className="py-20 sm:py-28"
        maxWidth="max-w-[1360px]"
      >
        <FeatureComparison
          title={PRICING_PAGE_COPY.comparisonTitle}
          columns={['Free', 'Single', 'Starter', 'Pro subscription']}
          rows={PRICING_PAGE_COPY.comparison}
        />
      </Section>

      {/* ── FAQ ── */}
      <Section id="pricing-faq" index={3} bg="bg-warm" className="py-20 sm:py-28" maxWidth="max-w-[1200px]">
        <h2 className="text-center text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.018em] text-[var(--color-text)]">
          {PRICING_PAGE_COPY.faqTitle}
        </h2>
        <div className="divide-y divide-[var(--color-border)]">
          <FaqAccordion
            items={PRICING_PAGE_COPY.faq}
            testId="pricing-faq"
          />
        </div>
      </Section>
    </div>
  );
}
