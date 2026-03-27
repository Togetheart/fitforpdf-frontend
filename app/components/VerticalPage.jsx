import React from 'react';
import PageHero from './PageHero';
import Section from './ui/Section';
import Button from './ui/Button';

export default function VerticalPage({
  vertical,
  headline,
  subheadline,
  painPoints,
  benefits,
  ctaText = 'Try it free',
  productImage = '/fitforpdf_product@2x.png',
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* ── Hero ── */}
      <PageHero
        variant="home"
        eyebrow={vertical}
        title={headline}
        subtitle={subheadline}
        height="min-h-[320px] sm:min-h-[400px]"
        align="center"
        titleClassName="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08] max-w-[22ch] mx-auto"
        subtitleClassName="max-w-[48ch] mx-auto"
      >
        <Button variant="primary" href="/#upload" className="mt-2">
          {ctaText}
        </Button>
      </PageHero>

      {/* ── Product visual ── */}
      {productImage && (
        <Section id="product-visual" bg="bg-hero" className="py-8 sm:py-12">
          <div className="mx-auto max-w-4xl">
            <img
              src={productImage}
              alt="Excel spreadsheet transformed into a clean, structured PDF by fitforpdf"
              className="w-full rounded-2xl border border-[var(--color-border)] shadow-lg"
              loading="lazy"
            />
          </div>
        </Section>
      )}

      {/* ── Pain points ── */}
      <Section id="pain-points" bg="bg-hero">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          The problem
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((point, i) => (
            <li
              key={i}
              className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6"
            >
              <span className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
                {point.title}
              </span>
              <span className="text-sm leading-relaxed text-[var(--color-muted)]">
                {point.description}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Benefits / solution ── */}
      <Section id="benefits">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          How fitforpdf solves it
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => (
            <li
              key={i}
              className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6"
            >
              <span className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
                {benefit.title}
              </span>
              <span className="text-sm leading-relaxed text-[var(--color-muted)]">
                {benefit.description}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Final CTA ── */}
      <Section id="cta" bg="bg-hero">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to fix your PDF exports?
          </h2>
          <p className="max-w-[48ch] text-base leading-relaxed text-[var(--color-muted)]">
            Upload your spreadsheet and get a clean, paginated PDF in seconds.
            No signup required.
          </p>
          <Button variant="primary" href="/#upload">
            {ctaText}
          </Button>
        </div>
      </Section>
    </div>
  );
}
