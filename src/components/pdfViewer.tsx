import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';


// Configure the worker for react-pdf using the reliable CDN approach
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: string;
  title?: string;
  isDark?: boolean;
}


export function PdfViewer({ file, title = "Document Viewer", isDark = false }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset states if file changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setPageNumber(1);
  }, [file]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
    setHasError(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    setIsLoading(false);
    setHasError(true);
  }

  function changePage(offset: number) {
    setPageNumber(prev => Math.min(Math.max(prev + offset, 1), numPages || 1));
  }

  function handleZoomIn() {
    setScale(prev => Math.min(prev + 0.25, 2.5));
  }

  function handleZoomOut() {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }

  function handleDownload() {
    const link = document.createElement('a');
    link.href = file;
    link.download = title.replace(/\s+/g, '_') + '.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen?.();
    }
  }

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col items-center justify-between rounded-[2rem] border p-4 transition-all duration-300 sm:p-6 md:p-8 ${
        isFullscreen 
          ? 'fixed inset-0 z-[100] h-screen w-screen bg-slate-950/95 backdrop-blur-3xl' 
          : isDark 
            ? 'bg-slate-900/60 border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.5)]' 
            : 'bg-white/60 border-slate-200/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)]'
      }`}
      style={{
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
      }}
    >
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-4xl">
        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md transition-all ${
          isDark 
            ? 'bg-slate-950/80 border-white/15 text-white' 
            : 'bg-white/80 border-slate-200/80 text-slate-900'
        }`}>
          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B6E4F]/10 text-[#0B6E4F]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="max-w-[120px] truncate text-xs font-bold sm:max-w-[200px] sm:text-sm">
              {title}
            </span>
          </div>

          {/* Desktop Controls */}
          <div className="hidden items-center gap-1.5 md:flex">
            {/* Page Navigation */}
            <div className="flex items-center rounded-lg bg-current/5 p-0.5">
              <ControlButton 
                label="Previous Page" 
                onClick={() => changePage(-1)} 
                disabled={pageNumber <= 1 || isLoading}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </ControlButton>
              
              <span className="px-2 text-xs font-semibold">
                {numPages ? `${pageNumber} / ${numPages}` : '-- / --'}
              </span>

              <ControlButton 
                label="Next Page" 
                onClick={() => changePage(1)} 
                disabled={pageNumber >= (numPages || 1) || isLoading}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </ControlButton>
            </div>

            <div className="h-4 w-px bg-current/10 mx-1" />

            {/* Zoom Controls */}
            <div className="flex items-center rounded-lg bg-current/5 p-0.5">
              <ControlButton label="Zoom Out" onClick={handleZoomOut} disabled={scale <= 0.5 || isLoading}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </ControlButton>
              
              <span className="px-1.5 text-[11px] font-bold text-current/70">
                {Math.round(scale * 100)}%
              </span>

              <ControlButton label="Zoom In" onClick={handleZoomIn} disabled={scale >= 2.5 || isLoading}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </ControlButton>
            </div>

            <div className="h-4 w-px bg-current/10 mx-1" />

            {/* Actions */}
            <ControlButton label="Download PDF" onClick={handleDownload}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </ControlButton>

            <ControlButton label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
              {isFullscreen ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V5m0 4H5m4 0L3 3m12 6h4m-4 0v-4m0 4l6-6M9 15v4m0-4H5m4 0l-6 6m12-6h4m-4 0v4m0-4l6 6" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </ControlButton>
          </div>

          {/* Mobile minimal actions */}
          <div className="flex items-center gap-1 md:hidden">
            <ControlButton label="Download PDF" onClick={handleDownload}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </ControlButton>
            <ControlButton label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </ControlButton>
          </div>
        </div>
      </div>

      {/* PDF Display Area */}
      <div className="relative my-6 flex min-h-[350px] w-full max-w-4xl flex-1 flex-col items-center justify-center overflow-auto rounded-2xl bg-black/5 p-2 sm:p-4">
        {/* Loading Skeleton */}
        <AnimatePresence>
          {isLoading && !hasError && (
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-current/5 p-8 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#0B6E4F]/20" />
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0B6E4F]/30 border-t-[#0B6E4F]" />
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-4 w-48 animate-pulse rounded-full bg-current/10" />
                <div className="h-3 w-32 animate-pulse rounded-full bg-current/10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error / Fallback View */}
        {hasError ? (
          <motion.div 
            className="flex flex-col items-center justify-center gap-4 text-center p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold">Optimized PDF View</h4>
              <p className="mt-1 max-w-md text-sm text-current/70">
                The document is ready. You can view it directly in your browser or download the full high-quality file.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <a 
                href={file} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 rounded-full bg-[#0B6E4F] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#07583f]"
              >
                <span>Open in New Tab</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button 
                type="button" 
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-full border border-current/20 px-6 py-2.5 text-sm font-bold transition hover:bg-current/5"
              >
                <span>Download File</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Native React-PDF Document Render */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: isLoading ? 0 : 1, scale: isLoading ? 0.97 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-full overflow-auto"
          >
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              className="flex flex-col items-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="overflow-hidden rounded-xl shadow-2xl transition-transform duration-200"
              />
            </Document>
          </motion.div>
        )}
      </div>

      {/* Mobile Bottom Control Bar */}
      <div className="w-full max-w-4xl md:hidden">
        <div className={`flex items-center justify-between rounded-xl border px-3 py-2 shadow-md backdrop-blur-md ${
          isDark ? 'bg-slate-950/90 border-white/10 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center gap-1">
            <ControlButton label="Previous" onClick={() => changePage(-1)} disabled={pageNumber <= 1 || isLoading}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </ControlButton>
            <ControlButton label="Next" onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1) || isLoading}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </ControlButton>
          </div>

          <span className="text-xs font-bold">
            {numPages ? `Page ${pageNumber} of ${numPages}` : ''}
          </span>

          <div className="flex items-center gap-1">
            <ControlButton label="Zoom Out" onClick={handleZoomOut} disabled={scale <= 0.5 || isLoading}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </ControlButton>
            <ControlButton label="Zoom In" onClick={handleZoomIn} disabled={scale >= 2.5 || isLoading}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ControlButtonProps {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function ControlButton({ children, label, onClick, disabled = false }: ControlButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      whileHover={disabled ? {} : { scale: 1.1, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.93 }}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
        disabled 
          ? 'opacity-30 cursor-not-allowed' 
          : 'hover:bg-current/10 text-current'
      }`}
    >
      {children}
    </motion.button>
  );
}

export default PdfViewer;