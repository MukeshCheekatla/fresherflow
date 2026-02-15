'use client';

import { useSyncExternalStore } from 'react';
import { getPendingOfflineActionsCount, subscribeOfflineActionQueue } from '@/lib/offline/actionQueue';

export function useOfflineActionQueue(ownerId?: string) {
    return useSyncExternalStore(
        subscribeOfflineActionQueue,
        () => getPendingOfflineActionsCount(ownerId),
        () => 0
    );
}
