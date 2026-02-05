'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { actionsApi, opportunitiesApi, dashboardApi, savedApi } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Opportunity, UserStatsResponse } from '@fresherflow/types';
import toast from 'react-hot-toast';
import {
    BriefcaseIcon,
    UserIcon,
    DocumentTextIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    ClockIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { SkeletonJobCard } from '@/components/ui/Skeleton';
import JobCard from '@/features/jobs/components/JobCard';
import { Button } from '@/components/ui/Button';

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

    useEffect(() => {
        // Only load once when auth is confirmed and user exists
        if (!authLoading && user && !hasLoaded) {
            setHasLoaded(true);
            loadDashboardData();
            loadRecentOpportunities();
            loadHighlights();
        }
    }, [authLoading, user, hasLoaded]);

    const loadHighlights = async () => {
        try {
            const data = await dashboardApi.getHighlights();
            setHighlights(data);
        } catch {
            console.error('Failed to load highlights');
        } finally {
            setIsLoadingHighlights(false);
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
        try {
            const data = await opportunitiesApi.list();
            const sanitized = (data.opportunities || []).slice(0, 3).map((o: Opportunity) => ({
                ...o,
                locations: o.locations || [],
                requiredSkills: o.requiredSkills || []
            }));
            setRecentOpps(sanitized);
        } catch {
            console.error('Failed to load recs');
        } finally {
            setIsLoadingOpps(false);
        }
    };

    const loadDashboardData = async () => {
        try {
            const data = await actionsApi.summary();
            setActionsSummary(data.summary || null);
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(`❌ Session sync failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthGate>
            <ProfileGate>
                <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12 md:pb-20 px-4 md:px-6">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 py-4 border-b border-border/50">
                        <div className="space-y-0.5 text-left">
                            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground italic uppercase">
                                Dashboard &bull; {user?.fullName?.split(' ')[0]}
                            </h1>
                            <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                Platform overview and application activity.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <Button asChild variant="outline" className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider">
                                <Link href="/opportunities">
                                    <MagnifyingGlassIcon className="w-3.5 h-3.5 mr-2" />
                                    Search Jobs
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Highlights Loading State */}
                    {isLoadingHighlights ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="h-32 bg-muted/20 rounded-xl animate-pulse" />
                            <div className="h-32 bg-muted/20 rounded-xl animate-pulse" />
                            <div className="h-32 bg-muted/20 rounded-xl animate-pulse" />
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
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <h2 className="text-xs font-black uppercase tracking-widest text-amber-600 italic">Today&apos;s Important Updates</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Urgent Walkins */}
                                        {activeWalkins.length > 0 && activeWalkins.map(opp => (
                                            <div
                                                key={opp.id}
                                                onClick={() => router.push(`/opportunities/${opp.slug}`)}
                                                className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 cursor-pointer hover:bg-amber-500/10 transition-all flex flex-col justify-between gap-3 group"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">Urgent Walk-in</span>
                                                        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                                                            <ClockIcon className="w-3 h-3" />
                                                            Closing Soon
                                                        </div>
                                                    </div>
                                                    <h3 className="font-black text-sm tracking-tight line-clamp-1 italic group-hover:text-amber-600 transition-colors">{opp.title}</h3>
                                                    <p className="text-[11px] font-bold text-muted-foreground">{opp.company} &bull; {opp.locations[0]}</p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-amber-500/10 pt-2">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-amber-700/60">Verified Drive</span>
                                                    <ChevronRightIcon className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        ))}

                                        {/* New Additions */}
                                        {activeNew.slice(0, activeWalkins.length > 0 ? 2 : 3).map(opp => (
                                            <div
                                                key={opp.id}
                                                onClick={() => router.push(`/opportunities/${opp.slug}`)}
                                                className="bg-primary/5 border border-primary/20 rounded-xl p-4 cursor-pointer hover:bg-primary/10 transition-all flex flex-col justify-between gap-3 group"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">New Listing</span>
                                                        <span className="text-[10px] text-primary font-bold">Just Added</span>
                                                    </div>
                                                    <h3 className="font-black text-sm tracking-tight line-clamp-1 italic group-hover:text-primary transition-colors">{opp.title}</h3>
                                                    <p className="text-[11px] font-bold text-muted-foreground">{opp.company} &bull; {opp.locations[0]}</p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-primary/10 pt-2">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-primary/60">Active Hiring</span>
                                                    <ChevronRightIcon className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()
                    )}

                    {/* Stats Overview - Compact 4-Column */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Profile Completion */}
                        <div className="bg-card/50 rounded-xl border border-border/50 p-3 flex flex-col justify-between h-20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <UserIcon className="w-8 h-8 text-primary transform rotate-12" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest z-10">Readiness</span>
                            <div className="flex items-baseline gap-1 z-10">
                                <h4 className="text-xl font-black text-primary italic leading-none">{profile?.completionPercentage}%</h4>
                                <span className="text-[9px] font-bold text-muted-foreground/60">Complete</span>
                            </div>
                        </div>

                        {[
                            { label: 'Applied', value: actionsSummary?.appliedCount || 0, icon: DocumentTextIcon },
                            { label: 'Planned', value: actionsSummary?.planningCount || 0, icon: ClockIcon },
                            { label: 'Interviews', value: actionsSummary?.attendedCount || 0, icon: BriefcaseIcon }
                        ].map((stat, i) => (
                            <div key={i} className="bg-card/50 rounded-xl border border-border/50 p-3 flex flex-col justify-between h-20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <stat.icon className="w-8 h-8 text-foreground transform rotate-12" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest z-10 text-balance">{stat.label}</span>
                                <h4 className="text-xl font-black text-foreground italic leading-none z-10">{isLoading ? '-' : stat.value}</h4>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                        {/* Recent Opportunities */}
                        <div className="lg:col-span-8 space-y-3 md:space-y-6">
                            <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm md:text-base font-black italic uppercase tracking-wider">Active Stream</h2>
                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-[4px] text-[8px] font-black uppercase tracking-widest border border-primary/20">Live</span>
                                </div>
                                <Link href="/opportunities" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All</Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isLoadingOpps ? (
                                    [1, 2].map(i => <SkeletonJobCard key={i} />)
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
                                        <div key={opp.id} className="animate-in fade-in duration-500">
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
                            <h2 className="text-sm md:text-base font-black italic uppercase tracking-wider">Pulse Feed</h2>
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl border border-border/50 bg-card/30 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <ChartBarIcon className="w-3.5 h-3.5 text-primary" />
                                        <h4 className="text-[10px] font-black uppercase tracking-wider">Snapshot</h4>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-snug font-medium">
                                        {actionsSummary?.appliedCount || 0} active tracks. Complete profiles get 3x higher visibility.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl border border-border/50 bg-card/30 space-y-3 group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-2">
                                        <CheckBadgeIcon className="w-3.5 h-3.5 text-success" />
                                        <h3 className="text-[10px] font-black uppercase tracking-wider">Profile Status</h3>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-snug font-medium">
                                        Ensure your academic records are locked for verified eligibility.
                                    </p>
                                    <Button asChild className="w-full h-8 text-[10px] font-bold uppercase tracking-widest">
                                        <Link href="/profile/edit">Update Records</Link>
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

