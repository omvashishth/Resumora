import React, { useRef, useState, useEffect } from 'react';
import type { Resume } from '../../types/resume';
import { TemplateRenderer } from '../../templates/TemplateRenderer';
import { ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';

interface ResumePreviewProps {
  resume: Resume;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.85);
  const [pageCount, setPageCount] = useState<number>(1);
  const [containerHeightPx, setContainerHeightPx] = useState<number>(1122);
  const [hasAutoFit, setHasAutoFit] = useState<boolean>(false);

  // Compute Auto-Fit Zoom based on current workspace container width
  const calculateFitZoom = () => {
    if (!workspaceRef.current) return 0.85;
    const availableWidth = workspaceRef.current.clientWidth - (window.innerWidth < 640 ? 20 : 48);
    const a4BaseWidth = 794; // 210mm at 96dpi
    const fit = availableWidth / a4BaseWidth;
    return Math.min(1.1, Math.max(0.35, Math.round(fit * 100) / 100));
  };

  // Initial Auto-Fit on mount and responsive window resizing
  useEffect(() => {
    const handleResize = () => {
      if (workspaceRef.current) {
        const fit = calculateFitZoom();
        if (!hasAutoFit || window.innerWidth < 768) {
          setZoom(fit);
          setHasAutoFit(true);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasAutoFit]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        const heightPx = containerRef.current.scrollHeight;
        setContainerHeightPx(heightPx);
        const pageHeightPx = 1122; // ~297mm A4 at 96dpi
        const count = Math.max(1, Math.ceil(heightPx / pageHeightPx));
        setPageCount(count);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resume]);

  const handleFitScreen = () => {
    const fit = calculateFitZoom();
    setZoom(fit);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] overflow-hidden">
      {/* Preview Control Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-3 sm:px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xs font-bold text-[var(--color-text-primary)]">A4 Document Desk</span>
          <span className="text-[10px] font-mono text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] px-2 py-0.5 rounded-[2px] border border-[var(--color-border)] flex items-center gap-1">
            <Layers className="w-3 h-3 text-[var(--color-brand)]" />
            Page 1 / {pageCount}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(0.35, Math.round((z - 0.08) * 100) / 100))}
            className="p-1.5 sm:p-1 rounded-[3px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors duration-150 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-[var(--color-text-secondary)] w-9 sm:w-11 text-center font-bold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.4, Math.round((z + 0.08) * 100) / 100))}
            className="p-1.5 sm:p-1 rounded-[3px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors duration-150 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFitScreen}
            className="px-2 py-1 rounded-[3px] text-[11px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-colors duration-150 cursor-pointer flex items-center gap-1 min-h-[28px]"
            title="Fit to Screen width"
          >
            <Maximize2 className="w-3 h-3 text-[var(--color-brand)]" />
            <span className="hidden sm:inline">Fit</span>
          </button>
        </div>
      </div>

      {/* Physical Paper Workspace Canvas */}
      <div
        ref={workspaceRef}
        className="flex-1 overflow-auto p-2.5 sm:p-6 flex justify-center items-start bg-[var(--color-surface-raised)] touch-scroll"
      >
        <div
          style={{
            width: `${794 * zoom}px`,
            height: `${containerHeightPx * zoom}px`,
            position: 'relative',
            transition: 'width 150ms ease-out, height 150ms ease-out',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '794px',
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 150ms ease-out',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <div ref={containerRef} className="a4-page-container">
              <TemplateRenderer resume={resume} isPreview={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
