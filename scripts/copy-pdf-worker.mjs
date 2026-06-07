// Copies the pdf.js worker into /public so it is served same-origin (no external
// CDN — keeps the privacy posture). Runs before dev/build. No-op if pdfjs-dist
// isn't installed yet (won't fail the build).
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js');
const dest = join(root, 'public', 'pdf.worker.min.js');

if (!existsSync(src)) {
  console.warn('[copy-pdf-worker] pdfjs-dist worker not found, skipping:', src);
  process.exit(0);
}
mkdirSync(join(root, 'public'), { recursive: true });
copyFileSync(src, dest);
console.log('[copy-pdf-worker] copied pdf.js worker -> public/pdf.worker.min.js');
