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
import FeedbackBar from './components/FeedbackBar.jsx';
import Accordion from './components/Accordion';
import Section from './components/ui/Section';
import PricingToggleSection from './components/PricingToggleSection';
import PageHero from './components/PageHero';
import HeroHeadline from './components/HeroHeadline';
import Button from './components/ui/Button';
import ProofShowcase from './components/ProofShowcase';

import AnimatedShieldIcon from './components/AnimatedShieldIcon';

const CTA_SECONDARY = 'inline-flex h-11 items-center gap-1.5 justify-center rounded-full border px-5 text-sm font-semibold transition duration-150 border-[#0F172A]/20 bg-white text-[#0F172A] hover:border-[#0F172A]/40 hover:bg-[#0F172A]/5';

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
  overview:   'text-blue-600',
  columns:    'text-blue-500',
  pin:        'text-sky-500',
  pagination: 'text-blue-400',
  wand:       'text-sky-400',
  link:       'text-blue-300',
};

const COMPARISON_ROWS = [
  ['Wide columns', 'Cut off or unreadable', 'Grouped into sections'],
  ['Layout', 'Manual configuration', 'Auto-structured'],
  ['Page breaks', 'Unpredictable splits', 'Automatic pagination'],
  ['Reference columns', 'Lost after first pages', 'Repeated automatically'],
  ['Overview', 'None', 'Navigate between sections instantly'],
  ['Result', 'Spreadsheet-like output', 'Client-ready document'],
];

function FeatureIcon({ name }) {
  return (
    <span className={FEATURE_ICON_COLORS[name] ?? 'text-accent'} aria-hidden="true">
      {FEATURE_ICONS[name] || null}
    </span>
  );
}


// Sticky trust ticker removed; homepage avoids unverified social-credibility claims.

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
      {/* Scroll spacer — creates room for Apple-style sticky scroll sequence */}
      <div style={{ height: 'calc(100vh + 900px)' }}>
        <PageHero
          heroTestId="hero-section"
          variant="home"
          align="center"
          height="h-screen"
          title={<HeroHeadline />}
          contentClassName="items-center justify-center gap-10 text-center h-full !py-6"
          contentMaxWidthClassName="max-w-[1360px]"
          className="py-0 w-full sticky top-0"
        >
          {/* Subtitle — stays visible throughout */}
          <p className="hero-headline-line w-full max-w-[1020px] mx-auto text-lg text-slate-900">
            <span className="block">{LANDING_COPY.heroSubheadlineL1}</span>
            <span className="block">{LANDING_COPY.heroSubheadlineL2}</span>
          </p>

          {/* Hero CTA — stays visible throughout */}
          <div className="hero-headline-line flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <a
                href="#generate"
                onClick={handleHeroGenerateClick}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#0F172A] px-8 text-sm font-semibold text-white transition duration-150 hover:bg-black/80"
              >
                Upload a file
              </a>
              <a
                href="/developers"
                className="inline-flex h-12 items-center gap-1.5 justify-center rounded-full border border-[#0F172A]/15 bg-white px-6 text-sm font-semibold text-[#0F172A] transition duration-150 hover:border-[#0F172A]/30 hover:bg-[#0F172A]/[0.03]"
              >
                Get API
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <span className="text-xs text-black/40">3 free exports. No account required.</span>
          </div>

          {/* Comparison reveal — fades in below CTA during scroll phase 2.
               height:0 + overflow:visible = no layout impact, content renders visually */}
          <div
            data-hero-comparison
            style={{ opacity: 0, transform: 'translateY(16px)', height: 0, overflow: 'visible' }}
          >
            <div className="flex flex-col items-center gap-4 pt-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-1.5 text-sm font-[500] text-slate-400">
                CRM export :{' '}<span className="font-[600] text-[#0F172A]">14</span>{' '}columns →{' '}<span className="font-[600] text-[#0F172A]">4</span>{' '}PDF sections
              </span>

              <div className="w-full max-w-[540px] overflow-hidden rounded-xl border border-black/10 bg-white text-sm">
                <div className="grid grid-cols-2 divide-x divide-black/10">
                  <div className="bg-black/[0.02] px-4 py-2 text-xs font-[600] uppercase tracking-[0.06em] text-black/40">
                    Excel export
                  </div>
                  <div className="px-4 py-2 text-xs font-[600] uppercase tracking-[0.06em] text-[#0F172A]">
                    fitforpdf
                  </div>
                </div>
                {[
                  ['Cut-off columns',      'Grouped sections'],
                  ['Tiny unreadable text', 'Full-width readable columns'],
                  ['Broken page flow',     'Clean pagination'],
                ].map(([before, after]) => (
                  <div key={before} className="grid grid-cols-2 divide-x divide-black/[0.06] border-t border-black/[0.06]">
                    <div className="bg-black/[0.02] px-4 py-2.5 text-black/40 line-through decoration-black/20">
                      {before}
                    </div>
                    <div className="px-4 py-2.5 font-[500] text-[#0F172A]">
                      {after}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-black/25 tracking-wide">
                Built on the fitforpdf rendering engine for wide business tables.
              </p>
            </div>
          </div>
        </PageHero>
      </div>

      {/* Visual demo — moved before the upload for "proof first" flow */}
      <Section
        id={LANDING_COPY_KEYS.beforeAfter}
        index={1}
        maxWidth="max-w-[1440px]"
        className="py-12 sm:py-16"
        bg="bg-hero"
      >
        <ProofShowcase />
      </Section>

      {/* Upload tool */}
      <Section
        id={LANDING_COPY_KEYS.upload}
        index={2}
        maxWidth="max-w-[1360px]"
        bg="bg-hero"
        className="py-10 sm:py-14"
      >
        <div
          data-testid={LANDING_COPY_KEYS.upload}
          className="mx-auto w-full max-w-[1320px] feature-card-hover relative rounded-xl bg-white"
        >
          <UploadCard
            toolTitle={LANDING_COPY.toolTitle}
            toolSubcopy={(() => {
              if (quota.planType === 'credits') {
                const count = Number.isFinite(quota.freeExportsLeft) ? quota.freeExportsLeft : 0;
                if (count <= 0) return 'No exports left. Get more to continue.';
                return `${count} purchased export${count === 1 ? '' : 's'} remaining.`;
              }
              if (quota.planType === 'pro') {
                return 'Pro plan. 500 exports/month.';
              }
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
        <p className="mt-6 text-center text-sm text-muted">
          {LANDING_COPY.heroTypicalOutput}
        </p>
      </Section>

      {/* Who this is for */}
      <Section
        id="who-this-is-for"
        index={3}
        maxWidth="max-w-[1360px]"
        bg="bg-hero"
        className="py-10 sm:py-14"
      >
        <div className="space-y-8">
          <h2 className="text-center text-3xl sm:text-[2.5rem] font-[650] tracking-tight text-black">
            {LANDING_COPY.whoThisIsForTitle}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-[860px] mx-auto">
            <div className="rounded-2xl border border-black/10 bg-white p-6 space-y-4">
              <p className="text-sm font-[600] uppercase tracking-[0.06em] text-blue-600">Perfect for</p>
              <ul className="space-y-2.5">
                {LANDING_COPY.whoThisIsForPerfect.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[#0F172A]">
                    <span className="flex-none text-blue-500" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 space-y-4">
              <p className="text-sm font-[600] uppercase tracking-[0.06em] text-black/40">Not designed for</p>
              <ul className="space-y-2.5">
                {LANDING_COPY.whoThisIsForNot.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-muted">
                    <span className="flex-none text-black/25" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="comparison"
        index={4}
        maxWidth="max-w-[1360px]"
        bg="bg-hero"
        className="py-10 sm:py-14"
      >
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-[2.5rem] font-[650] tracking-tight text-black">
              Excel PDF Export vs fitforpdf
            </h2>
            <p className="mt-3 text-base text-muted max-w-xl mx-auto">
              Stop fighting print settings. Get a client-ready structured PDF in seconds.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-black/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.025]">
                  <th className="px-5 py-3.5 text-left text-xs font-[600] uppercase tracking-[0.06em] text-black/40 lg:px-6">Feature</th>
                  <th className="px-5 py-3.5 text-left text-xs font-[600] uppercase tracking-[0.06em] text-black/40 lg:px-6">Excel PDF Export</th>
                  <th className="px-5 py-3.5 text-left text-xs font-[600] uppercase tracking-[0.06em] text-[#0F172A] lg:px-6">fitforpdf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {COMPARISON_ROWS.map(([feature, excel, fitforpdf], i) => (
                  <tr key={feature} className={i % 2 === 1 ? 'bg-black/[0.015]' : ''}>
                    <td className="px-5 py-3.5 text-sm font-[500] text-[#0F172A] lg:px-6">{feature}</td>
                    <td className="px-5 py-3.5 text-sm text-black/40 lg:px-6">{excel}</td>
                    <td className="px-5 py-3.5 text-sm font-[500] text-[#0F172A] lg:px-6">{fitforpdf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section
        id={LANDING_COPY_KEYS.pricingPreview}
        index={5}
        maxWidth="max-w-[1440px]"
        className="py-10 sm:py-14"
        bg="bg-hero"
      >
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

      {/* API teaser — compact pointer to /developers */}
      <Section
        id="api-teaser"
        index={6}
        maxWidth="max-w-[860px]"
        bg="bg-hero"
        className="py-6 sm:py-8"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <p className="text-sm text-muted">
            Need to integrate? <span className="font-[500] text-[#0F172A]">REST API available.</span>
          </p>
          <a
            href="/developers"
            className="inline-flex items-center gap-1.5 text-sm font-[600] text-[#2563EB] hover:text-[#1d4ed8] transition"
          >
            View docs
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </Section>

      <Section
        id={LANDING_COPY_KEYS.privacyStrip}
        index={7}
        bg="bg-hero"
        maxWidth="max-w-[1240px]"
        className="py-12 sm:py-16"
        testId="privacy-section"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <AnimatedShieldIcon animateOnMount={false} />
            <span className="text-2xl font-[650] tracking-tight text-black">Privacy</span>
          </div>
          <h2 className="mt-4 text-[2rem] sm:text-[2.5rem] font-[650] tracking-tight text-black leading-[1.1]">
            Your data. Not our business.
          </h2>
          <div className="mt-8 space-y-4 text-base leading-relaxed text-muted">
            <p>Files are deleted immediately after conversion.</p>
            <p>The generated PDF is available for up to 15 minutes.</p>
            <p>No file content is stored in logs.</p>
          </div>
          <a
            href="/privacy"
            className="mt-8 inline-flex h-11 items-center gap-1.5 justify-center rounded-full border px-5 text-sm font-semibold transition duration-150 border-[#0F172A]/20 bg-white text-[#0F172A] hover:border-[#0F172A]/40 hover:bg-[#0F172A]/5"
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
        index={8}
        bg="bg-hero"
        maxWidth="max-w-[1240px]"
        className="py-12 sm:py-16"
        testId="faq-section"
      >
        <div className="space-y-10">
          <h2 className="text-center text-3xl sm:text-[2.5rem] font-[650] tracking-tight text-black">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-black/10">
            <Accordion
              items={HOME_FAQ}
              testId="home-faq"
            />
          </div>
        </div>
      </Section>

      {/* Who uses fitforpdf */}
      <Section
        id="who-uses"
        index={9}
        maxWidth="max-w-[860px]"
        bg="bg-hero"
        className="py-10 sm:py-14"
      >
        <div className="text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-[650] tracking-tight text-black">
            {LANDING_COPY.whoUsesTitle}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {LANDING_COPY.whoUsesItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-[500] text-[#0F172A]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="final-cta"
        index={10}
        bg="bg-hero"
        className="py-16 sm:py-20"
        testId="final-cta-section"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-[2.5rem] font-[650] tracking-tight text-black">
            {LANDING_COPY.finalCtaTitle}
          </h2>
          <p className="mt-4 text-lg text-muted">{LANDING_COPY.finalCtaCopy}</p>
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

      <FeedbackBar renderId={conversion.renderId} visible={Boolean(conversion.pdfBlob)} />
    </div>
  );
}
