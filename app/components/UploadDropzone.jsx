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
        className={`flex-1 min-w-0 transition ${
          isDragActive ? 'bg-[var(--color-bg-hero)]' : ''
        } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
      >
        <label
          htmlFor={inputId}
          data-testid="upload-dropzone"
          aria-label="Upload CSV or XLSX file"
          className="flex items-center gap-3 cursor-pointer min-w-0"
        >
          {file ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-emerald-500"
              />
              <span className="truncate text-sm font-medium text-[var(--color-text)]">{file.name}</span>
              <span className="shrink-0 text-xs text-muted">{formatBytes(file.size)}</span>
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
                className="shrink-0 rounded-full p-0.5 text-muted hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hero)] transition disabled:opacity-50"
                aria-label="Remove file"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <AnimatedCloudIcon size={20} className="shrink-0 text-blue-500" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)]">Drop CSV or XLSX here</p>
                <p className="text-xs text-muted">{DROPZONE_HINT}</p>
              </div>
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
