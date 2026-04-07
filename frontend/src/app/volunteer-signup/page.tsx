'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, HandHeart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

// --- DATA ---
const interestAreas = [
  { id: 'canvassing', label: 'Door-to-door Canvassing' },
  { id: 'phone_banking', label: 'Phone Banking' },
  { id: 'event_support', label: 'Event Logistics' },
  { id: 'data_entry', label: 'Data & Administration' },
  { id: 'social_media', label: 'Digital Outreach' },
  { id: 'other', label: 'Other Support' },
];

const availabilityOptions = [
  'Weekdays - Morning (9am-12pm)',
  'Weekdays - Afternoon (1pm-5pm)',
  'Weekdays - Evening (6pm-9pm)',
  'Weekends (Flexible hours)',
  'Fully Flexible',
];

// --- SCHEMA ---
const formSchema = z.object({
  fullName: z.string().min(3, { message: 'Must be at least 3 characters.' }).max(100),
  phone: z.string().optional().refine(val => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), {
    message: "Invalid phone format."
  }),
  volunteerTarget: z.enum(['general', 'candidate'], {
    required_error: "Please select a volunteer target.",
  }),
  specificCandidateName: z.string().optional(),
  interests: z.array(z.string()).min(1, { message: 'Select at least one area.' }),
  availability: z.string().min(1, { message: 'Select your availability.' }),
  message: z.string().max(500, { message: 'Maximum 500 characters.' }).optional(),
}).superRefine((data, ctx) => {
  if (data.volunteerTarget === 'candidate') {
    if (!data.specificCandidateName || data.specificCandidateName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter the candidate's name.",
        path: ['specificCandidateName'],
      });
    } else if (data.specificCandidateName.trim().length < 2) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name must be at least 2 characters.",
        path: ['specificCandidateName'],
      });
    }
  }
});

type FormData = z.infer<typeof formSchema>;

export default function VolunteerSignupPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      volunteerTarget: undefined,
      specificCandidateName: '',
      interests: [],
      availability: '',
      message: '',
    },
  });

  const volunteerTargetValue = form.watch('volunteerTarget');
  const interestsValue = form.watch('interests');

  // Staggered Entrance Animation
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".form-row", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const result = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/volunteer`, data, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (result.data.success) {
        toast({
          title: 'Application Received',
          description: "Your details have been logged. We will contact you shortly.",
        });
        form.reset();
      } 
    } catch (e) {
      toast({
        title: 'Submission Failed',
        description: e instanceof Error ? e.message : 'An error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestToggle = (id: string) => {
    const current = new Set(interestsValue);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    form.setValue('interests', Array.from(current), { shouldValidate: true });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] text-white w-full font-sans selection:bg-amber-500 selection:text-black pb-32">
      
      {/* =========================================
          EDITORIAL HEADER
          ========================================= */}
      <div className="pt-24 pb-16 px-6 sm:px-12 max-w-[1200px] mx-auto border-b-4 border-white/10 form-row">
        <div className="flex items-center gap-3 mb-6">
          <HandHeart className="w-6 h-6 text-amber-500" />
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em]">Public Service Registry</span>
        </div>
        <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-white mb-6">
          Volunteer <br/>
          <span className="text-white/50">Application</span>
        </h1>
        <p className="text-lg font-medium text-white/50 max-w-xl leading-relaxed">
          Submit your details to assist with local initiatives and campaigns. Community action requires active participants.
        </p>
      </div>

      {/* =========================================
          THE LEDGER FORM (Anti-Design Layout)
          ========================================= */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-12 pt-12">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          
          {/* ROW 1: Identity */}
          <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-white/10 pb-12 pt-6">
            <div className="relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-2 transition-colors group-focus-within:text-amber-500">
                01 // Full Legal Name
              </label>
              <input 
                {...form.register('fullName')} 
                placeholder="Enter your name" 
                className="w-full bg-transparent border-b-2 border-white/20 text-2xl font-black uppercase tracking-tight py-4 outline-none focus:border-amber-500 transition-colors placeholder:text-white/10"
              />
              {form.formState.errors.fullName && <p className="text-[10px] font-mono text-red-500 uppercase mt-3">{form.formState.errors.fullName.message}</p>}
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-2 transition-colors group-focus-within:text-amber-500">
                02 // Contact Number
              </label>
              <input 
                type="tel"
                {...form.register('phone')} 
                placeholder="(000) 000-0000" 
                className="w-full bg-transparent border-b-2 border-white/20 text-2xl font-mono py-4 outline-none focus:border-amber-500 transition-colors placeholder:text-white/10"
              />
              {form.formState.errors.phone && <p className="text-[10px] font-mono text-red-500 uppercase mt-3">{form.formState.errors.phone.message}</p>}
            </div>
          </div>

          {/* ROW 2: Target Selection (Architectural Blocks) */}
          <div className="form-row border-b border-white/10 pb-12 pt-12">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-6">
              03 // Target Assignment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => form.setValue('volunteerTarget', 'general', { shouldValidate: true })}
                className={cn(
                  "p-8 border-2 text-left transition-all duration-300",
                  volunteerTargetValue === 'general' ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-white/10 bg-white/5 text-white hover:border-white/30"
                )}
              >
                <div className="text-2xl font-black uppercase tracking-tight mb-2">General Support</div>
                <div className="text-xs font-mono opacity-50 uppercase tracking-widest">Community Wide Allocation</div>
              </button>
              
              <button
                type="button"
                onClick={() => form.setValue('volunteerTarget', 'candidate', { shouldValidate: true })}
                className={cn(
                  "p-8 border-2 text-left transition-all duration-300",
                  volunteerTargetValue === 'candidate' ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-white/10 bg-white/5 text-white hover:border-white/30"
                )}
              >
                <div className="text-2xl font-black uppercase tracking-tight mb-2">Specific Candidate</div>
                <div className="text-xs font-mono opacity-50 uppercase tracking-widest">Direct Campaign Support</div>
              </button>
            </div>
            {form.formState.errors.volunteerTarget && <p className="text-[10px] font-mono text-red-500 uppercase mt-4">{form.formState.errors.volunteerTarget.message}</p>}

            {/* Conditional Candidate Field */}
            {volunteerTargetValue === 'candidate' && (
              <div className="mt-8 relative group animate-in slide-in-from-top-4 fade-in duration-300">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-2 group-focus-within:text-amber-500">
                  Candidate Name Registration
                </label>
                <input 
                  {...form.register('specificCandidateName')} 
                  placeholder="Enter candidate's exact name" 
                  className="w-full max-w-md bg-transparent border-b-2 border-white/20 text-xl font-bold py-4 outline-none focus:border-amber-500 transition-colors placeholder:text-white/10"
                />
                {form.formState.errors.specificCandidateName && <p className="text-[10px] font-mono text-red-500 uppercase mt-3">{form.formState.errors.specificCandidateName.message}</p>}
              </div>
            )}
          </div>

          {/* ROW 3: Interests (Tag Grid) */}
          <div className="form-row border-b border-white/10 pb-12 pt-12">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-6">
              04 // Action Capabilities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {interestAreas.map((item) => {
                const isSelected = interestsValue.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleInterestToggle(item.id)}
                    className={cn(
                      "px-6 py-4 border text-left text-sm font-bold uppercase tracking-wider transition-all duration-200",
                      isSelected ? "bg-white text-black border-white" : "bg-transparent border-white/20 text-white/60 hover:border-white/50 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            {form.formState.errors.interests && <p className="text-[10px] font-mono text-red-500 uppercase mt-4">{form.formState.errors.interests.message}</p>}
          </div>

          {/* ROW 4: Availability & Additional Info */}
          <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-12 pb-16 pt-12">
            
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-6">
                05 // Availability
              </label>
              <Controller
                name="availability"
                control={form.control}
                render={({ field }) => (
                  <select 
                    {...field}
                    className="w-full bg-[#050505] border border-white/20 text-white font-bold uppercase tracking-widest h-14 px-4 outline-none focus:border-amber-500 focus:bg-white/5 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-white/20">Select Timeframe</option>
                    {availabilityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
              />
              {form.formState.errors.availability && <p className="text-[10px] font-mono text-red-500 uppercase mt-3">{form.formState.errors.availability.message}</p>}
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-6 group-focus-within:text-amber-500 transition-colors">
                06 // Additional Declarations (Optional)
              </label>
              <textarea 
                {...form.register('message')} 
                placeholder="List any specific skills or logistics constraints..." 
                className="w-full bg-transparent border-b-2 border-white/20 text-base font-medium py-2 outline-none focus:border-amber-500 transition-colors placeholder:text-white/10 min-h-[100px] resize-none"
              />
              {form.formState.errors.message && <p className="text-[10px] font-mono text-red-500 uppercase mt-3">{form.formState.errors.message.message}</p>}
            </div>

          </div>

          {/* ROW 5: SUBMIT BLOCK */}
          <div className="form-row pt-8 border-t-4 border-white/10">
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full md:w-auto flex items-center justify-between gap-8 bg-amber-500 text-black px-12 py-6 font-black uppercase tracking-widest text-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>Processing Request <Loader2 className="w-6 h-6 animate-spin" /></>
              ) : (
                <>Submit Application <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}