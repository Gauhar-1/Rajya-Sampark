'use client';

import * as React from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Loader2 } from 'lucide-react';
import { useCreatePoll } from '@/app/feed/hook/usePost'; // Adjust path if needed

const pollOptionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.').max(100, 'Option text is too long.'),
});

const createPollSchema = z.object({
  question: z.string().min(5, 'Poll inquiry must be at least 5 characters.').max(250, 'Poll inquiry is too long.'),
  options: z.array(pollOptionSchema).min(2, 'Please provide at least two options.').max(10, 'Maximum of 10 options allowed.'),
});

type CreatePollFormData = z.infer<typeof createPollSchema>;

interface CreatePollFormProps {
  onSubmitSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreatePollForm({ onSubmitSuccess, onOpenChange }: CreatePollFormProps) {
  // Bring in the mutation hook
  const { mutate: createPoll, isPending: isCreatingPoll } = useCreatePoll();

  const form = useForm<CreatePollFormData>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      question: '',
      options: [{ text: '' }, { text: '' }],
    },
  });

  const { register, control, handleSubmit, formState: { errors }, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const processSubmit: SubmitHandler<CreatePollFormData> = (data) => {
    // Format the payload exactly how your Express backend expects it:
    // { pollQuestion: string, pollOptions: string[] }
    const payload = {
      pollQuestion: data.question,
      pollOptions: data.options.map(opt => opt.text),
    };

    createPoll(payload, {
      onSuccess: () => {
        reset();
        onSubmitSuccess?.(); 
        onOpenChange?.(false);
      },
      onError: (err : any) => {
        console.error("Failed to publish poll to the public record:", err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="flex flex-col h-full">
      
      {/* HEADER: META DATA */}
      <div className="flex justify-between items-center border-b-2 border-white/20 pb-4 mb-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
          Public Inquiry
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          Live Typeset
        </span>
      </div>

      <div className="flex-1 space-y-6">
        {/* INQUIRY INPUT */}
        <div>
          <input
            {...register('question')}
            placeholder="DRAFT INQUIRY..."
            className="w-full bg-transparent text-2xl sm:text-4xl font-serif font-black uppercase tracking-tighter leading-[1.1] text-white placeholder:text-white/20 focus:outline-none resize-none border-none p-0"
            autoComplete="off"
          />
          {errors.question && <p className="text-[10px] font-mono uppercase text-red-500 mt-2 tracking-widest">{errors.question.message}</p>}
        </div>

        {/* OPTIONS LIST */}
        <div className="border-t-2 border-white/20 pt-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 mb-4">
            Response Parameters ({fields.length}/10)
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="group flex items-center gap-4 bg-white/5 border border-white/10 p-3 hover:border-white/30 transition-colors focus-within:border-white/50 focus-within:bg-white/10">
                <span className="text-[10px] font-mono font-bold text-white/30 group-focus-within:text-white/60">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                
                <input
                  {...register(`options.${index}.text`)}
                  placeholder="Enter response parameter..."
                  className="flex-1 bg-transparent text-sm sm:text-base font-sans font-bold uppercase tracking-wider text-white placeholder:text-white/20 focus:outline-none"
                  autoComplete="off"
                />
                
                {fields.length > 2 && (
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* OPTION ERRORS */}
          {errors.options?.root && <p className="text-[10px] font-mono uppercase text-red-500 mt-2 tracking-widest">{errors.options.root.message}</p>}
          {Array.isArray(errors.options) && errors.options.map((optionError, index) =>
            optionError?.text && <p key={index} className="text-[10px] font-mono uppercase text-red-500 mt-1 tracking-widest">Param {(index + 1).toString().padStart(2, '0')}: {optionError.text.message}</p>
          )}

          {/* ADD OPTION BUTTON */}
          {fields.length < 10 && (
            <button
              type="button"
              onClick={() => append({ text: '' })}
              className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
            >
              <span className="w-6 h-6 border border-current flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </span>
              Add Parameter
            </button>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-8 pt-6 border-t-[6px] border-white">
        <button 
          type="submit" 
          disabled={isCreatingPoll} 
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 hover:bg-amber-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isCreatingPoll ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="w-2 h-2 bg-black rounded-full group-hover:scale-150 transition-transform" />
          )}
          <span className="text-sm font-black uppercase tracking-[0.3em]">
            {isCreatingPoll ? 'Going to Press...' : 'Publish Inquiry'}
          </span>
        </button>
      </div>

    </form>
  );
}