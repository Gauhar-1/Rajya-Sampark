'use client';

import { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import type { Campaign } from '@/types';
import { Search, MapPin, Flag, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// THE INITIATIVE BAND (Anti-Design Row)
// ==========================================
function CampaignBand({ campaign, index }: { campaign: Campaign; index: number }) {
  const bandRef = useRef<HTMLAnchorElement>(null);
  const formattedIndex = (index + 1).toString().padStart(2, '0');

  return (
    <Link 
      href={`/campaigns/${campaign._id}`}
      ref={bandRef}
      className="campaign-band group relative flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 p-6 md:p-12 overflow-hidden bg-[#030303] hover:bg-black transition-colors duration-500 min-h-[200px]"
    >
      {/* BACKGROUND POSTER (Reveals on Hover) */}
      {campaign.imageUrl && (
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
          <Image
            src={campaign.imageUrl}
            alt={campaign.name}
            fill
            className="object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
      )}

      {/* LEFT: Index & Core Data */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-12 w-full md:w-auto">
        <span className="text-2xl font-mono font-black text-white/20 group-hover:text-amber-500 transition-colors">
          {formattedIndex}
        </span>
        
        <div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white group-hover:text-amber-500 transition-colors duration-300 leading-[0.9] mb-4">
            {campaign.name}
          </h2>
          
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-white/50">
            {campaign.party && (
              <span className="flex items-center gap-2 border border-white/10 px-3 py-1 bg-white/5 backdrop-blur-md">
                <Flag className="w-3 h-3 text-amber-500" /> {campaign.party}
              </span>
            )}
            <span className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-amber-500" /> {campaign.location}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Description Snippet & Action */}
      <div className="relative z-10 mt-8 md:mt-0 flex items-center justify-between md:justify-end gap-12 md:w-1/3">
        <p className="hidden xl:block text-sm font-medium text-white/60 line-clamp-3 leading-relaxed border-l-2 border-amber-500/50 pl-4 group-hover:text-white transition-colors">
          {campaign.description}
        </p>
        
        <div className="w-16 h-16 shrink-0 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:scale-110 transition-all duration-500">
          <ArrowRight className="w-6 h-6 text-white group-hover:text-black transition-colors" />
        </div>
      </div>
    </Link>
  );
}


// ==========================================
// MAIN PAGE LAYOUT
// ==========================================
export default function CampaignDiscoveryPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [isLoading, setIsLoading] = useState(true);
  
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    const getAllCampaigns = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/campaign`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.data.success) {
          setCampaigns(response.data.data?.campaigns || response.data.campaigns);
        }
      } catch (error) {
        console.error("Error fetching campaigns", error);
      } finally {
        setIsLoading(false);
      }
    }
    getAllCampaigns();
  }, [token]);

  const parties = useMemo(() => ['all', ...new Set(campaigns.map(c => c.party).filter(Boolean) as string[])], [campaigns]);
  const locations = useMemo(() => ['all', ...new Set(campaigns.map(c => c.location).filter(Boolean) as string[])], [campaigns]);

  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = locationFilter === 'all' || campaign.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesParty = partyFilter === 'all' || campaign.party === partyFilter;
      return matchesSearch && matchesLocation && matchesParty;
    });

    if (sortBy === 'popularity') {
      filtered.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => parseInt(b._id.replace('camp', '')) - parseInt(a._id.replace('camp', '')));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [searchTerm, locationFilter, partyFilter, sortBy, campaigns]);

  // Entrance Animations
  useLayoutEffect(() => {
    if (!isLoading && filteredAndSortedCampaigns.length > 0) {
      let ctx = gsap.context(() => {
        gsap.from(".campaign-band", {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".ledger-container",
            start: "top 80%",
          }
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, filteredAndSortedCampaigns.length]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] w-full font-sans selection:bg-amber-500 selection:text-black">
      
      {/* EDITORIAL HEADER */}
      <div className="pt-24 pb-12 px-6 sm:px-12 max-w-[1600px] mx-auto relative z-20">
        <div className="border-b-4 border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Public Registry</span>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-white">
              Active <br/> Initiatives
            </h1>
          </div>
          
          <div className="max-w-sm">
            <p className="text-sm font-medium text-white/50 leading-relaxed text-left md:text-right">
              Explore live community movements. Track their momentum, review their goals, and join the ones that matter to you.
            </p>
          </div>
        </div>
      </div>

      {/* THE CONSOLE (Anti-Design Filters) */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-12 mb-12">
        <div className="bg-[#0a0a0a] border border-white/10 p-4 md:p-6 flex flex-col xl:flex-row gap-6">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
            <Input
              type="search"
              placeholder="Search initiatives by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b-2 border-transparent focus-visible:border-amber-500 rounded-none text-white pl-12 h-14 text-xl focus-visible:ring-0 placeholder:text-white/20 font-black tracking-tight transition-colors"
            />
          </div>

          {/* Minimalist Toggles */}
          <div className="flex flex-wrap xl:flex-nowrap gap-4 items-center">
            <div className="flex items-center border border-white/10 p-1 bg-[#050505]">
              <span className="text-[10px] font-mono uppercase text-white/40 px-3">Sort:</span>
              {['popularity', 'newest', 'name'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSortBy(mode)}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                    sortBy === mode ? "bg-amber-500 text-black" : "text-white/50 hover:text-white"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            <select 
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
              className="h-12 bg-[#050505] border border-white/10 text-white text-xs font-bold uppercase tracking-widest px-4 outline-none focus:border-amber-500"
            >
              <option value="all">All Sectors</option>
              {locations.filter(l => l !== 'all').map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <select 
              value={partyFilter} 
              onChange={(e) => setPartyFilter(e.target.value)}
              className="h-12 bg-[#050505] border border-white/10 text-white text-xs font-bold uppercase tracking-widest px-4 outline-none focus:border-amber-500"
            >
              <option value="all">All Parties</option>
              {parties.filter(p => p !== 'all').map(party => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* THE LEDGER (List Content) */}
      <div className="ledger-container max-w-[1600px] mx-auto px-6 sm:px-12 pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50 border-t border-white/10">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Querying Database...</span>
          </div>
        ) : filteredAndSortedCampaigns.length > 0 ? (
          <div className="border-t-4 border-white/20">
            {filteredAndSortedCampaigns.map((campaign, index) => (
              <CampaignBand key={campaign._id} campaign={campaign} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border-t border-white/10">
            <span className="text-white/20 font-black uppercase text-4xl tracking-tighter block mb-2">No Initiatives Found</span>
            <span className="text-sm font-mono text-white/40">Adjust your tracking parameters.</span>
          </div>
        )}
      </div>

    </div>
  );
}