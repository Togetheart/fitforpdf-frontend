import assert from 'node:assert/strict';
import test from 'node:test';

import { LANDING_SECTIONS, LANDING_COPY, LANDING_COPY_KEYS, TELEGRAM_BOT_URL } from '../siteCopy.mjs';

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

test('hero contains required CTAs and links to pricing and Telegram', () => {
  const [heroSection] = LANDING_SECTIONS(3);
  const pricingCta = heroSection.ctas.find((cta) => cta.label === LANDING_COPY.heroSecondaryCta);
  const telegramCta = heroSection.ctas.find((cta) => cta.label === LANDING_COPY.telegramCta);

  assert.equal(pricingCta?.href, '/pricing');
  assert.equal(telegramCta?.href, TELEGRAM_BOT_URL);
  assert.equal(heroSection.ctas.some((cta) => cta.href === '#tool' && cta.label === LANDING_COPY.heroPrimaryCta), true);
});

test('tool section contains free exports text and it is not shown in hero section metadata', () => {
  const sections = LANDING_SECTIONS(3);
  const heroSection = sections.find((section) => section.id === LANDING_COPY_KEYS.hero);
  const toolSection = sections.find((section) => section.id === LANDING_COPY_KEYS.tool);

  assert.equal(heroSection.containsFreeQuotaText, false);
  assert.equal(toolSection?.id, LANDING_COPY_KEYS.tool);
  assert.equal(typeof toolSection.freeQuotaText, 'string');
  assert.equal(toolSection.freeQuotaText.includes('Free exports left'), true);
});
