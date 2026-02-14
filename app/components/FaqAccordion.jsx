'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
      <div className="mt-6 space-y-0 divide-y divide-black/10" data-testid="faq-accordion">
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
                className="flex w-full items-center justify-between gap-4 text-left text-sm leading-relaxed font-medium text-slate-900"
              >
                <span>{item.q}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <p className="min-h-0 overflow-hidden pt-3 text-sm leading-relaxed text-slate-600">
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
