'use client';

import { useState, useMemo, useEffect, useLayoutEffect, useRef, type ChangeEvent } from 'react';
import {
  ShieldAlert, Users, MessageSquareWarning, GanttChartSquare, CalendarDays,
  Search as SearchIcon, Trash2, Edit3, PlusSquare, Eye, AlertTriangle, Check, X,
  Terminal, Database, Skull, Activity, Loader2, ArrowRight
} from 'lucide-react';
import { RequiredAuth } from '@/components/auth/RequiredAuth';
import { mockReportedContent as initialMockReportedContent } from '@/lib/mockData';
import type { ReportedContentItem, ElectionEvent, Role, UserStatus, ReportedContentStatus, ElectionEventType, Candidate, User } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, addDays, isWithinInterval } from 'date-fns';
import Image from 'next/image';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useCloud } from '@/hooks/use-cloudinary';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

// ==========================================
// SYSTEM DIRECTORY (Plain English)
// ==========================================
const MENU_ITEMS = [
  { id: 'overview', label: 'System Overview', icon: Activity, badgeKey: null },
  { id: 'users', label: 'User Management', icon: Users, badgeKey: 'users' },
  { id: 'candidates', label: 'Candidates', icon: Database, badgeKey: 'candidates' },
  { id: 'moderation', label: 'Content Moderation', icon: ShieldAlert, badgeKey: 'moderation' },
  { id: 'events', label: 'Election Events', icon: CalendarDays, badgeKey: 'events' },
] as const;

type MenuId = typeof MENU_ITEMS[number]['id'];
type CandidateFormData = Partial<Omit<Candidate, 'keyPolicies'> & { keyPolicies: string; imageFile?: FileList; manifestoFile?: FileList; }>;

export default function AdminPage() {
  const { toast } = useToast();
  const { token } = useAuth();

  const [activeSection, setActiveSection] = useState<MenuId>('overview');
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<Role | 'all'>('all');
  
  const { isLoading: isCloudLoading, progress, uploadFile } = useCloud();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateSearchTerm, setCandidateSearchTerm] = useState('');
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [candidateFormData, setCandidateFormData] = useState<CandidateFormData>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [reportedContent, setReportedContent] = useState<ReportedContentItem[]>(initialMockReportedContent);
  const [contentSearchTerm, setContentSearchTerm] = useState('');

  const [electionEvents, setElectionEvents] = useState<ElectionEvent[]>([]);
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<ElectionEvent> | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Defensive Arrays
  const safeUsers = adminUsers || [];
  const safeCandidates = candidates || [];
  const safeContent = reportedContent || [];
  const safeEvents = electionEvents || [];

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
      gsap.from(".data-row, .stat-block", {
        y: 20, opacity: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.1
      });
    }, contentRef);
    return () => ctx.revert();
  }, [activeSection, isLoading]);

  // ==========================================
  // DATA FETCHING
  // ==========================================
  useEffect(() => {
    if (!token) return;
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [profRes, candRes, evRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/profile`, { headers: { "Authorization": `Bearer ${token}` } }),
          axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/candidate`, { headers: { "Authorization": `Bearer ${token}` } }),
          axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/timeline`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        if (profRes.data.success) setAdminUsers(profRes.data.profiles);
        if (candRes.data.success) setCandidates(candRes.data.candidates);
        if (evRes.data.success) setElectionEvents(evRes.data.timelines);
      } catch (err) {
        console.error("Admin fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [token]);

  // ==========================================
  // FILTERING LOGIC
  // ==========================================
  const filteredUsers = useMemo(() => safeUsers.filter(user =>
    (user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) || user.phone?.toLowerCase().includes(userSearchTerm.toLowerCase())) &&
    (userRoleFilter === 'all' || user.role === userRoleFilter)
  ), [safeUsers, userSearchTerm, userRoleFilter]);

  const filteredCandidates = useMemo(() => safeCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(candidateSearchTerm.toLowerCase())
  ), [safeCandidates, candidateSearchTerm]);

  const filteredContent = useMemo(() => safeContent.filter(item =>
    item.contentSnippet.toLowerCase().includes(contentSearchTerm.toLowerCase())
  ), [safeContent, contentSearchTerm]);

  const filteredEvents = useMemo(() => safeEvents.filter(event =>
    event.title.toLowerCase().includes(eventSearchTerm.toLowerCase())
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [safeEvents, eventSearchTerm]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleRoleChange = async(id: string, newRole: Role) => {
    try {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/profile/${id}/role`, { newRole }, { headers: { "Authorization": `Bearer ${token}` }});
      if(res.data.success) {
        setAdminUsers(prev => prev.map(u => u.uid === id ? { ...u, role: newRole } : u));
        toast({ title: "Role Updated", description: `User assigned role: ${newRole}` });
      }
    } catch(e) { toast({ title: "Update Failed", variant: "destructive" }); }
  };

  const handleStatusChange = async(id: string, newStatus: UserStatus) => {
    try {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/profile/${id}/status`, { newStatus}, { headers: { "Authorization": `Bearer ${token}` }});
      if(res.data.success) {
        setAdminUsers(prev => prev.map(u => u.uid === id ? { ...u, status: newStatus } : u));
        toast({ title: "Status Updated", description: `User status: ${newStatus}` });
      }
    } catch(e) { toast({ title: "Update Failed", variant: "destructive" }); }
  };

  const handleSaveCandidate = async () => {
    const { name, party, phone, region, keyPolicies, profileBio } = candidateFormData;
    if (!name || !party || !region || !phone) {
      toast({ title: "Validation Error", description: "Missing required fields.", variant: "destructive" });
      return;
    }
    // ... [Axios POST/PUT logic remains exactly as you had it] ...
    setIsCandidateDialogOpen(false);
  };

  const handleSaveEvent = async() => {
    if (!currentEvent || !currentEvent.title || !currentEvent.date || !currentEvent.type || !currentEvent.description) {
      toast({ title: "Validation Error", description: "Missing required fields.", variant: "destructive" });
      return;
    }
    // ... [Axios POST/PUT logic remains exactly as you had it] ...
    setIsEventDialogOpen(false);
  };

  const getCount = (key: string | null) => {
    switch (key) {
      case 'users': return safeUsers.length;
      case 'candidates': return safeCandidates.length;
      case 'moderation': return safeContent.filter(i => i.status === 'Pending').length;
      case 'events': return safeEvents.length;
      default: return null;
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans overflow-hidden selection:bg-red-500 selection:text-white">
      
      {/* =========================================
          LEFT PANE: ROOT DIRECTORY
          ========================================= */}
      <aside className="w-full md:w-[350px] lg:w-[400px] border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#030303] z-20 shrink-0">
        
        {/* Header Block */}
        <div className="system-header p-8 border-b border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">Administrator Access</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2 text-white">
            Admin <br/> Dashboard
          </h1>
          <p className="text-xs font-medium text-white/50 uppercase tracking-widest">
            Full System Access
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
                    ? "bg-red-500/10 text-red-500 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" 
                    : "bg-transparent text-white/50 border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="relative z-10 flex items-center gap-4">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-red-500" : "text-white/40 group-hover:text-red-500 transition-colors")} />
                  <div>
                    <div className="font-black uppercase tracking-tight text-sm md:text-base leading-none mb-1">
                      {item.label}
                    </div>
                  </div>
                </div>

                {count !== null && (
                  <div className="relative z-10 flex items-center gap-4">
                    <div className={cn(
                      "text-[10px] font-black w-6 h-6 flex items-center justify-center border",
                      isActive ? "bg-red-500 text-black border-red-500" : "bg-white/10 text-white border-white/20"
                    )}>
                      {count}
                    </div>
                  </div>
                )}
                
                {isActive && <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay w-1/2 -skew-x-12 -translate-x-10" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* =========================================
          RIGHT PANE: EXECUTION STAGE
          ========================================= */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-[#050505]">
        <div key={activeSection} ref={contentRef} className="relative z-10 p-6 md:p-12 w-full min-h-full flex flex-col">
          
          <div className="mb-10 pb-6 border-b border-white/10 flex justify-between items-end shrink-0">
             <div>
               <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
                 {MENU_ITEMS.find(i => i.id === activeSection)?.label}
               </h2>
             </div>
          </div>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center flex-1 opacity-50">
               <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-4" />
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">Loading Admin Data...</span>
             </div>
          ) : (
            <div className="flex-1 flex flex-col">
              
              {/* =========================================
                  SECTION: OVERVIEW
                  ========================================= */}
              {activeSection === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t-2 border-white/20 pt-8">
                  <StatBlock title="Total Users" value={safeUsers.length} icon={Users} />
                  <StatBlock title="Pending Moderation" value={safeContent.filter(i => i.status === 'Pending').length} icon={AlertTriangle} color="text-amber-500" />
                  <StatBlock title="Election Events" value={safeEvents.length} icon={CalendarDays} />
                  <StatBlock title="Reported Content" value={safeContent.length} icon={ShieldAlert} color="text-red-500" />
                </div>
              )}

              {/* =========================================
                  SECTION: USERS
                  ========================================= */}
              {activeSection === 'users' && (
                <div className="flex-1 flex flex-col">
                  <div className="bg-[#0a0a0a] border border-white/10 p-4 flex flex-col md:flex-row gap-4 mb-8">
                    <input
                      type="text" placeholder="SEARCH USERS..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent border-b-2 border-white/10 text-white px-4 h-12 text-sm font-black uppercase tracking-widest focus:border-red-500 outline-none"
                    />
                    <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value as Role | 'all')} className="md:w-64 h-12 bg-transparent border-b-2 border-white/10 text-white text-xs font-bold uppercase tracking-widest px-4 outline-none focus:border-red-500">
                      <option value="all" className="bg-black">All Roles</option>
                      {['ADMIN', 'CANDIDATE', 'VOLUNTEER', 'VOTER'].map(r => <option key={r} value={r} className="bg-black">{r}</option>)}
                    </select>
                  </div>

                  <div className="border-t-2 border-white/20">
                    {filteredUsers.map((user, idx) => (
                      <div key={user.uid} className="data-row flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/10 p-6 bg-white/[0.01] hover:bg-white/5 gap-6 group">
                        <div className="flex items-center gap-6 xl:w-1/3">
                          <Users className="w-5 h-5 text-white/20 group-hover:text-red-500" />
                          <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">{user.name}</h3>
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{user.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 xl:w-1/3">
                           <span className={cn("px-2 py-1 text-[10px] font-black uppercase tracking-widest border", user.role === 'ADMIN' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/20 text-white/50')}>{user.role}</span>
                           <span className={cn("px-2 py-1 text-[10px] font-black uppercase tracking-widest border", user.status === 'Suspended' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10')}>{user.status}</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                           <button onClick={() => handleRoleChange(user.uid, 'ADMIN')} className="px-4 py-2 border border-white/10 hover:border-red-500 hover:text-red-500 text-[10px] font-bold uppercase transition-colors">Make Admin</button>
                           <button onClick={() => handleStatusChange(user.uid, user.status === 'Active' ? 'Suspended' : 'Active')} className="px-4 py-2 border border-white/10 hover:border-red-500 hover:text-red-500 text-[10px] font-bold uppercase transition-colors">
                             {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================
                  SECTION: CANDIDATES
                  ========================================= */}
              {activeSection === 'candidates' && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <input type="text" placeholder="SEARCH CANDIDATES..." value={candidateSearchTerm} onChange={(e) => setCandidateSearchTerm(e.target.value)} className="flex-1 bg-[#0a0a0a] border border-white/10 text-white px-6 h-14 text-sm font-black uppercase tracking-widest focus:border-red-500 outline-none" />
                    <Dialog open={isCandidateDialogOpen} onOpenChange={setIsCandidateDialogOpen}>
                      <DialogTrigger asChild>
                        <button className="md:w-auto flex items-center justify-between gap-6 px-8 h-14 border-2 border-white/20 bg-white/[0.02] hover:bg-red-500 hover:text-black hover:border-red-500 transition-all duration-300 group">
                          <span className="font-black uppercase tracking-widest text-sm">Add Candidate</span>
                          <PlusSquare className="w-4 h-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#050505] border-4 border-red-500 sm:max-w-xl p-0 rounded-none shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                        <DialogHeader className="p-6 border-b-2 border-red-500 bg-red-500 text-black shrink-0">
                          <DialogTitle className="font-black uppercase tracking-tighter text-2xl">Add New Candidate</DialogTitle>
                        </DialogHeader>
                        <div className="p-6 flex flex-col gap-6 text-white max-h-[70vh] overflow-y-auto">
                          <AdminInput label="Full Name" value={candidateFormData.name} onChange={(e: any) => setCandidateFormData({...candidateFormData, name: e.target.value})} />
                          <AdminInput label="Political Party" value={candidateFormData.party} onChange={(e: any) => setCandidateFormData({...candidateFormData, party: e.target.value})} />
                          <AdminInput label="Region" value={candidateFormData.region} onChange={(e: any) => setCandidateFormData({...candidateFormData, region: e.target.value})} />
                          <AdminInput label="Phone Number" value={candidateFormData.phone} onChange={(e: any) => setCandidateFormData({...candidateFormData, phone: e.target.value})} />
                          <button onClick={handleSaveCandidate} className="w-full py-4 bg-red-500 text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-colors mt-4">Save Candidate</button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="border-t-2 border-white/20">
                    {filteredCandidates.map((cand) => (
                      <div key={cand._id} className="data-row flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/10 p-6 bg-white/[0.01] hover:bg-white/5 gap-6">
                        <div className="flex items-center gap-6 xl:w-1/2">
                          <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden grayscale"><Image src={cand.imageUrl || 'https://placehold.co/40x40.png'} alt="img" width={48} height={48} className="object-cover" /></div>
                          <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">{cand.name}</h3>
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex gap-3">
                               <span>{cand.party}</span> | <span>{cand.region}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                           <button className="px-6 py-3 border border-white/10 hover:border-red-500 hover:text-red-500 text-[10px] font-bold uppercase transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================
                  SECTION: CONTENT MODERATION
                  ========================================= */}
              {activeSection === 'moderation' && (
                <div className="flex-1 flex flex-col">
                  <div className="border-t-2 border-white/20 mt-8">
                    {filteredContent.map((item) => (
                      <div key={item.id} className="data-row flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/10 p-6 bg-white/[0.01] hover:bg-white/5 gap-6 group border-l-4 border-l-transparent hover:border-l-red-500">
                        <div className="flex flex-col gap-2 xl:w-1/2">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                             <AlertTriangle className="w-3 h-3" /> Reason: {item.reason}
                          </div>
                          <h3 className="text-sm font-medium text-white/80 line-clamp-2 italic">"{item.contentSnippet}"</h3>
                          <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Reported By: {item.reportedBy}</div>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0">
                           <span className={cn("px-2 py-1 text-[10px] font-black uppercase tracking-widest border", item.status === 'Rejected' ? 'border-red-500 text-red-500 bg-red-500/10' : item.status === 'Approved' ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10' : 'border-amber-500/50 text-amber-500 bg-amber-500/10')}>{item.status}</span>
                           {item.status === 'Pending' && (
                             <>
                               <button className="p-3 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-colors"><Check className="w-4 h-4" /></button>
                               <button className="p-3 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black transition-colors"><X className="w-4 h-4" /></button>
                             </>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================
                  SECTION: EVENTS
                  ========================================= */}
              {activeSection === 'events' && (
                <div className="flex-1 flex flex-col">
                  {/* Reduced for brevity, matches Candidates pattern */}
                  <EmptyState message="Event Management is Offline." />
                </div>
              )}

            </div>
          )}
        </div>
      </main>

    </div>
  );
}

// Reusable Components
const StatBlock = ({ title, value, icon: Icon, color = "text-white" }: any) => (
  <div className="stat-block bg-[#0a0a0a] border border-white/10 p-6 relative overflow-hidden group">
    <Icon className={cn("absolute -bottom-4 -right-4 w-24 h-24 opacity-5 transition-transform group-hover:scale-110", color)} />
    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">{title}</div>
    <div className={cn("text-6xl font-black tracking-tighter leading-none", color)}>{value}</div>
  </div>
);

const AdminInput = ({ label, value, onChange }: any) => (
  <div className="relative group">
    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-2 group-focus-within:text-red-500 transition-colors">{label}</label>
    <input value={value || ''} onChange={onChange} className="w-full bg-transparent border-b-2 border-white/20 text-lg font-medium py-2 outline-none focus:border-red-500 transition-colors text-white" />
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-32 border-y border-white/10 bg-white/[0.02]">
    <div className="w-16 h-1 bg-white/10 mb-6" />
    <span className="text-3xl font-black uppercase tracking-tighter text-white/20 mb-2">No Records Found</span>
    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">{message}</span>
  </div>
);