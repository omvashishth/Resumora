import { useState, useCallback } from 'react';
import { Resume, SectionKey, ResumeSettings, PersonalInfo, TemplateId } from '../types/resume';
import { useAutosave, SaveStatus } from './useAutosave';

export const useResume = (initialResume: Resume) => {
  const [resume, setResume] = useState<Resume>(initialResume);
  const { saveStatus } = useAutosave(resume);

  // General updater helper
  const updateResume = useCallback((updater: (prev: Resume) => Resume) => {
    setResume((prev) => {
      const next = updater(prev);
      return { ...next, updatedAt: new Date().toISOString() };
    });
  }, []);

  // Title & Settings
  const setTitle = useCallback((title: string) => {
    updateResume((prev) => ({ ...prev, title }));
  }, [updateResume]);

  const setTemplateId = useCallback((templateId: TemplateId) => {
    updateResume((prev) => ({ ...prev, templateId }));
  }, [updateResume]);

  const updateSettings = useCallback((settingsUpdate: Partial<ResumeSettings>) => {
    updateResume((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settingsUpdate },
    }));
  }, [updateResume]);

  const reorderSections = useCallback((newOrder: SectionKey[]) => {
    updateResume((prev) => ({
      ...prev,
      settings: { ...prev.settings, sectionOrder: newOrder },
    }));
  }, [updateResume]);

  // Personal Info
  const updatePersonal = useCallback((personalUpdate: Partial<PersonalInfo>) => {
    updateResume((prev) => ({
      ...prev,
      personal: { ...prev.personal, ...personalUpdate },
    }));
  }, [updateResume]);

  // Summary
  const setSummary = useCallback((summary: string) => {
    updateResume((prev) => ({ ...prev, summary }));
  }, [updateResume]);

  // Experience Handlers
  const addExperience = useCallback(() => {
    const newItem = {
      id: crypto.randomUUID(),
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    };
    updateResume((prev) => ({
      ...prev,
      experience: [...prev.experience, newItem],
    }));
  }, [updateResume]);

  const updateExperience = useCallback((id: string, update: Partial<Resume['experience'][0]>) => {
    updateResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));
  }, [updateResume]);

  const removeExperience = useCallback((id: string) => {
    updateResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  }, [updateResume]);

  const reorderExperience = useCallback((startIndex: number, endIndex: number) => {
    updateResume((prev) => {
      const result = Array.from(prev.experience);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, experience: result };
    });
  }, [updateResume]);

  // Experience Bullet Handlers
  const addExperienceBullet = useCallback((expId: string, index?: number) => {
    updateResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        const bullets = [...item.bullets];
        const insertIdx = index !== undefined ? index + 1 : bullets.length;
        bullets.splice(insertIdx, 0, '');
        return { ...item, bullets };
      }),
    }));
  }, [updateResume]);

  const updateExperienceBullet = useCallback((expId: string, bulletIndex: number, text: string) => {
    updateResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        const bullets = [...item.bullets];
        bullets[bulletIndex] = text;
        return { ...item, bullets };
      }),
    }));
  }, [updateResume]);

  const removeExperienceBullet = useCallback((expId: string, bulletIndex: number) => {
    updateResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        if (item.bullets.length <= 1) return { ...item, bullets: [''] }; // Keep at least one bullet box
        const bullets = item.bullets.filter((_, idx) => idx !== bulletIndex);
        return { ...item, bullets };
      }),
    }));
  }, [updateResume]);

  // Education Handlers
  const addEducation = useCallback(() => {
    const newItem = {
      id: crypto.randomUUID(),
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      description: '',
    };
    updateResume((prev) => ({
      ...prev,
      education: [...prev.education, newItem],
    }));
  }, [updateResume]);

  const updateEducation = useCallback((id: string, update: Partial<Resume['education'][0]>) => {
    updateResume((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));
  }, [updateResume]);

  const removeEducation = useCallback((id: string) => {
    updateResume((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  }, [updateResume]);

  // Projects Handlers
  const addProject = useCallback(() => {
    const newItem = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: '',
      bullets: [''],
    };
    updateResume((prev) => ({
      ...prev,
      projects: [...prev.projects, newItem],
    }));
  }, [updateResume]);

  const updateProject = useCallback((id: string, update: Partial<Resume['projects'][0]>) => {
    updateResume((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));
  }, [updateResume]);

  const removeProject = useCallback((id: string) => {
    updateResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  }, [updateResume]);

  // Skills Handlers
  const addSkill = useCallback((name: string, category: string = 'General', level: string = '') => {
    if (!name.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      category: category.trim(),
      level: level.trim(),
    };
    updateResume((prev) => ({
      ...prev,
      skills: [...prev.skills, newItem],
    }));
  }, [updateResume]);

  const removeSkill = useCallback((id: string) => {
    updateResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item.id !== id),
    }));
  }, [updateResume]);

  // Certifications Handlers
  const addCertification = useCallback(() => {
    const newItem = {
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      date: '',
      url: '',
    };
    updateResume((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newItem],
    }));
  }, [updateResume]);

  const updateCertification = useCallback((id: string, update: Partial<Resume['certifications'][0]>) => {
    updateResume((prev) => ({
      ...prev,
      certifications: prev.certifications.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));
  }, [updateResume]);

  const removeCertification = useCallback((id: string) => {
    updateResume((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((item) => item.id !== id),
    }));
  }, [updateResume]);

  // Awards Handlers
  const addAward = useCallback(() => {
    const newItem = {
      id: crypto.randomUUID(),
      title: '',
      issuer: '',
      date: '',
      description: '',
    };
    updateResume((prev) => ({
      ...prev,
      awards: [...prev.awards, newItem],
    }));
  }, [updateResume]);

  const updateAward = useCallback((id: string, update: Partial<Resume['awards'][0]>) => {
    updateResume((prev) => ({
      ...prev,
      awards: prev.awards.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));
  }, [updateResume]);

  const removeAward = useCallback((id: string) => {
    updateResume((prev) => ({
      ...prev,
      awards: prev.awards.filter((item) => item.id !== id),
    }));
  }, [updateResume]);

  // Languages Handlers
  const addLanguage = useCallback((language: string, proficiency: string = 'Fluent') => {
    if (!language.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      language: language.trim(),
      proficiency,
    };
    updateResume((prev) => ({
      ...prev,
      languages: [...prev.languages, newItem],
    }));
  }, [updateResume]);

  const removeLanguage = useCallback((id: string) => {
    updateResume((prev) => ({
      ...prev,
      languages: prev.languages.filter((item) => item.id !== id),
    }));
  }, [updateResume]);

  // Volunteer Handlers
  const addVolunteer = useCallback(() => {
    const newItem = {
      id: crypto.randomUUID(),
      organization: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    updateResume((prev) => ({
      ...prev,
      volunteer: [...prev.volunteer, newItem],
    }));
  }, [updateResume]);

  const updateVolunteer = useCallback((id: string, update: Partial<Resume['volunteer'][0]>) => {
    updateResume((prev) => ({
      ...prev,
      volunteer: prev.volunteer.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));
  }, [updateResume]);

  const removeVolunteer = useCallback((id: string) => {
    updateResume((prev) => ({
      ...prev,
      volunteer: prev.volunteer.filter((item) => item.id !== id),
    }));
  }, [updateResume]);

  // Custom Sections Handlers
  const addCustomSection = useCallback((title: string = 'Custom Section') => {
    const newSection = {
      id: crypto.randomUUID(),
      title,
      items: [
        {
          id: crypto.randomUUID(),
          title: '',
          subtitle: '',
          date: '',
          description: '',
        },
      ],
    };
    updateResume((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newSection],
    }));
  }, [updateResume]);

  const removeCustomSection = useCallback((sectionId: string) => {
    updateResume((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((cs) => cs.id !== sectionId),
    }));
  }, [updateResume]);

  return {
    resume,
    setResume,
    saveStatus,
    setTitle,
    setTemplateId,
    updateSettings,
    reorderSections,
    updatePersonal,
    setSummary,
    // Experience
    addExperience,
    updateExperience,
    removeExperience,
    reorderExperience,
    addExperienceBullet,
    updateExperienceBullet,
    removeExperienceBullet,
    // Education
    addEducation,
    updateEducation,
    removeEducation,
    // Projects
    addProject,
    updateProject,
    removeProject,
    // Skills
    addSkill,
    removeSkill,
    // Certifications
    addCertification,
    updateCertification,
    removeCertification,
    // Awards
    addAward,
    updateAward,
    removeAward,
    // Languages
    addLanguage,
    removeLanguage,
    // Volunteer
    addVolunteer,
    updateVolunteer,
    removeVolunteer,
    // Custom
    addCustomSection,
    removeCustomSection,
  };
};
