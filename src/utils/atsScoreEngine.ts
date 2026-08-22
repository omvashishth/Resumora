import type { Resume, SectionKey } from '../types/resume';

export interface ATSCategoryScore {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'needs-work';
  details: string;
}

export interface ATSRecommendation {
  id: string;
  category: string;
  sectionKey?: SectionKey | 'customization';
  severity: 'critical' | 'warning' | 'tip';
  title: string;
  description: string;
  impactPoints: number;
}

export interface ActionVerbStats {
  strongVerbsCount: number;
  weakVerbsCount: number;
  detectedStrongVerbs: string[];
  detectedWeakVerbs: string[];
}

export interface MetricStats {
  totalMetricsCount: number;
  bulletsWithMetricsCount: number;
  totalBulletsCount: number;
  metricPercentage: number;
}

export interface ATSAnalysisResult {
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  verdict: string;
  categories: {
    contact: ATSCategoryScore;
    summary: ATSCategoryScore;
    experience: ATSCategoryScore;
    skills: ATSCategoryScore;
    education: ATSCategoryScore;
    formatting: ATSCategoryScore;
  };
  recommendations: ATSRecommendation[];
  actionVerbs: ActionVerbStats;
  metrics: MetricStats;
  totalWordCount: number;
}

// Curated dictionary of high-impact ATS power action verbs
export const STRONG_ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'administered', 'advised', 'advocated', 'aligned', 'allocated',
  'analyzed', 'architected', 'assembled', 'audited', 'authored', 'automated', 'boosted',
  'budgeted', 'built', 'calculated', 'centralized', 'championed', 'clarified', 'coached',
  'collaborated', 'commissioned', 'communicated', 'compiled', 'completed', 'composed',
  'conceived', 'conceptualized', 'conducted', 'consolidated', 'constructed', 'consulted',
  'contracted', 'converted', 'coordinated', 'crafted', 'created', 'cultivated', 'customized',
  'debugged', 'decreased', 'defined', 'delegated', 'delivered', 'deployed', 'designed',
  'developed', 'devised', 'diagnosed', 'directed', 'discovered', 'documented', 'doubled',
  'drafted', 'drove', 'eliminated', 'engineered', 'enhanced', 'established', 'evaluated',
  'exceeded', 'executed', 'expanded', 'expedited', 'facilitated', 'finalized', 'forecasted',
  'formulated', 'founded', 'fostered', 'generated', 'governed', 'guided', 'halved',
  'headed', 'identified', 'implemented', 'improved', 'increased', 'influenced', 'initiated',
  'innovated', 'inspected', 'instituted', 'instructed', 'integrated', 'interpreted',
  'introduced', 'invented', 'investigated', 'launched', 'led', 'leveraged', 'maintained',
  'managed', 'maximized', 'mentored', 'migrated', 'minimized', 'modernized', 'monitored',
  'motivated', 'negotiated', 'optimized', 'orchestrated', 'organized', 'originated',
  'overhauled', 'oversaw', 'partnered', 'performed', 'pioneered', 'planned', 'prevented',
  'produced', 'programmed', 'promoted', 'proposed', 'published', 're-engineered',
  'rebuilt', 'recruited', 'redesigned', 'reduced', 'refined', 'reformed', 'regulated',
  'remodeled', 'reorganized', 'replaced', 'researched', 'resolved', 'restructured',
  'revamped', 'revitalized', 'revolutionized', 'saved', 'scaled', 'scheduled', 'secured',
  'selected', 'simplified', 'slashed', 'solved', 'spearheaded', 'standardized',
  'streamlined', 'strengthened', 'structured', 'succeeded', 'supervised', 'surpassed',
  'synthesized', 'systematized', 'targeted', 'tested', 'tracked', 'trained', 'transformed',
  'transitioned', 'tripled', 'troubleshot', 'unified', 'upgraded', 'utilized', 'validated',
  'yielded'
]);

// Passive / weak phrases that reduce ATS and recruiter impact
export const WEAK_PASSIVE_PHRASES = [
  'responsible for',
  'duties included',
  'worked on',
  'helped with',
  'assisted in',
  'handled',
  'participated in',
  'tasked with',
  'involved with',
  'contributed to'
];

/**
 * Metric & Quantifiable achievement detector regex patterns
 */
const METRIC_PATTERNS = [
  /\b\d+(\.\d+)?%\b/g, // 25%, 99.9%
  /\$\s?\d+([,\.]\d+)?\s?[kKmMbB]?\b/g, // $500K, $1.2M, $50,000
  /\b\d+\s?(k|K|M|B|x|X)\b/g, // 100k, 10x, 2X
  /\b(reduced|increased|boosted|saved|grew|scaled|accelerated)\b[^\.\n]*\b\d+/gi, // increased revenue by 40
  /\b\d+\s?(users|clients|customers|students|engineers|teams|servers|nodes|requests|downloads|sales|endpoints)\b/gi,
  /\b(sub-second|latency|uptime|throughput)\b[^\.\n]*\b\d+/gi,
];

export function analyzeResumeATS(resume: Resume): ATSAnalysisResult {
  const recommendations: ATSRecommendation[] = [];

  // ==========================================
  // 1. CONTACT COMPLETENESS (Max 15 pts)
  // ==========================================
  let contactScore = 0;
  const p = resume.personal;

  if (p.fullName && p.fullName.trim().length >= 3) {
    contactScore += 3;
  } else {
    recommendations.push({
      id: 'contact-name',
      category: 'Contact Information',
      sectionKey: 'personal',
      severity: 'critical',
      title: 'Full Name is Missing',
      description: 'ATS engines require a distinct full name at the top of the resume.',
      impactPoints: 3,
    });
  }

  if (p.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) {
    contactScore += 3;
  } else {
    recommendations.push({
      id: 'contact-email',
      category: 'Contact Information',
      sectionKey: 'personal',
      severity: 'critical',
      title: 'Valid Email Address Required',
      description: 'Ensure a professional email address is provided for recruiter reach-outs.',
      impactPoints: 3,
    });
  }

  if (p.phone && p.phone.trim().length >= 7) {
    contactScore += 3;
  } else {
    recommendations.push({
      id: 'contact-phone',
      category: 'Contact Information',
      sectionKey: 'personal',
      severity: 'warning',
      title: 'Phone Number is Missing',
      description: 'A direct phone number is strongly recommended for candidate contact.',
      impactPoints: 3,
    });
  }

  if (p.location && p.location.trim().length >= 3) {
    contactScore += 2;
  } else {
    recommendations.push({
      id: 'contact-location',
      category: 'Contact Information',
      sectionKey: 'personal',
      severity: 'warning',
      title: 'Location (City, Country / State) is Missing',
      description: 'ATS filters often check candidate proximity and work authorization geography.',
      impactPoints: 2,
    });
  }

  if (p.linkedin && p.linkedin.toLowerCase().includes('linkedin.com')) {
    contactScore += 2;
  } else {
    recommendations.push({
      id: 'contact-linkedin',
      category: 'Contact Information',
      sectionKey: 'personal',
      severity: 'tip',
      title: 'Add LinkedIn Profile URL',
      description: 'Over 85% of technical recruiters cross-reference LinkedIn credentials.',
      impactPoints: 2,
    });
  }

  if ((p.github && p.github.trim()) || (p.portfolio && p.portfolio.trim()) || (p.website && p.website.trim())) {
    contactScore += 2;
  }

  const contactCategory: ATSCategoryScore = {
    name: 'Contact & Headers',
    score: contactScore,
    maxScore: 15,
    percentage: Math.round((contactScore / 15) * 100),
    status: contactScore >= 13 ? 'excellent' : contactScore >= 9 ? 'good' : 'needs-work',
    details: `${contactScore}/15 points. Complete personal details ensure recruiters and ATS parser recognition.`,
  };

  // ==========================================
  // 2. PROFESSIONAL SUMMARY (Max 10 pts)
  // ==========================================
  let summaryScore = 0;
  const summaryText = resume.summary ? resume.summary.trim() : '';
  const summaryWords = summaryText ? summaryText.split(/\s+/).filter(Boolean) : [];

  if (summaryWords.length >= 25 && summaryWords.length <= 150) {
    summaryScore += 7;
  } else if (summaryWords.length > 0 && summaryWords.length < 25) {
    summaryScore += 3;
    recommendations.push({
      id: 'summary-too-short',
      category: 'Professional Summary',
      sectionKey: 'summary',
      severity: 'warning',
      title: 'Expand Professional Summary',
      description: 'Your summary is under 25 words. Aim for 3–4 impactful sentences (40–80 words) highlighting core domain achievements.',
      impactPoints: 4,
    });
  } else if (summaryWords.length > 150) {
    summaryScore += 4;
    recommendations.push({
      id: 'summary-too-long',
      category: 'Professional Summary',
      sectionKey: 'summary',
      severity: 'tip',
      title: 'Make Summary More Concise',
      description: 'Your summary exceeds 150 words. Recruiters spend ~6 seconds scanning; keep it under 100 words.',
      impactPoints: 3,
    });
  } else {
    recommendations.push({
      id: 'summary-missing',
      category: 'Professional Summary',
      sectionKey: 'summary',
      severity: 'critical',
      title: 'Add a Professional Summary',
      description: 'A punchy 3-sentence summary immediately frames your seniority level and core competencies.',
      impactPoints: 7,
    });
  }

  // Check first-person pronoun overuse ("I", "my", "me")
  const firstPersonMatches = (summaryText.match(/\b(I|me|my|myself)\b/g) || []).length;
  if (firstPersonMatches === 0 && summaryWords.length > 0) {
    summaryScore += 3;
  } else if (firstPersonMatches > 0) {
    recommendations.push({
      id: 'summary-first-person',
      category: 'Professional Summary',
      sectionKey: 'summary',
      severity: 'tip',
      title: 'Avoid First-Person Pronouns in Summary',
      description: 'Standard executive resume convention omits "I", "my", and "me" in favor of direct active voice.',
      impactPoints: 3,
    });
  }

  const summaryCategory: ATSCategoryScore = {
    name: 'Executive Summary',
    score: summaryScore,
    maxScore: 10,
    percentage: Math.round((summaryScore / 10) * 100),
    status: summaryScore >= 8 ? 'excellent' : summaryScore >= 5 ? 'good' : 'needs-work',
    details: `${summaryScore}/10 points. Concise, achievement-oriented pitch.`,
  };

  // ==========================================
  // 3. EXPERIENCE & IMPACT (Max 30 pts)
  // ==========================================
  let experienceScore = 0;
  const experiences = resume.experience || [];
  const allBullets: string[] = [];
  const detectedStrongVerbs = new Set<string>();
  const detectedWeakVerbs = new Set<string>();
  let bulletsWithMetrics = 0;

  experiences.forEach((exp) => {
    (exp.bullets || []).forEach((bullet) => {
      const trimmed = bullet.trim();
      if (!trimmed) return;
      allBullets.push(trimmed);

      // Check first word for strong action verb
      const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
      if (firstWord && STRONG_ACTION_VERBS.has(firstWord)) {
        detectedStrongVerbs.add(firstWord);
      }

      // Check for weak passive phrases
      WEAK_PASSIVE_PHRASES.forEach((phrase) => {
        if (trimmed.toLowerCase().includes(phrase)) {
          detectedWeakVerbs.add(phrase);
        }
      });

      // Check for metrics/KPIs
      const hasMetric = METRIC_PATTERNS.some((pattern) => pattern.test(trimmed));
      if (hasMetric) {
        bulletsWithMetrics++;
      }
    });
  });

  // Score Role History Presence
  if (experiences.length >= 1) {
    experienceScore += 6;
  } else {
    recommendations.push({
      id: 'exp-missing',
      category: 'Work Experience',
      sectionKey: 'experience',
      severity: 'critical',
      title: 'Add Work Experience',
      description: 'Work history is the highest weighted evaluation section in ATS parsers.',
      impactPoints: 10,
    });
  }

  // Score Bullet Count
  if (allBullets.length >= 4) {
    experienceScore += 6;
  } else if (allBullets.length > 0) {
    experienceScore += 3;
    recommendations.push({
      id: 'exp-bullet-count',
      category: 'Work Experience',
      sectionKey: 'experience',
      severity: 'warning',
      title: 'Add More Detail to Experience Bullets',
      description: 'Aim for 3–5 accomplishment bullets per role detailing what you built, how you built it, and the business impact.',
      impactPoints: 3,
    });
  }

  // Score Action Verbs
  const strongVerbCount = detectedStrongVerbs.size;
  if (strongVerbCount >= 5) {
    experienceScore += 8;
  } else if (strongVerbCount >= 2) {
    experienceScore += 4;
    recommendations.push({
      id: 'exp-action-verbs',
      category: 'Work Experience',
      sectionKey: 'experience',
      severity: 'warning',
      title: 'Lead Bullets with Strong Action Verbs',
      description: `Detected ${strongVerbCount} strong action verbs. Use verbs like "Architected", "Engineered", "Optimized", "Scaled" to start each bullet.`,
      impactPoints: 4,
    });
  } else if (allBullets.length > 0) {
    recommendations.push({
      id: 'exp-action-verbs-few',
      category: 'Work Experience',
      sectionKey: 'experience',
      severity: 'critical',
      title: 'Transform Bullets with Power Action Verbs',
      description: 'Replace passive phrases with strong past-tense action verbs at the beginning of each accomplishment.',
      impactPoints: 8,
    });
  }

  // Score Quantifiable Metrics / Numbers
  const metricRatio = allBullets.length > 0 ? bulletsWithMetrics / allBullets.length : 0;
  if (metricRatio >= 0.4 && bulletsWithMetrics >= 2) {
    experienceScore += 10;
  } else if (bulletsWithMetrics >= 1) {
    experienceScore += 5;
    recommendations.push({
      id: 'exp-metrics-more',
      category: 'Work Experience',
      sectionKey: 'experience',
      severity: 'warning',
      title: 'Boost Measurable Metrics & KPIs',
      description: `Only ${bulletsWithMetrics} of ${allBullets.length} bullets include quantifiable results. Add percentages, dollar amounts, time saved, or scale numbers.`,
      impactPoints: 5,
    });
  } else if (allBullets.length > 0) {
    recommendations.push({
      id: 'exp-metrics-none',
      category: 'Work Experience',
      sectionKey: 'experience',
      severity: 'critical',
      title: 'Add Numbers & Quantifiable Outcomes',
      description: 'Top-tier ATS scores require measurable outcomes (e.g. "Reduced load times by 42%", "Scaled infrastructure to 1.5M DAU").',
      impactPoints: 10,
    });
  }

  // Weak phrase warning
  if (detectedWeakVerbs.size > 0) {
    recommendations.push({
      id: 'exp-weak-phrases',
      category: 'Work Experience',
      sectionKey: 'experience',
      severity: 'tip',
      title: `Eliminate Passive Phrasing: "${Array.from(detectedWeakVerbs).join('", "')}"`,
      description: 'Passive phrases weaken credibility. Reframe as direct accomplishments.',
      impactPoints: 2,
    });
  }

  const experienceCategory: ATSCategoryScore = {
    name: 'Work Experience & Impact',
    score: experienceScore,
    maxScore: 30,
    percentage: Math.round((experienceScore / 30) * 100),
    status: experienceScore >= 24 ? 'excellent' : experienceScore >= 16 ? 'good' : 'needs-work',
    details: `${experienceScore}/30 points. Action verb variety, bullet depth, and quantifiable business outcomes.`,
  };

  // ==========================================
  // 4. SKILLS SECTION (Max 20 pts)
  // ==========================================
  let skillsScore = 0;
  const skills = resume.skills || [];
  const skillCount = skills.length;

  if (skillCount >= 8 && skillCount <= 30) {
    skillsScore += 14;
  } else if (skillCount >= 4) {
    skillsScore += 8;
    recommendations.push({
      id: 'skills-add-more',
      category: 'Skills & Competencies',
      sectionKey: 'skills',
      severity: 'warning',
      title: 'Expand Skills List (Target 8–20 Skills)',
      description: `You currently have ${skillCount} skills. Add key technologies, frameworks, and tools to match ATS keyword queries.`,
      impactPoints: 6,
    });
  } else if (skillCount > 30) {
    skillsScore += 10;
    recommendations.push({
      id: 'skills-too-many',
      category: 'Skills & Competencies',
      sectionKey: 'skills',
      severity: 'tip',
      title: 'Curate Skills for High Relevance',
      description: 'You have over 30 skills. Group them into distinct categories or trim deprecated technologies to avoid keyword stuffing flags.',
      impactPoints: 4,
    });
  } else {
    recommendations.push({
      id: 'skills-missing',
      category: 'Skills & Competencies',
      sectionKey: 'skills',
      severity: 'critical',
      title: 'Add Skills Section',
      description: 'ATS parsers directly index dedicated skills sections for candidate keyword matching.',
      impactPoints: 14,
    });
  }

  // Check Category Organization
  const categorizedSkills = skills.filter((s) => s.category && s.category.trim() && s.category !== 'General');
  if (categorizedSkills.length >= 3) {
    skillsScore += 6;
  } else if (skillCount >= 6) {
    skillsScore += 3;
    recommendations.push({
      id: 'skills-categorize',
      category: 'Skills & Competencies',
      sectionKey: 'skills',
      severity: 'tip',
      title: 'Organize Skills into Categories',
      description: 'Group skills (e.g. "Languages", "Frameworks & Libraries", "Cloud & DevOps", "Tools") for faster human scan times.',
      impactPoints: 3,
    });
  }

  const skillsCategory: ATSCategoryScore = {
    name: 'Skills & Keywords',
    score: skillsScore,
    maxScore: 20,
    percentage: Math.round((skillsScore / 20) * 100),
    status: skillsScore >= 16 ? 'excellent' : skillsScore >= 10 ? 'good' : 'needs-work',
    details: `${skillsScore}/20 points. Targeted technical and domain competencies.`,
  };

  // ==========================================
  // 5. EDUCATION & CREDENTIALS (Max 15 pts)
  // ==========================================
  let educationScore = 0;
  const education = resume.education || [];

  if (education.length >= 1) {
    educationScore += 8;
    const edu = education[0];
    if (edu.degree && edu.degree.trim()) educationScore += 3;
    if (edu.institution && edu.institution.trim()) educationScore += 2;
    if (edu.startDate || edu.endDate) educationScore += 2;
  } else {
    recommendations.push({
      id: 'edu-missing',
      category: 'Education',
      sectionKey: 'education',
      severity: 'warning',
      title: 'Add Education Background',
      description: 'Most job applications filter for required educational degrees or equivalent training.',
      impactPoints: 10,
    });
  }

  const educationCategory: ATSCategoryScore = {
    name: 'Education & Credentials',
    score: educationScore,
    maxScore: 15,
    percentage: Math.round((educationScore / 15) * 100),
    status: educationScore >= 12 ? 'excellent' : educationScore >= 8 ? 'good' : 'needs-work',
    details: `${educationScore}/15 points. Degree, institution, and completion dates.`,
  };

  // ==========================================
  // 6. FORMATTING & HYGIENE (Max 10 pts)
  // ==========================================
  let formattingScore = 10;

  // Check section order hygiene
  const order = resume.settings?.sectionOrder || [];
  if (order.length >= 4) {
    const expIdx = order.indexOf('experience');
    const eduIdx = order.indexOf('education');
    if (expIdx !== -1 && eduIdx !== -1 && experiences.length > 2 && eduIdx < expIdx) {
      formattingScore -= 3;
      recommendations.push({
        id: 'order-experience-first',
        category: 'Document Structure',
        sectionKey: 'customization',
        severity: 'tip',
        title: 'Position Experience Above Education',
        description: 'For candidates with full-time professional experience, placing Experience before Education maximizes immediate ATS relevance.',
        impactPoints: 3,
      });
    }
  }

  const formattingCategory: ATSCategoryScore = {
    name: 'Structure & Hygiene',
    score: formattingScore,
    maxScore: 10,
    percentage: Math.round((formattingScore / 10) * 100),
    status: formattingScore >= 8 ? 'excellent' : 'good',
    details: `${formattingScore}/10 points. ATS semantic readability and visual section hierarchy.`,
  };

  // ==========================================
  // TOTAL SCORE COMPUTATION
  // ==========================================
  const totalScore = contactScore + summaryScore + experienceScore + skillsScore + educationScore + formattingScore;
  const overallScore = Math.min(100, Math.max(0, totalScore));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  let verdict = 'Needs Improvement';

  if (overallScore >= 92) {
    grade = 'A+';
    verdict = 'Elite ATS Optimization (Top 5% of resumes)';
  } else if (overallScore >= 82) {
    grade = 'A';
    verdict = 'Strong ATS Compatibility (Passes ~90% of enterprise filters)';
  } else if (overallScore >= 70) {
    grade = 'B';
    verdict = 'Good Foundation (A few optimizations will boost interview conversion)';
  } else if (overallScore >= 50) {
    grade = 'C';
    verdict = 'Moderate Risk (Key sections or metrics are missing)';
  } else {
    grade = 'D';
    verdict = 'High ATS Rejection Risk (Requires critical information)';
  }

  // Count total words in resume
  const allText = [
    resume.personal.fullName,
    resume.personal.title,
    resume.summary,
    ...experiences.map((e) => `${e.position} ${e.company} ${(e.bullets || []).join(' ')}`),
    ...education.map((e) => `${e.degree} ${e.institution} ${e.description || ''}`),
    ...skills.map((s) => s.name),
    ...(resume.projects || []).map((p) => `${p.name} ${p.description || ''} ${(p.bullets || []).join(' ')}`),
  ].join(' ');

  const totalWordCount = allText.split(/\s+/).filter(Boolean).length;

  return {
    overallScore,
    grade,
    verdict,
    categories: {
      contact: contactCategory,
      summary: summaryCategory,
      experience: experienceCategory,
      skills: skillsCategory,
      education: educationCategory,
      formatting: formattingCategory,
    },
    recommendations: recommendations.sort((a, b) => {
      const severityMap = { critical: 3, warning: 2, tip: 1 };
      return severityMap[b.severity] - severityMap[a.severity] || b.impactPoints - a.impactPoints;
    }),
    actionVerbs: {
      strongVerbsCount: detectedStrongVerbs.size,
      weakVerbsCount: detectedWeakVerbs.size,
      detectedStrongVerbs: Array.from(detectedStrongVerbs),
      detectedWeakVerbs: Array.from(detectedWeakVerbs),
    },
    metrics: {
      totalMetricsCount: bulletsWithMetrics,
      bulletsWithMetricsCount: bulletsWithMetrics,
      totalBulletsCount: allBullets.length,
      metricPercentage: allBullets.length > 0 ? Math.round((bulletsWithMetrics / allBullets.length) * 100) : 0,
    },
    totalWordCount,
  };
}
