'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockElectionEvents } from '@/lib/mockData';
import type { ElectionEvent } from '@/types';
import { CalendarDays, Info, AlertCircle } from 'lucide-react';

function ElectionEventCard({ event }: { event: ElectionEvent }) {
  const Icon = event.type === 'Deadline' ? AlertCircle : event.type === 'Key Event' ? Info : CalendarDays;
  const iconColor = event.type === 'Deadline' ? 'text-destructive' : event.type === 'Key Event' ? 'text-accent' : 'text-primary';

  return (
    <Card className="mb-4 shadow-md rounded-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Icon className={`mr-2 h-5 w-5 ${iconColor}`} />
            {event.title}
          </CardTitle>
          <span className={`text-sm font-medium ${iconColor}`}>{event.type}</span>
        </div>
        <CardDescription>{event.date}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{event.description}</p>
      </CardContent>
    </Card>
  );
}

export default function ElectionTimelinePage() {
  
  const sortedEvents = [...mockElectionEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <CalendarDays className="mr-3 h-7 w-7 text-primary" />
        Election Timeline
      </h1>
      <p className="text-muted-foreground mb-6">
        Upcoming elections, key dates, deadlines, and events in chronological order.
      </p>
      {sortedEvents.map((event) => (
        <ElectionEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
