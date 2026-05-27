import { JsonLd } from '../components/JsonLd';
import PageHero from '../components/PageHero';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import ExampleCard from '../components/ExampleCard';
import { SEO } from '../siteCopy.mjs';
import { EXAMPLES } from './examplesData.mjs';

export const metadata = {
  title: SEO.examples.title,
  description: SEO.examples.description,
  alternates: { canonical: '/examples' },
  openGraph: {
    title: SEO.examples.title,
    description: SEO.examples.description,
    url: `${SEO.siteUrl}/examples`,
    images: [{ url: SEO.ogImage }],
  },
  twitter: { card: 'summary_large_image' },
};

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SEO.siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Examples', item: `${SEO.siteUrl}/examples` },
  ],
};

const COLLECTION_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Real PDF Examples from Public Datasets',
  description: SEO.examples.description,
  url: `${SEO.siteUrl}/examples`,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: EXAMPLES.length,
    itemListElement: EXAMPLES.map((ex, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: ex.title,
      description: ex.description,
      url: `${SEO.siteUrl}/examples#${ex.slug}`,
    })),
  },
};

export default function ExamplesPage() {
  return (
    <>
      <JsonLd data={BREADCRUMB_LD} />
      <JsonLd data={COLLECTION_LD} />

      <PageHero
        variant="inner"
        align="center"
        eyebrow="EXAMPLES"
        title="Real PDFs from real data"
        subtitle="Wide public datasets from data.gouv.fr, automatically structured into clean, readable PDFs. No reformatting, no manual work."
        height="min-h-[280px] sm:min-h-[340px]"
      />

      <Section id="examples-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {EXAMPLES.map((example) => (
            <ExampleCard key={example.slug} {...example} />
          ))}
        </div>

        <p className="text-center text-xs text-[var(--color-muted)] mt-4">
          Data sourced from{' '}
          <a
            href="https://www.data.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[var(--color-text)] transition"
          >
            data.gouv.fr
          </a>
          {' '}— French government open data platform.
        </p>
      </Section>

      <Section id="examples-cta" className="text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Your spreadsheet is just as wide
        </h2>
        <p className="text-[var(--color-muted)] max-w-lg mx-auto">
          Upload your Excel or CSV file and get a structured PDF in seconds. 3 free exports, no account needed.
        </p>
        <div className="flex justify-center">
          <Button variant="primary" href="/#generate" className="px-8">
            Try it free
          </Button>
        </div>
      </Section>
    </>
  );
}
