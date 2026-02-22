'use client';

import React, { useState, useRef, useEffect } from 'react';
import ImageLightbox from './ImageLightbox';

const FEATURES = [
  {
    title: 'Document overview page',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="9" x2="9" y2="21" />
      </svg>
    ),
    color: '#818cf8',
  },
  {
    title: 'Smart column sections',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="18" rx="1.5" />
        <rect x="14" y="3" width="7" height="18" rx="1.5" />
      </svg>
    ),
    color: '#38bdf8',
  },
  {
    title: 'Fixed reference columns',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="17" x2="12" y2="21" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      </svg>
    ),
    color: '#2dd4bf',
  },
  {
    title: 'Rows X–Y and Page i/n',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
    color: '#4ade80',
  },
  {
    title: 'Auto-structured',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    color: '#fbbf24',
  },
  {
    title: 'Clickable TOC links',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    sourceLink: '/CSV/enterprise-invoices-demo.csv',
    sourceLinkLabel: 'Download source CSV ↗',
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
    sourceLink: null,
    sourceLinkLabel: null,
    tabs: XLSX_TABS,
    outputLabel: 'STRUCTURED PDF',
    statLine: '11 columns. Automatically split into 5 readable sections.',
  },
};

const FORMATS = ['xlsx', 'csv'];

const TAB_COLORS = [
  '#1A1A1A', // dark       — Overview
  '#4f46e5', // indigo-600 — Section A
  '#0ea5e9', // sky-500    — Section B
  '#22c55e', // green-500  — Section C
  '#f59e0b', // amber-500  — Section D
  '#ef4444', // red-500    — Section E
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
    <div className="w-full overflow-hidden space-y-8">
      {/* Section heading */}
      <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        This is what your client receives.
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
        className="home-preview-float w-full rounded-2xl border border-black/10 bg-white p-4 md:p-8"
      >
        <div className="grid gap-6 sm:grid-cols-[1fr_4fr]">
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
              style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
            >
              <div
                role="tablist"
                className="relative flex items-center rounded-full p-1"
                style={{ minWidth: '100%' }}
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
                    className="relative z-10 flex-1 text-center rounded-full px-2 py-2.5 sm:px-3 text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                    style={{
                      color: i === activeTab
                        ? '#ffffff'
                        : 'rgba(0,0,0,0.50)',
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
          className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-xl sm:grid-cols-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center gap-2 px-3 py-4 text-center"
              style={{ backgroundColor: '#ffffff' }}
            >
              <span style={{ color: f.color }}>{f.icon}</span>
              <span className="text-[11px] font-medium leading-tight text-muted">
                {f.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
