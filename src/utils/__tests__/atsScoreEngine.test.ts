import { analyzeResumeATS, STRONG_ACTION_VERBS, WEAK_PASSIVE_PHRASES } from '../atsScoreEngine';
import { extractKeywordsFromJD, analyzeJobDescriptionMatch } from '../jdKeywordMatcher';
import { createSampleResume, createEmptyResume } from '../sampleData';

export async function runATSScoreEngineVerification(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];
  log.push('Starting ATS Scoring Engine & JD Matcher Verification...');

  try {
    // 1. High Score Check on Curated Sample Resume
    const sampleResume = createSampleResume();
    const sampleAnalysis = analyzeResumeATS(sampleResume);

    log.push(`Sample Resume ATS Score: ${sampleAnalysis.overallScore}% (Grade: ${sampleAnalysis.grade})`);
    if (sampleAnalysis.overallScore >= 80 && (sampleAnalysis.grade === 'A' || sampleAnalysis.grade === 'A+')) {
      log.push('✓ Test 1 Passed: Complete sample resume scored >= 80% (Grade A/A+).');
    } else {
      throw new Error(`Test 1 Failed: Expected >= 80%, got ${sampleAnalysis.overallScore}%`);
    }

    // 2. Empty Resume Failure Check
    const emptyResume = createEmptyResume('Blank Resume');
    const emptyAnalysis = analyzeResumeATS(emptyResume);

    log.push(`Empty Resume ATS Score: ${emptyAnalysis.overallScore}% (Grade: ${emptyAnalysis.grade})`);
    if (emptyAnalysis.overallScore < 30 && emptyAnalysis.grade === 'D') {
      log.push('✓ Test 2 Passed: Empty resume correctly flagged with low score (< 30%, Grade D).');
    } else {
      throw new Error(`Test 2 Failed: Empty resume scored unexpectedly high (${emptyAnalysis.overallScore}%)`);
    }

    // 3. Action Verb Detection Check
    if (sampleAnalysis.actionVerbs.strongVerbsCount >= 3) {
      log.push(`✓ Test 3 Passed: Detected ${sampleAnalysis.actionVerbs.strongVerbsCount} power action verbs (${sampleAnalysis.actionVerbs.detectedStrongVerbs.join(', ')}).`);
    } else {
      throw new Error('Test 3 Failed: Power action verbs not detected in sample resume.');
    }

    // 4. Metric & Quantifiable Outcome Detection Check
    if (sampleAnalysis.metrics.bulletsWithMetricsCount >= 2 && sampleAnalysis.metrics.metricPercentage >= 30) {
      log.push(`✓ Test 4 Passed: Detected ${sampleAnalysis.metrics.bulletsWithMetricsCount} bullets with measurable metrics (${sampleAnalysis.metrics.metricPercentage}% density).`);
    } else {
      throw new Error('Test 4 Failed: Metric detection failed on sample resume.');
    }

    // 5. Contact Completeness Sub-Score Check
    if (sampleAnalysis.categories.contact.score >= 12 && sampleAnalysis.categories.contact.maxScore === 15) {
      log.push(`✓ Test 5 Passed: Contact completeness sub-score accurate (${sampleAnalysis.categories.contact.score}/15 pts).`);
    } else {
      throw new Error(`Test 5 Failed: Contact score was ${sampleAnalysis.categories.contact.score}/15`);
    }

    // 6. Job Description Keyword Extraction Check
    const sampleJD = `
      Senior Full Stack Engineer
      We are looking for a Senior Engineer with deep expertise in TypeScript, React, Node.js, GraphQL, PostgreSQL, and AWS.
      Requirements:
      - 5+ years of experience with React, Next.js, and TypeScript.
      - Strong knowledge of Docker, Kubernetes, CI/CD, and Microservices.
      - Experience with Python, Django, and Machine Learning is a huge plus.
      - Excellent communication and agile leadership skills.
    `;

    const extracted = extractKeywordsFromJD(sampleJD);
    const extractedKeywords = extracted.map((e) => e.keyword);

    if (
      extractedKeywords.includes('typescript') &&
      extractedKeywords.includes('react') &&
      extractedKeywords.includes('node.js') &&
      extractedKeywords.includes('aws') &&
      extractedKeywords.includes('kubernetes')
    ) {
      log.push(`✓ Test 6 Passed: JD keyword extractor extracted key technologies (${extracted.length} terms found).`);
    } else {
      throw new Error(`Test 6 Failed: Critical keywords missing in extraction: ${extractedKeywords.join(', ')}`);
    }

    // 7. Resume vs Job Description Matching Check
    const matchResult = analyzeJobDescriptionMatch(sampleResume, sampleJD);
    log.push(`JD Match Score against Sample Resume: ${matchResult.matchScore}%`);
    log.push(`Matched (${matchResult.matchedCount}): ${matchResult.matchedKeywords.map((m) => m.keyword).join(', ')}`);
    log.push(`Missing (${matchResult.missingCount}): ${matchResult.missingKeywords.map((m) => m.keyword).join(', ')}`);

    if (matchResult.matchScore >= 40 && matchResult.matchedCount >= 4 && matchResult.missingCount >= 1) {
      log.push('✓ Test 7 Passed: JD match analysis accurately categorized matched and missing keywords.');
    } else {
      throw new Error(`Test 7 Failed: Match analysis unexpected (score: ${matchResult.matchScore}%, matched: ${matchResult.matchedCount}, missing: ${matchResult.missingCount})`);
    }

    log.push('ALL ATS SCORING ENGINE & JD MATCHER VERIFICATIONS PASSED 100%.');
    return { success: true, log };
  } catch (err: any) {
    log.push(`❌ Verification Error: ${err?.message || err}`);
    return { success: false, log };
  }
}
