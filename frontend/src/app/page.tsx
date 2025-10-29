
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
import type { FeedItem, TextPostFeedItem, ImagePostFeedItem, VideoPostFeedItem, CampaignFeedItem, PollFeedItem, PollOption as FeedPollOption, Campaign, Poll, hasVoted, Comment } from '@/types';
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
import {  useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem,DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/pages/LoadingPage';


interface FeedItemCardProps {
  item: FeedItem;
  onPollVote?: (pollId: string, optionId: string) => void;
  onLike: (itemId: string, action: 'like' | 'unlike') => void;
  onDelete: (itemId: string) => void;
  onShare: (itemId: string) => void;
}

function FeedItemCard({ item, onPollVote, onLike, onDelete, onShare }: FeedItemCardProps) {
  const [isLikedByClient, setIsLikedByClient] = useState(false);
  const [ isOptionsClicked, setIsOptionsClicked ] = useState<boolean>(false);
  const { user, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  

  useEffect(()=>{
    if(item.likedBy && item.likedBy.length > 0 && user){
       const isLiked = item.likedBy.find(id => id == user._id);
       setIsLikedByClient(!!isLiked);
    }
  },[item.likedBy , user]);

  const handleLikeClick = () => {
    if (isLikedByClient) {
      onLike(item._id, 'unlike');
    } else {
      onLike(item._id, 'like');
    }
    setIsLikedByClient(!isLikedByClient);
  };

  const handleIssue = async()=>{
      try{
        const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/issue`,{id :item._id},{
          headers:{
            'Authorization': `Bearer ${token}`
          }
        });

        if(response.data.succes){
          toast({ description: 'Post took as an issue'});
        }
      }
      catch(err){
        console.log("Error found while taking an issue")
      }
    }


  const renderMedia = () => {
    if (item.itemType === 'image_post' && item.mediaUrl) {
      return (
        <div className="rounded-md bg-black overflow-hidden border aspect-video relative">
          <Image
          className='shadow-2xl'
            src={item.mediaUrl}
            alt="Post image"
            layout="fill"
            objectFit="contain"
            data-ai-hint={item.mediaDataAiHint || "social media image"}
          />
        </div>
      );
    }
    if (item.itemType === 'video_post' && item.mediaUrl) {
      return (
        <div className="rounded-md overflow-hidden border ">
          <video src={item.mediaUrl} controls   className="w-full aspect-video " data-ai-hint={item.mediaDataAiHint || "social media video"}/>
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
                  const isVoted = item.userHasVoted ? item.userHasVoted?.find( vote => vote.profileId == user?._id ) : false;
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
    <Card  className="mb-6 shadow-lg rounded-lg overflow-hidden">
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
      { item.profileId?._id == user?._id && <DropdownMenuItem 
        className="text-red-500" 
        onClick={()=> onDelete(item._id)}
      >
        Delete
      </DropdownMenuItem>}
      { item.isIssue &&( user?.role == 'VOLUNTEER' || user?.role == 'CANDIDATE' || user?.role == 'ADMIN')   &&<DropdownMenuItem
        onClick={() => handleIssue()}
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


export default function HomePage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [loading, setLoading ] = useState<Boolean>(false);
  const { toast } = useToast();
  const { token, user } = useAuth();
  

  useEffect(()=>{
    setLoading(true);
    if(token) return;
    const getFeed = async()=>{
      try{
          const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post`);
          
          if(response.data.success){
              const { allFeed } = response.data;
              const feed = allFeed.sort((a : any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              setFeedItems(feed);
          }
      }
      catch(err){
       console.log("Found an Error while fetching err ", err);
      }
      finally{
        setLoading(false);
      }
    }
    getFeed();
  },[token])

  const addNewFeedItem = (newPost: TextPostFeedItem | ImagePostFeedItem | VideoPostFeedItem | PollFeedItem) => {

    console.log("New post", newPost);
    setFeedItems(prevItems =>
      [newPost, ...prevItems].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    );
  };

  const handleCreatePost = async(newPost: TextPostFeedItem | ImagePostFeedItem) => {

    const { content , itemType, mediaUrl} = newPost;

    try{
      const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post`, {
      content,
      itemType,
      mediaUrl
    },{
      headers:{
        "Authorization": `Bearer ${token}`
      }
    })

    if(response.data.success){
      const { populatedPost } = response.data;
      addNewFeedItem( populatedPost );
    }
  }
    catch(err){
      console.log("Error found", err);
    }
    finally{
      setIsPostDialogOpen(false);
    }

  };

  const handleCreatePoll = async(newPollData: Poll) => {
    try{
        const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/poll`,{
          pollQuestion : newPollData.question,
          pollOptions : newPollData.options.map(opt => ({ ...opt, votes: 0 })),
        },{
          headers:{
            "Authorization": `Bearer ${token}`
          }
        })        

        if(response.data.success){
          const { populatedPoll } = response.data;
          addNewFeedItem(populatedPoll);
        }
    }
    catch(err){
      console.log("Error found in the page", err);
    }
    finally{
      setIsPollDialogOpen(false);
    }
  };

  const handleCreateVideo = async(newVideo: VideoPostFeedItem) => {
    const { content, itemType, mediaUrl } = newVideo;
    
    try{
      const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post`, {
      content,
      itemType,
      mediaUrl
    },{
      headers:{
        "Authorization": `Bearer ${token}`
      }
    })

    if(response.data.success){
      const { populatedPost } = response.data;
      addNewFeedItem( populatedPost );
    }
  }
    catch(err){
      console.log("Error found", err);
    }
    finally{
      setIsVideoDialogOpen(false);
    }
  };

  const handlePollVote = async(pollId: string, optionId: string) => {

    const originalFeed = [...feedItems];

    setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item.itemType === 'poll_created' && item._id === pollId) {
          const newOptions = item.pollOptions.map(opt =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          )

          const userHasVoted : hasVoted[] =  [...(item.userHasVoted || []) , { profileId : user?._id || "" , voted: true } ] 

          return {
            ...item,
            pollOptions: newOptions,
            totalVotes: item.totalVotes + 1,
            userHasVoted,
          };
        }
        return item;
      })
    );

    try{
       await axios.patch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/${pollId}/vote`, { optionId }, {
        headers:{
          'Authorization': `Bearer ${token}`
        }
      })
    }
    catch(err){
      console.error("Error while voting", err);
      setFeedItems(originalFeed);
    }
  };

  const handleLike = async(itemId: string, action: 'like' | 'unlike') => {
    const originalFeed = feedItems;

    try{
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/${itemId}/like`, { action } , { 
        headers:{
          "Authorization" : `Bearer ${token}`
        }
      });

      if(response.data.success){
        setFeedItems(prevItems =>
          prevItems.map(item => {
            if (item._id === itemId && (item.itemType === 'text_post' || item.itemType === 'image_post' || item.itemType === 'video_post')) {
              const newLikes = action === 'like' ? item.likes + 1 : Math.max(0, item.likes - 1);
              return { ...item, likes: newLikes };
            }
            return item;
          })
        );
      }
    }
    catch(err){
      setFeedItems(originalFeed);
      console.log("Error found while posting likes", err);
    }

  };

  const handleDelete = async(postId : string)=>{
    try{ 
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/${postId}/delete`,{
        headers:{
          "Authorization": `Bearer ${token}`
        }
      });

      if(response.data.success){
        setFeedItems((prev)=> {
          const newFeed = prev.filter( post => post._id != postId);

          return newFeed;
        })
        toast({description : "Post Deleted Successfully"});
      }
    }
    catch(err){
      console.error("Error found while deleting post", err);
      toast({description : "Failed to delete post", variant: "destructive"});
    }
  }

  const handleShare = (itemId: string) => {
     setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item._id === itemId && (item.itemType === 'text_post' || item.itemType === 'image_post' || item.itemType === 'video_post')) {
          return { ...item, shares: item.shares + 1 };
        }
        return item;
      }
      )
    );
    // toast({ title: "Shared!", description: "The post has been (conceptually) shared." });
  };

  

  return (
    <div className="w-[780px] mx-auto">
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
      { feedItems ? feedItems.map((item) => (
        <FeedItemCard
            key={item._id}
            item={item}
            onPollVote={handlePollVote}
            onLike={handleLike}
            onDelete={handleDelete}
            onShare={handleShare}
        />
      )) : <LoadingPage />}
    </div>
  );
}
