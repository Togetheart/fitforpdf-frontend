import React, { useState } from 'react';
import { CheckCircle2, FileText, UploadCloud } from 'lucide-react';

const DROPZONE_HINT = 'or choose a file';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export default function UploadDropzone({
  inputId,
  file,
  onFileSelect,
  onRemoveFile,
  accept = '.csv,.xlsx',
  disabled = false,
}) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

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
        onDragEnter={() => !disabled && setIsDragActive(true)}
        onDragLeave={() => !disabled && setIsDragActive(false)}
        className={`rounded-2xl border-2 border-dashed p-1 transition ${
          isDragActive ? 'border-[#D92D2A] bg-red-50/55' : 'border-slate-200 bg-slate-50'
        } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-[#D92D2A]/60 hover:bg-red-50/30'}`}
      >
        <label
          htmlFor={inputId}
          data-testid="upload-dropzone"
          aria-label="Upload CSV or XLSX file"
          className="block rounded-2xl bg-white px-4 py-7 text-center"
        >
          {file ? (
            <div className="mx-auto max-w-xl">
              <CheckCircle2
                aria-hidden="true"
                className="mx-auto h-8 w-8 text-[#D92D2A]"
              />
              <p className="mt-3 text-sm font-semibold text-slate-900">{file.name}</p>
              <p className="mt-1 text-xs text-slate-500">{formatBytes(file.size)}</p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!disabled) {
                      onRemoveFile?.();
                    }
                  }}
                  disabled={disabled}
                  className="inline-flex h-9 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-xl">
              <UploadCloud aria-hidden="true" className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Drop CSV or XLSX here</p>
              <p className="mt-1 text-xs text-slate-500">{DROPZONE_HINT}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#D92D2A]">
                <FileText aria-hidden="true" className="h-4 w-4" />
                2-step import: drop or click
              </p>
            </div>
          )}
        </label>
      </div>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        data-testid="generate-file-input"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];
          if (!disabled && selectedFile) {
            onFileSelect?.(selectedFile);
          }
        }}
        disabled={disabled}
      />
    </>
  );
}
