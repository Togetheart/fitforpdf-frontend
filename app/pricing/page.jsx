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
    <div className="min-h-screen bg-white text-[#1A1A1A]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-hero pt-24 pb-10 sm:pt-32 sm:pb-14">
        {/* Subtle warm top glow */}
        <div className="relative mx-auto flex max-w-[960px] flex-col items-center gap-4 px-4 text-center sm:px-6">
          {/* Page label */}
          <p className="text-2xl font-[650] tracking-tight text-[#1A1A1A]">Pricing</p>
          {/* Headline */}
          <h1 className="max-w-[20ch] text-[2.5rem] font-[650] leading-[1.06] tracking-tight text-[#1A1A1A] sm:text-5xl">
            <span className="block">{PRICING_PAGE_COPY.pageTitle}</span>
            <span className="block">{PRICING_PAGE_COPY.pageTitleAccent}</span>
          </h1>
          {/* Subtitle */}
          <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-[#6B6B6B]">
            {PRICING_PAGE_COPY.pageSubtitle}
          </p>
        </div>
      </section>

      {/* ── Plans ── */}
      <Section id="pricing-plans" index={1} bg="bg-hero" className="py-16 sm:py-24">
        <PricingToggleSection showFreeTier />
      </Section>

      {/* ── Feature comparison ── */}
      <Section id="pricing-comparison" index={2} bg="bg-hero" className="py-20 sm:py-28">
        <FeatureComparison
          title={PRICING_PAGE_COPY.comparisonTitle}
          columns={['Free', 'Single', 'Starter', 'Pro Sub']}
          rows={PRICING_PAGE_COPY.comparison}
        />
      </Section>

      {/* ── FAQ ── */}
      <Section id="pricing-faq" index={3} bg="bg-hero" className="py-20 sm:py-28">
        <h2 className="text-center text-3xl sm:text-[2.5rem] font-[700] tracking-[-0.018em] text-[#1A1A1A]">
          {PRICING_PAGE_COPY.faqTitle}
        </h2>
        <div className="divide-y divide-black/10">
          <FaqAccordion
            items={PRICING_PAGE_COPY.faq}
            testId="pricing-faq"
          />
        </div>
      </Section>
    </div>
  );
}
