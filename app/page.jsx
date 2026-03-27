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
import { JsonLd } from './components/JsonLd';

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
  columns:    'text-blue-600',
  pin:        'text-blue-600',
  pagination: 'text-blue-600',
  wand:       'text-blue-600',
  link:       'text-blue-600',
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
          <p className="text-2xl font-bold text-white tabular-nums">{hours}<span className="text-base font-normal text-white/60">h</span></p>
          <p className="mt-0.5 text-xs text-white/60">saved / month</p>
        </div>
        <div className="rounded-xl bg-white/[0.06] border border-white/[0.06] px-3 py-3 text-center">
          <p className="text-2xl font-bold text-white tabular-nums">${dollars.toLocaleString()}</p>
          <p className="mt-0.5 text-xs text-white/60">at $75/hr</p>
        </div>
        <div className="rounded-xl bg-white/[0.06] border border-white/[0.06] px-3 py-3 text-center">
          <p className="text-sm font-semibold text-blue-600">{plan}</p>
          <p className="mt-0.5 text-xs text-white/60">recommended</p>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  const quota = useQuota();
  const conversion = useConversion({ quota });
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  function handleHeroGenerateClick(event) {
    if (!event) return;
    event.preventDefault();
    const target = document.getElementById('tool') || document.getElementById('generate');
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

  const homeFaqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <JsonLd data={homeFaqLd} />
      {/* Scroll spacer — creates room for Apple-style sticky scroll sequence */}
      <div className="h-[calc(100vh+900px)] sm:h-[calc(100vh+1100px)]">
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
          <p className="hero-headline-line w-full max-w-3xl mx-auto text-lg text-muted">
            {LANDING_COPY.heroSubheadlineL2a}<br />{LANDING_COPY.heroSubheadlineL2b}
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
                {LANDING_COPY.heroCta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 opacity-70" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
              <a
                href="/sample-output.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={CTA_SECONDARY + ' h-12'}
              >
                See a sample PDF
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <span className="text-xs text-[var(--color-muted)]">
              {LANDING_COPY.heroMicrocopyFree}
            </span>
          </div>

          {/* Comparison reveal — desktop only: fades in during scroll phase 2 */}
          <div
            data-hero-comparison
            className="hidden sm:block"
            style={{ opacity: 0, transform: 'translateY(16px)', height: 0, overflow: 'visible' }}
          >
            <div className="flex flex-col items-center pt-2">
              <div className="w-full max-w-[600px] rounded-2xl border border-[var(--color-border)] shadow-sm">
                <picture>
                  <source srcSet="/fitforpdf_product@2x.webp" type="image/webp" />
                  <img
                    src="/fitforpdf_product@2x.png"
                    alt="Excel spreadsheet transformed into a structured PDF by fitforpdf"
                    className="w-full block object-contain"
                    loading="eager"
                  />
                </picture>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted overflow-hidden max-w-[600px] w-full">
                <span className="shrink-0 font-semibold text-[var(--color-text)]">Used by</span>
                <div className="overflow-hidden flex-1">
                  <div className="used-by-ticker flex gap-8 whitespace-nowrap">
                    <span>Consultants</span><span>Finance teams</span><span>Auditors</span><span>SaaS reporting tools</span><span>Operations teams</span>
                    <span>Consultants</span><span>Finance teams</span><span>Auditors</span><span>SaaS reporting tools</span><span>Operations teams</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageHero>
      </div>

      {/* Mobile only: product image + Used by ticker (outside sticky hero) */}
      <section className="sm:hidden bg-[var(--color-surface)] py-8 px-4 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block w-full rounded-2xl border border-[var(--color-border)] shadow-sm cursor-zoom-in"
            aria-label="View full-size product image"
          >
            <picture>
              <source srcSet="/fitforpdf_product.webp" type="image/webp" />
              <img
                src="/fitforpdf_product@2x.png"
                alt="Excel spreadsheet transformed into a structured PDF by fitforpdf"
                className="w-full block object-contain rounded-2xl"
                loading="eager"
              />
            </picture>
          </button>
          <div className="flex items-center gap-2 text-sm text-muted overflow-hidden w-full">
            <span className="shrink-0 font-semibold text-[var(--color-text)]">Used by</span>
            <div className="overflow-hidden flex-1">
              <div className="used-by-ticker flex gap-8 whitespace-nowrap">
                <span>Consultants</span><span>Finance teams</span><span>Auditors</span><span>SaaS reporting tools</span><span>Operations teams</span>
                <span>Consultants</span><span>Finance teams</span><span>Auditors</span><span>SaaS reporting tools</span><span>Operations teams</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual demo — moved before the upload for "proof first" flow */}
      <Section
        id={LANDING_COPY_KEYS.beforeAfter}
        index={1}
        maxWidth="max-w-wide"
        className="py-16 sm:py-20 relative z-10"
        bg="bg-hero"
      >
        <ProofShowcase />
      </Section>

      {/* Upload tool */}
      <section
        id={LANDING_COPY_KEYS.upload}
        className="apple-grid-bg py-16 sm:py-20 relative z-10 scroll-mt-16"
        data-testid={`section-${LANDING_COPY_KEYS.upload}`}
      >
        <div className="apple-grid-noise" />
        <div className="relative z-10 mx-auto max-w-[640px] px-4 sm:px-6">
        <div
          data-testid={LANDING_COPY_KEYS.upload}
          className="apple-grid-card mx-auto w-full relative p-6 sm:p-8"
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
            onCopyShareLink={conversion.handleCopyShareLink}
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
            exportHistory={conversion.exportHistory}
            isHistoryLoading={conversion.isHistoryLoading}
            historyError={conversion.historyError}
            historyStatus={conversion.historyStatus}
            onHistoryStatusChange={conversion.onHistoryStatusChange}
            hasMoreHistory={conversion.hasMoreHistory}
            onLoadMoreHistory={conversion.loadMoreExportHistory}
            onRefreshHistory={conversion.refreshExportHistory}
            renderId={conversion.renderId}
            shareState={conversion.shareState}
            variant="dark"
          />
        </div>
        <p className="mt-6 text-center text-sm text-white/60">
          {LANDING_COPY.heroTypicalOutput}
        </p>
        </div>
      </section>

      {/* Social proof — 3 key testimonials, compact */}
      <Section
        id="testimonials"
        index={3}
        bg="bg-hero"
        className="py-16 sm:py-20"
      >
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">Trusted by teams worldwide</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">What people say</h2>
          </div>
          {/* Desktop: 3 side by side */}
          <div className="hidden sm:flex gap-4 max-w-tight mx-auto">
            {[
              {
                quote: "We stopped fixing Excel exports manually. This saved us hours every week.",
                role: "Head of Operations",
                context: "B2B SaaS — CRM exports, 20+ columns",
              },
              {
                quote: "Our CRM export has 28 columns. fitforpdf turns it into something I can actually send to clients.",
                role: "Account Manager",
                context: "B2B SaaS — HubSpot/Salesforce exports",
              },
              {
                quote: "I used to spend 45 minutes reformatting every quarterly report. Now it takes 10 seconds.",
                role: "Senior Auditor",
                context: "Big 4 advisory — quarterly compliance reports",
              },
            ].map((t, i) => (
              <blockquote key={i} className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 flex-1">
                <p className="text-lg leading-relaxed text-[var(--color-text)] font-serif italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{t.role}</p>
                  <p className="text-xs text-muted">{t.context}</p>
                </div>
              </blockquote>
            ))}
          </div>
          {/* Mobile: auto-sliding carousel */}
          <div
            className="sm:hidden overflow-hidden pb-6"
            ref={(el) => {
              if (!el || el.dataset.carouselInit) return;
              el.dataset.carouselInit = '1';
              const track = el.querySelector('[data-carousel-track]');
              if (!track) return;
              const cards = track.children;
              const count = cards.length;
              let current = 0;
              let paused = false;
              const go = (idx) => {
                current = idx % count;
                track.style.transform = `translateX(-${current * 100}%)`;
              };
              const interval = setInterval(() => { if (!paused) go(current + 1); }, 4000);
              /* Swipe support */
              let startX = 0;
              let startY = 0;
              let swiping = false;
              el.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                swiping = true;
                paused = true;
              }, { passive: true });
              el.addEventListener('touchmove', (e) => {
                if (!swiping) return;
                const dx = e.touches[0].clientX - startX;
                const dy = e.touches[0].clientY - startY;
                /* If mostly horizontal, prevent vertical scroll */
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
                  e.preventDefault();
                }
              }, { passive: false });
              el.addEventListener('touchend', (e) => {
                if (!swiping) return;
                swiping = false;
                const dx = e.changedTouches[0].clientX - startX;
                if (dx < -50) go(current + 1);       /* swipe left → next */
                else if (dx > 50) go((current - 1 + count) % count); /* swipe right → prev */
                setTimeout(() => { paused = false; }, 6000);
              }, { passive: true });
              /* Dots */
              const dots = el.querySelectorAll('[data-dot]');
              const updateDots = () => dots.forEach((d, i) => {
                d.style.opacity = i === current ? '1' : '0.3';
                d.style.transform = i === current ? 'scale(1.3)' : 'scale(1)';
              });
              const ob = new MutationObserver(updateDots);
              ob.observe(track, { attributes: true, attributeFilter: ['style'] });
              dots.forEach((d, i) => d.addEventListener('click', () => { go(i); paused = true; setTimeout(() => { paused = false; }, 6000); }));
              updateDots();
            }}
          >
            <div data-carousel-track className="flex transition-transform duration-700 ease-out">
              {[
                {
                  quote: "We stopped fixing Excel exports manually. This saved us hours every week.",
                  role: "Head of Operations",
                  context: "B2B SaaS — CRM exports, 20+ columns",
                },
                {
                  quote: "Our CRM export has 28 columns. fitforpdf turns it into something I can actually send to clients.",
                  role: "Account Manager",
                  context: "B2B SaaS — HubSpot/Salesforce exports",
                },
                {
                  quote: "I used to spend 45 minutes reformatting every quarterly report. Now it takes 10 seconds.",
                  role: "Senior Auditor",
                  context: "Big 4 advisory — quarterly compliance reports",
                },
              ].map((t, i) => (
                <blockquote key={i} className="w-full shrink-0 px-2">
                  <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
                    <p className="text-lg leading-relaxed text-[var(--color-text)] font-serif italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-auto">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{t.role}</p>
                      <p className="text-xs text-muted">{t.context}</p>
                    </div>
                  </div>
                </blockquote>
              ))}
            </div>
            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-4 w-full">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  data-dot
                  type="button"
                  aria-label={`Testimonial ${i + 1}`}
                  className="h-2 w-2 rounded-full bg-[var(--color-text)] transition-all duration-300"
                  style={{ opacity: i === 0 ? 1 : 0.3 }}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* BLOC 4 — How it works: staggered reveal on scroll */}
      <Section id="how-it-works" index={4} bg="bg-hero" className="py-16 sm:py-20">
        <div className="space-y-10">
          <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
            {LANDING_COPY.howItWorksTitle}
          </h2>
          <div
            className="flex flex-col sm:flex-row gap-6 max-w-tight mx-auto"
            ref={(el) => {
              if (!el || el.dataset.stepsObserved) return;
              el.dataset.stepsObserved = '1';
              const cards = el.querySelectorAll('[data-step-card]');
              if (!cards.length) return;
              cards.forEach((c) => { c.style.opacity = '0'; c.style.transform = 'translateY(24px) scale(0.97)'; });
              const obs = new IntersectionObserver(
                ([e]) => {
                  if (!e.isIntersecting) return;
                  cards.forEach((c, idx) => {
                    setTimeout(() => {
                      c.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
                      c.style.opacity = '1';
                      c.style.transform = 'translateY(0) scale(1)';
                    }, idx * 200);
                  });
                  obs.disconnect();
                },
                { threshold: 0.15 },
              );
              obs.observe(el);
            }}
          >
            {LANDING_COPY.howItWorksSteps.map((step, i) => (
              <div key={i} data-step-card className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center space-y-3 sm:flex-1">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{i + 1}</span>
                <h3 className="text-base font-semibold text-[var(--color-text)]">{step.title}</h3>
                <p className="text-sm text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button variant="accent" href="#generate" onClick={handleHeroGenerateClick}>
              {LANDING_COPY.howItWorksCta}
            </Button>
            <span className="text-xs text-muted">{LANDING_COPY.howItWorksPriceNudge}</span>
          </div>
        </div>
      </Section>

      {/* Pricing plans — full width */}
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
        <div className="relative z-10 mx-auto max-w-wide px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col gap-5 lg:flex-row">
            {/* Card 1 — ROI Calculator */}
            <div className="apple-grid-card flex flex-col p-6 sm:p-8 lg:flex-1">
              {/* Card header label */}
              <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-600 tracking-wide uppercase">
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
                    <span className="text-sm font-medium text-white/60">
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
            <div className="apple-grid-card flex flex-col p-6 sm:p-8 lg:flex-1">
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
                <p className="mt-2 text-sm text-white/60">
                  One API call. CSV or XLSX in, readable PDF out.
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

      {/* Comparison table — SEO + deep scrollers */}
      <Section id="comparison" index={7} bg="bg-hero">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
              Excel PDF Export vs fitforpdf
            </h2>
            <p className="mt-3 text-base text-muted max-w-xl mx-auto">
              Stop fighting print settings. Get a presentable structured PDF in seconds.
            </p>
          </div>
          {/* Mobile: stacked cards */}
          <div className="flex flex-col gap-4 sm:hidden">
            {COMPARISON_ROWS.map(([feature, excel, fitforpdf]) => (
              <div key={feature} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 space-y-2">
                <p className="text-sm font-semibold text-[var(--color-text)]">{feature}</p>
                <div className="flex items-start gap-2 text-sm text-muted">
                  <span className="shrink-0 text-red-600/60">✗</span>
                  <span>{excel}</span>
                </div>
                <div className="flex items-start gap-2 text-sm font-medium text-[var(--color-text)]">
                  <span className="shrink-0 text-emerald-700">✓</span>
                  <span>{fitforpdf}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-hero)]">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted lg:px-6">Feature</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted lg:px-6">Excel PDF Export</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-blue-600 lg:px-6">fitforpdf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {COMPARISON_ROWS.map(([feature, excel, fitforpdf], i) => (
                  <tr key={feature} className={i % 2 === 1 ? 'bg-[var(--color-bg-hero)]/60' : ''}>
                    <td className="px-5 py-3.5 text-sm font-medium text-[var(--color-text)] lg:px-6">{feature}</td>
                    <td className="px-5 py-3.5 text-sm text-muted lg:px-6"><span className="mr-1.5 text-red-600/60">✗</span>{excel}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[var(--color-text)] lg:px-6"><span className="mr-1.5 text-emerald-700">✓</span>{fitforpdf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Use cases */}
      <Section id="use-cases" index={8} bg="bg-hero">
        <UseCaseCards />
      </Section>

      <Section
        id="home-faq"
        index={9}
        bg="bg-hero"
        maxWidth="max-w-content"
        className="py-16 sm:py-20"
        testId="faq-section"
      >
        <div className="space-y-10">
          <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
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

      <section
        id="final-cta"
        data-testid="final-cta-section"
        className="relative overflow-hidden py-20 sm:py-28"
      >
        {/* Blue wave background image */}
        <img
          src="/sneusch_Aerial_view_of_abstract_topographic_landscape_made_en_c6b5be1f-30a1-4261-a956-b2fb5fa4d46e_0.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#0a1628]/70" />
        <div className="relative z-10 mx-auto max-w-2xl text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Your export is done.<br />The cleanup shouldn&apos;t be.
          </h2>
          <p className="mt-4 text-lg text-white/70">{LANDING_COPY.finalCtaCopy}</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="primary"
              href="#generate"
              onClick={handleHeroGenerateClick}
            >
              {LANDING_COPY.finalCtaLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 opacity-70" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
            <a
              href="/sample-output.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-1.5 justify-center rounded-full border px-5 text-sm font-semibold transition duration-150 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              See a sample PDF
            </a>
          </div>
        </div>
      </section>

      <FeedbackBar renderId={conversion.renderId} visible={Boolean(conversion.pdfBlob)} />

      <StickyMobileCTA />

      {/* Lightbox for product image */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-label="Product image preview"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <img
            src="/fitforpdf_product@2x.png"
            alt="Excel spreadsheet transformed into a structured PDF by fitforpdf"
            className="w-full max-h-[90vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
