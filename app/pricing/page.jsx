import { PRICING_PAGE_COPY, SEO } from '../siteCopy.mjs';
import Section from '../components/ui/Section';
import FaqAccordion from '../components/FaqAccordion';
import FeatureComparison from '../components/FeatureComparison';
import PricingToggleSection from '../components/PricingToggleSection';
import { JsonLd } from '../components/JsonLd';

export const metadata = {
  title: SEO.pricing.title,
  description: SEO.pricing.description,
};

const PRICING_FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is there a free plan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You get 3 free exports with no account needed. Upload your file and get a presentable PDF instantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does fitforpdf cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Single exports start at $4.90. Packs of 10 are $19, and 100 exports are $79. Pro subscription is $29/month for 500 exports.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Pro subscriptions can be cancelled anytime with no questions asked.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there an API?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. API access starts at $49/month for 500 renders. See our developers page for full pricing and documentation.',
      },
    },
  ],
};

const REF_TO_PROMO = {
  microlaunch: 'MICROLAUNCH',
  betalist: 'BETALIST5',
  free3: 'FREE3',
};

/* ── Main page ─────────────────────────────────────────── */
export default async function PricingPage({ searchParams }) {
  const params = await searchParams;
  const ref = (params?.ref || '').trim().toLowerCase();
  const promoFromRef = REF_TO_PROMO[ref] || null;
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[var(--color-bg-hero)] pt-24 pb-10 sm:pt-32 sm:pb-14">
        {/* Subtle warm top glow */}
        <div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-10 xl:px-12">
          {/* Page label */}
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">Pricing</p>
          {/* Headline */}
          <h1 className="max-w-[20ch] text-4xl font-semibold leading-[1.06] tracking-tight text-[var(--color-text)] sm:text-5xl">
            <span className="block">{PRICING_PAGE_COPY.pageTitle}</span>
            <span className="block">{PRICING_PAGE_COPY.pageTitleAccent}</span>
          </h1>
          {/* Subtitle */}
          <p className="max-w-[44ch] text-base leading-relaxed text-[var(--color-muted)]">
            {PRICING_PAGE_COPY.pageSubtitle}
          </p>
        </div>
      </section>

      {/* ── Plans ── */}
      <Section
        id="pricing-plans"
        index={1}
        bg="bg-hero"
        className="py-16 sm:py-24"
        maxWidth="max-w-[1440px]"
      >
        <PricingToggleSection showFreeTier promoCode={promoFromRef} />
      </Section>

      {/* ── Feature comparison ── */}
      <Section
        id="pricing-comparison"
        index={2}
        bg="bg-hero"
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
      <JsonLd data={PRICING_FAQ_LD} />
      <Section id="pricing-faq" index={3} bg="bg-hero" className="py-20 sm:py-28" maxWidth="max-w-[1200px]">
        <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-[-0.018em] text-[var(--color-text)]">
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
