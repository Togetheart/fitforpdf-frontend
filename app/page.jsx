'use client';

import React from 'react';
import {
  LANDING_COPY,
  LANDING_COPY_KEYS,
  HOME_FAQ,
} from './siteCopy.mjs';
import useQuota from './hooks/useQuota.mjs';
import useConversion from './hooks/useConversion.mjs';
import UploadCard from './components/UploadCard';
import Accordion from './components/Accordion';
import Section from './components/ui/Section';
import PricingToggleSection from './components/PricingToggleSection';
import PageHero from './components/PageHero';
import HeroHeadline from './components/HeroHeadline';
import Button from './components/ui/Button';
import ProofShowcase from './components/ProofShowcase';
import AnimatedShieldIcon from './components/AnimatedShieldIcon';

const CTA_SECONDARY = 'inline-flex h-11 items-center gap-1.5 justify-center rounded-full border px-5 text-sm font-semibold transition duration-150 border-[#1A1A1A]/20 bg-white text-[#1A1A1A] hover:border-[#1A1A1A]/40 hover:bg-[#1A1A1A]/5';

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
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  link: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
};

const FEATURE_ICON_COLORS = {
  overview:   'text-sky-500',
  columns:    'text-indigo-600',
  pin:        'text-teal-500',
  pagination: 'text-green-500',
  wand:       'text-amber-500',
  link:       'text-red-500',
};

function FeatureIcon({ name }) {
  return (
    <span className={FEATURE_ICON_COLORS[name] ?? 'text-accent'} aria-hidden="true">
      {FEATURE_ICONS[name] || null}
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
        contentClassName="items-center gap-10 text-center"
        contentMaxWidthClassName="max-w-[960px]"
        className="py-0 w-full"
      >
        <div className="space-y-8">
          <p
            className="hero-headline-line w-full max-w-none text-lg text-slate-900 lg:whitespace-nowrap"
          >
            {LANDING_COPY.heroSubheadline}
          </p>
          <div
            id={LANDING_COPY_KEYS.upload}
            data-testid={LANDING_COPY_KEYS.upload}
            className="hero-headline-line mt-8 relative rounded-xl bg-white"
          >
            <UploadCard
              toolTitle={LANDING_COPY.toolTitle}
              toolSubcopy={(() => {
                if (quota.planType !== 'free') return LANDING_COPY.toolSubcopy;
                const count = Number.isFinite(quota.freeExportsLeft)
                  ? quota.freeExportsLeft
                  : Number.isFinite(quota.freeExportsLimit)
                    ? quota.freeExportsLimit
                    : 3;
                return `${count} free export${count === 1 ? '' : 's'}. No account required.`;
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

      {/* Social proof — Arcade style */}
      <div className="border-y border-slate-100 bg-white py-8" data-testid="social-proof-ticker">
        <p className="mb-5 text-center text-sm text-slate-500">
          {(() => {
            const full = LANDING_COPY.socialProofCount || '';
            const spaceIdx = full.indexOf(' ');
            const count = spaceIdx > -1 ? full.slice(0, spaceIdx) : full;
            const rest = spaceIdx > -1 ? full.slice(spaceIdx) : '';
            return (
              <>
                <span className="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-sm font-semibold text-slate-700">
                  {count}
                </span>
                {rest}
              </>
            );
          })()}
        </p>
        <div className="w-full overflow-hidden">
          <div className="ticker-track">
            {[...LANDING_COPY.socialProofTicker, ...LANDING_COPY.socialProofTicker].map((item, i) => (
              <span key={i} className="mx-8 whitespace-nowrap text-sm font-semibold tracking-wide text-slate-400 sm:mx-12 sm:text-base">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Section id={LANDING_COPY_KEYS.beforeAfter} index={1} className="py-16 sm:py-24">
        <ProofShowcase />
      </Section>

      <Section id={LANDING_COPY_KEYS.pricingPreview} index={3} className="py-14 sm:py-20" bg="bg-hero">
        <PricingToggleSection showFreeTier />
        <div className="flex justify-center">
          <a href="/pricing" className={CTA_SECONDARY}>
            {LANDING_COPY.pricingPreviewCta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </Section>

      <Section
        id={LANDING_COPY_KEYS.privacyStrip}
        index={4}
        bg="bg-hero"
        className="py-16 sm:py-24"
        testId="privacy-section"
        maxWidth="max-w-3xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <AnimatedShieldIcon animateOnMount={false} />
            <span className="text-2xl font-semibold tracking-tight text-slate-900">Privacy</span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Your data. Not our business.
          </h2>
          <div className="mt-6 space-y-3 text-base leading-relaxed text-slate-500">
            <p>Files are deleted immediately after conversion.</p>
            <p>The generated PDF is available for up to 15 minutes.</p>
            <p>No file content is stored in logs.</p>
          </div>
          <a
            href="/privacy"
            className="mt-8 inline-flex h-11 items-center gap-1.5 justify-center rounded-full border px-5 text-sm font-semibold transition duration-150 border-[#1A1A1A]/20 bg-white text-[#1A1A1A] hover:border-[#1A1A1A]/40 hover:bg-[#1A1A1A]/5"
          >
            {LANDING_COPY.privacyStripCta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
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
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
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
        bg="bg-hero"
        className="py-20 sm:py-28"
        testId="final-cta-section"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
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
