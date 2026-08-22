import { Font } from '@react-pdf/renderer';

let registered = false;

export const registerPdfFonts = () => {
  if (registered) return;

  // Resolve font path depending on browser vs server/test environment
  const getFontUrl = (filename: string): string => {
    if (typeof window !== 'undefined') {
      return `/fonts/${filename}`;
    }
    // In Node test environments, resolve CDN or relative path
    if (typeof process !== 'undefined' && process.cwd) {
      try {
        const nodePath = 'path';
        const p = require(nodePath);
        return p.resolve(process.cwd(), 'public/fonts', filename);
      } catch {
        return `https://cdn.jsdelivr.net/gh/omvashishth/Resumora@main/public/fonts/${filename}`;
      }
    }
    return `/fonts/${filename}`;
  };

  try {
    Font.register({
      family: 'Inter',
      fonts: [
        { src: getFontUrl('Inter-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('Inter-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
        { src: getFontUrl('Inter-Medium.ttf'), fontWeight: 500 },
        { src: getFontUrl('Inter-SemiBold.ttf'), fontWeight: 600 },
        { src: getFontUrl('Inter-Bold.ttf'), fontWeight: 700 },
      ],
    });

    Font.register({
      family: 'Roboto',
      fonts: [
        { src: getFontUrl('Roboto-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('Roboto-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
        { src: getFontUrl('Roboto-Bold.ttf'), fontWeight: 700 },
      ],
    });

    Font.register({
      family: 'Merriweather',
      fonts: [
        { src: getFontUrl('Merriweather-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('Merriweather-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
        { src: getFontUrl('Merriweather-Bold.ttf'), fontWeight: 700 },
      ],
    });

    Font.register({
      family: 'Playfair Display',
      fonts: [
        { src: getFontUrl('PlayfairDisplay-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('PlayfairDisplay-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
        { src: getFontUrl('PlayfairDisplay-Bold.ttf'), fontWeight: 700 },
      ],
    });

    Font.register({
      family: 'Outfit',
      fonts: [
        { src: getFontUrl('Outfit-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('Outfit-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
        { src: getFontUrl('Outfit-Bold.ttf'), fontWeight: 700 },
      ],
    });

    Font.register({
      family: 'Fira Code',
      fonts: [
        { src: getFontUrl('FiraCode-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('FiraCode-Regular.ttf'), fontWeight: 400, fontStyle: 'italic' },
      ],
    });

    // Disable hyphenation so PDF text doesn't break words unexpectedly
    Font.registerHyphenationCallback((word) => [word]);

    registered = true;
  } catch (err) {
    console.error('Error registering PDF fonts:', err);
  }
};
