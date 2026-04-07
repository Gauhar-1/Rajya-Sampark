'use client';

import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { RequiredAuth } from '@/components/auth/RequiredAuth';
import type { VolunteerTask, Campaign, GroupChat, AssignedTask, IssuePost } from '@/types';
import { ListTodo, Edit, Trash2, Flag, ShieldAlert, Radio, Cross, ExternalLink, Loader2, Play, CheckSquare, PlusSquare, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateCampaignForm } from '@/components/forms/CreateCampaignForm';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const MENU_ITEMS = [
  { id: 'tasks', label: 'Active Directives', icon: ListTodo, badgeKey: 'tasks' },
  { id: 'posts', label: 'Claimed Escalations', icon: ShieldAlert, badgeKey: 'posts' },
  { id: 'campaigns', label: 'My Initiatives', icon: Flag, badgeKey: 'campaigns' },
  { id: 'chats', label: 'Comms Channels', icon: Radio, badgeKey: 'chats' },
] as const;

type MenuId = typeof MENU_ITEMS[number]['id'];

export default function VolunteerDashboardPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  
  const [activeSection, setActiveSection] = useState<MenuId>('tasks');
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [issuePosts, setIssuePosts] = useState<IssuePost[]>([]);
  
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Defensive arrays
  const safeTasks = tasks || [];
  const safeCampaigns = campaigns || [];
  const safeGroupChats = groupChats || [];
  const safeIssuePosts = issuePosts || [];

  // ==========================================
  // ANIMATIONS
  // ==========================================
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".system-header", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" });
      gsap.from(".nav-item", { x: -30, opacity: 0, duration: 0.6, stagger: 0.05, ease: "power2.out", delay: 0.2 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current,
        { opacity: 0, x: 40, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "power4.out" }
      );
      gsap.from(".data-row", {
        y: 20, opacity: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.1
      });
    }, contentRef);
    return () => ctx.revert();
  }, [activeSection, isLoading]); // Re-run when switching tabs or finished loading

  // ==========================================
  // DATA FETCHING
  // ==========================================
  useEffect(() => {
    if (!token) return;
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [taskRes, campRes, chatRes, postRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/task/volunteer`, { headers: { "Authorization": `Bearer ${token}` } }),
          axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/campaign/volunteer`, { headers: { "Authorization": `Bearer ${token}` } }),
          axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/chat/volunteer`, { headers: { "Authorization": `Bearer ${token}` } }),
          axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/issue`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (taskRes.data.success) setTasks(taskRes.data.data?.tasks || taskRes.data.tasks);
        if (campRes.data.success) setCampaigns(campRes.data.data?.campaigns || campRes.data.campaigns);
        if (chatRes.data.success) setGroupChats(chatRes.data.data?.groups || chatRes.data.groups);
        if (postRes.data.success) setIssuePosts(postRes.data.data?.posts || postRes.data.posts);
      } catch (err) {
        console.error("Failed to load operative data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [token]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleStatusChange = async (taskId: string, newStatus: VolunteerTask['status']) => {
    try {
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/task/${taskId}/status`, { newStatus }, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.data.success) {
        setTasks(prev => prev.map(task => task._id === taskId ? { ...task, status: newStatus } : task));
        toast({ title: "Directive Updated", description: `Status changed to ${newStatus}.` });
      }
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const handleTakePermission = async (id: string) => {
    try {
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/issue/${id}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setIssuePosts(prev => (prev.map(p => p._id == id ? { ...p, status: 'pending' } : p)));
        toast({ title: `Clearance Requested`, description: `Request sent to executive command.` });
      }
    } catch (err) {
      toast({ title: `Request Failed`, variant: 'destructive' });
    }
  };

  const handleDeleteIssue = async (id: string) => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/issue/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setIssuePosts(prev => prev.filter(p => p._id != id));
        toast({ title: 'Record Purged', description: `Escalation removed from your log.` });
      }
    } catch (err) {
      toast({ title: "Purge Failed", variant: "destructive" });
    }
  };

  const handleSaveCampaign = async (campaignData: Campaign) => {
    try {
      if (editingCampaign) {
        const response = await axios.put(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/campaign`, campaignData, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.data.success) {
          const { campaign } = response.data.data || response.data;
          setCampaigns(prev => prev.map(c => c._id === editingCampaign._id ? campaign : c));
          toast({ title: "Initiative Updated" });
        }
      } else {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/campaign`, campaignData, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.data.success) {
          const { campaign } = response.data.data || response.data;
          setCampaigns(prev => [campaign, ...prev]);
          toast({ title: "Initiative Launched" });
        }
      }
      setIsCampaignDialogOpen(false);
      setEditingCampaign(null);
    } catch (err) {
      toast({ title: "Operation Failed", variant: "destructive" });
    }
  };

  const getCount = (key: string) => {
    switch (key) {
      case 'tasks': return safeTasks.length;
      case 'posts': return safeIssuePosts.length;
      case 'campaigns': return safeCampaigns.length;
      case 'chats': return safeGroupChats.length;
      default: return 0;
    }
  };

  return (
    <RequiredAuth allowedRoles={['VOLUNTEER', 'ADMIN']} redirectTo='/'>
      {/* Changed selection color to cyan */}
      <div ref={containerRef} className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans overflow-hidden selection:bg-cyan-400 selection:text-black">
        
        {/* =========================================
            LEFT PANE: THE OPERATIVE DIRECTORY
            ========================================= */}
        <aside className="w-full md:w-[350px] lg:w-[400px] border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#030303] z-20 shrink-0">
          
          {/* Header Block */}
          <div className="system-header p-8 border-b border-white/10">
            <div className="flex items-center gap-2 mb-6">
              {/* Cyan indicator for operatives */}
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Operative Uplink</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
              Field <br/> Terminal
            </h1>
            <p className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Mission Log & Assignments
            </p>
          </div>

          {/* Navigation Matrix */}
          <nav className="flex-1 flex flex-col p-4 gap-2 overflow-y-auto custom-scrollbar">
            {MENU_ITEMS.map((item, index) => {
              const isActive = activeSection === item.id;
              const count = getCount(item.badgeKey);
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "nav-item relative flex items-center justify-between w-full p-4 text-left transition-all duration-300 group overflow-hidden border",
                    isActive 
                      ? "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]" 
                      : "bg-transparent text-white/50 border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <item.icon className={cn("w-5 h-5", isActive ? "text-black" : "text-white/40 group-hover:text-cyan-400 transition-colors")} />
                    <div>
                      <div className="font-black uppercase tracking-tight text-sm md:text-base leading-none mb-1">
                        {item.label}
                      </div>
                      <div className={cn("text-[9px] font-mono uppercase tracking-widest", isActive ? "text-black/60" : "text-white/30")}>
                        Sector_0{index + 1}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-4">
                    <div className={cn(
                      "text-[10px] font-black w-6 h-6 flex items-center justify-center border",
                      isActive ? "bg-black text-cyan-400 border-black" : "bg-white/10 text-white border-white/20"
                    )}>
                      {count}
                    </div>
                  </div>
                  
                  {isActive && <div className="absolute inset-0 bg-white/20 mix-blend-overlay w-1/2 -skew-x-12 -translate-x-10" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* =========================================
            RIGHT PANE: THE MISSION STAGE
            ========================================= */}
        <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-[#050505]">
          <div key={activeSection} ref={contentRef} className="relative z-10 p-6 md:p-12 w-full min-h-full flex flex-col">
            
            {/* Header Context */}
            <div className="mb-10 pb-6 border-b border-white/10 flex justify-between items-end shrink-0">
               <div>
                 <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
                   {MENU_ITEMS.find(i => i.id === activeSection)?.label}
                 </h2>
               </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
               <div className="flex flex-col items-center justify-center flex-1 opacity-50">
                 <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
                 <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Synchronizing Records...</span>
               </div>
            ) : (
              <div className="flex-1 flex flex-col">
                
                {/* =========================================
                    SECTION: TASKS (Directives)
                    ========================================= */}
                {activeSection === 'tasks' && (
                  <div className="flex-1 border-t-2 border-white/20">
                    {safeTasks.length > 0 ? safeTasks.map((task, idx) => {
                      const isCompleted = task.status === 'Completed';
                      const isInProgress = task.status === 'In Progress';
                      return (
                        <div key={task._id} className="data-row flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/10 p-6 md:p-8 bg-white/[0.01] hover:bg-white/5 transition-colors gap-6">
                          <div className="flex items-start gap-6 xl:w-1/2">
                            <div className="text-[10px] font-mono text-white/20 mt-1">DRV_{(idx + 1).toString().padStart(2, '0')}</div>
                            <div>
                              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors">
                                {task.title}
                              </h3>
                              <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                                <span>Asg: {new Date(task.assignedAt).toLocaleDateString()}</span>
                                <span className={cn(
                                  "px-2 py-0.5 border",
                                  isCompleted ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" :
                                  isInProgress ? "border-cyan-400/50 text-cyan-400 bg-cyan-400/10" :
                                  "border-white/20 text-white/50"
                                )}>
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 xl:w-auto shrink-0 mt-4 xl:mt-0">
                            <button 
                              onClick={() => handleStatusChange(task._id, 'In Progress')}
                              disabled={isInProgress || isCompleted}
                              className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white hover:bg-cyan-400 hover:border-cyan-400 hover:text-black font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-white/20 disabled:hover:text-white"
                            >
                              <Play className="w-4 h-4" /> Execute
                            </button>
                            <button 
                              onClick={() => handleStatusChange(task._id, 'Completed')}
                              disabled={isCompleted}
                              className="flex items-center gap-2 px-6 py-3 border border-emerald-500/50 text-emerald-500 hover:bg-emerald-500 hover:text-black font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-emerald-500"
                            >
                              <CheckSquare className="w-4 h-4" /> Conclude
                            </button>
                          </div>
                        </div>
                      )
                    }) : (
                      <EmptyState message="No Active Directives Assigned." />
                    )}
                  </div>
                )}

                {/* =========================================
                    SECTION: POSTS (Escalations)
                    ========================================= */}
                {activeSection === 'posts' && (
                  <div className="flex-1 border-t-2 border-white/20">
                    {safeIssuePosts.length > 0 ? safeIssuePosts.map((post, idx) => {
                      const status = post.status.toLowerCase();
                      return (
                        <div key={post._id} className="data-row flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/10 p-6 md:p-8 bg-white/[0.01] hover:bg-white/5 transition-colors gap-6 group">
                          <div className="flex items-start gap-6 xl:w-1/2">
                            <div className="text-[10px] font-mono text-white/20 mt-1">ESC_{(idx + 1).toString().padStart(2, '0')}</div>
                            <div>
                              <h3 className="text-lg font-bold text-white/80 mb-2 leading-snug line-clamp-2 italic group-hover:text-cyan-400 transition-colors">
                                "{post.postId ? post.postId.content : 'Record Redacted / Deleted'}"
                              </h3>
                              <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                                <span>Log: {new Date(post.createdAt).toLocaleDateString()}</span>
                                <span className={cn(
                                  "px-2 py-0.5 border",
                                  status === 'approved' ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" :
                                  status === 'rejected' ? "border-red-500/50 text-red-500 bg-red-500/10" :
                                  "border-cyan-400/50 text-cyan-400 bg-cyan-400/10" // pending state is cyan
                                )}>
                                  STS: {post.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 xl:w-auto shrink-0 mt-4 xl:mt-0">
                            <Link href={`post/${post.postId ? post.postId._id : ''}`}>
                              <button className="h-full flex items-center gap-2 px-4 py-3 border border-white/20 text-white/70 hover:bg-cyan-400 hover:border-cyan-400 hover:text-black font-black uppercase tracking-widest text-[10px] transition-colors">
                                <ExternalLink className="w-3 h-3" /> Inspect
                              </button>
                            </Link>
                            {status === 'idle' && (
                              <>
                                <button 
                                  onClick={() => handleTakePermission(post._id)}
                                  className="flex items-center gap-2 px-4 py-3 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400 hover:text-black font-black uppercase tracking-widest text-[10px] transition-colors"
                                >
                                  <ShieldAlert className="w-3 h-3" /> Req Clearance
                                </button>
                                <button 
                                  onClick={() => handleDeleteIssue(post._id)}
                                  className="flex items-center gap-2 px-4 py-3 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition-colors"
                                >
                                  <Cross className="w-3 h-3" /> Abort
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    }) : (
                      <EmptyState message="No escalations claimed from field intel." />
                    )}
                  </div>
                )}

                {/* =========================================
                    SECTION: CAMPAIGNS (Initiatives)
                    ========================================= */}
                {activeSection === 'campaigns' && (
                  <div className="flex-1 flex flex-col">
                    <div className="mb-8">
                      <button 
                        onClick={() => { setEditingCampaign(null); setIsCampaignDialogOpen(true); }}
                        className="w-full md:w-auto flex items-center justify-between gap-6 px-8 py-4 border-2 border-white/20 bg-white/[0.02] hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <PlusSquare className="w-5 h-5 text-white/50 group-hover:text-black transition-colors" />
                          <span className="font-black uppercase tracking-widest text-sm">Launch New Initiative</span>
                        </div>
                      </button>
                    </div>

                    <div className="border-t-2 border-white/20">
                      {safeCampaigns.length > 0 ? safeCampaigns.map((camp, idx) => (
                        <div key={camp._id} className="data-row group flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/10 p-6 md:p-8 bg-white/[0.01] hover:bg-white/5 transition-colors gap-6">
                          <div className="flex items-start gap-6 xl:w-1/2">
                            <div className="text-[10px] font-mono text-white/20 mt-1">INT_{(idx + 1).toString().padStart(2, '0')}</div>
                            <div>
                              <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-cyan-400 transition-colors mb-2 leading-tight">
                                {camp.name}
                              </h3>
                              <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                                <span>LOC: {camp.location}</span>
                                <span>|</span>
                                <span>Live: {new Date(camp.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 xl:w-auto shrink-0 mt-4 xl:mt-0">
                            <button 
                              onClick={() => { setEditingCampaign(camp); setIsCampaignDialogOpen(true); }}
                              className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white hover:bg-cyan-400 hover:border-cyan-400 hover:text-black font-black uppercase tracking-widest text-xs transition-colors"
                            >
                              <Edit className="w-4 h-4" /> Modify
                            </button>
                            <button 
                              className="flex items-center gap-2 px-6 py-3 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-xs transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Purge
                            </button>
                          </div>
                        </div>
                      )) : (
                        <EmptyState message="No personal initiatives launched." />
                      )}
                    </div>

                    {/* Brutalist Dialog for Campaign */}
                    <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
                      <DialogContent className="bg-[#050505] border-4 border-cyan-400 sm:max-w-xl p-0 rounded-none shadow-[0_0_50px_rgba(34,211,238,0.3)] max-h-[90vh] overflow-hidden flex flex-col">
                        <DialogHeader className="p-6 border-b-2 border-cyan-400 bg-cyan-400 text-black shrink-0">
                          <DialogTitle className="font-black uppercase tracking-tighter text-2xl">
                            {editingCampaign ? 'Modify Initiative' : 'Initialize Campaign'}
                          </DialogTitle>
                          <DialogDescription className="text-[10px] font-mono uppercase tracking-widest text-black/60 mt-1">
                            Establish parameters for public tracking.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-[#050505] text-white">
                          <CreateCampaignForm
                            onSubmitSuccess={handleSaveCampaign}
                            onOpenChange={setIsCampaignDialogOpen}
                            initialData={editingCampaign}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* =========================================
                    SECTION: CHATS (Comms)
                    ========================================= */}
                {activeSection === 'chats' && (
                  <div className="flex-1 border-t-2 border-white/20">
                    {safeGroupChats.length > 0 ? safeGroupChats.map((chat, idx) => (
                      <Link 
                        key={chat._id} 
                        href={`/chat/${chat._id}?name=${encodeURIComponent(chat.name)}`}
                        className="data-row group flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 p-6 md:p-8 bg-white/[0.01] hover:bg-white/5 transition-colors gap-6"
                      >
                        <div className="flex items-start gap-6">
                          <div className="text-[10px] font-mono text-white/20 mt-1">CH_{(idx + 1).toString().padStart(2, '0')}</div>
                          <div>
                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white group-hover:text-cyan-400 transition-colors mb-2">
                              {chat.name}
                            </h3>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                              CMD: {chat.createdBy?.name || 'UNKNOWN'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0 mt-4 sm:mt-0">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-white/30 mr-2">
                            {chat.members?.length || 0} Operatives
                          </span>
                          <div className="w-12 h-12 border border-white/20 flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black group-hover:border-cyan-400 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </Link>
                    )) : (
                      <EmptyState message="No secure channels assigned to this operative." />
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </main>

      </div>
    </RequiredAuth>
  );
}

// Reusable Empty State component
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-32 border-y border-white/10 bg-white/[0.02]">
    <div className="w-16 h-1 bg-white/10 mb-6" />
    <span className="text-3xl font-black uppercase tracking-tighter text-white/20 mb-2">Log Empty</span>
    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">{message}</span>
  </div>
);