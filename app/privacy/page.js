import React from 'react';

import { PRIVACY_PAGE_COPY } from '../siteCopy.mjs';

const LAYOUT = 'mx-auto flex w-full max-w-[960px] flex-col gap-3 px-4 py-8 sm:px-6 sm:py-10';
const CARD = 'rounded-xl border border-slate-200 bg-white p-5';

function BulletList({ values }) {
  return React.createElement(
    'ul',
    { className: 'space-y-2 pl-6 text-sm text-slate-700' },
    values.map((value) => React.createElement('li', { key: value, className: 'list-disc' }, value)),
  );
}

function PrivacySection({ title, children, band }) {
  return React.createElement(
    'section',
    { className: `${band}` },
    React.createElement(
      'div',
      { className: LAYOUT },
      React.createElement(
        'div',
        { className: CARD },
        React.createElement('h2', { className: 'text-lg font-semibold text-slate-900' }, title),
        children,
      ),
    ),
  );
}

export default function PrivacyPage() {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-white text-slate-900' },
    React.createElement(
      'section',
      { className: 'bg-gray-50' },
      React.createElement(
        'div',
        { className: LAYOUT },
        React.createElement(
          'h1',
          { className: 'text-[44px] font-[650] leading-tight tracking-tight sm:text-6xl' },
          PRIVACY_PAGE_COPY.pageTitle,
        ),
        React.createElement(
          'p',
          { className: 'max-w-[58ch] text-sm text-slate-600' },
          PRIVACY_PAGE_COPY.intro,
        ),
      ),
    ),
    PrivacySection({
      title: 'Data processed',
      band: 'bg-white',
      children: BulletList({ values: PRIVACY_PAGE_COPY.dataProcessed }),
    }),
    PrivacySection({
      title: 'Retention',
      band: 'bg-gray-50',
      children: React.createElement(
        React.Fragment,
        null,
        React.createElement(BulletList, { values: PRIVACY_PAGE_COPY.retention }),
        React.createElement(
          'p',
          { className: 'mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800' },
          'Currently: retention and deletion behavior is enforced by the current processing pipeline and may evolve.',
        ),
        React.createElement(
          'p',
          { className: 'mt-3 text-sm font-medium text-slate-700' },
          PRIVACY_PAGE_COPY.sensitiveDataNote,
        ),
      ),
    }),
    PrivacySection({
      title: 'Logs',
      band: 'bg-white',
      children: BulletList({ values: PRIVACY_PAGE_COPY.logs }),
    }),
    PrivacySection({
      title: 'Security',
      band: 'bg-gray-50',
      children: BulletList({ values: PRIVACY_PAGE_COPY.security }),
    }),
    PrivacySection({
      title: 'Contact',
      band: 'bg-white',
      children: React.createElement(
        'a',
        { href: `mailto:${PRIVACY_PAGE_COPY.contactEmail}`, className: 'inline-flex w-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100' },
        PRIVACY_PAGE_COPY.contactEmail,
      ),
    }),
  );
}
