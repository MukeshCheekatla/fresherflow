import { useState, useEffect, useCallback } from 'react';
import { AlertsService } from '../services/alerts.service';
import { Alert } from '@/types/alert';
import { useAuth } from '@/context/AuthContext';

export function useAlerts() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<{ id: string; data: Alert }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await AlertsService.getUserAlerts(user.uid);
            setAlerts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const removeAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    return { alerts, loading, refetch: fetchAlerts, removeAlert };
}
