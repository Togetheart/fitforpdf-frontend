export const TELEGRAM_BOT_URL = 'https://t.me/CrabiAssistantBot';

export const LANDING_COPY = {
  heroTitle: 'Client-ready PDFs. From messy spreadsheets.',
  heroSubheadline: 'Upload a CSV or Excel file and get a structured PDF ready to send.',
  heroPrimaryCta: 'Generate PDF',
  heroSecondaryCta: 'See pricing',
  heroTertiaryCta: 'Try on Telegram',
  heroTrustLine: 'Files are deleted immediately after conversion. PDF is available for up to 15 minutes.',

  topBarLinks: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Privacy', href: '/privacy' },
  ],

  beforeAfterTitle: 'Before / After',
  beforeLabel: 'CSV INPUT',
  afterLabel: 'PDF OUTPUT',

  problemTitle: 'Why spreadsheet exports fail in real life',
  problemBullets: [
    'Columns are cut',
    'Zoom makes text unreadable',
    'Manual layout fixes become unavoidable',
  ],

  clientReadyTitle: 'What “client-ready” means',
  clientReadyBullets: [
    'Document overview page',
    'Smart column sections (A/B/C when needed)',
    'Fixed reference columns repeated',
    'Rows X–Y and Page i/n',
  ],

  howItWorksTitle: 'In 3 steps',
  howItWorksSteps: [
    'Upload a CSV or XLSX file.',
    'We organize it into readable sections.',
    'Download a client-ready PDF.',
  ],

  toolTitle: 'Try FitForPDF on the web',
  toolSubcopy: '3 free exports. No account required.',
  brandingOptionLabel: 'Add “Made with FitForPDF” footer',
  truncateOptionLabel: 'Truncate long text to reduce payload',
  truncateNotice: 'Truncation is off by default. Long text may overflow on small displays.',

  pricingPreviewTitle: 'Simple pricing',
  pricingPreviewCards: [
    { title: 'Free', copy: '3 exports total', cta: 'See full pricing', href: '/pricing' },
    { title: 'Credits 100', copy: '€19', cta: 'See full pricing', href: '/pricing' },
    { title: 'Credits 500', copy: '€79', cta: 'See full pricing', href: '/pricing' },
    { title: 'Pro', copy: 'Coming soon', cta: 'See full pricing', href: '/pricing' },
    { title: 'API', copy: 'Coming soon', cta: 'See full pricing', href: '/pricing' },
  ],

  privacyStripTitle: 'Privacy-first by default',
  privacyStripBullets: [
    'Files are deleted immediately after conversion.',
    'The generated PDF is available for up to 15 minutes.',
    'We do not store file contents in logs.',
  ],
  privacyStripCta: 'See privacy',

  footerLinks: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Try on Telegram', href: TELEGRAM_BOT_URL },
  ],
  footerCopyright: '© FitForPDF',
  logoText: 'FitForPDF',
};

export const LANDING_COPY_KEYS = {
  topBar: 'topbar',
  hero: 'hero',
  problem: 'problem',
  beforeAfter: 'before-after',
  clientReady: 'client-ready',
  howItWorks: 'how-it-works',
  tool: 'tool',
  pricingPreview: 'pricing-preview',
  privacyStrip: 'privacy-strip',
  footer: 'footer',
};

export const PRICING_PAGE_COPY = {
  pageTitle: 'Pricing',
  pageSubtitle: 'Pay per output. No lock-in.',
  freeTitle: 'Free',
  freeSubtitle: '3 exports total',
  freeFeature: 'Branding enabled',
  freeCtaLabel: 'Start free',
  creditsTitle: 'Credits',
  credits100Title: '100 exports',
  credits100Price: '€19',
  credits500Title: '500 exports',
  credits500Price: '€79',
  creditsCtaLabel: 'Buy credits',
  creditsCtaTooltip: 'Coming soon',
  proTitle: 'Pro (coming soon)',
  proPrice: '€29/month',
  proFeature1: 'Batch export',
  proFeature2: 'Priority processing',
  proCtaLabel: 'Coming soon',
  apiTitle: 'API (coming soon)',
  apiCopy: 'Usage-based',
  apiCtaLabel: 'Join early access',
  apiCtaHref: 'mailto:support@fitforpdf.com',
  backToApp: 'Back to app',
  backToAppHref: '/',
  faq: [
    {
      question: 'What counts as an export?',
      answer: 'A successful PDF generation.',
    },
    {
      question: 'Do you store files?',
      answer: 'See /privacy',
      link: '/privacy',
    },
    {
      question: 'What if my file is huge?',
      answer: 'Use the compact flow or reduce scope before exporting.',
    },
  ],
};

export const PRICING_CARDS = [
  {
    id: 'free',
    title: PRICING_PAGE_COPY.freeTitle,
    priceLine: PRICING_PAGE_COPY.freeSubtitle,
    points: [PRICING_PAGE_COPY.freeFeature],
    actionLabel: PRICING_PAGE_COPY.freeCtaLabel,
    actionType: 'link',
    actionHref: '/#tool',
    disabled: false,
  },
  {
    id: 'credits100',
    title: `${PRICING_PAGE_COPY.creditsTitle} ${PRICING_PAGE_COPY.credits100Title}`,
    priceLine: PRICING_PAGE_COPY.credits100Price,
    points: [],
    actionLabel: PRICING_PAGE_COPY.creditsCtaLabel,
    actionType: 'button',
    disabled: true,
    tooltip: PRICING_PAGE_COPY.creditsCtaTooltip,
    recommended: true,
  },
  {
    id: 'credits500',
    title: `${PRICING_PAGE_COPY.creditsTitle} ${PRICING_PAGE_COPY.credits500Title}`,
    priceLine: PRICING_PAGE_COPY.credits500Price,
    points: [],
    actionLabel: PRICING_PAGE_COPY.creditsCtaLabel,
    actionType: 'button',
    disabled: true,
    tooltip: PRICING_PAGE_COPY.creditsCtaTooltip,
  },
  {
    id: 'pro',
    title: PRICING_PAGE_COPY.proTitle,
    priceLine: PRICING_PAGE_COPY.proPrice,
    points: [PRICING_PAGE_COPY.proFeature1, PRICING_PAGE_COPY.proFeature2],
    actionLabel: PRICING_PAGE_COPY.proCtaLabel,
    actionType: 'button',
    disabled: true,
  },
  {
    id: 'api',
    title: PRICING_PAGE_COPY.apiTitle,
    priceLine: PRICING_PAGE_COPY.apiCopy,
    points: [],
    actionLabel: PRICING_PAGE_COPY.apiCtaLabel,
    actionType: 'link',
    actionHref: PRICING_PAGE_COPY.apiCtaHref,
    disabled: false,
  },
];

export const LANDING_SECTIONS = (freeExportsLeft = 3) => [
  {
    id: LANDING_COPY_KEYS.topBar,
    title: LANDING_COPY.logoText,
    links: LANDING_COPY.topBarLinks,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.hero,
    title: LANDING_COPY.heroTitle,
    ctas: [
      { label: LANDING_COPY.heroPrimaryCta, href: '#tool', type: 'primary' },
      { label: LANDING_COPY.heroSecondaryCta, href: '/pricing', type: 'secondary' },
      { label: LANDING_COPY.heroTertiaryCta, href: TELEGRAM_BOT_URL, type: 'tertiary' },
    ],
    trustLines: [LANDING_COPY.heroTrustLine],
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.problem,
    title: LANDING_COPY.problemTitle,
    bullets: LANDING_COPY.problemBullets,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.beforeAfter,
    title: LANDING_COPY.beforeAfterTitle,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.clientReady,
    title: LANDING_COPY.clientReadyTitle,
    bullets: LANDING_COPY.clientReadyBullets,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.howItWorks,
    title: LANDING_COPY.howItWorksTitle,
    bullets: LANDING_COPY.howItWorksSteps,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.tool,
    title: LANDING_COPY.toolTitle,
    freeQuotaText: `Free exports left: ${freeExportsLeft} / 3`,
    containsFreeQuotaText: true,
  },
  {
    id: LANDING_COPY_KEYS.pricingPreview,
    title: LANDING_COPY.pricingPreviewTitle,
    cards: LANDING_COPY.pricingPreviewCards,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.privacyStrip,
    title: LANDING_COPY.privacyStripTitle,
    bullets: LANDING_COPY.privacyStripBullets,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.footer,
    links: LANDING_COPY.footerLinks,
    title: 'Footer',
    containsFreeQuotaText: false,
  },
];

export const PRIVACY_PAGE_COPY = {
  pageTitle: 'Privacy',
  intro: 'FitForPDF processes uploaded files to generate PDFs.',
  dataProcessed: [
    'Uploaded file content (CSV/XLSX)',
    'Generated PDF',
    'Operational metadata (rows, columns, verdict, error codes) without file content',
  ],
  retention: [
    'Files are deleted immediately after conversion.',
    'The generated PDF is available for up to 15 minutes.',
  ],
  sensitiveDataNote: 'Do not upload sensitive data.',
  logs: [
    'We do not store file contents in logs.',
    'We may store operational metrics to improve reliability.',
  ],
  security: [
    'Transport encryption (HTTPS).',
    'Access controls (API key).',
  ],
  contactEmail: 'support@fitforpdf.com',
};
