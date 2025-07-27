
'use client'; // Must be a client component if it uses hooks or client-side forms directly

// This page is effectively no longer directly used as poll creation
// is now handled via a dialog from the HomePage.
// Keeping it as a fallback or for potential future direct navigation,
// but the primary creation flow has changed.

import { ListPlus } from 'lucide-react';
import { CreatePollForm } from '@/components/forms/CreatePollForm';
import type { Poll } from '@/types'; // Import Poll type
import { useToast } from '@/hooks/use-toast'; // For toast notifications

export default function CreatePollPage() {
  const { toast } = useToast();

  const handlePollCreateStandalone = (newPoll: Poll) => {
    // In a standalone page context, we might just show a toast
    // or redirect. For now, just a toast.
    console.log("Poll created on standalone page:", newPoll);
    toast({
      title: "Poll Created!",
      description: "Your poll has been successfully created.",
    });
    // Potentially redirect or clear form, form internally resets.
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <ListPlus className="mr-3 h-7 w-7 text-primary" />
        Create a New Poll
      </h1>
      <p className="text-muted-foreground mb-6">
        Engage the community by creating a poll. Define your question and provide options for users to vote on.
        (Note: Primary poll creation is now via the icons on the Home feed.)
      </p>
      {/* 
        The onSubmitSuccess for CreatePollForm now expects to pass the new Poll data.
        onOpenChange is not relevant here as it's not in a dialog context.
      */}
      <CreatePollForm onSubmitSuccess={handlePollCreateStandalone} />
    </div>
  );
}
