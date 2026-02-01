import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/features/auth/services/user.service';
import { useProfile } from '@/features/auth/hooks/useProfile';

export function useSavedJobs() {
    const { user } = useAuth();
    const { profile, refetch } = useProfile();
    // Optimization: useProfile might cause double fetching if not managed carefully (e.g. valid cache or context).
    // For now, simple implementation. Better: AuthContext could expose profile *if* it was part of core, but user wants strict separation.
    // So, pages needing saved status will use useProfile().

    const isSaved = (jobId: string) => {
        return profile?.savedJobs.includes(jobId) || false;
    };

    const toggleSave = async (jobId: string) => {
        if (!user || !profile) return;
        const currentlySaved = isSaved(jobId);

        // Optimistic UI update could happen here in a local state wrapper or react-query
        await UserService.toggleSavedJob(user.uid, jobId, currentlySaved);
        refetch();
    };

    return { isSaved, toggleSave, savedJobIds: profile?.savedJobs || [] };
}
