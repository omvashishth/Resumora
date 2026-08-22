import type { Resume } from '../types/resume';

export interface KeywordMatchItem {
  keyword: string;
  category: 'Technical' | 'Framework/Library' | 'Tool/Platform' | 'Methodology' | 'Soft Skill' | 'General';
  importance: 'High' | 'Medium' | 'Low';
  occurrencesInJob: number;
  matchedInResume: boolean;
  matchedLocations: string[]; // e.g. ['Skills', 'Experience: Senior Engineer', 'Summary']
}

export interface JDMatchAnalysisResult {
  matchScore: number; // 0 - 100
  totalExtractedKeywords: number;
  matchedCount: number;
  missingCount: number;
  matchedKeywords: KeywordMatchItem[];
  missingKeywords: KeywordMatchItem[];
  jobTitleDetected?: string;
  topMissingSkills: string[];
}

// Common English & recruiter boilerplate stop words to filter out
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both',
  'but', 'by', 'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does',
  'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s',
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its',
  'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of',
  'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so',
  'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s',
  'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve',
  'your', 'yours', 'yourself', 'yourselves', 'job', 'description', 'requirements', 'responsibilities',
  'role', 'candidate', 'experience', 'work', 'years', 'team', 'opportunity', 'company',
  'working', 'ability', 'looking', 'skills', 'plus', 'preferred', 'must', 'have', 'ideal',
  'equal', 'employment', 'gender', 'race', 'religion', 'salary', 'benefits', 'apply', 'joining'
]);

// Well-known curated tech stacks, frameworks, tools & competencies dictionary
const TECH_SKILL_DICTIONARY: Record<string, { category: KeywordMatchItem['category']; importance: KeywordMatchItem['importance'] }> = {
  // Languages
  'typescript': { category: 'Technical', importance: 'High' },
  'javascript': { category: 'Technical', importance: 'High' },
  'python': { category: 'Technical', importance: 'High' },
  'java': { category: 'Technical', importance: 'High' },
  'golang': { category: 'Technical', importance: 'High' },
  'go': { category: 'Technical', importance: 'High' },
  'rust': { category: 'Technical', importance: 'High' },
  'c++': { category: 'Technical', importance: 'High' },
  'c#': { category: 'Technical', importance: 'High' },
  'ruby': { category: 'Technical', importance: 'Medium' },
  'php': { category: 'Technical', importance: 'Medium' },
  'swift': { category: 'Technical', importance: 'High' },
  'kotlin': { category: 'Technical', importance: 'High' },
  'sql': { category: 'Technical', importance: 'High' },
  'html': { category: 'Technical', importance: 'Medium' },
  'html5': { category: 'Technical', importance: 'Medium' },
  'css': { category: 'Technical', importance: 'Medium' },
  'css3': { category: 'Technical', importance: 'Medium' },
  'r': { category: 'Technical', importance: 'Medium' },
  'scala': { category: 'Technical', importance: 'Medium' },

  // Frameworks & Libraries
  'react': { category: 'Framework/Library', importance: 'High' },
  'react.js': { category: 'Framework/Library', importance: 'High' },
  'react native': { category: 'Framework/Library', importance: 'High' },
  'next.js': { category: 'Framework/Library', importance: 'High' },
  'nextjs': { category: 'Framework/Library', importance: 'High' },
  'vue': { category: 'Framework/Library', importance: 'High' },
  'vue.js': { category: 'Framework/Library', importance: 'High' },
  'angular': { category: 'Framework/Library', importance: 'High' },
  'node': { category: 'Framework/Library', importance: 'High' },
  'node.js': { category: 'Framework/Library', importance: 'High' },
  'nodejs': { category: 'Framework/Library', importance: 'High' },
  'express': { category: 'Framework/Library', importance: 'Medium' },
  'express.js': { category: 'Framework/Library', importance: 'Medium' },
  'nest.js': { category: 'Framework/Library', importance: 'High' },
  'django': { category: 'Framework/Library', importance: 'High' },
  'fastapi': { category: 'Framework/Library', importance: 'High' },
  'flask': { category: 'Framework/Library', importance: 'Medium' },
  'spring boot': { category: 'Framework/Library', importance: 'High' },
  'spring': { category: 'Framework/Library', importance: 'High' },
  '.net': { category: 'Framework/Library', importance: 'High' },
  'tailwind': { category: 'Framework/Library', importance: 'Medium' },
  'tailwindcss': { category: 'Framework/Library', importance: 'Medium' },
  'graphql': { category: 'Framework/Library', importance: 'High' },
  'redux': { category: 'Framework/Library', importance: 'Medium' },
  'zustand': { category: 'Framework/Library', importance: 'Medium' },

  // Cloud, DevOps & Databases
  'aws': { category: 'Tool/Platform', importance: 'High' },
  'amazon web services': { category: 'Tool/Platform', importance: 'High' },
  'azure': { category: 'Tool/Platform', importance: 'High' },
  'gcp': { category: 'Tool/Platform', importance: 'High' },
  'google cloud': { category: 'Tool/Platform', importance: 'High' },
  'docker': { category: 'Tool/Platform', importance: 'High' },
  'kubernetes': { category: 'Tool/Platform', importance: 'High' },
  'k8s': { category: 'Tool/Platform', importance: 'High' },
  'terraform': { category: 'Tool/Platform', importance: 'High' },
  'ci/cd': { category: 'Methodology', importance: 'High' },
  'github actions': { category: 'Tool/Platform', importance: 'Medium' },
  'postgresql': { category: 'Tool/Platform', importance: 'High' },
  'postgres': { category: 'Tool/Platform', importance: 'High' },
  'mongodb': { category: 'Tool/Platform', importance: 'High' },
  'mysql': { category: 'Tool/Platform', importance: 'Medium' },
  'redis': { category: 'Tool/Platform', importance: 'High' },
  'elasticsearch': { category: 'Tool/Platform', importance: 'Medium' },
  'supabase': { category: 'Tool/Platform', importance: 'Medium' },
  'firebase': { category: 'Tool/Platform', importance: 'Medium' },
  'kafka': { category: 'Tool/Platform', importance: 'High' },
  'rabbitmq': { category: 'Tool/Platform', importance: 'Medium' },
  'microservices': { category: 'Methodology', importance: 'High' },
  'rest api': { category: 'Methodology', importance: 'High' },
  'restful': { category: 'Methodology', importance: 'Medium' },

  // AI & Data
  'machine learning': { category: 'Technical', importance: 'High' },
  'deep learning': { category: 'Technical', importance: 'High' },
  'llm': { category: 'Technical', importance: 'High' },
  'generative ai': { category: 'Technical', importance: 'High' },
  'pytorch': { category: 'Framework/Library', importance: 'High' },
  'tensorflow': { category: 'Framework/Library', importance: 'High' },
  'langchain': { category: 'Framework/Library', importance: 'High' },
  'nlp': { category: 'Technical', importance: 'High' },
  'pandas': { category: 'Framework/Library', importance: 'Medium' },
  'numpy': { category: 'Framework/Library', importance: 'Medium' },

  // Methodologies & Practices
  'agile': { category: 'Methodology', importance: 'Medium' },
  'scrum': { category: 'Methodology', importance: 'Medium' },
  'tdd': { category: 'Methodology', importance: 'Medium' },
  'unit testing': { category: 'Methodology', importance: 'Medium' },
  'system design': { category: 'Methodology', importance: 'High' },
  'performance optimization': { category: 'Methodology', importance: 'High' },
  'security': { category: 'Methodology', importance: 'High' },
  'cross-functional': { category: 'Soft Skill', importance: 'Medium' },
  'mentorship': { category: 'Soft Skill', importance: 'Medium' },
  'leadership': { category: 'Soft Skill', importance: 'High' },
  'communication': { category: 'Soft Skill', importance: 'Low' },
  'problem solving': { category: 'Soft Skill', importance: 'Low' },
};

/**
 * Extracts and normalizes keywords from a Job Description text
 */
export function extractKeywordsFromJD(jdText: string): { keyword: string; occurrences: number }[] {
  const cleanJD = jdText.toLowerCase();
  const keywordCounts = new Map<string, number>();

  // 1. Scan for multi-word and single-word dictionary terms first
  Object.keys(TECH_SKILL_DICTIONARY).forEach((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = cleanJD.match(regex);
    if (matches && matches.length > 0) {
      keywordCounts.set(term, matches.length);
    }
  });

  // 2. Scan for capitalized technical words / acronyms in original text
  const tokens = jdText.split(/[\s,;()\/\-\n\t]+/).map((t) => t.trim().replace(/^[^a-zA-Z0-9+#.]+|[^a-zA-Z0-9+#.]+$/g, ''));

  tokens.forEach((token) => {
    const lower = token.toLowerCase();
    if (lower.length >= 2 && !STOP_WORDS.has(lower) && !keywordCounts.has(lower)) {
      // Check if it's an acronym like CI/CD, AWS, SEO, CRM or capitalized tech
      if ((/^[A-Z]{2,6}$/.test(token) || /^[A-Z][a-z0-9]+[A-Z]/.test(token)) && !STOP_WORDS.has(lower)) {
        keywordCounts.set(lower, (keywordCounts.get(lower) || 0) + 1);
      }
    }
  });

  return Array.from(keywordCounts.entries())
    .map(([keyword, occurrences]) => ({ keyword, occurrences }))
    .sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Checks if a keyword exists in the Resume and tracks where it was found
 */
function searchResumeForKeyword(resume: Resume, keyword: string): { matched: boolean; locations: string[] } {
  const target = keyword.toLowerCase();
  const locations: string[] = [];

  const escapeReg = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reg = new RegExp(`\\b${escapeReg}\\b`, 'i');

  // Check Skills
  const hasInSkills = (resume.skills || []).some((s) => s.name.toLowerCase() === target || reg.test(s.name));
  if (hasInSkills) locations.push('Skills');

  // Check Summary
  if (resume.summary && reg.test(resume.summary)) {
    locations.push('Summary');
  }

  // Check Experience
  (resume.experience || []).forEach((exp) => {
    const inTitle = reg.test(exp.position);
    const inBullets = (exp.bullets || []).some((b) => reg.test(b));
    if (inTitle || inBullets) {
      locations.push(`Experience: ${exp.company || exp.position || 'Role'}`);
    }
  });

  // Check Projects
  (resume.projects || []).forEach((proj) => {
    const inTech = (proj.technologies || []).some((t) => reg.test(t));
    const inDesc = reg.test(proj.description || '');
    const inBullets = (proj.bullets || []).some((b) => reg.test(b));
    if (inTech || inDesc || inBullets) {
      locations.push(`Project: ${proj.name || 'Project'}`);
    }
  });

  // Check Education & Certs
  (resume.certifications || []).forEach((c) => {
    if (reg.test(c.name)) locations.push(`Cert: ${c.name}`);
  });

  return {
    matched: locations.length > 0,
    locations,
  };
}

/**
 * Main Analysis Function: Compares a Job Description against a Resume
 */
export function analyzeJobDescriptionMatch(resume: Resume, jdText: string): JDMatchAnalysisResult {
  if (!jdText || jdText.trim().length < 20) {
    return {
      matchScore: 0,
      totalExtractedKeywords: 0,
      matchedCount: 0,
      missingCount: 0,
      matchedKeywords: [],
      missingKeywords: [],
      topMissingSkills: [],
    };
  }

  const extracted = extractKeywordsFromJD(jdText);
  const matchedKeywords: KeywordMatchItem[] = [];
  const missingKeywords: KeywordMatchItem[] = [];

  let weightedTotalPoints = 0;
  let weightedEarnedPoints = 0;

  extracted.forEach(({ keyword, occurrences }) => {
    const meta = TECH_SKILL_DICTIONARY[keyword] || { category: 'General', importance: 'Medium' };
    const { matched, locations } = searchResumeForKeyword(resume, keyword);

    const item: KeywordMatchItem = {
      keyword,
      category: meta.category,
      importance: meta.importance,
      occurrencesInJob: occurrences,
      matchedInResume: matched,
      matchedLocations: locations,
    };

    const weight = meta.importance === 'High' ? 3 : meta.importance === 'Medium' ? 2 : 1;
    weightedTotalPoints += weight;

    if (matched) {
      weightedEarnedPoints += weight;
      matchedKeywords.push(item);
    } else {
      missingKeywords.push(item);
    }
  });

  const matchScore = weightedTotalPoints > 0 ? Math.round((weightedEarnedPoints / weightedTotalPoints) * 100) : 0;

  // Extract candidate job title from first few lines of JD if detected
  const firstLines = jdText.split('\n').slice(0, 3).map((l) => l.trim()).filter(Boolean);
  const jobTitleCandidate = firstLines.find((l) => l.length < 50 && (l.toLowerCase().includes('engineer') || l.toLowerCase().includes('developer') || l.toLowerCase().includes('manager') || l.toLowerCase().includes('designer') || l.toLowerCase().includes('lead')));

  const topMissingSkills = missingKeywords
    .filter((m) => m.importance === 'High' || m.importance === 'Medium')
    .slice(0, 8)
    .map((m) => m.keyword);

  return {
    matchScore,
    totalExtractedKeywords: extracted.length,
    matchedCount: matchedKeywords.length,
    missingCount: missingKeywords.length,
    matchedKeywords: matchedKeywords.sort((a, b) => b.occurrencesInJob - a.occurrencesInJob),
    missingKeywords: missingKeywords.sort((a, b) => {
      const impMap = { High: 3, Medium: 2, Low: 1 };
      return impMap[b.importance] - impMap[a.importance] || b.occurrencesInJob - a.occurrencesInJob;
    }),
    jobTitleDetected: jobTitleCandidate,
    topMissingSkills,
  };
}
