import React from 'react';
import { LANDING_COPY } from '../siteCopy.mjs';

export default function SiteFooter() {
  return (
    <footer data-testid="site-footer" className="border-t border-black/5 bg-white">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="space-y-1">
          <img src="/fitforpdf@2x.webp" alt="FitForPDF" className="h-6 w-auto object-contain opacity-60" />
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

        <nav className="flex items-center gap-4 text-sm text-black/70 sm:flex-col sm:items-end sm:gap-2">
          <a className="transition hover:text-black" href="/#tool">
            Try free
          </a>
          <a className="transition hover:text-black" href="/pricing">
            Pricing
          </a>
          <a className="transition hover:text-black" href="/privacy">
            Privacy
          </a>
          <a
            className="transition hover:text-black"
            href="https://t.me/CrabiAssistantBot"
            target="_blank"
            rel="noreferrer"
          >
            Telegram
          </a>
        </nav>
      </div>
    </footer>
  );
}
