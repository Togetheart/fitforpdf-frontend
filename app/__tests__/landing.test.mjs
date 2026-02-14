import assert from 'node:assert/strict';
import test from 'node:test';

import { LANDING_COPY, LANDING_COPY_KEYS, LANDING_SECTIONS, TELEGRAM_BOT_URL } from '../siteCopy.mjs';

function landingText() {
  return LANDING_SECTIONS(3).map((section) => `${section.title || ''}`).join(' ');
}

test('hero copy appears before tool section', () => {
  const sections = LANDING_SECTIONS(3);
  const heroIndex = sections.findIndex((section) => section.id === LANDING_COPY_KEYS.hero);
  const toolIndex = sections.findIndex((section) => section.id === LANDING_COPY_KEYS.tool);

  assert.equal(heroIndex >= 0, true);
  assert.equal(toolIndex >= 0, true);
  assert.equal(heroIndex < toolIndex, true);
  assert.equal(sections[heroIndex]?.title, LANDING_COPY.heroTitle);
  assert.equal(sections[toolIndex]?.title, LANDING_COPY.toolTitle);
  assert.equal(landingText().includes(LANDING_COPY.heroTitle), true);
});

test('tool section id exists', () => {
  const sections = LANDING_SECTIONS(3);
  assert.equal(
    sections.some((section) => section.id === LANDING_COPY_KEYS.tool),
    true,
  );
});

test('hero links to pricing and Telegram', () => {
  const heroSection = LANDING_SECTIONS(3).find((section) => section.id === LANDING_COPY_KEYS.hero);
  assert.equal(!!heroSection, true);

  const pricingCta = heroSection.ctas.find((cta) => cta.label === LANDING_COPY.heroSecondaryCta);
  const telegramCta = heroSection.ctas.find((cta) => cta.label === LANDING_COPY.heroTertiaryCta);

  assert.equal(pricingCta?.href, '/pricing');
  assert.equal(telegramCta?.href, TELEGRAM_BOT_URL);
});

test('free exports text does not belong to hero section', () => {
  const sections = LANDING_SECTIONS(3);
  const heroSection = sections.find((section) => section.id === LANDING_COPY_KEYS.hero);
  const toolSection = sections.find((section) => section.id === LANDING_COPY_KEYS.tool);

  assert.equal(heroSection.containsFreeQuotaText, false);
  assert.equal(toolSection.containsFreeQuotaText, true);
  assert.equal(typeof toolSection.freeQuotaText, 'string');
  assert.equal(toolSection.freeQuotaText.includes('Free exports left:'), true);
});
