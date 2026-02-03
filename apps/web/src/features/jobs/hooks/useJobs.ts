import { useState, useEffect } from 'react';
import { JobsService } from '../services/jobs.service';

export function useJobs(limit?: number) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await JobsService.getAll();
            setJobs(data.map((opp: any) => ({
                id: opp.id || opp.opportunity?.id,
                data: opp.opportunity || opp
            })));
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    return {
        jobs,
        loading,
        error,
        refetch: fetchJobs
    };
}

