'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Heart, MessageCircle, Share2,
} from 'lucide-react';
import type { FeedItem, hasVoted } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

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
    const [isOptionsClicked, setIsOptionsClicked] = useState<boolean>(false);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (item.likedBy && item.likedBy.length > 0 && user) {
            const isLiked = item.likedBy.find(id => id == user._id);
            setIsLikedByClient(!!isLiked);
        }
    }, [item.likedBy, user]);

    const handleLikeClick = () => {
        if (isLikedByClient) {
            onLike(item._id, 'unlike');
        } else {
            onLike(item._id, 'like');
        }
        setIsLikedByClient(!isLikedByClient);
    };

    const renderMedia = () => {
        if (item.itemType === 'image_post' && item.mediaUrl) {
            return (
                <div className="rounded-md bg-black overflow-hidden border aspect-video relative">
                    <Image
                        className='shadow-2xl'
                        src={item.mediaUrl}
                        alt="Post image"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'contain' }}
                        data-ai-hint={item.mediaDataAiHint || "social media image"}
                        priority={false}
                    />
                </div>
            );
        }
        if (item.itemType === 'video_post' && item.mediaUrl) {
            return (
                <div className="rounded-md overflow-hidden border ">
                    <video src={item.mediaUrl} controls className="w-full aspect-video " data-ai-hint={item.mediaDataAiHint || "social media video"} />
                </div>
            );
        }
        return null;
    };

    const renderContent = () => {
        switch (item.itemType) {
            case 'text_post':
                return <p className="text-sm mb-3 whitespace-pre-wrap">{item.content}</p>;
            case 'image_post':
            case 'video_post':
                return item.content ? <p className="text-sm mb-3 whitespace-pre-wrap">{item.content}</p> : null;
            case 'campaign_created':
                return (
                    <div className="text-sm mb-3 p-3 bg-secondary/30 rounded-md border">
                        <p className="font-semibold">New Campaign Created: {item.campaignName}</p>
                        {item.campaignLocation && <p className="text-xs text-muted-foreground">Location: {item.campaignLocation}</p>}
                        {item.campaignDescription && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.campaignDescription}</p>}
                        <Link href={`/campaigns/${item.campaignId}`}>
                            <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-primary">View Campaign</Button>
                        </Link>
                    </div>
                );
            case 'poll_created':
                return (
                    <div className="text-sm mb-3 p-3 space-y-3">
                        <p className="font-semibold text-base">{item.pollQuestion}</p>
                        <div className="space-y-2">
                            {item.pollOptions.map((option) => {
                                const percentage = item.totalVotes > 0 ? (option.votes / item.totalVotes) * 100 : 0;
                                const isVoted = item.userHasVoted ? item.userHasVoted?.find(vote => vote.profileId == user?._id) : false;
                                return (
                                    <div key={option.id}>
                                        {isVoted ? (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>{option.text}</span>
                                                    <span>{option.votes} vote(s) ({percentage.toFixed(0)}%)</span>
                                                </div>
                                                <Progress value={percentage} className="h-3" />
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => onPollVote?.(item._id, option.id)}
                                            >
                                                {option.text}
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {item.userHasVoted && <p className="text-xs text-muted-foreground text-right mt-2">Total Votes: {item.totalVotes}</p>}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="mb-6 shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="p-4">
                <div className='flex justify-between'>
                    <div className='flex space-x-3 '>
                        <Avatar>
                            {item.profileId?.photoURL ? (
                                <AvatarImage src={item.profileId.photoURL} alt={item.profileId.name} data-ai-hint={item.creatorDataAiHint || "person face"} />
                            ) : null}
                            <AvatarFallback>{item.profileId?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-base font-semibold flex items-center">
                                {item.profileId?.name}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Posted {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <svg aria-label="More options" className="x1lliihq x1n2onr6 x5n08af hover:cursor-pointer" fill="black" height="24" role="img" viewBox="0 0 24 24" width="24"><title>More options</title><circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle></svg>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <Link href={`/post/${item._id}`}>
                                    <DropdownMenuItem
                                        onClick={() => router.push(`/post/${item._id}`)}
                                    >
                                        Go to post
                                    </DropdownMenuItem>
                                </Link>
                                {item.profileId?._id == user?._id && <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => onDelete(item._id)}
                                >
                                    Delete
                                </DropdownMenuItem>}
                                {item.isIssue && (user?.role == 'VOLUNTEER' || user?.role == 'CANDIDATE' || user?.role == 'ADMIN') && <DropdownMenuItem
                                    onClick={() => onIssue(item._id)}
                                >
                                    Take the Issue
                                </DropdownMenuItem>}
                                <DropdownMenuItem
                                    onClick={() => setIsOptionsClicked(false)}
                                >
                                    Cancel
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {renderContent()}
                {renderMedia()}
            </CardContent>
            {(item.itemType === 'text_post' || item.itemType === 'image_post' || item.itemType === 'video_post') && (
                <CardFooter className=" flex justify-around p-2 border-t">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={isLikedByClient ? "text-destructive" : "text-muted-foreground hover:text-destructive"}
                                    onClick={handleLikeClick}
                                    aria-label={isLikedByClient ? `Unlike post, current likes ${item.likes}` : `Like post, current likes = ${item.likes}`}
                                >
                                    <Heart className="h-8 w-8" fill={isLikedByClient ? "currentColor" : "none"} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{'Like'} ({item.likes})</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={`/post/${item._id}`}>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" aria-label={`Comment on post, current comments ${item.comments}`}>
                                        <MessageCircle className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Comment ({item.comments})</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => onShare(item._id)} aria-label={`Share post, current shares ${item.shares}`}>
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Share ({item.shares})</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardFooter>
            )}

        </Card>
    );
}

export default memo(FeedItemCard);
