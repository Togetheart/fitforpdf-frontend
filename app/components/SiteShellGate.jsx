'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import SiteShell from './SiteShell';

function isImmersiveAppRoute(pathname) {
  return pathname === '/app' || pathname?.startsWith('/app/');
}

export default function SiteShellGate({ children }) {
  const pathname = usePathname();

  if (isImmersiveAppRoute(pathname)) {
    return children;
  }

  return <SiteShell>{children}</SiteShell>;
}
