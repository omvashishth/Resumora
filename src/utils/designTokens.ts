import type { ResumeSettings, TemplateId } from '../types/resume';

export interface DesignTokens {
  fontFamily: string;
  pdfFontFamily: string;
  fontSizePt: number;
  nameFontSizePt: number;
  titleFontSizePt: number;
  headingFontSizePt: number;
  contactFontSizePt: number;
  smallFontSizePt: number;
  lineHeight: number;
  sectionSpacingPt: number;
  marginMm: number;
  marginPt: number;
  accentColor: string;
  textColor: string;
  headingColor: string;
}

export const getDesignTokens = (settings: ResumeSettings, templateId?: TemplateId): DesignTokens => {
  const fontSize = settings.fontSize || 10;
  const headingSize = settings.headingSize || 1.35;
  const accentColor = settings.accentColor || (templateId === 'student' ? '#0284c7' : '#2563eb');
  const textColor = settings.textColor || '#1e293b';
  const margins = settings.margins ?? 15;
  const lineSpacing = settings.lineSpacing || 1.35;
  const sectionSpacing = settings.sectionSpacing || 16;

  let defaultFont = 'Inter';
  if (templateId === 'classic') defaultFont = 'Merriweather';
  else if (templateId === 'professional') defaultFont = 'Roboto';
  else if (templateId === 'student') defaultFont = 'Outfit';

  const fontFamily = settings.fontFamily || defaultFont;

  // Map font names to registered PDF font family names
  let pdfFontFamily = 'Inter';
  if (fontFamily.toLowerCase().includes('roboto')) pdfFontFamily = 'Roboto';
  else if (fontFamily.toLowerCase().includes('merriweather')) pdfFontFamily = 'Merriweather';
  else if (fontFamily.toLowerCase().includes('playfair')) pdfFontFamily = 'Playfair Display';
  else if (fontFamily.toLowerCase().includes('outfit')) pdfFontFamily = 'Outfit';
  else if (fontFamily.toLowerCase().includes('fira')) pdfFontFamily = 'Fira Code';

  return {
    fontFamily: `'${fontFamily}', sans-serif`,
    pdfFontFamily,
    fontSizePt: fontSize,
    nameFontSizePt: fontSize * 2.1,
    titleFontSizePt: fontSize * 1.1,
    headingFontSizePt: Number((fontSize * headingSize).toFixed(1)),
    contactFontSizePt: Math.max(8.5, fontSize * 0.88),
    smallFontSizePt: Math.max(8, fontSize * 0.85),
    lineHeight: lineSpacing,
    sectionSpacingPt: sectionSpacing,
    marginMm: margins,
    marginPt: margins * 2.83465, // 1mm = 2.83465 pt
    accentColor,
    textColor,
    headingColor: accentColor,
  };
};
