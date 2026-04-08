'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Video, X } from 'lucide-react';
import { useCloud } from '@/hooks/use-cloudinary';
import { useCreatePost } from '@/app/feed/hook/usePost'; // Make sure this path is correct

const createVideoSchema = z.object({
  title: z.string().min(1, 'A headline is required.').max(150, 'Headline is too long.'),
  content: z.string().max(500, 'Caption is too long.').optional(),
  videoFile: z.custom<FileList>(
    (val) => val instanceof FileList && val.length > 0,
    "Please select a video file."
  ).refine(
    (files) => files?.[0]?.size <= 100 * 1024 * 1024, // 100MB limit
    `Video file size should be less than 100MB.`
  ).refine(
    (files) => files?.[0]?.type.startsWith('video/'),
    `Invalid file type. Please select a video.`
  ),
});

type CreateVideoFormData = z.infer<typeof createVideoSchema>;

interface CreateVideoFormProps {
  onSubmitSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreateVideoForm({ onSubmitSuccess, onOpenChange }: CreateVideoFormProps) {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const { isLoading: isUploading, error: uploadError, progress, uploadFile } = useCloud();
  
  // Bring in the mutation hook
  const { mutate: createPost, isPending: isCreatingPost } = useCreatePost();

  const form = useForm<CreateVideoFormData>({
    resolver: zodResolver(createVideoSchema),
    defaultValues: {
      title: '',
      content: '',
      videoFile: undefined, 
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = form;

  // 1. Extract the built-in onChange from React Hook Form
  const { onChange: rhfOnChange, ...restVideoRegister } = register('videoFile');

  // 2. Create the custom handler to prevent infinite loops
  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Let React Hook Form know the input changed
    rhfOnChange(e);

    const file = e.target.files?.[0];
    if (file) {
      const uploadUrl = await uploadFile(file);
      
      if (!uploadUrl) {
        console.error("Upload failed, draft not created.");
        return;
      }
      
      setVideoPreview(uploadUrl);
    } else {
      setVideoPreview(null);
    }
  };

  const processSubmit: SubmitHandler<CreateVideoFormData> = async (data) => {
    if (!videoPreview) return;
    
    const postPayload = {
      itemType: 'video_post',
      title: data.title,
      content: data.content || '',
      mediaUrl: videoPreview, 
    };
    
    createPost(postPayload, {
      onSuccess: () => {
        reset();
        setVideoPreview(null);
        onSubmitSuccess?.();
        onOpenChange?.(false);
      },
      onError: (err : any) => {
        console.error("Failed to publish video to the public record:", err);
      }
    });
  };

  const removeVideo = () => {
    setValue('videoFile', undefined as unknown as FileList); // Reset form value
    setVideoPreview(null);
  };

  const isBusy = isUploading || isCreatingPost;

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="flex flex-col h-full">
      
      {/* HEADER: META DATA */}
      <div className="flex justify-between items-center border-b-2 border-white/20 pb-4 mb-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
          Motion Picture Draft
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          Live Typeset
        </span>
      </div>

      <div className="flex-1 space-y-6">
        {/* HEADLINE INPUT */}
        <div>
          <input
            {...register('title')}
            placeholder="DRAFT HEADLINE..."
            className="w-full bg-transparent text-3xl sm:text-5xl font-serif font-black uppercase tracking-tighter text-white placeholder:text-white/20 focus:outline-none resize-none border-none p-0"
            autoComplete="off"
          />
          {errors.title && <p className="text-[10px] font-mono uppercase text-red-500 mt-2 tracking-widest">{errors.title.message}</p>}
        </div>

        {/* BODY TEXTAREA */}
        <div className="border-t-2 border-white/20 pt-6">
          <textarea
            {...register('content')}
            placeholder="Compose the video caption here. Report the facts..."
            className="w-full bg-transparent min-h-[120px] text-lg sm:text-xl font-serif text-white/90 placeholder:text-white/30 focus:outline-none resize-none border-none p-0 custom-scrollbar"
          />
          {errors.content && <p className="text-[10px] font-mono uppercase text-red-500 mt-2 tracking-widest">{errors.content.message}</p>}
        </div>

        {/* VIDEO ATTACHMENT */}
        <div className="border-t-2 border-dashed border-white/20 pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">Attach Broadcast</span>
            {isUploading && <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500">Processing: {progress}%</span>}
          </div>

          {!videoPreview ? (
            <label className="group flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer">
              <Video className="w-6 h-6 text-white/40 group-hover:text-white mb-2 transition-colors" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Select Reel</span>
              {/* 3. Apply the custom onChange handler here */}
              <input
                type="file"
                accept="video/*"
                {...restVideoRegister}
                onChange={handleFilePicked}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-full border-4 border-white/20 bg-black aspect-video group">
              <video src={videoPreview} controls className="w-full h-full object-contain" />
              <button 
                type="button" 
                onClick={removeVideo}
                className="absolute top-4 right-4 w-8 h-8 bg-black border border-white flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-colors z-10 shadow-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {errors.videoFile && <p className="text-[10px] font-mono uppercase text-red-500 mt-2 tracking-widest">{errors.videoFile.message as string}</p>}
          {uploadError && <p className="text-[10px] font-mono uppercase text-red-500 mt-2 tracking-widest">{uploadError as string}</p>}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-8 pt-6 border-t-[6px] border-white">
        <button 
          type="submit" 
          disabled={isBusy || !videoPreview} 
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 hover:bg-amber-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isBusy ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="w-2 h-2 bg-black rounded-full group-hover:scale-150 transition-transform" />
          )}
          <span className="text-sm font-black uppercase tracking-[0.3em]">
            {isUploading ? 'Developing Film...' : isCreatingPost ? 'Going to Press...' : 'Broadcast to Record'}
          </span>
        </button>
      </div>

    </form>
  );
}