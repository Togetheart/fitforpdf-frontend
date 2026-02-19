'use client';

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/cn.mjs';
import Button from './ui/Button';

const SCROLL_THRESHOLD = 16;

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function closeMenu() { setMenuOpen(false); }

  return (
    <>
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

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-black/70">
            <a className="transition hover:text-black" href="/privacy">
              Privacy
            </a>
            <a className="transition hover:text-black" href="/pricing">
              Pricing
            </a>
            <Button variant="primary" href="/#tool" className="px-4 text-xs h-9">
              Generate PDF
            </Button>
          </nav>

          {/* Hamburger — visible on mobile only */}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg text-black/70 transition hover:bg-black/5 hover:text-black"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Frosted glass backdrop — fades in with menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 sm:hidden transition-all duration-300',
          'bg-white/60 backdrop-blur-md',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed left-0 right-0 top-0 z-40 sm:hidden',
          'bg-white/95 backdrop-blur-xl pt-20 pb-6 px-6',
          'border-b border-black/5 shadow-lg',
          'transition-all duration-300 ease-out',
          menuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none',
        )}
      >
        <nav className="flex flex-col gap-1">
          <a
            href="/privacy"
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-black"
          >
            Privacy
          </a>
          <a
            href="/pricing"
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-black"
          >
            Pricing
          </a>
          <div className="mt-3 pt-3 border-t border-black/5">
            <Button
              variant="primary"
              href="/#tool"
              className="w-full"
              onClick={closeMenu}
            >
              Generate PDF
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
