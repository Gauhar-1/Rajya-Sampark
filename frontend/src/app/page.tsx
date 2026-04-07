"use client";

import React, { useLayoutEffect, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, ShieldAlert, Fingerprint, Activity, 
  Crosshair, Users, ChevronDown
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Utility: Split text for character animations (Kinetic Typography)
const splitText = (text: string) => {
  return text.split('').map((char, i) => (
    <span key={i} className="inline-block narrative-char opacity-20 relative">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));
};

export default function PrincipalLandingPage() {
  const masterRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  
  // Custom Smooth Cursor Logic
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Instant dot
      gsap.set(cursorDotRef.current, { x: mouseX, y: mouseY });
    };

    // Smooth trailing ring
    const render = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      gsap.set(cursorRef.current, { x: cursorX, y: cursorY });
      requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove);
    const ticker = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(ticker);
    };
  }, []);

  // Main GSAP Orchestration
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // 1. HERO ENTRY: Brutalist scale down
      const heroTl = gsap.timeline();
      heroTl.from(".hero-word", {
        yPercent: 100,
        opacity: 0,
        rotateX: -45,
        stagger: 0.1,
        duration: 1.5,
        ease: "power4.out",
        transformOrigin: "bottom center",
      })
      .to(".hero-scroll-indicator", { opacity: 1, y: 10, repeat: -1, yoyo: true, duration: 1 }, "-=0.5");

      // 2. KINETIC NARRATIVE SCRUBBING
      gsap.utils.toArray('.narrative-char').forEach((char: any) => {
        gsap.to(char, {
          opacity: 1,
          color: "#F59E0B", // Amber
          scrollTrigger: {
            trigger: char,
            start: "top 60%",
            end: "top 40%",
            scrub: true,
          }
        });
      });

      // 3. THE HORIZONTAL SCROLL (Bulletproof Wrapper Method)
      const horizontalContainer = horizontalRef.current;
      const horizontalWrapper = horizontalContainer?.querySelector(".h-panel-wrapper");

      if (horizontalContainer && horizontalWrapper) {
        gsap.to(horizontalWrapper, {
          x: () => -(horizontalWrapper.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: horizontalContainer,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true, // Recalculates exact widths on window resize
            end: () => "+=" + horizontalWrapper.scrollWidth
          }
        });
      }

      // 4. BENTO GRID PARALLAX
      gsap.from(".bento-item", {
        scrollTrigger: {
          trigger: ".bento-section",
          start: "top 80%",
        },
        y: 150,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "power4.out"
      });

    }, masterRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={masterRef} className="bg-[#030303] text-white min-h-screen font-sans cursor-none selection:bg-amber-500 selection:text-black">
      
      {/* --- CUSTOM CURSORS --- */}
      <div ref={cursorDotRef} className="fixed top-0 left-0 w-2 h-2 bg-amber-500 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" />
      <div ref={cursorRef} className="fixed top-0 left-0 w-10 h-10 border border-amber-500/50 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out" />

      {/* --- MINIMAL NAV --- */}
      <nav className="fixed top-0 w-full z-50 mix-blend-difference px-8 py-6 flex justify-between items-center pointer-events-none">
        <div className="text-xl font-black tracking-tighter uppercase pointer-events-auto">Rajyasampark.</div>
        <Link href="/login" className="pointer-events-auto text-xs font-bold uppercase tracking-widest border-b border-white/30 pb-1 hover:text-amber-500 hover:border-amber-500 transition-colors">
          Access Terminal
        </Link>
      </nav>

      {/* =========================================
          ACT I: THE HOOK (HERO)
          ========================================= */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Dynamic ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <h1 className="text-[12vw] leading-[0.85] font-black uppercase tracking-tighter text-center flex flex-col items-center z-10">
          <div className="overflow-hidden pb-4"><span className="hero-word inline-block">Democracy</span></div>
          <div className="overflow-hidden pb-4"><span className="hero-word inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Shouldn't Wait.</span></div>
        </h1>
        
        <div className="hero-scroll-indicator absolute bottom-10 opacity-0 flex flex-col items-center gap-2 text-white/30 text-xs font-bold tracking-widest uppercase">
          <span>Scroll to Activate</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* =========================================
          ACT II: THE KINETIC NARRATIVE
          ========================================= */}
      <section className="py-40 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black uppercase leading-[1.2] tracking-tight">
          {splitText("For decades, local issues vanished into bureaucratic voids. A broken road. A dry tap. A failing streetlight. You complained, but nothing changed. Rajyasampark re-engineers accountability through mathematics and community consensus.")}
        </h2>
      </section>

      {/* =========================================
          ACT III: HORIZONTAL SCROLLYTELLING
          ========================================= */}
      <section ref={horizontalRef} className="h-screen w-full overflow-hidden bg-[#0a0a0a] border-y border-white/5 relative z-10">
        
        <div className="h-panel-wrapper flex h-full w-[300vw]">
          
          {/* Panel 1 */}
          <div className="w-screen h-full shrink-0 flex items-center justify-center p-12 relative">
            <div className="absolute top-12 left-12 text-[10vw] font-black text-white/5">01</div>
            <div className="max-w-3xl">
              <h2 className="text-6xl md:text-8xl font-black mb-8 uppercase leading-[0.9]">The Issue<br/><span className="text-amber-500">Network.</span></h2>
              <p className="text-2xl text-slate-400 mb-8">Stop waiting. Post local grievances using the <strong className="text-white">#issue</strong> tag. Location-based feeds ensure you only see what matters to your street.</p>
            </div>
          </div>

          {/* Panel 2 */}
          <div className="w-screen h-full shrink-0 flex items-center justify-center p-12 bg-amber-500 text-black relative">
            <div className="absolute top-12 left-12 text-[10vw] font-black text-black/10">02</div>
            <div className="max-w-3xl">
              <h2 className="text-6xl md:text-8xl font-black mb-8 uppercase leading-[0.9]">The 50%<br/>Rule.</h2>
              <p className="text-2xl font-medium mb-8">If half the active users in your area upvote the issue, it becomes a verified mandate. Candidates are forced to listen.</p>
              {/* Playful UI Element */}
              <div className="bg-black/10 p-6 rounded-2xl backdrop-blur-md border border-black/20">
                <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden">
                  <div className="w-[50%] h-full bg-black relative">
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-amber-500 font-bold">VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3 */}
          <div className="w-screen h-full shrink-0 flex items-center justify-center p-12 relative">
            <div className="absolute top-12 left-12 text-[10vw] font-black text-white/5">03</div>
            <div className="max-w-3xl">
              <h2 className="text-6xl md:text-8xl font-black mb-8 uppercase leading-[0.9]">Track<br/><span className="text-emerald-500">Resolution.</span></h2>
              <p className="text-2xl text-slate-400 mb-8">Volunteers deploy. Candidates approve. You track the progress in real-time until the issue is eradicated.</p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          ACT IV: THE ECOSYSTEM (BENTO GRID)
          ========================================= */}
      <section className="bento-section py-40 px-6 max-w-[1400px] mx-auto">
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-16">
          Choose Your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Faction.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
          
          {/* THE VOTER */}
          <div className="bento-item bg-[#111] rounded-[2rem] border border-white/10 p-10 flex flex-col justify-between group hover:border-white/30 transition-colors">
            <div className="flex justify-between items-start">
              <Fingerprint className="w-12 h-12 text-white/20 group-hover:text-amber-500 transition-colors duration-500" />
              <div className="text-xs font-mono bg-white/5 px-3 py-1 rounded-full uppercase">Free Access</div>
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase mb-4">The Citizen</h3>
              <p className="text-white/50 mb-8">Access the local feed. Flag issues. Rally your neighbors to hit the 50% mandate. Force the system to work for you.</p>
              <Link href="/login?role=voter" className="inline-flex items-center gap-2 font-bold uppercase tracking-wide hover:text-amber-500 transition-colors">
                Enter Network <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* THE CANDIDATE (SaaS Focus) */}
          <div className="bento-item md:col-span-2 bg-gradient-to-br from-amber-600 to-amber-900 rounded-[2rem] border border-amber-500/50 p-10 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-white/10 transition-colors duration-700" />
            <div className="relative z-10 flex justify-between items-start">
              <ShieldAlert className="w-12 h-12 text-black" />
              <div className="text-xs font-black bg-black text-amber-500 px-3 py-1 rounded-full uppercase tracking-widest">Premium SaaS</div>
            </div>
            <div className="relative z-10 md:w-2/3">
              <h3 className="text-4xl font-black uppercase mb-4 text-black">The Candidate</h3>
              <p className="text-black/70 font-medium mb-8 text-lg">Your opponents are using this. Build your digital war room, manage volunteer fleets, and create a verified track record of solved issues to win the next election.</p>
              
              <div className="flex gap-4">
                <Link href="/pricing" className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
                  View Packages
                </Link>
              </div>
            </div>
          </div>

          {/* THE VOLUNTEER */}
          <div className="bento-item md:col-span-3 bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-10 flex flex-col md:flex-row items-center gap-12 group hover:bg-[#111] transition-colors">
            <div className="bg-white/5 p-8 rounded-full">
              <Users className="w-20 h-20 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-mono text-amber-500 mb-4 tracking-widest uppercase">Employment Opportunity</div>
              <h3 className="text-4xl font-black uppercase mb-4">The Volunteer Force</h3>
              <p className="text-white/50 text-lg max-w-3xl mb-8">
                Turn your passion for your city into a profession. Candidates are hiring local strategists, marketers, and ground-level operatives right now through our portal.
              </p>
              <Link href="/login?role=volunteer" className="inline-flex items-center gap-2 text-amber-500 font-bold uppercase tracking-wide hover:text-white transition-colors">
                Apply for Deployment <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          ACT V: THE RESOLUTION (FOOTER CTA)
          ========================================= */}
      <section className="relative py-40 overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center opacity-5 pointer-events-none whitespace-nowrap">
          <h2 className="text-[20vw] font-black uppercase tracking-tighter">EXECUTE.</h2>
        </div>
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-black uppercase mb-10">System Ready.</h2>
          <Link href="/login" className="bg-amber-500 text-black px-16 py-6 rounded-full font-black text-2xl uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_0_50px_rgba(245,158,11,0.3)]">
            Initialize
          </Link>
        </div>
      </section>

      {/* FOOTER METADATA */}
      <footer className="px-8 py-6 border-t border-white/10 flex justify-between items-center text-xs font-mono text-white/30 uppercase">
        <div>Rajyasampark // v2.0.26</div>
        <div>Engineered in India</div>
      </footer>

    </div>
  );
}