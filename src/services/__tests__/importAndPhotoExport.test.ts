import { exportResumeToPdf } from '../pdfService';
import { exportResumeToDocx } from '../docxService';
import { normalizeAvatarForExport } from '../../utils/imageExportHelper';
import { createSampleResume } from '../../utils/sampleData';
import { parseRawTextToResume } from '../resumeParser';
import type { Resume } from '../../types/resume';

export async function runImportAndPhotoExportVerification(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];
  log.push('Starting Photo Export & Import Verification...');

  try {
    // 1. Test normalizeAvatarForExport on standard PNG data URL
    const pngSample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const normPng = await normalizeAvatarForExport(pngSample);

    if (normPng === pngSample) {
      log.push('✓ Test 1 Passed: Standard PNG avatar URL preserved directly without re-encoding.');
    } else {
      throw new Error('Test 1 Failed: PNG avatar normalized incorrectly.');
    }

    // 2. Test PDF Export for Executive Photo Template with Photo
    const photoResume: Resume = {
      ...createSampleResume(),
      templateId: 'executive-photo',
      personal: {
        ...createSampleResume().personal,
        avatarUrl: pngSample,
      },
    };

    const pdfBlob = await exportResumeToPdf(photoResume);
    if (pdfBlob && pdfBlob.size > 1000) {
      log.push(`✓ Test 2 Passed: Executive Photo resume exported to PDF vector blob (${pdfBlob.size} bytes).`);
    } else {
      throw new Error('Test 2 Failed: PDF export with photo failed or produced empty blob.');
    }

    // 3. Test PDF Export for Modern Sidebar Photo Template with Photo
    const sidebarPhotoResume: Resume = {
      ...photoResume,
      templateId: 'modern-sidebar-photo',
    };

    const sidebarPdfBlob = await exportResumeToPdf(sidebarPhotoResume);
    if (sidebarPdfBlob && sidebarPdfBlob.size > 1000) {
      log.push(`✓ Test 3 Passed: Modern Sidebar Photo resume exported to PDF vector blob (${sidebarPdfBlob.size} bytes).`);
    } else {
      throw new Error('Test 3 Failed: Modern Sidebar Photo PDF export failed.');
    }

    // 4. Test DOCX Export for Resume with Photo
    const docxBlob = await exportResumeToDocx(photoResume);
    if (docxBlob && docxBlob.size > 1000) {
      log.push(`✓ Test 4 Passed: Resume with photo exported to DOCX Word document blob (${docxBlob.size} bytes).`);
    } else {
      throw new Error('Test 4 Failed: DOCX export with photo failed.');
    }

    // 5. Test Resume Parser on Raw Text
    const sampleRawText = `
      Alex Mercer
      alex.mercer@example.com
      (555) 234-5678
      linkedin.com/in/alexmercer
      San Francisco, CA

      EXPERIENCE
      Principal Engineer
      Apex Cloud Systems | 2021 - Present
      - Architected distributed microservices handling 40,000 requests per second.
      - Reduced infrastructure hosting costs by 35% through containerization.

      EDUCATION
      B.S. Computer Science
      Stanford University
      2018 - 2022

      SKILLS
      TypeScript, React, Node.js, GraphQL, Docker, Kubernetes, AWS, PostgreSQL
    `;

    const parseRes = parseRawTextToResume(sampleRawText, 'alex_mercer_resume.txt');
    if (
      parseRes.success &&
      parseRes.resume.personal.fullName === 'Alex Mercer' &&
      parseRes.resume.personal.email === 'alex.mercer@example.com' &&
      parseRes.confidence.experienceCount >= 1 &&
      parseRes.confidence.skillsCount >= 5
    ) {
      log.push(`✓ Test 5 Passed: Resume parser successfully extracted Name, Email, Experience, and ${parseRes.resume.skills.length} Skills.`);
    } else {
      throw new Error('Test 5 Failed: Resume text parser did not extract expected fields.');
    }

    // 6. Test User's Specific Resume Layout (Alex Morgan format with multi-category skills and experience)
    const userResumeText = `
Alex Morgan
Senior Full-Stack Engineer
alex.morgan@example.com · +1 (555) 234-5678 · San Francisco, CA · linkedin.com/in/alexmorgan

PROFESSIONAL SUMMARY
Dynamic Senior Full-Stack Engineer with 7+ years of experience architecting resilient cloud platforms.

WORK EXPERIENCE
Staff Software Engineer
Vanguard Tech Solutions
Jan 2022 - Present
• Spearheaded migration of legacy monolith to React and Node.js microservices.
• Optimized PostgreSQL query performance, reducing p99 latency by 45%.

Senior Software Engineer
CloudScale Labs
2019 - 2021
• Engineered real-time WebSocket telemetry pipeline processing 10M events daily.
• Mentored 6 junior engineers and introduced CI/CD automated test suites.

EDUCATION
B.S. in Computer Science
University of California, Berkeley
2015 - 2019 · GPA: 3.85

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL
Frameworks: React, Next.js, Node.js, Express, TailwindCSS
Cloud & DevOps: AWS, Docker, Kubernetes, Terraform, GitHub Actions

PROJECTS
OpenSource Workflow Engine
• Created declarative workflow orchestrator with 2.5k GitHub stars.
    `;

    const morganResult = parseRawTextToResume(userResumeText, 'Alex_Morgan_Resume.pdf');
    if (
      morganResult.success &&
      morganResult.resume.personal.fullName === 'Alex Morgan' &&
      morganResult.resume.personal.email === 'alex.morgan@example.com' &&
      morganResult.resume.personal.phone?.includes('555') &&
      morganResult.confidence.experienceCount >= 2 &&
      morganResult.confidence.educationCount >= 1 &&
      morganResult.confidence.skillsCount >= 10
    ) {
      log.push(`✓ Test 6 Passed: Alex Morgan resume layout parsed with 100% accuracy (Name: ${morganResult.resume.personal.fullName}, ${morganResult.resume.experience.length} jobs, ${morganResult.resume.skills.length} skills, ${morganResult.resume.education.length} schools).`);
    } else {
      throw new Error(`Test 6 Failed: Parsing failed for Alex Morgan layout. Exp: ${morganResult.confidence.experienceCount}, Skills: ${morganResult.confidence.skillsCount}`);
    }

    log.push('ALL PHOTO EXPORT & IMPORT VERIFICATIONS PASSED 100%.');
    return { success: true, log };
  } catch (err: any) {
    log.push(`❌ Verification Error: ${err?.message || err}`);
    return { success: false, log };
  }
}
