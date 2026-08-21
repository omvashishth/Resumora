import { Resume, SectionKey } from '../types/resume';

export const getSectionCompletion = (
  resume: Resume,
  key: SectionKey
): { label: string; isComplete: boolean; isFilled: boolean } => {
  switch (key) {
    case 'personal': {
      const isComplete = Boolean(resume.personal.fullName && resume.personal.email);
      return {
        label: isComplete ? '✓ Complete' : 'Incomplete',
        isComplete,
        isFilled: Boolean(resume.personal.fullName || resume.personal.email),
      };
    }
    case 'summary': {
      const isComplete = Boolean(resume.summary.trim());
      return {
        label: isComplete ? '✓ Filled' : 'Empty',
        isComplete,
        isFilled: isComplete,
      };
    }
    case 'experience': {
      const count = resume.experience.length;
      return {
        label: count > 0 ? `${count} ${count === 1 ? 'entry' : 'entries'}` : 'Empty',
        isComplete: count > 0,
        isFilled: count > 0,
      };
    }
    case 'education': {
      const count = resume.education.length;
      return {
        label: count > 0 ? `${count} ${count === 1 ? 'entry' : 'entries'}` : 'Empty',
        isComplete: count > 0,
        isFilled: count > 0,
      };
    }
    case 'projects': {
      const count = resume.projects.length;
      return {
        label: count > 0 ? `${count} ${count === 1 ? 'project' : 'projects'}` : 'Empty',
        isComplete: count > 0,
        isFilled: count > 0,
      };
    }
    case 'skills': {
      const count = resume.skills.length;
      return {
        label: count > 0 ? `${count} ${count === 1 ? 'skill' : 'skills'}` : 'Empty',
        isComplete: count > 0,
        isFilled: count > 0,
      };
    }
    case 'certifications': {
      const count = resume.certifications.length;
      return {
        label: count > 0 ? `${count} ${count === 1 ? 'item' : 'items'}` : 'Empty',
        isComplete: count > 0,
        isFilled: count > 0,
      };
    }
    case 'awards': {
      const count = resume.awards.length;
      return {
        label: count > 0 ? `${count} ${count === 1 ? 'award' : 'awards'}` : 'Empty',
        isComplete: count > 0,
        isFilled: count > 0,
      };
    }
    case 'languages': {
      const count = resume.languages.length;
      return {
        label: count > 0 ? `${count} ${count === 1 ? 'language' : 'languages'}` : 'Empty',
        isComplete: count > 0,
        isFilled: count > 0,
      };
    }
    case 'volunteer': {
      const count = resume.volunteer.length;
      return {
        label: count > 0 ? `${count} ${count === 1 ? 'entry' : 'entries'}` : 'Empty',
        isComplete: count > 0,
        isFilled: count > 0,
      };
    }
    case 'customSections': {
      const count = resume.customSections.length;
      return {
        label: count > 0 ? `${count} ${count === 1 ? 'custom section' : 'custom sections'}` : 'Empty',
        isComplete: count > 0,
        isFilled: count > 0,
      };
    }
    default:
      return { label: '', isComplete: false, isFilled: false };
  }
};

export const getSectionTitle = (key: SectionKey): string => {
  const titles: Record<SectionKey, string> = {
    personal: 'Personal Information',
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    projects: 'Projects',
    skills: 'Skills & Expertise',
    certifications: 'Certifications',
    awards: 'Honors & Awards',
    languages: 'Languages',
    volunteer: 'Volunteer Experience',
    customSections: 'Custom Sections',
  };
  return titles[key] || key;
};
