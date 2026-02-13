import assert from 'node:assert/strict';
import test from 'node:test';

import { LANDING_SECTIONS, LANDING_COPY, LANDING_COPY_KEYS, TELEGRAM_BOT_URL } from './siteCopy.mjs';

test('hero heading appears before the tool section', () => {
  const sections = LANDING_SECTIONS(3);
  const heroIndex = sections.findIndex((section) => section.id === LANDING_COPY_KEYS.hero);
  const toolIndex = sections.findIndex((section) => section.id === LANDING_COPY_KEYS.tool);
  assert.equal(heroIndex >= 0, true);
  assert.equal(toolIndex >= 0, true);
  assert.equal(heroIndex < toolIndex, true);
  assert.equal(sections[heroIndex].title, LANDING_COPY.heroTitle);
  assert.equal(sections[toolIndex].title, LANDING_COPY.toolTitle);
});

test('page structure contains tool id and free quota appears in tool section', () => {
  const sections = LANDING_SECTIONS(3);
  const toolIndex = sections.findIndex((section) => section.id === LANDING_COPY_KEYS.tool);
  const toolSection = sections[toolIndex];
  const quotaIndex = sections.findIndex((section) => section.freeQuotaText?.includes?.('Free exports left'));

  assert.equal(toolSection.id, LANDING_COPY_KEYS.tool);
  assert.equal(quotaIndex, toolIndex);
});

test('hero CTAs link correctly', () => {
  const [heroSection] = LANDING_SECTIONS(3);
  const pricingCta = heroSection.ctas.find((cta) => cta.label === LANDING_COPY.heroSecondaryCta);
  const telegramCta = heroSection.ctas.find((cta) => cta.label === LANDING_COPY.telegramCta);

  assert.equal(pricingCta?.href, '/pricing');
  assert.equal(telegramCta?.href, TELEGRAM_BOT_URL);
  assert.equal(heroSection.ctas.some((cta) => cta.href === '#tool' && cta.label === LANDING_COPY.heroPrimaryCta), true);
});
