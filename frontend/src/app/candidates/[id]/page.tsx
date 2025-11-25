'use client';

import { useParams } from 'next/navigation';
import { useCandidate } from './hooks/useCandidate';
import { CandidateProfile } from './components/CandidateProfile';

export default function CandidateProfilePage() {
  const params = useParams();
  const candidateId = typeof params.id === 'string' ? params.id : '';

  const { candidate, loading, error } = useCandidate(candidateId);

  return (
    <CandidateProfile candidate={candidate} loading={loading} error={error} />
  );
}
