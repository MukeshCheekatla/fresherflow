'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { actionsApi, opportunitiesApi } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Opportunity, UserStatsResponse } from '@fresherflow/types';
import toast from 'react-hot-toast';
import {
    BriefcaseIcon,
    UserIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    ClockIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { SkeletonJobCard } from '@/components/ui/Skeleton';
import JobCard from '@/features/jobs/components/JobCard';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [recentOpps, setRecentOpps] = useState<Opportunity[]>([]);
    const [isLoadingOpps, setIsLoadingOpps] = useState(true);
    const [actionsSummary, setActionsSummary] = useState<UserStatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        loadRecentOpportunities();
    }, []);

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
                <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12 md:pb-20 px-2 md:px-4 pt-4 md:pt-0">

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

                    {/* Stats Overview - 2x2 Grid on Mobile like Admin */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                        {/* Profile Completion */}
                        <div className="bg-card/50 rounded-xl border border-border/50 p-3 md:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-[9px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Readiness</div>
                                <UserIcon className="w-3 h-3 md:w-4 h-4 text-primary" />
                            </div>
                            <div className="flex items-end justify-between gap-2">
                                <h4 className="text-lg md:text-2xl font-black text-foreground italic">
                                    {profile?.completionPercentage}%
                                </h4>
                                <div className="w-7 h-7 md:w-10 md:h-10 relative text-primary shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-muted/10" />
                                        <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray="100" strokeDashoffset={100 - (profile?.completionPercentage || 0)} className="transition-all duration-1000" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {[
                            { label: 'Applied Jobs', value: actionsSummary?.appliedCount || 0, icon: DocumentTextIcon },
                            { label: 'Planned Tasks', value: actionsSummary?.planningCount || 0, icon: ClockIcon },
                            { label: 'Interviews', value: actionsSummary?.attendedCount || 0, icon: BriefcaseIcon }
                        ].map((stat, i) => (
                            <div key={i} className="bg-card/50 rounded-xl border border-border/50 p-3 md:p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Activity</span>
                                    <stat.icon className="w-3 h-3 md:w-4 h-4 text-muted-foreground/60" />
                                </div>
                                <h4 className="text-lg md:text-2xl font-black text-foreground italic leading-none">{isLoading ? '..' : stat.value}</h4>
                                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-1">{stat.label}</p>
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
                                        <JobCard
                                            key={opp.id}
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
                                            onClick={() => router.push(`/opportunities/${opp.id}`)}
                                        />
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

