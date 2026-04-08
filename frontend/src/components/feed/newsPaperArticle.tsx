'use client';

import { useState } from 'react';
import { PenTool, ThumbsUp, Share2, Play, AlertTriangle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Import your hooks
import { useUpdateLikes } from '@/app/feed/hook/usePost'; 
import { useAuth } from '@/contexts/AuthContext'; // Import Auth Context

interface ArticleProps {
  item: any;
  variant: 'lead' | 'sidebar' | 'standard';
}

export default function NewspaperArticle({ item, variant }: ArticleProps) {
  const { user } = useAuth();

  // Safe extraction of initial likes
  const initialLikes = Array.isArray(item.likes) ? item.likes.length : (item.likes || 0);
  
  // Robust check to see if the current user's ID is in the likedBy array
  // This handles both raw string IDs and populated user objects
  const hasUserLiked = user && Array.isArray(item.likedBy) 
    ? item.likedBy.some((liker: any) => liker === user._id || liker._id === user._id)
    : (item.isLiked || false);

  // Local state for Optimistic UI Updates
  const [endorsed, setEndorsed] = useState(hasUserLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);

  // The React Query Mutation
  const { mutate: toggleLike, isPending } = useUpdateLikes();

  const handleEndorse = () => {
    if (isPending || !user) return; // Optionally prevent unauthenticated clicks

    // 1. Optimistic UI Update (Immediate visual feedback)
    const newEndorsedState = !endorsed;
    setEndorsed(newEndorsedState);
    setLikeCount((prev: number) => newEndorsedState ? prev + 1 : prev - 1);

    // 2. Fire the API Call 
    toggleLike(
      { 
        id: item._id, 
        action: newEndorsedState ? 'like' : 'unlike' 
      }, 
      {
        onError: () => {
          // Revert UI if the network request crashes
          setEndorsed(!newEndorsedState);
          setLikeCount((prev: number) => newEndorsedState ? prev - 1 : prev + 1);
          console.error("Failed to register endorsement with the public record.");
        }
      }
    );
  };

  const isIssue = item.content?.toLowerCase().includes('#issue') || item.isIssue;
  const isPoll = item.itemType === 'poll_created' || item.pollOptions;
  const isVideo = item.itemType === 'video_post' || (item.mediaUrl && item.mediaUrl.match(/\.(mp4|webm)$/i));
  const isImage = item.itemType === 'image_post';
  
  // Safe Fallbacks in case older posts don't have a title field yet
  const headline = item.title || "UNVERIFIED PUBLIC RECORD";
  const bodyText = item.content || "No detailed report was provided with this submission.";

  // Shared Interaction Footer 
  const EditorialFooter = () => (
    <div className="mt-6 pt-4 flex items-center justify-between border-t-2 border-white/20 font-mono text-[10px] uppercase tracking-widest relative z-10 clear-both">
      <button 
        onClick={handleEndorse}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 font-black transition-all", 
          endorsed ? "text-amber-500 scale-105" : "text-white/50 hover:text-white"
        )}
      >
        <ThumbsUp className={cn("w-4 h-4 transition-transform", endorsed && "fill-amber-500")} /> 
        {endorsed ? "Verified" : "Verify Record"} ({likeCount})
      </button>
      <Link href={item.itemType === 'poll_created' ? `/polls/${item._id}` : `/post/${item._id}`} className="flex gap-6 text-white/40">
        <button className="hover:text-white flex items-center gap-1"><PenTool className="w-3 h-3" /> {item.comments || 0}</button>
        <button className="hover:text-white"><Share2 className="w-4 h-4" /></button>
      </Link>
      {endorsed && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 border-[3px] border-amber-500 text-amber-500 font-black uppercase text-3xl p-1 tracking-tighter rotate-[-15deg] mix-blend-screen pointer-events-none opacity-90 animate-in fade-in zoom-in duration-300">
          ENDORSED
        </div>
      )}
    </div>
  );

  if (isIssue) return <IssueNotice item={item} headline={headline} bodyText={bodyText} variant={variant} Footer={EditorialFooter} />;
  if (isPoll) return <PublicCensus item={item} headline={headline} bodyText={bodyText} variant={variant} Footer={EditorialFooter} />;
  if (isVideo) return <KineticBroadcast item={item} headline={headline} bodyText={bodyText} variant={variant} Footer={EditorialFooter} />;
  if (isImage) return <PhotoFeature item={item} headline={headline} bodyText={bodyText} variant={variant} Footer={EditorialFooter} />;
  return <EditorialText item={item} headline={headline} bodyText={bodyText} variant={variant} Footer={EditorialFooter} />;
}

// ==========================================
// 1. THE EDITORIAL (Text Only)
// ==========================================
const EditorialText = ({ item, headline, bodyText, variant, Footer }: any) => (
  <div className="flex flex-col h-full block">
    <div className="text-[10px] font-mono uppercase tracking-widest text-white/50 border-b-4 border-white mb-4 pb-2">
      Opinion & Editorial // {item.profileId?.name || "Citizen"}
    </div>
    
    <h2 className={cn("font-serif font-black uppercase tracking-tighter text-white mb-6 leading-[0.85] text-justify", 
      variant === 'lead' ? "text-6xl lg:text-[6vw]" : "text-4xl"
    )}>
      {headline}
    </h2>

    <div className={cn("font-serif text-white/90 leading-relaxed text-justify",
      variant === 'lead' ? "md:columns-2 gap-8 text-lg" : "text-sm columns-1"
    )}>
      <span className="first-letter:text-7xl first-letter:font-black first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:leading-[0.7]">
        {bodyText}
      </span>
    </div>
    <Footer />
  </div>
);

// ==========================================
// 2. PHOTO FEATURE (Image Post)
// ==========================================
const PhotoFeature = ({ item, headline, bodyText, variant, Footer }: any) => (
  <div className="block h-full w-full">
    
    <h2 className={cn("font-serif font-black uppercase tracking-tighter text-white mb-4 leading-[0.9]", 
      variant === 'lead' ? "text-5xl lg:text-7xl" : "text-3xl"
    )}>
      {headline}
    </h2>

    <div className={cn("float-left mr-6 mb-2 border-4 border-white/10 bg-white/5 p-1",
      variant === 'lead' ? "w-[55%] sm:w-[45%]" : "w-[60%]"
    )}>
      <div className="aspect-[4/3] bg-black relative group overflow-hidden">
        <img 
          src={item.mediaUrl} 
          className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 hover:scale-105" 
          alt="Evidence" 
        />
      </div>
      <div className="text-[9px] font-mono uppercase tracking-widest text-amber-500 mt-2 text-right">
        Fig 1. Source: {item.profileId?.name || "Citizen"}
      </div>
    </div>

    <div className={cn("font-serif text-white/80 leading-relaxed text-justify", 
      variant === 'lead' ? "text-base sm:text-lg" : "text-sm"
    )}>
       <span className="first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8]">
        {bodyText}
      </span>
    </div>
    
    <Footer />
  </div>
);

// ==========================================
// 3. KINETIC BROADCAST (Video Post)
// ==========================================
const KineticBroadcast = ({ item, headline, bodyText, variant, Footer }: any) => (
  <div className="block h-full bg-[#0a0a0a] -mx-8 -mt-8 p-8 border-b-4 border-white/10">
    <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-white/50 mb-4 clear-both">
      <span>Kinetic Broadcast</span>
      <span className="flex items-center gap-1 text-red-500"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Record</span>
    </div>

    <div className="float-right w-[60%] sm:w-[50%] ml-6 mb-4 border border-white/20 relative bg-black group cursor-pointer hover:border-white/50 transition-colors">
      <video src={item.mediaUrl} className="w-full aspect-video object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white rounded-full flex items-center justify-center pl-1 sm:pl-2 bg-black/50 backdrop-blur-sm group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
      </div>
    </div>

    <h2 className="font-serif font-black uppercase tracking-tighter text-white leading-[0.9] text-3xl sm:text-4xl mb-4">
      {headline}
    </h2>
    
    <div className="font-serif text-white/80 text-sm leading-relaxed text-justify">
      {bodyText}
    </div>
    
    <Footer />
  </div>
);

// ==========================================
// 4. PUBLIC CENSUS (Poll Post)
// ==========================================
const PublicCensus = ({ item, headline, bodyText, variant, Footer }: any) => {
  const options = item.pollOptions || [{ text: "Agree", votes: 64 }, { text: "Disagree", votes: 36 }];
  const totalVotes = options.reduce((acc: number, curr: any) => acc + (curr.votes || 0), 0) || 100;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white mb-6 border-y-2 border-white py-2">
        <BarChart3 className="w-4 h-4" /> Public Consensus Data
      </div>
      <h2 className={cn("font-serif font-black uppercase tracking-tighter text-white mb-4 leading-[0.9]", variant === 'lead' ? "text-5xl" : "text-3xl")}>
        {headline}
      </h2>
      
      {bodyText && (
        <p className="font-serif text-white/70 text-sm mb-6 text-justify">
          {bodyText}
        </p>
      )}

      <div className="flex flex-col gap-4 mb-8">
        {options.map((opt: any, i: number) => {
          const percent = Math.round(((opt.votes || 0) / totalVotes) * 100) || 0;
          return (
            <div key={i} className="relative w-full border border-white/20 bg-white/[0.02] p-4 cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all">
              <div className="absolute top-0 left-0 h-full bg-white/10 transition-all duration-1000 ease-out" style={{ width: `${percent}%` }} />
              <div className="relative z-10 flex justify-between items-center font-mono text-xs uppercase tracking-widest text-white">
                <span className="font-bold">{opt.text}</span>
                <span>{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[9px] font-mono text-white/40 uppercase text-right mt-auto">Total Data Points: {totalVotes}</div>
      <Footer />
    </div>
  );
};

// ==========================================
// 5. OFFICIAL NOTICE (Issue Post)
// ==========================================
const IssueNotice = ({ item, headline, bodyText, variant, Footer }: any) => (
  <div className="flex flex-col h-full border-4 border-amber-500 p-6 bg-amber-500/5 relative overflow-hidden">
    <div className="absolute -right-10 top-10 bg-amber-500 text-black font-black uppercase text-[10px] tracking-[0.3em] py-1 px-12 rotate-45">
      Priority
    </div>
    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-4">
      <AlertTriangle className="w-4 h-4" /> Official Public Notice
    </div>
    
    <h2 className="font-sans font-black uppercase tracking-tight text-white text-3xl md:text-4xl mb-4 leading-[0.9]">
      {headline}
    </h2>
    
    <div className="font-mono text-sm text-white/80 leading-relaxed mb-6 border-l-2 border-amber-500 pl-4 py-2 text-justify">
      {bodyText}
    </div>
    
    <div className="grid grid-cols-2 gap-4 border-t border-amber-500/30 pt-4 mt-auto">
      <div>
        <div className="text-[8px] uppercase tracking-widest text-amber-500/60 mb-1">Filed By</div>
        <div className="font-mono text-xs text-white truncate">{item.profileId?.name || "Anonymous"}</div>
      </div>
      <div>
        <div className="text-[8px] uppercase tracking-widest text-amber-500/60 mb-1">Status</div>
        <div className="font-mono text-xs text-amber-500">Awaiting Resolution</div>
      </div>
    </div>
    <Footer />
  </div>
);