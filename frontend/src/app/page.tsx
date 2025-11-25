'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Edit3, BarChart2, Video as VideoIcon
} from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import FeedList from '@/components/feed/FeedList';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Lazy load dialog forms
const CreatePostForm = dynamic(() => import('@/components/forms/CreatePostForm').then(mod => mod.CreatePostForm), { ssr: false });
const CreatePollForm = dynamic(() => import('@/components/forms/CreatePollForm').then(mod => mod.CreatePollForm), { ssr: false });
const CreateVideoForm = dynamic(() => import('@/components/forms/CreateVideoForm').then(mod => mod.CreateVideoForm), { ssr: false });

export default function HomePage() {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const handleCreatePostSuccess = (newPost: any) => {
    setIsPostDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['feed'] });
  };

  const handleCreatePollSuccess = (newPoll: any) => {
    setIsPollDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['feed'] });
  };

  const handleCreateVideoSuccess = (newVideo: any) => {
    setIsVideoDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['feed'] });
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
          <CreatePostForm onSubmitSuccess={handleCreatePostSuccess} onOpenChange={setIsPostDialogOpen} />
        </DialogContent>
      </Dialog>

      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="sm:max-w-[520px] overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle>Upload a Video</DialogTitle></DialogHeader>
          <CreateVideoForm onSubmitSuccess={handleCreateVideoSuccess} onOpenChange={setIsVideoDialogOpen} />
        </DialogContent>
      </Dialog>

      <Dialog open={isPollDialogOpen} onOpenChange={setIsPollDialogOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle>Create a New Poll</DialogTitle></DialogHeader>
          <CreatePollForm onSubmitSuccess={handleCreatePollSuccess} onOpenChange={setIsPollDialogOpen} />
        </DialogContent>
      </Dialog>


      <h1 className="text-2xl font-bold mb-6 mt-8">Live Feed</h1>

      <ErrorBoundary>
        <FeedList onOpenPostDialog={() => setIsPostDialogOpen(true)} />
      </ErrorBoundary>
    </div>
  );
}
