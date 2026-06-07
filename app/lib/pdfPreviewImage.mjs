// Render the first page of a PDF blob to a PNG data URL, fully client-side, for an
// inline preview on mobile (mobile browsers — esp. iOS Safari — can't embed PDFs).
//
// pdf.js is lazy-imported so it's only fetched when a preview actually renders, and
// only on a device with a working <canvas> (the getContext check bails first in
// jsdom / SSR, so tests and non-canvas environments never pull pdf.js in). Returns
// null on any failure; callers fall back to an open link.

let pdfjsPromise = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/legacy/build/pdf').then((mod) => {
      const pdfjs = mod && mod.getDocument ? mod : (mod && mod.default) || mod;
      // Self-hosted worker (copied to /public at build time) — same-origin, no CDN.
      if (pdfjs.GlobalWorkerOptions) pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export async function renderPdfFirstPageImage(blob, { maxWidth = 760 } = {}) {
  try {
    if (!blob || typeof document === 'undefined') return null;
    // Bail BEFORE importing pdf.js if there's no real 2D canvas (jsdom returns null).
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return null;

    const pdfjs = await loadPdfjs();
    const data = new Uint8Array(await blob.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data }).promise;
    const page = await pdf.getPage(1);

    const base = page.getViewport({ scale: 1 });
    const scale = Math.max(0.5, Math.min(2, maxWidth / base.width));
    const viewport = page.getViewport({ scale });
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvasContext: ctx, viewport }).promise;
    const url = canvas.toDataURL('image/png');
    try { await pdf.cleanup(); pdf.destroy(); } catch { /* best-effort */ }
    return typeof url === 'string' && url.startsWith('data:image') ? url : null;
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[pdfPreviewImage] first-page render failed:', err && err.message ? err.message : err);
    }
    return null;
  }
}
