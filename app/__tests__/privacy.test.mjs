import assert from 'node:assert/strict';
import test from 'node:test';

import { PRIVACY_PAGE_COPY } from '../siteCopy.mjs';

function privacyText() {
  return [
    PRIVACY_PAGE_COPY.pageTitle,
    PRIVACY_PAGE_COPY.intro,
    ...PRIVACY_PAGE_COPY.dataProcessed,
    ...PRIVACY_PAGE_COPY.retention,
    PRIVACY_PAGE_COPY.sensitiveDataNote,
    ...PRIVACY_PAGE_COPY.logs,
    PRIVACY_PAGE_COPY.contactEmail,
  ]
    .join(' ')
    .toLowerCase();
}

test('privacy policy contains deletion statement', () => {
  assert.equal(privacyText().includes('files are deleted immediately after conversion'), true);
});

test('privacy policy contains PDF availability window', () => {
  assert.equal(privacyText().includes('generated pdf is available for up to 15 minutes'), true);
});

test('privacy policy contains logs claim', () => {
  assert.equal(privacyText().includes('do not store file contents in logs'), true);
});

test('privacy policy includes contact', () => {
  assert.equal(privacyText().includes('support@fitforpdf.com') || privacyText().includes('contact'), true);
});
