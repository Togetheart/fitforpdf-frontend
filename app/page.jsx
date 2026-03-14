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
import StickyMobileCTA from './components/StickyMobileCTA';
import UseCaseCards from './components/UseCaseCards';
import WallOfLove from './components/WallOfLove';
import ApiTeaserWidget from './components/ApiTeaserWidget';
import RoiCalculator from './components/RoiCalculator';

const CTA_SECONDARY = 'inline-flex h-11 items-center gap-1.5 justify-center rounded-full border px-5 text-sm font-semibold transition duration-150 border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:border-[var(--color-border)] hover:bg-[var(--color-bg-hero)]';

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

/* Category icons for "Who this is for" items (16x16, stroke-based) */
const WHO_ICONS = {
  'CRM exports': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" />
    </svg>
  ),
  'financial reports': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v12M5 5h6M5 8h6M6 11h4" />
    </svg>
  ),
  'analytics tables': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13V7M6.5 13V5M10 13V8M13.5 13V3" />
    </svg>
  ),
  'inventory reports': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M2 7h12M6 7v6" />
    </svg>
  ),
  'SaaS reporting exports': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a3 3 0 0 1-.5-5.95A4.5 4.5 0 0 1 12.5 6a3.5 3.5 0 0 1-.5 6.95" />
      <path d="M8 9v4M6 11l2-2 2 2" />
    </svg>
  ),
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

/* Inline ROI slider for the Apple grid card (dark context) */
function RoiSliderInline() {
  const [count, setCount] = React.useState(10);
  const mins = count * 45;
  const hours = Math.round((mins / 60) * 10) / 10;
  const dollars = Math.round(hours * 75);
  const plan = count <= 1 ? 'Single export' : count <= 10 ? 'Starter 10-pack' : 'Volume 100-pack';

  return (
    <>
      <div className="mt-2 flex items-center gap-4">
        <input
          type="range"
          min={1}
          max={500}
          step={1}
          value={count}
          aria-label="Number of exports per month"
          onChange={(e) => setCount(Number(e.target.value))}
          className="roi-slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10"
        />
        <span className="w-12 shrink-0 text-right text-base font-semibold tabular-nums text-white">
          {count}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/[0.06] border border-white/[0.06] px-3 py-3 text-center">
          <p className="text-2xl font-bold text-white tabular-nums">{hours}<span className="text-base font-normal text-slate-400">h</span></p>
          <p className="mt-0.5 text-[11px] text-slate-500">saved / month</p>
        </div>
        <div className="rounded-xl bg-white/[0.06] border border-white/[0.06] px-3 py-3 text-center">
          <p className="text-2xl font-bold text-white tabular-nums">${dollars.toLocaleString()}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">at $75/hr</p>
        </div>
        <div className="rounded-xl bg-white/[0.06] border border-white/[0.06] px-3 py-3 text-center">
          <p className="text-sm font-semibold text-blue-400">{plan}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">recommended</p>
        </div>
      </div>
    </>
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
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Scroll spacer — creates room for Apple-style sticky scroll sequence */}
      <div className="h-[calc(100vh+600px)] sm:h-[calc(100vh+900px)]">
        <PageHero
          heroTestId="hero-section"
          variant="home"
          align="center"
          height="h-screen"
          title={<HeroHeadline />}
          contentClassName="items-center justify-center gap-10 text-center h-full !py-6"
          contentMaxWidthClassName="max-w-content"
          className="py-0 w-full sticky top-0"
        >
          {/* Subtitle — stays visible throughout */}
          <p className="hero-headline-line w-full max-w-3xl mx-auto text-lg text-[var(--color-text)]">
            {LANDING_COPY.heroSubheadlineL2}
          </p>

          {/* Hero CTA — stays visible throughout */}
          <div className="hero-headline-line flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="accent"
                href="#generate"
                onClick={handleHeroGenerateClick}
                className="h-12 px-8"
              >
                Upload a file
              </Button>
              <Button
                variant="outline"
                href="/developers"
                className="h-12 gap-1.5"
              >
                Get API
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
            <span className="text-xs text-[var(--color-muted)]">3 free exports. No account required.</span>
          </div>

          {/* Comparison reveal — fades in below CTA during scroll phase 2.
               height:0 + overflow:visible = no layout impact, content renders visually */}
          <div
            data-hero-comparison
            style={{ opacity: 0, transform: 'translateY(16px)', height: 0, overflow: 'visible' }}
          >
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="w-full max-w-[540px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm">
                <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
                  <div className="bg-[var(--color-bg-hero)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                    Excel export
                  </div>
                  <div className="bg-cta/[0.06] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-cta">
                    fitforpdf
                  </div>
                </div>
                {[
                  ['Cut-off columns',      'Grouped sections'],
                  ['Tiny unreadable text', 'Full-width readable columns'],
                  ['Broken page flow',     'Clean pagination'],
                ].map(([before, after]) => (
                  <div key={before} className="grid grid-cols-2 divide-x divide-[var(--color-border)] border-t border-[var(--color-border)]">
                    <div className="bg-[var(--color-bg-hero)] px-4 py-2.5 text-[var(--color-muted)] line-through decoration-[var(--color-border)]">
                      <span className="mr-1.5 text-red-400/60">✗</span>{before}
                    </div>
                    <div className="bg-cta/[0.06] px-4 py-2.5 font-semibold text-[var(--color-text)]">
                      <span className="mr-1.5 text-emerald-500">✓</span>{after}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </PageHero>
      </div>

      {/* Visual demo — moved before the upload for "proof first" flow */}
      <Section
        id={LANDING_COPY_KEYS.beforeAfter}
        index={1}
        maxWidth="max-w-wide"
        className="py-12 sm:py-16"
        bg="bg-hero"
      >
        <ProofShowcase />
      </Section>

      {/* Upload tool */}
      <section
        id={LANDING_COPY_KEYS.upload}
        className="upload-section-bg py-12 sm:py-16"
        data-testid={`section-${LANDING_COPY_KEYS.upload}`}
      >
        <div className="mx-auto max-w-[640px] px-4 sm:px-6">
        <div
          data-testid={LANDING_COPY_KEYS.upload}
          className="mx-auto w-full relative"
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
        </div>
      </section>

      {/* Who this is for */}
      <Section
        id="who-this-is-for"
        index={3}
        bg="bg-hero"
      >
        <div className="space-y-8">
          <h2 className="text-center text-3xl sm:text-[2.5rem] font-bold tracking-tight text-[var(--color-text)]">
            {LANDING_COPY.whoThisIsForTitle}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-tight mx-auto">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 space-y-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-blue-600">Perfect for</p>
              <ul className="space-y-2.5">
                {LANDING_COPY.whoThisIsForPerfect.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[var(--color-text)]">
                    <span className="flex-none text-blue-500" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {WHO_ICONS[item] && (
                      <span className="flex-none text-blue-400" aria-hidden="true">
                        {WHO_ICONS[item]}
                      </span>
                    )}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-hero)] p-6 space-y-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Not designed for</p>
              <ul className="space-y-2.5">
                {LANDING_COPY.whoThisIsForNot.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-muted">
                    <span className="flex-none text-[var(--color-muted)]" aria-hidden="true">
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

      {/* Use cases */}
      <Section
        id="use-cases"
        index={4}
        bg="bg-hero"
      >
        <UseCaseCards />
      </Section>

      <Section
        id="comparison"
        index={5}
        bg="bg-hero"
      >
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight text-[var(--color-text)]">
              Excel PDF Export vs fitforpdf
            </h2>
            <p className="mt-3 text-base text-muted max-w-xl mx-auto">
              Stop fighting print settings. Get a client-ready structured PDF in seconds.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
            <table
              className="comp-table-reveal w-full min-w-[640px] text-sm"
              ref={(el) => {
                if (!el || el.dataset.observed) return;
                el.dataset.observed = '1';
                const obs = new IntersectionObserver(
                  ([e]) => { if (e.isIntersecting) { el.classList.add('is-visible'); obs.disconnect(); } },
                  { threshold: 0.2 },
                );
                obs.observe(el);
              }}
            >
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-hero)]">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)] lg:px-6">Feature</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)] lg:px-6">Excel PDF Export</th>
                  <th className="bg-cta/[0.06] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-cta lg:px-6">fitforpdf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {COMPARISON_ROWS.map(([feature, excel, fitforpdf], i) => (
                  <tr
                    key={feature}
                    className={`transition-colors hover:bg-[var(--color-bg-hero)] ${i % 2 === 1 ? 'bg-[var(--color-bg-hero)]/60' : ''}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-[var(--color-text)] lg:px-6">{feature}</td>
                    <td className="px-5 py-3.5 text-sm text-[var(--color-muted)] lg:px-6"><span className="mr-1.5 text-red-400/60">✗</span>{excel}</td>
                    <td className="bg-cta/[0.06] px-5 py-3.5 text-sm font-semibold text-[var(--color-text)] lg:px-6"><span className="mr-1.5 text-emerald-500">✓</span>{fitforpdf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Pricing plans — full width, above the Apple grid */}
      <Section
        id={LANDING_COPY_KEYS.pricingPreview}
        index={6}
        maxWidth="max-w-wide"
        bg="bg-hero"
      >
        <PricingToggleSection showFreeTier />
      </Section>

      {/* Apple-style two-up grid: ROI + API teaser */}
      <section
        id="apple-grid"
        className="apple-grid-bg"
        data-testid="apple-grid-section"
      >
        <div className="apple-grid-noise" />
        <div className="relative z-10 mx-auto max-w-wide px-4 py-16 sm:px-6 sm:py-20 lg:px-10 xl:px-12">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Card 1 — ROI Calculator */}
            <div className="apple-grid-card flex flex-col p-6 sm:p-8">
              {/* Card header label */}
              <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-400 tracking-wide uppercase">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                ROI
              </span>
              {/* Embedded ROI calculator with overridden colors */}
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  How much time could you save?
                </h3>
                <div className="mt-6">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-400">
                      Exports per month
                    </span>
                    <RoiSliderInline />
                  </label>
                </div>
              </div>
              {/* CTA */}
              <a
                href="/pricing"
                className="mt-8 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                {LANDING_COPY.pricingPreviewCta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Card 2 — API Teaser */}
            <div className="apple-grid-card flex flex-col p-6 sm:p-8">
              {/* Card header label */}
              <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                API
              </span>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Integrate in minutes
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  One API call. Any HTML to pixel-perfect PDF.
                </p>
                <div className="mt-6">
                  <ApiTeaserWidget variant="dark" />
                </div>
              </div>
              {/* CTA */}
              <a
                href="/developers"
                className="mt-8 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Explore the docs
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Section
        id={LANDING_COPY_KEYS.privacyStrip}
        index={8}
        bg="bg-hero"
        maxWidth="max-w-narrow"
        className="py-12 sm:py-16"
        testId="privacy-section"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <AnimatedShieldIcon animateOnMount={false} />
            <span className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Privacy</span>
          </div>
          <h2 className="mt-4 text-[2rem] sm:text-[2.5rem] font-bold tracking-tight text-[var(--color-text)] leading-[1.1]">
            Your data. Not our business.
          </h2>
          <div className="mt-8 space-y-4 text-base leading-relaxed text-muted">
            <p>Files are deleted immediately after conversion.</p>
            <p>The generated PDF is available for up to 15 minutes.</p>
            <p>No file content is stored in logs.</p>
          </div>
          <a
            href="/privacy"
            className="mt-8 inline-flex h-11 items-center gap-1.5 justify-center rounded-full border px-5 text-sm font-semibold transition duration-150 border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:border-[var(--color-border)] hover:bg-[var(--color-bg-hero)]"
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
        index={9}
        bg="bg-hero"
        maxWidth="max-w-narrow"
        className="py-12 sm:py-16"
        testId="faq-section"
      >
        <div className="space-y-10">
          <h2 className="text-center text-3xl sm:text-[2.5rem] font-bold tracking-tight text-[var(--color-text)]">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-[var(--color-border)]">
            <Accordion
              items={HOME_FAQ}
              testId="home-faq"
            />
          </div>
        </div>
      </Section>

      {/* Testimonials — Wall of Love */}
      <Section
        id="testimonials"
        index={10}
        bg="bg-hero"
      >
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">Trusted by teams worldwide</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-[2.5rem]">What people say</h2>
          <p className="text-[var(--color-muted)]">Real feedback from real workflows.</p>
        </div>
        <WallOfLove />
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {LANDING_COPY.whoUsesItems.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-1.5 text-xs font-medium text-[var(--color-muted)]"
            >
              {item}
            </span>
          ))}
        </div>
      </Section>

      <Section
        id="final-cta"
        index={11}
        bg="bg-hero"
        className="py-16 sm:py-20"
        testId="final-cta-section"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight text-[var(--color-text)]">
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

      <StickyMobileCTA />
    </div>
  );
}
