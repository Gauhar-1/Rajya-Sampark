
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
import { toast, useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


interface FeedItemCardProps {
  item: FeedItem;
  onPollVote?: (pollId: string, optionId: string) => void;
  onLike: (itemId: string, action: 'like' | 'unlike') => void;
  onDelete: (itemId: string) => void;
  onShare: (itemId: string) => void;
}

function FeedItemCard({ item, onPollVote, onLike, onDelete, onShare }: FeedItemCardProps) {
  const [isLikedByClient, setIsLikedByClient] = useState(false);
  const [ isCommentClicked, setIsCommentClicked ] = useState<boolean>(false);
  const [ isOptionsClicked, setIsOptionsClicked ] = useState<boolean>(false);
  const [ comments, setComments ] = useState<Comment[]>([]);
  const [ commentOnPost, setCommentOnPost ] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(()=>{
    if(!token || !isCommentClicked) return;

    const getComments = async()=>{
      try{
        const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/${item._id}/comment`,{
          headers:{
            "Authorization": `Bearer ${token}`
          }
        });

        if(response.data.success){
          setComments(response.data.comments);
        }
      }
      catch(err){
        console.log("Error found while getting comments", err);
      }
    }

    getComments();

  },[token, isCommentClicked]);

  useEffect(()=>{
    if(item.likedBy && item.likedBy.length > 0 && user){
       const isLiked = item.likedBy.find(id => id == user._id);
       setIsLikedByClient(!!isLiked);
       console.log("isLiked ",isLiked);
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

  const handleComment = async()=>{
    const comment : Comment = {
      _id : `pc-${Date.now()}`,
      postId : item._id,
      profileId : user,
      content : commentOnPost,
      timestamp : new Date().toISOString(),
    }

    try{
      const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/comment`, {
        content : comment.content,
        timestamp: comment.timestamp,
        postId : comment.postId
      } ,{
        headers:{
          "Authorization": `Bearer ${token}`
        }
      });

      if(response.data.success){
        setComments((prev)=> [...prev, response.data.populatedComment]);
      }
    }
    catch(err){
      console.error("Error while posting comment", err);
    }
    finally{
      setCommentOnPost(null);
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
      <DropdownMenuItem
        onClick={() => console.log("Go to post clicked")}
      >
        Go to post
      </DropdownMenuItem>
      <DropdownMenuItem 
        className="text-red-500" 
        onClick={()=> onDelete(item._id)}
      >
        Delete
      </DropdownMenuItem>
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
                  aria-label={isLikedByClient ? `Unlike post, current likes ${item.likes}` : `Like post, current likes ${item.likes}`}
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
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() =>{ 
                  // onComment(item._id);
                  setIsCommentClicked(true);
                }
                } aria-label={`Comment on post, current comments ${item.comments}`}>
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

      <Dialog open={isCommentClicked} onOpenChange={setIsCommentClicked}>
        <DialogContent className='border-none w-3/4 h-5/6 my-4 max-w-5xl max-h-screen p-0'>
          <div className='rounded-lg grid grid-cols-2 h-full'>
            <div className='h-full bg-black w-full flex justify-center overflow-hidden aspect-video'>
              {item.itemType == "image_post" && item.mediaUrl && (
                          <img src={item.mediaUrl} alt="" className='h-full bg-black ' />
              )}
              {item.itemType == "video_post" && item.mediaUrl && (
                <div className="flex justify-center items-center rounded-md h-full overflow-hidden bg-white">
          <video src={item.mediaUrl} controls className="h-full aspect-video" />
        </div>
              )}
              {item.itemType == "text_post" && (
                <div className='bg-gray-300 w-full border-2 p-3'>
                  <div className='border-2 p-3 bg-white rounded-lg shadow-lg h-1/2'>{item.content}</div>
                  </div>
              )}
            </div>

            {/* right half */}
            <div className='flex flex-col h-full rounded-r-lg bg-gray-600'>
              <div className='flex gap-2 p-2 shadow-lg'>
                <Avatar className='border-none shadow-lg'>
          {item.profileId?.photoURL ? (
            <AvatarImage src={item.profileId.photoURL} alt={item.profileId.name} data-ai-hint={item.creatorDataAiHint || "person face"} />
          ) : null}
          <AvatarFallback >{item.profileId?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-white text-base font-semibold flex items-center text-shadow-lg">
            {item.profileId?.name}
          </div>
          <p className="text-xs text-shadow-lg text-gray-300">
            Posted {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </p>
        </div>
              </div>

               {/* Comment section */}
              <div className='flex-1 border-b-2 overflow-y-auto'>
                {comments.map( (item) =>
                <div className='flex gap-2 p-2'>
                <Avatar className='border-none shadow-lg h-8 w-8'>
          {item.profileId?.photoURL ? (
            <AvatarImage src={item.profileId.photoURL} alt={item.profileId.name} />
          ) : null}
          <AvatarFallback >{item.profileId?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-1'>
          <div className='flex gap-2 items-start'>
            <p className='text-xs text-gray-300 font-mono'>
              <b className='text-white text-sm'>{item.profileId?.name}</b> {item.content}</p>
          </div>
          <p className="text-xs font-medium text-gray-300">
             {(formatDistanceToNow(new Date(item.timestamp))).replace('about', '')}
          </p>
        </div>
              </div>)}
              </div>

              {/* Footer section */}
              <div className='flex gap-4 my-4 mx-2'>
                <Heart color='white'/>
                <MessageCircle color='white'/>
                <Share2 color='white'/>
              </div>
              <div className='flex mb-1'>
                <Input placeholder='Comment..' value={commentOnPost || ''} className='text-white bg-gray-600 mx-1' onChange={(e)=>{
                  setCommentOnPost(e.target.value);
                }}/>
                <Button className='bg-gray-600 mx-1 border-2 border-white' onClick={handleComment}>Post</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}


export default function HomePage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const { toast } = useToast();
  const { token, user } = useAuth();
  

  useEffect(()=>{
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
    const { content , itemType, mediaUrl} = newVideo;
    
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
      const { popluplatedPost } = response.data;
      addNewFeedItem( popluplatedPost );
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
    toast({ title: "Shared!", description: "The post has been (conceptually) shared." });
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
      {feedItems.map((item) => (
        <FeedItemCard
            key={item._id}
            item={item}
            onPollVote={handlePollVote}
            onLike={handleLike}
            onDelete={handleDelete}
            onShare={handleShare}
        />
      ))}
    </div>
  );
}
