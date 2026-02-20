export const TELEGRAM_BOT_URL = 'https://t.me/CrabiAssistantBot';

export const LANDING_COPY = {
  logoText: 'FitForPDF',
  heroTitle: 'Client-ready PDFs.\\nFrom raw data.',
  heroSubheadline: 'Upload a spreadsheet. Get a structured, readable PDF. Ready to send to your client.',
  heroLabel: 'FITFORPDF',
  heroPrimaryCta: 'Generate PDF',
  heroTrustLine: 'GDPR Compliant · Data processed in France · Files deleted after conversion · No content stored',
  heroTrustRow: 'No account. No tracking of file contents. Works with CSV and XLSX.',

  problemTitle: 'Spreadsheet exports fail in real life.',
  problemBullets: [
    'Columns are cut.',
    'Text becomes unreadable after zoom.',
    'Manual layout fixes become mandatory.',
  ],

  beforeAfterTitle: 'From raw data to structured document.',
  beforeLabel: 'CSV input',
  afterLabel: 'Structured PDF summary',

  clientReadyTitle: 'Client-ready means',
  clientReadyFeatures: [
    { key: 'overview', title: 'Document overview page', description: 'A summary page with all sections and columns at a glance.', icon: 'overview' },
    { key: 'columns', title: 'Smart column sections', description: 'Wide tables automatically grouped into readable column blocks.', icon: 'columns' },
    { key: 'pinned', title: 'Fixed reference columns', description: 'Key columns like ID and Name repeated in every section.', icon: 'pin' },
    { key: 'pagination', title: 'Rows X\u2013Y and Page i/n', description: 'Clear row ranges and page numbers on every page.', icon: 'pagination' },
    { key: 'auto', title: 'Auto-structured', description: 'Zero configuration \u2014 upload and get a structured PDF.', icon: 'wand' },
    { key: 'toc', title: 'Clickable TOC links', description: 'Jump to any section directly from the overview page.', icon: 'link' },
  ],
  clientReadyBullets: [
    'Document overview page',
    'Smart column sections',
    'Fixed reference columns',
    'Rows X\u2013Y and Page i/n',
    'No manual layout',
    'Clickable TOC links',
  ],

  toolTitle: 'Generate a client-ready PDF',
  toolSubcopy: 'Free exports. No account required.',

  credibilityTitle: 'Why this is reliable',
  credibilityBullets: [
    'Overview page included',
    'Columns grouped into sections',
    'Rows X–Y and Page i/n',
  ],
  credibilityMicro: "If it looks wrong once, you won't trust it. FitForPDF is built for the first try.",

  pricingPreviewTitle: 'Simple pricing.',
  pricingPreviewSubline: 'Pay only for what you export.',
  pricingPreviewCta: 'See full pricing',

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

  finalCtaTitle: 'Ready to send professional PDFs?',
  finalCtaCopy: 'No signup required. Free exports included.',
  finalCtaLabel: 'Try it now',

  footerTagline: 'Transform spreadsheets into professional PDFs.',
  footerMakerName: 'Sébastien',
  footerMakerHref: 'https://www.linkedin.com/in/sebastienneusch/',

  socialProofCount: '1,187 professionals use FitForPDF this week',
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
    id: 'what-counts',
    q: 'What counts as an export?',
    a: 'A successful PDF generation (HTTP 200 with a PDF response).',
  },
  {
    id: 'do-you-store',
    q: 'Do you store my files?',
    a: 'No. Files are deleted immediately after conversion. The generated PDF is available for up to 15 minutes.',
  },
  {
    id: 'client-work',
    q: 'Is this suitable for client work?',
    a: 'Yes. FitForPDF produces a predictable, client-ready layout: overview page, column sections, repeated reference columns, and clear pagination.',
  },
  {
    id: 'api',
    q: 'Do you offer an API?',
    a: 'Contact us for Team/API access and dedicated onboarding.',
  },
];

export const PRICING_PAGE_COPY = {
  pageTitle: "Simple pricing. Built for professionals.",
  pageSubtitle: 'Transform your spreadsheets into client-ready PDFs. Choose exactly how you want to pay.',
  pageTagline: 'No subscriptions. No lock-in.',
  pageMicro: 'No subscriptions. No lock-in.',
  socialProof: 'Used by consultants, finance teams, and operators who need clean PDFs without manual formatting.',

  // Toggle labels
  togglePayg: 'Pay as you go',
  togglePro: 'Pro Subscription',

  // PAYG section
  paygTagline: 'No subscription. Credits never expire.',

  // Pack Single (coming soon — no Stripe ID yet)
  singleTitle: 'Single',
  singleTopline: 'One-time payment',
  singlePrice: '$2.90',
  singleExports: '1 export',
  singleDescription: 'Ideal for a quick, urgent export.',
  singleCtaLabel: 'Buy 1 export',
  singleFeatures: ['1 PDF export', 'No FitForPDF watermark', 'Standard structured layout', 'Never expires'],

  // Pack Starter (coming soon — no Stripe ID yet)
  paygStarterTitle: 'Starter',
  paygStarterTopline: 'One-time payment',
  paygStarterPrice: '$15',
  paygStarterPerExport: 'Only $1.50 per export',
  paygStarterExports: '10 exports',
  paygStarterDescription: 'The smart choice for freelancers and easy expense reports.',
  paygStarterCtaLabel: 'Get 10 exports',
  paygStarterBadge: 'Most popular',
  paygStarterFeatures: ['10 PDF exports', 'No FitForPDF watermark', 'Standard structured layout', 'Never expires'],

  // Pack Volume (uses credits_100 / $19 — existing Stripe)
  volumeTitle: 'Volume',
  volumeTopline: 'One-time payment',
  volumePrice: '$49',
  volumePerExport: 'Only $0.49 per export',
  volumeExports: '100 exports',
  volumeDescription: 'For busy consultants with regular reporting needs.',
  volumeCtaLabel: 'Get 100 exports',
  volumeFeatures: ['100 PDF exports', 'No FitForPDF watermark', 'Standard structured layout', 'Never expires'],

  // Pro subscription
  proTagline: 'Everything you need to scale your reporting.',
  proSubTagline: 'Cancel anytime.',
  proSubscriptionTitle: 'Pro',
  proMonthlyPrice: '$29',
  proMonthlyPeriod: '/ month',
  proYearlyPrice: '$290',
  proYearlyPeriod: '/ year',
  proYearlySaving: '2 months free',
  proExports: '500 PDF exports per month',
  proCtaLabel: 'Subscribe to Pro',
  proFeatures: [
    '500 PDF exports per month',
    'No FitForPDF watermark',
    'Advanced layout controls',
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
  freeFeature: 'FitForPDF branding included',
  freeFeatureAlt: 'Account-free',
  freeCtaLabel: 'Start free',
  freeCtaHref: '/#upload',
  freeSafetyTitle: 'Just want to test the waters?',
  freeSafetyDesc: '3 free exports. FitForPDF watermark included. No account needed.',
  freeSafetyCtaLabel: 'Upload a file for free →',
  freeSafetyCtaHref: '/#generate',

  proApiTitle: 'Team / API',
  proApiTagline: 'Need higher volume, API access, or team seats?',
  proApiCtaLabel: 'Contact us',
  proApiCtaHref: 'mailto:hello@fitforpdf.com',
  proApiFeatures: [
    'Unlimited exports',
    'REST API access',
    'Team seats & shared billing',
    'White-label output',
    'Custom SLA & priority support',
  ],

  backToApp: 'Back to app',
  backToAppHref: '/',

  comparisonTitle: 'Compare features',
  comparison: [
    ['Client-ready PDF output', '✓', '✓', '✓', '✓'],
    ['FitForPDF attribution', '✓ included', '✗ removed', '✗ removed', '✗ removed'],
    ['Credits expire', 'N/A', '✗ never', '✗ never', 'monthly reset'],
    ['Batch export', '✗', '✗', '✗', '✗'],
    ['API access', '✗', '✗', '✗', 'Contact us'],
  ],

  faqTitle: 'Frequently Asked Questions',
  faq: [
    {
      id: 'expire',
      q: 'Do my "Pay as you go" credits expire?',
      a: 'No. If you buy a pack of 10 or 100 exports, they remain in your account forever until you use them.',
    },
    {
      id: 'subscription',
      q: 'Is the Starter pack a subscription?',
      a: 'Absolutely not. The Pay as you go options are strictly one-time payments. We will never auto-charge your card. If you want a recurring plan, check out our Pro Subscription.',
    },
    {
      id: 'branding',
      q: 'Will my clients see the FitForPDF logo?',
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
  ],
};

// PAYG packs for the pricing page (used in the Pay-as-you-go view)
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
  },
  {
    id: 'volume',
    title: PRICING_PAGE_COPY.volumeTitle,
    priceLine: PRICING_PAGE_COPY.volumeTopline,
    priceLines: [PRICING_PAGE_COPY.volumeTopline],
    priceDisplay: PRICING_PAGE_COPY.volumePrice,
    perExport: PRICING_PAGE_COPY.volumePerExport,
    exportsLabel: PRICING_PAGE_COPY.volumeExports,
    description: PRICING_PAGE_COPY.volumeDescription,
    points: PRICING_PAGE_COPY.volumeFeatures,
    actionLabel: PRICING_PAGE_COPY.volumeCtaLabel,
    disabled: false,
    recommended: false,
    ctaNote: null,
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
  {
    id: 'volume',
    title: PRICING_PAGE_COPY.volumeTitle,
    priceLine: PRICING_PAGE_COPY.volumeTopline,
    priceLines: [
      PRICING_PAGE_COPY.volumeTopline,
      `${PRICING_PAGE_COPY.volumeExports} · ${PRICING_PAGE_COPY.volumePrice}`,
    ],
    perExport: PRICING_PAGE_COPY.volumePerExport,
    points: PRICING_PAGE_COPY.volumeFeatures,
    actionLabel: PRICING_PAGE_COPY.volumeCtaLabel,
    disabled: false,
    recommended: false,
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
  pageSubtitle: 'FitForPDF processes files — it does not store them.',
  microLine: 'No accounts. No tracking of file contents.',

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
    'No AI processing. No model training.',
    'We do not read your documents.',
    'We do not resell your data.',
  ],

  infrastructureTitle: 'Infrastructure',
  infrastructure: [
    'Files are processed server-side.',
    'Files and outputs are automatically deleted.',
    'No long-term storage of user files.',
  ],

  legalBasis: {
    title: 'Legal basis',
    text: 'Processing is based on legitimate interest (Article 6(1)(f) GDPR): providing the file conversion service you requested. We collect only the minimum data necessary.',
  },
  dataLocation: {
    title: 'Where your data lives',
    text: 'All files are processed exclusively on OVH servers located in France (EU). No data is transferred outside the European Union.',
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
      { name: 'Stripe', role: 'Payment processing', location: 'EU data residency' },
    ],
  },

  sensitiveDataNote: 'Do not upload files containing personal data, health records, or other sensitive information. FitForPDF is not designed for regulated data.',
  legalFooter: 'This page constitutes the Privacy Policy of FitForPDF, in accordance with GDPR (EU) 2016/679.',
  contactEmail: 'support@fitforpdf.com',
  contactLabel: 'support@fitforpdf.com',
  security: [
    'Files are processed server-side.',
    'Access controls are enforced for API endpoints.',
  ],
  faq: [
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
      a: 'Yes. Processing is based on legitimate interest (Art. 6(1)(f) GDPR). Data stays on OVH servers in France. No transfers outside the EU.',
    },
    {
      id: 'rights',
      q: 'How do I exercise my GDPR rights?',
      a: 'Email support@fitforpdf.com to request access, correction, deletion, or portability of your data.',
    },
    {
      id: 'sensitive',
      q: 'Can I upload sensitive data?',
      a: 'Please do not. FitForPDF is not designed for sensitive or regulated data (health records, financial PII, etc.).',
    },
  ],
};
