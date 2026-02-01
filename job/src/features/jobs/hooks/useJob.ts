import { useState, useEffect, useCallback } from 'react';
import { JobsService } from '../services/jobs.service';
import { OnlineJob } from '@/types/job';

export function useJob(id: string | null) {
    const [job, setJob] = useState<OnlineJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchJob = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const result = await JobsService.getById(id);
            if (result) {
                setJob(result.data);
            } else {
                setJob(null);
                setError(new Error('Job not found'));
            }
        } catch (err) {
            console.error(err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

    return { job, loading, error, refetch: fetchJob };
}
