import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Opportunity } from '@fresherflow/types';
import { opportunitiesApi, savedApi } from '@/lib/api/client';
import { useDebounce } from '@/lib/hooks/useDebounce';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { readFeedCache, saveFeedCache } from '@/lib/offline/opportunitiesFeedCache';
import { calculateOpportunityMatch } from '@/lib/matchScore';

interface UseOpportunitiesFeedOptions {
    type?: string | null;
    selectedLoc?: string | null;
    showOnlySaved: boolean;
    closingSoon: boolean;
    search: string;
    minSalary?: number | null;
    maxSalary?: number | null;
}

export function useOpportunitiesFeed({
    type,
    selectedLoc,
    showOnlySaved,
    closingSoon,
    search,
    minSalary,
    maxSalary,
}: UseOpportunitiesFeedOptions) {
    const { user, profile, isLoading: authLoading } = useAuth();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usingCachedFeed, setUsingCachedFeed] = useState(false);
    const [cachedAt, setCachedAt] = useState<number | null>(null);
    const [profileIncomplete, setProfileIncomplete] = useState<{ percentage: number; message: string } | null>(null);
    const lastRequestTimestamp = useRef(0);
    const debouncedSearch = useDebounce(search, 300);

    const loadOpportunities = useCallback(async (pageNum = 1, append = false) => {
        if (authLoading) return;
        const timestamp = Date.now();
        lastRequestTimestamp.current = timestamp;

        setIsLoading(true);
        setProfileIncomplete(null);
        setError(null);
        setUsingCachedFeed(false);

        try {
            interface FeedResponse {
                opportunities: Opportunity[];
                total?: number;
                count?: number;
                limit?: number;
            }
            let data: FeedResponse;
            if (showOnlySaved) {
                if (!user) {
                    setError('Please log in to view saved opportunities');
                    setOpportunities([]);
                    setTotalCount(0);
                    setIsLoading(false);
                    return;
                }
                data = (await savedApi.list()) as FeedResponse;
                if (type) {
                    data.opportunities = data.opportunities?.filter((opp: Opportunity) => opp.type === type) || [];
                }
            } else {
                data = (await opportunitiesApi.list({
                    type: type || undefined,
                    city: selectedLoc || undefined,
                    minSalary: minSalary || undefined,
                    maxSalary: maxSalary || undefined,
                    closingSoon: closingSoon || undefined,
                    page: pageNum
                })) as FeedResponse;
            }

            // Freshness check: only update if this is the most recent request
            if (lastRequestTimestamp.current !== timestamp) return;

            const newOpps = data.opportunities || [];
            setOpportunities(prev => append ? [...prev, ...newOpps] : newOpps);
            setTotalCount(data.total || data.count || (append ? opportunities.length + newOpps.length : newOpps.length));
            setHasMore(newOpps.length >= (data.limit || 50));
            setPage(pageNum);

            if (!showOnlySaved && pageNum === 1) {
                saveFeedCache(newOpps, data.total || data.count || newOpps.length);
                setCachedAt(Date.now());
            }
        } catch (err: unknown) {
            if (lastRequestTimestamp.current !== timestamp) return;
            const errorObj = err as { code?: string; completionPercentage?: number; message?: string };
            if (errorObj.code === 'PROFILE_INCOMPLETE') {
                setProfileIncomplete({
                    percentage: errorObj.completionPercentage || 0,
                    message: errorObj.message || 'Complete your profile to access job listings'
                });
            } else {
                const cached = readFeedCache();
                if (cached && !showOnlySaved && pageNum === 1) {
                    setOpportunities(cached.opportunities);
                    setTotalCount(cached.count || cached.opportunities.length);
                    setUsingCachedFeed(true);
                    setCachedAt(cached.cachedAt);
                    setHasMore(false);
                    toast.success('Offline mode: showing cached feed.');
                } else {
                    const { getErrorMessage } = await import('@/lib/utils/error');
                    const msg = getErrorMessage(err);
                    setError(msg);
                    toast.error(msg);
                }
            }
        } finally {
            if (lastRequestTimestamp.current === timestamp) {
                setIsLoading(false);
            }
        }
    }, [type, selectedLoc, user, authLoading, showOnlySaved, minSalary, maxSalary, closingSoon, opportunities.length]);

    useEffect(() => {
        if (!authLoading) {
            loadOpportunities();
        }
    }, [loadOpportunities, authLoading, user, showOnlySaved]);

    const filteredOpps = useMemo(() => {
        const filtered = opportunities.filter(opp => {
            const matchesSearch = !debouncedSearch ||
                opp.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                opp.company.toLowerCase().includes(debouncedSearch.toLowerCase());

            const matchesLoc = !selectedLoc || (opp.locations || []).some((loc) => loc.toLowerCase().includes(selectedLoc.toLowerCase()));

            const matchesClosingSoon = !closingSoon || (() => {
                if (!opp.expiresAt) return false;
                const expiryDate = new Date(opp.expiresAt);
                const now = new Date();
                const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
                return expiryDate >= now && expiryDate <= threeDaysFromNow;
            })();

            const matchesSalary = (!minSalary || (opp.salaryMax && opp.salaryMax >= minSalary) || (opp.salaryMin && opp.salaryMin >= minSalary)) &&
                (!maxSalary || (opp.salaryMin && opp.salaryMin <= maxSalary));

            return matchesSearch && matchesLoc && matchesClosingSoon && matchesSalary;
        });

        const enriched = filtered.map((opp) => {
            const match = calculateOpportunityMatch(profile, opp);
            return {
                ...opp,
                matchScore: match.score,
                matchReason: match.reason,
            };
        });

        return enriched.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }, [opportunities, debouncedSearch, selectedLoc, closingSoon, minSalary, maxSalary, profile]);

    const toggleSave = async (opportunityId: string) => {
        if (!user) {
            toast.error('Please log in to save opportunities');
            return;
        }
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            toast.error('You are offline. Reconnect to update saved listings.');
            return;
        }

        // OPTIMISTIC UPDATE: Update UI immediately
        const previousState = [...opportunities];
        const newSavedState = !opportunities.find(o => o.id === opportunityId)?.isSaved;

        setOpportunities(prev => prev.map(opp =>
            opp.id === opportunityId
                ? { ...opp, isSaved: newSavedState }
                : opp
        ));

        // Background sync
        try {
            const result = await savedApi.toggle(opportunityId) as { saved: boolean };

            // Verify sync result matches optimistic state
            if (result.saved !== newSavedState) {
                setOpportunities(prev => prev.map(opp =>
                    opp.id === opportunityId
                        ? { ...opp, isSaved: result.saved }
                        : opp
                ));
            }

            if (result.saved) {
                import('@/lib/api/client').then(({ growthApi }) => {
                    growthApi.trackEvent('SAVE_JOB', 'opportunity_feed').catch(() => undefined);
                });
            }
        } catch (err: unknown) {
            // ROLLBACK: Revert to previous state on error
            setOpportunities(previousState);
            const { getErrorMessage } = await import('@/lib/utils/error');
            toast.error(getErrorMessage(err) || 'Failed to update bookmark');
        }
    };

    return {
        opportunities,
        filteredOpps,
        totalCount,
        page,
        hasMore,
        isLoading,
        error,
        usingCachedFeed,
        cachedAt,
        profileIncomplete,
        toggleSave,
        setOpportunities,
        reload: () => loadOpportunities(1, false),
        loadMore: () => hasMore && !isLoading && loadOpportunities(page + 1, true),
    };
}
