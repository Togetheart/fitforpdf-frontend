export const TELEGRAM_BOT_URL = 'https://t.me/CrabiAssistantBot';

export const LANDING_COPY = {
  logoText: 'FitForPDF',
  heroTitle: 'Client-ready PDFs. From messy spreadsheets.',
  heroSubheadline: 'Upload a CSV or Excel file.\\nGet a structured PDF ready to send.',
  heroLabel: 'FITFORPDF',
  heroPrimaryCta: 'Generate PDF',
  heroTrustLine: 'No accounts. Files deleted after conversion.',

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
  clientReadyBullets: [
    'Document overview page',
    'Smart column sections',
    'Fixed reference columns repeated',
    'Rows X–Y and Page i/n',
    'No manual layout',
  ],

  toolTitle: 'Try it now',
  toolSubcopy: '3 free exports. No account required.',

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
    a: 'Not yet. API access is planned once the core workflow is proven.',
  },
];

export const PRICING_PAGE_COPY = {
  pageTitle: 'Pay only for what you export.',
  pageSubtitle: 'Start free. Upgrade only when your PDFs are worth sending.',
  pageMicro: 'No lock-in. No subscriptions required.',
  socialProof: 'Used by consultants, finance teams and operators who need clean PDFs without manual formatting.',

  freeTitle: 'Free',
  freeSubtitle: '3 exports',
  freeFeature: 'Branding enabled',
  freeFeatureAlt: 'No account required',
  freeCtaLabel: 'Start free',
  freeCtaHref: '/#upload',

  creditsTitle: 'Credits',
  credits100Title: '100 exports',
  credits100Price: '€19',
  credits500Title: '500 exports',
  credits500Price: '€79',
  creditsFeature: 'No subscription',
  creditsFeature2: 'Branding optional',
  creditsFeature3: 'Client-ready layout',
  creditsFeature4: 'Structured sections',
  creditsCtaLabel: 'Buy credits',
  creditsCtaHref: '#',
  creditsCtaTooltip: 'Checkout coming soon.',
  creditsBadge: 'Most popular',

  proApiTitle: 'Pro + API',
  proApiComingSoon: 'Coming soon',
  proPrice: '€29/month',
  proFeature1: 'Batch export',
  proFeature2: 'Priority processing',
  proFeature3: 'API access',
  proFeature4: 'Usage-based API access',
  proApiCtaLabel: 'Join early access',
  proApiCtaHref: 'mailto:support@fitforpdf.com',

  backToApp: 'Back to app',
  backToAppHref: '/',

  comparison: [
    ['Exports', '3', '100 / 500', 'Unlimited'],
    ['Branding removable', 'No', 'Yes', 'Yes'],
    ['Batch export', 'No', 'No', 'Yes'],
    ['API', 'No', 'No', 'Soon'],
  ],

  faq: [
    {
      id: 'billing',
      q: 'Do I have to subscribe?',
      a: 'No. Credits are pay-per-output. Subscribe only if you want batch export and priority later.',
    },
    {
      id: 'invoices',
      q: 'Can you provide invoices?',
      a: 'Yes. Invoices will be available via Stripe once payments go live.',
    },
    {
      id: 'limits',
      q: 'What are the free limits?',
      a: 'Free includes 3 exports total. Upgrade with credits when you need more.',
    },
    {
      id: 'api-coming',
      q: 'Do you offer an API?',
      a: 'API access is part of the Pro plan and is coming soon.',
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
    priceLine: `${PRICING_PAGE_COPY.credits100Title} • ${PRICING_PAGE_COPY.credits100Price} · ${PRICING_PAGE_COPY.credits500Title} • ${PRICING_PAGE_COPY.credits500Price}`,
    priceLines: [
      `${PRICING_PAGE_COPY.credits100Title} • ${PRICING_PAGE_COPY.credits100Price}`,
      `${PRICING_PAGE_COPY.credits500Title} • ${PRICING_PAGE_COPY.credits500Price}`,
    ],
    points: [
      `${PRICING_PAGE_COPY.credits100Title} for ${PRICING_PAGE_COPY.credits100Price}`,
      `${PRICING_PAGE_COPY.credits500Title} for ${PRICING_PAGE_COPY.credits500Price}`,
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
  {
    id: 'proApi',
    title: PRICING_PAGE_COPY.proApiTitle,
    priceLine: PRICING_PAGE_COPY.proPrice,
    priceLines: [PRICING_PAGE_COPY.proPrice],
    points: [
      `${PRICING_PAGE_COPY.proPrice} (coming soon)`,
      PRICING_PAGE_COPY.proFeature1,
      PRICING_PAGE_COPY.proFeature2,
      PRICING_PAGE_COPY.proFeature3,
      PRICING_PAGE_COPY.proFeature4,
    ],
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
  heroLabel: 'PRIVACY',
  pageTitle: 'Your data.',
  pageTitleAccent: 'Not our business.',
  pageSubtitle: 'FitForPDF is designed to process files — not store them.',
  microLine: 'No accounts. No tracking of file contents.',

  handlingTitle: 'How file handling works',
  files: {
    title: 'Files',
    bullets: ['Files are deleted immediately after conversion.'],
  },
  generatedPdf: {
    title: 'Generated PDFs',
    bullets: ['Available for up to 15 minutes.', 'Automatically deleted after.'],
  },
  logs: {
    title: 'Logs',
    bullets: [
      'We do not store file contents in logs.',
      'Only technical metadata is retained to improve reliability.',
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
