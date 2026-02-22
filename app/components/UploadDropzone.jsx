import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import AnimatedCloudIcon from './AnimatedCloudIcon';
import { useRef } from 'react';

const DROPZONE_HINT = 'or click to upload';

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
  onFileSelected,
  onRemoveFile,
  accept = '.csv,.xlsx',
  disabled = false,
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const emitFile = (nextFile) => {
    onFileSelect?.(nextFile);
    onFileSelected?.(nextFile);
  };

  const emitRemovedFile = () => {
    onFileSelect?.(null);
    onFileSelected?.(null);
    onRemoveFile?.();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    const file = event?.dataTransfer?.files?.[0];
    if (!disabled && file) {
      emitFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleLabelKeyDown = (event) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <>
      <div
        data-testid="generate-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={() => !disabled && setIsDragActive(true)}
        onDragLeave={() => !disabled && setIsDragActive(false)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload CSV or XLSX file"
        onKeyDown={handleLabelKeyDown}
        className={`rounded-xl border-2 border-dashed p-1 transition ${
          isDragActive ? 'border-accent bg-hero' : 'border-black/10 bg-hero'
        } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-accent/60'}`}
      >
        <label
          htmlFor={inputId}
          data-testid="upload-dropzone"
          aria-label="Upload CSV or XLSX file"
          className="block rounded-xl bg-transparent px-4 py-7 text-center"
        >
          {file ? (
            <div className="mx-auto max-w-xl">
              <CheckCircle2
                aria-hidden="true"
                className="mx-auto h-8 w-8 text-accent"
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
                      emitRemovedFile();
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
              <AnimatedCloudIcon size={32} className="mx-auto text-slate-500" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Drop CSV or XLSX here</p>
              <p className="mt-1 text-xs text-slate-500">{DROPZONE_HINT}</p>
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
        ref={inputRef}
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];
          if (!disabled && selectedFile) {
            emitFile(selectedFile);
          }
        }}
        disabled={disabled}
      />
    </>
  );
}
