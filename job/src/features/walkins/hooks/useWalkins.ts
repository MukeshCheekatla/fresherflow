import { useState, useEffect, useCallback } from 'react';
import { WalkinsService } from '../services/walkins.service';
import { WalkinJob } from '@/types/walkin';

export function useWalkins() {
    const [walkins, setWalkins] = useState<{ id: string; data: WalkinJob }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchWalkins = useCallback(async () => {
        try {
            setLoading(true);
            const data = await WalkinsService.getAll();
            setWalkins(data);
        } catch (err) {
            console.error(err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWalkins();
    }, [fetchWalkins]);

    const removeWalkin = (id: string) => {
        setWalkins(prev => prev.filter(w => w.id !== id));
    };

    return { walkins, loading, error, refetch: fetchWalkins, removeWalkin };
}
