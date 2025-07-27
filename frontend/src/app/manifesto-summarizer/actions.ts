'use server';

import { summarizeCandidateManifesto, type SummarizeCandidateManifestoInput } from '@/ai/flows/summarize-candidate-manifesto';

interface ActionResult {
  summary?: string | null;
  error?: string | null;
}

export async function summarizeManifestoAction(input: SummarizeCandidateManifestoInput): Promise<ActionResult> {
  try {
    const result = await summarizeCandidateManifesto(input);
    return { summary: result.summary };
  } catch (error) {
    console.error('Error summarizing manifesto:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while summarizing the manifesto.' };
  }
}
