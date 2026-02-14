import React, { useState } from 'react';
import { afterEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import GenerateModule from '../components/GenerateModule';

const fileSample = new File(['name,score\na,1'], 'report.csv', { type: 'text/csv' });

function getFreeExportsLeftFromStorage() {
  const used = Number.parseInt(localStorage.getItem('fitforpdf_free_exports_used') || '0', 10);
  return Math.max(0, 3 - (Number.isFinite(used) ? used : 0));
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function ModuleHarness({
  file = null,
  freeExportsLeft = getFreeExportsLeftFromStorage(),
  isLoading = false,
  hasResultBlob = false,
}) {
  const [currentFile, setCurrentFile] = useState(file);

  return (
    <GenerateModule
      toolTitle="Generate a client-ready PDF"
      toolSubcopy="3 free exports. No account."
      file={currentFile}
      freeExportsLeft={freeExportsLeft}
      includeBranding
      truncateLongText={false}
      isLoading={isLoading}
      hasResultBlob={hasResultBlob}
      onFileSelect={(nextFile) => setCurrentFile(nextFile)}
      onRemoveFile={() => setCurrentFile(null)}
      onBrandingChange={vi.fn()}
      onTruncateChange={vi.fn()}
      onSubmit={(event) => event.preventDefault()}
      onDownloadAgain={vi.fn()}
    />
  );
}

test('renders dropzone and disabled generate action when no file is selected', () => {
  render(
    <ModuleHarness file={null} />,
  );

  expect(screen.getByText('Drop CSV or XLSX here')).toBeTruthy();
  expect(screen.getByText('or choose a file')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Generate PDF' })).toHaveProperty('disabled', true);
});

test('selecting a file shows file chip and enables generate action', () => {
  render(<ModuleHarness />);

  fireEvent.change(screen.getByTestId('generate-file-input'), {
    target: { files: [fileSample] },
  });

  expect(screen.getByText('report.csv')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Generate PDF' }).hasAttribute('disabled')).toBe(false);
});

test('drag-and-drop a file into the dropzone selects it', () => {
  render(<ModuleHarness />);

  const dropzone = screen.getByTestId('generate-dropzone');
  fireEvent.dragEnter(dropzone, { dataTransfer: { files: [] } });
  fireEvent.drop(dropzone, { dataTransfer: { files: [fileSample] } });

  expect(screen.getByText('report.csv')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Generate PDF' }).hasAttribute('disabled')).toBe(false);
});

test('branding toggle defaults on and truncate defaults off', () => {
  render(<ModuleHarness />);
  const switches = screen.getAllByRole('switch');

  expect(switches).toHaveLength(2);
  expect(switches[0].getAttribute('aria-checked')).toBe('true');
  expect(switches[1].getAttribute('aria-checked')).toBe('false');
});

test('shows quota pill from free exports state', () => {
  localStorage.setItem('fitforpdf_free_exports_used', '2');
  render(<ModuleHarness />);

  expect(screen.getByText(/Free\.\s*1\s*exports left/i)).toBeTruthy();
});

test('generating state shows spinner text and disables controls', () => {
  render(<ModuleHarness isLoading={true} file={fileSample} />);

  const generateButton = screen.getByRole('button', { name: /Generating…/i });
  expect(generateButton).toBeTruthy();
  expect(generateButton).toHaveProperty('disabled', true);
  expect(screen.getByRole('button', { name: /Remove/i })).toHaveProperty('disabled', true);
});
