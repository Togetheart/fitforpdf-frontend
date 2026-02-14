import React from 'react';
import { TELEGRAM_BOT_URL } from '../siteCopy.mjs';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="font-semibold tracking-tight text-red-600">
          FitForPDF
        </a>
        <nav className="flex items-center gap-6 text-sm text-black/70">
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
