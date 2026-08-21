import type { Resume, ExperienceItem, EducationItem, ProjectItem, SkillItem } from '../types/resume';
import { createEmptyResume } from '../utils/sampleData';

export interface ConfidenceWarning {
  field: string;
  message: string;
  severity: 'warning' | 'info';
}

export interface ParsedFieldConfidence {
  fullName: 'High' | 'Medium' | 'Low';
  email: 'High' | 'Medium' | 'Low';
  phone: 'High' | 'Medium' | 'Low';
  experienceCount: number;
  educationCount: number;
  skillsCount: number;
  projectsCount: number;
}

export interface ImportParseResult {
  success: boolean;
  isScannedPdf?: boolean;
  resume: Resume;
  rawText: string;
  confidence: ParsedFieldConfidence;
  warnings: ConfidenceWarning[];
  message: string;
}

export const parseRawTextToResume = (rawText: string, fileName: string): ImportParseResult => {
  const resumeName = fileName.replace(/\.[^/.]+$/, '');
  const resume = createEmptyResume(resumeName);
  const warnings: ConfidenceWarning[] = [];

  const confidence: ParsedFieldConfidence = {
    fullName: 'Low',
    email: 'Low',
    phone: 'Low',
    experienceCount: 0,
    educationCount: 0,
    skillsCount: 0,
    projectsCount: 0,
  };

  const cleanText = rawText.trim();
  if (cleanText.length < 25) {
    return {
      success: false,
      isScannedPdf: true,
      resume,
      rawText: cleanText,
      confidence,
      warnings: [
        {
          field: 'Document Text',
          message: "This file appears to be image-based or contains unreadable text. We couldn't automatically extract its content.",
          severity: 'warning',
        },
      ],
      message: "This PDF appears to be image-based. We couldn't automatically extract its text.",
    };
  }

  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Name Detection (First non-contact line < 50 chars)
  const candidateNameLine = lines.find((l) => l.length < 50 && !l.includes('@') && !l.match(/\d{3}/));
  if (candidateNameLine) {
    resume.personal.fullName = candidateNameLine;
    confidence.fullName = 'High';
  } else {
    warnings.push({
      field: 'Full Name',
      message: 'Name could not be confidently identified at top of document.',
      severity: 'warning',
    });
  }

  // 2. Email Detection
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    resume.personal.email = emailMatch[0];
    confidence.email = 'High';
  } else {
    warnings.push({
      field: 'Email Address',
      message: 'No valid email address detected.',
      severity: 'info',
    });
  }

  // 3. Phone Detection
  const phoneMatch = cleanText.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    resume.personal.phone = phoneMatch[0];
    confidence.phone = 'High';
  }

  // 4. LinkedIn & GitHub Profiles
  const linkedinMatch = cleanText.match(/(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) resume.personal.linkedin = linkedinMatch[0];

  const githubMatch = cleanText.match(/(github\.com\/[a-zA-Z0-9_-]+)/i);
  if (githubMatch) resume.personal.github = githubMatch[0];

  // 5. Section Partitioning based on uppercase keywords
  let currentSection = 'summary';
  let summaryBuffer: string[] = [];
  const experienceBuffer: string[] = [];
  const educationBuffer: string[] = [];
  const skillsBuffer: string[] = [];
  const projectsBuffer: string[] = [];

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.includes('EXPERIENCE') || upper.includes('EMPLOYMENT') || upper.includes('WORK HISTORY')) {
      currentSection = 'experience';
      continue;
    }
    if (upper.includes('EDUCATION') || upper.includes('ACADEMIC') || upper.includes('DEGREES')) {
      currentSection = 'education';
      continue;
    }
    if (upper.includes('SKILLS') || upper.includes('COMPETENCIES') || upper.includes('TECHNOLOGIES')) {
      currentSection = 'skills';
      continue;
    }
    if (upper.includes('PROJECTS') || upper.includes('PORTFOLIO')) {
      currentSection = 'projects';
      continue;
    }

    if (currentSection === 'summary') summaryBuffer.push(line);
    else if (currentSection === 'experience') experienceBuffer.push(line);
    else if (currentSection === 'education') educationBuffer.push(line);
    else if (currentSection === 'skills') skillsBuffer.push(line);
    else if (currentSection === 'projects') projectsBuffer.push(line);
  }

  // Set Summary
  resume.summary = summaryBuffer.slice(1, 6).join(' ');

  // Process Skills
  if (skillsBuffer.length > 0) {
    const rawSkillsText = skillsBuffer.join(' ');
    const tokens = rawSkillsText.split(/[,•|/]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 35);
    const parsedSkills: SkillItem[] = tokens.map((name) => ({
      id: crypto.randomUUID(),
      name,
      category: 'General',
    }));
    resume.skills = parsedSkills.slice(0, 20);
    confidence.skillsCount = resume.skills.length;
  }

  // Process Experience Entries
  if (experienceBuffer.length > 0) {
    const expItem: ExperienceItem = {
      id: crypto.randomUUID(),
      position: experienceBuffer[0] || 'Software Professional',
      company: experienceBuffer[1] || 'Company Name',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: experienceBuffer.slice(2, 6).filter((b) => b.length > 10),
    };
    resume.experience = [expItem];
    confidence.experienceCount = 1;
  }

  // Process Education Entries
  if (educationBuffer.length > 0) {
    const eduItem: EducationItem = {
      id: crypto.randomUUID(),
      degree: educationBuffer[0] || 'Degree / Qualification',
      institution: educationBuffer[1] || 'University / Institution',
      location: '',
      startDate: '',
      endDate: '',
      description: educationBuffer.slice(2, 4).join(' '),
    };
    resume.education = [eduItem];
    confidence.educationCount = 1;
  }

  // Check for date range warnings
  const hasDateMatch = cleanText.match(/\b(20\d\d|19\d\d)\b/);
  if (!hasDateMatch) {
    warnings.push({
      field: 'Dates',
      message: 'One or more position date ranges could not be confidently identified.',
      severity: 'warning',
    });
  }

  return {
    success: true,
    resume,
    rawText: cleanText,
    confidence,
    warnings,
    message: `Successfully parsed resume content from ${fileName}.`,
  };
};
