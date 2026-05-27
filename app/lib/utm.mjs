/**
 * UTM tracking helpers — fitforpdf.
 *
 * Convention (kept consistent across all outbound CTAs/links/emails):
 *   utm_source   = where the click originates (linkedin, betalist, email, app, etc.)
 *   utm_medium   = link channel (social, cpc, email, partner, content, organic)
 *   utm_campaign = a named campaign (microlaunch, founder_outreach, footer, brand)
 *   utm_content  = (optional) variant identifier (cta_top, cta_footer, card_a)
 *
 * Why this exists: Clarity + PostHog reported 73% of visits as "Direct" because
 * outbound links never carried UTM. Apply withUtm() to every outbound link you
 * own (your social profiles, newsletters, partnership content, etc.) so the
 * channel report stops being a black box.
 *
 * Internal #anchors and same-origin paths don't need UTM and are returned
 * unchanged by withUtm().
 */

const FITFORPDF_HOSTS = new Set(['www.fitforpdf.com', 'fitforpdf.com']);

/**
 * Standard sources we use. Free-form strings still work — these are just for
 * autocomplete + grep-ability across the codebase.
 */
export const UTM_SOURCE = Object.freeze({
  linkedin: 'linkedin',
  twitter: 'twitter',
  reddit: 'reddit',
  betalist: 'betalist',
  microlaunch: 'microlaunch',
  producthunt: 'producthunt',
  github: 'github',
  chatgpt: 'chatgpt',
  email: 'email',
  newsletter: 'newsletter',
  app: 'app',
  footer: 'footer',
  about: 'about',
  developers: 'developers',
});

export const UTM_MEDIUM = Object.freeze({
  social: 'social',
  cpc: 'cpc',
  email: 'email',
  partner: 'partner',
  content: 'content',
  organic: 'organic',
  referral: 'referral',
  cta: 'cta',
});

export const UTM_CAMPAIGN = Object.freeze({
  microlaunch: 'microlaunch',
  founderOutreach: 'founder_outreach',
  brand: 'brand',
  footer: 'footer',
  about: 'about',
  developers: 'developers',
  betalist5: 'betalist5',
});

/**
 * Build a UTM query string (without leading ?).
 * Falsy values are dropped so callers can pass partial objects.
 */
export function buildUtm({ source, medium, campaign, content, term } = {}) {
  const parts = [];
  if (source) parts.push(['utm_source', source]);
  if (medium) parts.push(['utm_medium', medium]);
  if (campaign) parts.push(['utm_campaign', campaign]);
  if (content) parts.push(['utm_content', content]);
  if (term) parts.push(['utm_term', term]);
  return parts
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * Append UTM params to an absolute URL. Returns the original href unchanged if:
 *   - href is empty
 *   - href is a same-origin/relative path (starts with `/`, `#`, `?`, or `mailto:`/`tel:`)
 *   - href already contains a utm_source param
 *   - href cannot be parsed as a URL
 *
 * Why same-origin is skipped: inbound visitors already carry their UTM via the
 * landing page; preserving session attribution is more accurate than overwriting
 * it with internal nav metadata.
 */
export function withUtm(href, utm = {}) {
  if (!href || typeof href !== 'string') return href;
  if (href.startsWith('#') || href.startsWith('?')) return href;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  if (href.startsWith('/') && !href.startsWith('//')) return href;

  let url;
  try {
    url = new URL(href);
  } catch {
    return href;
  }

  // Don't tag links pointing at our own domain — they came from somewhere else
  // already and we want to preserve original attribution.
  if (FITFORPDF_HOSTS.has(url.hostname.toLowerCase())) return href;

  // Don't double-tag.
  if (url.searchParams.has('utm_source')) return href;

  const query = buildUtm(utm);
  if (!query) return href;

  url.search = url.search
    ? `${url.search}&${query}`
    : `?${query}`;
  return url.toString();
}

/**
 * Pre-bake a withUtm with a fixed campaign+medium. Useful for grouping a batch
 * of links (e.g. footer social icons) without repeating the campaign string.
 *
 * Example:
 *   const footerUtm = makeUtm({ medium: 'social', campaign: 'footer' });
 *   <a href={footerUtm('https://twitter.com/...', { source: 'twitter' })}>...</a>
 */
export function makeUtm(defaults = {}) {
  return (href, overrides = {}) => withUtm(href, { ...defaults, ...overrides });
}
