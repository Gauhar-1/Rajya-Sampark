"use client";

import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Comment, FeedItem } from "@/types";
import { Avatar } from "@radix-ui/react-avatar";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PostPageProps {
    postId: string;
}

export default function PostPage({ postId } : PostPageProps) {
    const [ item , setItem ] = useState<FeedItem | null>(null);
    const [ comments, setComments ] = useState<Comment[]>([]);
    const [ commentOnPost, setCommentOnPost ] = useState<string | null>(null);
    const { user, token } = useAuth();

      useEffect(() => {
    if (!token || !postId) return;

    const getPost = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setItem(response.data.post); 
        }
      } catch (err) {
        console.log("Error found while getting post", err);
      }
    };

    getPost();
  }, [token, postId]);

     useEffect(()=>{
    if(!token || !postId) return;

    const getComments = async()=>{
      try{
        const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/${postId}/comment`,{
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

  },[token, postId]);

    const handleComment = async()=>{
        if(!postId || !commentOnPost) return;

      const comment : Comment = {
      _id : `pc-${Date.now()}`,
      postId : postId as string,
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

  if(!item) return <div className="h-screen flex justify-center items-center text-lg font-bold">
    <div className="bg-primary text-white py-2 px-4 shadow-lg border-2 rounded-lg border-black">No Post Available</div>
  </div>

    return (
        <div className='border-none h-[80vh] overflow-none'>
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
        </div>
    )
}