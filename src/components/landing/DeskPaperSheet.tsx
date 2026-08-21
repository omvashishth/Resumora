import React, { useMemo } from 'react';
import { TemplateRenderer } from '../../templates/TemplateRenderer';
import type { TemplateId } from '../../types/resume';
import { createSampleResume } from '../../utils/sampleData';

interface DeskPaperSheetProps {
  templateId: TemplateId;
  className: string;
  widthPx: number;
  ariaHidden?: boolean;
}

export const DeskPaperSheet: React.FC<DeskPaperSheetProps> = ({
  templateId,
  className,
  widthPx,
  ariaHidden = false,
}) => {
  const sample = useMemo(() => {
    const s = createSampleResume();
    s.templateId = templateId;
    if (templateId === 'executive-photo' || templateId === 'modern-sidebar-photo') {
      s.personal.avatarUrl =
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><circle cx="50" cy="38" r="22" fill="%2394a3b8"/><path d="M20 90 C20 65 35 60 50 60 C65 60 80 65 80 90 Z" fill="%2394a3b8"/></svg>';
    }
    return s;
  }, [templateId]);

  const heightPx = Math.round(widthPx * (297 / 210));
  const scale = widthPx / 793.7;

  return (
    <div className={`landing-paper-sheet ${className}`} style={{ width: `${widthPx}px`, height: `${heightPx}px` }} aria-hidden={ariaHidden ? 'true' : undefined}>
      <div className="landing-paper-inner" style={{ width: '793.7px', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <TemplateRenderer resume={sample} isPreview={true} />
      </div>
    </div>
  );
};
