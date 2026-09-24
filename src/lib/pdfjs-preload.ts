let started = false;

/** Warm pdfjs-dist while the user is browsing content cards. */
export function preloadPdfJs() {
  if (started || typeof window === 'undefined') return;
  started = true;
  void import('pdfjs-dist').then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  });
}
