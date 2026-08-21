import React from 'react';
import { TemplateProps, TemplateDefinition } from './types';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { ProfessionalTemplate } from './ProfessionalTemplate';
import { StudentTemplate } from './StudentTemplate';
import { ExecutivePhotoTemplate } from './ExecutivePhotoTemplate';
import { ModernSidebarPhotoTemplate } from './ModernSidebarPhotoTemplate';
import { TemplateId } from '../types/resume';

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'classic',
    name: 'Classic Serif',
    description: 'Traditional centered layout with elegant serif typography and understated horizontal dividers.',
    category: 'Traditional',
    supportsPhoto: false,
    component: ClassicTemplate,
  },
  {
    id: 'modern',
    name: 'Modern Accent',
    description: 'Sleek contemporary design featuring accent vertical bars, skill pill tags, and clean metadata.',
    category: 'Modern',
    supportsPhoto: false,
    component: ModernTemplate,
  },
  {
    id: 'minimal',
    name: 'Minimal Mono',
    description: 'Ultra-clean monochrome layout with generous whitespace, subtle borders, and monospace details.',
    category: 'Minimalist',
    supportsPhoto: false,
    component: MinimalTemplate,
  },
  {
    id: 'professional',
    name: 'Executive Banner',
    description: 'High-density corporate layout with a prominent color accent header block for senior leaders.',
    category: 'Executive',
    supportsPhoto: false,
    component: ProfessionalTemplate,
  },
  {
    id: 'student',
    name: 'Academic / Student',
    description: 'Highlights Education, GPA, and Projects at the top, tailored for students and early-career pros.',
    category: 'Academic',
    supportsPhoto: false,
    component: StudentTemplate,
  },
  {
    id: 'executive-photo',
    name: 'Executive Portrait',
    description: 'Executive leadership template with a circular profile portrait and high-contrast gold/navy accent headers.',
    category: 'Executive',
    supportsPhoto: true,
    component: ExecutivePhotoTemplate,
  },
  {
    id: 'modern-sidebar-photo',
    name: 'Modern Sidebar Photo',
    description: 'Sleek split 2-column editorial template featuring a framed profile portrait and dark contact sidebar.',
    category: 'Modern',
    supportsPhoto: true,
    component: ModernSidebarPhotoTemplate,
  },
];

export const getTemplateById = (id: TemplateId): TemplateDefinition => {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[1]; // Default to Modern
};

export const TemplateRenderer: React.FC<TemplateProps> = ({ resume, isPreview }) => {
  const templateDef = getTemplateById(resume.templateId);
  const Component = templateDef.component;
  return <Component resume={resume} isPreview={isPreview} />;
};
