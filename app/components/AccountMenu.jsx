'use client';

import React, { useEffect, useRef, useState } from 'react';

function initials(email) {
  const local = String(email || '?').split('@')[0];
  return local.slice(0, 2).toUpperCase();
}

export default function AccountMenu({ account, onLogout }) {
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
        Se connecter
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
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-2 shadow-lg"
        >
          <div className="truncate px-3 py-2 text-[13px] text-[var(--color-muted)]">{account.email}</div>
          <a
            href="/account"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-[13px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-sunken)]"
          >
            Mon compte
          </a>
          <button
            type="button"
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-sunken)]"
          >
            Se déconnecter
          </button>
        </div>
      ) : null}
    </div>
  );
}
