
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Search, HandHeart, Vote as VoteIcon, Loader2 } from 'lucide-react'; 
import { mockCandidates } from '@/lib/mockData'; 
import type { Candidate } from '@/types';

interface SidebarPollOption {
  id: string;
  text: string;
  votes: number;
}

interface SidebarPoll {
  question: string;
  options: SidebarPollOption[];
  totalVotes: number;
  userHasVoted: boolean;
}

export function RightSidebarContent() {
  const [electionPoll, setElectionPoll] = useState<SidebarPoll | null>(null);
  const [isLoadingPoll, setIsLoadingPoll] = useState(true);

  useEffect(() => {
    // Simulate fetching or preparing poll data
    // In a real app, candidates might be fetched or come from context
    const pollOptions: SidebarPollOption[] = mockCandidates.map(candidate => ({
      id: candidate.id,
      text: candidate.name,
      votes: Math.floor(Math.random() * 50), // Start with some mock votes for demo
    }));

    // "Undecided" option is removed
    // pollOptions.push({ id: 'undecided', text: 'Undecided', votes: Math.floor(Math.random() * 20) });
    
    let totalInitialVotes = pollOptions.reduce((sum, opt) => sum + opt.votes, 0);

    setElectionPoll({
      question: 'Who do you think will win the upcoming election?',
      options: pollOptions,
      totalVotes: totalInitialVotes,
      userHasVoted: false, // This will be local to the session
    });
    setIsLoadingPoll(false);
  }, []);

  const handlePollVote = (optionId: string) => {
    if (!electionPoll || electionPoll.userHasVoted) return;

    setElectionPoll(prevPoll => {
      if (!prevPoll) return null;
      const newOptions = prevPoll.options.map(opt =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      return {
        ...prevPoll,
        options: newOptions,
        totalVotes: prevPoll.totalVotes + 1,
        userHasVoted: true,
      };
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <VoteIcon className="mr-2 h-5 w-5 text-primary" />
            Election Poll
          </CardTitle>
          <CardDescription>Share your prediction for the election outcome.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingPoll && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="ml-2 text-sm text-muted-foreground">Loading poll...</p>
            </div>
          )}
          {electionPoll && !isLoadingPoll && (
            <>
              <p className="text-sm font-medium mb-3">{electionPoll.question}</p>
              <div className="space-y-2">
                {electionPoll.options.map((option) => {
                  const percentage = electionPoll.totalVotes > 0 ? (option.votes / electionPoll.totalVotes) * 100 : 0;
                  return (
                    <div key={option.id}>
                      {electionPoll.userHasVoted ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{option.text}</span>
                            <span>{percentage.toFixed(0)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-sm"
                          onClick={() => handlePollVote(option.id)}
                        >
                          {option.text}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
           {!electionPoll && !isLoadingPoll && (
             <p className="text-sm text-muted-foreground text-center py-4">Could not load poll.</p>
           )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Search className="mr-2 h-5 w-5 text-primary" />
            Discover Campaigns
          </CardTitle>
          <CardDescription>Find and follow campaigns that matter to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">
            Explore campaigns by location, party, or popularity. Get involved!
          </p>
          <Link href="/campaigns">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Find Campaigns
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <HandHeart className="mr-2 h-5 w-5 text-primary" />
            Volunteer Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">
            Make a difference in your community. Sign up to volunteer for a campaign.
          </p>
          <Link href="/volunteer-signup">
            <Button variant="secondary" className="w-full">
              Sign Up to Volunteer
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
