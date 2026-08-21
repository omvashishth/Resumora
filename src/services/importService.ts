import { parseRawTextToResume, ImportParseResult } from './resumeParser';
import { createEmptyResume } from '../utils/sampleData';

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  // Lazy-load pdfjs-dist only when needed
  const pdfjsLib = await import('pdfjs-dist');
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
          .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
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
      message: 'File size is too large. Please upload a PDF or DOCX file under 15MB.',
    };
  }

  let extractedText = '';

  try {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      extractedText = await extractTextFromPdf(file);
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
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
        message: 'Unsupported file type. Please upload a PDF or DOCX document.',
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
