import { parseRawTextToResume, ImportParseResult } from './resumeParser';
import { createEmptyResume } from '../utils/sampleData';

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  // Lazy-load pdfjs-dist only when needed
  const pdfjsLib = await import('pdfjs-dist');

  // Configure workerSrc to ensure compatibility in both Vite dev and production
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
    } catch {
      // Fallback
    }
  }

  const pdfDoc = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: false,
    useSystemFonts: true,
  }).promise;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    interface PosItem {
      str: string;
      x: number;
      y: number;
    }

    const items: PosItem[] = [];
    for (const rawItem of textContent.items as any[]) {
      if (!rawItem || !rawItem.str || !rawItem.str.trim()) continue;
      const x = rawItem.transform ? rawItem.transform[4] : 0;
      const y = rawItem.transform ? Math.round(rawItem.transform[5]) : 0;
      items.push({ str: rawItem.str, x, y });
    }

    // Cluster items into lines within 4pt vertical tolerance
    const lineBuckets: { y: number; items: PosItem[] }[] = [];
    for (const item of items) {
      let bucket = lineBuckets.find((b) => Math.abs(b.y - item.y) <= 4);
      if (!bucket) {
        bucket = { y: item.y, items: [] };
        lineBuckets.push(bucket);
      }
      bucket.items.push(item);
    }

    // Sort lines from top of page to bottom (higher Y in PDF is higher on page)
    lineBuckets.sort((a, b) => b.y - a.y);

    const pageLines: string[] = [];
    for (const bucket of lineBuckets) {
      // Sort words left to right
      bucket.items.sort((a, b) => a.x - b.x);
      const lineStr = bucket.items.map((it) => it.str.trim()).filter(Boolean).join(' ');
      if (lineStr) {
        pageLines.push(lineStr);
      }
    }

    pageTexts.push(pageLines.join('\n'));
  }

  return pageTexts.join('\n\n').trim();
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  // Lazy-load mammoth only when needed
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
};

export const importResumeFile = async (file: File): Promise<ImportParseResult> => {
  // Validate File Size (Limit: 15MB)
  if (file.size > 15 * 1024 * 1024) {
    return {
      success: false,
      resume: createEmptyResume(file.name),
      rawText: '',
      confidence: {
        fullName: 'Low',
        email: 'Low',
        phone: 'Low',
        experienceCount: 0,
        educationCount: 0,
        skillsCount: 0,
        projectsCount: 0,
      },
      warnings: [{ field: 'File Size', message: 'File size exceeds 15MB limit.', severity: 'warning' }],
      message: 'File size is too large. Please upload a PDF, DOCX, or JSON file under 15MB.',
    };
  }

  const fileNameLower = file.name.toLowerCase();

  // 1. JSON Resume Import
  if (file.type === 'application/json' || fileNameLower.endsWith('.json')) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (json && (json.personal || json.experience || json.title || json.skills)) {
        const resume = {
          ...createEmptyResume(file.name.replace(/\.json$/i, '')),
          ...json,
          id: crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
        };
        return {
          success: true,
          resume,
          rawText: text,
          confidence: {
            fullName: 'High',
            email: 'High',
            phone: 'High',
            experienceCount: (resume.experience || []).length,
            educationCount: (resume.education || []).length,
            skillsCount: (resume.skills || []).length,
            projectsCount: (resume.projects || []).length,
          },
          warnings: [],
          message: `Successfully imported structured resume from ${file.name}.`,
        };
      }
    } catch (jsonErr: any) {
      return {
        success: false,
        resume: createEmptyResume(file.name),
        rawText: '',
        confidence: {
          fullName: 'Low',
          email: 'Low',
          phone: 'Low',
          experienceCount: 0,
          educationCount: 0,
          skillsCount: 0,
          projectsCount: 0,
        },
        warnings: [{ field: 'JSON Format', message: jsonErr?.message || 'Invalid JSON syntax.', severity: 'warning' }],
        message: 'Could not parse JSON resume file. Please verify file integrity.',
      };
    }
  }

  let extractedText = '';

  try {
    if (file.type === 'application/pdf' || fileNameLower.endsWith('.pdf')) {
      extractedText = await extractTextFromPdf(file);
    } else if (
      file.type.includes('wordprocessingml') ||
      file.type.includes('msword') ||
      fileNameLower.endsWith('.docx')
    ) {
      extractedText = await extractTextFromDocx(file);
    } else {
      return {
        success: false,
        resume: createEmptyResume(file.name),
        rawText: '',
        confidence: {
          fullName: 'Low',
          email: 'Low',
          phone: 'Low',
          experienceCount: 0,
          educationCount: 0,
          skillsCount: 0,
          projectsCount: 0,
        },
        warnings: [{ field: 'File Format', message: 'Unsupported file extension.', severity: 'warning' }],
        message: 'Unsupported file type. Please upload a PDF, DOCX, or JSON document.',
      };
    }

    return parseRawTextToResume(extractedText, file.name);
  } catch (error: any) {
    console.error('File import error:', error);
    return {
      success: false,
      resume: createEmptyResume(file.name),
      rawText: '',
      confidence: {
        fullName: 'Low',
        email: 'Low',
        phone: 'Low',
        experienceCount: 0,
        educationCount: 0,
        skillsCount: 0,
        projectsCount: 0,
      },
      warnings: [{ field: 'Parsing Error', message: error?.message || 'Corrupted file content.', severity: 'warning' }],
      message: `Failed to extract file text: ${error?.message || 'The document appears to be corrupted or password protected.'}`,
    };
  }
};
