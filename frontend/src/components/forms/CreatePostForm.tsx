
'use client';

import * as React from 'react'; // Added this import
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Loader2, ImagePlus } from 'lucide-react';
import type { ImagePostFeedItem, TextPostFeedItem } from '@/types';
import Image from 'next/image'; // For image preview

const createPostSchema = z.object({
  content: z.string().max(1000, 'Post content is too long.').optional(), // Optional if image is provided
  imageFile: z.custom<FileList>().optional(), // For file upload
}).refine(data => data.content || (data.imageFile && data.imageFile.length > 0), {
  message: "Post must have either content or an image.",
  path: ["content"], // Associate error with content field for display
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CreatePostFormProps {
  onSubmitSuccess: (newPost: TextPostFeedItem | ImagePostFeedItem) => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreatePostForm({ onSubmitSuccess, onOpenChange }: CreatePostFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      imageFile: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = form;
  const imageFileWatch = watch('imageFile');

  React.useEffect(() => {
    if (imageFileWatch && imageFileWatch.length > 0) {
      const file = imageFileWatch[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setImagePreview(null);
    }
  }, [imageFileWatch]);

  const processSubmit: SubmitHandler<CreatePostFormData> = async (data) => {
    const commonData = {
      id: `post-${Date.now()}`,
      timestamp: new Date().toISOString(),
      creatorName: 'Current User', // Placeholder
      creatorImageUrl: 'https://placehold.co/40x40.png?text=CU',
      creatorDataAiHint: 'person face',
    };

    if (data.imageFile && data.imageFile.length > 0 && imagePreview) {
      const newImagePost: ImagePostFeedItem = {
        ...commonData,
        itemType: 'image_post',
        content: data.content || '',
        mediaUrl: imagePreview, // Using the base64 preview as the mediaUrl for client-side display
        mediaDataAiHint: 'user uploaded image',
      };
      onSubmitSuccess(newImagePost);
    } else if (data.content) {
      const newTextPost: TextPostFeedItem = {
        ...commonData,
        itemType: 'text_post',
        content: data.content,
      };
      onSubmitSuccess(newTextPost);
    }

    reset();
    setImagePreview(null);
    onOpenChange?.(false);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="postContent" className="mb-1 block">What's on your mind? (Optional if uploading image)</Label>
        <Textarea
          id="postContent"
          {...register('content')}
          placeholder="Share an update, news, or an announcement..."
          className="min-h-[100px]"
          aria-invalid={errors.content ? "true" : "false"}
          aria-describedby="content-error"
        />
        {errors.content && <p id="content-error" className="text-sm text-destructive mt-1">{errors.content.message}</p>}
      </div>
      <div>
        <Label htmlFor="imageFile" className="mb-1 block">Upload Image (Optional)</Label>
        <Input
          id="imageFile"
          type="file"
          accept="image/*"
          {...register('imageFile')}
          className="file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-muted file:text-muted-foreground hover:file:bg-primary/10"
        />
        {errors.imageFile && <p className="text-sm text-destructive mt-1">{errors.imageFile.message as string}</p>}
      </div>

      {imagePreview && (
        <div className="mt-2 rounded-md border overflow-hidden aspect-video relative">
          <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="contain" />
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        {isSubmitting ? 'Posting...' : 'Create Post'}
      </Button>
    </form>
  );
}
