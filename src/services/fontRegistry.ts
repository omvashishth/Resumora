import { Font } from '@react-pdf/renderer';

let registered = false;

export const registerPdfFonts = () => {
  if (registered) return;

  // Resolve font path depending on browser vs server environment
  const getFontUrl = (filename: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/fonts/${filename}`;
    }
    return `/fonts/${filename}`;
  };

  try {
    Font.register({
      family: 'Inter',
      fonts: [
        { src: getFontUrl('Inter-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('Inter-Medium.ttf'), fontWeight: 500 },
        { src: getFontUrl('Inter-SemiBold.ttf'), fontWeight: 600 },
        { src: getFontUrl('Inter-Bold.ttf'), fontWeight: 700 },
      ],
    });

    Font.register({
      family: 'Roboto',
      fonts: [
        { src: getFontUrl('Roboto-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('Roboto-Bold.ttf'), fontWeight: 700 },
      ],
    });

    Font.register({
      family: 'Merriweather',
      fonts: [
        { src: getFontUrl('Merriweather-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('Merriweather-Bold.ttf'), fontWeight: 700 },
      ],
    });

    Font.register({
      family: 'Playfair Display',
      fonts: [
        { src: getFontUrl('PlayfairDisplay-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('PlayfairDisplay-Bold.ttf'), fontWeight: 700 },
      ],
    });

    Font.register({
      family: 'Outfit',
      fonts: [
        { src: getFontUrl('Outfit-Regular.ttf'), fontWeight: 400 },
        { src: getFontUrl('Outfit-Bold.ttf'), fontWeight: 700 },
      ],
    });

    Font.register({
      family: 'Fira Code',
      fonts: [
        { src: getFontUrl('FiraCode-Regular.ttf'), fontWeight: 400 },
      ],
    });

    // Disable hyphenation so PDF text doesn't break words unexpectedly
    Font.registerHyphenationCallback((word) => [word]);

    registered = true;
  } catch (err) {
    console.error('Error registering PDF fonts:', err);
  }
};
