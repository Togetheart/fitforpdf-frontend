import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

describe('theme hydration guard', () => {
  test('html suppresses the intentional pre-hydration theme mutation', () => {
    const layoutSource = readFileSync(join(process.cwd(), 'app/layout.js'), 'utf8');

    expect(layoutSource).toContain('id="theme-init"');
    expect(layoutSource).toContain('strategy="beforeInteractive"');
    expect(layoutSource).toMatch(/<html[^>]*suppressHydrationWarning/);
  });
});
