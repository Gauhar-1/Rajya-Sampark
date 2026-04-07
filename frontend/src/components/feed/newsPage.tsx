'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { Share2, ArrowBigRight, MessageSquare, PenTool } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export default function NewspaperPage({ item, index }: { item: any, index: number }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [isEndorsed, setIsEndorsed] = useState(false);

  const isIssue = item.content?.toLowerCase().includes('#issue') || item.isIssue;
  const pageNumber = (index + 1).toString().padStart(2, '0');
  const wordCount = item.description?.split(' ').length || item.content?.split(' ').length || 0;

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Typewriter / Press impact animation for the headline
      gsap.from(".press-char", {
        opacity: 0,
        scale: 1.5,
        y: 20,
        stagger: 0.01,
        duration: 0.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: pageRef.current,
          start: "top 65%",
        }
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleEndorse = () => {
    setIsEndorsed(!isEndorsed);
    if (!isEndorsed) {
      // Physical "Stamp" slamming down animation
      gsap.fromTo(stampRef.current,
        { scale: 4, opacity: 0, rotation: 15 },
        { scale: 1, opacity: 1, rotation: -4, duration: 0.4, ease: "back.out(1.5)" }
      );
    }
  };

  return (
    <div ref={pageRef} className="relative w-full max-w-[1400px] mx-auto bg-[#050505] border-y-8 border-white paper-grain overflow-hidden">
      
      {/* 1. THE FOLIO (Masthead & Registration Marks) */}
      <div className="flex justify-between items-center border-b-2 border-white/20 px-8 py-3 uppercase font-mono text-[10px] tracking-[0.2em] text-white/50">
        <div className="flex gap-8">
          <span>Edition {new Date().getFullYear()}</span>
          <span>Silchar Region</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-white/30 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-amber-500 rounded-full" />
          </div>
          <span>Post ID: {item._id.slice(-6)}</span>
        </div>
        <div className="flex gap-8 text-right">
          <span>Words: {wordCount}</span>
          <span>{new Date(item.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* 2. THE EDITORIAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Sidebar: The Byline */}
        <div className="lg:col-span-2 border-r-2 border-white/20 p-8 flex flex-col justify-between hidden lg:flex relative">
          <div>
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/20 overflow-hidden mb-6 filter grayscale hover:grayscale-0 contrast-125">
              {item.profileId?.photoURL && <img src={item.profileId.photoURL} className="w-full h-full object-cover" />}
            </div>
            <h3 className="font-black uppercase text-xl leading-none mb-2">{item.profileId?.name}</h3>
            <p className="font-mono text-[9px] uppercase tracking-widest text-amber-500">Community Member</p>
          </div>
          
          <div className="text-vertical rotate-180 font-black uppercase text-6xl text-white/5 tracking-tighter mix-blend-overlay pointer-events-none">
            POST {pageNumber}
          </div>
        </div>

        {/* Center/Right: The Article Space */}
        <div className="lg:col-span-10 flex flex-col">
          
          {/* THE HEADLINE */}
          <div className="p-8 pb-12 border-b-2 border-white/20 relative">
            {isIssue && (
              <div className="inline-block bg-amber-500 text-black px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em] mb-6">
                Verified Local Issue
              </div>
            )}
            <h1 className="text-[12vw] lg:text-[7.5vw] font-black leading-[0.75] uppercase tracking-tighter text-white break-words text-justify">
              {item.content?.split('').map((char: string, i: number) => (
                <span key={i} className="press-char inline-block">{char === ' ' ? '\u00A0' : char}</span>
              ))}
            </h1>
          </div>

          {/* THE BODY & MEDIA */}
          <div className="flex flex-col lg:flex-row flex-1">
            
            {/* The Text Columns */}
            <div className="lg:w-1/2 p-8 border-r-2 border-white/20">
              <div className="text-justify text-sm text-white/70 leading-[1.8] font-medium first-letter:text-8xl first-letter:font-black first-letter:text-white first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:leading-[0.75]">
                {item.description || "The community has brought attention to this matter. Based on the responses gathered, this is a priority requirement for our neighborhood. We need local leaders and citizens to review the details and verify the importance of this issue so it can be officially tracked and resolved."}
                <br /><br />
                This is a public post. Every interaction is recorded to help community leaders understand local needs.
              </div>

              {/* INTERACTIVE ACTION: Commenting */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <button className="group w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-colors duration-300">
                  <div className="flex items-center gap-4">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-black uppercase tracking-widest text-xs">Read Comments</span>
                  </div>
                  <span className="font-mono text-xs opacity-50 group-hover:opacity-100">[{item.comments || 0} Total]</span>
                </button>
              </div>
            </div>

            {/* The Media & Action Section */}
            <div className="lg:w-1/2 flex flex-col">
              
              {/* Media Block (Grayscale to Color on Hover) */}
              {item.mediaUrl ? (
                <div className="relative h-[400px] lg:h-auto lg:flex-1 border-b-2 border-white/20 group overflow-hidden bg-black/50">
                  <img 
                    ref={imageRef}
                    src={item.mediaUrl} 
                    className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 ease-out" 
                  />
                  {/* Print Registration Marks overlay */}
                  <div className="absolute inset-4 border border-white/20 pointer-events-none mix-blend-overlay flex justify-between p-2">
                    <div className="w-2 h-2 border-t border-l border-white" />
                    <div className="w-2 h-2 border-t border-r border-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-black text-amber-500 px-3 py-1 font-mono text-[9px] uppercase border-t border-l border-white/20">
                    Attached Photo
                  </div>
                </div>
              ) : (
                <div className="h-48 border-b-2 border-white/20 flex items-center justify-center text-white/10 font-black italic uppercase text-2xl tracking-tighter bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]">
                  [ No Photo Provided ]
                </div>
              )}

              {/* INTERACTIVE ACTIONS: Like & Share */}
              <div className="flex flex-1 min-h-[140px]">
                
                {/* Verify (Like) Button */}
                <button 
                  onClick={handleEndorse}
                  className="relative w-2/3 p-8 border-r-2 border-white/20 hover:bg-white/5 transition-colors text-left overflow-hidden group cursor-none"
                >
                  <div className="text-[10px] font-mono uppercase text-white/40 mb-2">Show Support</div>
                  <div className="font-black text-3xl uppercase tracking-tighter leading-none mb-1 group-hover:text-amber-500 transition-colors">
                    Agree with <br/>This Post
                  </div>
                  <div className="font-mono text-xs text-white/50 mt-4">Total Supporters: {item.likes + (isEndorsed ? 1 : 0)}</div>

                  {/* The Physical Stamp Graphic */}
                  <div 
                    ref={stampRef}
                    className={cn(
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-amber-500 text-amber-500 font-black uppercase text-4xl p-2 tracking-tighter rotate-[-15deg] mix-blend-screen pointer-events-none",
                      isEndorsed ? "opacity-100" : "opacity-0"
                    )}
                  >
                    SUPPORTED
                  </div>
                </button>

                {/* Share Button */}
                <button className="relative w-1/3 p-6 flex flex-col justify-between hover:bg-amber-500 hover:text-black transition-colors group border-dashed border-l-2 border-transparent">
                  <div className="w-full border-t-2 border-dashed border-white/20 group-hover:border-black/30 absolute top-0 left-0" />
                  
                  <Share2 className="w-6 h-6 opacity-50 group-hover:opacity-100" />
                  
                  <div>
                    <div className="font-black uppercase text-lg leading-none mb-1">Share</div>
                    <div className="text-[9px] font-mono uppercase opacity-50">Send to others</div>
                  </div>
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}