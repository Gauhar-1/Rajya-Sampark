'use client';

import { useRef, useLayoutEffect } from "react";
import { Check, X, UserPlus, Loader2 } from "lucide-react";
import { useVolunteer } from "../hooks/use-volunteer";
import * as util from "../utils/index";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const VolunteerReq = () => {
    const { pendingRequests, handleRequestAction, loading: VolunteerLoading } = useVolunteer();
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!VolunteerLoading && pendingRequests.length > 0) {
            let ctx = gsap.context(() => {
                gsap.from(".req-row", {
                    y: 20,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "power2.out",
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [VolunteerLoading, pendingRequests.length]);

    return (
        <div ref={containerRef} className="w-full flex flex-col min-h-[500px]">
            
            {/* Header Block */}
            <div className="mb-8 border-b border-white/10 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        <UserPlus className="w-6 h-6 text-amber-500" />
                        Pending Clearances
                    </h2>
                    <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-2">
                        Awaiting Executive Authorization
                    </p>
                </div>
                <div className="text-4xl font-black text-white/20 leading-none">
                    {pendingRequests.length.toString().padStart(2, '0')}
                </div>
            </div>

            {/* The Ledger Queue */}
            <div className="flex-1 flex flex-col">
                {VolunteerLoading ? (
                    <div className="flex flex-col items-center justify-center flex-1 opacity-50 py-20">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">Scanning Queue...</span>
                    </div>
                ) : pendingRequests.length > 0 ? (
                    <div className="border-t-2 border-white/20">
                        {pendingRequests.map((req, index) => (
                            <div 
                                key={req._id} 
                                className="req-row group flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/10 p-6 bg-white/[0.01] hover:bg-white/5 transition-colors gap-8"
                            >
                                
                                {/* 1. Identity & Contact */}
                                <div className="flex gap-6 items-start xl:w-1/3">
                                    <div className="text-[10px] font-mono text-white/20 mt-2">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-amber-500 transition-colors mb-1">
                                            {req.fullName}
                                        </h3>
                                        <div className="flex flex-col gap-1 text-[10px] font-mono uppercase text-white/40 tracking-widest">
                                            <span>ID: {req.email || 'NO_EMAIL_PROVIDED'}</span>
                                            <span>COM: {req.phone || 'NO_PHONE_PROVIDED'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Capabilities & Availability */}
                                <div className="xl:w-1/3 flex flex-col gap-4">
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                                            Declared Availability
                                        </div>
                                        <div className="text-sm font-medium text-white/80">
                                            {req.availability}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                                            Action Capabilities
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {req.interests.map(interestKey => (
                                                <span 
                                                    key={interestKey} 
                                                    className="px-2 py-1 bg-white/5 border border-white/10 text-[10px] font-mono text-amber-500/80 uppercase tracking-widest whitespace-nowrap"
                                                >
                                                    {util.getInterestLabel(interestKey)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Executive Actions */}
                                <div className="xl:w-auto flex gap-4 shrink-0">
                                    <button 
                                        onClick={() => handleRequestAction(req._id, 'accept')}
                                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-4 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black font-black uppercase tracking-widest text-xs transition-all duration-300"
                                    >
                                        <Check className="w-4 h-4" /> Authorize
                                    </button>
                                    <button 
                                        onClick={() => handleRequestAction(req._id, 'reject')}
                                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-4 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-xs transition-all duration-300"
                                    >
                                        <X className="w-4 h-4" /> Deny
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 py-32 border-y border-white/10 bg-white/[0.02]">
                        <div className="w-16 h-1 bg-white/10 mb-6" />
                        <span className="text-3xl font-black uppercase tracking-tighter text-white/20 mb-2">Queue Empty</span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">No pending clearance requests detected.</span>
                    </div>
                )}
            </div>

        </div>
    );
};