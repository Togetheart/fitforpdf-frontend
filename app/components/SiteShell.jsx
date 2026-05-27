import React from 'react';

import AppBackdrop from './AppBackdrop';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

/**
 * Layout chrome — header + footer + backdrop + the single <main> landmark.
 *
 * Pages must NOT render their own <main> (would create nested mains — invalid
 * HTML + screen-reader confusion). Use <div> or <article> as the page-level
 * wrapper inside SiteShell instead.
 */
export default function SiteShell({ children, variant = 'default' }) {
  const hasCompactSpacing = variant === 'compact';
  const headerSpacerClass = 'h-16';

  return (
    <div className="relative" style={{ overflowX: 'clip' }}>
      <AppBackdrop />
      <div className="relative z-10">
        <SiteHeader />
        <div data-testid="site-header-spacer" className={headerSpacerClass} aria-hidden="true" />
        <main className={hasCompactSpacing ? 'mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6' : ''}>{children}</main>
        {/* pb-20 sm:pb-0 reserves space under the StickyMobileCTA (56px bar +
            margin) so the last paragraph of the page is never covered by the
            sticky bar. Desktop has no sticky CTA → no padding needed. */}
        <div className="pb-20 sm:pb-0">
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
