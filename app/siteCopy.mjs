export const TELEGRAM_BOT_URL = 'https://t.me/CrabiAssistantBot';

export const LANDING_COPY = {
  logoText: 'FitForPDF',
  heroTitle: 'Client-ready PDFs. From messy spreadsheets.',
  heroSubheadline: 'Upload a CSV or Excel file. Get a structured PDF ready to send.',
  heroPrimaryCta: 'Generate PDF',
  heroTrustLine: 'Files are deleted immediately after conversion. PDF available for 15 minutes.',

  problemTitle: 'Why spreadsheet exports fail in real life',
  problemBullets: [
    'Columns are cut.',
    'Text becomes unreadable after zoom.',
    'Manual layout fixes become mandatory.',
  ],

  beforeAfterTitle: 'From raw data to structured document.',
  beforeLabel: 'CSV input',
  afterLabel: 'PDF output',

  clientReadyTitle: 'What “client-ready” means',
  clientReadyBullets: [
    'Document overview page',
    'Smart column sections',
    'Fixed reference columns repeated',
    'Rows X–Y and Page i/n',
    'No manual layout',
  ],

  toolTitle: 'Generate a client-ready PDF',
  toolSubcopy: '3 free exports. No account required.',

  pricingPreviewTitle: 'Simple and transparent',
  pricingPreviewSubline: 'Pay per output. No lock-in.',
  pricingPreviewCta: 'See full pricing',

  privacyStripTitle: 'Privacy-first by default.',
  privacyStripBullets: [
    'Files are deleted immediately after conversion.',
    'PDFs are deleted after 15 minutes.',
    'We do not store file contents in logs.',
  ],
  privacyStripCta: 'Read privacy policy',
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

export const PRICING_PAGE_COPY = {
  pageTitle: 'Simple and transparent',
  pageSubtitle: 'Pay per output. No lock-in.',

  freeTitle: 'Free',
  freeSubtitle: '3 exports total',
  freeFeature: 'Branding enabled',
  freeCtaLabel: 'Start free',
  freeCtaHref: '/#upload',

  creditsTitle: 'Credits',
  credits100Title: '100 exports',
  credits100Price: '€19',
  credits500Title: '500 exports',
  credits500Price: '€79',
  creditsCtaLabel: 'Buy credits',
  creditsCtaTooltip: 'Checkout coming soon.',

  proApiTitle: 'Pro and API',
  proPrice: '€29/month',
  proFeature1: 'API: usage-based',
  proFeature2: 'Batch export',
  proFeature3: 'Priority processing',
  proApiCtaLabel: 'Join early access',
  proApiCtaHref: 'mailto:support@fitforpdf.com',

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
    priceLines: [PRICING_PAGE_COPY.freeSubtitle],
    points: [PRICING_PAGE_COPY.freeFeature],
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
    priceLine: `${PRICING_PAGE_COPY.credits100Title} • ${PRICING_PAGE_COPY.credits100Price} · ${PRICING_PAGE_COPY.credits500Title} • ${PRICING_PAGE_COPY.credits500Price}`,
    priceLines: [
      `${PRICING_PAGE_COPY.credits100Title} • ${PRICING_PAGE_COPY.credits100Price}`,
      `${PRICING_PAGE_COPY.credits500Title} • ${PRICING_PAGE_COPY.credits500Price}`,
    ],
    points: [
      `${PRICING_PAGE_COPY.credits100Title} for ${PRICING_PAGE_COPY.credits100Price}`,
      `${PRICING_PAGE_COPY.credits500Title} for ${PRICING_PAGE_COPY.credits500Price}`,
    ],
    actionLabel: PRICING_PAGE_COPY.creditsCtaLabel,
    actionType: 'button',
    actionHref: '#',
    disabled: true,
    tooltip: PRICING_PAGE_COPY.creditsCtaTooltip,
    recommended: true,
    ctaNote: PRICING_PAGE_COPY.creditsCtaTooltip,
  },
  {
    id: 'proApi',
    title: PRICING_PAGE_COPY.proApiTitle,
    priceLine: PRICING_PAGE_COPY.proPrice,
    priceLines: [PRICING_PAGE_COPY.proPrice, PRICING_PAGE_COPY.proFeature1],
    points: [PRICING_PAGE_COPY.proFeature2, PRICING_PAGE_COPY.proFeature3],
    actionLabel: PRICING_PAGE_COPY.proApiCtaLabel,
    actionType: 'link',
    actionHref: PRICING_PAGE_COPY.proApiCtaHref,
    disabled: false,
    recommended: false,
    ctaNote: null,
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
    id: LANDING_COPY_KEYS.upload,
    title: LANDING_COPY.toolTitle,
    freeQuotaText: `Free. ${freeExportsLeft} exports left`,
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
