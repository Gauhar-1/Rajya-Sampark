
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const interestAreas = [
  { id: 'canvassing', label: 'Canvassing (Door-to-door)' },
  { id: 'phone_banking', label: 'Phone Banking' },
  { id: 'event_support', label: 'Event Support & Logistics' },
  { id: 'data_entry', label: 'Data Entry & Admin Tasks' },
  { id: 'social_media', label: 'Social Media & Digital Outreach' },
  { id: 'other', label: 'Other (Please specify in message)' },
];

const availabilityOptions = [
  'Weekdays - Morning (9am-12pm)',
  'Weekdays - Afternoon (1pm-5pm)',
  'Weekdays - Evening (6pm-9pm)',
  'Weekends (Flexible hours)',
  'Fully Flexible',
];

const formSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.' }).max(100),
  phone: z.string().optional().refine(val => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), {
    message: "Invalid phone number format."
  }),
  volunteerTarget: z.enum(['general', 'candidate'], {
    required_error: "Please select who you're volunteering for.",
  }),
  specificCandidateName: z.string().optional(),
  interests: z.array(z.string()).min(1, { message: 'Please select at least one area of interest.' }),
  availability: z.string().min(1, { message: 'Please select your availability.' }),
  message: z.string().max(500, { message: 'Message cannot exceed 500 characters.' }).optional(),
}).superRefine((data, ctx) => {
  if (data.volunteerTarget === 'candidate') {
    if (!data.specificCandidateName || data.specificCandidateName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter the candidate's name.",
        path: ['specificCandidateName'],
      });
    } else if (data.specificCandidateName.trim().length < 2) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Candidate name must be at least 2 characters.",
        path: ['specificCandidateName'],
      });
    }
  }
});

type FormData = z.infer<typeof formSchema>;

export function VolunteerSignupForm() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      volunteerTarget: undefined,
      specificCandidateName: undefined,
      interests: [],
      availability: '',
      message: '',
    },
  });

  const volunteerTargetValue = form.watch('volunteerTarget');

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const result = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/volunteer`, data, {
        headers:{
          "Authorization": `Bearer ${token}`
        }
      });
      if (result.data.success) {
        toast({
          title: 'Signup Successful!',
          description: "Thank you for volunteering. We'll be in touch soon.",
          variant: 'default',
          action: <CheckCircle className="text-green-500" />,
        });
        form.reset();
      } 
    } catch (e) {
      toast({
        title: 'Signup Error',
        description: e instanceof Error ? e.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Volunteer Application</CardTitle>
        <CardDescription>Tell us a bit about yourself and how you'd like to help.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...form.register('fullName')} placeholder="e.g., Jane Doe" />
              {form.formState.errors.fullName && <p className="text-sm text-destructive mt-1">{form.formState.errors.fullName.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" {...form.register('phone')} placeholder="e.g., (555) 123-4567" />
              {form.formState.errors.phone && <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>}
            </div>

            <FormField
              control={form.control}
              name="volunteerTarget"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Volunteer For:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="general" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          General Campaign Support / Admin
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="candidate" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Specific Candidate
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {volunteerTargetValue === 'candidate' && (
              <div>
                <Label htmlFor="specificCandidateName">Candidate Name</Label>
                <Input 
                  id="specificCandidateName" 
                  {...form.register('specificCandidateName')} 
                  placeholder="Enter candidate's name" 
                />
                {form.formState.errors.specificCandidateName && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.specificCandidateName.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label>Areas of Interest (Select all that apply)</Label>
              <div className="space-y-2 mt-1">
                {interestAreas.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="interests"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item.id])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              {form.formState.errors.interests && <p className="text-sm text-destructive mt-1">{form.formState.errors.interests.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Controller
                name="availability"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="availability">
                      <SelectValue placeholder="Select your availability" />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilityOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.availability && <p className="text-sm text-destructive mt-1">{form.formState.errors.availability.message}</p>}
            </div>

            <div>
              <Label htmlFor="message">Additional Information (Optional)</Label>
              <Textarea id="message" {...form.register('message')} placeholder="Any specific skills, campaigns you're interested in, or other notes?" className="min-h-[100px]" />
              {form.formState.errors.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.message.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
