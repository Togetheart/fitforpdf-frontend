'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Code2 } from 'lucide-react';
import PlanBadge from './ui/PlanBadge';

function initials(email) {
  const local = String(email || '?').split('@')[0];
  return local.slice(0, 2).toUpperCase();
}

export default function AccountMenu({ account, onLogout, quota = null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!account) {
    return (
      <a
        href="/login"
        className="inline-flex h-[31px] items-center rounded-full border border-[var(--color-line)] px-3 text-[13px] font-semibold text-[var(--color-text)] transition hover:border-[var(--color-line-strong)] hover:bg-[var(--color-surface-sunken)]"
      >
        Log in
      </a>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        data-testid="account-avatar"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-slate-950 text-xs font-bold text-white"
      >
        {initials(account.email)}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-2 shadow-lg"
        >
          <div className="truncate px-3 py-2 text-[13px] text-[var(--color-muted)]">{account.email}</div>
          {quota ? (
            <>
              {/* Plan / credits + API, moved here from the toolbar so the bar
                  stays uncluttered and these stay reachable on mobile. */}
              <div className="px-3 py-1">
                <PlanBadge quota={quota} />
              </div>
              <a
                href="/developers"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-sunken)]"
              >
                <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                API
                <span className="ml-auto rounded-full border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-success-text)]">
                  Free
                </span>
              </a>
              <div className="my-1 border-t border-[var(--color-line)]" aria-hidden="true" />
            </>
          ) : null}
          <a
            href="/account"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-[13px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-sunken)]"
          >
            My account
          </a>
          <button
            type="button"
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-sunken)]"
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
