import React from 'react';
import { JsonLd } from '../components/JsonLd';
import { SEO } from '../siteCopy.mjs';
import { makeUtm, UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN } from '../lib/utm.mjs';

export const metadata = {
  title: 'About, fitforpdf',
  description:
    'Why FitForPDF exists, who built it, and what makes it different from a generic PDF library or an LLM wrapper.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About, fitforpdf',
    description:
      'PDF rendering infrastructure for wide business tables. Built by Sébastien Neusch under BLVTR SASU (France).',
    url: 'https://www.fitforpdf.com/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About, fitforpdf',
    description:
      'PDF rendering infrastructure for wide business tables. Built by Sébastien Neusch under BLVTR SASU (France).',
  },
};

// Tag all cross-property and social links from /about with utm_campaign=about
// so PostHog stops counting return clicks to biofor.ai / LinkedIn as "Direct".
const aboutUtm = makeUtm({
  medium: UTM_MEDIUM.referral,
  campaign: UTM_CAMPAIGN.about,
});

const BIOFOR_LINKS = [
  {
    label: 'FitForPDF, Organization profile',
    href: 'https://www.biofor.ai/org/fitforpdf',
    source: 'biofor',
  },
  {
    label: 'FitForPDF, LLM-readable profile',
    href: 'https://www.biofor.ai/llm/org/fitforpdf',
    source: 'biofor',
  },
  {
    label: 'Sébastien Neusch, Founder profile',
    href: 'https://www.biofor.ai/sebastienneusch',
    source: 'biofor',
  },
  {
    label: 'Sébastien Neusch, LLM-readable profile',
    href: 'https://www.biofor.ai/sebastienneusch/llm',
    source: 'biofor',
  },
];

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

const aboutPageLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: `${SEO.siteUrl}/about`,
  mainEntity: {
    '@type': 'Organization',
    name: 'FitForPDF',
    url: SEO.siteUrl,
    founder: {
      '@type': 'Person',
      name: 'Sébastien Neusch',
      url: 'https://www.linkedin.com/in/sebastienneusch/',
    },
    description:
      'PDF rendering infrastructure for wide business tables, deterministic, EU-hosted, no LLM.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
        <JsonLd data={breadcrumbLd} />
        <JsonLd data={aboutPageLd} />

        {/* Eyebrow + H1 */}
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          About
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl">
          Why FitForPDF exists.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-[var(--color-muted)]">
          Most &quot;Excel to PDF&quot; tools were built for documents, not for data.
          Feed them a 28-column CRM export or a quarterly audit sheet and the
          result is broken, columns cut off, microscopic fonts, page breaks
          landing mid-row. FitForPDF was built specifically to fix that.
        </p>

        {/* Founder note, photo placeholder slot + signed paragraph */}
        <section className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 sm:p-8">
          <div className="flex items-start gap-5">
            {/* Photo placeholder, drop a real square photo at /founder.webp later */}
            <div
              aria-hidden="true"
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-lg font-bold text-white"
            >
              SN
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Hi, I&apos;m Sébastien.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                I&apos;ve spent years working alongside operators, consultants,
                and finance teams. The same friction kept coming back: a
                spreadsheet that needs to leave the building, and a 30-minute
                cleanup ritual before it can. Shrink fonts. Adjust margins.
                Hide columns. Export. Curse. Re-export.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                FitForPDF removes that ritual. Upload the file you already
                have. Get a structured PDF you can actually send.
              </p>
            </div>
          </div>
        </section>

        {/* Mission / What we do */}
        <section className="mt-12 border-t border-[var(--color-border)] pt-10">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
            What FitForPDF does
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-[var(--color-muted)]">
            FitForPDF is a rendering engine purpose-built for wide business
            tables. It analyses the structure of your file, splits wide
            columns into readable sections, repeats reference columns on each
            section, and adds an overview page with jumpable links.
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            The same pipeline runs the web app and the developer API. No HTML
            templates, no headless Chrome, no LLM call. Just deterministic
            layout work, in milliseconds.
          </p>
        </section>

        {/* Principles */}
        <section className="mt-10 border-t border-[var(--color-border)] pt-10">
          <h2 className="mb-5 text-xl font-semibold text-[var(--color-text)]">
            How we build it
          </h2>
          <ul className="space-y-4 text-sm leading-relaxed text-[var(--color-muted)]">
            <li>
              <span className="font-semibold text-[var(--color-text)]">No LLM in the pipeline.</span>{' '}
              File content never leaves the server. No OpenAI, Anthropic, or
              Google API calls. The engine is 100% deterministic, same input,
              same PDF, every time.
            </li>
            <li>
              <span className="font-semibold text-[var(--color-text)]">Files deleted immediately.</span>{' '}
              Source files are removed after conversion. The generated PDF is
              served for 15 minutes, then gone. Nothing about your data sticks
              around.
            </li>
            <li>
              <span className="font-semibold text-[var(--color-text)]">EU-hosted.</span>{' '}
              Processing on OVH servers in France. Metadata on Supabase EU. No
              transfers outside the EU.
            </li>
            <li>
              <span className="font-semibold text-[var(--color-text)]">Built for the first try.</span>{' '}
              If a PDF looks broken once, the user won&apos;t come back.
              FitForPDF is engineered for the first export to be the one you
              send.
            </li>
          </ul>
        </section>

        {/* Founder + company */}
        <section className="mt-10 border-t border-[var(--color-border)] pt-10">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
            Founder &amp; company
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-[var(--color-muted)]">
            FitForPDF is built by{' '}
            <a
              href={aboutUtm('https://www.linkedin.com/in/sebastienneusch/', { source: UTM_SOURCE.linkedin })}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-text)] underline underline-offset-4 decoration-1 transition-colors hover:text-cta"
            >
              Sébastien Neusch
            </a>,
            a France-based builder focused on developer tools and data
            infrastructure for business workflows.
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            Operated by <strong className="font-semibold text-[var(--color-text)]">BLVTR SASU</strong>,
            a French SASU registered for software publishing and developer
            services.
          </p>
        </section>

        {/* Machine-readable identity */}
        <section className="mt-10 border-t border-[var(--color-border)] pt-10">
          <h2 className="mb-3 text-xl font-semibold text-[var(--color-text)]">
            Verified identity
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-[var(--color-muted)]">
            Machine-readable profiles for FitForPDF and its founder, useful
            for LLM-based citations and identity verification.
          </p>
          <ul className="space-y-2">
            {BIOFOR_LINKS.map(({ label, href, source }) => (
              <li key={href}>
                <a
                  href={aboutUtm(href, { source })}
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

        {/* CTA, strong, ends the page on action */}
        <section className="mt-12 rounded-2xl bg-[var(--color-bg-hero)] px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Stop reformatting spreadsheets by hand.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--color-muted)]">
            Upload the file you already have. Get a structured PDF in seconds.
            3 free exports, no account needed.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/app"
              className="inline-block rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
            >
              Try it free
            </a>
            <a
              href="/developers"
              className="text-sm font-medium text-[var(--color-text)] underline underline-offset-4 decoration-1 transition-colors hover:text-cta"
            >
              Or get a free API key →
            </a>
          </div>
        </section>

        {/* Secondary nav, quietly under the fold */}
        <nav className="mt-12 border-t border-[var(--color-border)] pt-8 text-sm text-[var(--color-muted)]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
            More
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><a href="/pricing" className="underline underline-offset-4 decoration-1 hover:text-[var(--color-text)]">Pricing</a></li>
            <li><a href="/developers" className="underline underline-offset-4 decoration-1 hover:text-[var(--color-text)]">API docs</a></li>
            <li><a href="/privacy" className="underline underline-offset-4 decoration-1 hover:text-[var(--color-text)]">Privacy</a></li>
            <li><a href="/contact" className="underline underline-offset-4 decoration-1 hover:text-[var(--color-text)]">Contact</a></li>
            <li>
              <a
                href={aboutUtm('https://chatgpt.com/g/g-69cab3c8703c819198473179392510ca-fitforpdf', { source: UTM_SOURCE.chatgpt, medium: UTM_MEDIUM.partner })}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-1 hover:text-[var(--color-text)]"
              >
                Ask the fitforpdf GPT ↗
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
