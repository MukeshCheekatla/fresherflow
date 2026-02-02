import { useState, useEffect } from 'react';
import { WalkinsService } from '../services/walkins.service';

export function useWalkins(limit?: number) {
    const [walkins, setWalkins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWalkins = async () => {
        try {
            setLoading(true);
            const data = await WalkinsService.getAll();
            setWalkins(data.map((opp: any) => ({
                id: opp.id || opp.opportunity?.id,
                data: opp.opportunity || opp
            })));
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching walk-ins:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalkins();
    }, []);

    return {
        walkins,
        loading,
        error,
        refetch: fetchWalkins
    };
}
