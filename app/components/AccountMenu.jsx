'use client';

import React, { useState } from 'react';

function initials(email) {
  const local = String(email || '?').split('@')[0];
  return local.slice(0, 2).toUpperCase();
}

export default function AccountMenu({ account, onLogout }) {
  const [open, setOpen] = useState(false);

  if (!account) {
    return (
      <a
        href="/login"
        className="inline-flex h-[31px] items-center rounded-full border border-slate-200 px-3 text-[13px] font-semibold text-slate-950 transition hover:border-slate-950 hover:bg-slate-50"
      >
        Se connecter
      </a>
    );
  }

  return (
    <div className="relative">
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
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          <div className="truncate px-3 py-2 text-[13px] text-slate-500">{account.email}</div>
          <button
            type="button"
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-slate-950 transition hover:bg-slate-50"
          >
            Se déconnecter
          </button>
        </div>
      ) : null}
    </div>
  );
}
