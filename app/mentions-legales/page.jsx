import React from 'react';

export const metadata = {
  title: 'Legal Notice, fitforpdf',
  description: "Legal notice for fitforpdf, pursuant to French law n°2004-575 of 21 June 2004 on confidence in the digital economy.",
  alternates: {
    canonical: '/mentions-legales',
    languages: { 'fr': '/mentions-legales' },
  },
  openGraph: {
    title: 'Legal Notice, fitforpdf',
    description: 'Legal notice for fitforpdf.',
    url: 'https://www.fitforpdf.com/mentions-legales',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal Notice, fitforpdf',
    description: 'Legal notice for fitforpdf.',
  },
};

function Clause({ title, children }) {
  return (
    <section className="border-t border-[var(--color-border)] pt-8 mb-10">
      <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--color-muted)]">{children}</div>
    </section>
  );
}

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">

      {/* Header */}
      <div className="mb-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Legal
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl">
          Legal Notice
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
          Pursuant to French law n°2004-575 of 21 June 2004 on confidence in the digital economy.
        </p>
      </div>

      <Clause title="Publisher">
        <p>
          <span className="font-[500] text-[var(--color-text)]">Publication manager:</span>{' '}
          Sébastien Neusch
        </p>
        <p>
          <span className="font-[500] text-[var(--color-text)]">Status:</span>{' '}
          CEO, SASU BLVTR
        </p>
        <p>
          <span className="font-[500] text-[var(--color-text)]">Contact:</span>{' '}
          <a href="/contact" className="underline decoration-[var(--color-border)] underline-offset-2 transition hover:text-[var(--color-text)]">
            hello@fitforpdf.com
          </a>
        </p>
      </Clause>

      <Clause title="Hosting">
        <p>
          <span className="font-[500] text-[var(--color-text)]">Host:</span>{' '}
          OVH SAS
        </p>
        <p>
          <span className="font-[500] text-[var(--color-text)]">Registered office:</span>{' '}
          2 rue Kellermann, 59100 Roubaix, France
        </p>
        <p>
          <span className="font-[500] text-[var(--color-text)]">Website:</span>{' '}
          <a href="https://www.ovhcloud.com" target="_blank" rel="noreferrer" className="underline decoration-[var(--color-border)] underline-offset-2 transition hover:text-[var(--color-text)]">
            ovhcloud.com
          </a>
        </p>
        <p>Files and data are processed on servers located in France (European Union).</p>
      </Clause>

      <Clause title="Intellectual property">
        <p>
          All content on this site (text, visuals, code, fitforpdf brand) is protected by intellectual
          property law. Any reproduction, even partial, is prohibited without prior written authorisation.
        </p>
      </Clause>

      <Clause title="Personal data">
        <p>
          The processing of personal data is described in our{' '}
          <a href="/privacy" className="underline decoration-[var(--color-border)] underline-offset-2 transition hover:text-[var(--color-text)]">
            privacy policy
          </a>
          , in compliance with GDPR (EU) 2016/679.
        </p>
        <p>
          To exercise your rights or for any data-related enquiry:{' '}
          <a href="/contact" className="underline decoration-[var(--color-border)] underline-offset-2 transition hover:text-[var(--color-text)]">
            support@fitforpdf.com
          </a>
        </p>
      </Clause>

      <Clause title="Governing law">
        <p>
          This site is governed by French law. Any dispute relating to the use of the site
          falls under the exclusive jurisdiction of French courts.
        </p>
      </Clause>

      <p className="mt-4 text-xs text-[var(--color-muted)]/50">Last updated: March 2025</p>

    </div>
  );
}
