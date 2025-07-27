
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { RequiredAuth } from '@/components/auth/RequiredAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {  Mail, Phone, Edit, Activity, Briefcase, Camera, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import  { User } from '@/types';

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name is too long."),
  photo: z.custom<FileList>().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      photo: undefined,
    }
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({ name: user.name || '' });
      setImagePreview(user.photoURL || null);
    }
  }, [user, form]);

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('photo', e.target.files ?? undefined);
    }
  };

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    if (!user) return;

    // The imagePreview already holds the new base64 image data
    const updatedUserData: Partial< User> = {
      name: data.name,
      photoURL: imagePreview, // Use the state variable for the new image
    };

    try {
      await updateUser(updatedUserData);
      toast({
        title: "Profile Updated",
        description: "Your profile details have been saved.",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
       toast({
        title: "Update Failed",
        description: "Could not save your profile changes.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (name?: string, email?: string | null) => {
    if (name) {
      const parts = name.split(' ');
      return (parts[0]?.[0] || '' + (parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : '')).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (!user) {
    return null; // RequiredAuth will handle redirection
  }

  return (
    <RequiredAuth allowedRoles={['VOTER', 'CANDIDATE', 'ADMIN', 'VOLUNTEER']}>
      <div className="max-w-2xl mx-auto">
         <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center">
                <div className="mr-3 h-8 w-8 text-primary" />
                My Profile
            </h1>
            <p className="text-muted-foreground">Manage your personal information and site activity.</p>
        </div>
        <Card className="shadow-lg relative">
          <CardHeader className="items-center text-center p-6 bg-secondary/30">
             <Avatar className="h-28 w-28 mb-4 border-4 border-background shadow-md">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.name || 'User avatar'} data-ai-hint="user avatar" />}
                <AvatarFallback className="text-4xl">
                    {getUserInitials(user.name, user.email)}
                </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
                <CardTitle className="text-2xl">{user.name || 'Anonymous User'}</CardTitle>
                <CardDescription>
                    <Badge variant="default" className="capitalize text-sm">{user.role.toLowerCase()}</Badge>
                </CardDescription>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Your Profile</DialogTitle>
                      <DialogDescription>
                        Update your name and profile picture here.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="flex flex-col items-center space-y-2">
                         <div className="relative group">
                           <Avatar className="h-32 w-32">
                              {imagePreview && <AvatarImage src={imagePreview} alt="Profile preview" />}
                              <AvatarFallback className="text-5xl">{getUserInitials(form.watch('name'))}</AvatarFallback>
                           </Avatar>
                           <Button 
                             type="button" 
                             variant="ghost" 
                             size="icon" 
                             className="absolute inset-0 h-full w-full bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full"
                             onClick={() => fileInputRef.current?.click()}
                           >
                             <Camera className="h-8 w-8"/>
                           </Button>
                         </div>
                         <Input 
                            id="photo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={onPhotoChange}
                         />
                      </div>
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...form.register('name')} />
                        {form.formState.errors.name && <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>}
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <h3 className="text-lg font-semibold text-foreground border-b pb-2">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={user.phone || 'No phone provided'} readOnly disabled />
                    </div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </RequiredAuth>
  );
}
