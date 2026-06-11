export const TELEGRAM_BOT_URL = 'https://t.me/CrabiAssistantBot';

export const LANDING_COPY = {
  logoText: 'fitforpdf',
  heroTitle: 'Skip the cleanup.\\nSend it now.',
  heroSubheadline: 'Wide tables. Cut-off columns. Broken page breaks. FitForPDF fixes all three: in one click.',
  heroSubheadlineL1: 'Wide tables. Cut-off columns. Broken page breaks.',
  // Staccato pain line (L2a) + solution line (L2b). Language validated by
  // Magdalena (2026-03-22): "cut-off columns", "awkward page breaks" and
  // Abhinav (2026-04-15): "wide Excel tables become unreadable".
  heroSubheadlineL2a: 'Wide tables. Cut-off columns. Broken page breaks.',
  // L2b carries the CATEGORY since the V5 headline sells only the outcome:
  // a cold visitor must read WHAT the product makes in the first two lines.
  heroSubheadlineL2b: 'FitForPDF turns your export into a readable, sendable PDF. One click.',
  heroExample: 'Example: CRM export, 14 columns → 4 readable PDF sections',
  heroTypicalOutput: 'Works with: CRM exports · financial reports · analytics tables · SaaS data exports',
  proofTimeSaved: 'Typically saves 30 to 45 min per export',
  proofSourceLine: 'Typical sources: Excel exports · CSV datasets · SaaS reports',
  heroLabel: 'FITFORPDF',
  // Hero H1 — two lines. Line 1 is animated (bracket → [F] morph via GSAP,
  // see HeroHeadline.jsx). Line 2 is static. Language validated by Magdalena
  // (2026-03-22) who described the gap as "not truly client-ready" + "manual
  // cleanup step before I can send it out". "Your export" (vs. "Excel") is
  // the inclusive framing: Abhinav/moltin.work uses "report exports" for a
  // SaaS context — the universal term across all ICPs (2026-04-15 feedback).
  // V5 (2026-06-10, sprint S1): the "client-ready" PROMISE leaves the titles.
  // Kunj (consulting segment) hears corporate-grade fidelity in it — merged
  // headers, charts, brand charters — which is explicit anti-scope. The pain
  // language (Magdalena's words) stays everywhere else; the headline now
  // sells the outcome both segments agree on: skip the manual cleanup, send.
  heroHeadlineL1: 'Skip the cleanup.',
  heroHeadlineL2: 'Send it now.',
  heroCta: 'Fix your export',
  heroMicrocopy: '',
  heroMicrocopyFree: '3 free exports. No account needed. Packs from $19.',
  heroPrimaryCta: 'Generate PDF',
  heroTrustLine: 'Processed in France. Files deleted instantly. No AI, no data stored.',
  heroTrustRow: 'No account. No tracking of file contents. Works with CSV and XLSX.',
  // Trust eyebrow — rendered above the H1 as the first strategic signal on
  // page load (Apple-style). Replaces the former pain badge. "No LLM" is
  // rendered in semibold + foreground color to give it a typographic accent
  // without a pill/box. See Mathieu feedback 2026-04-14.
  //
  // Order — V4.3 (2026-04-15): NO LLM leads. This restores the original
  // strategic order from Mathieu's 2026-04-14 feedback: the differentiator
  // ("No LLM") must be the first word the eye catches when the page loads,
  // since it's the single strongest competitive signal in a market saturated
  // with LLM-wrapper tools. V4.2 tested "Zero storage" as the softer lead-in
  // but the differentiation signal landed too late in the reading rhythm.
  heroTrustEyebrow: 'No LLM · Zero storage · EU-hosted',
  heroTrustEyebrowAccent: 'No LLM',
  // File compatibility — rendered under the CTAs next to the free-tier
  // microcopy. Answers the #1 decision-point hesitation ("will my file
  // work?") and reinforces the broader "export" positioning by naming the
  // concrete formats (2026-04-15 feedback: no duplicate No LLM bottom).
  heroFileCompat: 'Works with Excel, CSV, and any tabular export.',

  problemTitle: "The problem isn't exporting. It's everything you do after.",
  problemBody: "Your spreadsheet exports, but the PDF still isn't ready to send. Columns get cut off. Page breaks land in the wrong places. You shrink fonts, adjust margins, export again, and hope it looks presentable. fitforpdf removes that cleanup step.",
  problemBullets: [
    'Columns are cut.',
    'Text becomes unreadable after zoom.',
    'Manual layout fixes become mandatory.',
  ],

  beforeAfterTitle: 'See how fitforpdf restructures your file',
  beforeLabel: 'Source spreadsheet',
  afterLabel: 'Structured PDF',

  clientReadyTitle: 'Client-ready means',
  clientReadyFeatures: [
    { key: 'overview', title: 'Overview page', description: 'See the full structure at a glance before each section.', icon: 'overview' },
    { key: 'columns', title: 'Columns grouped into readable sections', description: 'Wide tables split into clear, focused sections.', icon: 'columns' },
    { key: 'pinned', title: 'Key columns repeated automatically', description: 'Keep important columns (like ID and Name) at the top of each section.', icon: 'pin' },
    { key: 'pagination', title: 'Clear page numbers and row ranges', description: 'Readable row bands and page references for easier review.', icon: 'pagination' },
    { key: 'auto', title: 'No manual layout work', description: 'Upload once and let fitforpdf structure it for you.', icon: 'wand' },
    { key: 'toc', title: 'Jump to any section instantly', description: 'Open any section directly from the overview page.', icon: 'link' },
  ],
  clientReadyBullets: [
    'Overview page',
    'Columns grouped into readable sections',
    'Key columns repeated automatically',
    'Clear page numbers and row ranges',
    'No manual layout work',
    'Jump to any section instantly',
  ],

  // BLOC 4 — How it works
  howItWorksTitle: 'Three steps. Done.',
  howItWorksSteps: [
    { title: 'Upload your file', desc: '30+ columns, CRM exports, financial reports. Use the file you already have.' },
    { title: 'Structured sections, automatically', desc: 'Wide columns grouped. Headers repeated. Pages numbered. No manual work.' },
    { title: 'Ready to send', desc: 'A PDF your client can read, review, and act on. In seconds, not hours.' },
  ],
  howItWorksCta: 'Try it free',
  howItWorksPriceNudge: '3 free exports. Packs from $19.',

  // BLOC 5 — What this replaces
  whatThisReplacesTitle: 'What this replaces',
  whatThisReplacesQuote: "The export often isn't truly client-ready, so there's usually a manual cleanup step before I can send it out.",
  whatThisReplacesSupportLine: "That's the step fitforpdf removes.",
  whatThisReplacesList: ['Cut-off columns', 'Awkward page breaks', 'Layout shifts', 'Margin and font-size fixes', 'Re-exporting under pressure'],

  toolTitle: 'Generate a presentable PDF',
  toolSubcopy: '3 free exports. No account needed.',

  credibilityTitle: 'Why this is reliable',
  credibilityBullets: [
    'Overview page included',
    'Columns grouped into sections',
    'Rows X–Y and Page i/n',
  ],
  credibilityMicro: "If it looks wrong once, you won't trust it. fitforpdf is built for the first try.",

  pricingPreviewTitle: 'Start free. Upgrade when you send to clients.',
  pricingPreviewSubline: 'Try fitforpdf without creating an account. When you need more files, more automation, or API access, choose the plan that fits your workflow.',
  pricingPreviewCta: 'See pricing',

  privacyStripTitle: 'Privacy-first by default.',
  privacyStripBullets: [
    'Files are deleted immediately after conversion.',
    'PDFs are deleted after 15 minutes.',
    'We do not store file contents in logs.',
  ],
  privacyStripCta: 'Read privacy policy',

  socialProofLine: 'Used by consultants, finance teams, and operators who need clean PDFs without manual formatting.',
  socialProofTicker: [
    'Auditors sending 300-page reports',
    'Consultants sharing data with clients',
    'Finance teams exporting monthly KPIs',
    'Accountants closing end-of-quarter files',
    'Ops managers summarizing pipeline data',
    'Project managers reporting to stakeholders',
    'Freelancers delivering polished deliverables',
    'Students presenting structured datasets',
  ],

  finalCtaTitle: "Your export is done. The cleanup shouldn't be.",
  finalCtaCopy: 'Upload your Excel or CSV and get a PDF that is structured, readable, and ready to send.',
  finalCtaCopy2: '',
  finalCtaLabel: 'Fix your export',
  finalCtaPrice: '',

  footerTagline: 'Transform spreadsheets into professional PDFs.',

  whoThisIsForTitle:   'Designed for wide business tables',
  whoThisIsForPerfect: ['CRM exports', 'financial reports', 'analytics tables', 'inventory reports', 'SaaS reporting exports'],
  whoThisIsForNot:     ['invoice templates', 'formatted Excel documents', 'pixel-perfect spreadsheets'],
  whoThisIsForNote:    'fitforpdf is built for raw data exports, not pre-formatted documents.',

  apiBlockTitle:   'Need this in your workflow or product?',
  apiBlockCopy:    'Use the API to generate clean, readable PDFs from spreadsheet exports automatically.',
  apiBlockSpecs:   'Built for teams that need the same result at scale.',
  apiBlockCta:     'Explore the API',
  apiBlockCtaHref: '/developers',

  whoUsesTitle: 'Who uses fitforpdf',
  whoUsesItems: ['Consultants', 'Finance teams', 'SaaS reporting tools', 'Operations teams'],
  footerMakerName: 'BLVTR',
  footerMakerHref: 'https://www.linkedin.com/in/sebastienneusch/',

};

export const LANDING_COPY_KEYS = {
  hero: 'hero',
  problem: 'problem',
  beforeAfter: 'before-after',
  clientReady: 'client-ready',
  upload: 'tool',
  pricingPreview: 'pricing-preview',
  privacyStrip: 'privacy',
};

export const HOME_FAQ = [
  {
    id: 'time-saved',
    q: 'How much time does this actually save?',
    a: 'Most users spend 20 to 45 minutes fixing each export. fitforpdf reduces that to seconds.',
  },
  {
    id: 'worth-it',
    q: 'Is this worth it for just a few exports?',
    a: 'Yes. Even one export can take 30 minutes to fix manually. A single clean PDF often pays for itself.',
  },
  {
    id: 'why-not-excel',
    q: 'Why not just fix it in Excel?',
    a: "You can, but it's repetitive, fragile, and time-consuming. fitforpdf removes that step entirely.",
  },
  {
    id: 'reformat',
    q: 'Do I need to reformat my spreadsheet first?',
    a: 'No. Upload the file you already have.',
  },
  {
    id: 'filetypes',
    q: 'What file types can I upload?',
    a: 'Excel and CSV files.',
  },
  {
    id: 'oneoff',
    q: 'Is this for one-off exports or recurring workflows?',
    a: 'Both. Use the app for quick fixes, the API for automation.',
  },
  {
    id: 'sample',
    q: 'Can I see an example before trying it?',
    a: 'Yes — watch it fix a real sample spreadsheet live, no upload needed.',
    link: '/app?sample=1',
  },
  {
    id: 'files',
    q: 'Do you store my files?',
    a: 'No. Files are deleted immediately after conversion. The generated PDF is available for up to 15 minutes.',
  },
];

export const PRICING_PAGE_COPY = {
  pageTitle: "Simple pricing.",
  pageTitleAccent: "Built for professionals.",
  pageSubtitle: 'Typical manual formatting: 30–45 min per export. fitforpdf: done in seconds.',
  pageTagline: 'No subscriptions. No lock-in.',
  pageMicro: 'No subscriptions. No lock-in.',
  socialProof: 'Used by consultants, finance teams, and operators who need clean PDFs without manual formatting.',

  // Toggle labels
  togglePayg: 'Pay as you go',
  togglePro: 'Pro subscription',

  // PAYG section
  paygTagline: 'No subscription. Credits never expire.',

  // Pack Single
  singleTitle: 'Single',
  singleTopline: 'One-time payment',
  singlePrice: '$4.90',
  singleExports: '1 export',
  singleDescription: 'For one urgent export.',
  singleCtaLabel: 'Buy 1 export',
  singleFeatures: ['1 PDF export', 'No fitforpdf watermark', 'Branding & layout controls', 'Never expires'],

  // Pack Starter
  paygStarterTitle: 'Starter',
  paygStarterTopline: 'One-time payment',
  paygStarterPrice: '$19',
  paygStarterPerExport: '$1.90 per export',
  paygStarterExports: '10 exports',
  paygStarterDescription: 'For freelancers and regular client work.',
  paygStarterCtaLabel: 'Get 10 exports',
  paygStarterBadge: 'Most popular',
  paygStarterFeatures: ['10 PDF exports', 'No fitforpdf watermark', 'Branding & layout controls', 'Never expires'],

  // Pro subscription
  proTagline: 'Everything you need to scale your reporting.',
  proSubTagline: 'Cancel anytime.',
  proSubscriptionTitle: 'Pro',
  proMonthlyPrice: '$9.90',
  proMonthlyPeriod: '/ month',
  proYearlyPrice: '$99',
  proYearlyPeriod: '/ year',
  proYearlySaving: '2 months free',
  proExports: '500 PDF exports per month',
  proCtaLabel: 'Subscribe to Pro',
  proFeatures: [
    '500 PDF exports per month',
    'No fitforpdf watermark',
    'Branding & layout controls',
    'Priority processing & support',
    'Cancel anytime, no questions asked',
  ],

  // Billing toggle
  billingMonthly: 'Monthly',
  billingYearly: 'Yearly',

  // Free tier safety net
  freeTitle: 'Free',
  freeSubtitle: '$0 forever',
  freeExports: '3 exports included',
  freeFeature: 'fitforpdf branding included',
  freeFeatureAlt: 'Account-free',
  freeCtaLabel: 'Start free',
  freeCtaHref: '/app',
  freeSafetyTitle: 'Just want to test the waters?',
  freeSafetyDesc: '3 free exports. fitforpdf watermark included. No account needed.',
  freeSafetyCtaLabel: 'Upload a file for free →',
  freeSafetyCtaHref: '/app',

  proApiTitle: 'For SaaS & automation',
  proApiTagline: "Render readable PDFs from your product's reports and data exports.",
  proApiSubTagline: 'REST API for Excel, CSV, and database tables.',
  proApiPricePlaceholder: 'From $15/mo',
  proApiSocialProof: 'Used by SaaS products exporting reports.',
  proApiSocialProof2: 'Built for wide business tables.',
  proApiCtaLabel: 'Get API access',
  proApiCtaHref: '/developers#request-access',
  proApiFeatures: [
    'REST API access',
    '25 free renders to start',
    'Plans from 150 renders/month',
    'White-label output',
    'Priority processing',
  ],

  backToApp: 'Back to app',
  backToAppHref: '/',

  comparisonTitle: 'Compare features',
  comparison: [
    ['Readable, send-ready PDF output', '✓', '✓', '✓', '✓'],
    ['fitforpdf attribution', '✓ included', '✗ removed', '✗ removed', '✗ removed'],
    ['Branding & layout controls', '✗', '✓', '✓', '✓'],
    ['Credits expire', 'N/A', '✗ never', '✗ never', 'monthly reset'],
    ['Batch export', '✗', '✗', '✗', '✗'],
    ['API access', 'Free key (25 renders)', 'Free key (25 renders)', 'Free key (25 renders)', 'Free key (25 renders)'],
  ],

  faqTitle: 'Frequently Asked Questions',
  faq: [
    {
      id: 'expire',
      q: 'Do my "Pay as you go" credits expire?',
      a: 'No. If you buy a credit pack, the exports remain in your account forever until you use them.',
    },
    {
      id: 'subscription',
      q: 'Is the Starter pack a subscription?',
      a: 'Absolutely not. The Pay as you go options are strictly one-time payments. We will never auto-charge your card. If you want a recurring plan, check out our Pro subscription.',
    },
    {
      id: 'branding',
      q: 'Will my clients see the fitforpdf logo?',
      a: 'Not if you use a paid export. All paid options (whether one-time credits or the Pro subscription) completely remove our branding so you can send professional, white-label documents.',
    },
    {
      id: 'counts',
      q: 'What counts as an export?',
      a: 'A successful PDF generation (HTTP 200 with a PDF response).',
    },
    {
      id: 'files',
      q: 'Do you store my files?',
      a: 'No. Files are deleted immediately after conversion. The generated PDF is available for up to 15 minutes.',
    },
    {
      id: 'refund',
      q: 'What if the export isn’t right?',
      a: 'Email support@fitforpdf.com and we’ll refund unused credits, no questions asked. You always see a free watermarked preview before you pay, so you know exactly what you’re unlocking.',
    },
    {
      id: 'invoice',
      q: 'Will I get an invoice for my accounting?',
      a: 'Yes. Stripe emails a receipt for every purchase, and a proper VAT invoice is available for your records — handy when you’re expensing it to a client.',
    },
    {
      id: 'payment-methods',
      q: 'How do I pay?',
      a: 'Card payment through Stripe’s secure checkout (Visa, Mastercard, Amex and more, depending on your country). We never see or store your card details.',
    },
  ],
};

// PAYG packs for the pricing page. Order is the on-page order: Single (cheap
// impulse) then Starter (the ICP pack, featured "Most popular" centre anchor).
// Pro subscription is appended as a third card by PricingToggleSection.
export const PAYG_PACKS = [
  {
    id: 'single',
    title: PRICING_PAGE_COPY.singleTitle,
    priceLine: PRICING_PAGE_COPY.singleTopline,
    priceLines: [PRICING_PAGE_COPY.singleTopline],
    priceDisplay: PRICING_PAGE_COPY.singlePrice,
    exportsLabel: PRICING_PAGE_COPY.singleExports,
    description: PRICING_PAGE_COPY.singleDescription,
    points: PRICING_PAGE_COPY.singleFeatures,
    actionLabel: 'Buy 1 export',
    disabled: false,
    recommended: false,
    ctaNote: null,
    stripePackId: 'credits_1',
  },
  {
    id: 'payg-starter',
    title: PRICING_PAGE_COPY.paygStarterTitle,
    priceLine: PRICING_PAGE_COPY.paygStarterTopline,
    priceLines: [PRICING_PAGE_COPY.paygStarterTopline],
    priceDisplay: PRICING_PAGE_COPY.paygStarterPrice,
    perExport: PRICING_PAGE_COPY.paygStarterPerExport,
    exportsLabel: PRICING_PAGE_COPY.paygStarterExports,
    description: PRICING_PAGE_COPY.paygStarterDescription,
    points: PRICING_PAGE_COPY.paygStarterFeatures,
    actionLabel: 'Get 10 exports',
    disabled: false,
    recommended: true,
    badge: PRICING_PAGE_COPY.paygStarterBadge,
    ctaNote: null,
    stripePackId: 'credits_10',
  },
];

// Legacy PRICING_CARDS — kept for home page pricing preview section
export const PRICING_CARDS = [
  {
    id: 'free',
    title: PRICING_PAGE_COPY.freeTitle,
    priceLine: PRICING_PAGE_COPY.freeSubtitle,
    priceLines: [PRICING_PAGE_COPY.freeSubtitle],
    points: [
      PRICING_PAGE_COPY.freeExports,
      PRICING_PAGE_COPY.freeFeature,
      PRICING_PAGE_COPY.freeFeatureAlt,
    ],
    actionLabel: PRICING_PAGE_COPY.freeCtaLabel,
    actionType: 'link',
    actionHref: PRICING_PAGE_COPY.freeCtaHref,
    disabled: false,
    recommended: false,
    ctaNote: null,
  },
  {
    id: 'single',
    title: PRICING_PAGE_COPY.singleTitle,
    priceLine: PRICING_PAGE_COPY.singleTopline,
    priceLines: [
      PRICING_PAGE_COPY.singleTopline,
      `${PRICING_PAGE_COPY.singleExports} · ${PRICING_PAGE_COPY.singlePrice}`,
    ],
    points: PRICING_PAGE_COPY.singleFeatures,
    actionLabel: PRICING_PAGE_COPY.singleCtaLabel,
    disabled: false,
    recommended: false,
    ctaNote: null,
  },
  {
    id: 'payg-starter',
    title: PRICING_PAGE_COPY.paygStarterTitle,
    priceLine: PRICING_PAGE_COPY.paygStarterTopline,
    priceLines: [
      PRICING_PAGE_COPY.paygStarterTopline,
      `${PRICING_PAGE_COPY.paygStarterExports} · ${PRICING_PAGE_COPY.paygStarterPrice}`,
    ],
    perExport: PRICING_PAGE_COPY.paygStarterPerExport,
    points: PRICING_PAGE_COPY.paygStarterFeatures,
    actionLabel: PRICING_PAGE_COPY.paygStarterCtaLabel,
    disabled: false,
    recommended: true,
    badge: PRICING_PAGE_COPY.paygStarterBadge,
    ctaNote: null,
  },
];

export const LANDING_SECTIONS = (freeExportsLeft = null) => [
    {
      id: LANDING_COPY_KEYS.hero,
      title: LANDING_COPY.heroTitle,
      ctas: [
      { label: LANDING_COPY.heroPrimaryCta, href: '#generate', type: 'primary' },
    ],
    trustLines: [LANDING_COPY.heroTrustLine],
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.problem,
    title: LANDING_COPY.problemTitle,
    containsFreeQuotaText: false,
    bullets: LANDING_COPY.problemBullets,
  },
  {
    id: LANDING_COPY_KEYS.beforeAfter,
    title: LANDING_COPY.beforeAfterTitle,
    containsFreeQuotaText: false,
    component: 'before-after',
  },
  {
    id: LANDING_COPY_KEYS.clientReady,
    title: LANDING_COPY.clientReadyTitle,
    bullets: LANDING_COPY.clientReadyBullets,
    containsFreeQuotaText: false,
  },
  {
    id: 'credibility',
    title: LANDING_COPY.credibilityTitle,
    bullets: LANDING_COPY.credibilityBullets,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.upload,
    title: LANDING_COPY.toolTitle,
    freeQuotaText: freeExportsLeft == null ? 'Free exports left' : `Free: ${freeExportsLeft} exports left`,
    containsFreeQuotaText: true,
  },
  {
    id: LANDING_COPY_KEYS.pricingPreview,
    title: LANDING_COPY.pricingPreviewTitle,
    subline: LANDING_COPY.pricingPreviewSubline,
    cards: PRICING_CARDS.map(({ title, priceLines, recommended }) => ({
      title,
      copy: Array.isArray(priceLines) ? priceLines.join(' · ') : '',
      isRecommended: Boolean(recommended),
    })),
    cta: LANDING_COPY.pricingPreviewCta,
    href: '/pricing',
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.privacyStrip,
    title: LANDING_COPY.privacyStripTitle,
    bullets: LANDING_COPY.privacyStripBullets,
    containsFreeQuotaText: false,
    cta: LANDING_COPY.privacyStripCta,
    href: '/privacy',
  },
];

export const PRIVACY_PAGE_COPY = {
  heroLabel: 'PRIVACY',
  pageTitle: 'Your data.',
  pageTitleAccent: 'Not our business.',
  pageSubtitle: 'fitforpdf processes files, it does not store them.',
  microLine: '100% deterministic pipeline. No LLMs, no AI providers, no data leaves the EU.',

  handlingTitle: 'How file handling works',
  files: {
    title: 'Files',
    bullets: ['Files are deleted immediately after conversion.'],
  },
  generatedPdf: {
    title: 'Generated PDFs',
    bullets: ['The generated PDF is available for up to 15 minutes.', 'Automatically deleted after.'],
  },
  logs: {
    title: 'What we log',
    bullets: [
      'request timestamp',
      'file type',
      'row and column counts',
      'verdict and score',
      'We do not store file contents in logs.',
    ],
  },

  dontDoTitle: "What we don't do",
  dontDo: [
    'No LLM calls. No OpenAI, Anthropic, Google, your data never leaves our server.',
    'We do not read your documents. No human or model training.',
    'We do not resell your data. Ever.',
  ],

  infrastructureTitle: 'Infrastructure',
  infrastructure: [
    'Files are processed server-side.',
    'Files and outputs are automatically deleted.',
    'No long-term storage of user files.',
  ],

  legalBasis: {
    title: 'Legal basis',
    text: 'Processing is based on legitimate interest (Article 6(1)(f) GDPR): providing the file conversion service you requested. We collect only the minimum data necessary. Optional analytics and session replay run only on your consent (Article 6(1)(a)), which you can withdraw at any time.',
  },
  dataLocation: {
    title: 'Where your data lives',
    text: 'Files are processed on OVH servers in France (EU). Account metadata (plan type, credits balance, API keys) is stored on Supabase within the European Union. No data is transferred outside the EU.',
  },
  userRights: {
    title: 'Your GDPR rights',
    intro: 'As a data subject under GDPR, you have the right to:',
    rights: [
      'Access the data we hold about you',
      'Request correction of inaccurate data',
      'Request deletion of your data',
      'Request portability of your data',
    ],
    contact: 'To exercise these rights, contact:',
  },
  subProcessors: {
    title: 'Sub-processors',
    list: [
      { name: 'OVH', role: 'Cloud infrastructure & hosting', location: 'France (EU)' },
      { name: 'Supabase', role: 'Account metadata & quota tracking', location: 'AWS Europe (EU)' },
      { name: 'Stripe', role: 'Payment processing', location: 'EU data residency' },
      { name: 'PostHog', role: 'Product analytics & session replay — only with your consent', location: 'PostHog Cloud, EU (Frankfurt)' },
    ],
  },

  sensitiveDataNote: 'Do not upload highly regulated or special-category data unless you have verified your compliance requirements.',
  legalFooter: 'This page constitutes the Privacy Policy of fitforpdf, in accordance with GDPR (EU) 2016/679.',
  contactEmail: 'support@fitforpdf.com',
  contactLabel: 'support@fitforpdf.com',
  security: [
    'Files are processed server-side.',
    'Access controls are enforced for API endpoints.',
  ],
  faq: [
    {
      id: 'ai-llm',
      q: 'Do you use AI or LLMs to process my files?',
      a: 'No. The processing pipeline is 100% deterministic, a CSV parser, structural heuristics, and a PDF renderer. We make zero API calls to OpenAI, Anthropic, Google, or any other AI provider. Your file content never leaves our OVH server in France.',
    },
    {
      id: 'retention',
      q: 'How long do you keep files?',
      a: 'Input files are deleted immediately after conversion. The generated PDF is available for 15 minutes, then automatically deleted.',
    },
    {
      id: 'logs',
      q: 'What data do you log?',
      a: 'We log: request timestamp, file type (CSV/XLSX), row and column counts, and processing verdict. File contents are never stored in logs.',
    },
    {
      id: 'gdpr',
      q: 'Are you GDPR compliant?',
      a: 'Yes. Processing is based on legitimate interest (Art. 6(1)(f) GDPR). Files are processed on OVH servers in France. Account metadata is stored on Supabase in the EU. No transfers outside the EU.',
    },
    {
      id: 'rights',
      q: 'How do I exercise my GDPR rights?',
      a: 'Email support@fitforpdf.com to request access, correction, deletion, or portability of your data.',
    },
    {
      id: 'sensitive',
      q: 'Can I upload sensitive data?',
      a: 'Do so only if your organization has approved the file-processing requirements. If you are uncertain, avoid uploading highly sensitive or regulated data.',
    },
  ],
};

export const SEO = {
  siteUrl: 'https://www.fitforpdf.com',
  ogImage: 'https://www.fitforpdf.com/og-image.jpg',
  home: {
    title: 'fitforpdf, Send-Ready PDFs from Excel & CSV',
    description: 'Turn wide Excel and CSV exports into readable, send-ready PDFs with sections, pagination, and column grouping. 3 free exports. No account needed.',
  },
  developers: {
    title: 'fitforpdf API, Send-Ready PDFs from Excel & CSV',
    description: 'REST API to turn wide Excel and CSV tables into readable, structured PDFs for SaaS reporting, CRM exports, and AI-agent workflows. 25 free renders.',
  },
  pricing: {
    title: 'fitforpdf Pricing, Excel to PDF Export Plans',
    description: '3 free exports. Pay-as-you-go packs from $19. Pro subscription at $9.90/mo for 500 exports.',
  },
  privacy: {
    title: 'Privacy Policy, Your Data, Not Our Business',
    description: 'fitforpdf uses a 100% deterministic pipeline, no LLMs, no OpenAI, no Anthropic. Files deleted immediately after processing. GDPR compliant. Data processed in France.',
  },
  excelCutoff: {
    title: 'Fix Cut-Off Columns in Excel PDF Export',
    description: 'Learn why Excel cuts off columns when exporting to PDF and how to fix it, with manual tips and structured PDF export via fitforpdf.',
    slug: 'excel-to-pdf-columns-cut-off',
  },
  fitOnePage: {
    title: 'How to Fit a Large Excel Sheet on One PDF Page',
    description: 'Step-by-step guide to fit a large Excel sheet on one PDF page, manual scaling tips plus smarter structured export with fitforpdf.',
    slug: 'fit-excel-sheet-on-one-page-pdf',
  },
  csvPdf: {
    title: 'Convert CSV to Structured, Readable PDF',
    description: 'Learn how to convert wide CSV files into structured, readable PDFs with automatic sectioning and pagination via fitforpdf.',
    slug: 'csv-to-structured-pdf',
  },
  auditPdf: {
    title: 'Export Audit Excel Sheets to PDF, Best Practices',
    description: 'Best practices for exporting audit Excel reports to PDF that clients can read, including tools like fitforpdf for structured output.',
    slug: 'audit-report-excel-to-pdf-tips',
  },
  examples: {
    title: 'Real PDF Examples from Public Datasets, fitforpdf',
    description: 'See real PDFs generated from French government open data. Wide datasets with 20+ columns automatically structured into readable, paginated PDFs.',
    slug: 'examples',
  },
  forAuditors: {
    title: 'Client-Ready Audit PDFs from Excel',
    description: 'Convert wide Excel audit reports into client-ready PDFs with grouped columns, preserved references, and clean pagination.',
  },
  forConsultants: {
    title: 'Client-Ready PDFs for Consultants',
    description: 'Stop manually formatting client deliverables. Turn Excel and CSV exports into consistent, professional PDFs in seconds.',
  },
  forFinance: {
    title: 'Client-Ready PDF Reports for Finance Teams',
    description: 'Turn wide financial spreadsheets into client-ready PDF reports with every column readable and every page clearly structured.',
  },
  forSaas: {
    title: 'Client-Ready PDF Reports for SaaS Products',
    description: 'Automate client-ready PDF report generation for your SaaS product from exported dashboards, CSV datasets, and data tables.',
  },
};

export const TESTIMONIAL_QUOTES = [
  {
    quote: "We stopped fixing Excel exports manually. This saved us hours every week.",
    role: "Head of Operations",
    company: "B2B SaaS, CRM exports, 20+ columns",
    icon: "ops",
    featured: true,
  },
  {
    quote: "I used to spend 45 minutes reformatting every quarterly report. Now it takes 10 seconds.",
    role: "Senior Auditor",
    company: "Big 4 advisory, quarterly compliance reports",
    icon: "audit",
    featured: false,
  },
  {
    quote: "Our CRM export has 28 columns. fitforpdf turns it into something I can actually send to clients.",
    role: "Account Manager",
    company: "B2B SaaS, HubSpot/Salesforce exports",
    icon: "saas",
  },
  {
    quote: "Finally a tool that understands wide tables aren't meant to be shrunk to 6pt font.",
    role: "Finance Controller",
    company: "Mid-cap, monthly P&L with 40+ columns",
    icon: "finance",
  },
  {
    quote: "We integrated the API into our reporting pipeline in under an hour. PDF exports just work now.",
    role: "Product Engineer",
    company: "Analytics platform, automated client reports",
    icon: "dev",
    featured: true,
  },
  {
    quote: "Board presentations used to take a full day of copy-paste. Now I upload the Excel and it's done.",
    role: "Strategy Consultant",
    company: "Consulting, board decks from raw data exports",
    icon: "consulting",
  },
  {
    quote: "We stopped building internal PDF tooling. fitforpdf handles the edge cases we never could.",
    role: "Engineering Lead",
    company: "Fintech, transaction reports for compliance",
    icon: "dev",
  },
];

export const USE_CASES = [
  { icon: 'audit', title: 'Audit Firms', stat: '300 columns → 5 sections', time: '45min → 10sec', href: '/for-auditors' },
  { icon: 'saas', title: 'SaaS Reporting', stat: 'CRM data → client PDF', time: 'API integration', href: '/for-saas' },
  { icon: 'finance', title: 'Finance Teams', stat: 'Monthly KPIs → board-ready', time: 'Automated exports', href: '/for-finance' },
  { icon: 'consulting', title: 'Consultants', stat: 'Analytics → deliverable', time: 'No manual layout', href: '/for-consultants' },
];
