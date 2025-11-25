import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Candidate } from '@/types';

export const useCandidate = (candidateId: string) => {
    const { token } = useAuth();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token || !candidateId) {
            return;
        }

        const getCandidate = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/candidate/${candidateId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    // Check if data is nested in data.data or directly in data
                    // Based on user request, we should expect response.data.data
                    // But let's be safe and check
                    const candidateData = response.data.data?.candidate || response.data.candidate;
                    setCandidate(candidateData);
                } else {
                    setError("Failed to fetch candidate");
                }
            } catch (err) {
                setError("An error occurred while fetching candidate details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        getCandidate();
    }, [token, candidateId]);

    return { candidate, loading, error };
};
