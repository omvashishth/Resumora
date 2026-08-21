export type TemplateId =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'professional'
  | 'student'
  | 'executive-photo'
  | 'modern-sidebar-photo';

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  portfolio: string;
  avatarUrl?: string;
}

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  gpa?: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Proficient' | 'Intermediate' | 'Basic' | string;
}

export interface VolunteerItem {
  id: string;
  organization: string;
  position: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description: string;
  bullets?: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export type SectionKey =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'awards'
  | 'languages'
  | 'volunteer'
  | 'customSections';

export interface ResumeSettings {
  fontFamily: 'Inter' | 'Roboto' | 'Merriweather' | 'Playfair Display' | 'Outfit' | 'Fira Code';
  fontSize: number; // pt (e.g. 10, 11, 12)
  headingSize: number; // pt multiplier relative to font size (e.g. 1.3, 1.5)
  lineSpacing: number; // unitless (e.g. 1.2, 1.4, 1.6)
  sectionSpacing: number; // px (e.g. 12, 16, 20)
  margins: number; // mm (e.g. 12, 15, 20)
  accentColor: string; // hex string e.g. '#2563eb'
  textColor: string; // hex string e.g. '#1e293b'
  paperSize: 'a4' | 'letter';
  sectionOrder: SectionKey[];
}

export interface Resume {
  id: string;
  title: string;
  templateId: TemplateId;
  version?: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  settings: ResumeSettings;
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  awards: AwardItem[];
  languages: LanguageItem[];
  volunteer: VolunteerItem[];
  customSections: CustomSection[];
}
