'use client';

import { useState, useEffect, useCallback } from 'react';
import { alertsApi } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUnreadNotifications() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchCount = useCallback(async () => {
        if (!user) return;
        try {
            const data = await alertsApi.getUnreadCount();
            setUnreadCount(data.count);
        } catch {
            // silent fail
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            // Use setTimeout to avoid synchronous setState in effect
            setTimeout(() => setUnreadCount(0), 0);
            return;
        }

        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => fetchCount(), 0);

        // Optional: Poll every 5 minutes for new notifications
        const interval = setInterval(fetchCount, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user, fetchCount]);

    return {
        unreadCount,
        refresh: fetchCount,
    };
}
