
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const groupId = typeof params.groupId === 'string' ? params.groupId : 'Unknown Group';
  const groupName = searchParams.get('name') || groupId;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]"> {/* Adjust height based on your layout */}
      <Card className="flex-grow flex flex-col shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-secondary/30 p-4 border-b">
          <div className="flex items-center gap-3">
            <Link href="/candidate-dashboard">
              <Button variant="ghost" size="icon" aria-label="Back to dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <CardTitle className="text-xl">{groupName}</CardTitle>
          </div>
          <CardDescription>This is a placeholder chat interface. Messaging is not functional.</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {/* Mock messages */}
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg max-w-xs">
              <p className="text-sm font-medium">Volunteer Alice</p>
              <p className="text-sm">Hello team! When is the next canvassing event?</p>
              <p className="text-xs text-muted-foreground text-right">10:00 AM</p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
              <p className="text-sm font-medium">Candidate (You)</p>
              <p className="text-sm">Hi Alice! It's scheduled for Saturday at 10 AM. More details in the event channel.</p>
              <p className="text-xs text-primary-foreground/80 text-right">10:02 AM</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg max-w-xs">
              <p className="text-sm font-medium">Volunteer Bob</p>
              <p className="text-sm">Great, I'll be there!</p>
              <p className="text-xs text-muted-foreground text-right">10:03 AM</p>
            </div>
          </div>
           <div className="text-center text-muted-foreground text-xs py-4">
            --- Chat placeholder: Further messages would appear here ---
          </div>
        </CardContent>
        
        <div className="border-t p-4 bg-background">
          <div className="flex items-center space-x-2">
            <Textarea
              placeholder="Type your message here... (disabled)"
              className="flex-grow resize-none"
              rows={1}
              disabled
            />
            <Button disabled>
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
