export const TELEGRAM_BOT_URL = 'https://t.me/CrabiAssistantBot';

export const LANDING_COPY = {
  logoText: 'FitForPDF',
  heroTitle: 'Client-ready PDFs. From messy spreadsheets.',
  heroSubheadline: 'Upload a CSV or Excel file. Get a structured PDF ready to send.',
  heroPrimaryCta: 'Generate PDF',
  heroTrustLine: 'Files are deleted immediately after conversion. PDF available for 15 minutes.',

  beforeAfterTitle: 'From raw data to structured document.',
  beforeLabel: 'CSV input',
  afterLabel: 'PDF output',

  problemTitle: 'Why spreadsheet exports fail in real life',
  problemBullets: [
    'Columns are cut.',
    'Text becomes unreadable after zoom.',
    'Manual layout fixes become mandatory.',
  ],

  clientReadyTitle: 'What “client-ready” means',
  clientReadyBullets: [
    'Document overview page',
    'Smart column sections',
    'Fixed reference columns',
    'Rows X–Y and Page i/n',
    'No manual layout',
  ],

  toolTitle: 'Generate a client-ready PDF',
  toolSubcopy: '3 free exports. No account required.',
  brandingOptionLabel: 'Add “Made with FitForPDF” footer',
  truncateOptionLabel: 'Truncate long text to reduce payload',
  truncateNotice: 'Truncation is off by default. Long text may overflow on small displays.',

  pricingPreviewTitle: 'Simple pricing.',
  pricingPreviewSubline: 'Pay per output. No lock-in.',
  pricingPreviewItems: [
    { label: 'Free', copy: '3 exports total' },
    { label: 'Credits 100', copy: '€19' },
    { label: 'Credits 500', copy: '€79' },
  ],
  pricingPreviewCta: 'See full pricing',

  privacyStripTitle: 'Privacy-first by default.',
  privacyStripBullets: [
    'Files are deleted immediately after conversion.',
    'PDFs are deleted after 15 minutes.',
    'We do not store file contents in logs.',
  ],
  privacyStripCta: 'Read privacy policy',

  footerLinks: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Try on Telegram', href: TELEGRAM_BOT_URL },
  ],
  footerCopyright: '© FitForPDF',
};

export const LANDING_COPY_KEYS = {
  hero: 'hero',
  beforeAfter: 'before-after',
  clientReady: 'client-ready',
  upload: 'tool',
  pricingPreview: 'pricing',
  privacyStrip: 'privacy',
  footer: 'footer',
  problem: 'problem',
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
      answer: 'Use the compact mode or reduce scope before exporting.',
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
    id: LANDING_COPY_KEYS.hero,
    title: LANDING_COPY.heroTitle,
    ctas: [
      { label: LANDING_COPY.heroPrimaryCta, href: '#tool', type: 'primary' },
    ],
    trustLines: [LANDING_COPY.heroTrustLine],
    containsFreeQuotaText: false,
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
    id: LANDING_COPY_KEYS.upload,
    title: LANDING_COPY.toolTitle,
    freeQuotaText: `Free: ${freeExportsLeft} exports left`,
    containsFreeQuotaText: true,
  },
  {
    id: LANDING_COPY_KEYS.pricingPreview,
    title: LANDING_COPY.pricingPreviewTitle,
    subline: LANDING_COPY.pricingPreviewSubline,
    cards: LANDING_COPY.pricingPreviewItems,
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
    'Access controls in place for key endpoints.',
  ],
  contactEmail: 'support@fitforpdf.com',
};
