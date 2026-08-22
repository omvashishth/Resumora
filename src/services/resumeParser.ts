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

// Regex patterns for section heading matching
const SECTION_PATTERNS = {
  summary: /^(?:PROFESSIONAL\s+)?(?:SUMMARY|PROFILE|OBJECTIVE|ABOUT\s+(?:ME|MYSELF)|EXECUTIVE\s+SUMMARY|BIOGRAPHY|CAREER\s+SUMMARY)[\s:]*$/i,
  experience: /^(?:WORK\s+|PROFESSIONAL\s+|CAREER\s+|EMPLOYMENT\s+)?(?:EXPERIENCE|HISTORY|EMPLOYMENT|POSITIONS|WORK\s+HISTORY)[\s:]*$/i,
  education: /^(?:EDUCATION|ACADEMIC\s+(?:BACKGROUND|HISTORY)|DEGREES|ACADEMIC|EDUCATION\s+&\s+CREDENTIALS)[\s:]*$/i,
  skills: /^(?:TECHNICAL\s+|CORE\s+|KEY\s+)?(?:SKILLS|COMPETENCIES|TECHNOLOGIES|AREAS\s+OF\s+EXPERTISE|EXPERTISE|TECH\s+STACK|TOOLS\s+&\s+TECHNOLOGIES)[\s:]*$/i,
  projects: /^(?:KEY\s+|NOTABLE\s+|PERSONAL\s+|SELECTED\s+)?(?:PROJECTS|PORTFOLIO|ACADEMIC\s+PROJECTS)[\s:]*$/i,
  certifications: /^(?:CERTIFICATIONS|CERTIFICATES|LICENSES|LICENSES\s+&\s+CERTIFICATIONS|COURSES)[\s:]*$/i,
};

// Date range regex matching formats like "Jan 2021 - Present", "2019 - 2022", "05/2020 – 08/2023"
const DATE_RANGE_REGEX = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\b(19\d\d|20\d\d)\b\s*[-–—to]+\s*(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\b(19\d\d|20\d\d)\b|Present|Current|Now)/i;
const SINGLE_YEAR_REGEX = /\b(19\d\d|20\d\d)\b/;

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

  const rawLines = cleanText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Contact Info Extraction
  // Email Detection
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

  // Phone Detection
  const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    resume.personal.phone = phoneMatch[0];
    confidence.phone = 'High';
  }

  // LinkedIn, GitHub, Website
  const linkedinMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) {
    resume.personal.linkedin = linkedinMatch[0];
  }

  const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) {
    resume.personal.github = githubMatch[0];
  }

  const websiteMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9_-]+\.(?:dev|io|me|app|com|org|net))(?:\/[^\s]*)?/i);
  if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('github')) {
    resume.personal.website = websiteMatch[0];
  }

  // Location Detection (City, State / Country)
  const locationMatch = cleanText.match(/\b([A-Z][a-zA-Z\s.-]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z\s]+))\b/);
  if (locationMatch && locationMatch[1].length < 40) {
    resume.personal.location = locationMatch[1].trim();
  }

  // 2. Full Name & Job Title Detection
  // Search in first 6 lines
  const topLines = rawLines.slice(0, 8);
  for (const line of topLines) {
    // Skip lines with email, phone, web links, or known headings
    if (
      line.includes('@') ||
      line.match(/\d{3}/) ||
      line.toLowerCase().includes('linkedin') ||
      line.toLowerCase().includes('github') ||
      line.toLowerCase().includes('http') ||
      line.toLowerCase().includes('resume') ||
      line.toLowerCase().includes('curriculum vitae')
    ) {
      continue;
    }

    // Clean potential prefixes like "Name: Alex Morgan"
    const cleanedLine = line.replace(/^(name|full name)\s*:\s*/i, '').trim();

    // Candidate name is 2-4 words, 2-40 characters, letters, dots, hyphens
    if (
      !resume.personal.fullName &&
      cleanedLine.length >= 2 &&
      cleanedLine.length <= 40 &&
      /^[a-zA-Z\s.-]+$/.test(cleanedLine) &&
      cleanedLine.split(/\s+/).length <= 5
    ) {
      resume.personal.fullName = cleanedLine;
      confidence.fullName = 'High';
      continue;
    }

    // Secondary line could be target job title
    if (
      resume.personal.fullName &&
      !resume.personal.title &&
      cleanedLine.length >= 3 &&
      cleanedLine.length <= 50 &&
      !cleanedLine.includes('•') &&
      !cleanedLine.includes('|')
    ) {
      resume.personal.title = cleanedLine;
    }
  }

  if (!resume.personal.fullName) {
    warnings.push({
      field: 'Full Name',
      message: 'Name could not be confidently identified at top of document.',
      severity: 'warning',
    });
  }

  // 3. Section Partitioning
  type SectionType = 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'other';
  let currentSection: SectionType = 'header';

  const sectionBuckets: Record<SectionType, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    other: [],
  };

  for (const line of rawLines) {
    const trimmed = line.trim();
    // Check if line matches a known section heading
    let matchedSection: SectionType | null = null;
    for (const [secKey, regex] of Object.entries(SECTION_PATTERNS)) {
      if (regex.test(trimmed)) {
        matchedSection = secKey as SectionType;
        break;
      }
    }

    // Fallback: check if short uppercase line contains section keyword
    if (!matchedSection && trimmed.length < 35 && trimmed === trimmed.toUpperCase()) {
      if (trimmed.includes('EXPERIENCE') || trimmed.includes('EMPLOYMENT') || trimmed.includes('WORK HISTORY')) {
        matchedSection = 'experience';
      } else if (trimmed.includes('EDUCATION') || trimmed.includes('ACADEMIC')) {
        matchedSection = 'education';
      } else if (trimmed.includes('SKILL') || trimmed.includes('COMPETENC') || trimmed.includes('TECH')) {
        matchedSection = 'skills';
      } else if (trimmed.includes('PROJECT') || trimmed.includes('PORTFOLIO')) {
        matchedSection = 'projects';
      } else if (trimmed.includes('SUMMARY') || trimmed.includes('PROFILE') || trimmed.includes('OBJECTIVE')) {
        matchedSection = 'summary';
      } else if (trimmed.includes('CERTIF')) {
        matchedSection = 'certifications';
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
      continue;
    }

    sectionBuckets[currentSection].push(trimmed);
  }

  // 4. Process Summary
  if (sectionBuckets.summary.length > 0) {
    resume.summary = sectionBuckets.summary.join(' ');
  }

  // 5. Process Work Experience (Multi-Entry Parser)
  if (sectionBuckets.experience.length > 0) {
    const expLines = sectionBuckets.experience;
    const parsedExperiences: ExperienceItem[] = [];
    let currentExp: Partial<ExperienceItem> | null = null;
    let currentBullets: string[] = [];

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const dateMatch = line.match(DATE_RANGE_REGEX) || (line.length < 40 ? line.match(SINGLE_YEAR_REGEX) : null);
      const isBullet = /^[•\-*–—\u2022]\s*/.test(line);

      // Check if this line looks like a new Job Header (contains dates or line i+1 contains dates)
      const nextLineHasDate = i + 1 < expLines.length && (expLines[i + 1].match(DATE_RANGE_REGEX) || expLines[i + 1].match(SINGLE_YEAR_REGEX));
      const looksLikeJobHeader = !isBullet && (dateMatch !== null || nextLineHasDate || (currentExp === null && line.length < 60));

      if (looksLikeJobHeader && currentExp !== null && currentBullets.length > 0) {
        // Finalize previous experience entry
        parsedExperiences.push({
          id: crypto.randomUUID(),
          position: currentExp.position || 'Professional',
          company: currentExp.company || 'Company',
          location: currentExp.location || '',
          startDate: currentExp.startDate || '',
          endDate: currentExp.endDate || '',
          current: currentExp.current || false,
          bullets: currentBullets,
        });
        currentExp = null;
        currentBullets = [];
      }

      if (currentExp === null) {
        // Initialize new Experience entry
        currentExp = {
          id: crypto.randomUUID(),
          position: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
        };

        if (line.includes('|') || line.includes(' - ') || line.includes(' – ') || line.includes(' · ')) {
          const parts = line.split(/[|·–—]|\s+-\s+/).map((p) => p.trim());
          currentExp.position = parts[0] || 'Software Professional';
          currentExp.company = parts[1] || '';
          if (parts[2] && parts[2].match(/\d{4}/)) {
            currentExp.startDate = parts[2];
          }
        } else {
          currentExp.position = line;
        }

        if (dateMatch) {
          currentExp.startDate = dateMatch[1] || '';
          currentExp.endDate = dateMatch[2] || '';
          currentExp.current = /present|current|now/i.test(dateMatch[0]);
        }
      } else if (!currentExp.company && !isBullet && line.length < 60) {
        // Secondary header line (e.g. company name or date)
        if (dateMatch) {
          currentExp.startDate = dateMatch[1] || '';
          currentExp.endDate = dateMatch[2] || '';
          currentExp.current = /present|current|now/i.test(dateMatch[0]);
          const lineWithoutDate = line.replace(DATE_RANGE_REGEX, '').replace(/[|·–—(),]/g, '').trim();
          if (lineWithoutDate) {
            currentExp.company = lineWithoutDate;
          }
        } else {
          currentExp.company = line;
        }
      } else {
        // Bullet or description line
        const cleanBullet = line.replace(/^[•\-*–—\u2022]\s*/, '').trim();
        if (cleanBullet.length > 5) {
          currentBullets.push(cleanBullet);
        }
      }
    }

    if (currentExp !== null) {
      parsedExperiences.push({
        id: crypto.randomUUID(),
        position: currentExp.position || 'Software Professional',
        company: currentExp.company || 'Company Name',
        location: currentExp.location || '',
        startDate: currentExp.startDate || '',
        endDate: currentExp.endDate || '',
        current: currentExp.current || false,
        bullets: currentBullets.length > 0 ? currentBullets : ['Spearheaded key initiatives and contributed to core product deliverables.'],
      });
    }

    resume.experience = parsedExperiences;
    confidence.experienceCount = parsedExperiences.length;
  }

  // 6. Process Education (Multi-Entry Parser)
  if (sectionBuckets.education.length > 0) {
    const eduLines = sectionBuckets.education;
    const parsedEducation: EducationItem[] = [];
    let currentEdu: Partial<EducationItem> | null = null;

    for (let i = 0; i < eduLines.length; i++) {
      const line = eduLines[i];
      const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(SINGLE_YEAR_REGEX);
      const isDegreeLine = /bachelor|master|b\.s|b\.a|m\.s|m\.b\.a|ph\.d|doctorate|associate|b\.tech|b\.e|diploma|degree/i.test(line);
      const isSchoolLine = /university|college|institute|school|academy|polytechnic/i.test(line);

      if (currentEdu === null) {
        currentEdu = {
          id: crypto.randomUUID(),
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
        };
      }

      if (isDegreeLine) {
        currentEdu.degree = line;
      } else if (isSchoolLine) {
        currentEdu.institution = line;
      } else if (!currentEdu.degree) {
        currentEdu.degree = line;
      } else if (!currentEdu.institution) {
        currentEdu.institution = line;
      }

      if (dateMatch) {
        currentEdu.startDate = dateMatch[1] || '';
        currentEdu.endDate = dateMatch[2] || dateMatch[1] || '';
      }

      // Check if GPA mentioned
      const gpaMatch = line.match(/GPA[:\s]+([\d.]+)/i);
      if (gpaMatch) {
        currentEdu.gpa = gpaMatch[1];
      }

      // End of entry if next line starts new school or is end of section
      const nextIsSchool = i + 1 < eduLines.length && (/university|college|institute|bachelor|master/i.test(eduLines[i + 1]));
      if (nextIsSchool || i === eduLines.length - 1) {
        parsedEducation.push({
          id: crypto.randomUUID(),
          degree: currentEdu.degree || 'Degree / Qualification',
          institution: currentEdu.institution || 'University / Institution',
          location: currentEdu.location || '',
          startDate: currentEdu.startDate || '',
          endDate: currentEdu.endDate || '',
          gpa: currentEdu.gpa,
          description: '',
        });
        currentEdu = null;
      }
    }

    resume.education = parsedEducation;
    confidence.educationCount = parsedEducation.length;
  }

  // 7. Process Skills (Categorized & Tokenized)
  if (sectionBuckets.skills.length > 0) {
    const parsedSkills: SkillItem[] = [];

    for (const line of sectionBuckets.skills) {
      // Check if line is categorized e.g. "Languages: JavaScript, TypeScript, Python"
      if (line.includes(':')) {
        const [catName, skillsList] = line.split(':');
        const tokens = skillsList.split(/[,•|/]/).map((s) => s.trim()).filter((s) => s.length >= 2 && s.length <= 35);
        for (const token of tokens) {
          parsedSkills.push({
            id: crypto.randomUUID(),
            name: token,
            category: catName.trim() || 'General',
          });
        }
      } else {
        const tokens = line.split(/[,•|/]/).map((s) => s.trim()).filter((s) => s.length >= 2 && s.length <= 35);
        for (const token of tokens) {
          parsedSkills.push({
            id: crypto.randomUUID(),
            name: token,
            category: 'General',
          });
        }
      }
    }

    // Deduplicate skills by name
    const seenSkills = new Set<string>();
    const uniqueSkills: SkillItem[] = [];
    for (const s of parsedSkills) {
      const lower = s.name.toLowerCase();
      if (!seenSkills.has(lower)) {
        seenSkills.add(lower);
        uniqueSkills.push(s);
      }
    }

    resume.skills = uniqueSkills.slice(0, 30);
    confidence.skillsCount = resume.skills.length;
  }

  // 8. Process Projects
  if (sectionBuckets.projects.length > 0) {
    const projLines = sectionBuckets.projects;
    const parsedProjects: ProjectItem[] = [];
    let currentProj: Partial<ProjectItem> | null = null;
    let projBullets: string[] = [];

    for (let i = 0; i < projLines.length; i++) {
      const line = projLines[i];
      const isBullet = /^[•\-*–—\u2022]\s*/.test(line);

      if (!isBullet && line.length < 60 && currentProj !== null && projBullets.length > 0) {
        parsedProjects.push({
          id: crypto.randomUUID(),
          name: currentProj.name || 'Project Name',
          description: currentProj.description || '',
          technologies: [],
          url: '',
          startDate: '',
          endDate: '',
          bullets: projBullets,
        });
        currentProj = null;
        projBullets = [];
      }

      if (currentProj === null) {
        currentProj = {
          id: crypto.randomUUID(),
          name: line.replace(/^[•\-*–—\u2022]\s*/, '').trim(),
          description: '',
        };
      } else if (isBullet) {
        projBullets.push(line.replace(/^[•\-*–—\u2022]\s*/, '').trim());
      } else {
        currentProj.description = (currentProj.description ? currentProj.description + ' ' : '') + line;
      }
    }

    if (currentProj !== null) {
      parsedProjects.push({
        id: crypto.randomUUID(),
        name: currentProj.name || 'Project Name',
        description: currentProj.description || '',
        technologies: [],
        url: '',
        startDate: '',
        endDate: '',
        bullets: projBullets,
      });
    }

    resume.projects = parsedProjects;
    confidence.projectsCount = parsedProjects.length;
  }

  // Fallback: If section partitioning didn't catch experience/education/skills due to unusual layout, run whole-document heuristic scanner
  if (resume.experience.length === 0 && cleanText.match(/(?:Architected|Developed|Engineered|Spearheaded|Managed|Led|Designed)\b/i)) {
    const expItem: ExperienceItem = {
      id: crypto.randomUUID(),
      position: resume.personal.title || 'Senior Software Engineer',
      company: 'Enterprise Systems',
      location: resume.personal.location || '',
      startDate: '2021',
      endDate: 'Present',
      current: true,
      bullets: rawLines.filter((l) => l.length > 30 && /^[•\-*–—\u2022]/.test(l)).map((l) => l.replace(/^[•\-*–—\u2022]\s*/, '')),
    };
    if (expItem.bullets && expItem.bullets.length > 0) {
      resume.experience = [expItem];
      confidence.experienceCount = 1;
    }
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
