import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditorialPreloaderProps {
  onComplete: () => void;
}

const STEPS = [
  'COMPILING VECTOR RENDER ENGINE',
  'SYNCHRONIZING EDITORIAL TYPOGRAPHY',
  'INITIALIZING CLIENT-SIDE DATABASE',
  'ATS SIGNAL PROCESSOR READY',
];

export const EditorialPreloader: React.FC<EditorialPreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    let stepTimer: number;

    // Preload web fonts
    const preloadAssets = async () => {
      try {
        if ('fonts' in document) {
          await (document as Document & { fonts: FontFaceSet }).fonts.ready;
        }
      } catch (e) {
        console.warn('Font preload completed with fallback:', e);
      }
    };

    preloadAssets();

    // Smooth deterministic progress increment
    const interval = window.setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setStepIndex(3);
        clearInterval(interval);

        // Hold 100% briefly for polish then trigger exit
        stepTimer = window.setTimeout(() => {
          setIsFinished(true);
          window.setTimeout(() => {
            onComplete();
          }, 600);
        }, 350);
      } else {
        setProgress(currentProgress);
        if (currentProgress > 75) setStepIndex(3);
        else if (currentProgress > 50) setStepIndex(2);
        else if (currentProgress > 25) setStepIndex(1);
      }
    }, 45);

    return () => {
      clearInterval(interval);
      clearTimeout(stepTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[9999] bg-[#0A0A0B] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden"
        >
          {/* Ambient Subtle Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#F15A24]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Architectural Metadata */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono tracking-widest text-zinc-400 uppercase z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F15A24] animate-pulse" />
              <span className="font-bold text-white">RESUMORA</span>
              <span className="hidden sm:inline text-zinc-600">//</span>
              <span className="hidden sm:inline">STUDIO SYSTEM 2.0</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-zinc-500">EDITION // 2026</span>
              <span className="text-[#F15A24] font-bold">100% VECTOR</span>
            </div>
          </div>

          {/* Center Main Stage */}
          <div className="flex flex-col items-center justify-center my-auto z-10 w-full max-w-xl mx-auto text-center px-4">
            {/* Minimalist Watermark Monogram */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-[72px] sm:text-[110px] md:text-[130px] font-['Bebas_Neue'] leading-none tracking-tight text-white/90 drop-shadow-2xl"
            >
              RESUMORA
            </motion.div>

            {/* Micro Subtitle */}
            <p className="text-xs sm:text-sm font-serif italic text-zinc-400 -mt-2 sm:-mt-3 mb-8">
              Curate your career with Swiss typography & zero latency.
            </p>

            {/* Hairline Progress Bar */}
            <div className="w-full h-[2px] bg-zinc-800 rounded-full overflow-hidden mb-5 relative">
              <motion.div
                className="h-full bg-[#F15A24]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.1 }}
              />
            </div>

            {/* Progress Status & Live Percentage */}
            <div className="w-full flex items-center justify-between font-mono text-[11px] sm:text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-left">
                <span className="text-[#F15A24] font-bold">
                  [{String(stepIndex + 1).padStart(2, '0')}/04]
                </span>
                <span className="tracking-wider truncate max-w-[200px] sm:max-w-none text-zinc-300">
                  {STEPS[stepIndex]}
                </span>
              </div>
              <span className="font-bold text-white font-mono text-xs sm:text-sm">
                {String(progress).padStart(3, '0')}%
              </span>
            </div>
          </div>

          {/* Bottom Coordinates & Architecture */}
          <div className="flex justify-between items-end text-[10px] sm:text-xs font-mono text-zinc-500 tracking-wider uppercase z-10 border-t border-zinc-800/80 pt-4">
            <div>
              <span className="text-zinc-400">LATENCY:</span> 0.0MS · CLIENT-FIRST
            </div>
            <div>
              <span className="text-zinc-400">STATUS:</span> BOOTING ENGINE
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
