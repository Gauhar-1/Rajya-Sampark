"use client";

import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import gsap from 'gsap';
import { SignIn } from '@clerk/nextjs';

// Utility for high-end staggered typography animations
const splitText = (text: string) => {
  return text.split(' ').map((word, i) => (
    <span key={i} className="inline-block overflow-hidden pb-2 mr-3">
      <span className="title-word inline-block translate-y-[120%] opacity-0">{word}</span>
    </span>
  ));
};

export default function LoginPage() {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Smooth Cursor & Ambient Spotlight Logic
  // Smooth Cursor & Ambient Spotlight Logic
  useEffect(() => {
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    let frameId: number; // Store the active frame ID

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX; mouseY = e.clientY;
      setMousePos({ x: mouseX, y: mouseY });
    };

    const render = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      if(cursorRef.current) gsap.set(cursorRef.current, { x: cursorX, y: cursorY });
      
      // Continually update the frame ID
      frameId = requestAnimationFrame(render); 
    };

    window.addEventListener("mousemove", onMouseMove);
    frameId = requestAnimationFrame(render); 

    return () => { 
      window.removeEventListener("mousemove", onMouseMove); 
      // Successfully cancel the active loop
      cancelAnimationFrame(frameId); 
    };
  }, []);

  // Mount Animations
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Staggered Studio-Quality Text Reveal
      gsap.to(".title-word", {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.2
      });

      gsap.from(".fade-up", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.6
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] flex flex-col lg:flex-row text-white selection:bg-amber-500 selection:text-black cursor-none overflow-hidden relative font-sans">
      
      {/* --- Custom Cursor & Ambient Glow --- */}
      <div className="fixed top-0 left-0 w-2 h-2 bg-amber-500 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" style={{ left: mousePos.x, top: mousePos.y }} />
      <div ref={cursorRef} className="fixed top-0 left-0 w-10 h-10 border border-amber-500/40 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out" />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30" style={{ background: `radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.12), transparent 80%)` }} />

      {/* =========================================
          LEFT SIDE: THE STORY & CONTEXT
          ========================================= */}
      <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#080808] relative flex flex-col justify-between p-8 lg:p-16 z-10 min-h-[40vh] lg:min-h-screen">
        
        <div className="fade-up">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-amber-500 transition-colors font-bold text-xs uppercase tracking-widest mb-12">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="w-12 h-12 bg-amber-500 flex items-center justify-center text-black font-black text-2xl mb-12 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            R
          </div>
        </div>
        
        <div className="mb-auto mt-8 lg:mt-0">
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            {splitText("Your City.")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              {splitText("Your Voice.")}
            </span>
          </h1>
          <p className="fade-up text-white/60 text-lg md:text-xl max-w-md font-medium leading-relaxed">
            Log in to connect with your local representatives, raise community issues, and drive real change in your neighborhood.
          </p>
        </div>

        <div className="fade-up mt-12 hidden lg:flex items-center gap-4 border-t border-white/10 pt-8">
          <div className="flex -space-x-3">
            {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#080808] bg-white/10 flex items-center justify-center"><Users className="w-4 h-4 text-white/50"/></div>)}
          </div>
          <p className="text-sm font-medium text-white/50">Join <strong className="text-white">thousands</strong> of citizens <br/>shaping their local districts.</p>
        </div>
      </div>

      {/* =========================================
          RIGHT SIDE: CLERK SIGN-IN
          ========================================= */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-8 lg:p-16 relative z-10">
        <div ref={formWrapperRef} className="w-full max-w-[440px] relative fade-up">
           <SignIn 
             signUpUrl="/sign-up"
             appearance={{
               elements: {
                 rootBox: "w-full",
                 card: "bg-[#0a0a0a] border border-white/10 shadow-2xl rounded-[2rem]",
                 headerTitle: "text-white",
                 headerSubtitle: "text-white/50",
                 socialButtonsBlockButton: "border-white/10 text-white hover:bg-white/5",
                 socialButtonsBlockButtonText: "font-bold",
                 dividerLine: "bg-white/10",
                 dividerText: "text-white/50",
                 formFieldLabel: "text-white/80 font-bold",
                 formFieldInput: "bg-[#111] border-white/10 text-white focus:border-amber-500 rounded-xl",
                 formButtonPrimary: "bg-amber-500 hover:bg-amber-600 text-black font-black",
                 footerActionText: "text-white/50",
                 footerActionLink: "text-amber-500 hover:text-amber-400"
               }
             }}
           />
        </div>
      </div>
    </div>
  );
}