import { Resume, TemplateId } from '../types/resume';

export interface TemplateProps {
  resume: Resume;
  isPreview?: boolean;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  category: 'Modern' | 'Traditional' | 'Minimalist' | 'Executive' | 'Academic' | 'Creative';
  supportsPhoto: boolean;
  thumbnailUrl?: string;
  component: React.FC<TemplateProps>;
}
