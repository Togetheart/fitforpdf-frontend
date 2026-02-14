import assert from 'node:assert/strict';
import test from 'node:test';

import { LANDING_COPY, LANDING_COPY_KEYS, LANDING_SECTIONS } from '../siteCopy.mjs';

function landingText() {
  return LANDING_SECTIONS(3).map((section) => `${section.title || ''}`).join(' ');
}

test('hero copy appears before tool section', () => {
  const sections = LANDING_SECTIONS(3);
  const heroIndex = sections.findIndex((section) => section.id === LANDING_COPY_KEYS.hero);
  const toolIndex = sections.findIndex((section) => section.id === LANDING_COPY_KEYS.upload);

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
    sections.some((section) => section.id === LANDING_COPY_KEYS.upload),
    true,
  );
});

test('hero does not include secondary CTAs to pricing or Telegram', () => {
  const heroSection = LANDING_SECTIONS(3).find((section) => section.id === LANDING_COPY_KEYS.hero);
  assert.equal(!!heroSection, true);
  assert.equal(Array.isArray(heroSection.ctas), true);
  assert.equal(heroSection.ctas.length, 1);
  assert.equal(heroSection.ctas[0].label, LANDING_COPY.heroPrimaryCta);
  assert.equal(heroSection.ctas[0].href, '#tool');
  assert.equal(heroSection.ctas[0].type, 'primary');
  assert.equal(heroSection.containsFreeQuotaText, false);
  assert.equal(heroSection.title, LANDING_COPY.heroTitle);
});

test('hero section title is present', () => {
  const heroSection = LANDING_SECTIONS(3).find((section) => section.id === LANDING_COPY_KEYS.hero);
  assert.equal(!!heroSection, true);
  assert.equal(heroSection.title, LANDING_COPY.heroTitle);
});

test('free exports text does not belong to hero section', () => {
  const sections = LANDING_SECTIONS(3);
  const heroSection = sections.find((section) => section.id === LANDING_COPY_KEYS.hero);
  const toolSection = sections.find((section) => section.id === LANDING_COPY_KEYS.upload);

  assert.equal(heroSection.containsFreeQuotaText, false);
  assert.equal(toolSection.containsFreeQuotaText, true);
  assert.equal(typeof toolSection.freeQuotaText, 'string');
  assert.equal(toolSection.freeQuotaText.includes('Free.'), true);
  assert.equal(toolSection.freeQuotaText.includes('exports left'), true);
});
