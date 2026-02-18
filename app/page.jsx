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
import ImageLightbox from './components/ImageLightbox';

const CTA_SECONDARY = 'inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition duration-150 border-slate-300 bg-white text-slate-900 hover:bg-slate-50';

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
        contentClassName="items-center gap-8 text-center"
        contentMaxWidthClassName="max-w-7xl"
        subtitleClassName="w-full max-w-none lg:whitespace-nowrap"
        className="py-0 w-full"
      >
        <div className="space-y-6">
          <div className="space-y-1.5">
            <p className="max-w-prose text-sm text-slate-500">{LANDING_COPY.heroTrustLine}</p>
            <p className="max-w-prose text-xs text-slate-400">{LANDING_COPY.socialProofLine}</p>
          </div>
          <div
            id={LANDING_COPY_KEYS.upload}
            data-testid={LANDING_COPY_KEYS.upload}
            className="mt-8 relative rounded-xl bg-gradient-to-br from-sky-200/35 via-indigo-200/25 to-white/95"
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

      <Section id={LANDING_COPY_KEYS.beforeAfter} index={1} className="py-16 sm:py-20">
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-semibold leading-snug sm:text-3xl">
            From raw data to structured document.
          </h2>
          <div
            data-testid="home-preview-card"
            className="home-preview-float mx-auto max-w-7xl rounded-xl glass-elevated p-4 md:p-8"
          >
            <div className="grid gap-6 sm:grid-cols-[1fr_1.3fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  CSV INPUT
                </p>
                <ImageLightbox
                  src="/before_csv.webp"
                  alt="CSV input preview"
                  className="mt-2 block w-full overflow-hidden rounded-lg border border-slate-200"
                >
                  <img
                    src="/before_csv.webp"
                    alt="CSV input preview"
                    className="h-auto w-full rounded-lg object-cover"
                  />
                </ImageLightbox>
                <p className="mt-2 text-xs text-slate-400">Raw spreadsheet data — columns overflow, no structure.</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  STRUCTURED PDF
                </p>
                <ImageLightbox
                  src="/after_fitforpdf.webp"
                  alt="FitForPDF structured document preview with overview and grouped columns"
                  className="mt-2 block w-full overflow-hidden rounded-lg border border-slate-200"
                  data-testid="proof-pdf-image"
                >
                  <img
                    src="/after_fitforpdf.webp"
                    alt="FitForPDF structured document preview with overview and grouped columns"
                    className="h-auto w-full rounded-lg object-cover"
                  />
                </ImageLightbox>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span>Overview page</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>Grouped columns</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>Page i/n</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="client-ready" index={2} className="py-10" bg="bg-gray-50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">{LANDING_COPY.clientReadyTitle}</h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
            {LANDING_COPY.clientReadyBullets.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <svg className="h-4 w-4 flex-shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id={LANDING_COPY_KEYS.pricingPreview} index={3} className="py-16 sm:py-20" bg="bg-white">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">
            {LANDING_COPY.pricingPreviewTitle}
          </h2>
          <p className="text-sm text-slate-500">{LANDING_COPY.pricingPreviewSubline}</p>
          <PricingPlans
            plans={PRICING_CARDS}
            variant="home"
            gridTestId="pricing-grid"
            cardTestId="pricing-preview-card"
          />
          <p className="text-sm text-slate-700">
            Need higher limits, API access or team plans? <a href="mailto:hello@fitforpdf.com" className="underline">Contact us</a>.
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
        className="py-10"
        testId="privacy-section"
        maxWidth="max-w-3xl"
      >
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Your data. Not our business.
          </h2>
          <div className="mt-6 space-y-2 text-base leading-relaxed text-slate-500">
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
        className="py-16 sm:py-20"
        testId="faq-section"
      >
        <div className="space-y-3">
          <h2 className="text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
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
        className="py-16 sm:py-20"
        testId="final-cta-section"
      >
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {LANDING_COPY.finalCtaTitle}
          </h2>
          <p className="mt-3 text-base text-slate-500">{LANDING_COPY.finalCtaCopy}</p>
          <Button
            variant="primary"
            href="#generate"
            onClick={handleHeroGenerateClick}
            className="mt-6"
          >
            {LANDING_COPY.finalCtaLabel}
          </Button>
        </div>
      </Section>

    </div>
  );
}
