import React from 'react';
import { JsonLd } from '../components/JsonLd';
import { SEO } from '../siteCopy.mjs';

export const metadata = {
  title: 'About — fitforpdf',
  description:
    'About FitForPDF — PDF rendering infrastructure for wide business tables. Built by Sébastien Neusch.',
  alternates: { canonical: '/about' },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SEO.siteUrl },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'About',
      item: `${SEO.siteUrl}/about`,
    },
  ],
};

const BIOFOR_LINKS = [
  {
    label: 'FitForPDF — Organization profile',
    href: 'https://www.biofor.ai/org/fitforpdf',
  },
  {
    label: 'FitForPDF — LLM-readable profile',
    href: 'https://www.biofor.ai/llm/org/fitforpdf',
  },
  {
    label: 'Sébastien Neusch — Founder profile',
    href: 'https://www.biofor.ai/sebastienneusch',
  },
  {
    label: 'Sébastien Neusch — LLM-readable profile',
    href: 'https://www.biofor.ai/sebastienneusch/llm',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <JsonLd data={breadcrumbLd} />

      {/* Header */}
      <div className="mb-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          About
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl">
          About FitForPDF
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
          FitForPDF is a PDF rendering engine purpose-built for wide business
          tables. It automatically splits large Excel and CSV exports into
          clean, readable PDF sections — so teams can share data without
          broken layouts or cut-off columns.
        </p>
      </div>

      {/* Founder */}
      <section className="border-t border-[var(--color-border)] pt-8 mb-10">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Founder
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          FitForPDF is built by Sébastien Neusch. Based in France, he focuses
          on developer tools and data infrastructure for business workflows.
        </p>
      </section>

      {/* Canonical AI profiles */}
      <section className="border-t border-[var(--color-border)] pt-8 mb-10">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Canonical AI profiles
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--color-muted)]">
          These are the verified, machine-readable identity references for
          FitForPDF and its founder.
        </p>
        <ul className="space-y-2">
          {BIOFOR_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--color-text)] underline underline-offset-4 decoration-1 transition-colors hover:text-cta"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Contact */}
      <section className="border-t border-[var(--color-border)] pt-8">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Contact
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          For questions, partnerships, or support, visit the{' '}
          <a
            href="/contact"
            className="font-medium text-[var(--color-text)] underline underline-offset-4 decoration-1 transition-colors hover:text-cta"
          >
            contact page
          </a>
          .
        </p>
      </section>
      </div>
    </main>
  );
}
