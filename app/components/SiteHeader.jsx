import React from 'react';
import { TELEGRAM_BOT_URL } from '../siteCopy.mjs';

export default function SiteHeader() {
  return (
    <header
      data-testid="site-header"
      className="fixed left-0 right-0 top-0 z-50 w-full bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50"
    >
      <div className="mx-auto flex w-full max-w-[960px] items-center justify-between px-4 py-4 sm:px-6">
        <a href="/" className="text-lg font-semibold tracking-tight text-[#D92D2A]">
          FitForPDF
        </a>
        <nav className="flex items-center gap-4 text-sm text-black/70 sm:gap-6">
          <a className="hover:text-black" href="/pricing">
            Pricing
          </a>
          <a className="hover:text-black" href="/privacy">
            Privacy
          </a>
          <a
            className="hover:text-black"
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noreferrer"
          >
            Try on Telegram
          </a>
        </nav>
      </div>
    </header>
  );
}
