import React from 'react';
import SiteShell from '../components/SiteShell';

export const metadata = {
  title: 'Brand Guidelines — fitforpdf',
  description: 'Design system, colors, typography, and brand assets for fitforpdf.',
  alternates: { canonical: '/brand' },
  openGraph: {
    title: 'Brand Guidelines — fitforpdf',
    description: 'Design system, colors, typography, and brand assets for fitforpdf.',
    url: 'https://www.fitforpdf.com/brand',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand Guidelines — fitforpdf',
    description: 'Design system, colors, typography, and brand assets for fitforpdf.',
  },
};

/* ─── Color swatches ─────────────────────────────────────────── */

const COLORS = [
  { name: 'Text', var: '--color-text', hex: '#0F172A', desc: 'Primary text' },
  { name: 'Muted', var: '--color-muted', hex: '#64748B', desc: 'Secondary text, labels' },
  { name: 'Background', var: '--color-bg', hex: '#FFFFFF', desc: 'Page background' },
  { name: 'Warm', var: '--color-bg-hero', hex: '#FAF8F5', desc: 'Section backgrounds, cream' },
  { name: 'Accent', var: '--color-accent', hex: '#0F172A', desc: 'Links, emphasis' },
  { name: 'CTA', var: '--color-cta-bg', hex: '#2563EB', desc: 'Primary buttons, highlights' },
  { name: 'CTA Hover', var: '--color-cta-hover', hex: '#1D4ED8', desc: 'Button hover state' },
  { name: 'Border', var: '--color-border', hex: 'rgba(0,0,0,0.10)', desc: 'Dividers, card borders' },
];

const DARK_COLORS = [
  { name: 'Text', hex: '#E2E8F0' },
  { name: 'Muted', hex: '#94A3B8' },
  { name: 'Background', hex: '#0F1117' },
  { name: 'Warm', hex: '#161822' },
  { name: 'Accent', hex: '#E2E8F0' },
  { name: 'CTA', hex: '#3B82F6' },
  { name: 'CTA Hover', hex: '#2563EB' },
  { name: 'Border', hex: 'rgba(255,255,255,0.10)' },
];

/* ─── Typography scale ───────────────────────────────────────── */

const TYPE_SCALE = [
  { name: 'Display / H1', mobile: '44px', desktop: '64px', weight: 700, lineHeight: '1.05', sample: 'Readable PDFs' },
  { name: 'Heading / H2', mobile: '24px', desktop: '32px', weight: 600, lineHeight: '1.2', sample: 'From wide Excel tables.' },
  { name: 'Body', mobile: '16px', desktop: '16px', weight: 400, lineHeight: '1.5', sample: 'Your wide spreadsheets, fitted into clean, readable PDFs.' },
  { name: 'Small', mobile: '13px', desktop: '13px', weight: 400, lineHeight: '1.4', sample: 'Processed in 2.3 seconds' },
  { name: 'Eyebrow', mobile: '11px', desktop: '11px', weight: 600, lineHeight: '1.4', sample: 'ENGINE FOR WIDE TABLES', uppercase: true },
];

/* ─── Spacing scale ──────────────────────────────────────────── */

const SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96, 120];

/* ─── Radius ─────────────────────────────────────────────────── */

const RADII = [
  { name: 'Input', value: '10px' },
  { name: 'Base / Card', value: '12px' },
  { name: 'XL', value: '14px' },
  { name: 'Pill', value: '999px' },
];

/* ─── Section helper ─────────────────────────────────────────── */

function BrandSection({ title, children }) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ name, hex, desc, large }) {
  const isRgba = hex.startsWith('rgba');
  return (
    <div className="flex items-start gap-3">
      <div
        className={`shrink-0 rounded-xl border border-[var(--color-border)] ${large ? 'h-16 w-16' : 'h-12 w-12'}`}
        style={{ background: hex }}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)]">{name}</p>
        <p className="font-mono text-xs text-[var(--color-muted)]">{hex}</p>
        {desc ? <p className="text-xs text-[var(--color-muted)]">{desc}</p> : null}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function BrandPage() {
  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-[960px] space-y-20 px-4 py-16 sm:px-6">

        {/* Header */}
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Brand Guidelines</p>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
            fitforpdf
          </h1>
          <p className="max-w-[50ch] text-lg text-[var(--color-muted)]">
            Design system, colors, typography, and component reference.
            All values are sourced from our CSS custom properties and design tokens.
          </p>
        </header>

        {/* ─── Logo ───────────────────────────────────────── */}
        <BrandSection title="Logo">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-10">
              <div className="flex items-center gap-3">
                <img src="/fitforpdf-icon.svg" alt="fitforpdf logo mark" className="h-10 w-auto" />
                <img src="/fitforpdf@2x.webp" alt="fitforpdf wordmark" className="h-8 w-auto object-contain dark-invert" />
              </div>
            </div>
            <div className="flex items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[#0F172A] p-10">
              <div className="flex items-center gap-3">
                <img src="/fitforpdf-icon.svg" alt="fitforpdf logo mark" className="h-10 w-auto brightness-0 invert" />
                <img src="/fitforpdf@2x.webp" alt="fitforpdf wordmark" className="h-8 w-auto object-contain brightness-0 invert" />
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-[var(--color-muted)]">
            <p><strong className="text-[var(--color-text)]">Clear space:</strong> Minimum padding of 1x logo height around the mark.</p>
            <p><strong className="text-[var(--color-text)]">Minimum size:</strong> 24px height for digital use.</p>
            <p><strong className="text-[var(--color-text)]">File formats:</strong> SVG (preferred), WebP for raster.</p>
          </div>
        </BrandSection>

        {/* ─── Colors ─────────────────────────────────────── */}
        <BrandSection title="Colors">
          <div className="space-y-8">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Light mode</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {COLORS.map((c) => (
                  <Swatch key={c.name} name={c.name} hex={c.hex} desc={c.desc} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Dark mode</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {DARK_COLORS.map((c) => (
                  <Swatch key={c.name} name={c.name} hex={c.hex} />
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hero)] p-4 text-sm text-[var(--color-muted)]">
            <strong className="text-[var(--color-text)]">Usage:</strong> All colors are defined as CSS custom properties (<code className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-xs">var(--color-*)</code>) and adapt automatically between light and dark mode.
          </div>
        </BrandSection>

        {/* ─── Typography ─────────────────────────────────── */}
        <BrandSection title="Typography">
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold tracking-tight text-[var(--color-text)]">Satoshi</span>
              <span className="text-sm text-[var(--color-muted)]">by Fontshare — self-hosted</span>
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              Fallbacks: -apple-system, SF Pro Display, Segoe UI, sans-serif
            </p>
          </div>

          <div className="space-y-0 divide-y divide-[var(--color-border)]">
            {TYPE_SCALE.map((t) => (
              <div key={t.name} className="flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-8">
                <div className="w-36 shrink-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">{t.name}</p>
                  <p className="font-mono text-xs text-[var(--color-muted)]">
                    {t.mobile}{t.mobile !== t.desktop ? ` / ${t.desktop}` : ''} &middot; {t.weight} &middot; {t.lineHeight}
                  </p>
                </div>
                <p
                  className="text-[var(--color-text)]"
                  style={{
                    fontSize: t.desktop,
                    fontWeight: t.weight,
                    lineHeight: t.lineHeight,
                    textTransform: t.uppercase ? 'uppercase' : 'none',
                    letterSpacing: t.uppercase ? '0.08em' : undefined,
                  }}
                >
                  {t.sample}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Font weights in use</p>
            <div className="flex flex-wrap gap-6">
              {[
                { w: 400, label: 'Regular', tw: 'font-normal' },
                { w: 500, label: 'Medium', tw: 'font-medium' },
                { w: 600, label: 'Semibold', tw: 'font-semibold' },
                { w: 700, label: 'Bold', tw: 'font-bold' },
              ].map((fw) => (
                <div key={fw.w} className="text-center">
                  <p className="text-3xl text-[var(--color-text)]" style={{ fontWeight: fw.w }}>Aa</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">{fw.w} &middot; {fw.label}</p>
                  <p className="font-mono text-xs text-[var(--color-muted)]">{fw.tw}</p>
                </div>
              ))}
            </div>
          </div>
        </BrandSection>

        {/* ─── Spacing ────────────────────────────────────── */}
        <BrandSection title="Spacing">
          <p className="text-sm text-[var(--color-muted)]">
            Based on a 4px grid. All spacing values are multiples of 4.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            {SPACING.map((s) => (
              <div key={s} className="flex flex-col items-center gap-1.5">
                <div
                  className="rounded bg-cta/20 border border-cta/30"
                  style={{ width: `${s}px`, height: `${s}px` }}
                />
                <span className="font-mono text-xs text-[var(--color-muted)]">{s}</span>
              </div>
            ))}
          </div>
        </BrandSection>

        {/* ─── Border Radius ──────────────────────────────── */}
        <BrandSection title="Border Radius">
          <div className="flex flex-wrap gap-6">
            {RADII.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className="h-16 w-16 border-2 border-cta/40 bg-cta/10"
                  style={{ borderRadius: r.value }}
                />
                <div className="text-center">
                  <p className="text-xs font-semibold text-[var(--color-text)]">{r.name}</p>
                  <p className="font-mono text-xs text-[var(--color-muted)]">{r.value}</p>
                </div>
              </div>
            ))}
          </div>
        </BrandSection>

        {/* ─── Buttons ────────────────────────────────────── */}
        <BrandSection title="Buttons">
          <p className="text-sm text-[var(--color-muted)]">
            All buttons use <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-xs">rounded-full</code> (pill shape), height 44px, font-semibold.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-2 text-center">
              <button type="button" className="inline-flex h-11 items-center justify-center rounded-full bg-cta px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-cta-hover">
                Primary
              </button>
              <p className="text-xs text-[var(--color-muted)]">primary</p>
            </div>
            <div className="space-y-2 text-center">
              <button type="button" className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover">
                Accent
              </button>
              <p className="text-xs text-[var(--color-muted)]">accent</p>
            </div>
            <div className="space-y-2 text-center">
              <button type="button" className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-6 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-hero)]">
                Secondary
              </button>
              <p className="text-xs text-[var(--color-muted)]">secondary</p>
            </div>
            <div className="space-y-2 text-center">
              <button type="button" className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-6 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-hero)]">
                Outline
              </button>
              <p className="text-xs text-[var(--color-muted)]">outline</p>
            </div>
          </div>
        </BrandSection>

        {/* ─── Badges ─────────────────────────────────────── */}
        <BrandSection title="Badges">
          <div className="flex flex-wrap items-center gap-3">
            {[
              { variant: 'default', label: 'Default', classes: 'border-[var(--color-border)] bg-[var(--color-bg-hero)] text-[var(--color-muted)]' },
              { variant: 'accent', label: 'Accent', classes: 'border-cta/20 bg-cta/[0.06] text-cta' },
              { variant: 'success', label: 'Success', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
              { variant: 'popular', label: 'Popular', classes: 'border-accent/25 bg-[var(--color-bg)] text-accent-hover' },
            ].map((b) => (
              <div key={b.variant} className="space-y-2 text-center">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${b.classes}`}>
                  {b.label}
                </span>
                <p className="text-xs text-[var(--color-muted)]">{b.variant}</p>
              </div>
            ))}
          </div>
        </BrandSection>

        {/* ─── Motion ─────────────────────────────────────── */}
        <BrandSection title="Motion">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-hero)]">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Tier</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Duration</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-[var(--color-text)]">Micro</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">150ms</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">Hover, focus, opacity, border</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-[var(--color-text)]">Move</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">300 - 500ms</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">Section entrances, tab transitions</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-[var(--color-text)]">Flow</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">700 - 1000ms</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">Hero entrance, page transitions</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              All animations respect <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-xs">prefers-reduced-motion</code>. When enabled, animations are disabled.
            </p>
          </div>
        </BrandSection>

        {/* ─── CSS Variables reference ────────────────────── */}
        <BrandSection title="CSS Variables">
          <p className="text-sm text-[var(--color-muted)]">
            All design tokens are available as CSS custom properties on <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-xs">:root</code> and adapt in dark mode via <code className="rounded bg-[var(--color-bg-hero)] px-1.5 py-0.5 text-xs">[data-theme=&quot;dark&quot;]</code>.
          </p>
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-hero)]">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Variable</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Light</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Dark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] font-mono text-xs">
                {COLORS.map((c, i) => (
                  <tr key={c.var}>
                    <td className="px-4 py-2.5 text-[var(--color-text)]">{c.var}</td>
                    <td className="px-4 py-2.5 text-[var(--color-muted)]">{c.hex}</td>
                    <td className="px-4 py-2.5 text-[var(--color-muted)]">{DARK_COLORS[i]?.hex || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BrandSection>

      </div>
    </SiteShell>
  );
}
