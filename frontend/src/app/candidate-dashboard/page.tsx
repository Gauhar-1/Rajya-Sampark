'use client';

import { useState, useLayoutEffect, useRef } from 'react';
import { RequiredAuth } from '@/components/auth/RequiredAuth';
import { LayoutDashboard, Users, MessageSquare, UserPlus, ListTodo, AlertCircle, ArrowRight } from 'lucide-react';
import { useAssignTask } from './hooks/use-Assig-task';
import { AssignTask } from './components/AssignTask';
import { VolunteerReq } from './components/VolunteerReq';
import { VolunteerRoster } from './components/VolunteerRoster';
import { useVolunteer } from './hooks/use-volunteer';
import { GroupChat } from './components/GroupChat';
import { Issues } from './components/Issues';
import { Dashboard } from './components/DashBoard';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

// ==========================================
// SYSTEM DIRECTORY (Plain English Menu)
// ==========================================
const MENU_ITEMS = [
  { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard, badgeKey: undefined },
  { id: 'requests', label: 'Pending Applications', icon: UserPlus, badgeKey: 'Pending_Count' },
  { id: 'roster', label: 'Active Team Roster', icon: Users, badgeKey: undefined },
  { id: 'tasks', label: 'Task Management', icon: ListTodo, badgeKey: 'Tasks_Count' },
  { id: 'issues', label: 'Community Issues', icon: AlertCircle, badgeKey: undefined },
  { id: 'chats', label: 'Team Communications', icon: MessageSquare, badgeKey: undefined },
] as const;

type MenuId = typeof MENU_ITEMS[number]['id'];

export default function CandidateDashboardPage() {
  const { Tasks_Count } = useAssignTask();
  const { Pending_Count } = useVolunteer();
  
  const [activeSection, setActiveSection] = useState<MenuId>('dashboard');
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initial Page Load Animation
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".system-header", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" });
      gsap.from(".nav-item", { x: -30, opacity: 0, duration: 0.6, stagger: 0.05, ease: "power2.out", delay: 0.2 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Content Switching Animation (Triggers every time activeSection changes)
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current,
        { opacity: 0, x: 40, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "power4.out" }
      );
    }, contentRef); // Bind to contentRef so it isolates the animation to the right pane
    return () => ctx.revert();
  }, [activeSection]);

  const getBadgeValue = (key?: string) => {
    if (key === 'Pending_Count') return Pending_Count;
    if (key === 'Tasks_Count') return Tasks_Count;
    return 0;
  };

  return (
    <RequiredAuth allowedRoles={['CANDIDATE', 'ADMIN']} redirectTo='/'>
      <div ref={containerRef} className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans overflow-hidden selection:bg-amber-500 selection:text-black">
        
        {/* =========================================
            LEFT PANE: THE EXECUTIVE DIRECTORY
            ========================================= */}
        <aside className="w-full md:w-[350px] lg:w-[400px] border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#030303] z-20 shrink-0">
          
          {/* Header Block */}
          <div className="system-header p-8 border-b border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">Secure Connection</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
              Campaign <br/> Control
            </h1>
            <p className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Authorized Personnel Only
            </p>
          </div>

          {/* Navigation Matrix */}
          <nav className="flex-1 flex flex-col p-4 gap-2 overflow-y-auto custom-scrollbar">
            {MENU_ITEMS.map((item, index) => {
              const isActive = activeSection === item.id;
              const badgeValue = getBadgeValue(item.badgeKey);
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "nav-item relative flex items-center justify-between w-full p-4 text-left transition-all duration-300 group overflow-hidden border",
                    isActive 
                      ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]" 
                      : "bg-transparent text-white/50 border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <item.icon className={cn("w-5 h-5", isActive ? "text-black" : "text-white/40 group-hover:text-amber-500 transition-colors")} />
                    <div>
                      <div className="font-black uppercase tracking-tight text-sm md:text-base leading-none mb-1">
                        {item.label}
                      </div>
                      <div className={cn("text-[9px] font-mono uppercase tracking-widest", isActive ? "text-black/60" : "text-white/30")}>
                        Module_0{index + 1}
                      </div>
                    </div>
                  </div>

                  {/* Indicator / Badge */}
                  <div className="relative z-10 flex items-center gap-4">
                    {(badgeValue || 0) > 0 && (
                      <div className={cn(
                        "text-[10px] font-black w-6 h-6 flex items-center justify-center border",
                        isActive ? "bg-black text-amber-500 border-black" : "bg-white/10 text-white border-white/20 group-hover:border-amber-500 group-hover:text-amber-500"
                      )}>
                        {badgeValue}
                      </div>
                    )}
                    <ArrowRight className={cn(
                      "w-4 h-4 transition-transform duration-300", 
                      isActive ? "text-black translate-x-0 opacity-100" : "-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    )} />
                  </div>
                  
                  {/* Active Background Slide */}
                  {isActive && <div className="absolute inset-0 bg-white/20 mix-blend-overlay w-1/2 -skew-x-12 -translate-x-10" />}
                </button>
              );
            })}
          </nav>

          {/* License / Footer */}
          <div className="p-6 border-t border-white/10 bg-[#050505]">
             <div className="text-[9px] font-mono uppercase tracking-widest text-white/30 flex justify-between">
               <span>License Active</span>
               <span>Enterprise Tier</span>
             </div>
          </div>
        </aside>

        {/* =========================================
            RIGHT PANE: THE STAGE (Content Area)
            ========================================= */}
        <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-[#050505]">
          
          {/* Subtle Background Branding */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.01] uppercase tracking-tighter pointer-events-none select-none">
            {MENU_ITEMS.find(i => i.id === activeSection)?.label.split(' ')[0]}
          </div>

          {/* The `key` prop forces React to completely unmount and remount this div 
            whenever activeSection changes. This ensures our GSAP useLayoutEffect 
            triggers an entrance animation for the newly rendered component.
          */}
          <div key={activeSection} ref={contentRef} className="relative z-10 p-6 md:p-12 w-full h-full">
            
            {/* Context Header for the specific tool */}
            <div className="mb-10 pb-6 border-b border-white/10 flex justify-between items-end">
               <div>
                 <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
                   {MENU_ITEMS.find(i => i.id === activeSection)?.label}
                 </h2>
                 <p className="text-xs font-mono text-amber-500 uppercase tracking-widest mt-2">
                   Active Module
                 </p>
               </div>
            </div>

            {/* The Actual Tool Components */}
            <div className="w-full">
              {activeSection === 'dashboard' && <Dashboard />}
              {activeSection === 'requests' && <VolunteerReq />}
              {activeSection === 'roster' && <VolunteerRoster />}
              {activeSection === 'issues' && <Issues />}
              {activeSection === 'tasks' && <AssignTask />}
              {activeSection === 'chats' && <GroupChat />}
            </div>

          </div>
        </main>

      </div>
    </RequiredAuth>
  );
}