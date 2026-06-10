'use client';

import React from 'react';
import {
  LANDING_COPY,
  LANDING_COPY_KEYS,
  HOME_FAQ,
} from './siteCopy.mjs';
import Accordion from './components/Accordion';
import Section from './components/ui/Section';
import PricingToggleSection from './components/PricingToggleSection';
import PageHero from './components/PageHero';
import HeroHeadline from './components/HeroHeadline';
import Button from './components/ui/Button';
import ProofShowcase from './components/ProofShowcase';
import { JsonLd } from './components/JsonLd';
import Image from 'next/image';

import StickyMobileCTA from './components/StickyMobileCTA';
import { captureRefAttribution } from './lib/refAttribution.mjs';

const CTA_SECONDARY = 'inline-flex h-11 items-center gap-1.5 justify-center rounded-full border px-5 text-sm font-semibold transition duration-150 border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:border-[var(--color-border)] hover:bg-[var(--color-bg-hero)]';

const COMPARISON_ROWS = [
  ['Wide columns', 'Cut off or unreadable', 'Grouped into sections'],
  ['Layout', 'Manual configuration', 'Auto-structured'],
  ['Page breaks', 'Unpredictable splits', 'Automatic pagination'],
  ['Reference columns', 'Lost after first pages', 'Repeated automatically'],
  ['Overview', 'None', 'Navigate between sections instantly'],
  ['Result', 'Spreadsheet-like output', 'Readable, send-ready document'],
];


// Sticky trust ticker removed; homepage avoids unverified social-credibility claims.

function EarlyWorkflowFeedback() {
  return (
    <Section
      id="early-feedback"
      index={6}
      bg="bg-hero"
      maxWidth="max-w-content"
      className="py-10 sm:py-14"
      testId="early-feedback-section"
    >
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
          Early workflow feedback
        </p>
        <blockquote className="mt-4 text-xl font-semibold leading-snug tracking-tight text-[var(--color-text)] sm:text-2xl">
          &ldquo;The export often isn&apos;t truly client-ready, so there&apos;s usually a manual cleanup step before I can send it out.&rdquo;
        </blockquote>
        <div className="mt-5 flex flex-col gap-1 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Magdalena, spreadsheet/accounting workflow feedback
          </p>
          <p>
            Cut-off columns, awkward page breaks, and layout shifts were the recurring pain.
          </p>
        </div>
      </div>
    </Section>
  );
}

export default function Page() {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  /* Store promo code from ?ref= param (betalist, microlaunch, etc.) and pin
     channel attribution (S1 funnel: hn/ph/li/compta/mcp tagged links land on
     the home too — the visit must be attributable even before /app opens). */
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = (params.get('ref') || '').trim().toLowerCase();
      const REF_TO_PROMO = { microlaunch: 'MICROLAUNCH', betalist: 'BETALIST5', free3: 'FREE3' };
      const promo = REF_TO_PROMO[ref];
      if (promo) localStorage.setItem('ffp_promo', promo);
    } catch {}
    captureRefAttribution();
  }, []);

  // S1 sprint (2026-06-10): every generate CTA now routes to the /app
  // workbench. The V1 inline engine is gone from the home — the landing
  // sells, /app converts. See the sprint design doc (gstack projects).
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
      {/* S1 product-first hero (2026-06-10): static flow, no sticky scroll
          sequence. The 2026 conversion pattern for a B2B utility is "product
          visible immediately" (Linear/Stripe-style): headline + category
          subline + CTAs + the workbench shot in the same first impression.
          The bracket morph (phase 1) still plays as you scroll past. */}
      <div>
        <PageHero
          heroTestId="hero-section"
          variant="home"
          align="center"
          height="h-auto"
          title={<HeroHeadline />}
          contentClassName="items-center justify-center gap-4 sm:gap-8 text-center !pt-10 !pb-0 sm:!pt-16 sm:!pb-0"
          contentMaxWidthClassName="max-w-content"
          className="py-0 w-full"
        >
          {/* Subtitle, stays visible throughout */}
          <p className="hero-headline-line w-full max-w-3xl mx-auto text-base sm:text-lg text-muted">
            {LANDING_COPY.heroSubheadlineL2a}<br />{LANDING_COPY.heroSubheadlineL2b}
          </p>

          {/* Hero CTA, stays visible throughout */}
          <div className="hero-headline-line flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="accent"
                href="/app"
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
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-[var(--color-muted)]">
                {LANDING_COPY.heroMicrocopyFree}
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                {LANDING_COPY.heroFileCompat}
              </span>
            </div>
          </div>

          {/* Product shot, desktop: statically visible at load (product-first
              hero). No data-hero-comparison attribute = HeroHeadline phase 2
              stays dormant; re-add the attribute to A/B the old scroll
              reveal. Mobile keeps its own block below the hero. */}
          <div className="hidden sm:block w-full">
            <div className="flex flex-col items-center pt-4 pb-12">
              {/* The shot itself converts (Cursor/Lovable pattern: the hero
                  product visual is a door, not a poster). */}
              <a
                href="/app"
                aria-label="Open the fitforpdf workbench"
                className="block w-full max-w-[960px] overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-[0_28px_64px_-28px_rgba(15,23,42,0.28)] transition hover:shadow-[0_32px_72px_-28px_rgba(15,23,42,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
              >
                <Image
                  src="/workbench-light.png"
                  alt="The fitforpdf workbench: a wide CSV rendered as a sectioned PDF, with section colors, custom column groups and rename controls"
                  width={1512}
                  height={743}
                  className="w-full block"
                  sizes="960px"
                  priority
                />
              </a>
            </div>
          </div>
        </PageHero>
      </div>

      {/* Mobile only: product image, scroll-driven reveal like desktop */}
      <div
        className="sm:hidden pb-6 px-4 -mt-8 relative z-10 bg-[var(--color-bg-hero)]"
      >
        <div
          className="flex flex-col items-center gap-4"
          style={{ opacity: 0, transform: 'translateY(16px)' }}
          ref={(el) => {
            if (!el || el.dataset.mobileImgInit) return;
            el.dataset.mobileImgInit = '1';
            let firstScroll = false;
            const handler = () => {
              if (firstScroll) return;
              firstScroll = true;
              setTimeout(() => {
                el.style.animation = 'mobileImgReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards';
              }, 100);
              window.removeEventListener('scroll', handler);
            };
            window.addEventListener('scroll', handler, { passive: true });
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block w-full overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm cursor-zoom-in"
            aria-label="View full-size product image"
          >
            <Image
              src="/workbench-light.png"
              alt="The fitforpdf workbench: a wide CSV rendered as a sectioned PDF, with section colors, custom column groups and rename controls"
              width={1512}
              height={743}
              className="w-full block"
              sizes="100vw"
            />
          </button>
        </div>
      </div>

      {/* Visual demo, moved before the upload for "proof first" flow.
          NOTE: bypasses the generic <Section> wrapper because Section's
          baked-in `py-10 sm:py-14` on its inner div added 100+px of unwanted
          trailing whitespace after ProofShowcase. We render the section
          directly with tight bottom padding so the dark upload section sits
          immediately below the features grid (was a 367px white void). */}
      <section
        id={LANDING_COPY_KEYS.beforeAfter}
        data-testid={`section-${LANDING_COPY_KEYS.beforeAfter}`}
        className="bg-[var(--color-bg-hero)] relative z-10 pt-12 sm:pt-16"
      >
        <div className="mx-auto flex w-full flex-col gap-8 max-w-wide px-4 sm:px-6 lg:px-10 xl:px-12">
          <ProofShowcase />
        </div>
      </section>

      {/* Featured on, BetaList badge — placed AFTER the proof section so the
          social-proof pill never wins the attention duel against the product
          shot in the hero (S1 product-first reorder, 2026-06-10). */}
      <div className="w-full py-6 relative z-10 bg-[var(--color-bg-hero)] flex items-center justify-center">
        <a
          href="https://betalist.com/startups/fitforpdf?utm_campaign=badge-fitforpdf&utm_medium=badge&utm_source=badge-featured"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="fitforpdf featured on BetaList"
          className="inline-block transition-opacity hover:opacity-80"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://betalist.com/badges/featured?id=154574&theme=dark"
            alt="fitforpdf - Upload your spreadsheet and get a PDF you can actually send | BetaList"
            width="188"
            height="54"
            loading="lazy"
          />
        </a>
      </div>

      {/* V1 inline upload tool REMOVED (2026-06-10, sprint S1): the landing
          no longer embeds the conversion engine. Every generate CTA routes to
          the /app workbench, which carries the full inspector (grouping,
          custom sections, rename/color/reorder, title, Pro branding) plus the
          sample sandbox. Rationale: 100% of visitors used to hit this
          inspector-less V1 surface — including the ICP tester whose "no
          control over grouping/sections" feedback drove V2. One engine, one
          surface, one funnel. (Also drops useQuota/useConversion from the
          landing bundle.) */}
      {/* Lead-capture modal removed (2026-06-07): over 90 days it was shown 9× and
          captured 0 emails (backend was a stub), while interrupting the high-intent
          moment right after a successful render. Re-introduce later as a non-blocking
          ask (e.g. an inline field at download) if retention work resumes. */}

      {/* Comparison table, explains the replacement before asking for money. */}
      <Section id="comparison" index={4} bg="bg-hero">
        <div className="space-y-10">
          <div className="text-center">
            <div className="mx-auto mb-5 h-px w-12 bg-[#0F172A]/20" aria-hidden="true" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
              Excel PDF Export vs fitforpdf
            </h2>
            <div className="relative mx-auto mt-6 max-w-[58ch]">
              <p className="text-left text-[15.5px] leading-[1.75] text-[var(--color-text)]">
                Spreadsheets are built for machines, not readers. fitforpdf re-typesets a wide
                export into a paginated PDF, anchor columns repeated on every page, an automatic
                table of contents, and nothing cut off.
              </p>
              {/* Margin note (marginalia): in the left gutter on wide screens, stacks
                  below the lede on smaller ones so the annotation is never lost. */}
              <aside className="mt-3 text-left text-[11.5px] italic leading-snug text-[var(--color-muted)] xl:absolute xl:right-full xl:top-1.5 xl:mr-7 xl:mt-0 xl:w-[150px] xl:text-right">
                Anchor columns repeat on every page, a row never loses its id or name.
              </aside>
            </div>
          </div>
          {/* Serif key figures, the trust pillars set as editorial numerals, split by thin ink rules. */}
          <div className="mx-auto grid max-w-xl grid-cols-3 divide-x divide-[#0F172A]/10 text-center">
            <div className="px-2">
              <div className="text-[34px] font-bold leading-none text-[var(--color-text)]">0</div>
              <div className="mt-1.5 text-[11.5px] leading-snug text-muted">files stored, ever</div>
            </div>
            <div className="px-2">
              <div className="text-[34px] font-bold leading-none text-[var(--color-text)]">0</div>
              <div className="mt-1.5 text-[11.5px] leading-snug text-muted">LLM in the data path</div>
            </div>
            <div className="px-2">
              <div className="text-[34px] font-bold leading-none text-[var(--color-text)]">EU</div>
              <div className="mt-1.5 text-[11.5px] leading-snug text-muted">hosted</div>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:hidden">
            {COMPARISON_ROWS.map(([feature, excel, fitforpdf]) => (
              <div key={feature} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 space-y-2">
                <p className="text-sm font-semibold text-[var(--color-text)]">{feature}</p>
                <div className="flex items-start gap-2 text-sm text-muted">
                  <span className="shrink-0 text-red-600/60">x</span>
                  <span>{excel}</span>
                </div>
                <div className="flex items-start gap-2 text-sm font-medium text-[var(--color-text)]">
                  <span className="shrink-0 text-emerald-700">✓</span>
                  <span>{fitforpdf}</span>
                </div>
              </div>
            ))}
          </div>
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
                    <td className="px-5 py-3.5 text-sm text-muted lg:px-6"><span className="mr-1.5 text-red-600/60">x</span>{excel}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[var(--color-text)] lg:px-6"><span className="mr-1.5 text-emerald-700">✓</span>{fitforpdf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Pricing plans, full width */}
      <Section
        id={LANDING_COPY_KEYS.pricingPreview}
        index={6}
        maxWidth="max-w-wide"
        bg="bg-hero"
      >
        <PricingToggleSection showFreeTier />
      </Section>

      <EarlyWorkflowFeedback />

      <Section
        id="home-faq"
        index={9}
        bg="bg-hero"
        maxWidth="max-w-content"
        className="py-16 sm:py-20"
        testId="faq-section"
      >
        <div className="space-y-10">
          <div>
            <div className="mx-auto mb-5 h-px w-12 bg-[#0F172A]/20" aria-hidden="true" />
            <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
              Frequently asked questions
            </h2>
          </div>
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
        <Image
          src="/cta-background.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          quality={45}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0a1628]/70" />
        <div className="relative z-10 mx-auto max-w-2xl text-center px-4">
          <div className="mx-auto mb-5 h-px w-12 bg-white/25" aria-hidden="true" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Your export is done.<br />The cleanup shouldn&apos;t be.
          </h2>
          <p className="mt-4 text-lg text-white/70">{LANDING_COPY.finalCtaCopy}</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="primary"
              href="/app"
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
          <div className="relative w-full max-h-[90vh] aspect-[1512/743]" onClick={(e) => e.stopPropagation()}>
            <Image
              src="/workbench-light.png"
              alt="The fitforpdf workbench: a wide CSV rendered as a sectioned PDF, with section colors, custom column groups and rename controls"
              fill
              className="rounded-xl object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
