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
  assert.equal(heroSection.ctas[0].href, '#generate');
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
  assert.equal(toolSection.freeQuotaText.includes('Free:'), true);
  assert.equal(toolSection.freeQuotaText.includes('exports left'), true);
});

test('hero microcopy keeps free tier + pricing anchor', () => {
  const copy = LANDING_COPY.heroMicrocopyFree;
  assert.equal(typeof copy, 'string');
  assert.equal(copy.length > 0, true);
  assert.equal(/free/i.test(copy), true, 'Hero microcopy must mention the free tier');
  assert.equal(/\$/.test(copy), true, 'Hero microcopy must mention pricing ($)');
});

test('hero file compat line answers the decision-point hesitation under CTAs', () => {
  // Replaces the former trust tagline (No LLM) which duplicated the eyebrow.
  // The decision-point slot is now used for file compatibility — answering
  // the #1 pre-click hesitation ("will my file work?") and reinforcing the
  // broader "export" positioning (2026-04-15 feedback).
  const compat = LANDING_COPY.heroFileCompat;
  assert.equal(typeof compat, 'string');
  assert.equal(compat.length > 0, true);
  assert.equal(/excel/i.test(compat), true, 'File compat must mention Excel');
  assert.equal(/csv/i.test(compat), true, 'File compat must mention CSV');
  assert.equal(/tabular|export/i.test(compat), true, 'File compat must broaden to tabular exports');
});

test('hero No LLM signal is NOT duplicated under the CTAs (eyebrow does the job)', () => {
  // Regression lock: the former heroTrustTagline created a "No LLM" duplicate
  // in the same viewport (eyebrow + sub-CTA), which weakened both signals.
  // Feedback 2026-04-15: "Même message, deux fois dans le même viewport. Ça
  // gaspille l'espace et ça affaiblit les deux — on dirait que tu te
  // justifies." The eyebrow is the sole carrier of the no-LLM signal.
  assert.equal(LANDING_COPY.heroTrustTagline, undefined);
  assert.equal(LANDING_COPY.heroTrustAccent, undefined);
});

test('hero trust eyebrow carries the no-LLM signal above the headline', () => {
  // Apple-style eyebrow above the H1: the first strategic signal lock
  // flagged by Mathieu (2026-04-14). "No LLM" is the accented phrase —
  // HeroHeadline.jsx splits the eyebrow around it and renders it in
  // semibold + foreground color to give it typographic emphasis without
  // a pill/box.
  const eyebrow = LANDING_COPY.heroTrustEyebrow;
  const accent = LANDING_COPY.heroTrustEyebrowAccent;
  assert.equal(typeof eyebrow, 'string');
  assert.equal(typeof accent, 'string');
  assert.equal(/no llm/i.test(eyebrow), true, 'Trust eyebrow must contain "No LLM"');
  assert.equal(accent.toLowerCase(), 'no llm', 'Trust accent must be "No LLM"');
  // The three pillars must all appear in the eyebrow.
  assert.equal(/zero storage/i.test(eyebrow), true, 'Trust eyebrow must mention zero storage');
  assert.equal(/eu[- ]hosted/i.test(eyebrow), true, 'Trust eyebrow must mention EU-hosted');
  // V4.3 order (2026-04-15): NO LLM → Zero storage → EU-hosted. The
  // differentiator ("No LLM") must be the first word the eye catches when
  // the page loads — it is the single strongest competitive signal in a
  // market saturated with LLM-wrapper tools. V4.2 tested "Zero storage" as
  // the softer lead-in but the differentiation signal landed too late in
  // the reading rhythm. The JSX renderer splits around the accent so it can
  // live anywhere in the string.
  assert.equal(
    eyebrow.toLowerCase().startsWith('no llm'),
    true,
    'Trust eyebrow must start with "No LLM" (V4.3 order lock)',
  );
  assert.equal(
    eyebrow.toLowerCase().indexOf('no llm') <
      eyebrow.toLowerCase().indexOf('zero storage'),
    true,
    '"No LLM" must precede "Zero storage" (V4.3 order lock)',
  );
  assert.equal(
    eyebrow.toLowerCase().indexOf('zero storage') <
      eyebrow.toLowerCase().indexOf('eu-hosted'),
    true,
    '"Zero storage" must precede "EU-hosted" (V4.3 order lock)',
  );
});

test('hero H1 headline copy uses validated "client-ready" + inclusive "your export" framing', () => {
  // Magdalena verbatim (2026-03-22): "The most frustrating part is that the
  // export often isn't truly client-ready, so there's usually a manual
  // cleanup step before I can send it out." — quadruple-validated pain.
  // "Your export" (not "Excel") is the inclusive framing validated by
  // Abhinav (2026-04-15): his use case is "report exports at moltin.work",
  // a SaaS context where "Excel" would exclude mentally.
  const l1 = LANDING_COPY.heroHeadlineL1;
  const l2 = LANDING_COPY.heroHeadlineL2;
  assert.equal(typeof l1, 'string');
  assert.equal(typeof l2, 'string');
  assert.equal(/client[- ]ready/i.test(l1), true, 'H1 L1 must contain "client-ready"');
  assert.equal(
    /your export/i.test(l1),
    true,
    'H1 L1 must use "your export" (inclusive framing) and NOT restrict to "Excel"',
  );
  assert.equal(
    /excel/i.test(l1),
    false,
    'H1 L1 must NOT mention Excel, too restrictive for SaaS/CRM ICPs (Abhinav signal)',
  );
  assert.equal(/cleanup/i.test(l2), true, 'H1 L2 must reference the cleanup pain');
});

test('hero subheadline uses staccato pain + solution structure', () => {
  // Pain staccato on L2a + solution on L2b. The staccato must enumerate the
  // three validated visual pains (wide tables, cut-off columns, broken page
  // breaks). "Broken page breaks" is the specific, visual phrasing validated
  // by Magdalena ("awkward page breaks") and is more concrete than the
  // vague "manual fixes" (2026-04-15 feedback).
  const l2a = LANDING_COPY.heroSubheadlineL2a;
  const l2b = LANDING_COPY.heroSubheadlineL2b;
  assert.equal(typeof l2a, 'string');
  assert.equal(typeof l2b, 'string');
  assert.equal(/wide tables/i.test(l2a), true, 'Staccato must mention wide tables (Abhinav)');
  assert.equal(/cut[- ]off/i.test(l2a), true, 'Staccato must mention cut-off columns (Magdalena)');
  assert.equal(
    /page breaks/i.test(l2a),
    true,
    'Staccato must mention page breaks (specific visual pain, Magdalena)',
  );
  assert.equal(/fitforpdf/i.test(l2b), true, 'Solution line must name the product');
  assert.equal(/one click/i.test(l2b), true, 'Solution line must promise one-click simplicity');
});
