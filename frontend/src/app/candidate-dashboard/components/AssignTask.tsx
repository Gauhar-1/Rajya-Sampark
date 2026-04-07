'use client';

import { useRef, useLayoutEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, PlusSquare, ArrowRight, Loader2, User, Clock } from "lucide-react";
import { NewTask } from "../types";
import { useAssignTask } from "../hooks/use-Assig-task";
import { useVolunteer } from "../hooks/use-volunteer";
import * as util from '../utils/index';
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const AssignTask = () => {
    const [newTask, setNewTask] = useState<NewTask>({ title: '', volunteerId: '' });
    
    const { assignedTasks, isAssignTaskOpen, setIsAssignTaskOpen, handleAssignTask, loading: taskLoading } = useAssignTask();
    const { activeVolunteers } = useVolunteer();
    
    const containerRef = useRef<HTMLDivElement>(null);

    // Defensive Programming
    const safeAssignedTasks = assignedTasks || [];
    const safeVolunteers = activeVolunteers || [];

    useLayoutEffect(() => {
        if (!taskLoading && safeAssignedTasks.length > 0) {
            let ctx = gsap.context(() => {
                gsap.from(".directive-row", {
                    y: 20,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "power2.out",
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [taskLoading, safeAssignedTasks.length]);

    const submitDirective = () => {
        handleAssignTask(newTask);
        // Reset form state after submission
        setNewTask({ title: '', volunteerId: '' });
    };

    return (
        <div ref={containerRef} className="w-full flex flex-col min-h-[500px]">
            
            {/* =========================================
                HEADER BLOCK
                ========================================= */}
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        <Target className="w-6 h-6 text-amber-500" />
                        Active Directives
                    </h2>
                    <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-2">
                        Field Operations & Task Delegation
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-mono uppercase text-amber-500 tracking-widest mb-1 flex items-center justify-end gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /> Active Orders
                        </div>
                        <div className="text-4xl font-black text-white leading-none">
                            {safeAssignedTasks.length.toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================
                ACTION BLOCK (Deploy Directive)
                ========================================= */}
            <div className="mb-8">
                <Dialog open={isAssignTaskOpen} onOpenChange={setIsAssignTaskOpen}>
                    <DialogTrigger asChild>
                        <button className="w-full md:w-auto flex items-center justify-between gap-6 px-8 py-5 border-2 border-white/20 bg-white/[0.02] hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                                <PlusSquare className="w-5 h-5 text-amber-500 group-hover:text-black transition-colors" />
                                <span className="font-black uppercase tracking-widest text-sm">Deploy New Directive</span>
                            </div>
                            <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                        </button>
                    </DialogTrigger>
                    
                    {/* Brutalist Modal Form */}
                    <DialogContent className="bg-[#050505] border-4 border-white sm:max-w-xl p-0 rounded-none shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col">
                        <DialogHeader className="p-6 border-b-2 border-white bg-white text-black shrink-0">
                            <DialogTitle className="font-black uppercase tracking-tighter text-2xl">Issue Directive</DialogTitle>
                            <DialogDescription className="text-[10px] font-mono uppercase tracking-widest text-black/60 mt-1">
                                Assign an operational task to a cleared field volunteer.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="p-8 flex flex-col gap-8 text-white">
                            {/* Input 1: Task Title */}
                            <div className="relative group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-2 group-focus-within:text-amber-500 transition-colors">
                                    01 // Directive Parameters
                                </label>
                                <textarea 
                                    value={newTask.title} 
                                    onChange={(e) => setNewTask(prev => ({...prev, title: e.target.value}))} 
                                    placeholder="Enter precise task details (e.g., Conduct 50 sector calls)..." 
                                    className="w-full bg-transparent border-b-2 border-white/20 text-lg font-medium py-2 outline-none focus:border-amber-500 transition-colors placeholder:text-white/20 min-h-[80px] resize-none"
                                />
                            </div>

                            {/* Input 2: Volunteer Assignment */}
                            <div className="relative">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-2">
                                    02 // Operative Assignment
                                </label>
                                <select 
                                    value={newTask.volunteerId} 
                                    onChange={(e) => setNewTask(prev => ({...prev, volunteerId: e.target.value}))}
                                    className="w-full bg-[#0a0a0a] border-b-2 border-white/20 text-white font-bold uppercase tracking-widest h-14 outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="" disabled className="text-white/20">Select Target Operative</option>
                                    {safeVolunteers.map(v => (
                                        <option key={v._id} value={v._id}>{v.fullName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Submit Action */}
                            <div className="pt-4 flex gap-4">
                                <button 
                                    onClick={() => setIsAssignTaskOpen(false)}
                                    className="px-6 py-4 border border-white/20 text-white/60 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={submitDirective}
                                    disabled={!newTask.title || !newTask.volunteerId}
                                    className="flex-1 px-6 py-4 bg-amber-500 text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Issue Command
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* =========================================
                THE REGISTRY (Task List)
                ========================================= */}
            <div className="flex-1 flex flex-col">
                {taskLoading ? (
                    <div className="flex flex-col items-center justify-center flex-1 opacity-50 py-20">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">Retrieving Directives...</span>
                    </div>
                ) : safeAssignedTasks.length > 0 ? (
                    <div className="border-t-2 border-white/20">
                        {safeAssignedTasks.map((task, index) => {
                            // Determine brutalist status colors
                            const isPending = task.status?.toLowerCase() === 'pending';
                            const isCompleted = task.status?.toLowerCase() === 'completed';
                            
                            return (
                                <div 
                                    key={task._id} 
                                    className="directive-row group flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/10 p-6 md:p-8 bg-white/[0.01] hover:bg-white/5 transition-colors gap-6"
                                >
                                    {/* Directive Info */}
                                    <div className="flex items-start gap-6 lg:w-1/2">
                                        <div className="text-[10px] font-mono text-white/20 mt-1">
                                            DRV_{(index + 1).toString().padStart(2, '0')}
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white group-hover:text-amber-500 transition-colors mb-3 leading-tight pr-4">
                                                {task.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-amber-500" />
                                                    {new Date(task.assignedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:w-1/2 justify-between border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
                                        
                                        {/* Assigned Operative */}
                                        <div>
                                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">
                                                Target Operative
                                            </div>
                                            <div className="text-sm font-bold text-white/80 flex items-center gap-2">
                                                <User className="w-4 h-4 text-white/40" />
                                                {task.volunteerName}
                                            </div>
                                        </div>
                                        
                                        {/* Status Badge */}
                                        <div className="shrink-0 text-left sm:text-right">
                                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">
                                                Current Status
                                            </div>
                                            <div className={cn(
                                                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border inline-flex",
                                                isCompleted ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500" :
                                                isPending ? "border-amber-500/50 bg-amber-500/10 text-amber-500" :
                                                "border-white/30 bg-white/10 text-white"
                                            )}>
                                                {task.status || 'UNKNOWN'}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 py-32 border-y border-white/10 bg-white/[0.02]">
                        <div className="w-16 h-1 bg-white/10 mb-6" />
                        <span className="text-3xl font-black uppercase tracking-tighter text-white/20 mb-2">No Active Directives</span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">The field operative task ledger is currently empty.</span>
                    </div>
                )}
            </div>

        </div>
    );
};