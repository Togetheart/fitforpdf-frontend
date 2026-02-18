import React from 'react';

import HeroBackdrop from './HeroBackdrop';

export default function PageHero({
  variant = 'home',
  eyebrow,
  title,
  subtitle,
  trustLine,
  align = 'left',
  height = 'min-h-[360px] sm:min-h-[460px]',
  className = '',
  contentClassName = '',
  contentMaxWidthClassName = 'max-w-6xl',
  titleClassName = 'text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]',
  subtitleClassName = '',
  heroTestId = 'page-hero',
  headingTestId,
  children = null,
}) {
  const isCenter = align === 'center';
  const alignClass = isCenter ? 'items-center text-center' : 'items-start text-left';
  const titleAlignClass = isCenter ? 'mx-auto text-center' : '';
  const titleIsElement = React.isValidElement(title);
  const titleIsHeadLine = titleIsElement && title.type === 'h1';

  const hasDefaultContent = Boolean(eyebrow || title || subtitle || trustLine);

  return (
    <section
      data-testid={heroTestId}
      className={`relative overflow-hidden ${height} ${className}`}
    >
      <HeroBackdrop variant={variant} height={height} />
      <div className={`relative z-10 mx-auto flex ${alignClass} ${contentMaxWidthClassName} flex-col gap-6 px-4 py-16 sm:px-6 ${contentClassName}`}>
        {children || hasDefaultContent ? (
          <>
            {eyebrow ? (
              <p className="text-xs font-semibold tracking-[0.18em] text-black/55">{eyebrow}</p>
            ) : null}
            {title ? (
              titleIsElement && !titleIsHeadLine && !headingTestId ? (
                title
              ) : titleIsElement && headingTestId ? (
                <h1
                  data-testid={headingTestId}
                  className={`${titleClassName} ${titleAlignClass}`}
                >
                  {title}
                </h1>
              ) : (
                <h1
                  data-testid={headingTestId}
                  className={`${titleClassName} ${titleAlignClass}`}
                >
                  {title}
                </h1>
              )
            ) : null}
            {subtitle ? (
              <p className={`text-base text-slate-700 ${subtitleClassName}`}>{subtitle}</p>
            ) : null}
            {trustLine ? <p className="max-w-prose text-sm text-slate-500">{trustLine}</p> : null}
            {children}
          </>
        ) : null}
      </div>
    </section>
  );
}
