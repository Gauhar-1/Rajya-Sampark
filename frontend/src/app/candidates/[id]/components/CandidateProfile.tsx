'use client';

import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, AlertCircle, XCircle, Activity, FileText } from 'lucide-react';
import { Candidate } from '@/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface CandidateProfileProps {
  candidate: Candidate | null;
  loading: boolean;
  error: string | null;
}

export const CandidateProfile = ({ candidate, loading, error }: CandidateProfileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Mocking the data you requested since it might not be in the standard Candidate type yet
  const stats = {
    trustScore: 78,
    issuesSolved: 142,
    issuesPending: 34,
    issuesIgnored: 12,
  };

  useLayoutEffect(() => {
    if (!loading && candidate) {
      let ctx = gsap.context(() => {
        // 1. Image Darkroom Reveal
        gsap.fromTo(imageRef.current, 
          { filter: "contrast(200%) brightness(0) grayscale(100%)" },
          { filter: "contrast(110%) brightness(1) grayscale(100%)", duration: 2, ease: "power3.out" }
        );

        // 2. Data Counters (The "System Readout" effect)
        const counters = gsap.utils.toArray('.stat-counter');
        counters.forEach((counter: any) => {
          const targetValue = parseInt(counter.getAttribute('data-value') || '0', 10);
          gsap.fromTo(counter, 
            { innerHTML: 0 },
            {
              innerHTML: targetValue,
              duration: 2,
              ease: "power4.out",
              snap: { innerHTML: 1 },
              scrollTrigger: {
                trigger: counter,
                start: "top 85%",
              }
            }
          );
        });

        // 3. Timeline Reveal
        gsap.from(".timeline-item", {
          x: 50,
          opacity: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".timeline-container",
            start: "top 70%",
          }
        });

      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, candidate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center font-mono text-amber-500 tracking-[0.5em] uppercase text-xs animate-pulse">
        Accessing Secure Records...
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Record Not Found</h1>
        <p className="text-white/50 font-mono text-xs uppercase mb-8">The requested dossier does not exist or has been redacted.</p>
        <Link href="/candidates">
          <button className="px-6 py-3 border border-white/20 hover:bg-white hover:text-black font-bold uppercase tracking-widest text-xs transition-colors">
            Return to Index
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500 selection:text-black">
      
      {/* 1. TOP UTILITY BAR (Plain English, Terminal Vibe) */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <Link href="/candidates" className="group flex items-center gap-2 text-white/50 hover:text-amber-500 transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Return to Index</span>
        </Link>
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/30">
          Record_ID: {candidate._id.slice(-8)}
        </div>
      </div>

      {/* 2. THE SPLIT-PANE DOSSIER */}
      <div className="flex flex-col lg:flex-row pt-20 min-h-screen">
        
        {/* =========================================
            LEFT PANE: THE ANCHOR (Sticky Portrait & Trust)
            ========================================= */}
        <div className="lg:w-5/12 lg:fixed lg:h-[calc(100vh-5rem)] border-b lg:border-b-0 lg:border-r border-white/10 p-8 lg:p-12 flex flex-col">
          
          <div className="flex-1">
            {/* The Brutalist Portrait */}
            <div ref={imageRef} className="relative w-full aspect-[4/5] bg-white/5 border border-white/20 mb-8 overflow-hidden group">
              {candidate.imageUrl ? (
                <Image
                  src={candidate.imageUrl}
                  alt={candidate.name}
                  fill
                  className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-1000"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-white/20 text-xs uppercase tracking-widest">
                  [ No Image on Record ]
                </div>
              )}
              {/* Registration Marks */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-amber-500" />
            </div>

            {/* Core Identity */}
            <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-4 text-white">
              {candidate.name}
            </h1>
            <div className="flex flex-col gap-2 mb-12">
              <span className="text-xs font-black uppercase tracking-widest text-amber-500 border-l-2 border-amber-500 pl-3">
                {candidate.party}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 pl-3">
                Jurisdiction: {candidate.region}
              </span>
            </div>
          </div>

          {/* The Trust Consensus Meter */}
          <div className="border-t border-white/10 pt-8 mt-auto">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Public Trust Consensus</span>
              <div className="text-4xl font-black text-amber-500 leading-none">
                <span className="stat-counter" data-value={stats.trustScore}>0</span>%
              </div>
            </div>
            <div className="w-full h-2 bg-white/10 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-2000 ease-out"
                style={{ width: `${stats.trustScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* =========================================
            RIGHT PANE: THE LEDGER (Scrollable Data)
            ========================================= */}
        <div className="lg:w-7/12 lg:ml-auto p-8 lg:p-16 lg:pl-24">
          
          {/* THE METRICS: Raw, Indisputable Data */}
          <section className="mb-24">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-8 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Performance Record
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Solved */}
              <div className="p-6 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                <ShieldCheck className="w-6 h-6 text-emerald-500 mb-4" />
                <div className="text-5xl font-black text-white stat-counter mb-2" data-value={stats.issuesSolved}>0</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/70">Issues Resolved</div>
              </div>
              
              {/* Pending */}
              <div className="p-6 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                <AlertCircle className="w-6 h-6 text-amber-500 mb-4" />
                <div className="text-5xl font-black text-white stat-counter mb-2" data-value={stats.issuesPending}>0</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-500/70">Pending Action</div>
              </div>
              
              {/* Ignored */}
              <div className="p-6 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                <XCircle className="w-6 h-6 text-red-500 mb-4" />
                <div className="text-5xl font-black text-white stat-counter mb-2" data-value={stats.issuesIgnored}>0</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-red-500/70">Issues Ignored</div>
              </div>
            </div>
          </section>

          {/* THE MANIFESTO: Big Typography over bullet points */}
          <section className="mb-24">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-8 border-b border-white/10 pb-4">
              The Mandate & Policies
            </h2>
            <div className="text-lg md:text-2xl font-medium leading-relaxed text-white/80 mb-12">
              {candidate.profileBio || "No official biography has been submitted to the public record."}
            </div>

            {candidate.keyPolicies && candidate.keyPolicies.length > 0 && (
              <div className="grid gap-6">
                {candidate.keyPolicies.map((policy, idx) => (
                  <div key={idx} className="flex gap-6 items-start group">
                    <div className="text-amber-500 font-mono text-sm pt-1">{(idx + 1).toString().padStart(2, '0')}</div>
                    <div className="text-xl md:text-3xl font-black uppercase tracking-tight leading-none group-hover:text-amber-500 transition-colors">
                      {policy}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {candidate.manifestoUrl && (
              <a href={candidate.manifestoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 mt-12 px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-amber-500 transition-colors">
                <FileText className="w-4 h-4" /> Review Full Document
              </a>
            )}
          </section>

          {/* THE TIMELINE: Career History */}
          {candidate.experience && candidate.experience.length > 0 && (
            <section className="mb-24">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-12 border-b border-white/10 pb-4">
                Public Record & History
              </h2>
              <div className="timeline-container border-l-2 border-white/10 ml-3 space-y-12">
                {candidate.experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="timeline-item relative pl-10">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-amber-500 rounded-full" />
                    <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest mb-2 border border-amber-500/20 bg-amber-500/10 inline-block px-2 py-1">
                      {exp.duration}
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-1">{exp.role}</h3>
                    <h4 className="text-sm font-bold text-white/50 mb-4">{exp.company}</h4>
                    <p className="text-white/70 leading-relaxed font-medium">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* THE EVIDENCE: Projects / Initiatives */}
          {candidate.projects && candidate.projects.length > 0 && (
            <section className="pb-24">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-12 border-b border-white/10 pb-4">
                Verified Initiatives
              </h2>
              <div className="grid gap-6">
                {candidate.projects.map((project, idx) => (
                  <a 
                    key={project.id || idx} 
                    href={project.link || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-8 border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-amber-500/50 transition-all group"
                  >
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4 group-hover:text-amber-500 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-white/60 leading-relaxed mb-6 font-medium">
                      {project.description}
                    </p>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2">
                      Inspect Record <ArrowLeft className="w-3 h-3 rotate-135 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};