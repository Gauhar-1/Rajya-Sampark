
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, FileText, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Candidate } from '@/types';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

export default function CandidateProfilePage() {
  const params = useParams();
  const { token } = useAuth();
  const candidateId = typeof params.id === 'string' ? params.id : '';
  const [ candidate, setCandidate ] = useState<Candidate | null>(null);

  useEffect(()=>{
     if(!token){
      return;
     }

     const getCandidate = async()=>{
      const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/candidate/${candidateId}`,{
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if(response.data.success){
        setCandidate(response.data.candidate);
      }
     };

     getCandidate();
  },[token])

  if (!candidate) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Candidate Not Found</h1>
        <p className="text-muted-foreground">The candidate profile you are looking for does not exist.</p>
        <Link href="/candidates">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/candidates">
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Directory
        </Button>
      </Link>

      <Card className="overflow-hidden shadow-xl rounded-lg">
        <CardHeader className="bg-secondary/30 p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {candidate.imageUrl && (
              <Image
                src={candidate.imageUrl}
                alt={candidate.name}
                width={150}
                height={150}
                className="rounded-lg border-4 border-background shadow-md"
                data-ai-hint={candidate.dataAiHint || "person portrait"}
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">{candidate.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                <Badge variant="secondary" className="mr-2">{candidate.party}</Badge>
                <MapPin className="inline h-4 w-4 mr-1" />{candidate.region}
              </CardDescription>
              {candidate.manifestoUrl && (
                <Link href={candidate.manifestoUrl}>
                  <Button variant="link" className="px-0 mt-2 text-primary">
                    <FileText className="mr-2 h-4 w-4" /> View Full Manifesto
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              About {candidate.name}
            </h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {candidate.profileBio || 'No biography available for this candidate.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Key Policies
            </h2>
            {candidate.keyPolicies.length > 0 ? (
              <ul className="space-y-2">
                {candidate.keyPolicies.map((policy, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2 mt-1">&#10004;</span> {/* Checkmark */}
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No key policies listed for this candidate.</p>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
