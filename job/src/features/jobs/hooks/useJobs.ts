'use client';

import { useState, useEffect, useCallback } from 'react';
import { JobsService } from '../services/jobs.service';
import { OnlineJob } from '@/types/job';

export function useJobs(limitCount: number = 50) {
    const [jobs, setJobs] = useState<{ id: string; data: OnlineJob }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await JobsService.getAll({ limitCount });
            setJobs(data);
        } catch (err) {
            console.error(err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [limitCount]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const removeJob = (id: string) => {
        setJobs(prev => prev.filter(j => j.id !== id));
    };

    return { jobs, loading, error, refetch: fetchJobs, removeJob };
}
