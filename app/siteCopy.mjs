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
    { key: 'auto', title: 'No manual layout', description: 'Zero configuration \u2014 upload and get a structured PDF.', icon: 'wand' },
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
    'Consultants',
    'Finance teams',
    'Accountants',
    'Operations managers',
    'Auditors',
    'Project managers',
  ],

  finalCtaTitle: 'Ready to send professional PDFs?',
  finalCtaCopy: 'No signup required. Free exports included.',
  finalCtaLabel: 'Try it now',

  footerTagline: 'Transform spreadsheets into professional PDFs.',
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
  pageTitle: 'Pay only when it’s worth sending.',
  pageSubtitle: 'Start free. Upgrade when your PDFs are client-ready.',
  pageTagline: 'No subscriptions. No lock-in.',
  pageMicro: 'No subscriptions. No lock-in.',
  socialProof: 'Used by consultants, finance teams, and operators who need clean PDFs without manual formatting.',

  plansEyebrow: 'PRICING',
  plansTitle: 'Choose a plan that scales with output.',
  plansCopy: 'Start free. Keep everything predictable when you need more.',

  freeTitle: 'Free',
  freeSubtitle: '$0 forever',
  freeFeature: 'No watermark removal',
  freeFeatureAlt: 'Account-free',
  freeCtaLabel: 'Start free',
  freeCtaHref: '/#upload',

  creditsTitle: 'Credits',
  creditsTopline: 'Pay per output',
  credits100Title: '100 exports',
  credits100Price: '€19',
  credits500Title: '500 exports',
  credits500Price: '€79',
  creditsFeature: 'One-time purchase',
  creditsFeature2: 'Remove watermark',
  creditsFeature3: 'Client-ready layout',
  creditsFeature4: 'Structured sections',
  creditsCtaLabel: 'Buy credits',
  creditsCtaHref: '#',
  creditsCtaTooltip: 'Payments coming soon. Contact us.',
  creditsBadge: 'Most popular',
  proApiTitle: 'Team/API',
  proApiCtaLabel: 'Contact us',
  proApiCtaHref: 'mailto:hello@fitforpdf.com',

  backToApp: 'Back to app',
  backToAppHref: '/',

  comparisonTitle: 'Compare features',
  comparison: [
    ['Client-ready PDF output', '✓', '✓'],
    ['Branding removable', '✗', '✓'],
    ['Batch export', '✗', '✗'],
    ['API access', '✗', 'Contact us'],
  ],

  faqTitle: 'FAQs',
  faq: [
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
      id: 'client-work',
      q: 'Can I use this for client work?',
      a: 'Yes. We keep the output consistent for predictable reviews and shared PDFs.',
    },
    {
      id: 'api',
      q: 'Do you offer an API?',
      a: 'We support Team/API access—please contact us to discuss your volume and requirements.',
    },
  ],
};

export const PRICING_CARDS = [
  {
    id: 'free',
    title: PRICING_PAGE_COPY.freeTitle,
    priceLine: `${PRICING_PAGE_COPY.freeSubtitle}`,
    priceLines: [PRICING_PAGE_COPY.freeSubtitle],
    points: [PRICING_PAGE_COPY.freeFeature, PRICING_PAGE_COPY.freeFeatureAlt],
    actionLabel: PRICING_PAGE_COPY.freeCtaLabel,
    actionType: 'link',
    actionHref: PRICING_PAGE_COPY.freeCtaHref,
    disabled: false,
    recommended: false,
    ctaNote: null,
  },
  {
    id: 'credits',
    title: PRICING_PAGE_COPY.creditsTitle,
    priceLine: PRICING_PAGE_COPY.creditsTopline,
    priceLines: [
      PRICING_PAGE_COPY.creditsTopline,
      `${PRICING_PAGE_COPY.credits100Title} · ${PRICING_PAGE_COPY.credits100Price}`,
      `${PRICING_PAGE_COPY.credits500Title} · ${PRICING_PAGE_COPY.credits500Price}`,
    ],
    points: [
      `${PRICING_PAGE_COPY.creditsFeature}`,
      `${PRICING_PAGE_COPY.creditsFeature2}`,
      `${PRICING_PAGE_COPY.creditsFeature3}`,
      `${PRICING_PAGE_COPY.creditsFeature4}`,
    ],
    actionLabel: PRICING_PAGE_COPY.creditsCtaLabel,
    actionType: 'button',
    actionHref: '#',
    disabled: true,
    tooltip: PRICING_PAGE_COPY.creditsCtaTooltip,
    recommended: true,
    badge: PRICING_PAGE_COPY.creditsBadge,
    ctaNote: PRICING_PAGE_COPY.creditsCtaTooltip,
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

  dontDoTitle: 'What we don’t do',
  dontDo: [
    'We do not read your documents.',
    'We do not train models on your files.',
    'We do not resell your data.',
  ],

  infrastructureTitle: 'Infrastructure',
  infrastructure: [
    'Files are processed server-side.',
    'Files and outputs are automatically deleted.',
    'No long-term storage of user files.',
  ],

  sensitiveDataNote: 'Do not upload sensitive data.',
  legalFooter: 'For legal terms, see Terms of Service.',
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
      a: 'Files are deleted immediately after conversion. The generated PDF is available for up to 15 minutes.',
    },
    {
      id: 'logs',
      q: 'Do you store file contents in logs?',
      a: 'No. We do not store file contents in logs.',
    },
    {
      id: 'sensitive',
      q: 'Can I upload sensitive data?',
      a: 'Please do not. FitForPDF is built for convenience, not for handling sensitive or regulated data.',
    },
  ],
};
