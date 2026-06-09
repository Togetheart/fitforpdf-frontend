import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import React from 'react';

import UploadCard from '../components/UploadCard';

const baseProps = {
  toolTitle: 'Generate',
  toolSubcopy: 'Sub',
  file: null,
  freeExportsLeft: 0,
  includeBranding: true,
  truncateLongText: false,
  isLoading: false,
  error: null,
  notice: null,
  hasResultBlob: false,
  onFileSelect: () => {},
  onRemoveFile: () => {},
  onBrandingChange: () => {},
  onTruncateChange: () => {},
  onSubmit: () => {},
  onDownloadAgain: () => {},
  variant: 'light',
};

afterEach(() => cleanup());

describe('UploadCard, unlimited plan never shows the Buy credits pill', () => {
  test('api_enterprise + 0 free exports → no quota-buy-slot', () => {
    render(<UploadCard {...baseProps} planType="api_enterprise" />);
    expect(screen.queryByTestId('quota-buy-slot')).toBeNull();
  });

  test('free + 0 free exports → quota-buy-slot is shown (regression)', () => {
    render(<UploadCard {...baseProps} planType="free" />);
    expect(screen.getByTestId('quota-buy-slot')).toBeTruthy();
  });
});
