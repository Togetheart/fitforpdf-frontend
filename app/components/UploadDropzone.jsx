import React from 'react';
import { UploadCloud } from 'lucide-react';

const DROPZONE_HINT = 'or choose a file';

export default function UploadDropzone({
  inputId,
  onFileSelect,
  accept = '.csv,.xlsx',
  disabled = false,
}) {
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event?.dataTransfer?.files?.[0];
    if (!disabled && file) {
      onFileSelect?.(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <>
      <div
        data-testid="generate-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="rounded-xl border border-slate-300 bg-gray-50 p-1 transition hover:border-[#D92D2A]/35 hover:bg-red-50/15"
      >
        <label
          htmlFor={inputId}
          data-testid="upload-dropzone"
          aria-label="Upload CSV or XLSX file"
          className="block rounded-xl bg-gray-50 px-4 py-10 text-center"
        >
          <UploadCloud aria-hidden="true" className="mx-auto h-6 w-6 text-slate-700" />
          <p className="mt-3 text-sm font-medium text-slate-700">Drop CSV or XLSX here</p>
          <span className="mt-2 inline-block text-sm font-medium text-[#D92D2A]">{DROPZONE_HINT}</span>
        </label>
      </div>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        data-testid="generate-file-input"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!disabled && file) {
            onFileSelect?.(file);
          }
        }}
        disabled={disabled}
      />
    </>
  );
}
