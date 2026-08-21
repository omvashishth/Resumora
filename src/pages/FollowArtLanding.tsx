import React, { useState, useEffect, useRef } from 'react';

export const FollowArtLanding: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scroll observer for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // WebGL / Canvas interactive background in Hero
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles: {x: number, y: number, vx: number, vy: number, r: number}[] = [];
    const particleCount = window.innerWidth < 768 ? 30 : 60;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 2 + 0.5
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let dist = dx * dx + dy * dy;

          if (dist < 20000) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 0, 0, ${0.03 * (1 - dist/20000)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const headingFont = "font-['Hardbop','Inter',serif]";
  const bodyFont = "font-['HeadingNow','Inter',sans-serif]";
  const transitionLux = "transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

  return (
    <div className={`min-h-screen w-full text-left bg-[#ffffff] text-[#111111] ${bodyFont} selection:bg-[#f07830] selection:text-[#111111] overflow-x-hidden`} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
      
      {/* SECTION 1 — HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${transitionLux} ${scrolled ? 'bg-[#ffffff] border-b border-black/10' : 'bg-transparent'}`}>
        <div className="max-w-[1440px] mx-auto px-6 h-[60px] flex items-center justify-between">
          
          <div className="flex items-center gap-[64px]">
            <a href="#" className={`text-[#000000] text-[20px] tracking-tight font-[700] uppercase ${headingFont} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830]`}>
              Gallery.
            </a>
            
            <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-[0.08em] uppercase text-[#666666]">
              {['About', 'Our Product', 'Community Board', 'Pricing', 'FAQ'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-[#f07830] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830] relative group">
                  {item}
                  <span className={`absolute left-0 bottom-[-4px] w-0 h-[1px] bg-[#f07830] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full`}></span>
                </a>
              ))}
            </nav>
          </div>

          <div className="hidden md:block">
            <a href="#join" className="inline-flex items-center justify-center bg-[#f07830] text-[#111111] px-[24px] py-[12px] text-[15px] font-[500] rounded-[8px] hover:brightness-110 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f07830]">
              Start Free
            </a>
          </div>

          <button 
            className="md:hidden text-[#000000] min-h-[44px] min-w-[44px] flex items-center justify-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f07830]"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#ffffff] flex flex-col px-6 py-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center h-[60px] mb-12">
            <a href="#" className={`text-[#000000] text-[20px] font-[700] uppercase ${headingFont} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830]`}>
              Gallery.
            </a>
            <button 
              className="text-[#000000] min-h-[44px] min-w-[44px] flex items-center justify-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f07830]"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-6 text-[40px] font-[700] uppercase leading-[0.9]">
            {['About', 'Our Product', 'Community Board', 'Pricing', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileMenuOpen(false)} className={`text-[#000000] ${headingFont} hover:text-[#f07830] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830]`}>
                {item}
              </a>
            ))}
            <a href="#join" onClick={() => setMobileMenuOpen(false)} className={`mt-8 inline-flex items-center justify-center bg-[#f07830] text-[#111111] px-[24px] py-[16px] text-[18px] font-[500] rounded-[8px] hover:brightness-110 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f07830]`}>
              Start Free
            </a>
          </nav>
        </div>
      )}

      {/* SECTION 2 — HERO */}
      <section className="relative h-[100svh] min-h-[700px] flex items-center pt-[60px] overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-0 pointer-events-none opacity-60"
          aria-hidden="true"
        />
        <div className="max-w-[1440px] mx-auto px-6 w-full relative z-10 flex flex-col items-center text-center">
          <div className="overflow-hidden mb-2">
            <h1 className={`text-[#000000] text-[141px] md:text-[257px] font-[700] uppercase leading-[0.78] tracking-tighter ${headingFont} flex flex-col`}>
              <span className="block animate-in slide-in-from-bottom-[100%] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]">CURATE.</span>
              <span className="block animate-in slide-in-from-bottom-[100%] duration-[900ms] delay-[80ms] ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-backwards">CONNECT.</span>
              <span className="block animate-in slide-in-from-bottom-[100%] duration-[900ms] delay-[160ms] ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-backwards">ONE CARD.</span>
            </h1>
          </div>
          <div className="mt-[48px] animate-in fade-in duration-[900ms] delay-[400ms] fill-mode-backwards flex flex-col items-center">
            <p className="text-[#666666] text-[26px] leading-[1.15] mb-[48px] max-w-[600px] font-medium">
              Your portfolio, contacts, and direct support in one Card. Free to start. No algorithm.
            </p>
            <div className="flex flex-wrap gap-[12px] justify-center">
              <a href="#build" className="inline-flex items-center justify-center bg-[#f07830] text-[#111111] px-[24px] py-[12px] text-[16px] font-[500] rounded-[8px] hover:brightness-110 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f07830]">
                Claim your Card
              </a>
              <a href="#explore" className="inline-flex items-center justify-center bg-transparent text-[#111111] px-[24px] py-[12px] text-[16px] font-[500] border border-[rgba(0,0,0,0.2)] rounded-[8px] hover:bg-black/5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f07830]">
                Explore Community
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — SOCIAL PROOF */}
      <section className="py-[64px] border-t border-b border-black/10 bg-[#fafafa]">
        <div className="max-w-[720px] mx-auto px-6">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[#888888] mb-8 text-center font-medium">Trusted by curators at</p>
          <div className="flex flex-wrap justify-center items-center gap-x-[64px] gap-y-8 opacity-40 grayscale">
            {['MoMA', 'Tate', 'Guggenheim', 'Pace', 'Gagosian'].map((company) => (
              <span key={company} className={`text-[24px] font-[700] uppercase tracking-tighter text-[#000000] ${headingFont}`}>
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURED GRID */}
      <section className="py-[96px] md:py-[140px] bg-[#ffffff]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="mb-[64px] flex flex-col items-center text-center">
            <h2 className={`text-[#000000] text-[80px] md:text-[225px] font-[700] uppercase leading-[0.78] tracking-tighter ${headingFont}`}>
              EXHIBIT
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {[
              { color: '#f0d8c0', title: 'SCULPTURE', date: '2025' },
              { color: '#f0a878', title: 'PAINTING', date: '2024' },
              { color: '#e8e8e8', title: 'DIGITAL', date: '2025' },
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className={`aspect-[3/4] bg-[${item.color}] overflow-hidden border border-black/10 mb-4`}>
                  <div className={`w-full h-full bg-[${item.color}] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.05] group-hover:scale-100 flex items-center justify-center`}>
                    <div className="w-[40%] h-[40%] border border-black/10 bg-black/5 rounded-full blur-[40px]"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className={`text-[18px] font-[700] uppercase ${headingFont}`}>{item.title}</span>
                  <span className="text-[13px] font-mono text-[#888888]">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — CURRENT/LATEST (Scrolling Row) */}
      <section className="py-[96px] md:py-[140px] border-t border-black/10 bg-[#fafafa] overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 mb-[48px]">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[#888888] font-medium">Recent Activity</p>
        </div>
        <div className="flex gap-[32px] px-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="min-w-[280px] md:min-w-[400px] snap-start flex flex-col gap-4">
              <div className="aspect-video bg-[#f0d8c0] border border-black/10"></div>
              <div className="flex justify-between items-start">
                <p className="text-[16px] font-medium leading-[1.2]">Studio Visit Vol. {i}</p>
                <span className="text-[12px] font-mono text-[#888888]">10.24.25</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — FEATURE/VALUE */}
      <section className="py-[96px] md:py-[140px] bg-[#ffffff] border-t border-black/10">
        <div className="max-w-[1024px] mx-auto px-6 flex flex-col gap-[140px]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[64px] items-center">
            <div className="order-2 md:order-1">
              <p className="text-[12px] uppercase tracking-[0.08em] text-[#888888] mb-6 font-medium">Autonomy</p>
              <h2 className={`text-[#000000] text-[64px] md:text-[120px] font-[700] uppercase leading-[0.85] tracking-tighter mb-8 ${headingFont}`}>
                OWN IT.
              </h2>
              <p className="text-[26px] leading-[1.15] text-[#111111]">
                Bypass the feed. Deliver your work directly to collectors in a space you control entirely.
              </p>
            </div>
            <div className="order-1 md:order-2 aspect-[3/4] bg-[#f0d8c0] border border-black/10 flex items-center justify-center p-12 overflow-hidden">
               <div className="w-full h-full border border-black/10 rounded-t-full bg-white/20 backdrop-blur-sm"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[64px] items-center">
            <div className="order-1 md:order-1 aspect-[3/4] bg-[#f0a878] border border-black/10 flex items-center justify-center overflow-hidden">
               <div className="w-[80%] h-[80%] rounded-full border border-black/10 border-dashed animate-[spin_60s_linear_infinite]"></div>
            </div>
            <div className="order-2 md:order-2">
              <p className="text-[12px] uppercase tracking-[0.08em] text-[#888888] mb-6 font-medium">Simplicity</p>
              <h2 className={`text-[#000000] text-[64px] md:text-[120px] font-[700] uppercase leading-[0.85] tracking-tighter mb-8 ${headingFont}`}>
                NO NOISE.
              </h2>
              <p className="text-[26px] leading-[1.15] text-[#111111]">
                Focus on the practice. We handle the infrastructure, hosting, and contact routing seamlessly.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7 — FINAL CTA */}
      <section className="py-[140px] bg-[#fafafa] border-t border-black/10 text-center">
        <div className="max-w-[720px] mx-auto px-6 flex flex-col items-center">
          <h2 className={`text-[#000000] text-[80px] md:text-[225px] font-[700] uppercase leading-[0.78] tracking-tighter mb-12 ${headingFont}`}>
            BEGIN.
          </h2>
          <a href="#join" className="inline-flex items-center justify-center bg-[#f07830] text-[#111111] px-[32px] py-[16px] text-[18px] font-[500] rounded-[8px] hover:brightness-110 transition-all duration-150 mb-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f07830]">
            Claim your Card
          </a>
          <p className="text-[#888888] text-[13px] tracking-[0.08em] uppercase font-medium">
            Free plan · No credit card required
          </p>
        </div>
      </section>

      {/* SECTION 8 — FOOTER */}
      <footer className="bg-[#f2f2f2] border-t border-black/10 pt-[96px] pb-[48px]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[64px] mb-[96px]">
            <div className="md:col-span-2">
              <a href="#" className={`text-[#000000] text-[32px] tracking-tight font-[700] uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830] ${headingFont}`}>
                Gallery.
              </a>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[#888888] font-medium mb-4">Platform</span>
              <a href="#" className="text-[16px] font-medium hover:text-[#f07830] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830] w-fit">About</a>
              <a href="#" className="text-[16px] font-medium hover:text-[#f07830] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830] w-fit">Features</a>
              <a href="#" className="text-[16px] font-medium hover:text-[#f07830] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830] w-fit">Pricing</a>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[#888888] font-medium mb-4">Resources</span>
              <a href="#" className="text-[16px] font-medium hover:text-[#f07830] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830] w-fit">Journal</a>
              <a href="#" className="text-[16px] font-medium hover:text-[#f07830] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830] w-fit">Help Center</a>
              <a href="#" className="text-[16px] font-medium hover:text-[#f07830] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830] w-fit">Contact</a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[24px] pt-[32px] border-t border-black/10">
            <p className="text-[12px] font-mono text-[#888888]">
              © {new Date().getFullYear()} FOLLOW.ART INC.
            </p>
            <div className="flex flex-wrap gap-[32px]">
              <a href="#" className="text-[12px] font-mono text-[#888888] hover:text-[#f07830] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830]">PRIVACY</a>
              <a href="#" className="text-[12px] font-mono text-[#888888] hover:text-[#f07830] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07830]">TERMS</a>
            </div>
          </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

    </div>
  );
};
