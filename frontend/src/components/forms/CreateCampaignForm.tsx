
'use client';

import * as React from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import type { Campaign } from '@/types';
import Image from 'next/image'; // For image preview

const campaignCategories = ['Local', 'State', 'National'] as const;

const createCampaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters.').max(100),
  party: z.string().max(50).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(1000),
  location: z.string().min(2, 'Location must be at least 2 characters.').max(100),
  imageFile: z.custom<FileList>().optional(), // Changed from imageUrl to imageFile
  category: z.enum(campaignCategories, { required_error: 'Please select a category.' }),
});

export type CreateCampaignFormData = z.infer<typeof createCampaignSchema>;

interface CreateCampaignFormProps {
  onSubmitSuccess: (newCampaign: Campaign) => void;
  onOpenChange?: (open: boolean) => void;
  initialData?: Campaign | null;
}

export function CreateCampaignForm({ onSubmitSuccess, onOpenChange, initialData }: CreateCampaignFormProps) {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const form = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: initialData?.name || '',
      party: initialData?.party || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      imageFile: undefined,
      category: initialData?.category,
    },
  });

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch, setValue } = form;

  React.useEffect(() => {
    if (initialData) {
        setValue('name', initialData.name);
        setValue('party', initialData.party || '');
        setValue('description', initialData.description);
        setValue('location', initialData.location);
        setValue('category', initialData.category);
        setImagePreview(initialData.imageUrl || null);
    } else {
        reset(); // Clear form if no initial data
        setImagePreview(null);
    }
  }, [initialData, setValue, reset]);

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
    }
  }, [imageFileWatch]);

  const processSubmit: SubmitHandler<CreateCampaignFormData> = async (data) => {

    const campaignId = initialData ? initialData.id : `camp-${Date.now()}`;

    const newCampaign: Campaign = {
      id: campaignId,
      name: data.name,
      party: data.party || undefined,
      description: data.description,
      location: data.location,
      imageUrl: imagePreview || 'https://placehold.co/300x200.png',
      dataAiHint: imagePreview ? 'user uploaded campaign image' : 'campaign event',
      category: data.category,
      popularityScore: initialData?.popularityScore ?? (Math.floor(Math.random() * 50) + 20), // Mock popularity
    };
    onSubmitSuccess(newCampaign);
    reset();
    setImagePreview(null);
    onOpenChange?.(false);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="campaignName">Campaign Name</Label>
        <Input id="campaignName" {...register('name')} placeholder="e.g., Better Schools Initiative" />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="campaignParty">Party / Affiliation (Optional)</Label>
        <Input id="campaignParty" {...register('party')} placeholder="e.g., Independent, Green Party" />
        {errors.party && <p className="text-sm text-destructive mt-1">{errors.party.message}</p>}
      </div>
      <div>
        <Label htmlFor="campaignDescription">Description</Label>
        <Textarea id="campaignDescription" {...register('description')} placeholder="Describe the campaign's goals and mission." className="min-h-[100px]" />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="campaignLocation">Location</Label>
        <Input id="campaignLocation" {...register('location')} placeholder="e.g., Springfield, Statewide" />
        {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
      </div>
      <div>
        <Label htmlFor="campaignImageFile">Campaign Image (Optional)</Label>
        <Input
          id="campaignImageFile"
          type="file"
          accept="image/*"
          {...register('imageFile')}
          className="file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-muted file:text-muted-foreground hover:file:bg-primary/10"
        />
        {errors.imageFile && <p className="text-sm text-destructive mt-1">{errors.imageFile.message as string}</p>}
      </div>

      {imagePreview && (
        <div className="mt-2 rounded-md border overflow-hidden aspect-[3/2] relative"> {/* Aspect ratio 3:2 */}
          <Image src={imagePreview} alt="Campaign image preview" layout="fill" objectFit="cover" />
        </div>
      )}

      <div>
        <Label htmlFor="campaignCategory">Category</Label>
        <Controller
            name="category"
            control={control}
            render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} defaultValue={initialData?.category}>
                <SelectTrigger id="campaignCategory">
                    <SelectValue placeholder="Select campaign category" />
                </SelectTrigger>
                <SelectContent>
                    {campaignCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            )}
        />
        {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
         {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Campaign')}
      </Button>
    </form>
  );
}
