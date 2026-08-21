import React, { useState, useEffect, useRef } from 'react';

export const TempoLanding: React.FC = () => {
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

    const particles: {x: number, y: number, vx: number, vy: number}[] = [];
    const particleCount = window.innerWidth < 768 ? 40 : 100;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(24, 48, 48, 0.05)';
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let dist = dx * dx + dy * dy;

          if (dist < 12000) {
            ctx.beginPath();
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

  const headingFont = "font-['HB_Set','Inter',sans-serif]";
  const bodyFont = "font-['Pilat','Inter',sans-serif]";

  return (
    <div className={`min-h-screen w-full text-left bg-[#f3f3f3] text-[#4d4d4d] ${bodyFont} selection:bg-[#0d0d0d] selection:text-[#ffffff] overflow-x-hidden`} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
      
      {/* SECTION 1 — HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-[#f3f3f3] border-b border-black/10' : 'bg-transparent'}`}>
        <div className="max-w-[1200px] mx-auto px-6 h-[65px] flex items-center justify-between">
          
          <div className="flex items-center gap-12">
            <a href="#" className={`text-[#0d0d0d] text-[22px] tracking-tight font-light ${headingFont} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d]`}>
              tempo
            </a>
            
            <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-[0.08em] uppercase text-[#909090]">
              {['Customer Stories', 'Ecosystem', 'Embedded Finance', 'Agentic Payments'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-[#0d0d0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d]">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="hidden md:block">
            <a href="#contact" className="inline-flex items-center justify-center bg-[#0d0d0d] text-[#ffffff] px-[24px] py-[9px] text-[16px] font-[450] tracking-[0.16px] rounded-none hover:brightness-110 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]">
              Contact us
            </a>
          </div>

          <button 
            className="md:hidden text-[#0d0d0d] min-h-[44px] min-w-[44px] flex items-center justify-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#f3f3f3] flex flex-col px-6 py-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center h-[65px] mb-12">
            <a href="#" className={`text-[#0d0d0d] text-[22px] tracking-tight font-light ${headingFont} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d]`}>
              tempo
            </a>
            <button 
              className="text-[#0d0d0d] min-h-[44px] min-w-[44px] flex items-center justify-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-6 text-[35px] font-light leading-none">
            {['Customer Stories', 'Ecosystem', 'Embedded Finance', 'Agentic Payments'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileMenuOpen(false)} className={`text-[#0d0d0d] ${headingFont} hover:opacity-60 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d]`}>
                {item}
              </a>
            ))}
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className={`mt-8 inline-flex items-center justify-center bg-[#0d0d0d] text-[#ffffff] px-[24px] py-[16px] text-[16px] font-[450] tracking-[0.16px] rounded-none hover:brightness-110 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]`}>
              Contact us
            </a>
          </nav>
        </div>
      )}

      {/* SECTION 2 — HERO */}
      <section className="relative h-[100svh] min-h-[600px] flex items-center pt-[65px] border-b border-black/10">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-[1200px] mx-auto px-6 w-full relative z-10">
          <div className="max-w-[720px]">
            <h1 className={`text-[#0d0d0d] text-[35px] md:text-[64px] font-[300] leading-[1] tracking-[-1.92px] mb-8 ${headingFont}`}>
              The blockchain for payments at scale
            </h1>
            <p className="text-[#484848] text-[18px] leading-[1.6] mb-10 max-w-[640px]">
              Tempo is a purpose-built, Layer 1 blockchain for payments, developed in partnership with leading fintechs and Fortune 500s. Tempo enables high-throughput, low-cost global settlement.
            </p>
            <div className="flex flex-wrap gap-[12px]">
              <a href="#build" className="inline-flex items-center justify-center bg-[#0d0d0d] text-[#ffffff] px-[24px] py-[9px] text-[16px] font-[450] tracking-[0.16px] rounded-none hover:brightness-110 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]">
                Start building
              </a>
              <a href="#contact" className="inline-flex items-center justify-center bg-transparent text-[#0d0d0d] px-[24px] py-[9px] text-[16px] font-[450] tracking-[0.16px] border border-[rgba(0,0,0,0.2)] rounded-none hover:bg-black/5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]">
                Read the docs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — SOCIAL PROOF */}
      <section className="bg-[#f0f0f0] border-b border-black/10 py-[64px] md:py-[96px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[#909090] mb-12 text-center font-medium">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-x-[48px] md:gap-x-[96px] gap-y-12 opacity-50 grayscale">
            {['Stripe', 'Square', 'Revolut', 'Coinbase', 'Plaid'].map((company) => (
              <span key={company} className={`text-[20px] md:text-[24px] font-[300] tracking-tight text-[#183030] ${headingFont}`}>
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — PROTOCOL STATS */}
      <section className="bg-[#183030] text-[#f3f3f3] py-[64px] md:py-[140px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <div className="flex flex-col border-t border-[#ffffff1a] pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8 first:border-none first:pl-0">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[#909090] mb-4">Total Value Locked</span>
              <span className={`text-[48px] md:text-[64px] font-[300] leading-[1] tracking-[-1.92px] text-[#ffffff] ${headingFont}`}>$4.2B+</span>
            </div>
            <div className="flex flex-col border-t border-[#ffffff1a] pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[#909090] mb-4">Transactions / Sec</span>
              <span className={`text-[48px] md:text-[64px] font-[300] leading-[1] tracking-[-1.92px] text-[#ffffff] ${headingFont}`}>65,000</span>
            </div>
            <div className="flex flex-col border-t border-[#ffffff1a] pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[#909090] mb-4">Active Validators</span>
              <span className={`text-[48px] md:text-[64px] font-[300] leading-[1] tracking-[-1.92px] text-[#ffffff] ${headingFont}`}>1,420</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — ECOSYSTEM GRID */}
      <section className="py-[64px] md:py-[140px] bg-[#f3f3f3] border-b border-black/10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-[64px]">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[#909090] mb-6 font-medium">Ecosystem</p>
            <h2 className={`text-[#0d0d0d] text-[35px] md:text-[64px] font-[300] leading-[1] tracking-[-1.92px] max-w-[600px] ${headingFont}`}>
              Built on Tempo
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] md:gap-[24px]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <a key={i} href="#" className="aspect-[4/3] bg-[#f0f0f0] border border-black/10 flex items-center justify-center p-6 hover:bg-[#e8e8e8] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]">
                <div className="w-[48px] h-[48px] rounded-full bg-[#c0c0c0] opacity-40"></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — FEATURE/VALUE */}
      <section className="py-[96px] md:py-[140px] bg-[#f3f3f3]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col gap-[96px] md:gap-[140px]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[48px] md:gap-[96px] items-center">
            <div className="order-2 md:order-1 flex flex-col">
              <p className="text-[12px] uppercase tracking-[0.08em] text-[#909090] mb-6 font-medium">Settlement</p>
              <h2 className={`text-[#0d0d0d] text-[35px] md:text-[64px] font-[300] leading-[1] tracking-[-1.92px] mb-6 ${headingFont}`}>
                Instant liquidity across borders.
              </h2>
              <p className="text-[#484848] text-[16px] leading-[1.6]">
                Eliminate Nostro/Vostro accounts and correspondent banking delays. Settle multi-currency transactions in under 400 milliseconds.
              </p>
            </div>
            <div className="order-1 md:order-2 aspect-square md:aspect-[4/3] bg-[#f0f0f0] border border-black/10 flex items-center justify-center overflow-hidden p-8">
               <div className="w-full h-full border border-black/10 relative flex flex-col bg-[#f3f3f3]">
                 <div className="h-[48px] border-b border-black/10 bg-[#e8e8e8] flex items-center px-4">
                   <div className="w-[120px] h-[8px] bg-[#c0c0c0] opacity-30"></div>
                 </div>
                 <div className="flex-1 p-6 flex flex-col gap-4">
                   <div className="w-[80%] h-[16px] bg-[#d0d0d0] opacity-20"></div>
                   <div className="w-[60%] h-[16px] bg-[#d0d0d0] opacity-20"></div>
                   <div className="w-[90%] h-[16px] bg-[#d0d0d0] opacity-20"></div>
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[48px] md:gap-[96px] items-center">
            <div className="order-1 md:order-1 aspect-square md:aspect-[4/3] bg-[#f0f0f0] border border-black/10 flex items-center justify-center overflow-hidden">
               <div className="w-[200px] h-[200px] border border-[#183030] opacity-30 rounded-full flex items-center justify-center">
                  <div className="w-[100px] h-[100px] bg-[#183030] opacity-20 rounded-full flex items-center justify-center">
                     <div className="w-[16px] h-[16px] bg-[#183030] rounded-full"></div>
                  </div>
               </div>
            </div>
            <div className="order-2 md:order-2 flex flex-col">
              <p className="text-[12px] uppercase tracking-[0.08em] text-[#909090] mb-6 font-medium">Compliance</p>
              <h2 className={`text-[#0d0d0d] text-[35px] md:text-[64px] font-[300] leading-[1] tracking-[-1.92px] mb-6 ${headingFont}`}>
                Programmable rule enforcement.
              </h2>
              <p className="text-[#484848] text-[16px] leading-[1.6]">
                Embed KYC, AML, and reporting requirements directly into the transaction logic. Transactions only clear when compliant.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[48px] md:gap-[96px] items-center">
            <div className="order-2 md:order-1 flex flex-col">
              <p className="text-[12px] uppercase tracking-[0.08em] text-[#909090] mb-6 font-medium">Infrastructure</p>
              <h2 className={`text-[#0d0d0d] text-[35px] md:text-[64px] font-[300] leading-[1] tracking-[-1.92px] mb-6 ${headingFont}`}>
                Built for institutional scale.
              </h2>
              <p className="text-[#484848] text-[16px] leading-[1.6]">
                Enterprise-grade hardware requirements ensure network stability. Process volume equivalent to major card networks without fee spikes.
              </p>
            </div>
            <div className="order-1 md:order-2 aspect-square md:aspect-[4/3] bg-[#f0f0f0] border border-black/10 flex items-center justify-center overflow-hidden">
               <div className="grid grid-cols-4 gap-[8px] w-[60%] h-[60%]">
                 {Array.from({ length: 16 }).map((_, i) => (
                   <div key={i} className="bg-[#c0c0c0] opacity-[0.15] border border-black/10 rounded-[2px] transition-opacity duration-1000" style={{ animationDelay: `${i * 100}ms` }}></div>
                 ))}
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7 — FINAL CTA */}
      <section className="py-[96px] md:py-[140px] bg-[#f0f0f0] border-t border-black/10 text-center">
        <div className="max-w-[800px] mx-auto px-6 flex flex-col items-center">
          <h2 className={`text-[#0d0d0d] text-[35px] md:text-[64px] font-[300] leading-[1] tracking-[-1.92px] mb-10 ${headingFont}`}>
            Upgrade your payments infrastructure
          </h2>
          <a href="#contact" className="inline-flex items-center justify-center bg-[#0d0d0d] text-[#ffffff] px-[24px] py-[9px] text-[16px] font-[450] tracking-[0.16px] rounded-none hover:brightness-110 transition-all duration-150 mb-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]">
            Contact us
          </a>
          <p className="text-[#909090] text-[13px] tracking-[0.08em] uppercase font-medium">
            Free plan · No credit card required
          </p>
        </div>
      </section>

      {/* SECTION 8 — FOOTER */}
      <footer className="bg-[#f0f0f0] border-t border-black/10 pt-[64px] md:pt-[96px] pb-[32px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[48px] md:gap-[32px] mb-[64px] md:mb-[96px]">
            <div className="md:col-span-2">
              <a href="#" className={`text-[#0d0d0d] text-[22px] tracking-tight font-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d] ${headingFont}`}>
                tempo
              </a>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[#909090] font-medium mb-2">Product</span>
              <a href="#" className="text-[#484848] text-[14px] hover:text-[#0d0d0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d] w-fit">Settlement</a>
              <a href="#" className="text-[#484848] text-[14px] hover:text-[#0d0d0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d] w-fit">Compliance</a>
              <a href="#" className="text-[#484848] text-[14px] hover:text-[#0d0d0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d] w-fit">Documentation</a>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[#909090] font-medium mb-2">Company</span>
              <a href="#" className="text-[#484848] text-[14px] hover:text-[#0d0d0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d] w-fit">About</a>
              <a href="#" className="text-[#484848] text-[14px] hover:text-[#0d0d0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d] w-fit">Careers</a>
              <a href="#" className="text-[#484848] text-[14px] hover:text-[#0d0d0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d] w-fit">Contact</a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[24px] pt-[32px] border-t border-black/10">
            <p className="text-[12px] text-[#909090]">
              © {new Date().getFullYear()} Tempo Technologies. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-[24px]">
              <a href="#" className="text-[12px] text-[#909090] hover:text-[#0d0d0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d]">Privacy Policy</a>
              <a href="#" className="text-[12px] text-[#909090] hover:text-[#0d0d0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0d0d]">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
