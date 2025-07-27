
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockCampaigns as initialMockCampaigns } from '@/lib/mockData';
import type { Campaign } from '@/types';
import { Search, Filter, TrendingUp, MapPin, ChevronRight, PlusCircle } from 'lucide-react';

function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col">
      {campaign.imageUrl && (
        <div className="relative w-full h-40">
          <Image
            src={campaign.imageUrl}
            alt={campaign.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={campaign.dataAiHint || "campaign event"}
          />
        </div>
      )}
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{campaign.name}</CardTitle>
        <CardDescription className="text-sm">
          {campaign.party && <span className="font-medium">{campaign.party} &bull; </span>}
          <MapPin className="inline h-3 w-3 mr-1" />{campaign.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{campaign.description}</p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Link href={`/campaigns/${campaign.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            Learn More <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function CampaignDiscoveryPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialMockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  const parties = useMemo(() => ['all', ...new Set(campaigns.map(c => c.party).filter(Boolean) as string[])], [campaigns]);
  const locations = useMemo(() => ['all', ...new Set(campaigns.map(c => c.location).filter(Boolean) as string[])], [campaigns]);


  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = locationFilter === '' || locationFilter === 'all' || campaign.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesParty = partyFilter === 'all' || campaign.party === partyFilter;
      return matchesSearch && matchesLocation && matchesParty;
    });

    if (sortBy === 'popularity') {
      filtered.sort((a, b) => b.popularityScore - a.popularityScore);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => parseInt(b.id.replace('camp','')) - parseInt(a.id.replace('camp','')));
    } else if (sortBy === 'name') {
      filtered.sort((a,b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [searchTerm, locationFilter, partyFilter, sortBy, campaigns]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Search className="mr-3 h-7 w-7 text-primary" />
          Campaign Discovery
        </h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Discover and follow campaigns based on location, political party, and popularity.
      </p>

      <Card className="mb-8 p-4 sm:p-6 shadow-md rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search campaigns by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label="Search campaigns"
            />
          </div>
           <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger aria-label="Filter by location">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.filter(l => l !== 'all').map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={partyFilter} onValueChange={setPartyFilter}>
            <SelectTrigger aria-label="Filter by party">
              <SelectValue placeholder="Filter by party" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parties</SelectItem>
              {parties.filter(p => p !== 'all').map(party => (
                <SelectItem key={party} value={party}>{party}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="lg:col-span-4">
            <Label htmlFor="sort-by" className="text-sm font-medium">Sort by:</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-by" aria-label="Sort campaigns">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity (Trending)</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {filteredAndSortedCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No campaigns found matching your criteria. Try creating one!</p>
      )}
    </div>
  );
}
