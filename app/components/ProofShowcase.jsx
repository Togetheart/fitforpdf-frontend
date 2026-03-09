'use client';

import React, { useState, useRef, useEffect } from 'react';
import ImageLightbox from './ImageLightbox';

const FEATURES = [
  {
    title: 'Overview page',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="9" x2="9" y2="21" />
      </svg>
    ),
    color: '#818cf8',
  },
  {
    title: 'Columns grouped into readable sections',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="18" rx="1.5" />
        <rect x="14" y="3" width="7" height="18" rx="1.5" />
      </svg>
    ),
    color: '#38bdf8',
  },
  {
    title: 'Key columns repeated automatically',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="17" x2="12" y2="21" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      </svg>
    ),
    color: '#2dd4bf',
  },
  {
    title: 'Clear page numbers and row ranges',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
    color: '#4ade80',
  },
  {
    title: 'No manual layout work',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    color: '#fbbf24',
  },
  {
    title: 'Jump to any section instantly',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    color: '#f87171',
  },
];

const CSV_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    src: '/CSV/enterprise-invoices-demo-overview.webp',
    srcSet: '/CSV/enterprise-invoices-demo-overview.webp 1x, /CSV/enterprise-invoices-demo-overview@2x.webp 2x',
    alt: 'FitForPDF structured document — overview page with all columns',
  },
  {
    id: 'section-a',
    label: 'Section A',
    src: '/CSV/enterprise-invoices-demo-sectionA.webp',
    srcSet: '/CSV/enterprise-invoices-demo-sectionA.webp 1x, /CSV/enterprise-invoices-demo-sectionA@2x.webp 2x',
    alt: 'FitForPDF structured document — section A columns',
  },
  {
    id: 'section-b',
    label: 'Section B',
    src: '/CSV/enterprise-invoices-demo-sectionB.webp',
    srcSet: '/CSV/enterprise-invoices-demo-sectionB.webp 1x, /CSV/enterprise-invoices-demo-sectionB@2x.webp 2x',
    alt: 'FitForPDF structured document — section B columns',
  },
  {
    id: 'section-c',
    label: 'Section C',
    src: '/CSV/enterprise-invoices-demo-sectionC.webp',
    srcSet: '/CSV/enterprise-invoices-demo-sectionC.webp 1x, /CSV/enterprise-invoices-demo-sectionC@2x.webp 2x',
    alt: 'FitForPDF structured document — section C columns',
  },
  {
    id: 'section-d',
    label: 'Section D',
    src: '/CSV/enterprise-invoices-demo-sectionD.webp',
    srcSet: '/CSV/enterprise-invoices-demo-sectionD.webp 1x, /CSV/enterprise-invoices-demo-sectionD@2x.webp 2x',
    alt: 'FitForPDF structured document — section D columns',
  },
];

const XLSX_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    src: '/Excel/3mb_small_overview.webp',
    srcSet: '/Excel/3mb_small_overview.webp 1x, /Excel/3mb_small_overview@2x.webp 2x',
    alt: 'FitForPDF structured document from Excel — overview page with all columns',
  },
  {
    id: 'section-a',
    label: 'Section A',
    src: '/Excel/3mb_small_sectionA.webp',
    srcSet: '/Excel/3mb_small_sectionA.webp 1x, /Excel/3mb_small_sectionA@2x.webp 2x',
    alt: 'FitForPDF structured document from Excel — section A columns',
  },
  {
    id: 'section-b',
    label: 'Section B',
    src: '/Excel/3mb_small_sectionB.webp',
    srcSet: '/Excel/3mb_small_sectionB.webp 1x, /Excel/3mb_small_sectionB@2x.webp 2x',
    alt: 'FitForPDF structured document from Excel — section B columns',
  },
  {
    id: 'section-c',
    label: 'Section C',
    src: '/Excel/3mb_small_sectionC.webp',
    srcSet: '/Excel/3mb_small_sectionC.webp 1x, /Excel/3mb_small_sectionC@2x.webp 2x',
    alt: 'FitForPDF structured document from Excel — section C columns',
  },
  {
    id: 'section-d',
    label: 'Section D',
    src: '/Excel/3mb_small_sectionD.webp',
    srcSet: '/Excel/3mb_small_sectionD.webp 1x, /Excel/3mb_small_sectionD@2x.webp 2x',
    alt: 'FitForPDF structured document from Excel — section D columns',
  },
  {
    id: 'section-e',
    label: 'Section E',
    src: '/Excel/3mb_small_sectionE.webp',
    srcSet: '/Excel/3mb_small_sectionE.webp 1x, /Excel/3mb_small_sectionE@2x.webp 2x',
    alt: 'FitForPDF structured document from Excel — section E columns',
  },
];

const FORMAT_CONFIGS = {
  csv: {
    id: 'csv',
    label: 'CSV',
    icon: '/csv_icon.svg',
    inputLabel: 'Source spreadsheet',
    inputDescription: 'Column overflow and unreadable structure.',
    beforeImage: '/CSV/enterprise-invoices-demo.csv.webp',
    beforeSrcSet: '/CSV/enterprise-invoices-demo.csv.webp 1x, /CSV/enterprise-invoices-demo.csv@2x.webp 2x',
    beforeAlt: 'CSV input preview',
    sourceLink: '/CSV/enterprise-invoices-demo.csv',
    sourceLinkLabel: 'Download source CSV ↗',
    tabs: CSV_TABS,
    outputLabel: 'Client-ready PDF',
    statLine: '16 columns. Automatically split into 4 readable sections.',
  },
  xlsx: {
    id: 'xlsx',
    label: 'XLSX',
    icon: '/Microsoft_Office_Excel_(2025–present).svg',
    inputLabel: 'Source spreadsheet',
    inputDescription: 'Hard to read at full width.',
    beforeImage: '/Excel/xlxs.webp',
    beforeSrcSet: '/Excel/xlxs.webp 1x, /Excel/xlxs@2x.webp 2x',
    beforeAlt: 'Excel file exported as PDF — unreadable overflow',
    sourceLink: null,
    sourceLinkLabel: null,
    tabs: XLSX_TABS,
    outputLabel: 'Client-ready PDF',
    statLine: '11 columns. Automatically split into 5 readable sections.',
  },
};

const FORMATS = ['xlsx', 'csv'];

const TAB_COLORS = [
  'bg-white', // white      — Overview
  'bg-indigo-600', // indigo-600 — Section A
  'bg-sky-500', // sky-500    — Section B
  'bg-green-500', // green-500  — Section C
  'bg-amber-500', // amber-500  — Section D
  'bg-red-500', // red-500    — Section E
];

export default function ProofShowcase() {
  const [activeFormat, setActiveFormat] = useState('xlsx');
  const [activeTab, setActiveTab] = useState(1);
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef(null);
  const leftLightboxRef = useRef(null);
  const rightLightboxRef = useRef(null);

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
    setActiveTab(1);
  }

  return (
    <div className="w-full space-y-8">
      {/* Section heading */}
      <h2 className="text-center text-3xl sm:text-[2.5rem] font-[650] tracking-tight text-black">
        See how FitForPDF transforms your file.
      </h2>

      {/* Format selector */}
      <div
        data-testid="format-selector"
        className="flex items-center justify-center gap-8"
        role="radiogroup"
        aria-label="Source file type"
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
                  isActive ? 'text-accent' : 'text-muted/70'
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
        className="home-preview-float w-full rounded-2xl border border-black/10 bg-white p-4 md:p-8 shadow-sm transition-shadow duration-300 hover:shadow-[0_2px_40px_rgba(0,0,0,0.11)]"
      >
        <div className="grid gap-6 lg:grid-cols-[38%_62%] xl:gap-8">
          {/* Left: Input (20%) */}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {config.inputLabel}
            </p>
            <div
              style={{
                transform: hasAnimated ? 'translateX(0)' : 'translateX(-60px)',
                opacity: hasAnimated ? 1 : 0,
                transition: 'transform 600ms cubic-bezier(0.25,0.1,0.25,1), opacity 600ms ease',
              }}
            >
              <div className="mt-3 overflow-hidden rounded-lg border border-black/10">
                <ImageLightbox
                  ref={leftLightboxRef}
                  src={config.beforeImage}
                  alt={config.beforeAlt}
                  className="block w-full"
                >
                  <img
                    src={config.beforeImage}
                    srcSet={config.beforeSrcSet}
                    alt={config.beforeAlt}
                    className="h-auto w-full rounded-lg object-cover"
                  />
                </ImageLightbox>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">
              {config.inputDescription}
            </p>
            {config.sourceLink ? (
              <button
                type="button"
                onClick={() => leftLightboxRef.current?.open()}
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted/70 transition hover:text-black"
              >
                {config.sourceLinkLabel}
              </button>
            ) : null}
          </div>

          {/* Right: Tabbed PDF Output (70%) */}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {config.outputLabel}
            </p>

            {/* Tab buttons — Apple pill style */}
            <div
              className="mt-3 w-full overflow-x-auto scrollbar-none rounded-full"
              style={{ backgroundColor: '#3a3a3c' }}
            >
              <div
                role="tablist"
                className="relative flex items-center rounded-full p-1"
                style={{ minWidth: '100%' }}
              >
                {/* Sliding indicator — colored pill */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute rounded-full ${TAB_COLORS[activeTab] ?? TAB_COLORS[0]}`}
                  style={{
                    left: indicator.left,
                    width: indicator.width,
                    top: '4px',
                    bottom: '4px',
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
                    className="relative z-10 flex-1 text-center rounded-full px-2 py-2.5 sm:px-3 text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                    style={{
                      color: i === activeTab
                        ? (i === 0 ? '#1A1A1A' : '#ffffff')
                        : 'rgba(235,235,245,0.55)',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
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
              <div className="proof-tab-image mt-3 overflow-hidden rounded-lg border border-black/10">
                  <ImageLightbox
                    ref={rightLightboxRef}
                    src={currentTab.src}
                    alt={currentTab.alt}
                    className="block w-full"
                    data-testid="proof-pdf-image"
                    images={config.tabs.map((t) => ({ src: t.src, srcSet: t.srcSet, alt: t.alt, label: t.label }))}
                    imageIndex={activeTab}
                  >
                    <img
                      src={currentTab.src}
                      srcSet={currentTab.srcSet}
                      alt={currentTab.alt}
                      className="h-auto w-full rounded-lg object-cover"
                    />
                  </ImageLightbox>
                </div>
              </div>
            </div>

            {/* Stat line + view link */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted">{config.statLine}</p>
              <button
                type="button"
                onClick={() => rightLightboxRef.current?.open()}
                className="text-[11px] text-muted/70 transition hover:text-black"
              >
                View full document ↗
              </button>
            </div>
          </div>
        </div>

        {/* Feature strip — Apple style */}
        <div
          className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl sm:grid-cols-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center gap-3 px-4 py-5 text-center"
              style={{ backgroundColor: '#FAF8F5' }}
            >
              <span style={{ color: f.color }}>{f.icon}</span>
              <span className="text-xs font-medium leading-tight text-muted">
                {f.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
