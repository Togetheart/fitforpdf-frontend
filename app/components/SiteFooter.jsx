import React from 'react';

export default function SiteFooter() {
  return (
    <footer data-testid="site-footer" className="border-t border-black/5 bg-gray-50">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-black/60">© FitForPDF</p>
        <nav className="flex items-center gap-4 text-sm text-black/70 sm:gap-6">
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
            Try on Telegram
          </a>
        </nav>
      </div>
    </footer>
  );
}
