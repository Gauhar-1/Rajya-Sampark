'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Added Clock to the lucide-react imports
import { Search, HandHeart, Users, ChevronRight, MapPin, Activity, Clock } from 'lucide-react'; 
import { mockCandidates } from '@/lib/mockData'; 
import { HideRightSideBar } from '../auth/RequiredAuth';
import gsap from 'gsap';

export function RightSidebarContent() {
  const [electionPoll, setElectionPoll] = useState<any>(null);

  useEffect(() => {
    const pollOptions = mockCandidates.map(candidate => ({
      id: candidate._id,
      text: candidate.name,
      votes: Math.floor(Math.random() * 50),
    }));
    
    setElectionPoll({
      question: 'Who is leading the community conversation?',
      options: pollOptions,
      totalVotes: pollOptions.reduce((sum, opt) => sum + opt.votes, 0),
      userHasVoted: false,
    });

    gsap.from(".intel-section", {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out"
    });
  }, []);

  const handlePollVote = (optionId: string) => {
    if (!electionPoll || electionPoll.userHasVoted) return;
    setElectionPoll((prev: any) => {
      const newOptions = prev.options.map((opt: any) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      return { ...prev, options: newOptions, totalVotes: prev.totalVotes + 1, userHasVoted: true };
    });
  };

  return (
    <HideRightSideBar>
      <div className="flex flex-col gap-8 pb-10">
        
        {/* 1. REGIONAL STATUS */}
        <div className="intel-section flex items-start justify-between border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3 h-3 text-amber-500" />
              <p className="text-[10px] font-mono text-amber-500 tracking-[0.2em] uppercase font-bold">Silchar Region</p>
            </div>
            <h3 className="font-black text-2xl text-white uppercase tracking-tighter leading-none">Sector 04</h3>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* 2. PUBLIC OPINION POLL */}
        <section className="intel-section relative group">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden transition-all hover:border-amber-500/30 hover:bg-white/10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">Public Sentiment</span>
              <Users className="h-4 w-4 text-white/40" />
            </div>

            <div className="space-y-5">
              <p className="text-sm font-medium text-white/90 leading-relaxed mb-4">
                {electionPoll?.question}
              </p>
              {electionPoll?.options.map((option: any) => {
                const pct = ((option.votes / electionPoll.totalVotes) * 100).toFixed(0);
                return (
                  <div key={option.id}>
                    {electionPoll.userHasVoted ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-white/70">
                          <span>{option.text}</span>
                          <span className="text-amber-500">{pct}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/50 rounded-full relative overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-amber-500 transition-all duration-1000 ease-out rounded-full" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handlePollVote(option.id)}
                        className="w-full text-left p-4 rounded-xl border border-white/5 bg-black/40 text-xs font-bold uppercase tracking-wide hover:bg-amber-500 hover:text-black hover:border-amber-400 transition-all flex justify-between items-center group/btn"
                      >
                        {option.text}
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. CAMPAIGNS */}
        <section className="intel-section">
           <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-5 w-5 text-amber-500" />
                <h4 className="font-black text-lg uppercase tracking-tight">Representatives</h4>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-6 font-medium">
                Track local leaders, review their resolved issues, and verify their promises.
              </p>
              <Link href="/campaigns" className="block">
                <button className="w-full py-3 bg-white/10 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-all">
                  Search Directory
                </button>
              </Link>
           </div>
        </section>

        {/* 4. CIVIC CALENDAR (TIMELINE LINK) */}
        <section className="intel-section">
           <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-amber-500" />
                <h4 className="font-black text-lg uppercase tracking-tight">Civic Calendar</h4>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-6 font-medium">
                Review official chronologies, upcoming deadlines, and critical electoral events.
              </p>
              {/* Ensure this href matches your actual timeline route folder name */}
              <Link href="/timeline" className="block">
                <button className="w-full py-3 bg-transparent border-2 border-white/20 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-black hover:border-white transition-all">
                  View Timeline
                </button>
              </Link>
           </div>
        </section>

        {/* 5. VOLUNTEER (Premium Dark Mode CTA) */}
        <section className="intel-section">
          <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-6 rounded-2xl shadow-xl relative overflow-hidden border border-amber-500/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 text-black">
              <div className="flex items-center gap-2 mb-4">
                <HandHeart className="h-6 w-6 text-black" />
                <h3 className="font-black text-xl uppercase tracking-tighter">Deploy Now</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-6 opacity-90">
                Great districts need ground operatives. Join a campaign team and execute verified mandates.
              </p>
              <Link href="/volunteer-signup" className="block">
                <button className="w-full py-3 bg-black text-amber-500 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-lg">
                  Enlist
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. LIVE ACTIVITY */}
        <section className="intel-section">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Activity className="w-4 h-4 text-white/40" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Activity Log</span>
            </div>
            <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex flex-col gap-1.5 pl-4 border-l-2 border-amber-500/50">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-500 uppercase">System Alert</span>
                      <span className="text-[9px] font-mono text-white/30">12:0{i} PM</span>
                    </div>
                    <span className="text-xs text-white/80 font-medium">Issue #489{i} marked as verified. Route established.</span>
                 </div>
               ))}
            </div>
          </div>
        </section>

      </div>
    </HideRightSideBar>
  );
}