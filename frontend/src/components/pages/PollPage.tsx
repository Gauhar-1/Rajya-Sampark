'use client';

import { useState, useRef, useLayoutEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare, Share2, ArrowLeft, PenTool, Loader2, BarChart3, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import Link from "next/link";
// Make sure to import the useVotePoll hook!
import { usePostById, useComments, usePostComment, useVotePoll } from "@/app/feed/hook/usePost"; 
import { useAuth } from "@/contexts/AuthContext";

interface PollPageProps {
  postId: string;
}

export default function PollPage({ postId }: PollPageProps) {
  const [commentText, setCommentText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // ==========================================
  // DATA FETCHING & MUTATIONS (React Query)
  // ==========================================
  const { data: item, isLoading: isPostLoading } = usePostById(postId);
  const { data: comments = [], isLoading: isCommentsLoading } = useComments(postId);
  const { mutate: postComment, isPending: isPostingComment } = usePostComment();
  const { mutate: votePoll, isPending: isVoting } = useVotePoll();

  const isLoading = isPostLoading || isCommentsLoading;

  // ==========================================
  // ANIMATIONS
  // ==========================================
  useLayoutEffect(() => {
    if (!isLoading && item) {
      let ctx = gsap.context(() => {
        gsap.from(".article-reveal", {
          y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out"
        });
        gsap.from(".poll-bar-reveal", {
          scaleX: 0, transformOrigin: "left center", duration: 1.2, stagger: 0.1, ease: "expo.out", delay: 0.3
        });
        gsap.from(".comment-reveal", {
          x: 20, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.4
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, item]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleComment = () => {
    if (!postId || !commentText.trim()) return;
    postComment({
      content: commentText,
      timestamp: new Date().toISOString(),
      postId: postId
    }, {
      onSuccess: () => setCommentText("") 
    });
  };

  const handleVote = (optionId: string) => {
    if (!postId || isVoting) return;
    votePoll({ id: postId, optionId });
  };

  // ==========================================
  // RENDER STATES
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030303] text-white">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-6" />
        <div className="font-mono text-amber-500 uppercase tracking-[0.3em] text-xs">Retrieving Census Data...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303] text-white">
        <div className="border-4 border-white p-8 text-center max-w-md">
          <h2 className="text-3xl font-black uppercase mb-4">Record Not Found</h2>
          <p className="font-mono text-sm text-white/50 uppercase tracking-widest mb-8">This public inquiry has been closed or redacted.</p>
          <Link href="/feed">
            <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-amber-500 transition-colors">Return to Edition</button>
          </Link>
        </div>
      </div>
    );
  }

  // Fallbacks depending on your specific API schema mapping
  const headline = item.pollQuestion || item.content || "PUBLIC CENSUS INQUIRY";
  const bodyText = item.description || "The following parameters have been set for public response. Please select the option that best represents your civic stance. Data is recorded immutably.";
  
  const options = item.pollOptions || [];
  const totalVotes = options.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] text-white pt-8 pb-24 selection:bg-amber-500 selection:text-black">
      
      {/* 1. TOP NAVIGATION / DATELINE */}
      <div className="max-w-[1400px] mx-auto px-6 mb-8 flex justify-between items-end border-b-2 border-white/20 pb-4">
        <Link href="/feed" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:text-amber-500 transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to BroadSheet
        </Link>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 text-right">
          <div>Archival Record</div>
          <div>{format(new Date(item.timestamp || Date.now()), "PPP 'at' p")}</div>
        </div>
      </div>

      {/* 2. THE MAIN GRID */}
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 border-[12px] border-double border-white/80 bg-[#050505] relative">
        
        {/* =========================================
            LEFT PANE: THE PUBLIC CENSUS
            ========================================= */}
        <article className="lg:col-span-8 p-8 md:p-12 lg:border-r-[6px] lg:border-white/80 flex flex-col min-h-[80vh] block">
          
          {/* Header/Byline */}
          <div className="article-reveal flex items-center justify-between mb-8 border-b border-white/20 pb-4 clear-both">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-white/20 flex items-center justify-center bg-white/5 text-amber-500">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black uppercase tracking-tight text-lg leading-none">Public Inquiry</div>
                <div className="text-[9px] font-mono text-amber-500 uppercase tracking-widest mt-1">Initiated by {item.profileId?.name || "Citizen"}</div>
              </div>
            </div>
            <div className="bg-white/10 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-center">
              <div>Poll ID: {item._id?.slice(-8) || "UNKNOWN"}</div>
              <div className="text-amber-500 mt-1">{totalVotes} Signatures</div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="article-reveal font-serif font-black uppercase tracking-tighter text-5xl md:text-[5vw] leading-[0.9] text-white mb-8 text-justify break-words clear-both">
            {headline}
          </h1>

          {/* Context Text */}
          <div className="article-reveal font-serif text-lg text-white/70 leading-relaxed text-justify mb-10 border-l-2 border-amber-500 pl-4 py-2">
            {bodyText}
          </div>

          {/* INTERACTIVE POLL OPTIONS */}
          <div className="article-reveal flex-1 flex flex-col gap-4 mb-12">
            {options.map((opt: any, index: number) => {
              // Avoid division by zero
              const percent = totalVotes === 0 ? 0 : Math.round(((opt.votes || 0) / totalVotes) * 100);
              
              return (
                <button 
                  key={opt._id || index}
                  onClick={() => handleVote(opt._id)}
                  disabled={isVoting}
                  className="group relative w-full border-2 border-white/20 bg-white/5 p-5 md:p-6 text-left overflow-hidden transition-all hover:border-amber-500 disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  {/* The Background Progress Bar */}
                  <div 
                    className="poll-bar-reveal absolute top-0 left-0 h-full bg-white/10 transition-all duration-1000 ease-out group-hover:bg-white/20" 
                    style={{ width: `${percent}%` }} 
                  />
                  
                  {/* The Content */}
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono font-bold text-white/30 group-hover:text-amber-500 transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="font-sans font-bold text-lg md:text-xl uppercase tracking-wider text-white">
                        {opt.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm text-white/50">{opt.votes || 0} Votes</span>
                      <span className="font-black text-2xl md:text-3xl text-amber-500 w-16 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>

                  {/* Loading Overlay for this specific option if voting */}
                  {isVoting && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="article-reveal mt-auto border-t-4 border-white/20 pt-6 flex justify-between items-center font-mono text-[10px] uppercase tracking-widest clear-both">
            <div className="flex items-center gap-2 text-white/50">
              <CheckCircle2 className="w-4 h-4" /> Live Tally Active
            </div>
            <div className="flex gap-6">
              <span className="flex items-center gap-2 text-white/50"><PenTool className="w-4 h-4"/> {comments.length} Statements</span>
              <button className="hover:text-amber-500 transition-colors flex items-center gap-2 text-white/50"><Share2 className="w-4 h-4"/> Broadcast</button>
            </div>
          </div>
        </article>

        {/* =========================================
            RIGHT PANE: PUBLIC DISCOURSE (Comments)
            ========================================= */}
        <aside className="lg:col-span-4 bg-white/[0.02] flex flex-col h-[80vh] lg:h-auto border-t-[6px] lg:border-t-0 border-white/80">
          
          <div className="p-6 border-b-[6px] border-white/80 bg-white text-black">
            <h2 className="font-black uppercase text-2xl tracking-tighter leading-none mb-1">Public Discourse</h2>
            <p className="font-mono text-[9px] uppercase tracking-widest opacity-60">Verified Community Statements</p>
          </div>

          {/* Comment List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
            {comments.length > 0 ? comments.map((comment: any) => (
              <div key={comment._id} className="comment-reveal border-l-2 border-white/20 pl-4 relative group hover:border-amber-500 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden grayscale">
                    {comment.profileId?.photoURL ? (
                      <img src={comment.profileId.photoURL} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-bold bg-white text-black">
                        {comment.profileId?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs uppercase tracking-tight text-white">{comment.profileId?.name || "Citizen"}</div>
                    <div className="text-[8px] font-mono text-white/40 uppercase">{formatDistanceToNow(new Date(comment.timestamp || Date.now()))} ago</div>
                  </div>
                </div>
                <p className="font-serif text-sm text-white/80 leading-snug">
                  {comment.content}
                </p>
              </div>
            )) : (
              <div className="m-auto text-center opacity-30">
                <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                <p className="font-mono text-[10px] uppercase tracking-widest">No Statements Recorded</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t-[6px] border-white/80 bg-[#0a0a0a]">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Submit Statement</div>
            <div className="flex flex-col gap-3">
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="ENTER PUBLIC STATEMENT..."
                className="w-full bg-transparent border-b-2 border-white/20 text-sm font-medium py-2 outline-none focus:border-amber-500 transition-colors text-white resize-none min-h-[60px] placeholder:text-white/20 uppercase"
              />
              <button 
                onClick={handleComment}
                disabled={!commentText.trim() || isPostingComment}
                className="w-full py-4 flex items-center justify-center gap-2 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isPostingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 bg-black rounded-full group-hover:scale-150 transition-transform" />
                )}
                {isPostingComment ? "Publishing..." : "Publish Record"}
              </button>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}