import React from 'react';
import { LANDING_COPY } from '../siteCopy.mjs';

export default function SiteFooter() {
  return (
    <footer data-testid="site-footer" className="border-t border-black/5 bg-white">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:px-10 xl:px-12 2xl:grid-cols-4">
        <div className="space-y-3">
          <img src="/fitforpdf@2x.webp" alt="fitforpdf" className="h-6 w-auto object-contain opacity-60" />
          <p className="text-xs text-black/40">Transform spreadsheets into professional PDFs.</p>
          <p className="text-xs text-black/40">
            Made by{' '}
            <a
              href={LANDING_COPY.footerMakerHref}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-black/70"
            >
              {LANDING_COPY.footerMakerName}
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-[600] uppercase tracking-[0.08em] text-black/30">Product</p>
          <nav className="flex flex-col gap-1.5">
            <a className="text-sm text-black/50 transition hover:text-black/80" href="/#upload">
              Try free
            </a>
            <a className="text-sm text-black/50 transition hover:text-black/80" href="/pricing">
              Pricing
            </a>
            <a className="text-sm text-black/50 transition hover:text-black/80" href="/developers">
              API
            </a>
            <a className="text-sm text-black/50 transition hover:text-black/80" href="/privacy">
              Privacy
            </a>
          </nav>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-[600] uppercase tracking-[0.08em] text-black/30">Resources</p>
          <nav className="flex flex-col gap-1.5">
            <a className="text-sm text-black/50 transition hover:text-black/80" href="/excel-to-pdf-columns-cut-off">
              Fix cut-off columns in Excel PDF
            </a>
            <a className="text-sm text-black/50 transition hover:text-black/80" href="/fit-excel-sheet-on-one-page-pdf">
              Fit Excel sheet on one page
            </a>
            <a className="text-sm text-black/50 transition hover:text-black/80" href="/csv-to-structured-pdf">
              CSV to structured PDF
            </a>
            <a className="text-sm text-black/50 transition hover:text-black/80" href="/audit-report-excel-to-pdf-tips">
              Audit report export tips
            </a>
          </nav>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-[600] uppercase tracking-[0.08em] text-black/30">Legal</p>
          <nav className="flex flex-col gap-1.5">
            <a className="text-sm text-black/50 transition hover:text-black/80" href="/privacy">
              Privacy policy
            </a>
            <a className="text-sm text-black/50 transition hover:text-black/80" href="/developers">
              API documentation
            </a>
            <a
              className="text-sm text-black/50 transition hover:text-black/80"
              href="mailto:hello@fitforpdf.com"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
