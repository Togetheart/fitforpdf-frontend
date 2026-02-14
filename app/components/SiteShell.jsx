import React from 'react';

import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

export default function SiteShell({ children, variant = 'default' }) {
  const hasCompactSpacing = variant === 'compact';

  return (
    <>
      <SiteHeader />
      <main className={hasCompactSpacing ? 'mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6' : ''}>{children}</main>
      <SiteFooter />
    </>
  );
}

