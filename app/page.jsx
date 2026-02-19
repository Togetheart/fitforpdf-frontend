'use client';

import React from 'react';
import {
  LANDING_COPY,
  LANDING_COPY_KEYS,
  PRICING_CARDS,
  HOME_FAQ,
} from './siteCopy.mjs';
import useQuota from './hooks/useQuota.mjs';
import useConversion from './hooks/useConversion.mjs';
import UploadCard from './components/UploadCard';
import Accordion from './components/Accordion';
import Section from './components/ui/Section';
import PricingPlans from './components/PricingPlans';
import PageHero from './components/PageHero';
import HeroHeadline from './components/HeroHeadline';
import Button from './components/ui/Button';
import ProofShowcase from './components/ProofShowcase';

const CTA_SECONDARY = 'inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition duration-150 border-slate-300 bg-white text-slate-900 hover:bg-slate-50';

const FEATURE_ICONS = {
  overview: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="9" x2="9" y2="21" />
    </svg>
  ),
  columns: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="18" rx="1.5" />
      <rect x="14" y="3" width="7" height="18" rx="1.5" />
    </svg>
  ),
  pin: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="21" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  ),
  pagination: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
  wand: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 4-1 1 4 4 1-1a2.83 2.83 0 1 0-4-4Z" />
      <path d="m14 5-9.7 9.7a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0L18 9" />
    </svg>
  ),
  link: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
};

function FeatureIcon({ name }) {
  return (
    <span className="text-accent" aria-hidden="true">
      {FEATURE_ICONS[name] || null}
    </span>
  );
}

/* Shield icon for privacy section */
function ShieldIcon() {
  return (
    <span className="privacy-shield inline-flex items-center justify-center rounded-2xl bg-emerald-50 p-4" aria-hidden="true">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </span>
  );
}

export default function Page() {
  const quota = useQuota();
  const conversion = useConversion({ quota });

  function handleHeroGenerateClick(event) {
    if (!event) return;
    event.preventDefault();
    const target = document.getElementById('generate');
    if (!target) return;
    if (typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      const top = typeof target.getBoundingClientRect === 'function'
        ? target.getBoundingClientRect().top + window.pageYOffset - 24
        : 0;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PageHero
        heroTestId="hero-section"
        variant="home"
        align="center"
        height="min-h-0 sm:min-h-screen"
        title={<HeroHeadline />}
        subtitle={LANDING_COPY.heroSubheadline}
        subtitleClassName="w-full max-w-none text-lg text-slate-500 lg:whitespace-nowrap"
        contentClassName="items-center gap-10 text-center"
        contentMaxWidthClassName="max-w-7xl"
        className="py-0 w-full"
      >
        <div className="space-y-8">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/50 px-4 py-1.5 text-xs font-medium text-emerald-700">
            <span aria-label="European Union flag">🇪🇺</span>
            {LANDING_COPY.heroTrustLine}
          </p>
          <div
            id={LANDING_COPY_KEYS.upload}
            data-testid={LANDING_COPY_KEYS.upload}
            className="mt-8 relative rounded-xl bg-white"
          >
            <UploadCard
              toolTitle={LANDING_COPY.toolTitle}
              toolSubcopy={(() => {
                if (quota.planType !== 'free') return LANDING_COPY.toolSubcopy;
                if (Number.isFinite(quota.freeExportsLimit)) {
                  return `${quota.freeExportsLimit} free exports. No account required.`;
                }
                return 'Free exports. No account required.';
              })()}
              file={conversion.file}
              freeExportsLeft={quota.freeExportsLeft}
              includeBranding={conversion.includeBranding}
              truncateLongText={conversion.truncateLongText}
              isLoading={conversion.isLoading}
              notice={conversion.notice}
              error={conversion.error}
              hasResultBlob={Boolean(conversion.pdfBlob)}
              onFileSelect={(nextFile) => conversion.handleFileSelect(nextFile)}
              onRemoveFile={conversion.handleRemoveFile}
              onBrandingChange={conversion.setIncludeBranding}
              onTruncateChange={conversion.setTruncateLongText}
              onSubmit={conversion.handleSubmit}
              onDownloadAgain={conversion.handleDownloadAnyway}
              onTrySample={conversion.handleTrySample}
              downloadedFileName={Boolean(conversion.pdfBlob) ? conversion.resolvedPdfFilename : null}
              verdict={conversion.renderVerdict}
              conversionProgress={conversion.conversionProgress}
              onBuyCredits={quota.openBuyCreditsPanel}
              isPro={quota.planType === 'pro'}
              showBuyCreditsForTwo={false}
              isQuotaLocked={quota.isQuotaLocked}
              planType={quota.planType}
              remainingInPeriod={quota.remainingInPeriod}
              usedInPeriod={quota.usedInPeriod}
              periodLimit={quota.periodLimit}
              paywallReason={quota.paywallReason}
              onBuyCreditsPack={conversion.handleBuyCreditsPack}
              showBuyCreditsPanel={quota.showBuyCreditsPanel}
              onCloseBuyPanel={quota.closeBuyCreditsPanel}
              purchaseMessage={quota.purchaseMessage}
              onGoPro={conversion.handleGoProCheckout}
              onLayoutChange={conversion.handleLayoutChange}
              layout={conversion.layout}
            />
          </div>
        </div>
      </PageHero>

      {/* Social proof ticker */}
      <div className="overflow-hidden border-y border-slate-100 bg-slate-50/50 py-4" data-testid="social-proof-ticker">
        <div className="ticker-track">
          {[...LANDING_COPY.socialProofTicker, ...LANDING_COPY.socialProofTicker].map((item, i) => (
            <span key={i} className="mx-6 whitespace-nowrap text-sm font-medium tracking-tight text-slate-400 sm:mx-10 sm:text-base">
              {item}
            </span>
          ))}
        </div>
      </div>

      <Section id={LANDING_COPY_KEYS.beforeAfter} index={1} className="py-16 sm:py-24">
        <ProofShowcase />
      </Section>

      <Section id="client-ready" index={2} className="py-16 sm:py-20" bg="bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {LANDING_COPY.clientReadyTitle}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {LANDING_COPY.clientReadyFeatures.map((feature) => (
            <div
              key={feature.key}
              className="feature-card-hover flex flex-col items-start gap-3 rounded-xl p-6 glass-subtle"
            >
              <FeatureIcon name={feature.icon} />
              <h3 className="text-sm font-semibold leading-tight text-slate-900">
                {feature.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section id={LANDING_COPY_KEYS.pricingPreview} index={3} className="py-16 sm:py-24" bg="bg-white">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {LANDING_COPY.pricingPreviewTitle}
            </h2>
            <p className="text-base text-slate-500">{LANDING_COPY.pricingPreviewSubline}</p>
          </div>
          <PricingPlans
            plans={PRICING_CARDS}
            variant="home"
            gridTestId="pricing-grid"
            cardTestId="pricing-preview-card"
          />
          <p className="text-sm text-slate-500">
            Need higher limits, API access or team plans? <a href="mailto:hello@fitforpdf.com" className="underline hover:text-accent transition-colors">Contact us</a>.
          </p>
          <a href="/pricing" className={CTA_SECONDARY}>
            {LANDING_COPY.pricingPreviewCta}
          </a>
        </div>
      </Section>

      <Section
        id={LANDING_COPY_KEYS.privacyStrip}
        index={4}
        bg="bg-slate-50"
        className="py-16 sm:py-24"
        testId="privacy-section"
        maxWidth="max-w-3xl"
      >
        <div className="flex flex-col items-center text-center">
          <ShieldIcon />
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Your data. Not our business.
          </h2>
          <div className="mt-6 space-y-3 text-base leading-relaxed text-slate-500">
            <p>Files are deleted immediately after conversion.</p>
            <p>The generated PDF is available for up to 15 minutes.</p>
            <p>No file content is stored in logs.</p>
          </div>
        </div>
      </Section>

      <Section
        id="home-faq"
        index={5}
        bg="bg-white"
        className="py-16 sm:py-24"
        testId="faq-section"
      >
        <div className="space-y-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-slate-200 rounded-xl glass-elevated">
            <Accordion
              items={HOME_FAQ}
              testId="home-faq"
              itemClassName="py-3"
            />
          </div>
        </div>
      </Section>

      <Section
        id="final-cta"
        index={6}
        bg="bg-gray-50"
        className="py-20 sm:py-28"
        testId="final-cta-section"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {LANDING_COPY.finalCtaTitle}
          </h2>
          <p className="mt-4 text-lg text-slate-500">{LANDING_COPY.finalCtaCopy}</p>
          <Button
            variant="primary"
            href="#generate"
            onClick={handleHeroGenerateClick}
            className="mt-8"
          >
            {LANDING_COPY.finalCtaLabel}
          </Button>
        </div>
      </Section>

    </div>
  );
}
