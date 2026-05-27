import React from 'react';
import { JsonLd } from './JsonLd';
import { SEO } from '../siteCopy.mjs';

/**
 * Generic SEO-article layout.
 *
 * Used by the long-tail SEO pages (e.g. /excel-print-area-too-wide-pdf).
 * Mirrors the structure of /excel-to-pdf-columns-cut-off (the page that
 * already ranks + has 0% bounce) so we have a known-good template.
 *
 * Props:
 *   article: {
 *     slug, title, description, h1, lead,
 *     sections: [{ h2, body?, list? }],
 *     faqs: [{ q, a }],
 *     related: [{ label, href }],
 *     cta: { title, body, label },
 *     eyebrow?: string,
 *   }
 */
export default function SeoArticle({ article }) {
  const url = `${SEO.siteUrl}/${article.slug}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url,
    publisher: { '@type': 'Organization', name: 'fitforpdf', url: SEO.siteUrl },
  };

  const faqLd = article.faqs && article.faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }
    : null;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SEO.siteUrl },
      { '@type': 'ListItem', position: 2, name: article.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-hero)]">
      <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
        <JsonLd data={articleLd} />
        {faqLd ? <JsonLd data={faqLd} /> : null}
        <JsonLd data={breadcrumbLd} />

        {article.eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
            {article.eyebrow}
          </p>
        ) : null}

        <h1 className="mb-6 text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-4xl">
          {article.h1}
        </h1>
        <p className="mb-10 text-base leading-relaxed text-[var(--color-muted)]">
          {article.lead}
        </p>

        {article.sections.map((section, i) => (
          <section key={`${section.h2}-${i}`}>
            <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">
              {section.h2}
            </h2>
            {section.body ? (
              <p className="mb-6 leading-relaxed text-[var(--color-muted)]">
                {section.body}
              </p>
            ) : null}
            {section.list ? (
              <ul className="mb-8 list-disc space-y-1 pl-6 leading-relaxed text-[var(--color-muted)]">
                {section.list.map((li, j) => (
                  <li key={`${section.h2}-li-${j}`}>{li}</li>
                ))}
              </ul>
            ) : (
              <div className="mb-8" />
            )}
          </section>
        ))}

        {article.faqs && article.faqs.length > 0 ? (
          <section data-testid="seo-faq" className="mb-12 border-t border-[var(--color-border)]">
            <h2 className="py-6 text-xl font-semibold text-[var(--color-text)]">
              Frequently asked questions
            </h2>
            <div className="divide-y divide-[var(--color-border)]">
              {article.faqs.map(({ q, a }) => (
                <div key={q} className="py-5">
                  <h3 className="mb-1 font-semibold text-[var(--color-text)]">{q}</h3>
                  <p className="leading-relaxed text-[var(--color-muted)]">{a}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {article.related && article.related.length > 0 ? (
          <nav className="mb-12 border-t border-[var(--color-border)] pt-8">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
              Related guides
            </h2>
            <ul className="space-y-2 text-sm">
              {article.related.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-cta)]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <section data-testid="seo-cta" className="rounded-2xl bg-[var(--color-bg-hero)] px-6 py-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
            {article.cta.title}
          </h2>
          <p className="mb-5 text-[var(--color-muted)]">{article.cta.body}</p>
          <a
            href="/#generate"
            className="inline-block rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
          >
            {article.cta.label}
          </a>
        </section>
      </div>
    </div>
  );
}

/**
 * Helper: build a Next.js `metadata` export from an article entry.
 * Usage in a page.jsx: `export const metadata = articleMetadata(myArticle);`
 */
export function articleMetadata(article) {
  const url = `${SEO.siteUrl}/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}
