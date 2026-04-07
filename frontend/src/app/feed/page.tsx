'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, BarChart3, PlayCircle, PenTool, LayoutGrid } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import FeedList from '@/components/feed/FeedList';
import ErrorBoundary from '@/components/ErrorBoundary';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

// Dynamic forms
const CreatePostForm = dynamic(() => import('@/components/forms/CreatePostForm').then(mod => mod.CreatePostForm), { ssr: false });
const CreatePollForm = dynamic(() => import('@/components/forms/CreatePollForm').then(mod => mod.CreatePollForm), { ssr: false });
const CreateVideoForm = dynamic(() => import('@/components/forms/CreateVideoForm').then(mod => mod.CreateVideoForm), { ssr: false });

export default function HomePage() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const commandOrbRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Mechanical Magnetic Pull for the Action Button
  useEffect(() => {
    const orb = commandOrbRef.current;
    if (!orb) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = orb.getBoundingClientRect();
      const orbX = rect.left + rect.width / 2;
      const orbY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - orbX;
      const distanceY = e.clientY - orbY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      // Magnetic pull radius: 120px
      if (distance < 120) {
        gsap.to(orb, {
          x: distanceX * 0.3,
          y: distanceY * 0.3,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(orb, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // 1. Structural Title Reveal
      gsap.from(".header-element", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "expo.out",
        delay: 0.2
      });

      // 2. Parallax Background Anchor
      gsap.to(bgTextRef.current, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSuccess = () => {
    setActiveDialog(null);
    queryClient.invalidateQueries({ queryKey: ['feed'] });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-[#030303] overflow-hidden font-sans">
      
      {/* =========================================
          BACKGROUND: EDITORIAL GRID (Structural)
          ========================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden opacity-[0.03]">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', 
            backgroundSize: '100px 100px' 
          }} 
        />
        <div ref={bgTextRef} className="text-[18vw] font-black uppercase tracking-tighter leading-none text-white whitespace-nowrap select-none">
          COMMUNITY
        </div>
      </div>

      {/* =========================================
          FOREGROUND: THE PAGE WRAPPER
          ========================================= */}
      <div className="relative z-10 w-full pt-16">
        
        {/* Editorial Context Header */}
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-white/20 pb-8">
            
            <div className="header-element">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Live Updates</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.8] text-white">
                Local <br/>
                <span className="text-white/50">Editions</span>
              </h1>
            </div>
            
            <div className="header-element mt-8 md:mt-0 text-left md:text-right flex flex-col md:items-end">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2 border-b border-white/10 pb-1 inline-block">
                Public Record
              </div>
              <div className="text-2xl font-black text-white">
                Silchar, Assam
              </div>
            </div>

          </div>
        </div>

        {/* The Feed (Newspaper Pages render inside here) */}
        <ErrorBoundary>
          <div className="w-full">
            <FeedList />
          </div>
        </ErrorBoundary>

      </div>

      {/* =========================================
          THE DRAFTING TOOL (Magnetic FAB)
          Plain English, stark, highly functional
          ========================================= */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div ref={commandOrbRef} className="relative group pointer-events-auto">
          
          {/* Main Action Block */}
          <button 
            onClick={() => setActiveDialog('post')}
            className="relative w-16 h-16 bg-white text-black flex items-center justify-center border-4 border-black shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-20 hover:scale-95 transition-transform duration-300"
          >
            <Plus className="w-8 h-8 stroke-[4] group-hover:rotate-90 transition-transform duration-500 ease-out" />
          </button>

          {/* Mechanical Expansion Actions */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-10">
            
            {/* Video Option */}
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveDialog('video'); }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 bg-[#111] border border-white/20 px-4 flex items-center gap-2 text-white/50 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-x-[130px] transition-all duration-400 ease-out hover:bg-white hover:text-black pointer-events-auto shadow-xl"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Video</span>
            </button>

            {/* Poll Option */}
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveDialog('poll'); }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 bg-[#111] border border-white/20 px-4 flex items-center gap-2 text-white/50 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-[60px] transition-all duration-400 ease-out hover:bg-white hover:text-black pointer-events-auto shadow-xl"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Poll</span>
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* =========================================
          EDITORIAL DIALOGS
          Stark, high contrast, clean forms
          ========================================= */}
      <Dialog open={activeDialog !== null} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="bg-[#050505] border-4 border-white sm:max-w-[600px] p-0 rounded-none overflow-hidden shadow-2xl">
          
          <div className="px-8 py-6 border-b-2 border-white flex justify-between items-center bg-white text-black">
            <div className="flex items-center gap-4">
              <LayoutGrid className="w-6 h-6" />
              <div>
                <h2 className="font-black uppercase tracking-tight text-2xl leading-none mb-1">
                  {activeDialog === 'post' && 'Create a Post'}
                  {activeDialog === 'video' && 'Upload Video'}
                  {activeDialog === 'poll' && 'Start a Poll'}
                </h2>
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-60">Public Community Board</p>
              </div>
            </div>
          </div>

          <div className="p-8 text-white max-h-[80vh] overflow-y-auto custom-scrollbar">
            {activeDialog === 'post' && <CreatePostForm onSubmitSuccess={handleSuccess} onOpenChange={() => setActiveDialog(null)} />}
            {activeDialog === 'video' && <CreateVideoForm onSubmitSuccess={handleSuccess} onOpenChange={() => setActiveDialog(null)} />}
            {activeDialog === 'poll' && <CreatePollForm onSubmitSuccess={handleSuccess} onOpenChange={() => setActiveDialog(null)} />}
          </div>
          
        </DialogContent>
      </Dialog>
    </div>
  );
}