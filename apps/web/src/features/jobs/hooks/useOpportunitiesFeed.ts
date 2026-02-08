import { useCallback, useEffect, useMemo, useState } from 'react';
import { Opportunity } from '@fresherflow/types';
import { opportunitiesApi, savedApi } from '@/lib/api/client';
import { useDebounce } from '@/lib/hooks/useDebounce';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { readFeedCache, saveFeedCache } from '@/lib/offline/opportunitiesFeedCache';

interface UseOpportunitiesFeedOptions {
    type?: string | null;
    selectedLoc?: string | null;
    showOnlySaved: boolean;
    closingSoon: boolean;
    search: string;
}

export function useOpportunitiesFeed({
    type,
    selectedLoc,
    showOnlySaved,
    closingSoon,
    search,
}: UseOpportunitiesFeedOptions) {
    const { user, isLoading: authLoading } = useAuth();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usingCachedFeed, setUsingCachedFeed] = useState(false);
    const [cachedAt, setCachedAt] = useState<number | null>(null);
    const [profileIncomplete, setProfileIncomplete] = useState<{ percentage: number; message: string } | null>(null);
    const debouncedSearch = useDebounce(search, 300);

    const loadOpportunities = useCallback(async () => {
        if (!user || authLoading) return;
        setIsLoading(true);
        setProfileIncomplete(null);
        setError(null);
        setUsingCachedFeed(false);
        try {
            let data;
            if (showOnlySaved) {
                data = await savedApi.list();
                if (type) {
                    data.opportunities = data.opportunities?.filter((opp: Opportunity) => opp.type === type) || [];
                }
            } else {
                data = await opportunitiesApi.list({
                    type: type || undefined,
                    city: selectedLoc || undefined
                });
            }
            setOpportunities(data.opportunities || []);
            setTotalCount(data.count || data.opportunities?.length || 0);
            if (!showOnlySaved) {
                saveFeedCache(data.opportunities || [], data.count || data.opportunities?.length || 0);
                setCachedAt(Date.now());
            }
        } catch (err: unknown) {
            const error = err as { code?: string; completionPercentage?: number; message?: string };
            if (error.code === 'PROFILE_INCOMPLETE') {
                setProfileIncomplete({
                    percentage: error.completionPercentage || 0,
                    message: error.message || 'Complete your profile to access job listings'
                });
            } else {
                const cached = readFeedCache();
                if (cached && !showOnlySaved) {
                    setOpportunities(cached.opportunities);
                    setTotalCount(cached.count || cached.opportunities.length);
                    setUsingCachedFeed(true);
                    setCachedAt(cached.cachedAt);
                    toast.success('Offline mode: showing cached feed.');
                } else {
                    const message = error.message || 'Failed to load feed';
                    setError(message);
                    toast.error(message);
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, [type, selectedLoc, user, authLoading, showOnlySaved]);

    useEffect(() => {
        if (!authLoading && user) {
            loadOpportunities();
        }
    }, [loadOpportunities, authLoading, user, showOnlySaved]);

    const filteredOpps = useMemo(() => {
        return opportunities.filter(opp => {
            const matchesSearch = !debouncedSearch ||
                opp.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                opp.company.toLowerCase().includes(debouncedSearch.toLowerCase());

            const matchesLoc = !selectedLoc || opp.locations.includes(selectedLoc);

            const matchesClosingSoon = !closingSoon || (() => {
                if (!opp.expiresAt) return false;
                const expiryDate = new Date(opp.expiresAt);
                const now = new Date();
                const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
                return expiryDate >= now && expiryDate <= threeDaysFromNow;
            })();

            return matchesSearch && matchesLoc && matchesClosingSoon;
        });
    }, [opportunities, debouncedSearch, selectedLoc, closingSoon]);

    const toggleSave = async (opportunityId: string) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            toast.error('You are offline. Reconnect to update saved listings.');
            return;
        }
        try {
            const result = await savedApi.toggle(opportunityId);
            setOpportunities(prev => prev.map(opp =>
                opp.id === opportunityId
                    ? { ...opp, isSaved: result.saved }
                    : opp
            ));
        } catch {
            toast.error('Failed to update bookmark');
        }
    };

    return {
        opportunities,
        filteredOpps,
        totalCount,
        isLoading,
        error,
        usingCachedFeed,
        cachedAt,
        profileIncomplete,
        toggleSave,
        setOpportunities,
        reload: loadOpportunities,
    };
}
