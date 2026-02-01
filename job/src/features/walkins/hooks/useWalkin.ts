import { useState, useEffect, useCallback } from 'react';
import { WalkinsService } from '../services/walkins.service';
import { WalkinJob } from '@/types/walkin';

export function useWalkin(id: string | null) {
    const [walkin, setWalkin] = useState<WalkinJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchWalkin = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const result = await WalkinsService.getById(id);
            if (result) {
                setWalkin(result.data);
            } else {
                setWalkin(null);
            }
        } catch (err) {
            console.error(err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchWalkin();
    }, [fetchWalkin]);

    return { walkin, loading, error, refetch: fetchWalkin };
}
