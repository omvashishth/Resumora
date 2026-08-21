import React, { useMemo, useState, useEffect, useRef } from 'react';
import { DeskPaperSheet } from '../../components/landing/DeskPaperSheet';
import { TemplateRenderer } from '../../templates/TemplateRenderer';
import { ArrowRight } from 'lucide-react';
import { TemplateIndicator } from './TemplateIndicator';
import type { TemplateId } from '../../types/resume';

export const DesktopLandingExperience: React.FC<{ onCreateNew: () => void }> = ({ onCreateNew }) => {
  // Template sequence (same as in original Landing)
  const templateSequence = useMemo(
    () => [
      { id: 'modern', name: 'Modern', stepFormatted: '01 / 06', num: '01' },
      { id: 'classic', name: 'Classic', stepFormatted: '02 / 06', num: '02' },
      { id: 'minimal', name: 'Minimal', stepFormatted: '03 / 06', num: '03' },
      { id: 'professional', name: 'Executive', stepFormatted: '04 / 06', num: '04' },
      { id: 'executive-photo', name: 'Executive Photo', stepFormatted: '05 / 06', num: '05' },
      { id: 'modern-sidebar-photo', name: 'Sidebar Photo', stepFormatted: '06 / 06', num: '06' },
    ],
    []
  );

  const desktopScrollStoryRef = useRef<HTMLDivElement>(null);
  const [desktopScrollProgress, setDesktopScrollProgress] = useState(0);

  // Scroll progress listener (same logic from original)
  useEffect(() => {
    const handleScroll = () => {
      if (!desktopScrollStoryRef.current) return;
      const rect = desktopScrollStoryRef.current.getBoundingClientRect();
      const totalScrollableHeight = rect.height - window.innerHeight;
      if (totalScrollableHeight <= 0) return;
      const scrolledDistance = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolledDistance / totalScrollableHeight));
      setDesktopScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const desktopActiveIndex = Math.min(
    templateSequence.length - 1,
    Math.floor(desktopScrollProgress * templateSequence.length)
  );
  const activeDesktopTemplate = templateSequence[desktopActiveIndex];

  return (
    <>
      {/* Desktop Hero Stage */}
      <section className="desktop-hero-stage">
        <div className="landing-desk">
          {/* Background paper sheets */}
          <DeskPaperSheet templateId="classic" className="sheet-pos-1" widthPx={310} ariaHidden />
          <DeskPaperSheet templateId="minimal" className="sheet-pos-2" widthPx={320} ariaHidden />
          <DeskPaperSheet templateId="professional" className="sheet-pos-3" widthPx={330} ariaHidden />
          <DeskPaperSheet templateId="student" className="sheet-pos-4" widthPx={300} ariaHidden />
        </div>

        <DeskPaperSheet templateId="modern" className="central-sheet" widthPx={380} />

        <div className="landing-content">
          <h1 className="landing-headline">Make your next version.</h1>
          <p className="landing-subtitle">
            Create, refine, and export a resume that feels like you. Privacy-first, device-local studio.
          </p>
          <div className="landing-actions">
            <button className="cta-oxide" onClick={onCreateNew}>
              <span>CREATE YOUR RESUME</span>
              <ArrowRight className="cta-arrow w-4 h-4" />
            </button>
            {/* Import button handled by parent */}
          </div>
        </div>
      </section>

      {/* Desktop Scroll‑Driven Template Storytelling Section */}
      <section className="desktop-scroll-story-container" ref={desktopScrollStoryRef}>
        <div className="desktop-sticky-stage">
          <div className="desktop-editorial-indicator">
            <TemplateIndicator stepFormatted={activeDesktopTemplate.stepFormatted} name={activeDesktopTemplate.name} />
          </div>
          <DeskPaperSheet
            key={activeDesktopTemplate.id}
            templateId={activeDesktopTemplate.id as TemplateId}
            className="central-sheet"
            widthPx={410}
          />
        </div>
      </section>

      {/* Desktop Quiet Final Conclusion */}
      <section className="quiet-conclusion-section">
        <h2 className="quiet-conclusion-title">Every version starts somewhere.</h2>
        <div className="flex justify-center">
          <button className="cta-oxide px-8 py-4 text-sm" onClick={onCreateNew}>
            <span>CREATE YOUR RESUME</span>
            <ArrowRight className="cta-arrow w-4 h-4" />
          </button>
        </div>
      </section>
    </>
  );
};
