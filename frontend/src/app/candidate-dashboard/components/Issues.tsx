'use client';

import { useRef, useLayoutEffect } from 'react';
import { ShieldAlert, Check, X, MessageSquare, ExternalLink, Loader2, Activity } from "lucide-react";
import { useIssue } from '../hooks/use-issue';
import { Issue } from '@/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export const Issues = () => {
    const { issues, loading: IssueLoading, handleStatusChange } = useIssue();
    const containerRef = useRef<HTMLDivElement>(null);

    const handleCreateGroupChat = (issueId: string) => {
        console.log(`Initiating Group Chat for issue: ${issueId}`);
        // Add your chat initiation logic here
    };

    useLayoutEffect(() => {
        if (!IssueLoading && issues.length > 0) {
            let ctx = gsap.context(() => {
                gsap.from(".escalation-row", {
                    y: 20,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "power2.out",
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [IssueLoading, issues.length]);

    const renderActionButtons = (issue: Issue) => {
        if (issue.status === 'approved') {
            return (
                <button 
                    onClick={() => handleCreateGroupChat(issue._id)}
                    className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-4 border border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black font-black uppercase tracking-widest text-xs transition-all duration-300"
                >
                    <MessageSquare className="w-4 h-4" /> Open Comms Link
                </button>
            );
        }

        if (issue.status === 'rejected') {
            return (
                <div className="w-full xl:w-auto flex items-center justify-center px-6 py-4 border border-red-500/20 bg-red-500/5 text-red-500/50 font-black uppercase tracking-widest text-xs cursor-not-allowed">
                    Deployment Dismissed
                </div>
            );
        }

        return (
            <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4 shrink-0">
                <button 
                    onClick={() => handleStatusChange(issue._id, "approved")}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black font-black uppercase tracking-widest text-xs transition-all duration-300"
                >
                    <Check className="w-4 h-4" /> Authorize
                </button>
                <button 
                    onClick={() => handleStatusChange(issue._id, "rejected")}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-xs transition-all duration-300"
                >
                    <X className="w-4 h-4" /> Dismiss
                </button>
            </div>
        );
    };

    return(
        <div ref={containerRef} className="w-full flex flex-col min-h-[500px]">
            
            {/* =========================================
                HEADER BLOCK
                ========================================= */}
            <div className="mb-8 border-b border-white/10 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-amber-500" />
                        Field Escalations
                    </h2>
                    <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-2">
                        Monitor and authorize volunteer interventions.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-amber-500 tracking-widest mb-1 flex items-center justify-end gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /> Active Queue
                    </div>
                    <div className="text-4xl font-black text-white leading-none">
                        {issues.length.toString().padStart(2, '0')}
                    </div>
                </div>
            </div>

            {/* =========================================
                THE LEDGER (Issue List)
                ========================================= */}
            <div className="flex-1 flex flex-col">
                {IssueLoading ? (
                    <div className="flex flex-col items-center justify-center flex-1 opacity-50 py-20">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">Querying Field Reports...</span>
                    </div>
                ) : issues.length > 0 ? (
                    <div className="border-t-2 border-white/20">
                        {issues.map((issue, index) => (
                            <div 
                                key={issue._id || index} 
                                className="escalation-row group flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/10 p-6 bg-white/[0.01] hover:bg-white/5 transition-colors gap-8"
                            >
                                
                                {/* 1. Meta & Operative Info */}
                                <div className="flex gap-6 items-start xl:w-1/3">
                                    <div className="text-[10px] font-mono text-white/20 mt-2">
                                        ESC_{(index + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                                            Claimed By Operative
                                        </div>
                                        <div className="text-xl font-black text-white font-mono tracking-tight group-hover:text-amber-500 transition-colors mb-1">
                                            {issue.takenBy?.phone || 'NO_COMMS_DATA'}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-white/40 tracking-widest">
                                            <Activity className="w-3 h-3 text-amber-500" />
                                            {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Source Record Link */}
                                <div className="xl:w-1/4">
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                                        Source Target
                                    </div>
                                    <Link href={`/post/${issue.postId}`}>
                                        <button className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest text-white/70">
                                            <ExternalLink className="w-3 h-3" /> Inspect Record
                                        </button>
                                    </Link>
                                </div>

                                {/* 3. Executive Actions */}
                                <div className="xl:w-auto shrink-0 mt-4 xl:mt-0">
                                    {renderActionButtons(issue)}
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 py-32 border-y border-white/10 bg-white/[0.02]">
                        <div className="w-16 h-1 bg-white/10 mb-6" />
                        <span className="text-3xl font-black uppercase tracking-tighter text-white/20 mb-2">Queue Clear</span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">No active escalations require authorization.</span>
                    </div>
                )}
            </div>

        </div>
    );
};