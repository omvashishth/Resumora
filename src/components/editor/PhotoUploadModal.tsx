import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { processAndCropImage, loadImageFromFile } from '../../utils/imageCropper';
import { ZoomIn, ZoomOut, Check, X, Move } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  onSavePhoto: (dataUrl: string) => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  file,
  onSavePhoto,
}) => {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.2);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen || !file) {
      setImageElement(null);
      setPreviewUrl(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    loadImageFromFile(file)
      .then((img) => {
        setImageElement(img);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load image.');
        setLoading(false);
      });
  }, [isOpen, file]);

  // Update preview Data URL dynamically when parameters change
  useEffect(() => {
    if (!imageElement) return;
    processAndCropImage(imageElement, { zoom, offsetX, offsetY })
      .then((url) => setPreviewUrl(url))
      .catch(() => {});
  }, [imageElement, zoom, offsetX, offsetY]);

  const handleStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    dragStart.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const deltaX = (clientX - dragStart.current.x) / 180;
    const deltaY = (clientY - dragStart.current.y) / 180;

    setOffsetX((prev) => Math.max(-0.5, Math.min(0.5, prev - deltaX)));
    setOffsetY((prev) => Math.max(-0.5, Math.min(0.5, prev - deltaY)));
    dragStart.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  const handleSave = async () => {
    if (!imageElement) return;
    try {
      const croppedUrl = await processAndCropImage(imageElement, { zoom, offsetX, offsetY });
      onSavePhoto(croppedUrl);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to crop photo.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop & Position Profile Photo" maxWidth="md">
      <div className="space-y-5 select-none">
        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--color-text-secondary)]">
            Processing image...
          </div>
        ) : error ? (
          <div className="p-4 bg-[var(--color-danger-subtle)] text-[var(--color-danger)] rounded-[var(--radius-subtle)] text-xs">
            {error}
          </div>
        ) : (
          <>
            {/* Interactive Crop Viewport with Mouse & Touch support */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-dashed border-[var(--color-brand)] rounded-full overflow-hidden bg-slate-950 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner touch-none"
                onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={(e) => {
                  if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchEnd={handleEnd}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Crop preview"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Loading preview...</span>
                )}
                {/* Visual Overlay Mask */}
                <div className="absolute inset-0 border-2 border-white/40 rounded-full pointer-events-none flex items-center justify-center">
                  <Move className="w-5 h-5 text-white/60 animate-pulse" />
                </div>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 font-mono">
                Drag frame or use slider to adjust
              </p>
            </div>

            {/* Zoom Controls */}
            <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-3.5 rounded-[var(--radius-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-primary)]">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-[var(--color-brand)]" /> Zoom Level
                </span>
                <span className="font-mono text-xs text-[var(--color-brand)]">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-[var(--color-text-secondary)] shrink-0" />
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-8 accent-[var(--color-brand)] cursor-pointer"
                />
                <ZoomIn className="w-4 h-4 text-[var(--color-text-secondary)] shrink-0" />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              <Button variant="outline" size="sm" onClick={onClose} leftIcon={<X className="w-3.5 h-3.5" />} className="w-full sm:w-auto min-h-[42px]">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                leftIcon={<Check className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto min-h-[42px]"
              >
                Apply Profile Photo
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
