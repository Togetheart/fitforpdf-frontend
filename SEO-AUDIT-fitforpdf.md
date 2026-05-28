# SEO Audit — fitforpdf.com

**Date:** March 20, 2026
**Domain:** www.fitforpdf.com
**Audit type:** Full site audit (code-based + search visibility analysis)

---

## Executive Summary

**fitforpdf.com is not indexed by Google.** A `site:fitforpdf.com` search and a branded search for "fitforpdf" both return zero results. This is the single most critical issue — no amount of on-page optimization matters if the site isn't in the index. The cause is likely a combination of the site being relatively new, having few or no backlinks, and possibly a crawlability issue with the non-www → www redirect chain.

On the positive side, the site's on-page SEO foundations are strong: proper title tags, meta descriptions, OpenGraph/Twitter cards, JSON-LD structured data, canonical URLs, and a clean heading hierarchy across all pages. The content strategy is smart — you've built 4 blog/guide pages targeting high-intent long-tail keywords, 3 competitor comparison pages (vs Puppeteer, vs ReportLab, vs wkhtmltopdf), and 4 vertical landing pages (auditors, consultants, finance, SaaS).

**Top 3 priorities:**
1. **Get indexed** — Submit sitemap to Google Search Console and Bing Webmaster Tools immediately
2. **Fix the sitemap** — 13 of 21 pages are missing from sitemap.xml (including all comparison and vertical pages)
3. **Build backlinks** — Zero external links means zero domain authority; you need a link-building strategy

**Overall assessment:** Strong foundation, but invisible. Fix indexing first, then everything else compounds.

---

## On-Page SEO Audit

### Title Tags

| Page | Title | Length | Verdict |
|------|-------|--------|---------|
| Homepage | `fitforpdf — Convert Excel & CSV to Structured PDF` | 52 chars | ✅ Good |
| Pricing | `Pricing — Simple & Transparent` | 31 chars | ⚠️ Too generic — add "fitforpdf" or "Excel to PDF" |
| Privacy | `Privacy Policy — Your Data, Not Our Business` | 46 chars | ✅ Good |
| Developers | ⚠️ **No static metadata export** (client component) | — | ❌ Critical — may not render for crawlers |
| Excel Cutoff | `Fix Cut-Off Columns in Excel PDF Export` | 42 chars | ✅ Good, keyword-rich |
| Fit One Page | `How to Fit a Large Excel Sheet on One PDF Page` | 49 chars | ✅ Good, matches search intent |
| CSV to PDF | `Convert CSV to Structured, Readable PDF` | 42 chars | ✅ Good |
| Audit Tips | `Export Audit Excel Sheets to PDF — Best Practices` | 52 chars | ✅ Good |
| vs Puppeteer | `fitforpdf vs Puppeteer – Spreadsheet to PDF comparison` | 56 chars | ✅ Good |
| vs ReportLab | `fitforpdf vs ReportLab – Spreadsheet to PDF comparison` | 56 chars | ✅ Good |
| vs wkhtmltopdf | `fitforpdf vs wkhtmltopdf – Spreadsheet to PDF comparison` | 58 chars | ✅ Good |
| For Auditors | `Excel to PDF for Auditors \| fitforpdf` | 39 chars | ✅ Good |
| For Consultants | `Excel to PDF for Consultants \| fitforpdf` | 42 chars | ✅ Good |
| For Finance | `Excel to PDF for Finance Teams \| fitforpdf` | 44 chars | ✅ Good |
| For SaaS | `PDF Export for SaaS Products \| fitforpdf` | 42 chars | ✅ Good |

**Issues found:**
- **Developers page** has no static metadata — since it's a `'use client'` component, Google's crawler may not execute the JS and will see no title/description
- **Pricing title** is too generic and doesn't include the product name or primary keyword

### Meta Descriptions

| Page | Description | Length | Verdict |
|------|-------------|--------|---------|
| Homepage | "Upload any spreadsheet and instantly get a structured, client-ready PDF..." | 135 chars | ✅ Good, includes CTA ("3 free exports") |
| Pricing | "Free exports, pay-as-you-go credits from $2.90, and Pro subscription..." | 102 chars | ⚠️ Price mismatch — copy says $2.90 but actual Single price is $4.90 |
| Privacy | "fitforpdf deletes all files immediately after processing..." | 97 chars | ✅ Good |
| Developers | ⚠️ **Missing** | — | ❌ Critical |
| Excel Cutoff | "Learn why Excel cuts off columns when exporting to PDF..." | 112 chars | ✅ Good |
| Fit One Page | "Step-by-step guide to fit a large Excel sheet on one PDF page..." | 112 chars | ✅ Good |
| CSV to PDF | "Learn how to convert wide CSV files into structured, readable PDFs..." | 108 chars | ✅ Good |
| Audit Tips | "Best practices for exporting audit Excel reports to PDF..." | 107 chars | ✅ Good |

**Issues found:**
- **Pricing meta description says "$2.90"** but the actual Single pack costs $4.90 — this will cause a trust problem if it ever ranks
- **Developers page** has no meta description at all

### Heading Structure (H1/H2)

All content pages have exactly one H1 and a logical H2 hierarchy. This is well-executed. A few notes:

- **Homepage H1** is rendered via a dynamic component (`HeroHeadline`) — verify that the H1 is present in the initial server-rendered HTML, not only after JS execution
- **Blog pages** (Excel Cutoff, Fit One Page, CSV to PDF, Audit Tips) have clean H1 → H2 → FAQ structures — good for featured snippets
- **Vertical pages** (For Auditors, etc.) are thin — single H1 with pain points/benefits but no H2 subheadings

### Internal Linking

**Strengths:**
- Homepage links to /pricing, /privacy, /developers
- All blog pages link back to homepage CTA
- Sitemap references all major pages

**Weaknesses:**
- Blog pages don't cross-link to each other (e.g., "Excel Cutoff" doesn't link to "Fit One Page")
- Vertical pages (for-auditors, for-consultants, etc.) are orphaned — no links point TO them from the homepage or navigation
- Comparison pages (vs-puppeteer, etc.) are orphaned — no links point TO them
- No breadcrumb navigation on any page

### Image Alt Text

The site uses very few images (mostly SVG icons with `aria-hidden`). The main images found:
- `/brand-origami.png` — used on developers page, no alt text found in JSX
- `/og-image.png` — OG image, not rendered in-page
- `/after_fitforpdf.webp`, `/before_csv.webp` — before/after proof images
- Several motion GIFs in `/public/`

**Recommendation:** Add descriptive alt text to all visible images, especially the before/after proof images which are key to the value proposition.

---

## Keyword Opportunity Table

Based on search research and competitive analysis, here are the top keyword opportunities for fitforpdf:

| Keyword | Est. Difficulty | Opportunity | Current Ranking | Intent | Recommended Content |
|---------|----------------|-------------|-----------------|--------|---------------------|
| excel to pdf without cutting off | Moderate | **High** | Not indexed | Informational | Existing page (excel-to-pdf-columns-cut-off) — expand |
| save excel as pdf without cutting off | Moderate | **High** | Not indexed | Informational | Same page — add this as H2 variant |
| fit excel on one page pdf | Moderate | **High** | Not indexed | Informational | Existing page — expand |
| csv to pdf converter | Hard | Medium | Not indexed | Transactional | Existing page — needs more depth |
| excel to pdf columns cut off | Easy | **High** | Not indexed | Informational | Existing page — perfect match |
| wide table pdf export | Easy | **High** | Not indexed | Informational/Commercial | New blog post |
| how to export large excel to pdf | Moderate | **High** | Not indexed | Informational | New guide page |
| excel to pdf api | Moderate | **High** | Not indexed | Commercial | Existing /developers page |
| spreadsheet to pdf api | Easy | **High** | Not indexed | Commercial | /developers page — add this keyword |
| convert xlsx to pdf programmatically | Moderate | Medium | Not indexed | Commercial | /developers page |
| excel pdf export formatting issues | Easy | **High** | Not indexed | Informational | New troubleshooting guide |
| audit report excel to pdf | Easy | **High** | Not indexed | Commercial | Existing page — expand |
| crm export to pdf | Easy | **High** | Not indexed | Commercial | New use-case page |
| excel to pdf for clients | Easy | **High** | Not indexed | Commercial | Homepage / new page |
| puppeteer pdf table | Moderate | Medium | Not indexed | Commercial | Existing vs-puppeteer page |
| reportlab table pdf | Moderate | Medium | Not indexed | Commercial | Existing vs-reportlab page |
| wkhtmltopdf alternative | Moderate | Medium | Not indexed | Commercial | Existing vs-wkhtmltopdf page |
| excel to pdf without losing formatting | Hard | Medium | Not indexed | Informational | New guide |
| how to make excel pdf readable | Easy | **High** | Not indexed | Informational | New guide |
| pdf generator api saas | Moderate | Medium | Not indexed | Commercial | /developers or /for-saas |
| financial report excel to pdf | Easy | **High** | Not indexed | Commercial | Existing for-finance page — expand |
| excel pdf page breaks wrong | Easy | **High** | Not indexed | Informational | New troubleshooting page |
| convert excel to pdf keep all columns | Easy | **High** | Not indexed | Informational | Existing excel-cutoff page |
| batch excel to pdf converter | Moderate | Medium | Not indexed | Transactional | Future feature page |

---

## Content Gap Analysis

### Topics Competitors Cover That You Don't

| Topic | Why It Matters | Format | Priority | Effort |
|-------|---------------|--------|----------|--------|
| "Excel to PDF without losing formatting" | High-volume query, multiple competitors rank | Long-form guide (1500+ words) | **High** | Moderate (half day) |
| "How to print Excel to PDF" (basic tutorial) | Top-of-funnel awareness, huge volume | Tutorial with screenshots | **High** | Moderate |
| "Best Excel to PDF converter" (listicle/comparison) | Commercial intent, drives signups | Comparison page featuring fitforpdf | **High** | Substantial |
| "PDF page break issues in Excel" | Common pain point, low competition | Troubleshooting guide | **High** | Quick win (2 hrs) |
| "CRM export to PDF" (use case) | Directly matches target persona | Use-case landing page | Medium | Quick win |
| "Google Sheets to PDF" formatting | Adjacent audience, zero competition for structured output | Guide page | Medium | Moderate |
| "Power BI export to PDF" table issues | Adjacent audience, enterprise users | Guide page | Medium | Moderate |
| "Excel to PDF landscape orientation" | Very common search, easy to rank | Short guide | Medium | Quick win |
| Video tutorial: "Fix Excel PDF export" | No video content currently; YouTube is a search engine | YouTube video + embed | Medium | Substantial |

### Content Depth Issues

| Page | Current Word Count | Recommendation |
|------|-------------------|----------------|
| For Auditors | ~300 words | ❌ Too thin — expand to 800+ with real examples, before/after screenshots |
| For Consultants | ~300 words | ❌ Too thin — same treatment |
| For Finance | ~300 words | ❌ Too thin — add use cases, ROI examples |
| For SaaS | ~300 words | ❌ Too thin — add integration examples, API code snippets |
| vs Puppeteer | ~450 words | ⚠️ Expand to 800+ with code comparison examples |
| vs ReportLab | ~450 words | ⚠️ Same treatment |
| vs wkhtmltopdf | ~450 words | ⚠️ Same treatment |
| Excel Cutoff | ~700 words | ⚠️ Good start — expand to 1200+ with screenshots |
| CSV to PDF | ~700 words | ⚠️ Same treatment |

### Missing Content Types

- **No screenshots or visual proof** in blog articles — competitors like ExcelDemy, ExcelInsider, and WPS all use annotated screenshots extensively
- **No video content** — a 2-minute screen recording showing the before/after would be powerful
- **No glossary or FAQ hub** — a central "/faq" or "/help" page linking all FAQ content
- **No changelog or "what's new"** page in the sitemap (exists at /changelog but not indexed)

---

## Technical SEO Checklist

| Check | Status | Details |
|-------|--------|---------|
| **Google Indexation** | ❌ **Fail** | Zero pages indexed. `site:fitforpdf.com` returns nothing. |
| **Google Search Console** | ❌ **Unknown** | No evidence of GSC setup. Must verify and submit sitemap. |
| **Bing Webmaster Tools** | ✅ Partial | `BingSiteAuth.xml` exists in /public, suggesting Bing verification done. |
| **Sitemap.xml** | ⚠️ **Warning** | Only 8 of 21 pages included. Missing 13 pages (all /vs-*, /for-*, /brand, /changelog, /contact, /terms, /mentions-legales). |
| **Robots.txt** | ✅ Pass | Clean rules: `Allow: /` for all user agents, sitemap reference included. |
| **Canonical URLs** | ✅ Pass | Canonical tags set correctly on all content pages. |
| **Non-www → www redirect** | ✅ Pass | 308 permanent redirect from fitforpdf.com → www.fitforpdf.com configured in next.config.mjs. |
| **Trailing slashes** | ✅ Pass | `trailingSlash: false` configured, preventing duplicate URLs. |
| **HTTPS** | ✅ Pass | All URLs use https://. |
| **OpenGraph tags** | ✅ Pass | Proper OG title, description, image (1200x630) on all pages. |
| **Twitter cards** | ✅ Pass | `summary_large_image` cards configured. |
| **JSON-LD structured data** | ✅ Pass | SoftwareApplication, Organization, and FAQPage schemas on homepage. |
| **Breadcrumb schema** | ❌ Fail | No BreadcrumbList schema on any page. |
| **FAQ schema on subpages** | ❌ Fail | FAQ content exists on 5+ pages but only homepage has FAQPage schema. |
| **Article schema on blog pages** | ❌ Fail | Blog/guide pages lack Article structured data. |
| **Mobile responsiveness** | ✅ Likely Pass | Tailwind CSS with responsive utilities used throughout. StickyMobileCTA component exists. |
| **Font loading** | ✅ Pass | Fonts preloaded with `<link rel="preload">` for Satoshi 400/700. |
| **Client-side rendering risk** | ⚠️ **Warning** | Homepage and /developers use `'use client'` — critical SEO content may not be in initial HTML. Next.js should SSR these, but verify. |
| **Page speed indicators** | ⚠️ **Warning** | PostHog + Microsoft Clarity scripts load on every page. GSAP animations library loaded. Multiple motion GIFs in public/. |
| **llms.txt** | ✅ Pass | Present and well-structured for AI crawlers. |
| **Broken internal links** | ⚠️ **Warning** | `/contact` page exists but is not in sitemap. Check if it renders properly. |
| **Hreflang tags** | ❌ Missing | `/mentions-legales` suggests French content exists, but no hreflang tags for language targeting. |

### Pages Missing from Sitemap

These 13 pages exist in the codebase but are **not** in sitemap.xml:

1. `/vs-puppeteer` — competitor comparison (SEO-valuable!)
2. `/vs-reportlab` — competitor comparison (SEO-valuable!)
3. `/vs-wkhtmltopdf` — competitor comparison (SEO-valuable!)
4. `/for-auditors` — vertical landing page
5. `/for-consultants` — vertical landing page
6. `/for-finance` — vertical landing page
7. `/for-saas` — vertical landing page
8. `/contact` — contact page
9. `/terms` — terms of service
10. `/mentions-legales` — legal mentions (French)
11. `/brand` — brand page
12. `/changelog` — changelog
13. `/success` — post-purchase success page (noindex this one)

---

## Competitor SEO Comparison

### Identified Competitors

fitforpdf operates in a unique niche — "structured PDF output from wide spreadsheets." Direct competitors are limited. The competitive landscape is:

**Direct competitors (same problem):** None found with the exact same positioning.

**Adjacent competitors (Excel-to-PDF conversion):**
1. **Smallpdf** (smallpdf.com) — general PDF toolkit
2. **iLovePDF** (ilovepdf.com) — free PDF conversion suite
3. **Adobe Acrobat Online** (adobe.com/acrobat) — enterprise PDF tools

**API competitors (programmatic PDF generation):**
4. **ConvertAPI** (convertapi.com) — file conversion API
5. **DocRaptor** (docraptor.com) — HTML-to-PDF API
6. **PDFShift** (pdfshift.io) — HTML-to-PDF API

### Comparison Summary

| Dimension | fitforpdf | Smallpdf | iLovePDF | ConvertAPI |
|-----------|-----------|----------|----------|------------|
| Indexed pages | **0** | 1000s | 1000s | 100s |
| Domain authority | None | Very High | Very High | Medium |
| Content depth | 21 pages, thin | Extensive blog + tools | Extensive tools | API docs + blog |
| Keyword targeting | Smart long-tail | Broad PDF keywords | Broad PDF keywords | Developer keywords |
| Structured data | Good (3 schemas) | Extensive | Basic | Basic |
| Unique value prop | ✅ Wide-table intelligence | Generic conversion | Generic conversion | Generic conversion |
| Pricing transparency | ✅ Excellent | Medium | Freemium | Medium |
| API offering | ✅ REST API | No | No | ✅ REST API |
| Backlink profile | **Zero** | Massive | Massive | Moderate |

### Key Insight

fitforpdf has a genuinely differentiated product — no competitor specifically solves the "wide table → structured PDF sections" problem. But differentiation doesn't matter if you're invisible. The competitors dominate search results purely through domain authority and content volume. Your strategy should be to own the long-tail keywords they ignore (e.g., "excel pdf columns cut off," "wide table pdf export") and build authority from there.

---

## Prioritized Action Plan

### Quick Wins (Do This Week)

| # | Action | Expected Impact | Effort |
|---|--------|-----------------|--------|
| 1 | **Submit sitemap to Google Search Console** — Verify the site, submit sitemap.xml, and request indexing for key pages | ❗ Critical — nothing else matters until you're indexed | 30 min |
| 2 | **Add all 13 missing pages to sitemap.js** — especially /vs-*, /for-*, /contact, /terms (exclude /success with noindex) | High — doubles the pages Google can discover | 30 min |
| 3 | **Add static metadata to /developers page** — export `metadata` with title and description so crawlers see it without JS | High — developers page is a key conversion page | 15 min |
| 4 | **Fix pricing meta description** — change "$2.90" to "$4.90" to match actual pricing | Medium — prevents trust issues | 5 min |
| 5 | **Update pricing page title** — change to "fitforpdf Pricing — Excel to PDF Export Plans" | Medium — adds keyword + brand | 5 min |
| 6 | **Add cross-links between blog posts** — each guide should link to 2-3 related guides | Medium — improves crawl depth and reduces orphan pages | 1 hr |
| 7 | **Link to vertical pages from homepage** — add "Who uses fitforpdf" section with links to /for-auditors, /for-consultants, etc. | Medium — these pages are currently orphaned | 1 hr |
| 8 | **Add FAQPage schema to all pages with FAQ sections** — pricing, privacy, and all 4 blog pages have FAQ content but no schema | Medium — enables FAQ rich results in Google | 2 hrs |

### Strategic Investments (Plan for This Quarter)

| # | Action | Expected Impact | Effort |
|---|--------|-----------------|--------|
| 1 | **Expand thin vertical pages** — bring /for-auditors, /for-consultants, /for-finance, /for-saas to 800+ words each with real examples, screenshots, and testimonials | High — these target commercial-intent keywords | 2-3 days |
| 2 | **Create "Excel to PDF Without Losing Formatting" guide** — 1500+ words targeting the highest-volume keyword in your niche | High — competes directly with ExcelDemy, WPS, ExcelInsider | 1 day |
| 3 | **Build a backlink strategy** — write guest posts on Excel/productivity blogs, get listed in "best tools" roundups, submit to Product Hunt, Hacker News, and IndieHackers | ❗ Critical — zero backlinks means zero domain authority | Ongoing |
| 4 | **Add screenshots and visual proof to all blog content** — annotated before/after images showing the actual problem and solution | High — competitors use visuals heavily; you don't | 2 days |
| 5 | **Create a YouTube video** — "How to Fix Excel PDF Export Issues in 60 Seconds" with a demo of fitforpdf | High — YouTube is the #2 search engine; zero competition in this niche | 1 day |
| 6 | **Expand comparison pages to 800+ words** — add code examples, benchmarks, and detailed feature comparisons for vs-puppeteer, vs-reportlab, vs-wkhtmltopdf | Medium — these target developer keywords | 2 days |
| 7 | **Add BreadcrumbList schema** — implement breadcrumb structured data across all pages | Medium — enables breadcrumb rich results | 2 hrs |
| 8 | **Add Article schema to blog/guide pages** — proper datePublished, dateModified, author | Medium — improves search result appearance | 2 hrs |
| 9 | **Create a "Best Excel to PDF Converters" comparison page** — feature fitforpdf alongside Smallpdf, iLovePDF, Adobe, with honest pros/cons | High — targets high-volume commercial keyword | 1 day |
| 10 | **Set up Google Search Console monitoring** — track indexation, impressions, clicks, and crawl errors weekly | Foundation — required for ongoing SEO work | 30 min + ongoing |

---

## Follow-Up Opportunities

Once the site is indexed and ranking, consider:

- **Content briefs** for the top keyword opportunities identified above
- **Optimized title tags and meta descriptions** for pages that start gaining impressions
- **A content calendar** based on the gap analysis — one new piece of content per week
- **A deeper competitor analysis** once you have GSC data showing which keywords you're actually competing on
- **International SEO** — the /mentions-legales page suggests a French-speaking audience; consider fr-FR content and hreflang tags

---

*Audit performed by analyzing the fitforpdf-frontend codebase and web search data. No code was modified.*
