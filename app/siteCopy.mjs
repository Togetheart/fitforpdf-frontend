export const TELEGRAM_BOT_URL = 'https://t.me/FitForPDFBot';

export const LANDING_COPY = {
  heroTitle: 'Client-ready PDFs from messy spreadsheets.',
  heroSubheadline:
    'Upload CSV/XLSX and instantly generate a PDF that is ready to send to clients and teams.',
  heroPrimaryCta: 'Try it now',
  heroSecondaryCta: 'See pricing',
  telegramCta: 'Try on Telegram',
  proofBeforeTitle: 'Before',
  proofAfterTitle: 'After',
  proofSectionTitle: 'Before / After',
  proofBeforePlaceholder: 'CSV input',
  proofAfterPlaceholder: 'PDF output',
  clientReadyTitle: 'Client-ready means',
  clientReadyBullets: [
    'Document overview page',
    'Smart column sections',
    'Fixed reference columns repeated',
    'Rows X–Y and Page i/n',
    'No manual layout',
  ],
  toolTitle: 'Try FitForPDF on the web',
  pricingTitle: 'Pricing',
  pricingFreeTitle: 'Free',
  pricingFreeCopy: '3 exports total · Branding enabled by default',
  pricingCredits100Title: 'Credits: 100',
  pricingCredits100Copy: '€19',
  pricingCredits500Title: 'Credits: 500',
  pricingCredits500Copy: '€79',
  pricingProTitle: 'Pro',
  pricingProCopy: '€29/mo — coming soon (batch export)',
  pricingApiTitle: 'API',
  pricingApiCopy: 'Coming soon',
};

export const LANDING_COPY_KEYS = {
  hero: 'hero',
  proof: 'proof',
  clientReady: 'client-ready',
  tool: 'tool',
  pricing: 'pricing',
};

export const PRICING_PAGE_COPY = {
  pageTitle: 'Pricing',
  pageSubtitle: 'Start with the free trial, then add credits when you need more exports.',
  freeTitle: 'Free',
  freeSubtitle: '3 exports included (trial). Branding included.',
  freeFeature: 'Branding enabled: “Made with FitForPDF”',
  creditsTitle: 'Credits',
  credits100Title: '100 exports',
  credits100Price: '€19',
  credits500Title: '500 exports',
  credits500Price: '€79',
  proTitle: 'Pro (coming soon)',
  proPrice: '€29/month',
  proFeature1: 'Batch export',
  proFeature2: 'Priority processing',
  freePrimaryAction: 'Use free plan',
  apiTitle: 'API (coming soon)',
  apiCopy: 'Usage-based billing. Contact us.',
  backToApp: 'Back to app',
  retentionTitle: 'Privacy & retention',
  filesDeleted: 'Files deleted after 15 minutes',
  pdfsDeleted: 'PDFs deleted after 24 hours',
  noLogs: 'No content logs',
  plannedLabel: 'Planned',
  disabledButtonLabel: 'Coming soon',
};

export const PRICING_CARDS = [
  {
    id: 'free',
    title: PRICING_PAGE_COPY.freeTitle,
    priceLine: PRICING_PAGE_COPY.freeSubtitle,
    points: [PRICING_PAGE_COPY.freeFeature],
  },
  {
    id: 'credits',
    title: PRICING_PAGE_COPY.creditsTitle,
    priceLine: '',
    points: [
      `${PRICING_PAGE_COPY.credits100Title} — ${PRICING_PAGE_COPY.credits100Price}`,
      `${PRICING_PAGE_COPY.credits500Title} — ${PRICING_PAGE_COPY.credits500Price}`,
    ],
  },
  {
    id: 'pro',
    title: PRICING_PAGE_COPY.proTitle,
    priceLine: PRICING_PAGE_COPY.proPrice,
    points: [PRICING_PAGE_COPY.proFeature1, PRICING_PAGE_COPY.proFeature2],
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
    id: LANDING_COPY_KEYS.proof,
    title: `${LANDING_COPY.proofBeforeTitle} / ${LANDING_COPY.proofAfterTitle}`,
    containsFreeQuotaText: false,
  },
  {
    id: LANDING_COPY_KEYS.clientReady,
    title: LANDING_COPY.clientReadyTitle,
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
];
