'use client';

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/cn.mjs';
import Button from './ui/Button';
import AnimatedLogo from './AnimatedLogo';

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
          'bg-[#FAF8F5] backdrop-blur-xl',
          scrolled ? 'py-2' : 'py-4',
        )}
      >
        <div className="mx-auto flex w-full max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12">
          <a href="/" className="flex items-center gap-2" aria-label="fitforpdf — accueil">
            <AnimatedLogo
              className={cn(
                'transition-all duration-300',
                scrolled ? 'h-7 w-7' : 'h-8 w-8',
              )}
            />
            <img
              src="/fitforpdf@2x.webp"
              alt="fitforpdf"
              className={cn(
                'w-auto object-contain transition-all duration-300 translate-y-[1px]',
                scrolled ? 'h-6' : 'h-7',
              )}
            />
          </a>

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-black/70">
            <a className="transition hover:text-black" href="/pricing">
              Pricing
            </a>
            <a className="transition hover:text-black" href="/developers">
              API
            </a>
            <Button variant="primary" href="/#tool" className="px-4 text-xs h-9">
              Try free
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
            href="/pricing"
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-black"
          >
            Pricing
          </a>
          <a
            href="/developers"
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-black"
          >
            API
          </a>
          <div className="mt-3 pt-3 border-t border-black/5">
            <Button
              variant="primary"
              href="/#tool"
              className="w-full"
              onClick={closeMenu}
            >
              Try free
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
