'use client';

import React from 'react';
import PageHero from './PageHero';
import Section from './ui/Section';
import Button from './ui/Button';

const ALL_COMPARISONS = [
  { label: 'fitforpdf vs Puppeteer', href: '/vs-puppeteer' },
  { label: 'fitforpdf vs wkhtmltopdf', href: '/vs-wkhtmltopdf' },
  { label: 'fitforpdf vs ReportLab', href: '/vs-reportlab' },
];

const LINK_STYLE = 'text-sm font-medium text-[var(--color-text)] underline underline-offset-4 decoration-1 transition-colors hover:text-cta';

export default function VsPage({
  tool,
  toolDescription,
  comparisonRows,
  prosAndCons,
  ctaText = 'Try fitforpdf free',
}) {
  const otherComparisons = ALL_COMPARISONS.filter((c) => !c.label.includes(tool));
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Hero */}
      <PageHero
        variant="sub"
        align="center"
        title={`fitforpdf vs ${tool}`}
        subtitle={toolDescription}
        height="min-h-[280px] sm:min-h-[340px]"
      />

      {/* Comparison table */}
      <Section id="comparison" index={0} bg="bg-hero">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
              Feature comparison
            </h2>
            <p className="mt-3 text-base text-muted max-w-xl mx-auto">
              See how fitforpdf compares to {tool} for converting spreadsheets to PDF.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-hero)]">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)] lg:px-6">
                    Feature
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)] lg:px-6">
                    {tool}
                  </th>
                  <th className="bg-[var(--color-bg)] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-cta lg:px-6">
                    fitforpdf
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {comparisonRows.map(([feature, toolVal, fitforpdfVal], i) => (
                  <tr
                    key={feature}
                    className={`transition-colors hover:bg-[var(--color-bg-hero)] ${i % 2 === 1 ? 'bg-[var(--color-bg-hero)]/60' : ''}`}
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-[var(--color-text)] lg:px-6">
                      {feature}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[var(--color-muted)] lg:px-6">
                      <span className="mr-1.5 text-red-400/60">&#x2717;</span>
                      {toolVal}
                    </td>
                    <td className="bg-[var(--color-bg)] px-5 py-3.5 text-sm font-semibold text-[var(--color-text)] lg:px-6">
                      <span className="mr-1.5 text-emerald-500">&#x2713;</span>
                      {fitforpdfVal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Pros & Cons of the competing tool */}
      <Section id="pros-cons" index={1} bg="bg-hero">
        <div className="space-y-8">
          <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
            {tool} at a glance
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 max-w-tight mx-auto">
            {/* Pros */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-emerald-600">
                Strengths
              </p>
              <ul className="space-y-2.5">
                {prosAndCons.pros.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[var(--color-text)]">
                    <span className="mt-0.5 flex-none text-emerald-500" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-hero)] p-6 space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-red-500">
                Limitations
              </p>
              <ul className="space-y-2.5">
                {prosAndCons.cons.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[var(--color-muted)]">
                    <span className="mt-0.5 flex-none text-red-400/60" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

      {/* See also — other comparisons & links */}
      <Section id="see-also" index={2} bg="bg-hero">
        <div className="space-y-6">
          <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)]">
            Other comparisons
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {otherComparisons.map((c) => (
              <a
                key={c.href}
                href={c.href}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-text)]/20 hover:shadow-sm"
              >
                {c.label} →
              </a>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2">
            <a href="/developers" className={LINK_STYLE}>API documentation</a>
            <a href="/pricing" className={LINK_STYLE}>Pricing</a>
            <a href="/for-saas" className={LINK_STYLE}>For SaaS products</a>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section id="vs-cta" index={3} bg="bg-hero" className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
            Ready to switch?
          </h2>
          <p className="mt-4 text-lg text-muted">
            Upload a file and get a structured PDF in seconds. No setup, no dependencies.
          </p>
          <Button variant="primary" href="/#generate" className="mt-8">
            {ctaText}
          </Button>
        </div>
      </Section>
    </div>
  );
}
