import React from 'react';

interface TemplateIndicatorProps {
  stepFormatted: string;
  name: string;
}

export const TemplateIndicator: React.FC<TemplateIndicatorProps> = ({ stepFormatted, name }) => (
  <div className="template-indicator" style={{ fontFamily: 'var(--font-serif)', opacity: 0.85 }}>
    <span className="template-step" style={{ marginRight: '0.5rem', fontWeight: 500 }}>{stepFormatted}</span>
    <span className="template-name" style={{ fontWeight: 300 }}>{name}</span>
  </div>
);
