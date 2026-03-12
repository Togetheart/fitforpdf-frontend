import React from 'react';

export const metadata = {
  title: 'Legal Notice — fitforpdf',
  description: "Legal notice for fitforpdf, pursuant to French law n°2004-575 of 21 June 2004 on confidence in the digital economy.",
  alternates: {
    canonical: '/mentions-legales',
    languages: { 'fr': '/mentions-legales' },
  },
};

function Clause({ title, children }) {
  return (
    <section className="border-t border-black/10 pt-8 mb-10">
      <h2 className="mb-4 text-xl font-[650] text-[#0F172A]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#475569]">{children}</div>
    </section>
  );
}

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">

      {/* Header */}
      <div className="mb-12">
        <p className="mb-3 text-xs font-[650] uppercase tracking-[0.12em] text-[#64748B]">
          Legal
        </p>
        <h1 className="text-3xl font-[700] leading-tight tracking-tight text-[#0F172A] sm:text-4xl">
          Legal Notice
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#475569]">
          Pursuant to French law n°2004-575 of 21 June 2004 on confidence in the digital economy.
        </p>
      </div>

      <Clause title="Publisher">
        <p>
          <span className="font-[500] text-[#0F172A]">Publication manager:</span>{' '}
          Sébastien Neusch
        </p>
        <p>
          <span className="font-[500] text-[#0F172A]">Status:</span>{' '}
          CEO, SASU BLVTR
        </p>
        <p>
          <span className="font-[500] text-[#0F172A]">Contact:</span>{' '}
          <a href="mailto:hello@fitforpdf.com" className="underline decoration-black/20 underline-offset-2 transition hover:text-[#0F172A]">
            hello@fitforpdf.com
          </a>
        </p>
      </Clause>

      <Clause title="Hosting">
        <p>
          <span className="font-[500] text-[#0F172A]">Host:</span>{' '}
          OVH SAS
        </p>
        <p>
          <span className="font-[500] text-[#0F172A]">Registered office:</span>{' '}
          2 rue Kellermann, 59100 Roubaix, France
        </p>
        <p>
          <span className="font-[500] text-[#0F172A]">Website:</span>{' '}
          <a href="https://www.ovhcloud.com" target="_blank" rel="noreferrer" className="underline decoration-black/20 underline-offset-2 transition hover:text-[#0F172A]">
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
          <a href="/privacy" className="underline decoration-black/20 underline-offset-2 transition hover:text-[#0F172A]">
            privacy policy
          </a>
          , in compliance with GDPR (EU) 2016/679.
        </p>
        <p>
          To exercise your rights or for any data-related enquiry:{' '}
          <a href="mailto:support@fitforpdf.com" className="underline decoration-black/20 underline-offset-2 transition hover:text-[#0F172A]">
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

      <p className="mt-4 text-xs text-black/30">Last updated: March 2025</p>

    </main>
  );
}
