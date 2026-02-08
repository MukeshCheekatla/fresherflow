import type { Opportunity } from '@fresherflow/types';

const FEED_CACHE_KEY = 'ff_feed_cache_v1';
const MAX_ITEMS = 80;

type FeedCachePayload = {
    cachedAt: number;
    opportunities: Opportunity[];
    count: number;
};

export function saveFeedCache(opportunities: Opportunity[], count: number) {
    if (typeof window === 'undefined') return;
    const payload: FeedCachePayload = {
        cachedAt: Date.now(),
        opportunities: opportunities.slice(0, MAX_ITEMS),
        count
    };
    try {
        localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(payload));
    } catch {
        // Ignore storage failures in private mode/quota pressure.
    }
}

export function readFeedCache(): FeedCachePayload | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(FEED_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as FeedCachePayload;
        if (!Array.isArray(parsed.opportunities) || typeof parsed.cachedAt !== 'number') return null;
        return parsed;
    } catch {
        return null;
    }
}
