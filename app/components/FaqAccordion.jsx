'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';

function normalizeId(value) {
  return String(value || '').replace(/^#/, '').trim();
}

export default function FaqAccordion({
  items = [],
  title = 'Frequently asked questions',
}) {
  const itemList = useMemo(
    () =>
      items
        .map((item, index) => ({
          id: item.id || `faq-item-${index + 1}`,
          q: item.q,
          a: item.a,
        }))
        .filter((item) => item.q && item.a),
    [items],
  );
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const openByHash = () => {
      const hash = normalizeId(window.location.hash);
      if (!hash) {
        setOpenId(null);
        return;
      }
      const match = itemList.find((item) => normalizeId(item.id) === hash);
      setOpenId(match ? match.id : null);
    };

    openByHash();
    window.addEventListener('hashchange', openByHash);
    return () => window.removeEventListener('hashchange', openByHash);
  }, [itemList]);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-semibold leading-tight">{title}</h2>
      <div className="mt-8 space-y-0 divide-y divide-black/10" data-testid="faq-accordion">
        {itemList.map((item) => {
          const isOpen = openId === item.id;
          const buttonId = `faq-q-${item.id}`;
          const panelId = `faq-a-${item.id}`;

          return (
            <section key={item.id} className="py-4" data-faq-id={item.id}>
              <button
                type="button"
                id={buttonId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
                className="group flex w-full items-start justify-between gap-4 rounded-xl px-2 py-2 text-left text-sm leading-relaxed font-medium text-slate-900 transition hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/70 focus-visible:ring-offset-2"
              >
                <span className="flex min-h-6 items-center gap-2">
                  <CircleHelp className="h-4 w-4 shrink-0 text-slate-400 transition-colors duration-200 group-hover:text-slate-600" />
                  {item.q}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`grid overflow-hidden transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <p className="min-h-0 overflow-hidden px-1 pb-1 pt-3 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </p>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
