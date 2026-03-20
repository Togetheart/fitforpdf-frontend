import React from 'react';
import { LANDING_COPY } from '../siteCopy.mjs';
import AnimatedLogo from './AnimatedLogo';
import NewsletterForm from './NewsletterForm';

export default function SiteFooter() {
  return (
    <footer data-testid="site-footer" className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:px-10 xl:px-12 2xl:grid-cols-4">
        <div className="space-y-3">
          <a href="/" className="flex items-center gap-2 opacity-60 transition hover:opacity-100">
            <AnimatedLogo className="h-7 w-7" />
            <img src="/fitforpdf@2x.webp" alt="fitforpdf" className="h-6 w-auto object-contain dark-invert" />
          </a>
          <p className="text-xs text-[var(--color-muted)]">Rendering engine for wide business tables.</p>
          <p className="text-xs text-[var(--color-muted)]">
            Made by{' '}
            <a
              href={LANDING_COPY.footerMakerHref}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1"
            >
              {LANDING_COPY.footerMakerName}
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Product</p>
          <nav className="flex flex-col gap-1.5">
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/#tool">
              Try free
            </a>
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/pricing">
              Pricing
            </a>
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/developers">
              API
            </a>
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/privacy">
              Privacy
            </a>
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/changelog">
              Changelog
            </a>
          </nav>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Resources</p>
          <nav className="flex flex-col gap-1.5">
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/excel-to-pdf-columns-cut-off">
              Fix cut-off columns in Excel PDF
            </a>
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/fit-excel-sheet-on-one-page-pdf">
              Fit Excel sheet on one page
            </a>
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/csv-to-structured-pdf">
              CSV to structured PDF
            </a>
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/audit-report-excel-to-pdf-tips">
              Audit report export tips
            </a>
          </nav>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Legal</p>
          <nav className="flex flex-col gap-1.5">
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/privacy">
              Privacy policy
            </a>
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/terms">
              Terms of use
            </a>
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/mentions-legales">
              Mentions légales
            </a>
            <a
              className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1"
              href="/contact"
            >
              Contact
            </a>
            <a className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/about">
              About
            </a>
          </nav>
        </div>
      </div>

      {/* Newsletter + Social row */}
      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-10 xl:px-12">
          {/* Newsletter signup */}
          <NewsletterForm />

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/fitforpdf/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://x.com/fitforpdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
