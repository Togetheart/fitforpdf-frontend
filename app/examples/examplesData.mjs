/**
 * Static data for the /examples page.
 * Maintained by scripts/generate-examples.mjs — do not edit manually.
 */
export const EXAMPLES = [
  {
    slug: 'budget-communal-2024',
    title: 'Municipal Budgets 2024',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/balances-comptables-des-communes/',
    description:
      'Annual French municipal budget data — 28 financial columns covering revenues, expenses, and balance sheets across 350 municipalities.',
    rows: 350,
    columns: 28,
    sections: 5,
    imageSrc: '/examples/budget-communal-2024/overview.webp',
    imageSrcSet:
      '/examples/budget-communal-2024/overview.webp 1x, /examples/budget-communal-2024/overview@2x.webp 2x',
    imageAlt: 'PDF generated from French municipal budget data by fitforpdf — 28 columns split into 5 readable sections',
    pdfHref: '/examples/budget-communal-2024/output.pdf',
  },
  {
    slug: 'elections-legislatives-2024',
    title: 'Legislative Election Results 2024',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-definitifs-du-1er-tour/',
    description:
      'First-round legislative election results — 22 columns with candidate names, votes, and turnout per constituency.',
    rows: 577,
    columns: 22,
    sections: 4,
    imageSrc: '/examples/elections-legislatives-2024/overview.webp',
    imageSrcSet:
      '/examples/elections-legislatives-2024/overview.webp 1x, /examples/elections-legislatives-2024/overview@2x.webp 2x',
    imageAlt: 'PDF generated from French legislative election data by fitforpdf — 22 columns split into 4 sections',
    pdfHref: '/examples/elections-legislatives-2024/output.pdf',
  },
  {
    slug: 'etablissements-sante-finess',
    title: 'Health Facilities Directory (FINESS)',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/finess-extraction-du-fichier-des-etablissements/',
    description:
      'Directory of French health facilities — 24 columns including type, capacity, address, and regulatory status.',
    rows: 500,
    columns: 24,
    sections: 4,
    imageSrc: '/examples/etablissements-sante-finess/overview.webp',
    imageSrcSet:
      '/examples/etablissements-sante-finess/overview.webp 1x, /examples/etablissements-sante-finess/overview@2x.webp 2x',
    imageAlt: 'PDF generated from French health facility data by fitforpdf — 24 columns split into 4 sections',
    pdfHref: '/examples/etablissements-sante-finess/output.pdf',
  },
  {
    slug: 'sirene-entreprises',
    title: 'Business Registry (SIRENE extract)',
    source: 'data.gouv.fr',
    sourceUrl: 'https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
    description:
      'French business registry extract — 32 columns of company data including legal form, activity codes, workforce, and addresses.',
    rows: 400,
    columns: 32,
    sections: 6,
    imageSrc: '/examples/sirene-entreprises/overview.webp',
    imageSrcSet:
      '/examples/sirene-entreprises/overview.webp 1x, /examples/sirene-entreprises/overview@2x.webp 2x',
    imageAlt: 'PDF generated from French business registry data by fitforpdf — 32 columns split into 6 sections',
    pdfHref: '/examples/sirene-entreprises/output.pdf',
  },
];
