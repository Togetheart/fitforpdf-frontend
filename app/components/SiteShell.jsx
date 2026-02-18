import React from 'react';

import AppBackdrop from './AppBackdrop';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

export default function SiteShell({ children, variant = 'default' }) {
  const hasCompactSpacing = variant === 'compact';
  const headerSpacerClass = 'h-16';

  return (
    <div className="relative overflow-hidden">
      <AppBackdrop />
      <div className="relative z-10">
        <SiteHeader />
        <div data-testid="site-header-spacer" className={headerSpacerClass} aria-hidden="true" />
        <main className={hasCompactSpacing ? 'mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6' : ''}>{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
