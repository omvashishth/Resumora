import React, { useMemo, useState, useEffect, useRef } from 'react';
import { DeskPaperSheet } from './DeskPaperSheet';
import { ArrowRight } from 'lucide-react';

export const MobileLandingExperience: React.FC<{ onCreateNew: () => void }> = ({ onCreateNew }) => {
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

  return (
    <>
      {/* Mobile Hero */}
      <section className="px-5 py-16 text-center space-y-5 max-w-md mx-auto">
        <h1 className="landing-headline">Make your next version.</h1>
        <p className="landing-subtitle">Create, refine, and export a resume that feels like you.</p>
        <div className="landing-actions pt-2 space-y-3">
          <button className="cta-oxide w-full min-h-[48px]" onClick={onCreateNew}>
            <span>CREATE YOUR RESUME</span>
            <ArrowRight className="cta-arrow w-4 h-4" />
          </button>
          {/* Import button is handled in parent landing page */}
        </div>
      </section>

      {/* Mobile Story */}
      <section className="mobile-story-section">
        {templateSequence.map((item) => (
          <div key={item.id} className="mobile-story-step">
            <span className="mobile-story-number">{item.num}</span>
            <h2 className="mobile-story-title">{item.name}</h2>
            <DeskPaperSheet templateId={item.id as any} className="mobile-story-paper" widthPx={300} />
          </div>
        ))}
      </section>

      {/* Mobile Quiet Conclusion */}
      <section className="quiet-conclusion-section px-5 py-12">
        <h2 className="quiet-conclusion-title text-2xl">Which version is yours?</h2>
        <div className="w-full max-w-xs mx-auto">
          <button className="cta-oxide w-full min-h-[48px]" onClick={onCreateNew}>
            <span>CREATE YOUR RESUME</span>
            <ArrowRight className="cta-arrow w-4 h-4" />
          </button>
        </div>
      </section>
    </>
  );
};
