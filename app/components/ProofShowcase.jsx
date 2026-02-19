'use client';

import React, { useState, useRef, useEffect } from 'react';
import ImageLightbox from './ImageLightbox';

const CSV_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    src: '/CSV/enterprise-invoices-demo-overview.webp',
    alt: 'FitForPDF structured document — overview page with all columns',
  },
  {
    id: 'section-a',
    label: 'Section A',
    src: '/CSV/enterprise-invoices-demo-sectionA.webp',
    alt: 'FitForPDF structured document — section A columns',
  },
  {
    id: 'section-b',
    label: 'Section B',
    src: '/CSV/enterprise-invoices-demo-sectionB.webp',
    alt: 'FitForPDF structured document — section B columns',
  },
  {
    id: 'section-c',
    label: 'Section C',
    src: '/CSV/enterprise-invoices-demo-sectionC.webp',
    alt: 'FitForPDF structured document — section C columns',
  },
  {
    id: 'section-d',
    label: 'Section D',
    src: '/CSV/enterprise-invoices-demo-sectionD.webp',
    alt: 'FitForPDF structured document — section D columns',
  },
];

const XLSX_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    src: '/Excel/3mb_small_overview.webp',
    alt: 'FitForPDF structured document from Excel — overview page with all columns',
  },
  {
    id: 'section-a',
    label: 'Section A',
    src: '/Excel/3mb_small_sectionA.webp',
    alt: 'FitForPDF structured document from Excel — section A columns',
  },
  {
    id: 'section-b',
    label: 'Section B',
    src: '/Excel/3mb_small_sectionB.webp',
    alt: 'FitForPDF structured document from Excel — section B columns',
  },
  {
    id: 'section-c',
    label: 'Section C',
    src: '/Excel/3mb_small_sectionC.webp',
    alt: 'FitForPDF structured document from Excel — section C columns',
  },
  {
    id: 'section-d',
    label: 'Section D',
    src: '/Excel/3mb_small_sectionD.webp',
    alt: 'FitForPDF structured document from Excel — section D columns',
  },
  {
    id: 'section-e',
    label: 'Section E',
    src: '/Excel/3mb_small_sectionE.webp',
    alt: 'FitForPDF structured document from Excel — section E columns',
  },
];

const FORMAT_CONFIGS = {
  csv: {
    id: 'csv',
    label: 'CSV',
    icon: '/csv_icon.svg',
    inputLabel: 'CSV INPUT',
    inputDescription: 'Raw spreadsheet data — columns overflow, no structure.',
    beforeImage: '/before_csv.webp',
    beforeAlt: 'CSV input preview',
    tabs: CSV_TABS,
    outputLabel: 'STRUCTURED PDF',
    statLine: '16 columns. Automatically split into 4 readable sections.',
  },
  xlsx: {
    id: 'xlsx',
    label: 'XLSX',
    icon: '/Microsoft_Office_Excel_(2025–present).svg',
    inputLabel: 'XLSX INPUT',
    inputDescription: 'Excel exported to PDF — unreadable column overflow.',
    beforeImage: '/Excel/xlxs.webp',
    beforeAlt: 'Excel file exported as PDF — unreadable overflow',
    tabs: XLSX_TABS,
    outputLabel: 'STRUCTURED PDF',
    statLine: '11 columns. Automatically split into 5 readable sections.',
  },
};

const FORMATS = ['xlsx', 'csv'];

const TAB_COLORS = [
  '#ffffff', // white      — Overview
  '#4f46e5', // indigo-600 — Section A
  '#0ea5e9', // sky-500    — Section B
  '#22c55e', // green-500  — Section C
  '#f59e0b', // amber-500  — Section D
  '#ef4444', // red-500    — Section E
];

export default function ProofShowcase() {
  const [activeFormat, setActiveFormat] = useState('xlsx');
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef(null);

  const config = FORMAT_CONFIGS[activeFormat];
  const currentTab = config.tabs[activeTab];

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab, activeFormat, config.tabs.length]);

  function handleFormatChange(formatId) {
    setActiveFormat(formatId);
    setActiveTab(0);
  }

  return (
    <div className="space-y-8">
      {/* Section heading */}
      <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        From raw data to structured document.
      </h2>

      {/* Format selector */}
      <div
        data-testid="format-selector"
        className="flex items-center justify-center gap-8"
        role="radiogroup"
        aria-label="Input file format"
      >
        {FORMATS.map((formatId) => {
          const fmt = FORMAT_CONFIGS[formatId];
          const isActive = formatId === activeFormat;
          return (
            <button
              key={formatId}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => handleFormatChange(formatId)}
              className={`group flex flex-col items-center gap-1.5 rounded-lg px-5 py-2.5 transition-all duration-200 ${
                isActive
                  ? 'scale-105 opacity-100'
                  : 'opacity-35 hover:opacity-60'
              }`}
            >
              <img
                src={fmt.icon}
                alt={`${fmt.label} format icon`}
                className="h-10 w-10 object-contain"
              />
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ${
                  isActive ? 'text-accent' : 'text-slate-400'
                }`}
              >
                {fmt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Glass card */}
      <div
        ref={cardRef}
        data-testid="home-preview-card"
        className="home-preview-float mx-auto max-w-7xl rounded-2xl p-4 md:p-8"
        style={{ backgroundColor: '#1c1c1e' }}
      >
        <div className="grid gap-6 sm:grid-cols-[3fr_7fr]">
          {/* Left: Input (30%) */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
              {config.inputLabel}
            </p>
            <div
              style={{
                transform: hasAnimated ? 'translateX(0)' : 'translateX(-60px)',
                opacity: hasAnimated ? 1 : 0,
                transition: 'transform 600ms cubic-bezier(0.25,0.1,0.25,1), opacity 600ms ease',
              }}
            >
              <ImageLightbox
                src={config.beforeImage}
                alt={config.beforeAlt}
                className="mt-3 block w-full overflow-hidden rounded-lg border border-white/10"
              >
                <img
                  src={config.beforeImage}
                  alt={config.beforeAlt}
                  className="h-auto w-full rounded-lg object-cover"
                />
              </ImageLightbox>
            </div>
            <p className="mt-2 text-xs text-white/60">
              {config.inputDescription}
            </p>
          </div>

          {/* Right: Tabbed PDF Output (70%) */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
              {config.outputLabel}
            </p>

            {/* Tab buttons — Apple pill style */}
            <div
              role="tablist"
              style={{ backgroundColor: '#3a3a3c' }}
              className="relative mt-3 flex w-full items-center rounded-full p-1"
            >
              {/* Sliding indicator — colored pill */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute rounded-full"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  top: '4px',
                  bottom: '4px',
                  backgroundColor: TAB_COLORS[activeTab] ?? TAB_COLORS[0],
                  boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  transition: 'left 300ms cubic-bezier(0.25,0.1,0.25,1), width 300ms cubic-bezier(0.25,0.1,0.25,1), background-color 200ms ease',
                }}
              />
              {config.tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  id={`proof-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={i === activeTab}
                  ref={el => tabRefs.current[i] = el}
                  onClick={() => setActiveTab(i)}
                  className="relative z-10 flex-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200"
                  style={{
                    color: i === activeTab
                      ? (TAB_COLORS[i] === '#ffffff' ? '#000000' : '#ffffff')
                      : 'rgba(235,235,245,0.6)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active tab image */}
            <div
              role="tabpanel"
              aria-labelledby={`proof-tab-${currentTab.id}`}
            >
              <div
                style={{
                  transform: hasAnimated ? 'translateX(0)' : 'translateX(60px)',
                  opacity: hasAnimated ? 1 : 0,
                  transition: 'transform 600ms cubic-bezier(0.25,0.1,0.25,1) 100ms, opacity 600ms ease 100ms',
                }}
              >
                <ImageLightbox
                  src={currentTab.src}
                  alt={currentTab.alt}
                  className="proof-tab-image mt-3 block w-full overflow-hidden rounded-lg border border-white/10"
                  data-testid="proof-pdf-image"
                  images={config.tabs.map((t) => ({ src: t.src, alt: t.alt, label: t.label }))}
                  imageIndex={activeTab}
                >
                  <img
                    src={currentTab.src}
                    alt={currentTab.alt}
                    className="h-auto w-full rounded-lg object-cover"
                  />
                </ImageLightbox>
              </div>
            </div>

            {/* Stat line */}
            <p className="mt-3 text-xs text-white/60">
              {config.statLine}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
