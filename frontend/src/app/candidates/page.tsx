
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Candidate } from '@/types';
import { Users, Search, MapPin, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="flex flex-row items-start gap-4 p-4 bg-secondary/30">
        {candidate.imageUrl && (
          <Image
            src={candidate.imageUrl}
            alt={candidate.name}
            width={80}
            height={80}
            className="rounded-md border"
            data-ai-hint={candidate.dataAiHint || "person portrait"}
          />
        )}
        <div>
          <CardTitle className="text-lg">{candidate.name}</CardTitle>
          <CardDescription className="text-sm">
            {candidate.party} &bull; <MapPin className="inline h-3 w-3 mr-1" />{candidate.region}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-1">Key Policies:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {candidate.keyPolicies.slice(0, 3).map((policy, index) => (
            <li key={index}>{policy}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Link href={`/candidates/${candidate._id}`} >
          <Button variant="outline" size="sm" className="w-full">
            View Full Profile <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function CandidateDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [ candidates, setCandidates ] = useState<Candidate[]>([]);
  const { token } = useAuth();

  useEffect(()=>{
    if(!token){
      return;
    }
    const getCandidates = async()=>{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/candidate`,{
        headers:{
          "Authorization": `Bearer ${token}`
        }
      });

      if(response.data.success){
        setCandidates(response.data.candidates);
      }
    };
    getCandidates();
  },[token]);


  const regions = useMemo(() => ['all', ...new Set(candidates.map(c => c.region))], [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            candidate.party.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'all' || candidate.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, regionFilter, candidates]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Users className="mr-3 h-7 w-7 text-primary" />
        Candidate Directory
      </h1>
      <p className="text-muted-foreground mb-6">
        Search for candidates, filter by region, and learn about their platforms.
      </p>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or party..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Search candidates"
          />
        </div>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger aria-label="Filter by region">
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map(region => (
              <SelectItem key={region} value={region}>
                {region === 'all' ? 'All Regions' : region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <CandidateCard key={candidate._id} candidate={candidate} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No candidates found matching your criteria.</p>
      )}
    </div>
  );
}
