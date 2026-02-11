'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { actionsApi, opportunitiesApi, dashboardApi, savedApi } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Opportunity } from '@fresherflow/types';
import toast from 'react-hot-toast';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CheckBadgeIcon from '@heroicons/react/24/outline/CheckBadgeIcon';
import { SkeletonJobCard } from '@/components/ui/Skeleton';
import JobCard from '@/features/jobs/components/JobCard';
import { Button } from '@/components/ui/Button';
import { formatSyncTime, getFeedLastSyncAt } from '@/lib/offline/syncStatus';

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [recentOpps, setRecentOpps] = useState<Opportunity[]>([]);
    const [isLoadingOpps, setIsLoadingOpps] = useState(true);

    const [highlights, setHighlights] = useState<{ urgent: { walkins: Opportunity[]; others: Opportunity[] }; newlyAdded: Opportunity[] } | null>(null);
    const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [recentError, setRecentError] = useState<string | null>(null);
    const [highlightsError, setHighlightsError] = useState<string | null>(null);
    const [activityError, setActivityError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [feedLastSyncAt, setFeedLastSyncAt] = useState<number | null>(null);
    const [lastSeenAt, setLastSeenAt] = useState<number | null>(null);
    const [mobileFeedTab, setMobileFeedTab] = useState<'featured' | 'latest' | 'expiring' | 'all' | 'applied' | 'archived'>('featured');

    useEffect(() => {
        // Only load once when auth is confirmed and user exists
        if (!authLoading && user && !hasLoaded) {
            setHasLoaded(true);
            loadDashboardData();
            loadRecentOpportunities();
            loadHighlights();
        }
    }, [authLoading, user, hasLoaded]);

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
        const interval = window.setInterval(() => {
            loadRecentOpportunities();
            loadHighlights();
            loadDashboardData();
        }, 60_000);
        return () => window.clearInterval(interval);
    }, [hasLoaded, user]);

    const loadHighlights = async () => {
        setHighlightsError(null);
        try {
            const data = await dashboardApi.getHighlights();
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
            const result = await savedApi.toggle(opportunityId);
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
            const data = await opportunitiesApi.list();
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

    const loadDashboardData = async () => {
        setActivityError(null);
        try {
            await actionsApi.summary();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(`Couldn't load activity: ${error.message}`);
            setActivityError(error.message || 'Unable to load activity');
        } finally {
            setFeedLastSyncAt(getFeedLastSyncAt());
        }
    };

    const retryAll = () => {
        setIsLoadingOpps(true);
        setIsLoadingHighlights(true);
        loadDashboardData();
        loadRecentOpportunities();
        loadHighlights();
    };

    const getDaysToExpiry = (expiresAt?: string | Date | null) => {
        if (!expiresAt) return null;
        const diffMs = new Date(expiresAt).getTime() - new Date().getTime();
        return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    };

    const formatExpiry = (expiresAt?: string | Date | null) => {
        if (!expiresAt) return null;
        return new Date(expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
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
    const newCutoff = lastSeenAt || (Date.now() - (72 * 60 * 60 * 1000));
    const newSinceLastVisit = latestList
        .filter((o) => new Date(o.postedAt as string | Date).getTime() > newCutoff)
        .slice(0, 10);
    const newLast24Hours = latestList
        .filter((o) => (Date.now() - new Date(o.postedAt as string | Date).getTime()) <= (24 * 60 * 60 * 1000))
        .slice(0, 10);

    const totalActive = activeRecentOpps.length || 1;
    const jobsCount = activeRecentOpps.filter((o) => o.type === 'JOB').length;
    const internshipsCount = activeRecentOpps.filter((o) => o.type === 'INTERNSHIP').length;
    const walkinsCount = activeRecentOpps.filter((o) => o.type === 'WALKIN').length;

    const sections = [
        { key: 'best', title: 'Best matches', href: '/opportunities', items: bestMatchList.slice(0, 6) },
        { key: 'latest', title: 'Latest uploads', href: '/opportunities', items: latestList.slice(0, 6) },
        { key: 'new24h', title: 'Added in last 24h', href: '/opportunities', items: newLast24Hours.slice(0, 6) },
        { key: 'expiring', title: 'Expiring soon', href: '/opportunities?closingSoon=true', items: closingSoon.slice(0, 4) },
        { key: 'new', title: 'New since last visit', href: '/opportunities', items: newSinceLastVisit },
        { key: 'jobs', title: 'Jobs', href: '/jobs', items: bestMatchList.filter((o) => o.type === 'JOB').slice(0, 4) },
        { key: 'internships', title: 'Internships', href: '/internships', items: bestMatchList.filter((o) => o.type === 'INTERNSHIP').slice(0, 4) },
        { key: 'walkins', title: 'Walk-ins', href: '/walk-ins', items: bestMatchList.filter((o) => o.type === 'WALKIN').slice(0, 4) },
    ];
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
    const activeMobileSection = mobileSections.find((section) => section.key === mobileFeedTab) || mobileSections[0];

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
                        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                            <span className="px-2 py-1 rounded-full border border-border bg-muted/50">
                                {isOnline ? 'Online' : 'Offline'} {'•'} Sync {formatSyncTime(feedLastSyncAt)}
                            </span>
                        </div>
                    </div>

                    {/* Highlights Loading State */}
                    {isLoadingHighlights ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="h-24 bg-muted/20 rounded-xl animate-pulse" />
                            <div className="h-24 bg-muted/20 rounded-xl animate-pulse" />
                            <div className="h-24 bg-muted/20 rounded-xl animate-pulse" />
                        </div>
                    ) : highlightsError ? (
                        <div className="rounded-xl border border-dashed border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Could not load highlights</h3>
                                <p className="text-xs text-muted-foreground mt-1">{highlightsError}</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsLoadingHighlights(true);
                                    loadHighlights();
                                }}
                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
                            >
                                Retry highlights
                            </Button>
                        </div>
                    ) : highlights && (
                        /* Filter out expired items on the fly */
                        (() => {
                            const isNotExpired = (o: Opportunity) => !o.expiresAt || new Date(o.expiresAt) > new Date();
                            const activeWalkins = highlights.urgent.walkins.filter(isNotExpired);
                            const activeNew = highlights.newlyAdded.filter(isNotExpired);

                            if (activeWalkins.length === 0 && activeNew.length === 0) return null;

                            return (
                                <div className="space-y-4">
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
                                        {/* Urgent Walkins */}
                                        {activeWalkins.length > 0 && activeWalkins.map(opp => (
                                            <div
                                                key={opp.id}
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
                                                    <p className="text-[11px] font-medium text-muted-foreground">{opp.company} &bull; {opp.locations[0]}</p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-amber-500/10 pt-2">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-700/60">Verified Drive</span>
                                                    <ChevronRightIcon className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        ))}

                                        {/* New Additions */}
                                        {activeNew.slice(0, activeWalkins.length > 0 ? 2 : 3).map(opp => (
                                            <div
                                                key={opp.id}
                                                onClick={() => router.push(`/opportunities/${opp.slug || opp.id}`)}
                                                className="bg-primary/5 border border-primary/20 rounded-2xl p-4 cursor-pointer hover:bg-primary/10 transition-all flex flex-col justify-between gap-2 group"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">New Listing</span>
                                                        <span className="text-[10px] text-primary font-bold">Just Added</span>
                                                    </div>
                                                    <h3 className="font-bold text-sm tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{opp.title}</h3>
                                                    <p className="text-[11px] font-medium text-muted-foreground">{opp.company} &bull; {opp.locations[0]}</p>
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

                    {/* Main Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                        {/* Recent Opportunities */}
                        <div className="lg:col-span-8 space-y-3 md:space-y-6">
                            {(recentError || highlightsError || activityError) && (
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="text-xs text-amber-700 dark:text-amber-300">
                                        Some dashboard data is unavailable. You can still browse listings.
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={retryAll}
                                        className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest border-amber-500/40 text-amber-700 dark:text-amber-300"
                                    >
                                        Retry all
                                    </Button>
                                </div>
                            )}
                            <div className="md:hidden space-y-3">
                                <div className="border-b border-border/60">
                                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                                        {mobileSections.map((section) => {
                                            const isActive = mobileFeedTab === section.key;
                                            return (
                                                <button
                                                    key={`mobile-tab-${section.key}`}
                                                    onClick={() => setMobileFeedTab(section.key)}
                                                    className={`relative whitespace-nowrap px-3 py-2 text-[11px] font-semibold tracking-tight transition-colors ${isActive
                                                        ? 'text-foreground'
                                                        : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    {section.title}
                                                    {isActive && (
                                                        <>
                                                            <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 w-7 rounded-full bg-primary" />
                                                        </>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                                    <h2 className="text-sm font-bold tracking-tight text-foreground/90">{activeMobileSection.title}</h2>
                                    <Link href={activeMobileSection.href} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">View all</Link>
                                </div>
                                {isLoadingOpps ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {[1, 2].map(i => <SkeletonJobCard key={`mobile-loading-${i}`} />)}
                                    </div>
                                ) : activeMobileSection.items.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-border bg-card p-4 text-xs text-muted-foreground space-y-3">
                                        <p>
                                            {activeMobileSection.key === 'applied'
                                                ? 'No applied listings yet.'
                                                : activeMobileSection.key === 'archived'
                                                    ? 'No archived listings yet.'
                                                    : 'No listings in this section yet.'}
                                        </p>
                                        {recentOpps.length === 0 && (activeMobileSection.key === 'featured' || activeMobileSection.key === 'all') && (
                                            <Button asChild className="h-9 px-4 text-xs font-medium">
                                                <Link href="/profile/edit">Setup Profile</Link>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {activeMobileSection.items.map((opp) => (
                                            <JobCard
                                                key={`mobile-${activeMobileSection.key}-${opp.id}`}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                job={opp as any}
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
                            {isLoadingOpps ? (
                                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => <SkeletonJobCard key={i} />)}
                                </div>
                            ) : recentError ? (
                                <div className="hidden md:block col-span-full bg-card rounded-xl text-center p-8 md:p-10 border border-dashed border-border">
                                    <h3 className="font-semibold text-foreground text-sm">Could not load recommendations</h3>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{recentError}</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsLoadingOpps(true);
                                            loadRecentOpportunities();
                                        }}
                                        className="mt-5 h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : recentOpps.length === 0 ? (
                                <div className="hidden md:block col-span-full bg-card rounded-xl text-center p-8 md:p-12 border border-dashed border-border">
                                    <h3 className="font-semibold text-foreground text-sm">No recommended jobs yet</h3>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Update your profile parameters to see matching jobs.</p>
                                    <Button asChild className="mt-6 h-9 px-4 text-xs font-medium">
                                        <Link href="/profile/edit">Setup Profile</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="hidden md:block space-y-7">
                                    {sections.map((section) => (
                                        <div key={section.key} className="space-y-3">
                                            <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                                                <h2 className="text-sm md:text-base font-bold tracking-tight text-foreground/90">{section.title}</h2>
                                                <Link href={section.href} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">View all</Link>
                                            </div>
                                            {section.items.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-border bg-card p-4 text-xs text-muted-foreground">
                                                    No active listings in this section.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {section.items.map((opp) => (
                                                        <JobCard
                                                            key={`${section.key}-${opp.id}`}
                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                            job={opp as any}
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
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Intelligence Feed */}
                        <div className="lg:col-span-4 space-y-4 md:space-y-6">
                            <h2 className="text-sm md:text-base font-bold tracking-tight text-foreground/90">Next steps</h2>
                            <div className="space-y-3">
                                <div className="p-5 rounded-2xl border border-border bg-card/70 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <ChartBarIcon className="w-4 h-4 text-primary" />
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Snapshot</h4>
                                    </div>
                                    {activityError ? (
                                        <>
                                            <p className="text-sm text-muted-foreground leading-snug">{activityError}</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    loadDashboardData();
                                                }}
                                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                Retry activity
                                            </Button>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground leading-snug">
                                            New uploads and close-deadline listings are prioritized to reduce missed opportunities.
                                        </p>
                                    )}
                                </div>

                                <div className="p-5 rounded-2xl border border-border bg-card/70 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckBadgeIcon className="w-4 h-4 text-success" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-wider">Profile status</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-snug">
                                        Complete your profile to unlock every opportunity and faster shortlists.
                                    </p>
                                    <Button asChild className="w-full h-9 text-[10px] font-bold uppercase tracking-widest">
                                        <Link href="/profile/edit">Improve profile</Link>
                                    </Button>
                                </div>

                                <div className="p-5 rounded-2xl border border-border bg-card/70 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ClockIcon className="w-4 h-4 text-amber-500" />
                                            <h3 className="text-[10px] font-bold uppercase tracking-wider">Deadline radar</h3>
                                        </div>
                                        <Link href="/opportunities?closingSoon=true" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                                            View all
                                        </Link>
                                    </div>
                                    {closingSoon.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No urgent deadlines right now.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {closingSoon.slice(0, 5).map((opp) => {
                                                const days = getDaysToExpiry(opp.expiresAt);
                                                return (
                                                    <button
                                                        key={opp.id}
                                                        onClick={() => router.push(`/opportunities/${opp.slug || opp.id}`)}
                                                        className="w-full text-left rounded-lg border border-border bg-muted/20 hover:bg-muted/40 p-2.5 transition-colors"
                                                    >
                                                        <p className="text-xs font-semibold text-foreground line-clamp-1">{opp.title}</p>
                                                        <p className="text-[10px] text-muted-foreground line-clamp-1">{opp.company}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mt-1">
                                                            {days != null && days >= 0 ? `Expires in ${days}d` : 'Closing'} • {formatExpiry(opp.expiresAt)}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 rounded-2xl border border-border bg-card/70 space-y-3">
                                    <h3 className="text-[10px] font-bold uppercase tracking-wider">Category pulse</h3>
                                    {[
                                        { label: 'Jobs', count: jobsCount, href: '/jobs' },
                                        { label: 'Internships', count: internshipsCount, href: '/internships' },
                                        { label: 'Walk-ins', count: walkinsCount, href: '/walk-ins' },
                                    ].map((item) => {
                                        const pct = Math.max(8, Math.round((item.count / totalActive) * 100));
                                        return (
                                            <Link key={item.label} href={item.href} className="block space-y-1.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-foreground">{item.label}</span>
                                                    <span className="text-muted-foreground">{item.count}</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}





