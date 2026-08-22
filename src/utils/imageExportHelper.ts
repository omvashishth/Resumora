/**
 * Image Normalizer for PDF and DOCX Exporters
 * @react-pdf/renderer and docx only support JPEG and PNG binary formats.
 * This utility converts WebP or external data URLs into pristine PNG data URLs.
 */

export async function normalizeAvatarForExport(avatarUrl?: string): Promise<string | undefined> {
  if (!avatarUrl || typeof avatarUrl !== 'string' || !avatarUrl.trim()) {
    return undefined;
  }

  const trimmed = avatarUrl.trim();

  // If already standard PNG or JPEG, return directly
  if (
    trimmed.startsWith('data:image/png') ||
    trimmed.startsWith('data:image/jpeg') ||
    trimmed.startsWith('data:image/jpg')
  ) {
    return trimmed;
  }

  // Convert WebP / other data URLs via Canvas to guaranteed PNG
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = trimmed;
      });

      const canvas = document.createElement('canvas');
      const w = img.naturalWidth || img.width || 300;
      const h = img.naturalHeight || img.height || 300;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        return canvas.toDataURL('image/png');
      }
    } catch (err) {
      console.warn('Could not re-encode avatar for export, skipping avatar to prevent export crash:', err);
      return undefined;
    }
  }

  return undefined;
}
