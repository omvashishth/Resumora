import React from 'react';
import { ResumePreview } from '../../components/preview/ResumePreview';
import { createSampleResume } from '../../utils/sampleData';


export type ResumeCardProps = {
  templateId: string;
  isPrimary?: boolean;
};

export const ResumeCard: React.FC<ResumeCardProps> = ({ templateId, isPrimary = false }) => {
  const resume = createSampleResume();
  // Override templateId for this card
  (resume as any).templateId = templateId;
  return (
    <div className={`resume-card ${isPrimary ? 'resume-card--primary' : 'resume-card--secondary'}`}>
      <div className="a4-page-container">
        <ResumePreview resume={resume} />
      </div>
    </div>
  );
};
