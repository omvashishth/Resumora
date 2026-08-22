import React from 'react';
import type { Resume } from '../types/resume';
import { registerPdfFonts } from './fontRegistry';
import { normalizeAvatarForExport } from '../utils/imageExportHelper';

// Register local font assets (Inter, Roboto, Merriweather, Playfair Display, Outfit, Fira Code)
registerPdfFonts();

export const exportResumeToPdf = async (resume: Resume): Promise<Blob> => {
  const { Document, pdf } = await import('@react-pdf/renderer');
  const { PdfClassicTemplate } = await import('./pdfTemplates/PdfClassicTemplate');
  const { PdfModernTemplate } = await import('./pdfTemplates/PdfModernTemplate');
  const { PdfMinimalTemplate } = await import('./pdfTemplates/PdfMinimalTemplate');
  const { PdfProfessionalTemplate } = await import('./pdfTemplates/PdfProfessionalTemplate');
  const { PdfStudentTemplate } = await import('./pdfTemplates/PdfStudentTemplate');
  const { PdfExecutivePhotoTemplate } = await import('./pdfTemplates/PdfExecutivePhotoTemplate');
  const { PdfModernSidebarPhotoTemplate } = await import('./pdfTemplates/PdfModernSidebarPhotoTemplate');
  
  registerPdfFonts();

  // Normalize avatar to guarantee valid PNG format supported by @react-pdf/renderer
  const normalizedAvatar = await normalizeAvatarForExport(resume.personal?.avatarUrl);
  const normalizedResume: Resume = {
    ...resume,
    personal: {
      ...resume.personal,
      avatarUrl: normalizedAvatar,
    },
  };

  const renderTemplate = () => {
    switch (normalizedResume.templateId) {
      case 'classic':
        return <PdfClassicTemplate resume={normalizedResume} />;
      case 'modern':
        return <PdfModernTemplate resume={normalizedResume} />;
      case 'minimal':
        return <PdfMinimalTemplate resume={normalizedResume} />;
      case 'professional':
        return <PdfProfessionalTemplate resume={normalizedResume} />;
      case 'student':
        return <PdfStudentTemplate resume={normalizedResume} />;
      case 'executive-photo':
        return <PdfExecutivePhotoTemplate resume={normalizedResume} />;
      case 'modern-sidebar-photo':
        return <PdfModernSidebarPhotoTemplate resume={normalizedResume} />;
      default:
        return <PdfModernTemplate resume={normalizedResume} />;
    }
  };

  const doc = (
    <Document
      title={`${resume.personal.fullName || 'Resume'} - ${resume.title}`}
      author={resume.personal.fullName}
      subject="Professional Resume"
    >
      {renderTemplate()}
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  return blob;
};
