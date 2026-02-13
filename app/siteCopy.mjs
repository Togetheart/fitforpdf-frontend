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
