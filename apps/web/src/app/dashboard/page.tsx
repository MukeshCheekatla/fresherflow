'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { opportunitiesApi, dashboardApi, savedApi } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Opportunity } from '@fresherflow/types';
import toast from 'react-hot-toast';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import { SkeletonJobCard } from '@/components/ui/Skeleton';
import JobCard from '@/features/jobs/components/JobCard';
import { Button } from '@/components/ui/Button';
import { formatSyncTime, getFeedLastSyncAt } from '@/lib/offline/syncStatus';

// const UPDATE_INTERVAL_MS = 60_000;
const HOURS_72_IN_MS = 72 * 60 * 60 * 1000;
const HOURS_24_IN_MS = 24 * 60 * 60 * 1000;

export default function DashboardPage() {
    const { user, profile, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [recentOpps, setRecentOpps] = useState<Opportunity[]>([]);
    const [isLoadingOpps, setIsLoadingOpps] = useState(true);

    const [highlights, setHighlights] = useState<{ urgent: { walkins: Opportunity[]; others: Opportunity[] }; newlyAdded: Opportunity[] } | null>(null);
    const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [recentError, setRecentError] = useState<string | null>(null);
    const [highlightsError, setHighlightsError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [feedLastSyncAt, setFeedLastSyncAt] = useState<number | null>(null);
    const [lastSeenAt, setLastSeenAt] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'featured' | 'latest' | 'expiring' | 'all' | 'applied' | 'archived'>('featured');

    useEffect(() => {
        // Only load once when auth is confirmed and profile is 100% complete
        if (!authLoading && user && profile?.completionPercentage === 100 && !hasLoaded) {
            setHasLoaded(true);
            loadRecentOpportunities();
            loadHighlights();
        }
    }, [authLoading, user, profile, hasLoaded]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        setIsOnline(window.navigator.onLine);
        setFeedLastSyncAt(getFeedLastSyncAt());

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !user) return;
        const storageKey = 'ff_dashboard_last_seen_at';
        const previous = Number(window.localStorage.getItem(storageKey) || '0');
        setLastSeenAt(previous > 0 ? previous : null);
        window.localStorage.setItem(storageKey, String(Date.now()));
    }, [user]);

    useEffect(() => {
        if (!hasLoaded || !user) return;

        // DISABLED: Auto-refresh causes API spam every 3 seconds
        // Only enable in production if needed for real-time updates
        /*
        const interval = window.setInterval(() => {
            loadRecentOpportunities();
            loadHighlights();
        }, UPDATE_INTERVAL_MS);
        return () => window.clearInterval(interval);
        */
    }, [hasLoaded, user]);

    const loadHighlights = async () => {
        setHighlightsError(null);
        try {
            const data = await dashboardApi.getHighlights() as { urgent: { walkins: Opportunity[]; others: Opportunity[] }; newlyAdded: Opportunity[] };
            setHighlights(data);
        } catch (err: unknown) {
            const message = (err as Error)?.message || 'Unable to load highlights';
            setHighlightsError(message);
        } finally {
            setIsLoadingHighlights(false);
            setFeedLastSyncAt(getFeedLastSyncAt());
        }
    };

    const toggleSave = async (opportunityId: string) => {
        try {
            const result = await savedApi.toggle(opportunityId) as { saved: boolean };
            setRecentOpps(prev => prev.map(opp =>
                opp.id === opportunityId ? { ...opp, isSaved: result.saved } : opp
            ));
            // Also update highlights if they contain this job
            setHighlights(prev => {
                if (!prev) return null;
                const updateList = (list: Opportunity[]) => list.map(o => o.id === opportunityId ? { ...o, isSaved: result.saved } : o);
                return {
                    urgent: {
                        walkins: updateList(prev.urgent.walkins),
                        others: updateList(prev.urgent.others)
                    },
                    newlyAdded: updateList(prev.newlyAdded)
                };
            });
        } catch {
            toast.error('Bookmark update failed');
        }
    };

    const loadRecentOpportunities = async () => {
        setRecentError(null);
        try {
            const data = await opportunitiesApi.list() as { opportunities: Opportunity[] };
            // Keep a broader pool so dashboard tabs can rotate fresh content.
            const sanitized = (data.opportunities || []).slice(0, 60).map((o: Opportunity) => ({
                ...o,
                locations: o.locations || [],
                requiredSkills: o.requiredSkills || []
            }));
            setRecentOpps(sanitized);
        } catch (err: unknown) {
            const message = (err as Error)?.message || 'Unable to load recommended listings';
            setRecentError(message);
        } finally {
            setIsLoadingOpps(false);
            setFeedLastSyncAt(getFeedLastSyncAt());
        }
    };

    const retryAll = () => {
        setIsLoadingOpps(true);
        setIsLoadingHighlights(true);
        loadRecentOpportunities();
        loadHighlights();
    };

    const getDaysToExpiry = (expiresAt?: string | Date | null) => {
        if (!expiresAt) return null;
        const diffMs = new Date(expiresAt).getTime() - new Date().getTime();
        return Math.ceil(diffMs / (HOURS_24_IN_MS));
    };

    const activeRecentOpps = recentOpps.filter((o) => !o.expiresAt || new Date(o.expiresAt) > new Date());
    const latestList = [...activeRecentOpps].sort(
        (a, b) => new Date(b.postedAt as string | Date).getTime() - new Date(a.postedAt as string | Date).getTime()
    );
    // Keep API-provided personalized ordering for best-match sections.
    const bestMatchList = [...activeRecentOpps];
    const closingSoon = activeRecentOpps
        .filter((o) => o.expiresAt)
        .sort((a, b) => new Date(a.expiresAt as string).getTime() - new Date(b.expiresAt as string).getTime())
        .slice(0, 8);
    const newLast24Hours = latestList
        .filter((o) => (Date.now() - new Date(o.postedAt as string | Date).getTime()) <= (HOURS_24_IN_MS))
        .slice(0, 10);

    const totalActive = activeRecentOpps.length || 1;
    const jobsCount = activeRecentOpps.filter((o) => o.type === 'JOB').length;
    const internshipsCount = activeRecentOpps.filter((o) => o.type === 'INTERNSHIP').length;
    const walkinsCount = activeRecentOpps.filter((o) => o.type === 'WALKIN').length;

    const archivedList = recentOpps.filter((o) => o.status === 'ARCHIVED' || (!!o.expiresAt && new Date(o.expiresAt) <= new Date()));
    const appliedList = recentOpps.filter((o) =>
        (o.actions || []).some((action) =>
            action.actionType === 'APPLIED'
            || action.actionType === 'PLANNED'
            || action.actionType === 'INTERVIEWED'
            || action.actionType === 'SELECTED'
            || action.actionType === 'PLANNING'
            || action.actionType === 'ATTENDED'
        )
    );
    const featuredList = [
        ...closingSoon.slice(0, 4),
        ...newLast24Hours.filter((candidate) => !closingSoon.some((soon) => soon.id === candidate.id)).slice(0, 4),
    ].slice(0, 8);

    const mobileSections = [
        { key: 'featured', title: 'Featured', href: '/opportunities', items: featuredList },
        { key: 'latest', title: 'Latest', href: '/opportunities', items: latestList.slice(0, 8) },
        { key: 'expiring', title: 'Expiring Soon', href: '/opportunities?closingSoon=true', items: closingSoon.slice(0, 8) },
        { key: 'all', title: 'All Jobs', href: '/opportunities', items: bestMatchList.slice(0, 8) },
        { key: 'applied', title: 'Applied', href: '/account/saved', items: appliedList.slice(0, 8) },
        { key: 'archived', title: 'Archived', href: '/opportunities', items: archivedList.slice(0, 8) },
    ] as const;
    const activeSection = mobileSections.find((section) => section.key === activeTab) || mobileSections[0];

    return (
        <AuthGate>
            <ProfileGate>
                <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-8 pb-12 md:pb-20 px-3 md:px-6">
                    {/* Compact Header */}
                    <div className="flex flex-col gap-1.5 md:gap-3 border-b border-border/60 pb-2.5 md:pb-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
                            <div className="space-y-1">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                                    Welcome back, {user?.fullName?.split(' ')[0] || 'candidate'}.
                                </h1>
                                <p className="text-[11px] md:text-xs text-muted-foreground">Move fast on verified listings.</p>
                            </div>
                            <div className="hidden md:flex flex-wrap gap-2">
                                <Button asChild className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest">
                                    <Link href="/opportunities">
                                        <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                                        Open feed
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest">
                                    <Link href="/profile/edit">
                                        <UserIcon className="w-4 h-4 mr-2" />
                                        Update profile
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Highlights (Urgent/New) */}
                    {!isLoadingHighlights && highlights && (
                        (() => {
                            const isNotExpired = (o: Opportunity) => !o.expiresAt || new Date(o.expiresAt) > new Date();
                            const activeWalkins = highlights.urgent.walkins.filter(isNotExpired);
                            const activeNew = highlights.newlyAdded.filter(isNotExpired);

                            if (activeWalkins.length === 0 && activeNew.length === 0) return null;

                            return (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600/80">Fresh & Urgent</h2>
                                        </div>
                                        <Link href="/opportunities" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                                            View feed
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {activeWalkins.map(opp => (
                                            <div
                                                key={`urgent-${opp.id}`}
                                                onClick={() => router.push(`/opportunities/${opp.slug || opp.id}`)}
                                                className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 cursor-pointer hover:bg-amber-500/10 transition-all flex flex-col justify-between gap-2 group"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">Urgent Walk-in</span>
                                                        <div className="flex items-center gap-1 text-[9px] text-amber-600 font-bold tracking-tight">
                                                            <ClockIcon className="w-3 h-3" />
                                                            Closing Soon
                                                        </div>
                                                    </div>
                                                    <h3 className="font-bold text-sm tracking-tight line-clamp-1 group-hover:text-amber-600 transition-colors">{opp.title}</h3>
                                                    <p className="text-[11px] font-medium text-muted-foreground line-clamp-1">{opp.company} &bull; {opp.locations[0]}</p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-amber-500/10 pt-2">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-orange-600/60 dark:text-amber-300/60">Verified Drive</span>
                                                    <ChevronRightIcon className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        ))}
                                        {activeNew.slice(0, activeWalkins.length > 0 ? 2 : 3).map(opp => (
                                            <div
                                                key={`new-${opp.id}`}
                                                onClick={() => router.push(`/opportunities/${opp.slug || opp.id}`)}
                                                className="bg-primary/5 border border-primary/20 rounded-2xl p-4 cursor-pointer hover:bg-primary/10 transition-all flex flex-col justify-between gap-2 group"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">New Listing</span>
                                                        <span className="text-[10px] text-primary font-bold">Just Added</span>
                                                    </div>
                                                    <h3 className="font-bold text-sm tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{opp.title}</h3>
                                                    <p className="text-[11px] font-medium text-muted-foreground line-clamp-1">{opp.company} &bull; {opp.locations[0]}</p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-primary/10 pt-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-primary/60">Active Hiring</span>
                                                    <ChevronRightIcon className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()
                    )}

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                        {/* Feed Column */}
                        <div className="lg:col-span-8 space-y-3 md:space-y-6">
                            {(recentError || highlightsError) && (
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="text-xs text-orange-600 dark:text-amber-300">Data sync issues. Browse existing listings.</div>
                                    <Button variant="outline" onClick={retryAll} className="h-8 px-3 text-[10px] borer-amber-500/40 text-orange-600">Retry</Button>
                                </div>
                            )}

                            {/* Mobile View */}
                            <div className="md:hidden space-y-3">
                                <div className="border-b border-border/60">
                                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                                        {mobileSections.map((s) => (
                                            <button
                                                key={s.key}
                                                onClick={() => setActiveTab(s.key)}
                                                className={`relative whitespace-nowrap px-3 py-2 text-[11px] font-semibold transition-colors ${activeTab === s.key ? 'text-foreground' : 'text-muted-foreground'}`}
                                            >
                                                {s.title}
                                                {activeTab === s.key && <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 w-7 rounded-full bg-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {isLoadingOpps ? (
                                    <div className="space-y-4">
                                        <SkeletonJobCard />
                                        <SkeletonJobCard />
                                    </div>
                                ) : activeSection.items.length === 0 ? (
                                    <div className="p-10 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">No listings here yet.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {activeSection.items.map((opp: Opportunity) => (
                                            <JobCard
                                                key={`mob-${opp.id}`}
                                                job={opp}
                                                jobId={opp.id}
                                                isApplied={false}
                                                isSaved={opp.isSaved}
                                                onToggleSave={() => toggleSave(opp.id)}
                                                onClick={() => router.push(`/opportunities/${opp.slug || opp.id}`)}
                                                isAdmin={user?.role === 'ADMIN'}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Desktop Feed */}
                            <div className="hidden md:block space-y-6">
                                <div className="border-b border-border/60">
                                    <div className="flex items-center gap-6">
                                        {mobileSections.map((s) => (
                                            <button
                                                key={`desktop-tab-${s.key}`}
                                                onClick={() => setActiveTab(s.key)}
                                                className={`relative pb-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === s.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                {s.title}
                                                {activeTab === s.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary animate-in fade-in zoom-in duration-300" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {isLoadingOpps ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map(i => <SkeletonJobCard key={i} />)}
                                    </div>
                                ) : activeSection.items.length === 0 ? (
                                    <div className="p-12 text-center border border-dashed border-border rounded-xl">
                                        <p className="text-sm font-medium text-muted-foreground">No results found in this section.</p>
                                        <Button asChild variant="outline" className="mt-4 h-8 text-[10px] font-bold uppercase tracking-widest">
                                            <Link href="/opportunities">Browse all feed</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {activeSection.items.map((opp: Opportunity) => (
                                            <JobCard
                                                key={`desk-${opp.id}`}
                                                job={opp}
                                                jobId={opp.id}
                                                isApplied={false}
                                                isSaved={opp.isSaved}
                                                onToggleSave={() => toggleSave(opp.id)}
                                                onClick={() => router.push(`/opportunities/${opp.slug || opp.id}`)}
                                                isAdmin={user?.role === 'ADMIN'}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider">Intelligence</h2>
                            <div className="space-y-4">
                                <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-2">
                                    <h3 className="text-[10px] font-bold text-primary uppercase">Snapshot</h3>
                                    <p className="text-xs text-muted-foreground">Listings prioritized for your profile.</p>
                                </div>
                                <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
                                    <h3 className="text-[10px] font-bold text-success uppercase">Deadline radar</h3>
                                    <div className="space-y-2">
                                        {closingSoon.slice(0, 3).map(opp => (
                                            <button key={`side-${opp.id}`} onClick={() => router.push(`/opportunities/${opp.slug || opp.id}`)} className="w-full text-left p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                                                <p className="text-[11px] font-semibold truncate">{opp.title}</p>
                                                <p className="text-[10px] text-orange-600">{getDaysToExpiry(opp.expiresAt)}d remaining</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase">Activity pulse</h3>
                                    {[
                                        { label: 'Jobs', count: jobsCount },
                                        { label: 'Internships', count: internshipsCount },
                                        { label: 'Walk-ins', count: walkinsCount },
                                    ].map(item => (
                                        <div key={item.label} className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                                <span>{item.label}</span>
                                                <span>{item.count}</span>
                                            </div>
                                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary/60" style={{ width: `${Math.min(100, (item.count / totalActive) * 100)}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 flex items-center justify-center">
                                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-2 py-0.5 rounded-full border border-border/30">
                                        {isOnline ? 'Network Stable' : 'Offline Mode'} &bull; Last Sync {formatSyncTime(feedLastSyncAt)}
                                    </span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}
