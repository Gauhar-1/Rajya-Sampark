'use client';

import { useMemo, useState, useRef, useLayoutEffect } from "react";
import { SearchIcon, Users, Loader2, Activity } from "lucide-react";
import { useVolunteer } from "../hooks/use-volunteer";
import { INTEREST_AREAS } from "@/lib/constants";
import * as util from '../utils/index';
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const VolunteerRoster = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [interestFilter, setInterestFilter] = useState('all');
    
    const { activeVolunteers, loading: VolunteerLoading } = useVolunteer();
    const containerRef = useRef<HTMLDivElement>(null);

    const uniqueInterests = useMemo(() => {
        return ['all', ...INTEREST_AREAS.map(area => area.id)];
    }, []);

    // FIX: Actually apply the search and filters to the activeVolunteers array
    const filteredVolunteers = useMemo(() => {
        if (!activeVolunteers) return [];
        return activeVolunteers.filter(v => {
            const matchesSearch = v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesInterest = interestFilter === 'all' || v.interests.includes(interestFilter);
            return matchesSearch && matchesInterest;
        });
    }, [activeVolunteers, searchTerm, interestFilter]);

    useLayoutEffect(() => {
        if (!VolunteerLoading && filteredVolunteers.length > 0) {
            let ctx = gsap.context(() => {
                gsap.from(".roster-row", {
                    y: 20,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "power2.out",
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [VolunteerLoading, filteredVolunteers.length]);

    return (
        <div ref={containerRef} className="w-full flex flex-col min-h-[500px]">
            
            {/* =========================================
                HEADER BLOCK
                ========================================= */}
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        <Users className="w-6 h-6 text-emerald-500" />
                        Active Team Roster
                    </h2>
                    <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-2">
                        Deployed Personnel & Capabilities
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] font-mono uppercase text-emerald-500 tracking-widest mb-1 flex items-center justify-end gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Active Count
                        </div>
                        <div className="text-4xl font-black text-white leading-none">
                            {filteredVolunteers.length.toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================
                THE CONSOLE (Filters)
                ========================================= */}
            <div className="bg-[#0a0a0a] border border-white/10 p-4 flex flex-col md:flex-row gap-4 mb-8">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="SEARCH RECORDS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-b-2 border-white/10 text-white pl-12 h-12 text-sm font-black uppercase tracking-widest focus:border-emerald-500 outline-none transition-colors placeholder:text-white/20"
                    />
                </div>

                {/* Interest Filter */}
                <div className="md:w-72 shrink-0">
                    <select
                        value={interestFilter}
                        onChange={(e) => setInterestFilter(e.target.value)}
                        className="w-full h-12 bg-transparent border-b-2 border-white/10 text-white text-xs font-bold uppercase tracking-widest px-4 outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                    >
                        {uniqueInterests.map(interestKey => (
                            <option key={interestKey} value={interestKey} className="bg-[#050505] text-white">
                                {interestKey === 'all' ? 'All Capabilities' : util.getInterestLabel(interestKey)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* =========================================
                THE REGISTRY (List Content)
                ========================================= */}
            <div className="flex-1 flex flex-col">
                {VolunteerLoading ? (
                    <div className="flex flex-col items-center justify-center flex-1 opacity-50 py-20">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-500">Accessing Database...</span>
                    </div>
                ) : filteredVolunteers.length > 0 ? (
                    <div className="border-t-2 border-white/20">
                        {filteredVolunteers.map((volunteer) => (
                            <div 
                                key={volunteer._id} 
                                className="roster-row group flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/10 p-6 bg-white/[0.01] hover:bg-white/5 transition-colors gap-8"
                            >
                                
                                {/* 1. Identity */}
                                <div className="flex gap-4 items-start xl:w-1/3">
                                    <div className="mt-2">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-emerald-500 transition-colors mb-1">
                                            {volunteer.fullName}
                                        </h3>
                                        <div className="flex flex-col gap-1 text-[10px] font-mono uppercase text-white/40 tracking-widest">
                                            <span>COM: {volunteer.phone || 'UNLISTED'}</span>
                                            <span>STS: {volunteer.status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Action Capabilities */}
                                <div className="xl:w-1/3">
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">
                                        Cleared Capabilities
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {volunteer.interests.map(interestKey => (
                                            <span 
                                                key={interestKey} 
                                                className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-500 uppercase tracking-widest whitespace-nowrap"
                                            >
                                                {util.getInterestLabel(interestKey)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. Availability Schedule */}
                                <div className="xl:w-1/4">
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                                        Deployment Schedule
                                    </div>
                                    <div className="text-xs font-bold text-white/80 border-l-2 border-white/20 pl-3">
                                        {volunteer.availability}
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 py-32 border-y border-white/10 bg-white/[0.02]">
                        <div className="w-16 h-1 bg-white/10 mb-6" />
                        <span className="text-3xl font-black uppercase tracking-tighter text-white/20 mb-2">No Records Found</span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Adjust parameters or expand search.</span>
                    </div>
                )}
            </div>

        </div>
    );
};