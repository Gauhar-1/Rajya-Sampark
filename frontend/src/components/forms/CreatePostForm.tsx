'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { useCloud } from '@/hooks/use-cloudinary';
import { useCreatePost } from '@/app/feed/hook/usePost'; 

const createPostSchema = z.object({
  title: z.string().min(1, 'A headline is required.').max(150, 'Headline is too long.'),
  content: z.string().max(10000, 'Article content is too long.').optional(),
  imageFile: z.custom<FileList>().optional(),
}).refine(data => data.content || (data.imageFile && data.imageFile.length > 0), {
  message: "An article requires either text body or a photograph.",
  path: ["content"], 
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CreatePostFormProps {
  onSubmitSuccess?: () => void; 
  onOpenChange?: (open: boolean) => void;
}

export function CreatePostForm({ onSubmitSuccess, onOpenChange }: CreatePostFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { isLoading: isUploading, progress, error: uploadError, uploadFile } = useCloud();
  
  const { mutate: createPost, isPending: isCreatingPost } = useCreatePost();

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      imageFile: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = form;

  // 1. We extract the built-in onChange from react-hook-form's register
  const { onChange: rhfOnChange, ...restImageRegister } = register('imageFile');

  // 2. We create our own handler that triggers the upload exactly ONCE when the file is picked
  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Tell React Hook Form about the change so validation still works
    rhfOnChange(e);

    const file = e.target.files?.[0];
    if (file) {
      const uploadedUrl = await uploadFile(file);
      if (!uploadedUrl) {
        console.error("Upload failed, draft not created.");
        return;
      }
      setImagePreview(uploadedUrl);
    } else {
      setImagePreview(null);
    }
  };

  const processSubmit: SubmitHandler<CreatePostFormData> = (data) => {
    const isImagePost = !!(data.imageFile && data.imageFile.length > 0);

    const postPayload = {
      itemType: isImagePost ? 'image_post' : 'text_post',
      title: data.title, 
      content: data.content || '',
      mediaUrl: isImagePost ? (imagePreview || '') : undefined,
    };

    createPost(postPayload, {
      onSuccess: () => {
        reset();
        setImagePreview(null);
        onSubmitSuccess?.(); 
        onOpenChange?.(false); 
      },
      onError: (err : any) => {
        console.error("Failed to publish to the public record:", err);
      }
    });
  };

  const removeImage = () => {
    setValue('imageFile', undefined);
    setImagePreview(null);
  };

  const isBusy = isUploading || isCreatingPost;

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="flex flex-col h-full">
      
      {/* HEADER: META DATA */}
      <div className="flex justify-between items-center border-b-2 border-white/20 pb-4 mb-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
          Editorial Draft
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
            placeholder="Compose the article body here. Report the facts..."
            className="w-full bg-transparent min-h-[200px] text-lg sm:text-xl font-serif text-white/90 placeholder:text-white/30 focus:outline-none resize-none border-none p-0 custom-scrollbar"
          />
          {errors.content && <p className="text-[10px] font-mono uppercase text-red-500 mt-2 tracking-widest">{errors.content.message}</p>}
        </div>

        {/* IMAGE ATTACHMENT */}
        <div className="border-t-2 border-dashed border-white/20 pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">Attach Photograph</span>
            {isUploading && <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500">Processing: {progress}%</span>}
          </div>

          {!imagePreview ? (
            <label className="group flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer">
              <ImagePlus className="w-6 h-6 text-white/40 group-hover:text-white mb-2 transition-colors" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Select File</span>
              {/* 3. Apply our custom onChange handler here */}
              <input
                type="file"
                accept="image/*"
                {...restImageRegister}
                onChange={handleFilePicked} 
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-full border-4 border-white/20 bg-black aspect-video group">
              <Image src={imagePreview} alt="Draft preview" layout="fill" objectFit="contain" />
              <button 
                type="button" 
                onClick={removeImage}
                className="absolute top-4 right-4 w-8 h-8 bg-black border border-white flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {errors.imageFile && <p className="text-[10px] font-mono uppercase text-red-500 mt-2 tracking-widest">{errors.imageFile.message as string}</p>}
          {uploadError && <p className="text-[10px] font-mono uppercase text-red-500 mt-2 tracking-widest">{uploadError}</p>}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-8 pt-6 border-t-[6px] border-white">
        <button 
          type="submit" 
          disabled={isBusy} 
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 hover:bg-amber-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isBusy ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="w-2 h-2 bg-black rounded-full group-hover:scale-150 transition-transform" />
          )}
          <span className="text-sm font-black uppercase tracking-[0.3em]">
            {isUploading ? 'Developing Image...' : isCreatingPost ? 'Going to Press...' : 'Publish to Record'}
          </span>
        </button>
      </div>

    </form>
  );
}