import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditorialPreloaderProps {
  onComplete: () => void;
}

export const EditorialPreloader: React.FC<EditorialPreloaderProps> = ({ onComplete }) => {
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let exitTimer: number;

    const initPreload = async () => {
      try {
        if ('fonts' in document) {
          await (document as Document & { fonts: FontFaceSet }).fonts.ready;
        }
      } catch (e) {
        console.warn('Font preload fallback:', e);
      }

      // Calm, minimal dwell time (1.9s)
      exitTimer = window.setTimeout(() => {
        setIsFinished(true);
        window.setTimeout(() => {
          onComplete();
        }, 700);
      }, 1900);
    };

    initPreload();

    return () => {
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="resumora-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[9999] bg-[#09090b] text-[#f4f4f6] flex items-center justify-center select-none overflow-hidden"
          style={{ willChange: 'opacity, transform' }}
        >
          {/* Subtle Ambient Radial Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.08, 0.16, 0.08],
              scale: [0.94, 1.06, 0.94],
            }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#f07830]/15 blur-[100px] pointer-events-none"
          />

          {/* Centered Minimal Organic Aesthetic Glyph */}
          <div className="relative flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: [0.96, 1.04, 0.97, 1.02, 0.96],
                rotate: [0, 1.5, -1.2, 0.6, 0],
                opacity: 1,
              }}
              transition={{
                scale: {
                  duration: 3.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                rotate: {
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                opacity: {
                  duration: 0.6,
                  ease: 'easeOut',
                },
              }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-[#f4f4f6]"
            >
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible drop-shadow-[0_0_16px_rgba(244,244,246,0.18)]"
              >
                {/* Organic fluid handcrafted contour line */}
                <motion.path
                  d="M 50,14
                     C 59,14 65,24 64,33
                     C 64,41 84,27 86,39
                     C 88,51 77,57 70,58
                     C 63,59 78,74 71,81
                     C 64,88 56,71 49,70
                     C 42,71 33,87 27,80
                     C 21,73 35,59 29,57
                     C 22,55 14,48 14,37
                     C 14,26 36,39 36,31
                     C 36,23 41,14 50,14
                     Z"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: 1,
                  }}
                  transition={{
                    pathLength: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.3 },
                  }}
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
