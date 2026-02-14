export function getLayoutMode({ isMobile } = {}) {
  return isMobile ? 'stack' : 'split';
}

export function getCtaLayout({ isMobile } = {}) {
  return isMobile ? 'stack' : 'row';
}
