'use client';

import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import MyTree from "@/components/ui/treemap";
import { BarChart, BubbleChart, LineChart, StackedBarChat } from "@/hooks/use-charts";
import { Activity, Crosshair, Users, AlertTriangle, TrendingUp, Map, Zap, Clock } from "lucide-react";
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export const Dashboard = () => {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState('');

    // Live Clock for the Telemetry feel
    useEffect(() => {
        const updateClock = () => setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' LOCAL');
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Aggressive Staggered Reveal
            gsap.from(".dash-module", {
                y: 40,
                opacity: 0,
                scale: 0.98,
                duration: 0.8,
                stagger: 0.05,
                ease: "power4.out",
                delay: 0.1
            });

            // Number Tickers
            const counters = gsap.utils.toArray('.metric-value');
            counters.forEach((counter: any) => {
                const target = parseFloat(counter.getAttribute('data-target'));
                gsap.fromTo(counter, 
                    { innerHTML: 0 },
                    { 
                        innerHTML: target, 
                        duration: 2, 
                        ease: "power3.out", 
                        snap: { innerHTML: 1 },
                        delay: 0.3
                    }
                );
            });
        }, dashboardRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={dashboardRef} className="w-full pb-20">
            
            {/* =========================================
                THE HUD (Heads Up Display) - Top Metrics
                ========================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                
                <div className="dash-module bg-amber-500 text-black p-6 border-2 border-amber-500 relative overflow-hidden group">
                    <div className="absolute top-4 right-4"><Activity className="w-5 h-5 opacity-50" /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Total Verified Support</p>
                    <div className="text-5xl font-black tracking-tighter leading-none metric-value" data-target="14892">0</div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-black/10 w-fit px-2 py-1">
                        <TrendingUp className="w-3 h-3" /> +12% this week
                    </div>
                </div>

                <div className="dash-module bg-[#0a0a0a] text-white p-6 border-2 border-white/10 hover:border-white/30 transition-colors relative">
                    <div className="absolute top-4 right-4"><Crosshair className="w-5 h-5 text-amber-500" /></div>
                    <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Mobilization Target</p>
                    <div className="text-5xl font-black tracking-tighter leading-none metric-value text-white" data-target="25000">0</div>
                    <div className="mt-4 w-full h-1 bg-white/10">
                        <div className="h-full bg-amber-500 w-[60%]" />
                    </div>
                </div>

                <div className="dash-module bg-[#0a0a0a] text-white p-6 border-2 border-white/10 hover:border-white/30 transition-colors relative">
                    <div className="absolute top-4 right-4"><Users className="w-5 h-5 text-emerald-500" /></div>
                    <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Field Operatives Active</p>
                    <div className="flex items-baseline gap-2">
                        <div className="text-5xl font-black tracking-tighter leading-none metric-value text-emerald-500" data-target="342">0</div>
                        <span className="text-sm font-bold text-white/30">/ Deployments</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase text-emerald-500/70">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Tracking
                    </div>
                </div>

                <div className="dash-module bg-[#0a0a0a] text-white p-6 border-2 border-red-500/20 hover:border-red-500/50 transition-colors relative">
                    <div className="absolute top-4 right-4"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
                    <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Critical Open Mandates</p>
                    <div className="text-5xl font-black tracking-tighter leading-none metric-value text-red-500" data-target="18">0</div>
                    <div className="mt-4 text-xs font-bold text-red-500/70 uppercase">
                        Requires Immediate Action
                    </div>
                </div>

            </div>

            {/* =========================================
                THE TACTICAL GRID (Charts & Data)
                ========================================= */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                
                {/* Main Sentiment Trajectory (Left Column, Large) */}
                <div className="dash-module xl:col-span-8 bg-[#050505] border-2 border-white/10 flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <h3 className="font-black uppercase tracking-tight text-lg text-white">Sentiment & Momentum</h3>
                        </div>
                        <span className="text-[10px] font-mono text-white/40 uppercase bg-black px-2 py-1 border border-white/10">
                            30-Day Rolling Average
                        </span>
                    </div>
                    <div className="p-6 flex-1 relative">
                        {/* Assuming LineChart is responsive. Wrapped in a container to enforce bounds */}
                        <div className="absolute inset-6">
                            <LineChart />
                        </div>
                    </div>
                </div>

                {/* Sector Heatmap (Right Column, Tall) */}
                <div className="dash-module xl:col-span-4 bg-[#050505] border-2 border-white/10 flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <Map className="w-4 h-4 text-white/50" />
                            <h3 className="font-black uppercase tracking-tight text-lg text-white">Sector Control</h3>
                        </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-[10px] font-mono text-white/40 uppercase mb-4">Support Density by Region</p>
                        <div className="flex-1 relative border border-white/5 bg-black">
                            <div className="absolute inset-0">
                                <MyTree />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Issues Escalation Feed (Left Column, Bottom) */}
                <div className="dash-module xl:col-span-4 bg-[#050505] border-2 border-white/10 flex flex-col h-[350px]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                        <h3 className="font-black uppercase tracking-tight text-lg text-white">Issue Escalation</h3>
                        <span className="text-red-500 animate-pulse text-[10px] font-black uppercase tracking-widest">Live</span>
                    </div>
                    <div className="p-6 flex-1 relative">
                        <div className="absolute inset-6">
                            <StackedBarChat />
                        </div>
                    </div>
                </div>

                {/* Resource Allocation (Middle Column, Bottom) */}
                <div className="dash-module xl:col-span-5 bg-[#050505] border-2 border-white/10 flex flex-col h-[350px]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                        <h3 className="font-black uppercase tracking-tight text-lg text-white">Resource vs Impact</h3>
                    </div>
                    <div className="p-6 flex-1 relative">
                        <div className="absolute inset-6">
                            <BubbleChart />
                        </div>
                    </div>
                </div>

                {/* Top Mobilizers (Right Column, Bottom) */}
                <div className="dash-module xl:col-span-3 bg-[#050505] border-2 border-white/10 flex flex-col h-[350px]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                        <h3 className="font-black uppercase tracking-tight text-lg text-white">Top Mobilizers</h3>
                    </div>
                    <div className="p-6 flex-1 relative">
                        <div className="absolute inset-6">
                            <BarChart />
                        </div>
                    </div>
                </div>

            </div>

            {/* System Status Footer */}
            <div className="dash-module mt-4 flex justify-between items-center px-4 py-2 border border-white/10 bg-[#0a0a0a]">
                <div className="flex items-center gap-4 text-[10px] font-mono uppercase text-white/30 tracking-widest">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Systems Nominal</span>
                    <span>|</span>
                    <span>Data Sync: Verified</span>
                </div>
                <div className="text-[10px] font-mono text-white/30 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {currentTime}
                </div>
            </div>

        </div>
    );
};