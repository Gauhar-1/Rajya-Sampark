'use client';

import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Activity, Target, ShieldAlert } from 'lucide-react';
import gsap from 'gsap';

// Note: Ensure your inner components adapt to dark mode / transparent backgrounds
import { AppHeader } from './AppHeader';
import { LeftSidebarNav } from './LeftSidebarNav';
import { RightSidebarContent } from './RightSidebarContent';


interface AppLayoutProps {
  children: React.ReactNode;
  modal?: React.ReactNode;
}

export function AppLayout({ children, modal }: AppLayoutProps) {
  const pathname = usePathname();
  const isNoLayoutPage = pathname === '/' || pathname === '/login';

  const layoutRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLElement>(null);
  
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);

  // GSAP 3D Spatial Animations
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Left Menu: 3D Canvas Push
      if (isLeftOpen) {
        gsap.to(canvasRef.current, {
          scale: 0.9,
          x: window.innerWidth >= 1024 ? 350 : 280,
          rotateY: -4,
          borderRadius: "2rem",
          boxShadow: "-20px 0 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.3)",
          transformPerspective: 1500,
          duration: 0.8,
          ease: "power4.out"
        });
      } else {
        gsap.to(canvasRef.current, {
          scale: 1,
          x: 0,
          rotateY: 0,
          borderRadius: "0rem",
          boxShadow: "none",
          duration: 0.6,
          ease: "power3.inOut"
        });
      }

      // 2. Right Panel: Tactical Slide & Blur
      if (isRightOpen) {
        gsap.to(rightPanelRef.current, {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "expo.out"
        });
      } else {
        gsap.to(rightPanelRef.current, {
          x: 500, // Push off screen
          opacity: 0,
          duration: 0.5,
          ease: "power3.in"
        });
      }
    }, layoutRef);

    return () => ctx.revert();
  }, [isLeftOpen, isRightOpen]);

  // Lock body scroll when layout is manipulating the canvas
  useEffect(() => {
    if (isLeftOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [isLeftOpen]);

  // Bypass for Landing / Login
  if (isNoLayoutPage) {
    return <>{children}{modal}</>;
  }

  return (
    <div ref={layoutRef} className="relative w-full h-screen bg-[#030303] text-slate-100 overflow-hidden selection:bg-amber-500 selection:text-black">
      
      {/* ========================================================
          THE UNDERGROUND: Left Sidebar Navigation
          (This lives fixed beneath the main canvas)
          ======================================================== */}
      <div className="absolute top-0 left-0 w-[350px] h-full pt-24 px-8 pb-8 z-0 flex flex-col justify-between">
        <div>
          <div className="text-amber-500 font-black text-2xl uppercase tracking-tighter mb-12">Rajyasampark.</div>
          {/* Your standard navigation links will render here */}
          <div className="opacity-90">
            <LeftSidebarNav />
          </div>
        </div>
        
        {/* Anti-Design Structural Decor */}
        <div className="text-xs font-mono text-white/20 uppercase tracking-widest border-t border-white/10 pt-4">
          SYS. V2.0.26 <br/>
          LAT: 24.8333 LON: 92.7789
        </div>
      </div>

      {/* ========================================================
          THE CANVAS: Main Application Viewport
          (This transforms in 3D space)
          ======================================================== */}
      <main 
        ref={canvasRef} 
        className="relative z-10 w-full h-full bg-[#080808] origin-left overflow-y-auto overflow-x-hidden border-l border-white/5"
      >
        {/* Cinematic Grid Overlay inside Canvas */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Floating Header (Replaces fixed AppHeader) */}
        <div className="sticky top-0 z-40 w-full p-4 md:p-6 pointer-events-none">
          <div className="flex justify-between items-center pointer-events-auto">
            
            {/* Left Menu Toggle */}
            <button 
              onClick={() => setIsLeftOpen(!isLeftOpen)}
              className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-colors shadow-2xl"
            >
              {isLeftOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Central Floating AppHeader (Search/Filters) */}
            <div className="hidden md:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 shadow-2xl">
              <AppHeader />
            </div>

            {/* Right Intel Toggle */}
            <button 
              onClick={() => setIsRightOpen(!isRightOpen)}
              className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-amber-500/50 transition-all shadow-2xl"
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">Live Intel</span>
                <span className="text-xs font-bold uppercase text-white/70 group-hover:text-white transition-colors">Toggle Feed</span>
              </div>
              <Activity className="w-5 h-5 text-amber-500" />
            </button>

          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-[1600px] mx-auto p-6 md:p-12 relative z-10 min-h-screen">
          {/* Anti-Design structural crosshairs framing the content */}
          <Target className="absolute top-10 left-10 w-6 h-6 text-white/10" />
          <Target className="absolute top-10 right-10 w-6 h-6 text-white/10" />
          
          <div className="mt-8">
            {children}
          </div>
        </div>
      </main>

      {/* ========================================================
          THE HUD OVERLAY: Right Sidebar (Intel Feed)
          (Absolute positioned, floating glass pane)
          ======================================================== */}
      <aside 
        ref={rightPanelRef}
        className="fixed top-6 right-6 bottom-6 w-[400px] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] z-50 p-6 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] translate-x-[500px] opacity-0"
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span className="font-black uppercase tracking-wider">Tactical Feed</span>
          </div>
          <button 
            onClick={() => setIsRightOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
          <RightSidebarContent />
        </div>
      </aside>

      {/* Global Modals overlaying everything */}
          {modal}

    </div>
  );
}