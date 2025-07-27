
'use server';

import { z } from 'zod';
import type { VolunteerSignup } from '@/types';

const volunteerSignupSchema = z.object({
  fullName: z.string().min(3).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  volunteerTarget: z.enum(['general', 'candidate']),
  specificCandidateName: z.string().optional(),
  interests: z.array(z.string()).min(1),
  availability: z.string().min(1),
  message: z.string().max(500).optional(),
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

export type VolunteerSignupInput = z.infer<typeof volunteerSignupSchema>;

interface ActionResult {
  success: boolean;
  error?: string | null;
  data?: VolunteerSignup;
}

export async function volunteerSignupAction(input: VolunteerSignupInput): Promise<ActionResult> {
  try {
    const validatedData = volunteerSignupSchema.parse(input);

    // In a real application, you would save this data to a database.
    // For this prototype, we'll just simulate success.
    console.log('Volunteer Signup Data:', validatedData);

    const newSignup: VolunteerSignup = {
      id: `vol_${Date.now()}`,
      ...validatedData,
      submittedAt: new Date().toISOString(),
    };
    
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, data: newSignup };
  } catch (error) {
    console.error('Error in volunteer signup action:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ') };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred during signup.' };
  }
}
