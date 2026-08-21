import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ImportReviewModal } from '../components/import/ImportReviewModal';
import { AccountModal } from '../components/common/AccountModal';
import { importResumeFile } from '../services/importService';
import type { ImportParseResult } from '../services/resumeParser';
import type { Resume, TemplateId } from '../types/resume';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { createSampleResume } from '../utils/sampleData';
import { ThemeToggle } from '../components/landing/ThemeToggle';
import { ResumoraLogo } from '../components/common/ResumoraLogo';
import { Menu, X, ArrowRight, ShieldCheck, CheckCircle2, Zap, Flame } from 'lucide-react';

interface LandingProps {
  onNavigate: (view: 'landing' | 'dashboard' | 'builder', resumeId?: string) => void;
  onCreateNew: () => void;
  onSelectResume: (resume: Resume) => void;
}

interface DeskPaperSheetProps {
  templateId: TemplateId;
  className?: string;
  widthPx: number;
  ariaHidden?: boolean;
}

const DeskPaperSheet: React.FC<DeskPaperSheetProps> = ({
  templateId,
  className = '',
  widthPx,
  ariaHidden = false,
}) => {
  const sample = useMemo(() => {
    const s = createSampleResume();
    s.templateId = templateId;
    if (templateId === 'executive-photo' || templateId === 'modern-sidebar-photo') {
      s.personal.avatarUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><circle cx="50" cy="38" r="22" fill="%2394a3b8"/><path d="M20 90 C20 65 35 60 50 60 C65 60 80 90 Z" fill="%2394a3b8"/></svg>';
    }
    return s;
  }, [templateId]);

  const heightPx = Math.round(widthPx * (297 / 210));
  const scale = widthPx / 793.7;

  return (
    <div
      className={`bg-white text-black shadow-2xl overflow-hidden border border-black/10 select-none ${className}`}
      style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
      aria-hidden={ariaHidden ? 'true' : undefined}
    >
      <div
        style={{
          width: '793.7px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <TemplateRenderer resume={sample} isPreview={true} />
      </div>
    </div>
  );
};

// Interactive 3D Tilt Card with Glare
const Interactive3DCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12;
    const rY = ((x - centerX) / centerX) * 12;

    setRotateX(rX);
    setRotateY(rY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`relative cursor-pointer transition-shadow duration-300 ${className}`}
    >
      {children}
      {/* Dynamic Cursor Light Glare */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-30"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(400px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4), transparent 60%)`
        }}
      />
    </motion.div>
  );
};

export const Landing: React.FC<LandingProps> = ({ onNavigate, onCreateNew, onSelectResume }) => {
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cursorHovered, setCursorHovered] = useState<string | null>(null);
  
  // Import workflow state
  const [parseResult, setParseResult] = useState<ImportParseResult | null>(null);
  const [importReviewOpen, setImportReviewOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom Smooth Cursor Tracking
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const springX = useSpring(-100, { stiffness: 400, damping: 28 });
  const springY = useSpring(-100, { stiffness: 400, damping: 28 });

  // Hero Scroll Transformation
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroContainerRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(heroScrollProgress, [0, 1], [1, 0.86]);
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.7, 1], [1, 0.8, 0.05]);
  const heroY = useTransform(heroScrollProgress, [0, 1], ["0%", "16%"]);
  
  // Hero Ribbon 3D Explosive Fan-Out on scroll
  const fanOut0 = useTransform(heroScrollProgress, [0, 1], [0, -180]);
  const fanOut1 = useTransform(heroScrollProgress, [0, 1], [0, -60]);
  const fanOut2 = useTransform(heroScrollProgress, [0, 1], [0, 60]);
  const fanOut3 = useTransform(heroScrollProgress, [0, 1], [0, 180]);

  // Global Page Scroll Progress for Layered Parallax
  const { scrollYProgress } = useScroll();
  const card1Rotate = useTransform(scrollYProgress, [0.1, 0.35], [-2, 0]);
  const card2Rotate = useTransform(scrollYProgress, [0.3, 0.6], [1.5, 0]);
  const card3Rotate = useTransform(scrollYProgress, [0.55, 0.85], [-1.5, 0]);

  // Staggered vertical parallax for Gallery templates
  const galleryParallax0 = useTransform(scrollYProgress, [0.25, 0.65], [40, -40]);
  const galleryParallax1 = useTransform(scrollYProgress, [0.25, 0.65], [-30, 30]);
  const galleryParallax2 = useTransform(scrollYProgress, [0.25, 0.65], [50, -30]);
  const galleryParallax3 = useTransform(scrollYProgress, [0.25, 0.65], [-40, 40]);

  // Smooth liquid scroll progress bar
  const scrollIndicatorScale = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });

  // Responsive screen detection for desktop-only 3D transforms
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsLargeScreen(typeof window !== 'undefined' && window.innerWidth >= 1024);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX);
      springY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [springX, springY]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Security Error: File exceeds the maximum allowed size of 5MB.");
      return;
    }
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      alert("Security Error: Unrecognized or malicious file signature detected.");
      return;
    }

    setImporting(true);
    try {
      const result = await importResumeFile(file);
      setParseResult(result);
      setImportReviewOpen(true);
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = () => {
    if (parseResult?.resume) {
      onSelectResume(parseResult.resume);
      setImportReviewOpen(false);
      onNavigate('builder', parseResult.resume.id);
    }
  };

  const templatesList: { id: TemplateId; label: string; tag: string; desc: string; ats: string }[] = [
    { id: 'modern', label: 'MODERN ARCHITECT', tag: 'ATS Standard', desc: 'Engineered structural hierarchy built for engineers & product leaders.', ats: '99.8%' },
    { id: 'executive-photo', label: 'EXECUTIVE PORTRAIT', tag: 'High Impact', desc: 'Editorial typography paired with an integrated profile visual.', ats: '100%' },
    { id: 'minimal', label: 'SWISS MINIMAL', tag: 'Pure Whitespace', desc: 'Clean typography inspired by European modernist exhibition posters.', ats: '99.4%' },
    { id: 'classic', label: 'ACADEMIC CLASSIC', tag: 'Traditional', desc: 'Timeless serif layout crafted for law, finance, and academia.', ats: '100%' },
  ];

  // Candidates on the 3D ribbon
  const ribbonCards = [
    { name: 'Elena Rostova', role: 'Staff Product Designer', loc: 'Berlin, DE', tag: 'Figma // Lead', score: '99.4%', avatarBg: 'from-amber-600 to-orange-700' },
    { name: 'Robert Banat', role: 'Principal Architect', loc: 'US, Brooklyn', tag: 'Distributed Sys', score: '100%', avatarBg: 'from-blue-600 to-indigo-800' },
    { name: 'Georgina Koutifari', role: 'Creative Director', loc: 'London, UK', tag: 'Editorial & Brand', score: '98.9%', avatarBg: 'from-rose-600 to-purple-800' },
    { name: 'Marcus Chen', role: 'Senior ML Engineer', loc: 'San Francisco, CA', tag: 'PyTorch // CUDA', score: '99.8%', avatarBg: 'from-emerald-600 to-teal-800' },
  ];

  return (
    <div className="min-h-screen w-full font-sans bg-black text-[var(--color-text-primary)] selection:bg-[#F15A24] selection:text-white overflow-x-hidden transition-colors duration-200">
      
      {/* CUSTOM TRAILING CURSOR (Follow.art signature) */}
      <motion.div 
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          width: cursorHovered ? 80 : 36,
          height: cursorHovered ? 80 : 36,
          backgroundColor: cursorHovered ? 'rgba(255,255,255,0.95)' : 'transparent',
          color: '#000000',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {cursorHovered && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-mono font-bold tracking-widest uppercase text-black"
          >
            {cursorHovered}
          </motion.span>
        )}
      </motion.div>

      {/* FLOATING EDITORIAL SCROLL HUD */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-3 pointer-events-none text-white/80 select-none bg-black/40 backdrop-blur-md px-2.5 py-4 rounded-full border border-white/10 shadow-2xl">
        <span className="text-[8px] font-mono font-bold tracking-widest uppercase">HUD</span>
        <div className="w-[3px] h-24 bg-white/20 relative rounded-full overflow-hidden my-1">
          <motion.div 
            className="w-full bg-[#F15A24] origin-top"
            style={{ scaleY: scrollIndicatorScale, height: '100%' }}
          />
        </div>
        <span className="text-[9px] font-mono font-bold text-[#F15A24]">✦</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        className="hidden"
        disabled={importing}
      />

      {/* FIXED GLOBAL HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 p-5 md:p-8 flex items-start justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto text-white">
          <ResumoraLogo size="sm" strokeWidth={2.8} className="text-white shrink-0" />
          <div className="flex flex-col">
            <span className="text-[22px] md:text-[26px] font-['Bebas_Neue'] uppercase leading-none tracking-wide">RESUMORA.</span>
            <span className="text-[11px] md:text-[12px] font-medium opacity-90 tracking-wider">One Resume. One Career.</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-7 pointer-events-auto text-white text-[13px] font-medium tracking-wide">
          <a href="#candidates" onMouseEnter={() => setCursorHovered('VIEW')} onMouseLeave={() => setCursorHovered(null)} className="hover:opacity-75 transition-opacity">Candidates</a>
          <a href="#exhibition" onMouseEnter={() => setCursorHovered('GALLERY')} onMouseLeave={() => setCursorHovered(null)} className="hover:opacity-75 transition-opacity">Templates</a>
          <a href="#architecture" onMouseEnter={() => setCursorHovered('TECH')} onMouseLeave={() => setCursorHovered(null)} className="hover:opacity-75 transition-opacity">Architecture</a>
          <a href="#privacy" onMouseEnter={() => setCursorHovered('VAULT')} onMouseLeave={() => setCursorHovered(null)} className="hover:opacity-75 transition-opacity">Privacy</a>
          <div className="w-[1px] h-3 bg-white/30" />
          <ThemeToggle />
          <div className="w-[1px] h-3 bg-white/30" />
          <button onClick={() => setAccountModalOpen(true)} className="hover:opacity-75 transition-opacity">Login</button>
          <button onClick={onCreateNew} onMouseEnter={() => setCursorHovered('JOIN')} onMouseLeave={() => setCursorHovered(null)} className="font-bold hover:opacity-75 transition-opacity">
            Join
          </button>
        </nav>

        <button 
          className="lg:hidden flex items-center p-2 text-white pointer-events-auto"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open Navigation"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-black/95 text-white backdrop-blur-2xl flex flex-col justify-between px-6 py-6"
          >
            <div>
              <div className="flex justify-between items-center h-[50px] mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <ResumoraLogo size="sm" strokeWidth={2.8} className="text-white shrink-0" />
                  <span className="text-2xl font-['Bebas_Neue'] tracking-wider">RESUMORA.</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white/80 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex flex-col gap-5 text-[32px] font-['Bebas_Neue'] uppercase leading-none">
                <a href="#candidates" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F15A24] transition-colors">01 // Candidates</a>
                <a href="#exhibition" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F15A24] transition-colors">02 // Templates</a>
                <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F15A24] transition-colors">03 // Architecture</a>
                <button onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }} className="text-left hover:text-[#F15A24] transition-colors">My Documents</button>
                <button onClick={() => { setAccountModalOpen(true); setMobileMenuOpen(false); }} className="text-left hover:text-[#F15A24] transition-colors">Cloud Sync</button>
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono tracking-widest text-zinc-400">THEME MODE</span>
                <ThemeToggle />
              </div>
              <button 
                onClick={() => { onCreateNew(); setMobileMenuOpen(false); }} 
                className="bg-[#F15A24] hover:bg-[#ff6832] text-white py-4 text-[20px] font-['Bebas_Neue'] tracking-wider rounded-xl text-center w-full shadow-2xl transition-all active:scale-[0.98]"
              >
                CREATE RESUME FREE →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: HERO STAGE WITH 3D CYLINDRICAL CARD RIBBON & OVERLAPPING STROKE TYPOGRAPHY */}
      <div ref={heroContainerRef} className="relative h-[100svh] min-h-[640px] md:min-h-[750px] w-full bg-black">
        <motion.section 
          style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
          className="sticky top-0 h-[100svh] min-h-[640px] md:min-h-[750px] w-full bg-[#F15A24] overflow-hidden flex items-center justify-center perspective-[2000px] z-10 origin-bottom"
        >
          {/* Ambient Mouse Spotlight */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60 z-0"
            style={{
              background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.25), transparent 80%)`
            }}
          />

          {/* Floating Kinetic Background Asterisks */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            <motion.span 
              animate={{ rotate: 360, y: [0, -30, 0] }}
              transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
              className="absolute top-20 left-[15%] text-white/20 text-6xl md:text-7xl font-serif"
            >
              ✦
            </motion.span>
            <motion.span 
              animate={{ rotate: -360, y: [0, 40, 0] }}
              transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
              className="absolute bottom-28 right-[12%] text-white/20 text-7xl md:text-8xl font-serif"
            >
              ❋
            </motion.span>
          </div>

          {/* Massive Full-Bleed Background Typography (Solid) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-10 px-4">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                x: (mousePos.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * -0.035,
                y: (mousePos.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * -0.035
              }}
              className="text-[clamp(56px,18vw,800px)] font-['Bebas_Neue'] text-white leading-[0.72] tracking-tighter whitespace-nowrap w-full text-center mix-blend-overlay drop-shadow-2xl"
            >
              RESUMORA
            </motion.div>
          </div>

          {/* 3D Cylindrical Card Arc Ribbon (Shown across Mobile & Desktop) */}
          <div className="flex relative z-20 w-full max-w-[1300px] h-[480px] md:h-[520px] items-center justify-center px-4" style={{ transformStyle: 'preserve-3d' }}>
            <motion.div 
              animate={{ 
                rotateZ: [-12, -7, -12],
                y: [0, -20, 0],
                rotateX: [0, 8, 0],
              }}
              transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
              className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 transform translate-y-4"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {ribbonCards.map((card, idx) => {
                const rotations = [-22, -8, 10, 24];
                const translates = [-30, 20, 40, -10];
                const zOffsets = [-50, 40, 60, -30];
                const fanOffsets = [fanOut0, fanOut1, fanOut2, fanOut3];
                
                return (
                  <motion.div
                    key={card.name}
                    animate={{
                      y: [translates[idx], translates[idx] + (idx % 2 === 0 ? -24 : -16), translates[idx]],
                      rotateY: [rotations[idx], rotations[idx] + (idx % 2 === 0 ? 7 : -7), rotations[idx]],
                      rotateZ: [idx % 2 === 0 ? -2 : 2, idx % 2 === 0 ? 3 : -3, idx % 2 === 0 ? -2 : 2],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 5.5 + idx * 1.1,
                      ease: "easeInOut",
                      delay: idx * 0.3
                    }}
                    whileHover={{ scale: 1.16, rotateZ: 0, rotateY: 0, zIndex: 60, transition: { duration: 0.3 } }}
                    style={{
                      x: fanOffsets[idx],
                      transform: `rotateY(${rotations[idx]}deg) translateY(${translates[idx]}px) translateZ(${zOffsets[idx]}px)`,
                      transformStyle: 'preserve-3d'
                    }}
                    className="w-[230px] sm:w-[260px] md:w-[285px] bg-black/75 backdrop-blur-2xl text-white rounded-2xl p-4 sm:p-5 pb-4 shadow-[0_30px_70px_rgba(0,0,0,0.65)] border border-white/20 cursor-pointer flex flex-col justify-between h-[340px] sm:h-[360px] md:h-[395px] group transition-all duration-300 relative overflow-hidden shrink-0"
                    onClick={onCreateNew}
                    onMouseEnter={() => setCursorHovered('OPEN')}
                    onMouseLeave={() => setCursorHovered(null)}
                  >
                    {/* Ambient Internal Refraction Glow */}
                    <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#F15A24]/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                    <div>
                      <div className="flex justify-between items-center mb-2.5 sm:mb-3">
                        <span className="text-[10px] font-mono text-[#F15A24] font-bold uppercase tracking-widest">{card.tag}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-['Bebas_Neue'] leading-none tracking-wide group-hover:text-[#F15A24] transition-colors">
                        {card.name}
                      </h3>
                      <p className="text-xs text-zinc-300 mt-1 font-medium">{card.role}</p>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{card.loc}</p>
                    </div>

                    {/* Translucent Scope Window */}
                    <div className="my-auto py-2 px-3 sm:py-2.5 rounded-xl bg-white/5 border border-white/15 backdrop-blur-md flex items-center justify-between group-hover:border-[#F15A24]/40 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">Scored Output</span>
                        <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                          {card.score}
                          <Flame size={12} className="text-[#F15A24]" />
                        </span>
                      </div>
                      <span className="bg-[#F15A24]/20 text-[#F15A24] text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#F15A24]/30">
                        ATS READY
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Inspect Layout</span>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-[#F15A24] group-hover:text-white transition-colors shadow-md">
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Foreground Interlocking Stroke Typography (Passes OVER the cards) */}
          <div className="flex absolute inset-0 items-center justify-center pointer-events-none select-none overflow-hidden z-25 px-4">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                x: (mousePos.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * -0.035,
                y: (mousePos.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * -0.035,
                WebkitTextStroke: '2.5px rgba(255, 255, 255, 0.9)',
                color: 'transparent'
              }}
              className="text-[clamp(56px,18vw,800px)] font-['Bebas_Neue'] leading-[0.72] tracking-tighter whitespace-nowrap w-full text-center drop-shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
            >
              RESUMORA
            </motion.div>
          </div>

          {/* Bottom Left Badge */}
          <div className="absolute bottom-6 left-5 md:bottom-24 md:left-12 z-40 text-white max-w-[240px] sm:max-w-[320px]">
            <h2 className="text-[22px] sm:text-[26px] md:text-[32px] font-['Bebas_Neue'] leading-[0.9] tracking-wide mb-0.5 sm:mb-1">
              One Practice. One Resume ↘
            </h2>
            <p className="text-[10px] sm:text-xs font-mono opacity-85 uppercase tracking-widest">Client-Side Architecture · 100% Vector</p>
          </div>

          {/* Bottom Right Floating Hero CTA */}
          <div className="absolute bottom-6 right-5 md:bottom-24 md:right-12 z-40">
            <button 
              onClick={onCreateNew} 
              onMouseEnter={() => setCursorHovered('JOIN')}
              onMouseLeave={() => setCursorHovered(null)}
              className="group bg-black hover:bg-white transition-all duration-300 text-white hover:text-[#F15A24] text-[18px] sm:text-[20px] lg:text-[24px] font-['Bebas_Neue'] tracking-wide px-5 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-full shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white/20 hover:border-black flex items-center justify-between cursor-pointer active:scale-95"
            >
              <span className="hidden sm:inline">Build Resume Free</span>
              <span className="sm:hidden">Build Free</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-4 transform transition-transform duration-300 group-hover:translate-x-2" />
            </button>
          </div>

        </motion.section>
      </div>

      {/* =========================================================================
          LAYERED SCROLL CARDS: PARALLAX SKEW & HOVER DEPTH EVERYWHERE
          ========================================================================= */}

      {/* LAYER 1: SAGE GREEN TILTED CARD — "FOR CANDIDATES AND LEADERS" */}
      <motion.section 
        id="candidates"
        style={isLargeScreen ? { rotate: card1Rotate } : undefined}
        className="relative z-20 bg-[#8F9E8B] text-black pt-14 sm:pt-24 pb-24 sm:pb-36 px-5 sm:px-8 md:px-12 rounded-t-[32px] sm:rounded-t-[40px] md:rounded-t-[64px] sm:-mt-12 shadow-[0_-35px_100px_rgba(0,0,0,0.55)] border-t border-black/15 overflow-hidden origin-bottom-left"
      >
        {/* Animated SVG Brush Path */}
        <div className="absolute -top-20 -left-20 w-80 h-80 md:w-[500px] md:h-[500px] rounded-full border-[28px] md:border-[40px] border-[#F15A24] opacity-80 pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />

        <div className="max-w-[1400px] mx-auto relative z-10">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 sm:mb-16 gap-6 sm:gap-8">
            <div>
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase bg-black text-white px-3.5 sm:px-4 py-1.5 rounded-full inline-block mb-3 sm:mb-6 shadow-md">
                01 // AUDIENCE
              </span>
              <h2 className="text-[36px] sm:text-[64px] md:text-[100px] lg:text-[140px] font-['Bebas_Neue'] leading-[0.88] sm:leading-[0.82] tracking-tighter uppercase break-words">
                CURATORS AND<br/>ARTISTS.
              </h2>
            </div>

            <div className="w-full lg:max-w-[440px] bg-white/40 p-5 sm:p-7 rounded-2xl border border-black/15 backdrop-blur-md shadow-sm">
              <p className="text-sm sm:text-base md:text-lg font-medium leading-snug">
                Whether you lead an engineering department or design visual experiences, your career document is your personal exhibition catalog.
              </p>
              <div className="mt-4 sm:mt-6 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#F15A24] animate-ping shrink-0" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">Zero algorithms. Pure signal.</span>
              </div>
            </div>
          </div>

          {/* 3D Tilt Narrative Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            
            <Interactive3DCard className="p-6 sm:p-8 bg-white/80 backdrop-blur-md rounded-2xl border border-black/10 shadow-xl flex flex-col justify-between min-h-[260px] sm:h-[360px]">
              <div>
                <span className="text-3xl sm:text-4xl font-['Bebas_Neue'] text-[#F15A24]">01</span>
                <h3 className="text-2xl sm:text-3xl font-['Bebas_Neue'] uppercase mt-1 sm:mt-2 mb-2 sm:mb-3">No Template Fatigue</h3>
                <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed">
                  Recruiters scan 500 identical resumes daily. Resumora gives you typography and whitespace that cuts through recruiter fatigue in under two seconds.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase pt-4 border-t border-black/5">
                <Zap size={14} className="text-[#F15A24]" />
                <span>Instant Differentiation</span>
              </div>
            </Interactive3DCard>

            <Interactive3DCard className="p-6 sm:p-8 bg-white/80 backdrop-blur-md rounded-2xl border border-black/10 shadow-xl flex flex-col justify-between min-h-[260px] sm:h-[360px]">
              <div>
                <span className="text-3xl sm:text-4xl font-['Bebas_Neue'] text-[#F15A24]">02</span>
                <h3 className="text-2xl sm:text-3xl font-['Bebas_Neue'] uppercase mt-1 sm:mt-2 mb-2 sm:mb-3">ATS Precision</h3>
                <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed">
                  Engineered to strictly satisfy machine parsers (Workday, Greenhouse, Lever) without compromising high-fashion editorial layouts.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase pt-4 border-t border-black/5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>100% Machine Validated</span>
              </div>
            </Interactive3DCard>

            <Interactive3DCard 
              onClick={onCreateNew}
              className="p-6 sm:p-8 bg-black text-white rounded-2xl border border-black shadow-2xl flex flex-col justify-between min-h-[260px] sm:h-[360px] group cursor-pointer"
            >
              <div>
                <span className="text-3xl sm:text-4xl font-['Bebas_Neue'] text-[#F15A24]">03</span>
                <h3 className="text-2xl sm:text-3xl font-['Bebas_Neue'] uppercase mt-1 sm:mt-2 mb-2 sm:mb-3 group-hover:text-[#F15A24] transition-colors">Start In 60 Seconds</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Import your existing PDF or build from scratch in our client-side canvas. No subscription trap.
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F15A24]">Launch Studio</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
              </div>
            </Interactive3DCard>

          </div>

        </div>
      </motion.section>

      {/* CONTINUOUS MARQUEE RIBBON 1 */}
      <div className="bg-black text-white py-3 sm:py-4 overflow-hidden border-y border-zinc-800 select-none relative z-20">
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-xs sm:text-sm md:text-base font-mono tracking-widest uppercase mx-4 sm:mx-6 flex items-center gap-3 sm:gap-4 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-[#F15A24]" />
              CURATE YOUR LIFE'S WORK
              <span className="text-zinc-600">//</span>
              NO TEMPLATE LOCK-IN
              <span className="text-zinc-600">//</span>
              100% VECTOR PRECISION
            </span>
          ))}
        </div>
      </div>

      {/* LAYER 2: WARM OCHRE SAND TILTED CARD — "THE EXHIBITION GALLERY" */}
      <motion.section 
        id="exhibition"
        style={isLargeScreen ? { rotate: card2Rotate } : undefined}
        className="relative z-20 bg-[#E2D9CC] text-black pt-16 sm:pt-28 pb-24 sm:pb-40 px-5 sm:px-8 md:px-12 rounded-t-[32px] sm:rounded-t-[40px] md:rounded-t-[64px] -mt-6 sm:-mt-12 shadow-[0_-35px_100px_rgba(0,0,0,0.55)] border-t border-black/15 overflow-hidden origin-bottom-right"
      >
        <div className="max-w-[1400px] mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6">
            <div>
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase bg-black text-white px-3.5 sm:px-4 py-1.5 rounded-full inline-block mb-3 sm:mb-6 shadow-md">
                02 // GALLERY
              </span>
              <h2 className="text-[36px] sm:text-[64px] md:text-[100px] lg:text-[140px] font-['Bebas_Neue'] leading-[0.88] sm:leading-[0.82] tracking-tighter uppercase">
                THE EXHIBIT.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-800 max-w-[400px] font-medium leading-normal">
              Every layout is a dedicated design system. Select a layout to inspect its typography and live structure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {templatesList.map((tmpl, idx) => {
              const galleryOffsets = [galleryParallax0, galleryParallax1, galleryParallax2, galleryParallax3];
              return (
                <motion.div 
                  key={tmpl.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  style={isLargeScreen ? { y: galleryOffsets[idx] } : undefined}
                  className="group flex flex-col bg-white rounded-2xl border border-black/15 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500"
                  onMouseEnter={() => setCursorHovered('PREVIEW')}
                  onMouseLeave={() => setCursorHovered(null)}
                >
                  <div className="p-3.5 sm:p-4 bg-zinc-100 border-b border-black/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F15A24]">{tmpl.tag}</span>
                    <span className="text-[11px] font-mono text-zinc-500 font-bold">ATS {tmpl.ats}</span>
                  </div>

                  <div className="p-3 sm:p-6 flex items-center justify-center bg-zinc-50 overflow-hidden relative group-hover:bg-[#F15A24]/5 transition-colors duration-500">
                    <div className="transform scale-[0.68] sm:scale-[0.7] group-hover:scale-[0.75] transition-transform duration-500 ease-out flex items-center justify-center">
                      <DeskPaperSheet templateId={tmpl.id} widthPx={280} />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4 bg-white">
                    <div>
                      <h3 className="text-2xl font-['Bebas_Neue'] tracking-wide uppercase">{tmpl.label}</h3>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{tmpl.desc}</p>
                    </div>

                    <button 
                      onClick={onCreateNew}
                      className="w-full py-3.5 bg-black hover:bg-[#F15A24] text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg min-h-[42px] cursor-pointer active:scale-[0.98]"
                    >
                      <span>USE TEMPLATE</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </motion.section>

      {/* CONTINUOUS MARQUEE RIBBON 2 (Reverse) */}
      <div className="bg-[#F15A24] text-white py-3 sm:py-4 overflow-hidden select-none relative z-20">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite_reverse]">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-xs sm:text-sm md:text-base font-mono tracking-widest uppercase mx-4 sm:mx-6 flex items-center gap-3 sm:gap-4 text-white font-bold">
              <span>✦</span>
              100% LOCAL-FIRST COMPILATION
              <span>//</span>
              ZERO DATABASE TRACKING
              <span>//</span>
              BROWSER ENCRYPTION
            </span>
          ))}
        </div>
      </div>

      {/* LAYER 3: DEEP NOIR CARD — "ZERO TRACKING // 100% PRIVATE" */}
      <motion.section 
        id="privacy"
        style={isLargeScreen ? { rotate: card3Rotate } : undefined}
        className="relative z-20 bg-[#121214] text-white pt-16 sm:pt-28 pb-24 sm:pb-40 px-5 sm:px-8 md:px-12 rounded-t-[32px] sm:rounded-t-[40px] md:rounded-t-[64px] -mt-6 sm:-mt-12 shadow-[0_-35px_100px_rgba(0,0,0,0.65)] border-t border-zinc-800 overflow-hidden origin-bottom-left"
      >
        <div className="max-w-[1400px] mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 items-center mb-10 sm:mb-20">
            <div className="lg:col-span-7">
              <span className="text-[10px] sm:text-xs font-mono text-[#F15A24] tracking-widest uppercase font-semibold block mb-2 sm:mb-4">
                03 // ARCHITECTURE
              </span>
              <h2 className="text-[32px] sm:text-[54px] md:text-[84px] lg:text-[120px] font-['Bebas_Neue'] leading-[0.88] sm:leading-[0.82] tracking-tighter uppercase mb-4 sm:mb-8">
                YOUR DATA NEVER<br/>LEAVES YOUR DEVICE.
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-zinc-400 max-w-[620px] leading-relaxed">
                Most online resume makers store your phone number, home address, and compensation details in unencrypted databases. Resumora is 100% browser-native and offline-capable.
              </p>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-84 md:h-84 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center relative">
                <div className="w-full h-full absolute animate-[spin_30s_linear_infinite] rounded-full border border-dashed border-[#F15A24]/50" />
                <div className="text-center p-5 sm:p-7 bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl">
                  <ShieldCheck size={36} className="text-[#F15A24] mx-auto mb-2 animate-bounce" />
                  <span className="text-lg sm:text-2xl font-['Bebas_Neue'] tracking-wider block">LOCAL ENCRYPTION</span>
                  <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400">Zero Server Storage</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            <Interactive3DCard className="p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl">
              <span className="text-3xl sm:text-4xl font-['Bebas_Neue'] text-[#F15A24]">0.0ms</span>
              <h3 className="text-xl sm:text-2xl font-['Bebas_Neue'] uppercase mt-1 sm:mt-2 mb-2">Zero Network Latency</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Changes compile live in milliseconds using WebAssembly and React V8 client runtime.
              </p>
            </Interactive3DCard>

            <Interactive3DCard className="p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl">
              <span className="text-3xl sm:text-4xl font-['Bebas_Neue'] text-[#F15A24]">Vector PDF</span>
              <h3 className="text-xl sm:text-2xl font-['Bebas_Neue'] uppercase mt-1 sm:mt-2 mb-2">Sub-Millimeter Export</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Direct PostScript vector math guaranteeing razor-sharp print and perfect ATS text scraping.
              </p>
            </Interactive3DCard>

            <Interactive3DCard className="p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl">
              <span className="text-3xl sm:text-4xl font-['Bebas_Neue'] text-[#F15A24]">Free Forever</span>
              <h3 className="text-xl sm:text-2xl font-['Bebas_Neue'] uppercase mt-1 sm:mt-2 mb-2">No Paywall Traps</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Export high-resolution PDFs without watermarks, credit cards, or surprise renewal bills.
              </p>
            </Interactive3DCard>
          </div>

        </div>
      </motion.section>

      {/* LAYER 4: MASSIVE BRUTALIST CLIMAX CARD */}
      <section className="relative z-20 bg-[#F15A24] text-white pt-20 sm:pt-32 pb-28 sm:pb-48 px-5 sm:px-8 md:px-12 rounded-t-[32px] sm:rounded-t-[40px] md:rounded-t-[64px] -mt-6 sm:-mt-12 shadow-[0_-35px_100px_rgba(0,0,0,0.65)] text-center overflow-hidden">
        <div className="max-w-[1100px] mx-auto relative z-10 flex flex-col items-center">
          <span className="text-xs md:text-sm font-mono tracking-widest uppercase bg-black text-white px-4 sm:px-5 py-2 rounded-full mb-6 sm:mb-8 font-bold shadow-lg">
            ONE PRACTICE. ONE RESUME.
          </span>
          <h2 className="text-[36px] sm:text-[68px] md:text-[110px] lg:text-[160px] font-['Bebas_Neue'] leading-[0.85] sm:leading-[0.78] tracking-tighter uppercase mb-6 sm:mb-10">
            BEGIN YOUR STORY.
          </h2>
          <p className="text-base sm:text-xl md:text-2xl text-white/95 max-w-[640px] font-medium leading-relaxed mb-8 sm:mb-12">
            No credit card, no sign-up wall. Build your document now and walk into your next interview with conviction.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={onCreateNew}
            onMouseEnter={() => setCursorHovered('START')}
            onMouseLeave={() => setCursorHovered(null)}
            className="w-full sm:w-auto group bg-black hover:bg-white text-white hover:text-[#F15A24] transition-all duration-300 text-xl sm:text-2xl md:text-3xl font-['Bebas_Neue'] tracking-wide px-8 sm:px-14 md:px-20 py-5 sm:py-7 md:py-8 rounded-full shadow-2xl flex items-center justify-center gap-3 sm:gap-4 cursor-pointer"
          >
            <span>CREATE RESUME FREE</span>
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 transform transition-transform duration-300 group-hover:translate-x-3" />
          </motion.button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 bg-black text-white border-t border-zinc-800 pt-16 sm:pt-20 pb-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
            <div className="md:col-span-2">
              <span className="text-3xl font-['Bebas_Neue'] tracking-wider uppercase">RESUMORA</span>
              <p className="text-sm text-zinc-400 max-w-[340px] mt-2">
                The editorial resume studio inspired by modern exhibition design and ATS performance.
              </p>
            </div>

            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block mb-4">STUDIO</span>
              <div className="flex flex-col gap-3 text-sm text-zinc-300">
                <button onClick={onCreateNew} className="text-left hover:text-[#F15A24] transition-colors">Start New Document</button>
                <button onClick={() => onNavigate('dashboard')} className="text-left hover:text-[#F15A24] transition-colors">My Documents</button>
                <button onClick={() => setAccountModalOpen(true)} className="text-left hover:text-[#F15A24] transition-colors">Cloud Sync</button>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block mb-4">THEME MODE</span>
              <ThemeToggle />
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-zinc-500">
            <p>© {new Date().getFullYear()} RESUMORA STUDIO INC. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <span>LOCAL-FIRST ARCHITECTURE</span>
              <span>100% PRIVATE</span>
            </div>
          </div>
        </div>
      </footer>

      <ImportReviewModal
        isOpen={importReviewOpen}
        onClose={() => setImportReviewOpen(false)}
        parseResult={parseResult}
        onConfirmImport={handleConfirmImport}
      />

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />

    </div>
  );
};
