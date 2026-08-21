import { Resume, ResumeSettings } from '../types/resume';

export const DEFAULT_RESUME_SETTINGS: ResumeSettings = {
  fontFamily: 'Inter',
  fontSize: 10,
  headingSize: 1.4,
  lineSpacing: 1.35,
  sectionSpacing: 16,
  margins: 15,
  accentColor: '#2563eb', // Indigo Blue
  textColor: '#1e293b', // Slate 800
  paperSize: 'a4',
  sectionOrder: [
    'personal',
    'summary',
    'experience',
    'education',
    'projects',
    'skills',
    'certifications',
    'awards',
    'languages',
    'volunteer',
    'customSections',
  ],
};

export const createEmptyResume = (title: string = 'Untitled Resume'): Resume => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    id,
    title,
    templateId: 'modern',
    createdAt: now,
    updatedAt: now,
    settings: { ...DEFAULT_RESUME_SETTINGS },
    personal: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    awards: [],
    languages: [],
    volunteer: [],
    customSections: [],
  };
};

export const createSampleResume = (): Resume => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    id,
    title: 'Senior Software Engineer Resume',
    templateId: 'modern',
    createdAt: now,
    updatedAt: now,
    settings: { ...DEFAULT_RESUME_SETTINGS },
    personal: {
      fullName: 'Alex Morgan',
      title: 'Senior Full Stack Engineer',
      email: 'alex.morgan@example.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      website: 'https://alexmorgan.dev',
      linkedin: 'linkedin.com/in/alexmorgan',
      github: 'github.com/alexmorgan',
      portfolio: 'alexmorgan.dev',
    },
    summary:
      'Results-driven Senior Software Engineer with 6+ years of experience building high-scale web applications, cloud-native backend microservices, and reactive user interfaces. Proven track record in optimizing application performance by 40% and mentoring junior engineering teams.',
    experience: [
      {
        id: crypto.randomUUID(),
        position: 'Senior Software Engineer',
        company: 'Apex Cloud Solutions',
        location: 'San Francisco, CA',
        startDate: '2022-03',
        endDate: '',
        current: true,
        bullets: [
          'Architected and deployed micro-frontend architecture using React, Vite, and TypeScript, reducing initial load times by 45%.',
          'Engineered real-time data streaming pipeline using Node.js and WebSockets, handling over 2M daily active telemetry events.',
          'Spearheaded CI/CD automation pipelines on GitHub Actions, cutting release deployment cycles from 2 hours to 12 minutes.',
        ],
      },
      {
        id: crypto.randomUUID(),
        position: 'Full Stack Engineer',
        company: 'Innovate Tech Labs',
        location: 'Austin, TX',
        startDate: '2019-06',
        endDate: '2022-02',
        current: false,
        bullets: [
          'Developed robust REST and GraphQL APIs using TypeScript, PostgreSQL, and Express, serving 500k+ monthly active users.',
          'Implemented OAuth2 and JWT authentication mechanisms, securing sensitive enterprise customer data.',
          'Collaborated closely with UX designers to craft accessible (WCAG 2.1 AA compliant) design system components.',
        ],
      },
    ],
    education: [
      {
        id: crypto.randomUUID(),
        degree: 'B.S. in Computer Science',
        institution: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        startDate: '2015-08',
        endDate: '2019-05',
        gpa: '3.85 / 4.0',
        description: 'Focus on Distributed Systems, Algorithms, and Software Engineering. Dean’s Honors List (4 consecutive years).',
      },
    ],
    projects: [
      {
        id: crypto.randomUUID(),
        name: 'OmniData Engine',
        description: 'High-performance local-first data synchronization framework for offline web applications.',
        technologies: ['TypeScript', 'IndexedDB', 'Web Workers', 'React'],
        url: 'https://github.com/alexmorgan/omnidata',
        startDate: '2023-01',
        endDate: '2023-06',
        bullets: [
          'Built CRDT-based offline conflict resolution algorithm enabling seamless multi-tab state sync.',
          'Achieved 10,000 ops/sec benchmarking throughput using IndexedDB and structured cloning.',
        ],
      },
    ],
    skills: [
      { id: crypto.randomUUID(), name: 'React / Next.js', category: 'Frontend', level: 'Expert' },
      { id: crypto.randomUUID(), name: 'TypeScript', category: 'Languages', level: 'Expert' },
      { id: crypto.randomUUID(), name: 'Node.js / Express', category: 'Backend', level: 'Advanced' },
      { id: crypto.randomUUID(), name: 'PostgreSQL / Redis', category: 'Databases', level: 'Advanced' },
      { id: crypto.randomUUID(), name: 'Tailwind CSS', category: 'Frontend', level: 'Expert' },
      { id: crypto.randomUUID(), name: 'Docker / AWS', category: 'DevOps', level: 'Intermediate' },
    ],
    certifications: [
      {
        id: crypto.randomUUID(),
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        date: '2023-08',
        url: 'https://aws.amazon.com/verification',
      },
    ],
    awards: [
      {
        id: crypto.randomUUID(),
        title: 'Hackathon Grand Winner',
        issuer: 'SF Tech Summit 2022',
        date: '2022-10',
        description: 'Awarded 1st place among 120 teams for building an AI-powered accessibility auditor.',
      },
    ],
    languages: [
      { id: crypto.randomUUID(), language: 'English', proficiency: 'Native' },
      { id: crypto.randomUUID(), language: 'Spanish', proficiency: 'Intermediate' },
    ],
    volunteer: [
      {
        id: crypto.randomUUID(),
        organization: 'CoderDojo Foundation',
        position: 'Youth Coding Mentor',
        startDate: '2021-01',
        endDate: 'Present',
        current: true,
        description: 'Teaching web fundamentals (HTML, CSS, JavaScript) to high school students on weekends.',
      },
    ],
    customSections: [],
  };
};
