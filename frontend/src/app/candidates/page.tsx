'use client';

import { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Candidate } from '@/types';
import { Search, MapPin, ArrowUpRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import gsap from 'gsap';

// ==========================================
// INDIVIDUAL ROW COMPONENT (The Anti-Card)
// ==========================================
function CandidateRow({ candidate, index }: { candidate: Candidate; index: number }) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // High-performance cursor tracking for the floating image
  useEffect(() => {
    const row = rowRef.current;
    const image = imageRef.current;
    if (!row || !image) return;

    // Use GSAP quickTo for buttery smooth cursor following
    const xTo = gsap.quickTo(image, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(image, "y", { duration: 0.4, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = row.getBoundingClientRect();
      // Offset the image so it centers on the cursor
      xTo(e.clientX - rect.left - 100); 
      yTo(e.clientY - rect.top - 100);
    };

    const handleMouseEnter = () => {
      gsap.to(image, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" });
    };

    const handleMouseLeave = () => {
      gsap.to(image, { opacity: 0, scale: 0.8, duration: 0.4, ease: "power2.in" });
    };

    row.addEventListener('mousemove', handleMouseMove);
    row.addEventListener('mouseenter', handleMouseEnter);
    row.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      row.removeEventListener('mousemove', handleMouseMove);
      row.removeEventListener('mouseenter', handleMouseEnter);
      row.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const formattedIndex = (index + 1).toString().padStart(2, '0');

  return (
    <Link 
      href={`/candidates/${candidate._id}`}
      ref={rowRef}
      className="candidate-row block relative border-b border-white/10 py-8 md:py-12 group cursor-none"
    >
      {/* FLOATING IMAGE REVEAL (Desktop Only) */}
      {candidate.imageUrl && (
        <div 
          ref={imageRef}
          className="absolute z-50 w-[200px] h-[250px] pointer-events-none opacity-0 scale-80 hidden md:block overflow-hidden bg-black border-2 border-amber-500 shadow-2xl"
        >
          <Image
            src={candidate.imageUrl}
            alt={candidate.name}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
          {/* Registration Mark Overlay */}
          <div className="absolute bottom-0 right-0 bg-amber-500 text-black px-2 py-1 text-[10px] font-black uppercase tracking-widest">
            {candidate.party}
          </div>
        </div>
      )}

      {/* ROW CONTENT */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 sm:px-8">
        
        {/* Left: Index & Name */}
        <div className="flex items-start md:items-center gap-6 md:gap-12">
          <span className="text-sm font-mono text-white/30 uppercase mt-2 md:mt-0">
            {formattedIndex}
          </span>
          <div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white group-hover:text-amber-500 transition-colors duration-500">
              {candidate.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50 border border-white/10 px-3 py-1 rounded-full">
                {candidate.party}
              </span>
              <span className="text-xs font-medium text-white/40 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500" /> {candidate.region}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Policy Snippet & Action (Hidden on mobile for cleaner layout, visible on desktop) */}
        <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto mt-4 md:mt-0">
          <div className="hidden lg:block max-w-xs">
            <ul className="text-xs text-white/40 font-medium space-y-1">
              {candidate.keyPolicies.slice(0, 2).map((policy, i) => (
                <li key={i} className="truncate relative pl-3 before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:bg-amber-500">
                  {policy}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-500 group-hover:scale-110 shrink-0">
            <ArrowUpRight className="w-5 h-5 text-white/50 group-hover:text-black transition-colors" />
          </div>
        </div>

      </div>

      {/* Hover Background Shifter */}
      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </Link>
  );
}


// ==========================================
// MAIN PAGE LAYOUT
// ==========================================
export default function CandidateDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Data
  useEffect(() => {
    if (!token) return;
    const getCandidates = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/candidate`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.data.success) {
          setCandidates(response.data.data?.candidates || response.data.candidates);
        }
      } catch (error) {
        console.error("Failed to fetch candidates", error);
      } finally {
        setIsLoading(false);
      }
    };
    getCandidates();
  }, [token]);

  const regions = useMemo(() => ['all', ...new Set(candidates.map(c => c.region))], [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.party.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'all' || candidate.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, regionFilter, candidates]);

  // Mount Animations
  useLayoutEffect(() => {
    if (!isLoading && filteredCandidates.length > 0) {
      let ctx = gsap.context(() => {
        gsap.from(".candidate-row", {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        });
        gsap.from(".filter-bar", {
          y: -20,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.2
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, filteredCandidates.length]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] w-full pb-32 font-sans selection:bg-amber-500 selection:text-black">
      
      {/* EDITORIAL HEADER */}
      <div className="pt-24 pb-16 px-6 sm:px-12 max-w-[1600px] mx-auto">
        <div className="border-b-4 border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Public Directory</span>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-white">
              Representatives
            </h1>
          </div>
          
          <div className="max-w-sm">
            <p className="text-sm font-medium text-white/50 leading-relaxed text-left md:text-right">
              Review the records, platforms, and voting history of your local leaders. Transparency is mandatory.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-12">
        {/* THE CONTROL PANEL (Search & Filter) */}
        <div className="filter-bar flex flex-col md:flex-row gap-4 mb-16 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
            <Input
              type="search"
              placeholder="Search by name or party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none text-white pl-12 h-14 text-lg focus-visible:ring-0 placeholder:text-white/20 font-medium"
            />
          </div>
          <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/10">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full h-14 bg-transparent border-none focus:ring-0 text-lg font-medium px-6 text-white/70 uppercase tracking-widest text-xs">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-xl">
                {regions.map(region => (
                  <SelectItem key={region} value={region} className="focus:bg-amber-500 focus:text-black cursor-pointer">
                    {region === 'all' ? 'All Regions' : region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* THE INDEX (Data Display) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Accessing Records...</span>
          </div>
        ) : filteredCandidates.length > 0 ? (
          <div className="border-t border-white/20">
            {filteredCandidates.map((candidate, index) => (
              <CandidateRow key={candidate._id} candidate={candidate} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border-t border-white/10">
            <span className="text-white/20 font-black uppercase text-4xl tracking-tighter block mb-2">No Records Found</span>
            <span className="text-sm font-mono text-white/40">Adjust your search parameters.</span>
          </div>
        )}
      </div>

    </div>
  );
}