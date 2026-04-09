import { describe, expect, test } from 'vitest';
import nextConfig from '../../next.config.mjs';

describe('next config redirects', () => {
  test('does not define app-level host canonical redirect', async () => {
    if (typeof nextConfig.redirects !== 'function') {
      expect(nextConfig.redirects).toBeUndefined();
      return;
    }

    const rules = await nextConfig.redirects();
    const hostRedirect = rules.find((rule) =>
      Array.isArray(rule?.has)
      && rule.has.some((cond) => cond?.type === 'host' && cond?.value === 'fitforpdf.com')
    );

    expect(hostRedirect).toBeUndefined();
  });
});
