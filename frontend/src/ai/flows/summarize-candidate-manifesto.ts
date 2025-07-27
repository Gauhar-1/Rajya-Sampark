'use server';


import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCandidateManifestoInputSchema = z.object({
  manifesto: z
    .string()
    .describe("The candidate's manifesto text to be summarized."),
});
export type SummarizeCandidateManifestoInput = z.infer<typeof SummarizeCandidateManifestoInputSchema>;

const SummarizeCandidateManifestoOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the candidate manifesto.'),
});
export type SummarizeCandidateManifestoOutput = z.infer<typeof SummarizeCandidateManifestoOutputSchema>;

export async function summarizeCandidateManifesto(
  input: SummarizeCandidateManifestoInput
): Promise<SummarizeCandidateManifestoOutput> {
  return summarizeCandidateManifestoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCandidateManifestoPrompt',
  input: {schema: SummarizeCandidateManifestoInputSchema},
  output: {schema: SummarizeCandidateManifestoOutputSchema},
  prompt: `You are an expert in political science and your task is to summarize candidate manifestos.

  Please provide a concise summary of the following manifesto, highlighting the key policy positions and goals of the candidate.

  Manifesto: {{{manifesto}}}
  `,
});

const summarizeCandidateManifestoFlow = ai.defineFlow(
  {
    name: 'summarizeCandidateManifestoFlow',
    inputSchema: SummarizeCandidateManifestoInputSchema,
    outputSchema: SummarizeCandidateManifestoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
