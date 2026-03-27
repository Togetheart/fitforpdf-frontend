'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

function normalizeId(value) {
  return String(value || '').replace(/^#/, '').trim();
}

export default function FaqAccordion({
  items = [],
  title,
  testId,
  listClassName,
  itemClassName,
}) {
  const itemList = useMemo(
    () =>
      items
        .map((item, index) => ({
          id: item.id || `faq-item-${index + 1}`,
          q: item.q,
          a: item.a,
          link: item.link || null,
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
    <div className="mx-auto w-full">
      {title ? <h2 className="text-2xl font-semibold tracking-tight leading-tight sm:text-3xl">{title}</h2> : null}
      <div
        className={`space-y-0 divide-y divide-black/10 ${listClassName || ''}`}
        data-testid={testId ?? 'faq-accordion'}
      >
        {itemList.map((item) => {
          const isOpen = openId === item.id;
          const buttonId = `faq-q-${item.id}`;
          const panelId = `faq-a-${item.id}`;

          return (
            <section key={item.id} className={`py-6 ${itemClassName || ''}`} data-faq-id={item.id}>
              <button
                type="button"
                id={buttonId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
                className="group flex w-full items-center justify-between gap-4 py-1 text-left text-lg leading-snug font-semibold text-[var(--color-text)] sm:text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border)] focus-visible:ring-offset-2"
              >
                <span className="flex min-h-6 items-center">
                  {item.q}
                </span>
                <Plus
                  aria-hidden="true"
                  data-testid="faq-chevron"
                  className={`h-4 w-4 shrink-0 text-muted/60 transition-transform duration-[250ms] ${isOpen ? 'rotate-45' : ''}`}
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`overflow-hidden transition-[max-height,opacity] duration-[250ms] ease-out ${isOpen ? 'max-h-[20rem] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="min-h-0 overflow-hidden px-1 pb-1 pt-3 text-sm leading-relaxed text-muted">
                  {item.a}
                  {item.link ? (
                    <>
                      {' '}
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 font-medium text-[var(--color-text)] hover:text-blue-600 transition-colors">
                        Open →
                      </a>
                    </>
                  ) : null}
                </p>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
