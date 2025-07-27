
'use client';

import * as React from 'react'; // Added this import
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Video } from 'lucide-react';
import type { VideoPostFeedItem } from '@/types';

const createVideoSchema = z.object({
  content: z.string().max(500, 'Caption is too long.').optional(),
  videoFile: z.custom<FileList>(
    (val) => val instanceof FileList && val.length > 0,
    "Please select a video file."
  ).refine(
    (files) => files?.[0]?.size <= 100 * 1024 * 1024, // 100MB limit (example)
    `Video file size should be less than 100MB.`
  ).refine(
    (files) => files?.[0]?.type.startsWith('video/'),
    `Invalid file type. Please select a video.`
  ),
});

type CreateVideoFormData = z.infer<typeof createVideoSchema>;

interface CreateVideoFormProps {
  onSubmitSuccess: (newVideoPost: VideoPostFeedItem) => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreateVideoForm({ onSubmitSuccess, onOpenChange }: CreateVideoFormProps) {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const form = useForm<CreateVideoFormData>({
    resolver: zodResolver(createVideoSchema),
    defaultValues: {
      content: '',
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = form;

  const videoFileWatch = watch('videoFile');

  React.useEffect(() => {
    if (videoFileWatch && videoFileWatch.length > 0) {
      const file = videoFileWatch[0];
      if (file) {
        setFileName(file.name);
        const objectUrl = URL.createObjectURL(file);
        setVideoPreview(objectUrl);
        // Clean up the object URL when the component unmounts or file changes
        return () => URL.revokeObjectURL(objectUrl);
      }
    } else {
      setVideoPreview(null);
      setFileName(null);
    }
  }, [videoFileWatch]);


  const processSubmit: SubmitHandler<CreateVideoFormData> = async (data) => {
    if (!data.videoFile || data.videoFile.length === 0 || !videoPreview) {
      // Should be caught by validation, but good to double check
      return;
    }
    
    const newVideoPost: VideoPostFeedItem = {
      id: `video-${Date.now()}`,
      timestamp: new Date().toISOString(),
      creatorName: 'Current User', // Placeholder
      creatorImageUrl: 'https://placehold.co/40x40.png?text=CU',
      creatorDataAiHint: 'person face',
      itemType: 'video_post',
      content: data.content,
      mediaUrl: videoPreview, // Object URL for local preview
      mediaDataAiHint: 'user uploaded video',
    };
    
    onSubmitSuccess(newVideoPost);
    reset();
    setVideoPreview(null);
    setFileName(null);
    onOpenChange?.(false);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="videoFile">Video File</Label>
        <Input
          id="videoFile"
          type="file"
          accept="video/*"
          {...register('videoFile')}
          className="file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-muted file:text-muted-foreground hover:file:bg-primary/10"
        />
        {fileName && <p className="text-sm text-muted-foreground mt-1">Selected: {fileName}</p>}
        {errors.videoFile && <p className="text-sm text-destructive mt-1">{errors.videoFile.message as string}</p>}
      </div>

      {videoPreview && (
        <div className="mt-2 rounded-md border overflow-hidden">
          <video src={videoPreview} controls className="w-full aspect-video" />
        </div>
      )}
      
      <div>
        <Label htmlFor="videoContent">Caption (Optional)</Label>
        <Textarea
          id="videoContent"
          {...register('content')}
          placeholder="Add a caption for your video..."
          className="min-h-[80px]"
        />
        {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting || !videoPreview} className="w-full">
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Video className="mr-2 h-4 w-4" />
        )}
        {isSubmitting ? 'Posting Video...' : 'Post Video'}
      </Button>
    </form>
  );
}
