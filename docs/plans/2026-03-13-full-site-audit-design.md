# Full Site Audit — Design Document

## Context
Comprehensive UX/UI, marketing, and visual audit of fitforpdf.com. Goal: bring the site to 2026 standards inspired by Anthropic, OpenAI, Perplexity. No fake metrics — the product hasn't launched at scale yet.

## Decisions
- Dark mode: toggle in header, localStorage + prefers-color-scheme
- Social proof: anonymous quotes + use-case cards (no vanity metrics)
- API homepage teaser: live interactive widget (curl → PDF result)
- Hero: keep current scroll animation, no dropzone change
- Content pages: all comparison + vertical landing pages now
- Changelog: structure + placeholder entries

---

## Phase 1: Visual Fixes & Polish (Quick Wins)

1. **Comparison table mobile overflow** — `overflow-x-auto` wrapper + stacked layout on mobile
2. **Hero mobile spacing** — reduce scroll spacer, fix headline clipping
3. **Glass system** — differentiate `glass-elevated` from `glass`
4. **Font-weight consistency** — standardize to `font-semibold` in feature lists
5. **Badge system** — reusable `.badge` class with 3 variants
6. **Sticky CTA mobile** — fixed bottom bar with "Upload a file"
7. **Skeleton loading** — animated placeholders for ProofShowcase images
8. **Section "Who this is for"** — add category icons

## Phase 2: Dark Mode

- CSS custom properties with `[data-theme="dark"]` overrides
- Toggle component in SiteHeader (sun/moon icon)
- Persist via localStorage, respect prefers-color-scheme on first load
- Dark palette: bg #0F1117, hero #161822, text #E2E8F0, border rgba(255,255,255,0.10), muted #94A3B8
- Adapted glass system opacities
- All components audited for hardcoded colors

## Phase 3: Social Proof & Marketing

- **Wall of Love** — 4-5 anonymous quote cards (glass design, staggered animation)
- **Use-case cards** — 4 cards replacing ticker: Audit, SaaS, Finance, CRM
- **API teaser widget** — live interactive: code block (curl/JS/Python tabs) + Run button → inline PDF result
- **ROI Calculator** — slider in pricing: exports/month → hours saved → cost comparison
- **Enterprise tier** — placeholder card "Contact us" in pricing
- **Changelog page** — `/changelog` with structure + placeholder entries
- **Footer enrichment** — social links, newsletter signup, changelog link

## Phase 4: Content Pages

- **3 comparison pages**: `/vs/wkhtmltopdf`, `/vs/puppeteer`, `/vs/reportlab`
  - Shared `VsPage` template: hero + comparison table + code example + CTA
- **4 vertical landing pages**: `/for/audit-firms`, `/for/saas-reporting`, `/for/finance-teams`, `/for/consultants`
  - Shared `VerticalPage` template: contextualized hero + problem + solution + pricing CTA

## Phase 5: Micro-Interactions & Final Polish

- Page transitions (Next.js loading.jsx + fade)
- Success animation post-generation (animated SVG checkmark)
- Feature card hover previews
- Footer social links (LinkedIn, X/Twitter)
