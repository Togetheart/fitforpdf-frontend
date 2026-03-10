import React from 'react';

export const metadata = {
  title: 'Terms of Use — fitforpdf',
  description: 'Terms of use for the fitforpdf service. Convert Excel and CSV files into structured, readable PDFs.',
};

function Clause({ title, children }) {
  return (
    <section className="border-t border-black/10 pt-8 mb-10">
      <h2 className="mb-4 text-xl font-[650] text-[#1A1A1A]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#4B4B4B]">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">

      {/* Header */}
      <div className="mb-12">
        <p className="mb-3 text-xs font-[650] uppercase tracking-[0.12em] text-[#7D6B58]">
          Legal
        </p>
        <h1 className="text-3xl font-[700] leading-tight tracking-tight text-[#1A1A1A] sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#4B4B4B]">
          By using fitforpdf, you agree to these terms.
        </p>
      </div>

      <Clause title="1. Service description">
        <p>
          fitforpdf is a file conversion service that transforms spreadsheet files (Excel .xlsx, CSV)
          into structured, readable PDF documents. The service is operated by Sébastien Neusch,
          CEO of SASU BLVTR, based in France.
        </p>
        <p>
          Contact:{' '}
          <a href="mailto:hello@fitforpdf.com" className="underline decoration-black/20 underline-offset-2 transition hover:text-[#1A1A1A]">
            hello@fitforpdf.com
          </a>
        </p>
      </Clause>

      <Clause title="2. Access">
        <p>
          fitforpdf is accessible without an account for free exports (3 exports included).
          Paid exports require purchasing credits or a Pro subscription via our payment partner Stripe.
        </p>
        <p>
          You are responsible for keeping your login credentials confidential if you create an account.
        </p>
      </Clause>

      <Clause title="3. Acceptable use">
        <p>You agree not to use fitforpdf to:</p>
        <ul className="ml-4 space-y-1 list-disc">
          <li>Process unlawful data or sensitive personal data without a valid legal basis</li>
          <li>Overload or attempt to circumvent the technical limits of the service</li>
          <li>Access the API beyond the quotas allocated to your plan</li>
          <li>Resell or redistribute the service without prior written agreement</li>
        </ul>
      </Clause>

      <Clause title="4. Data and files">
        <p>
          Files you upload are processed solely to perform the requested conversion.
          They are deleted immediately after conversion. The generated PDF is available for 15 minutes,
          then automatically deleted.
        </p>
        <p>
          No file content is stored in logs. For full details, see our{' '}
          <a href="/privacy" className="underline decoration-black/20 underline-offset-2 transition hover:text-[#1A1A1A]">
            privacy policy
          </a>.
        </p>
      </Clause>

      <Clause title="5. Pricing and payments">
        <p>
          Prices are listed on the{' '}
          <a href="/pricing" className="underline decoration-black/20 underline-offset-2 transition hover:text-[#1A1A1A]">
            pricing page
          </a>.
          Payments are processed by Stripe. Purchased credits do not expire.
        </p>
        <p>
          The Pro subscription is billed monthly or annually and can be cancelled at any time
          from your account, with no fees or commitment.
        </p>
      </Clause>

      <Clause title="6. Service availability">
        <p>
          fitforpdf aims to provide continuous service availability but does not guarantee
          uninterrupted uptime. Maintenance windows may cause temporary interruptions.
        </p>
      </Clause>

      <Clause title="7. Limitation of liability">
        <p>
          fitforpdf is provided &ldquo;as is&rdquo;. We shall not be liable for any indirect damages
          arising from the use or inability to use the service.
        </p>
        <p>
          You are solely responsible for ensuring that the data you upload complies with
          applicable regulations, including GDPR.
        </p>
      </Clause>

      <Clause title="8. Changes to these terms">
        <p>
          These terms may be updated. Material changes will be notified by email if you have an account.
          Continued use of the service constitutes acceptance of the updated terms.
        </p>
      </Clause>

      <Clause title="9. Governing law">
        <p>
          These terms are governed by French law. Any dispute falls under the exclusive
          jurisdiction of French courts.
        </p>
        <p>
          For any claim:{' '}
          <a href="mailto:hello@fitforpdf.com" className="underline decoration-black/20 underline-offset-2 transition hover:text-[#1A1A1A]">
            hello@fitforpdf.com
          </a>
        </p>
      </Clause>

      <p className="mt-4 text-xs text-black/30">Last updated: March 2025</p>

    </main>
  );
}
