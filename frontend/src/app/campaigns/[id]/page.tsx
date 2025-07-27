
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCampaignById, mockCampaigns } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, MapPin, Users, Tag, TrendingUp, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CampaignProfilePage() {
  const params = useParams();
  const campaignId = typeof params.id === 'string' ? params.id : '';
  const campaign = getCampaignById(campaignId) || mockCampaigns.find(c => c.id === campaignId); 

  if (!campaign) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Campaign Not Found</h1>
        <p className="text-muted-foreground">The campaign profile you are looking for does not exist.</p>
        <Link href="/campaigns">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign Discovery
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/campaigns" >
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaign Discovery
        </Button>
      </Link>

      <Card className="overflow-hidden shadow-xl rounded-lg">
        <CardHeader className="bg-secondary/30 p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {campaign.imageUrl && (
              <div className="relative w-full md:w-1/3 aspect-[16/9] rounded-lg overflow-hidden border-4 border-background shadow-md">
                <Image
                  src={campaign.imageUrl}
                  alt={campaign.name}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={campaign.dataAiHint || "campaign image"}
                />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">{campaign.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2 space-x-2 flex items-center flex-wrap">
                {campaign.party && <Badge variant="secondary" className="mb-1">{campaign.party}</Badge>}
                <Badge variant="outline" className="mb-1 flex items-center">
                  <Tag className="mr-1 h-3 w-3" /> {campaign.category}
                </Badge>
              </CardDescription>
              <div className="mt-3 text-sm text-muted-foreground flex items-center">
                <MapPin className="inline h-4 w-4 mr-2 text-primary" />{campaign.location}
              </div>
              <div className="mt-1 text-sm text-muted-foreground flex items-center">
                <TrendingUp className="inline h-4 w-4 mr-2 text-primary" />Popularity Score: {campaign.popularityScore}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Building className="mr-2 h-5 w-5 text-primary" />
              About This Campaign
            </h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {campaign.description || 'No detailed description available for this campaign.'}
            </p>
          </section>
          
          {/* Placeholder for more sections like 'Recent Updates', 'Events', 'Get Involved' */}
          {/* 
          <section>
            <h2 className="text-xl font-semibold mb-3">Key Goals</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Goal 1...</li>
              <li>Goal 2...</li>
            </ul>
          </section>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
