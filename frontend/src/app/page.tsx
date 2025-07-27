
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Heart, MessageCircle, Share2,
  Edit3, BarChart2, Video as VideoIcon, Search as SearchIcon
} from 'lucide-react';
import { initialFeedItems as mockInitialFeedItems } from '@/lib/mockData';
import type { FeedItem, TextPostFeedItem, ImagePostFeedItem, VideoPostFeedItem, CampaignFeedItem, PollFeedItem, PollOption as FeedPollOption, Campaign, Poll } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreatePostForm } from '@/components/forms/CreatePostForm';
import { CreatePollForm } from '@/components/forms/CreatePollForm';
import { CreateVideoForm } from '@/components/forms/CreateVideoForm';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';


interface FeedItemCardProps {
  item: FeedItem;
  onPollVote?: (pollId: string, optionId: string) => void;
  onLike: (itemId: string, action: 'like' | 'unlike') => void;
  onComment: (itemId: string) => void;
  onShare: (itemId: string) => void;
}

function FeedItemCard({ item, onPollVote, onLike, onComment, onShare }: FeedItemCardProps) {
  const [isLikedByClient, setIsLikedByClient] = useState(false);

  const handleLikeClick = () => {
    if (isLikedByClient) {
      onLike(item.id, 'unlike');
    } else {
      onLike(item.id, 'like');
    }
    setIsLikedByClient(!isLikedByClient);
  };

  const renderMedia = () => {
    if (item.itemType === 'image_post' && item.mediaUrl) {
      return (
        <div className="rounded-md overflow-hidden border aspect-video relative">
          <Image
            src={item.mediaUrl}
            alt="Post image"
            layout="fill"
            objectFit="cover"
            data-ai-hint={item.mediaDataAiHint || "social media image"}
          />
        </div>
      );
    }
    if (item.itemType === 'video_post' && item.mediaUrl) {
      return (
        <div className="rounded-md overflow-hidden border">
          <video src={item.mediaUrl} controls className="w-full aspect-video" data-ai-hint={item.mediaDataAiHint || "social media video"}/>
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
                return (
                  <div key={option.id}>
                    {item.userHasVoted ? (
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
                        onClick={() => onPollVote?.(item.pollId, option.id)}
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
      <CardHeader className="flex flex-row items-center space-x-3 p-4">
        <Avatar>
          {item.creatorImageUrl ? (
            <AvatarImage src={item.creatorImageUrl} alt={item.creatorName} data-ai-hint={item.creatorDataAiHint || "person face"} />
          ) : null}
          <AvatarFallback>{item.creatorName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base font-semibold flex items-center">
            {item.creatorName}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Posted {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {renderContent()}
        {renderMedia()}
      </CardContent>
      {(item.itemType === 'text_post' || item.itemType === 'image_post' || item.itemType === 'video_post') && (
        <CardFooter className="flex justify-around p-2 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={isLikedByClient ? "text-destructive" : "text-muted-foreground hover:text-destructive"}
                  onClick={handleLikeClick}
                  aria-label={isLikedByClient ? `Unlike post, current likes ${item.likes}` : `Like post, current likes ${item.likes}`}
                >
                  <Heart className="h-5 w-5" fill={isLikedByClient ? "currentColor" : "none"} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLikedByClient ? 'Unlike' : 'Like'} ({item.likes})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => onComment(item.id)} aria-label={`Comment on post, current comments ${item.comments}`}>
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Comment ({item.comments})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => onShare(item.id)} aria-label={`Share post, current shares ${item.shares}`}>
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


export default function HomePage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(mockInitialFeedItems);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const { toast } = useToast();

  const addNewFeedItem = (newItem: FeedItem) => {
    setFeedItems(prevItems =>
      [newItem, ...prevItems].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    );
  };

  const handleCreatePost = (newPost: TextPostFeedItem | ImagePostFeedItem) => {
    addNewFeedItem({ ...newPost, likes: 0, comments: 0, shares: 0 });
    setIsPostDialogOpen(false);
  };

  const handleCreatePoll = (newPollData: Poll) => {
     const pollFeedItem: PollFeedItem = {
      id: `feed-poll-${newPollData.id}`,
      timestamp: new Date().toISOString(),
      itemType: 'poll_created',
      creatorName: 'Current User', // Placeholder
      creatorImageUrl: 'https://placehold.co/40x40.png?text=CU',
      creatorDataAiHint: 'person face',
      pollId: newPollData.id,
      pollQuestion: newPollData.question,
      pollOptions: newPollData.options.map(opt => ({ ...opt, votes: 0 })),
      totalVotes: 0,
      userHasVoted: false,
      likes: 0, // Polls don't have likes/comments/shares in this model
      comments: 0,
      shares: 0,
    };
    addNewFeedItem(pollFeedItem);
    setIsPollDialogOpen(false);
  };

  const handleCreateVideo = (newVideo: VideoPostFeedItem) => {
    addNewFeedItem({ ...newVideo, likes: 0, comments: 0, shares: 0 });
    setIsVideoDialogOpen(false);
  };

  const handlePollVote = (pollId: string, optionId: string) => {
    setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item.itemType === 'poll_created' && item.pollId === pollId && !item.userHasVoted) {
          const newOptions = item.pollOptions.map(opt =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...item,
            pollOptions: newOptions,
            totalVotes: item.totalVotes + 1,
            userHasVoted: true,
          };
        }
        return item;
      })
    );
  };

  const handleLike = (itemId: string, action: 'like' | 'unlike') => {
    setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId && (item.itemType === 'text_post' || item.itemType === 'image_post' || item.itemType === 'video_post')) {
          const newLikes = action === 'like' ? item.likes + 1 : Math.max(0, item.likes - 1);
          return { ...item, likes: newLikes };
        }
        return item;
      })
    );
  };

  const handleComment = (itemId: string) => {
    setFeedItems(prevItems =>
      prevItems.map(item => {
         if (item.id === itemId && (item.itemType === 'text_post' || item.itemType === 'image_post' || item.itemType === 'video_post')) {
          return { ...item, comments: item.comments + 1 };
        }
        return item;
      }
      )
    );
    toast({ title: "Commented!", description: "Your comment has been (conceptually) added." });
    // console.log(`Comment action on item: ${itemId}`);
  };

  const handleShare = (itemId: string) => {
     setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId && (item.itemType === 'text_post' || item.itemType === 'image_post' || item.itemType === 'video_post')) {
          return { ...item, shares: item.shares + 1 };
        }
        return item;
      }
      )
    );
    toast({ title: "Shared!", description: "The post has been (conceptually) shared." });
    // console.log(`Share action on item: ${itemId}`);
  };


  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6 shadow-md rounded-lg p-4">
        <div className="flex items-center justify-around">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={() => setIsPostDialogOpen(true)} className="flex flex-col h-auto p-2">
                  <Edit3 className="h-6 w-6 text-primary" />
                  <span className="text-xs mt-1">Post</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Create a new Post</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                 <Button variant="ghost" onClick={() => setIsVideoDialogOpen(true)} className="flex flex-col h-auto p-2">
                  <VideoIcon className="h-6 w-6 text-red-500" />
                  <span className="text-xs mt-1">Video</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Upload a Video</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={() => setIsPollDialogOpen(true)} className="flex flex-col h-auto p-2">
                  <BarChart2 className="h-6 w-6 text-purple-500" />
                  <span className="text-xs mt-1">Poll</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Create a Poll</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>

      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle>Create a New Post</DialogTitle></DialogHeader>
          <CreatePostForm onSubmitSuccess={handleCreatePost} onOpenChange={setIsPostDialogOpen} />
        </DialogContent>
      </Dialog>

      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="sm:max-w-[520px] overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle>Upload a Video</DialogTitle></DialogHeader>
          <CreateVideoForm onSubmitSuccess={handleCreateVideo} onOpenChange={setIsVideoDialogOpen} />
        </DialogContent>
      </Dialog>

      <Dialog open={isPollDialogOpen} onOpenChange={setIsPollDialogOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle>Create a New Poll</DialogTitle></DialogHeader>
          <CreatePollForm onSubmitSuccess={handleCreatePoll} onOpenChange={setIsPollDialogOpen} />
        </DialogContent>
      </Dialog>


      <h1 className="text-2xl font-bold mb-6 mt-8">Live Feed</h1>
      {feedItems.length === 0 && (
          <Card className="text-center p-8 shadow-md rounded-lg">
            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">The Feed is Quiet</h2>
            <p className="text-muted-foreground mb-6">
              No posts yet. Be the first to share something!
            </p>
            <Button onClick={() => setIsPostDialogOpen(true)}>
                <Edit3 className="mr-2 h-4 w-4" /> Create First Post
            </Button>
        </Card>
      )}
      {feedItems.map((item) => (
        <FeedItemCard
            key={item.id}
            item={item}
            onPollVote={handlePollVote}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
        />
      ))}
    </div>
  );
}
