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
    ...PRIVACY_PAGE_COPY.security,
    PRIVACY_PAGE_COPY.contactEmail,
  ]
    .join(' ')
    .toLowerCase();
}

test('privacy page mentions immediate file deletion', () => {
  const content = privacyText();
  assert.ok(content.includes('deleted immediately after conversion'));
});

test('privacy page mentions PDF availability window', () => {
  const content = privacyText();
  assert.ok(content.includes('available for up to 15 minutes'));
});

test('privacy page mentions logs policy', () => {
  const content = privacyText();
  assert.ok(content.includes('do not store file contents in logs'));
});

test('privacy page contains support contact', () => {
  const content = privacyText();
  assert.ok(content.includes('support@fitforpdf.com') || content.includes('contact'));
});
