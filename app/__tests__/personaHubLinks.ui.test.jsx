import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import VerticalPage from '../components/VerticalPage.jsx';

afterEach(cleanup);

describe('VerticalPage relatedArticles', () => {
  const base = {
    vertical: 'For Finance Teams',
    headline: 'x',
    subheadline: 'y',
    painPoints: [],
    benefits: [],
  };

  test('renders related-article links when provided', () => {
    render(
      <VerticalPage
        {...base}
        relatedArticles={[
          { label: 'Convertir une balance comptable (CSV DGFiP) en PDF', href: '/convertir-balance-comptable-csv-en-pdf' },
        ]}
      />,
    );
    const link = screen.getByRole('link', { name: /balance comptable/i });
    expect(link.getAttribute('href')).toBe('/convertir-balance-comptable-csv-en-pdf');
  });

  test('renders no examples block when relatedArticles is omitted', () => {
    render(<VerticalPage {...base} />);
    expect(screen.queryByTestId('vertical-examples')).toBeNull();
  });
});
