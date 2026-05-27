import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react';

import Button from './ui/Button';

export default function ExampleCard({
  title,
  source,
  sourceUrl,
  description,
  rows,
  columns,
  sections,
  imageSrc,
  imageSrcSet,
  imageAlt,
  pdfHref,
}) {
  return (
    <article className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden transition hover:shadow-lg hover:border-[var(--color-muted)]/30">
      {/* Screenshot */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-bg-hero)]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-6">
        <h3 className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
          {title}
        </h3>

        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
        >
          Source: {source}
          <ExternalLink className="h-3 w-3" />
        </a>

        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          {description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
          <span className="rounded-full bg-[var(--color-bg-hero)] px-2.5 py-1">
            {rows} rows
          </span>
          <span className="text-[var(--color-border)]">×</span>
          <span className="rounded-full bg-[var(--color-bg-hero)] px-2.5 py-1">
            {columns} columns
          </span>
          <span className="text-[var(--color-border)]">→</span>
          <span className="rounded-full bg-[var(--color-bg-hero)] px-2.5 py-1">
            {sections} sections
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2">
          <Button variant="outline" href={pdfHref} target="_blank" rel="noopener noreferrer" className="text-xs px-4">
            View PDF
          </Button>
          <Button variant="primary" href="/#generate" className="text-xs px-4">
            Try with your data
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
