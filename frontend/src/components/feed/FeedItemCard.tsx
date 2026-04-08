'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Heart, MessageCircle, Share2, MoreHorizontal, 
    ShieldCheck, AlertCircle, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import type { FeedItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface FeedItemCardProps {
    item: FeedItem;
    onPollVote?: (pollId: string, optionId: string) => void;
    onLike: (itemId: string, action: 'like' | 'unlike') => void;
    onDelete: (itemId: string) => void;
    onShare: (itemId: string) => void;
    onIssue: (itemId: string) => void;
}

function FeedItemCard({ item, onPollVote, onLike, onDelete, onShare, onIssue }: FeedItemCardProps) {
    const [isLikedByClient, setIsLikedByClient] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (item.likedBy && user) {
            setIsLikedByClient(item.likedBy.includes(user._id));
        }
    }, [item.likedBy, user]);

    const handleLikeClick = () => {
        onLike(item._id, isLikedByClient ? 'unlike' : 'like');
        setIsLikedByClient(!isLikedByClient);
    };

    const hasIssueTag = ('content' in item && typeof item.content === 'string' ? item.content.toLowerCase().includes('#issue') : false) || item.isIssue;
    const thresholdPercent = Math.min(((item.likes || 0) / 50) * 100, 100);
    const isVerified = thresholdPercent >= 50;
    const isResolved = (item as any).status === 'resolved';

    return (
        <div className={cn(
            "group relative w-full transition-all duration-500 ease-out mb-12",
            "bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl",
            hasIssueTag && !isResolved && "border-amber-500/20 shadow-amber-500/5",
            isResolved && "border-emerald-500/20 shadow-emerald-500/5"
        )}>
            
            {/* 1. LAYER: TECHNICAL METADATA (Top Bar) */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-transparent group-hover:ring-amber-500/20 transition-all">
                        {item.profileId?.photoURL && <AvatarImage src={item.profileId.photoURL} />}
                        <AvatarFallback className="bg-amber-500 text-black font-black text-xs">
                            {item.profileId?.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="text-sm font-black uppercase tracking-tight text-white/90">
                            {item.profileId?.name}
                        </div>
                        <div className="text-[10px] font-mono uppercase text-white/30 tracking-widest">
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasIssueTag && (
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                            isResolved ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                            isVerified ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" :
                            "bg-white/5 text-white/40 border border-white/10"
                        )}>
                            {isResolved ? <CheckCircle2 className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                            {isResolved ? "Resolved" : isVerified ? "Verified Issue" : "Unverified"}
                        </div>
                    )}
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white/30 hover:text-white hover:bg-white/5 rounded-full">
                                <MoreHorizontal className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10 rounded-2xl shadow-2xl">
                            <DropdownMenuItem className="p-3 focus:bg-white/5 cursor-pointer">Copy Stream Link</DropdownMenuItem>
                            {item.profileId?._id === user?._id && (
                                <DropdownMenuItem onClick={() => onDelete(item._id)} className="p-3 text-red-500 focus:bg-red-500/5 cursor-pointer font-bold">
                                    Purge Record
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* 2. LAYER: MAIN CONTENT */}
            <div className="p-8 pt-6">
                {item.content && (
                    <p className={cn(
                        "text-lg font-medium leading-relaxed mb-6",
                        item.content.length < 100 ? "text-2xl font-bold tracking-tight" : "text-base text-white/80"
                    )}>
                        {item.content}
                    </p>
                )}

                {/* Media Render */}
                {item.mediaUrl && (
                    <div className="relative rounded-[1.5rem] overflow-hidden border border-white/5 bg-black/40 shadow-inner group/media">
                        {item.itemType === 'image_post' ? (
                            <div className="aspect-[16/10] relative">
                                <Image 
                                    src={item.mediaUrl} 
                                    alt="Post" 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover/media:scale-105" 
                                />
                            </div>
                        ) : (
                            <video src={item.mediaUrl} controls className="w-full aspect-video" />
                        )}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-4 h-4 text-white" />
                        </div>
                    </div>
                )}

                {/* Poll View */}
                {item.itemType === 'poll_created' && (
                    <div className="mt-4 space-y-3">
                        <h4 className="text-xl font-black uppercase tracking-tight text-amber-500 mb-6">{item.pollQuestion}</h4>
                        <div className="grid gap-3">
                            {item.pollOptions.map((option) => {
                                const percentage = item.totalVotes > 0 ? (option.votes / item.totalVotes) * 100 : 0;
                                const isVoted = item.userHasVoted?.some(v => v.profileId === user?._id);
                                return (
                                    <button 
                                        key={option.id}
                                        disabled={isVoted}
                                        onClick={() => onPollVote?.(item._id, option.id)}
                                        className={cn(
                                            "relative w-full text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden",
                                            isVoted ? "border-white/5 bg-white/5" : "border-white/10 bg-black/40 hover:border-amber-500/50 hover:bg-amber-500/5"
                                        )}
                                    >
                                        <div className="relative z-10 flex justify-between items-center">
                                            <span className="text-sm font-bold uppercase tracking-wide">{option.text}</span>
                                            {isVoted && <span className="text-xs font-mono font-bold text-amber-500">{percentage.toFixed(0)}%</span>}
                                        </div>
                                        {isVoted && (
                                            <div 
                                                className="absolute top-0 left-0 h-full bg-amber-500/10 transition-all duration-1000 ease-out" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. LAYER: ISSUE ENGINE (Conditional) */}
            {hasIssueTag && (
                <div className="px-8 pb-8">
                    <div className={cn(
                        "p-6 rounded-[2rem] border relative overflow-hidden",
                        isResolved ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
                    )}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                {isResolved ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                    {isResolved ? "Case Resolved" : "Verification Threshold"}
                                </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-white/70">{thresholdPercent}% of 50%</span>
                        </div>
                        <Progress value={thresholdPercent} className="h-1.5 bg-white/5" />
                    </div>
                </div>
            )}

            {/* 4. LAYER: INTERACTION HUB (Footer) */}
            <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleLikeClick}
                        className={cn(
                            "flex items-center gap-2 transition-all duration-300 hover:scale-110",
                            isLikedByClient ? "text-amber-500" : "text-white/40 hover:text-amber-500"
                        )}
                    >
                        <Heart className={cn("w-6 h-6", isLikedByClient && "fill-current")} />
                        <span className="text-xs font-bold font-mono">{item.likes || 0}</span>
                    </button>

                    <Link href={`/post/${item._id}`}>
                        <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                            <MessageCircle className="w-6 h-6" />
                            <span className="text-xs font-bold font-mono">{item.comments || 0}</span>
                        </button>
                    </Link>

                    <button 
                        onClick={() => onShare(item._id)}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        <Share2 className="w-6 h-6" />
                    </button>
                </div>

                {(user?.role === 'VOLUNTEER' || user?.role === 'CANDIDATE') && hasIssueTag && !isResolved && (
                    <button 
                        onClick={() => onIssue(item._id)}
                        className="bg-amber-500 text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-amber-500/20"
                    >
                        Action Issue
                    </button>
                )}
            </div>
        </div>
    );
}

export default memo(FeedItemCard);