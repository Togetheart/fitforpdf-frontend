export const TELEGRAM_BOT_URL = 'https://t.me/CrabiAssistantBot';

export const LANDING_COPY = {
  heroTitle: 'Client-ready PDFs from messy spreadsheets.',
  heroSubheadline: 'Upload a CSV or Excel file and get a structured PDF ready to send.',
  heroPrimaryCta: 'Generate your PDF',
  heroSecondaryCta: 'See pricing',
  heroTrustLine: 'Files are deleted immediately after conversion.',
  telegramCta: 'Try on Telegram',

  problemTitle: 'Why spreadsheet exports fail in real life',
  problemBullets: [
    'Cut columns',
    'Unreadable zoom',
    'Manual layout fixes',
  ],

  clientReadyTitle: 'What “client-ready” means',
  clientReadyBullets: [
    'Document overview page',
    'Smart column sections (A/B/C when needed)',
    'Fixed reference columns repeated',
    'Rows X–Y and Page i/n',
    'No manual layout',
  ],

  howItWorksTitle: 'In 3 steps',
  howItWorksSteps: [
    'Upload your CSV/Excel file',
    'We organize it into clean sections',
    'Download a client-ready PDF',
  ],

  toolTitle: 'Try FitForPDF',
  toolSubcopy: '3 free exports. No account required.',

  pricingTitle: 'Simple pricing',
  pricingFreeTitle: 'Free',
  pricingFreeCopy: '3 exports total',
  pricingCredits100Title: 'Credits 100',
  pricingCredits100Copy: '€19',
  pricingCredits500Title: 'Credits 500',
  pricingCredits500Copy: '€79',
  pricingProTitle: 'Pro',
  pricingProCopy: 'Coming soon',
  pricingApiTitle: 'API',
  pricingApiCopy: 'Coming soon',
  pricingCtaLabel: 'See full pricing',

  privacyTitle: 'Privacy-first by default',
  privacyBullets: [
    'Files are deleted immediately after conversion.',
    'The generated PDF is available for up to 15 minutes.',
    'We do not store file contents in logs.',
  ],
};

export const LANDING_COPY_KEYS = {
  hero: 'hero',
  problem: 'problem',
  clientReady: 'client-ready',
  how: 'how-it-works',
  tool: 'tool',
  pricing: 'pricing',
  privacy: 'privacy',
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
  apiCopy: 'Usage-based. Contact us.',
  apiCtaLabel: 'Join early access',
  apiCtaHref: 'mailto:support@fitforpdf.com',
  backToApp: 'Back to app',
  backToAppHref: '/',
  retentionTitle: 'Privacy & retention',
  filesDeleted: 'Files are deleted after 15 minutes',
  pdfsDeleted: 'PDFs are deleted after 24 hours',
  noLogs: 'We do not store file contents in logs.',
  plannedLabel: 'Planned',
};

export const PRICING_CARDS = [
  {
    id: 'free',
    title: PRICING_PAGE_COPY.freeTitle,
    priceLine: PRICING_PAGE_COPY.freeSubtitle,
    amountLine: '',
    points: [PRICING_PAGE_COPY.freeFeature],
    actionLabel: PRICING_PAGE_COPY.freeCtaLabel,
    actionType: 'link',
    actionHref: '/#tool',
    disabled: false,
  },
  {
    id: 'credits100',
    title: `${PRICING_PAGE_COPY.creditsTitle} 100`,
    priceLine: `${PRICING_PAGE_COPY.credits100Title} . ${PRICING_PAGE_COPY.credits100Price}`,
    amountLine: '',
    points: [],
    actionLabel: PRICING_PAGE_COPY.creditsCtaLabel,
    actionType: 'button',
    disabled: true,
    tooltip: PRICING_PAGE_COPY.creditsCtaTooltip,
    recommended: true,
  },
  {
    id: 'credits500',
    title: `${PRICING_PAGE_COPY.creditsTitle} 500`,
    priceLine: `${PRICING_PAGE_COPY.credits500Title} . ${PRICING_PAGE_COPY.credits500Price}`,
    amountLine: '',
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
    amountLine: '',
    points: [PRICING_PAGE_COPY.proFeature1, PRICING_PAGE_COPY.proFeature2],
    actionLabel: PRICING_PAGE_COPY.proCtaLabel,
    actionType: 'button',
    disabled: true,
  },
  {
    id: 'api',
    title: PRICING_PAGE_COPY.apiTitle,
    priceLine: 'Usage-based',
    amountLine: '',
    points: [],
    actionLabel: PRICING_PAGE_COPY.apiCtaLabel,
    actionType: 'link',
    actionHref: PRICING_PAGE_COPY.apiCtaHref,
    disabled: false,
  },
];

export const PRICING_FAQ = [
  {
    question: 'What counts as an export?',
    answer: 'A successful PDF generation.',
  },
  {
    question: 'Do you store files?',
    answer: 'See Privacy.',
    link: '/privacy',
  },
  {
    question: 'What if my export is huge?',
    answer: 'Use compact mode or reduce the scope.',
  },
];

export const LANDING_SECTIONS = (freeExportsLeft = 3) => [
  {
    id: LANDING_COPY_KEYS.hero,
    title: LANDING_COPY.heroTitle,
    ctas: [
      { label: LANDING_COPY.heroPrimaryCta, href: '#tool' },
      { label: LANDING_COPY.heroSecondaryCta, href: '/pricing' },
      { label: LANDING_COPY.telegramCta, href: TELEGRAM_BOT_URL },
    ],
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.problem,
    title: LANDING_COPY.problemTitle,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.clientReady,
    title: LANDING_COPY.clientReadyTitle,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.how,
    title: LANDING_COPY.howItWorksTitle,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.tool,
    title: LANDING_COPY.toolTitle,
    containsFreeQuotaText: true,
    freeQuotaText: `Free exports left: ${freeExportsLeft} / 3`,
  },
  {
    id: LANDING_COPY_KEYS.pricing,
    title: LANDING_COPY.pricingTitle,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.privacy,
    title: LANDING_COPY.privacyTitle,
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
    'Policy: Files are deleted immediately after conversion.',
    'Policy: The generated PDF is available for up to 15 minutes.',
  ],
  sensitiveDataNote: 'Policy: Do not upload sensitive data.',
  logs: [
    'We do not store file contents in logs.',
    'We may store operational metrics to improve reliability.',
  ],
  security: [
    'Policy: Transport encryption (HTTPS).',
    'Policy: Access controls (API key).',
  ],
  contactEmail: 'support@fitforpdf.com',
};
