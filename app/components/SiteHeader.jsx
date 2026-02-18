'use client';

import React, { useEffect, useState } from 'react';
import { TELEGRAM_BOT_URL } from '../siteCopy.mjs';
import { cn } from '../lib/cn.mjs';

const SCROLL_THRESHOLD = 16;

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={cn(
        'fixed left-0 right-0 top-0 z-50 w-full transition-all duration-300 ease-out',
        'bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50',
        scrolled
          ? 'shadow-[0_1px_3px_rgba(0,0,0,0.06)] py-2'
          : 'shadow-none py-4',
      )}
    >
      <div className="mx-auto flex w-full max-w-[960px] items-center justify-between px-4 sm:px-6">
        <a
          href="/"
          className={cn(
            'font-semibold tracking-wide text-black transition-all duration-300',
            scrolled ? 'text-base' : 'text-lg',
          )}
        >
          FITFORPDF
        </a>
        <nav className="flex items-center gap-4 text-sm text-black/70 sm:gap-6">
          <a className="transition hover:text-black" href="/pricing">
            Pricing
          </a>
          <a className="transition hover:text-black" href="/privacy">
            Privacy
          </a>
          <a
            className="transition hover:text-black"
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
