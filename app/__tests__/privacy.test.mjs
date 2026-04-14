import assert from 'node:assert/strict';
import test from 'node:test';

import { PRIVACY_PAGE_COPY } from '../siteCopy.mjs';

function privacyText() {
  return [
    PRIVACY_PAGE_COPY.heroLabel,
    PRIVACY_PAGE_COPY.pageTitle,
    PRIVACY_PAGE_COPY.pageTitleAccent,
    PRIVACY_PAGE_COPY.pageSubtitle,
    PRIVACY_PAGE_COPY.microLine,
    PRIVACY_PAGE_COPY.handlingTitle,
    PRIVACY_PAGE_COPY.dontDoTitle,
    PRIVACY_PAGE_COPY.infrastructureTitle,
    ...PRIVACY_PAGE_COPY.files.bullets,
    ...PRIVACY_PAGE_COPY.generatedPdf.bullets,
    ...PRIVACY_PAGE_COPY.logs.bullets,
    ...PRIVACY_PAGE_COPY.dontDo,
    ...PRIVACY_PAGE_COPY.infrastructure,
    PRIVACY_PAGE_COPY.sensitiveDataNote,
    PRIVACY_PAGE_COPY.legalFooter,
    PRIVACY_PAGE_COPY.contactEmail,
  ]
    .join(' ')
    .toLowerCase();
}

test('privacy policy contains deletion statement', () => {
  assert.equal(privacyText().includes('files are deleted immediately after conversion'), true);
});

test('privacy policy contains PDF availability window', () => {
  assert.equal(privacyText().includes('available for up to 15 minutes'), true);
});

test('privacy policy contains logs claim', () => {
  assert.equal(privacyText().includes('do not store file contents in logs'), true);
});

test('privacy policy contains infrastructure and legal trust lines', () => {
  assert.equal(privacyText().includes("what we don't do"), true);
  assert.equal(privacyText().includes('gdpr'), true);
});

test('privacy policy includes contact', () => {
  assert.equal(privacyText().includes('support@fitforpdf.com') || privacyText().includes('contact'), true);
});

test('privacy policy makes explicit "no LLM / no AI provider" statement', () => {
  const text = privacyText();
  // At least one explicit mention that data does NOT go to any LLM provider
  const hasLlmDisclaimer =
    text.includes('no llm') ||
    text.includes('no openai') ||
    text.includes('no ai provider') ||
    text.includes('deterministic');
  assert.equal(hasLlmDisclaimer, true, 'Privacy page must explicitly state that no LLM/AI provider is used');
});

test('privacy FAQ contains an AI/LLM question', () => {
  const faqIds = PRIVACY_PAGE_COPY.faq.map((item) => item.id);
  assert.equal(faqIds.includes('ai-llm'), true, 'Privacy FAQ must include an ai-llm entry');
});
