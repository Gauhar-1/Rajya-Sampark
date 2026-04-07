'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { CalendarDays, AlertTriangle, Info, Clock, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import type { ElectionEvent } from '@/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isPast } from 'date-fns';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// INDIVIDUAL TIMELINE NODE
// ==========================================
function TimelineNode({ event, index }: { event: ElectionEvent; index: number }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  
  const eventDate = new Date(event.date);
  const past = isPast(eventDate);
  const isDeadline = event.type === 'Deadline';
  const isKey = event.type === 'Key Event';

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(nodeRef.current,
        { opacity: 0, x: -30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.8, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: nodeRef.current,
            start: "top 85%",
          }
        }
      );
    }, nodeRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={nodeRef} className="relative pl-8 md:pl-0 w-full mb-16 md:mb-24 group">
      
      {/* THE DESKTOP GRID LAYOUT */}
      <div className="md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8 items-start w-full">
        
        {/* LEFT COLUMN: Date & Time (Desktop) */}
        <div className="hidden md:flex flex-col items-end text-right pt-2">
          <div className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white group-hover:text-amber-500 transition-colors duration-500">
            {format(eventDate, 'MMM dd')}
          </div>
          <div className="text-lg font-bold text-white/50 mb-2">
            {format(eventDate, 'yyyy')}
          </div>
          <div className={cn(
            "text-[10px] font-mono uppercase tracking-widest px-3 py-1 border inline-block",
            past ? "border-white/10 text-white/30" : "border-amber-500/30 text-amber-500 bg-amber-500/5"
          )}>
            {past ? 'Archived' : formatDistanceToNow(eventDate, { addSuffix: true })}
          </div>
        </div>

        {/* CENTER COLUMN: The Axis Node */}
        <div className="absolute left-0 md:relative md:flex flex-col items-center justify-start h-full z-10">
          <div className={cn(
            "w-4 h-4 rounded-full border-2 bg-[#050505] flex items-center justify-center mt-3 md:mt-4 transition-all duration-500 group-hover:scale-150",
            isDeadline ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : 
            isKey ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" : 
            "border-white/30 group-hover:border-white"
          )}>
            {!past && isDeadline && <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />}
            {!past && !isDeadline && <div className="w-1 h-1 bg-amber-500 rounded-full" />}
          </div>
        </div>

        {/* RIGHT COLUMN: The Content Ledger */}
        <div className="pt-0 md:pt-2 pb-8 md:pb-0">
          
          {/* Mobile Date Header (Hidden on Desktop) */}
          <div className="md:hidden flex items-baseline gap-3 mb-4">
            <div className="text-3xl font-black uppercase tracking-tighter text-white">
              {format(eventDate, 'MMM dd')}
            </div>
            <div className="text-sm font-bold text-white/50">{format(eventDate, 'yyyy')}</div>
          </div>

          {/* The Content Plate */}
          <div className={cn(
            "p-6 md:p-8 rounded-2xl border backdrop-blur-md transition-all duration-500",
            isDeadline ? "bg-red-500/5 border-red-500/20 group-hover:border-red-500/50" :
            isKey ? "bg-amber-500/5 border-amber-500/20 group-hover:border-amber-500/50" :
            "bg-white/[0.02] border-white/10 group-hover:border-white/30 group-hover:bg-white/5"
          )}>
            <div className="flex items-center gap-3 mb-4">
              {isDeadline ? <AlertTriangle className="w-4 h-4 text-red-500" /> : 
               isKey ? <Info className="w-4 h-4 text-amber-500" /> : 
               <CalendarDays className="w-4 h-4 text-white/40" />}
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isDeadline ? "text-red-500" : isKey ? "text-amber-500" : "text-white/40"
              )}>
                {event.type}
              </span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none mb-4 text-white">
              {event.title}
            </h3>
            
            <p className="text-sm md:text-base font-medium text-white/60 leading-relaxed">
              {event.description}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE LAYOUT
// ==========================================
export default function ElectionTimelinePage() {
  const { token } = useAuth();
  const [events, setEvents] = useState<ElectionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    const getTimelines = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/timeline`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.data.success) {
          // Sort events chronologically to ensure the timeline makes sense
          const sortedEvents = (response.data.data?.timelines || response.data.timelines).sort(
            (a: ElectionEvent, b: ElectionEvent) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setEvents(sortedEvents);
        }
      } catch (error) {
        console.error("Failed to load timeline", error);
      } finally {
        setIsLoading(false);
      }
    };
    getTimelines();
  }, [token]);

  // Master Track Animation
  useLayoutEffect(() => {
    if (!isLoading && events.length > 0) {
      let ctx = gsap.context(() => {
        // Draw the center line down as the user scrolls
        gsap.fromTo(trackRef.current,
          { scaleY: 0 },
          { 
            scaleY: 1, 
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 50%",
              end: "bottom 80%",
              scrub: true,
            }
          }
        );

        // Header entrance
        gsap.from(".header-block", {
          y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: "power4.out"
        });

      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, events.length]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] w-full pb-32 font-sans selection:bg-amber-500 selection:text-black">
      
      {/* EDITORIAL HEADER */}
      <div className="pt-24 pb-16 px-6 sm:px-12 max-w-[1400px] mx-auto relative z-20">
        <div className="border-b-4 border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="header-block">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Official Chronology</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-white">
              Civic <br/> Calendar
            </h1>
          </div>
          
          <div className="header-block max-w-sm">
            <p className="text-sm font-medium text-white/50 leading-relaxed text-left md:text-right">
              Mandatory deadlines, electoral events, and public notices recorded in chronological order.
            </p>
          </div>
        </div>
      </div>

      {/* THE TIMELINE SYSTEM */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 relative">
        
        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-32 opacity-50">
             <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
             <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Calibrating Timeline...</span>
           </div>
        ) : events.length > 0 ? (
          <div className="relative pt-12">
            
            {/* The Master Axis Line */}
            <div className="absolute left-[7px] md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 -translate-x-1/2 z-0" />
            
            {/* The Animated Axis Fill */}
            <div 
              ref={trackRef}
              className="absolute left-[7px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500 via-amber-500/50 to-transparent -translate-x-1/2 z-0 origin-top" 
            />

            {/* The Nodes */}
            <div className="relative z-10">
              {events.map((event, index) => (
                <TimelineNode key={event._id} event={event} index={index} />
              ))}
            </div>

            {/* End of Line Cap */}
            <div className="flex flex-col items-center justify-center mt-12 opacity-30 md:ml-0 ml-2">
              <div className="w-3 h-3 border-2 border-white/50 rounded-full mb-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">End of Record</span>
            </div>

          </div>
        ) : (
          <div className="py-32 text-center border-t border-white/10">
             <span className="text-white/20 font-black uppercase text-4xl tracking-tighter block mb-2">No Events Scheduled</span>
             <span className="text-sm font-mono text-white/40">The calendar is currently empty.</span>
          </div>
        )}
      </div>

    </div>
  );
}