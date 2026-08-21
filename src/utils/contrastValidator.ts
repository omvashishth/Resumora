/**
 * Automated WCAG 2.2 Contrast Ratio Validator for Resumora Design System Tokens
 * Calculates relative luminance and contrast ratios between text and background colors.
 */

export interface ColorPairCheck {
  pairName: string;
  theme: 'light' | 'dark';
  textColor: string;
  backgroundColor: string;
  contrastRatio: number;
  minRequiredRatio: number;
  pass: boolean;
}

export function parseHexToRGB(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function calculateRelativeLuminance(r: number, g: number, b: number): number {
  const normalize = (val: number) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
}

export function calculateContrastRatio(color1Hex: string, color2Hex: string): number {
  const rgb1 = parseHexToRGB(color1Hex);
  const rgb2 = parseHexToRGB(color2Hex);

  const L1 = calculateRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const L2 = calculateRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function validateThemeTokens(): ColorPairCheck[] {
  const lightTokens = {
    background: '#F2EDE3',
    surface: '#E8E0D3',
    surfaceRaised: '#FAF7F2',
    textPrimary: '#171717',
    textSecondary: '#4A453E',
    textTertiary: '#6E675E',
    brand: '#263A35',
    accent: '#A65342',
    accentSecondary: '#3D555F',
    border: '#C9C0B3',
  };

  const darkTokens = {
    background: '#121619',
    surface: '#1A2024',
    surfaceRaised: '#242C32',
    textPrimary: '#F0EAE1',
    textSecondary: '#B0A79C',
    textTertiary: '#8C8479',
    brand: '#3E5C54',
    accent: '#C46855',
    accentSecondary: '#88A4B0',
    border: '#2E3840',
  };

  const checks: ColorPairCheck[] = [];

  // Evaluate Light Theme
  const evaluateLight = (name: string, text: string, bg: string, minRatio = 4.5) => {
    const ratio = calculateContrastRatio(text, bg);
    checks.push({
      pairName: name,
      theme: 'light',
      textColor: text,
      backgroundColor: bg,
      contrastRatio: ratio,
      minRequiredRatio: minRatio,
      pass: ratio >= minRatio,
    });
  };

  evaluateLight('textPrimary on background', lightTokens.textPrimary, lightTokens.background, 4.5);
  evaluateLight('textPrimary on surface', lightTokens.textPrimary, lightTokens.surface, 4.5);
  evaluateLight('textPrimary on surfaceRaised', lightTokens.textPrimary, lightTokens.surfaceRaised, 4.5);
  evaluateLight('textSecondary on background', lightTokens.textSecondary, lightTokens.background, 4.5);
  evaluateLight('textSecondary on surface', lightTokens.textSecondary, lightTokens.surface, 4.5);
  evaluateLight('textTertiary on surface', lightTokens.textTertiary, lightTokens.surface, 4.5);
  evaluateLight('textInverse on brand', '#F9F8F6', lightTokens.brand, 4.5);
  evaluateLight('textInverse on accent', '#F9F8F6', lightTokens.accent, 4.5);

  // Evaluate Dark Theme
  const evaluateDark = (name: string, text: string, bg: string, minRatio = 4.5) => {
    const ratio = calculateContrastRatio(text, bg);
    checks.push({
      pairName: name,
      theme: 'dark',
      textColor: text,
      backgroundColor: bg,
      contrastRatio: ratio,
      minRequiredRatio: minRatio,
      pass: ratio >= minRatio,
    });
  };

  evaluateDark('textPrimary on background', darkTokens.textPrimary, darkTokens.background, 4.5);
  evaluateDark('textPrimary on surface', darkTokens.textPrimary, darkTokens.surface, 4.5);
  evaluateDark('textPrimary on surfaceRaised', darkTokens.textPrimary, darkTokens.surfaceRaised, 4.5);
  evaluateDark('textSecondary on background', darkTokens.textSecondary, darkTokens.background, 4.5);
  evaluateDark('textSecondary on surface', darkTokens.textSecondary, darkTokens.surface, 4.5);
  evaluateDark('textTertiary on surface', darkTokens.textTertiary, darkTokens.surface, 4.5);
  evaluateDark('textInverse on brand', '#121619', '#4E7268', 4.5);
  evaluateDark('textInverse on accent', '#121619', darkTokens.accent, 4.5);

  return checks;
}
