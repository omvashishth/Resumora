import React from 'react';
import type { Resume } from '../types/resume';
import { registerPdfFonts } from './fontRegistry';

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

  const renderTemplate = () => {
    switch (resume.templateId) {
      case 'classic':
        return <PdfClassicTemplate resume={resume} />;
      case 'modern':
        return <PdfModernTemplate resume={resume} />;
      case 'minimal':
        return <PdfMinimalTemplate resume={resume} />;
      case 'professional':
        return <PdfProfessionalTemplate resume={resume} />;
      case 'student':
        return <PdfStudentTemplate resume={resume} />;
      case 'executive-photo':
        return <PdfExecutivePhotoTemplate resume={resume} />;
      case 'modern-sidebar-photo':
        return <PdfModernSidebarPhotoTemplate resume={resume} />;
      default:
        return <PdfModernTemplate resume={resume} />;
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
