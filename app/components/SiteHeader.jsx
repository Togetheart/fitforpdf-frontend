'use client';

import React, { useEffect, useState } from 'react';
import { Code2, Menu, X } from 'lucide-react';
import { cn } from '../lib/cn.mjs';
import Button from './ui/Button';
import AnimatedLogo from './AnimatedLogo';
import ThemeToggle from './ThemeToggle';
import AccountMenu from './AccountMenu';
import useSession from '../hooks/useSession.mjs';

const SCROLL_THRESHOLD = 16;

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { account, logout } = useSession();

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
          <a href="/" className="flex items-center gap-2" aria-label="fitforpdf, accueil">
            <AnimatedLogo
              className={cn(
                'transition-all duration-300',
                scrolled ? 'h-7 w-7' : 'h-8 w-8',
              )}
            />
            <img
              src="/fitforpdf@2x.webp"
              alt="fitforpdf"
              width={2990}
              height={790}
              className={cn(
                'w-auto object-contain transition-all duration-300 translate-y-[2px] dark-invert',
                scrolled ? 'h-6' : 'h-7',
              )}
            />
          </a>

          {/* Desktop nav, hidden on mobile */}
          {/* `API` is promoted left-most + decorated with a "Free" pill because
              /developers had the highest pages/visitor of the site (8.5) but
              was buried in the nav. Direct-API audience deserves discovery. */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-[var(--color-muted)]">
            {/* API promoted as a bordered pill, identical to the app toolbar
                (Code2 + "Free"), so the marketing + app headers read as one product. */}
            <a
              href="/developers"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 text-[13px] font-semibold text-[var(--color-text)] transition hover:border-[var(--color-line-strong)] hover:bg-[var(--color-surface-sunken)]"
            >
              <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
              API
              <span className="ml-0.5 rounded-full border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-success-text)]">
                Free
              </span>
            </a>
            <a className="transition hover:text-[var(--color-text)] hover:underline underline-offset-4 decoration-1" href="/pricing">
              Pricing
            </a>
            {/* S1 sprint (2026-06-10): Contact dropped from the header — it
                was the one nav exit with zero purchase intent (it stays in
                the footer). Every remaining header element either explains
                (API, Pricing) or converts (Try free). */}
            {/* The landing is marketing, not the app: the live exports/plan quota
                lives in the app (at the point of work + the account menu), not as
                chrome here. The offer ("3 free exports") is communicated in the hero
                copy instead. AccountMenu shows the SN avatar when logged in and a
                styled "Log in" pill when logged out, one consistent control. */}
            <ThemeToggle />
            <AccountMenu account={account} onLogout={logout} />
            {/* S1 sprint (2026-06-10): anonymous visitors go to /app too —
                the V1 inline tool is gone from the home, /app is the only
                conversion surface. */}
            <Button
              variant="primary"
              href="/app"
              title="3 free exports — no account needed"
              className="px-4 text-xs h-9"
            >
              {account ? "Ouvrir l'app" : 'Try free'}
            </Button>
          </nav>

          {/* Hamburger, visible on mobile only. h-11 w-11 = 44px hit target
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

      {/* Frosted glass backdrop, fades in with menu */}
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
          {/* Contact intentionally absent (S1): zero purchase intent in the
              header; it lives in the footer. */}
          {account ? (
            <>
              <a
                href="/account"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
              >
                My account
              </a>
              <button
                type="button"
                onClick={() => { closeMenu(); logout(); }}
                className="rounded-lg px-3 py-3 text-left text-sm font-medium text-[var(--color-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
              >
                Log out
              </button>
            </>
          ) : (
            <a
              href="/login"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
            >
              Log in
            </a>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
            <ThemeToggle />
            <Button
              variant="primary"
              href="/app"
              className="flex-1 ml-3"
              onClick={closeMenu}
            >
              {account ? "Ouvrir l'app" : 'Try free'}
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
