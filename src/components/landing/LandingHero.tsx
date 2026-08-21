import React, { useRef, useEffect } from 'react';
import { useParallax } from '../../hooks/useParallax';
import { ResumeCard } from './ResumeCard';
import { CTAButton } from './CTAButton';
import { TEMPLATES } from '../../templates/TemplateRenderer';
import { Sparkles, Upload } from 'lucide-react';

type LandingHeroProps = {
  onCreateNew: () => void;
  onNavigate: (view: 'dashboard' | 'builder', resumeId?: string) => void;
  onOpenImport?: () => void;
};

export const LandingHero: React.FC<LandingHeroProps> = ({ onCreateNew, onNavigate, onOpenImport }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { setMousePosition } = useParallax();

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePosition(x, y);
    };
    const node = heroRef.current;
    node?.addEventListener('mousemove', handleMouse);
    return () => {
      node?.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <div className="flex flex-col items-center text-center max-w-5xl mx-auto py-4" ref={heroRef}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/40 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Resumora • Modern Resume Builder</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
        Build something <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">worth submitting.</span>
      </h1>

      <p className="text-sm sm:text-base text-slate-400 max-w-2xl mb-8 leading-relaxed">
        Craft ATS-optimized, high-density professional resumes in seconds. Privacy-first, 100% device-local with instant vector PDF & editable Word exports.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
        <CTAButton onClick={onCreateNew} primary>
          CREATE YOUR RESUME
        </CTAButton>
        <button
          className="px-5 py-3.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-[8px] flex items-center gap-2 transition-colors duration-150 cursor-pointer"
          onClick={onOpenImport ? onOpenImport : () => onNavigate('dashboard')}
        >
          <Upload className="w-3.5 h-3.5 text-purple-400" />
          IMPORT AN EXISTING RESUME
        </button>
      </div>

      {/* Primary Resume Card Preview */}
      <div className="w-full max-w-2xl bg-slate-900/60 p-2 sm:p-4 rounded-xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xs">
        <div className="transform scale-90 sm:scale-95 origin-top transition-transform">
          <ResumeCard templateId="modern" isPrimary />
        </div>
      </div>
    </div>
  );
};
