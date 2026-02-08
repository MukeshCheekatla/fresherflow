'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { actionsApi, opportunitiesApi, dashboardApi, savedApi } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Opportunity, UserStatsResponse } from '@fresherflow/types';
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
    const { user, profile, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [recentOpps, setRecentOpps] = useState<Opportunity[]>([]);
    const [isLoadingOpps, setIsLoadingOpps] = useState(true);
    const [actionsSummary, setActionsSummary] = useState<UserStatsResponse | null>(null);
    const [highlights, setHighlights] = useState<{ urgent: { walkins: Opportunity[]; others: Opportunity[] }; newlyAdded: Opportunity[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [recentError, setRecentError] = useState<string | null>(null);
    const [highlightsError, setHighlightsError] = useState<string | null>(null);
    const [activityError, setActivityError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [feedLastSyncAt, setFeedLastSyncAt] = useState<number | null>(null);

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
            const sanitized = (data.opportunities || []).slice(0, 3).map((o: Opportunity) => ({
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
            const data = await actionsApi.summary();
            setActionsSummary(data.summary || null);
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(`Couldn't load activity: ${error.message}`);
            setActivityError(error.message || 'Unable to load activity');
        } finally {
            setIsLoading(false);
            setFeedLastSyncAt(getFeedLastSyncAt());
        }
    };

    const retryAll = () => {
        setIsLoading(true);
        setIsLoadingOpps(true);
        setIsLoadingHighlights(true);
        loadDashboardData();
        loadRecentOpportunities();
        loadHighlights();
    };

    return (
        <AuthGate>
            <ProfileGate>
                <div className="w-full max-w-7xl mx-auto space-y-5 md:space-y-8 pb-12 md:pb-20 px-4 md:px-6">
                    {/* Compact Header */}
                    <div className="flex flex-col gap-3 border-b border-border/60 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="space-y-1">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                                    Welcome back, {user?.fullName?.split(' ')[0] || 'candidate'}.
                                </h1>
                                <p className="text-xs text-muted-foreground">Move fast on verified listings.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
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
                        <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                            <span className="px-2 py-1 rounded-full border border-border bg-muted/50">
                                {isOnline ? 'Online' : 'Offline'} {'•'} Sync {formatSyncTime(feedLastSyncAt)}
                            </span>
                            <span className="px-2 py-1 rounded-full border border-border bg-muted/50">
                                Readiness {profile?.completionPercentage ?? 0}%
                            </span>
                            <span className="px-2 py-1 rounded-full border border-border bg-muted/50">
                                Applied {isLoading ? '-' : actionsSummary?.appliedCount || 0}
                            </span>
                            <span className="px-2 py-1 rounded-full border border-border bg-muted/50">
                                Planned {isLoading ? '-' : actionsSummary?.planningCount || 0}
                            </span>
                            <span className="px-2 py-1 rounded-full border border-border bg-muted/50">
                                Interviews {isLoading ? '-' : actionsSummary?.attendedCount || 0}
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
                            <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm md:text-base font-bold tracking-tight text-foreground/90">Active Stream</h2>
                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-[4px] text-[8px] font-bold uppercase tracking-widest border border-primary/20">Live</span>
                                </div>
                                <Link href="/opportunities" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">View All</Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isLoadingOpps ? (
                                    [1, 2].map(i => <SkeletonJobCard key={i} />)
                                ) : recentError ? (
                                    <div className="col-span-full bg-card rounded-xl text-center p-8 md:p-10 border border-dashed border-border">
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
                                    <div className="col-span-full bg-card rounded-xl text-center p-8 md:p-12 border border-dashed border-border">
                                        <h3 className="font-semibold text-foreground text-sm">No recommended jobs yet</h3>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Update your profile parameters to see matching jobs.</p>
                                        <Button asChild className="mt-6 h-9 px-4 text-xs font-medium">
                                            <Link href="/profile/edit">Setup Profile</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    recentOpps.map((opp) => (
                                        <div key={opp.id}>
                                            <JobCard
                                                job={{
                                                    company: opp.company,
                                                    normalizedRole: opp.title,
                                                    locations: opp.locations,
                                                    experienceRange: { min: 0, max: 0 },
                                                    salary: (opp.salaryMin && opp.salaryMax) ? { min: opp.salaryMin, max: opp.salaryMax } : undefined,
                                                    employmentType: opp.type,
                                                    workType: opp.workMode,
                                                    postedDate: opp.postedAt,
                                                    description: opp.description,
                                                    skills: opp.requiredSkills
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                } as any}
                                                jobId={opp.id}
                                                isApplied={false}
                                                isSaved={opp.isSaved}
                                                onToggleSave={() => toggleSave(opp.id)}
                                                onClick={() => router.push(`/opportunities/${opp.slug || opp.id}`)}
                                                isAdmin={user?.role === 'ADMIN'}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
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
                                                    setIsLoading(true);
                                                    loadDashboardData();
                                                }}
                                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                Retry activity
                                            </Button>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground leading-snug">
                                            {actionsSummary?.appliedCount || 0} applications tracked. Keep your profile sharp to unlock better matches.
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Button asChild className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest">
                                            <Link href="/opportunities">Open feed</Link>
                                        </Button>
                                        <Button asChild variant="outline" className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest">
                                            <Link href="/account/saved">Saved</Link>
                                        </Button>
                                    </div>
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
                            </div>
                        </div>
                    </div>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}

