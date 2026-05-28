'use client';

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/cn.mjs';
import Button from './ui/Button';
import AnimatedLogo from './AnimatedLogo';
import ThemeToggle from './ThemeToggle';

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
          'bg-[var(--color-bg-hero)] backdrop-blur-xl',
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
                'w-auto object-contain transition-all duration-300 translate-y-[2px] dark-invert',
                scrolled ? 'h-6' : 'h-7',
              )}
            />
          </a>

          {/* Desktop nav — hidden on mobile */}
          {/* `API` is promoted left-most + decorated with a "Free" pill because
              /developers had the highest pages/visitor of the site (8.5) but
              was buried in the nav. Direct-API audience deserves discovery. */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-[var(--color-muted)]">
            <a
              className="group inline-flex items-center gap-1.5 transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1"
              href="/developers"
            >
              API
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                Free
              </span>
            </a>
            <a className="transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/pricing">
              Pricing
            </a>
            <a className="transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/contact">
              Contact
            </a>
            <ThemeToggle />
            <Button variant="primary" href="/#generate" className="px-4 text-xs h-9">
              Try free
            </Button>
          </nav>

          {/* Hamburger — visible on mobile only. h-11 w-11 = 44px hit target
              (iOS HIG minimum). Was h-9 w-9 = 36px. */}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Frosted glass backdrop — fades in with menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 sm:hidden transition-all duration-300',
          'bg-[var(--color-bg)]/60 backdrop-blur-md',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div
        id="mobile-nav-panel"
        // `inert` + aria-hidden when closed: removes the panel from the
        // accessibility tree + focus order. Without this the links are
        // still discoverable by tab/SR even when visually hidden.
        inert={menuOpen ? undefined : ''}
        aria-hidden={menuOpen ? undefined : 'true'}
        hidden={!menuOpen}
        className={cn(
          'fixed left-0 right-0 top-0 z-40 sm:hidden',
          'bg-[var(--color-bg)]/95 backdrop-blur-xl pt-20 pb-6 px-6',
          'border-b border-[var(--color-border)] shadow-lg',
          'transition-all duration-300 ease-out',
          menuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none',
        )}
      >
        <nav className="flex flex-col gap-1">
          <a
            href="/developers"
            onClick={closeMenu}
            className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
          >
            <span>API</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Free
            </span>
          </a>
          <a
            href="/pricing"
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
          >
            Pricing
          </a>
          <a
            href="/contact"
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
          >
            Contact
          </a>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
            <ThemeToggle />
            <Button
              variant="primary"
              href="/#generate"
              className="flex-1 ml-3"
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
