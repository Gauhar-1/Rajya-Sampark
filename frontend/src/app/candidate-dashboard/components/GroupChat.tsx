'use client';

import { useRef, useLayoutEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Radio, PlusSquare, ArrowRight, Loader2, Users } from "lucide-react";
import { useVolunteer } from "../hooks/use-volunteer";
import { useChat } from "../hooks/use-chat";
import { CreateGroupChatForm } from "@/components/forms/CreateGroupChatForm";
import Link from "next/link";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const GroupChat = () => {
    const { activeVolunteers } = useVolunteer();
    const { 
        handleCreateGroupChat, 
        isCreateGroupChatOpen, 
        setIsCreateGroupChatOpen, 
        createdGroupChats, 
        loading: GroupChatLoading 
    } = useChat(); 
    
    const containerRef = useRef<HTMLDivElement>(null);

    // DEFENSIVE PROGRAMMING: Ensure we always have an array, even if the hook returns undefined/null.
    const safeGroupChats = createdGroupChats || [];

    useLayoutEffect(() => {
        if (!GroupChatLoading && safeGroupChats.length > 0) {
            let ctx = gsap.context(() => {
                gsap.from(".comms-row", {
                    y: 20,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "power2.out",
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [GroupChatLoading, safeGroupChats.length]);

    return (
        <div ref={containerRef} className="w-full flex flex-col min-h-[500px]">
            
            {/* =========================================
                HEADER BLOCK
                ========================================= */}
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        <Radio className="w-6 h-6 text-amber-500" />
                        Comms Channels
                    </h2>
                    <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-2">
                        Manage Directives & Team Synchronization
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-mono uppercase text-amber-500 tracking-widest mb-1 flex items-center justify-end gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /> Active Networks
                        </div>
                        <div className="text-4xl font-black text-white leading-none">
                            {safeGroupChats.length.toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================
                ACTION BLOCK (Create Channel)
                ========================================= */}
            <div className="mb-8">
                <Dialog open={isCreateGroupChatOpen} onOpenChange={setIsCreateGroupChatOpen}>
                    <DialogTrigger asChild>
                        <button className="w-full md:w-auto flex items-center justify-between gap-6 px-8 py-5 border-2 border-white/20 bg-white/[0.02] hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                                <PlusSquare className="w-5 h-5 text-amber-500 group-hover:text-black transition-colors" />
                                <span className="font-black uppercase tracking-widest text-sm">Initialize New Channel</span>
                            </div>
                            <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                        </button>
                    </DialogTrigger>
                    
                    {/* Brutalist Modal */}
                    <DialogContent className="bg-[#050505] border-4 border-white sm:max-w-xl p-0 rounded-none shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-hidden flex flex-col">
                        <DialogHeader className="p-6 border-b-2 border-white bg-white text-black shrink-0">
                            <DialogTitle className="font-black uppercase tracking-tighter text-2xl">Create Comms Link</DialogTitle>
                            <DialogDescription className="text-[10px] font-mono uppercase tracking-widest text-black/60 mt-1">
                                Assign operatives to a dedicated operational frequency.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-[#050505] text-white">
                            <CreateGroupChatForm
                                volunteers={activeVolunteers || []} 
                                onSubmitSuccess={handleCreateGroupChat}
                                onOpenChange={setIsCreateGroupChatOpen}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* =========================================
                THE REGISTRY (Channel List)
                ========================================= */}
            <div className="flex-1 flex flex-col">
                {GroupChatLoading ? (
                    <div className="flex flex-col items-center justify-center flex-1 opacity-50 py-20">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">Establishing Secure Connection...</span>
                    </div>
                ) : safeGroupChats.length > 0 ? (
                    <div className="border-t-2 border-white/20">
                        {safeGroupChats.map((chat, index) => (
                            <Link 
                                href={`/chat/${chat._id}?name=${encodeURIComponent(chat.name)}`}
                                key={chat._id} 
                                className="comms-row group flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 p-6 md:p-8 bg-white/[0.01] hover:bg-white/5 transition-colors gap-6"
                            >
                                {/* Channel Identity */}
                                <div className="flex items-start gap-6">
                                    <div className="text-[10px] font-mono text-white/20 mt-1.5">
                                        CH_{(index + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white group-hover:text-amber-500 transition-colors mb-2">
                                            {chat.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40">
                                            <Radio className="w-3 h-3 text-amber-500" />
                                            Frequency Active
                                        </div>
                                    </div>
                                </div>

                                {/* Operative Count & Action */}
                                <div className="flex items-center justify-between sm:justify-end gap-8 sm:w-1/3 border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
                                    <div className="text-right">
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">
                                            Assigned Operatives
                                        </div>
                                        <div className="text-xl font-mono font-bold text-white/80 flex items-center justify-end gap-2">
                                            <Users className="w-4 h-4 text-white/40" />
                                            {(chat.members?.length || 0).toString().padStart(2, '0')}
                                        </div>
                                    </div>
                                    
                                    {/* Inspect Button/Icon */}
                                    <div className="w-12 h-12 shrink-0 border border-white/20 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-500">
                                        <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-black transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 py-32 border-y border-white/10 bg-white/[0.02]">
                        <div className="w-16 h-1 bg-white/10 mb-6" />
                        <span className="text-3xl font-black uppercase tracking-tighter text-white/20 mb-2">Network Silent</span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">No active communication channels established.</span>
                    </div>
                )}
            </div>

        </div>
    );
};