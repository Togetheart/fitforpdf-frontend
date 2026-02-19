import React from 'react';
import { LANDING_COPY } from '../siteCopy.mjs';

export default function SiteFooter() {
  return (
    <footer data-testid="site-footer" className="border-t border-black/5 bg-gray-50">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-black/70">FitForPDF</p>
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
        <nav className="flex items-center gap-4 text-sm text-black/70 sm:gap-6">
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
