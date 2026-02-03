'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { actionsApi, opportunitiesApi } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    BriefcaseIcon,
    MapPinIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    DocumentTextIcon,
    CalendarDaysIcon,
    Squares2X2Icon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    ArrowRightIcon,
    ChartBarIcon,
    ClockIcon,
    IdentificationIcon,
    InformationCircleIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { SkeletonJobCard } from '@/components/ui/Skeleton';
import JobCard from '@/features/jobs/components/JobCard';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
    const { user, profile, logout } = useAuth();
    const router = useRouter();
    const [recentOpps, setRecentOpps] = useState<any[]>([]);
    const [isLoadingOpps, setIsLoadingOpps] = useState(true);
    const [actionsSummary, setActionsSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        loadRecentOpportunities();
    }, []);

    const loadRecentOpportunities = async () => {
        try {
            const data = await opportunitiesApi.list();
            const sanitized = (data.opportunities || []).slice(0, 3).map((o: any) => ({
                ...o,
                locations: o.locations || [],
                requiredSkills: o.requiredSkills || []
            }));
            setRecentOpps(sanitized);
        } catch (error) {
            console.error('Failed to load recs');
        } finally {
            setIsLoadingOpps(false);
        }
    };

    const loadDashboardData = async () => {
        try {
            const summary = await actionsApi.summary();
            setActionsSummary(summary);
        } catch (error: any) {
            toast.error(`❌ Session sync failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthGate>
            <ProfileGate>
                <div className="max-w-7xl mx-auto space-y-4 md:space-y-10 pb-12 md:pb-20 px-4 pt-2 md:pt-0">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 pb-4 md:pb-6 border-b border-border">
                        <div className="space-y-0.5">
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight italic">
                                HUB // {user?.fullName?.split(' ')[0]}
                            </h1>
                            <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-70">
                                Monitoring career protocol.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <Button asChild className="!h-10 !px-5 text-xs">
                                <Link href="/opportunities">
                                    <MagnifyingGlassIcon className="w-4 h-4" />
                                    Search Jobs
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                        {/* Profile Completion */}
                        <div className="premium-card !p-4 md:!p-6 bg-muted/20 border-border">
                            <div className="flex items-center justify-between mb-2 md:mb-4">
                                <div className="p-1.5 bg-background border border-border rounded text-primary">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest hidden sm:block">Status</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h4 className="text-xl md:text-3xl font-black text-foreground">
                                        {profile?.completionPercentage}%
                                    </h4>
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Ready</p>
                                </div>
                                <div className="w-8 h-8 md:w-12 md:h-12 relative text-primary">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-muted/20" />
                                        <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="100" strokeDashoffset={100 - (profile?.completionPercentage || 0)} className="transition-all duration-1000" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {[
                            { label: 'Applied', value: actionsSummary?.APPLIED || 0, icon: DocumentTextIcon },
                            { label: 'Planned', value: actionsSummary?.PLANNING || 0, icon: ClockIcon },
                            { label: 'Interview', value: actionsSummary?.ATTENDED || 0, icon: BriefcaseIcon }
                        ].map((stat, i) => (
                            <div key={i} className="premium-card !p-4 md:!p-6 border-border">
                                <div className="flex items-center justify-between mb-2 md:mb-4">
                                    <div className={`p-1.5 rounded bg-background border border-border text-foreground`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <h4 className="text-xl md:text-3xl font-black text-foreground">{isLoading ? '..' : stat.value}</h4>
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

                        {/* Recent Opportunities */}
                        <div className="lg:col-span-2 space-y-4 md:space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm md:text-xl font-black tracking-tight italic uppercase">Active Feed</h2>
                                    <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs font-black uppercase tracking-widest border border-border">Live</span>
                                </div>
                                <Link href="/opportunities" className="text-xs font-black text-primary uppercase hover:underline tracking-widest">More →</Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {isLoadingOpps ? (
                                    [1, 2].map(i => <SkeletonJobCard key={i} />)
                                ) : recentOpps.length === 0 ? (
                                    <div className="col-span-full premium-card text-center p-8 md:p-12 border-dashed border-2">
                                        <h3 className="font-black text-foreground uppercase italic text-sm">No feed data available</h3>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto font-medium">Update parameters to initialize matches.</p>
                                        <Button asChild className="mt-4 inline-flex uppercase text-xs tracking-widest !px-4 !h-8">
                                            <Link href="/profile/edit">Initialize</Link>
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
                                            } as any}
                                            jobId={opp.id}
                                            isApplied={(opp as any).actions?.some((a: any) => a.actionType === 'APPLIED')}
                                            onClick={() => router.push(`/opportunities/${opp.id}`)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Intelligence / Action Center */}
                        <div className="space-y-4 md:space-y-6">
                            <h2 className="text-sm md:text-xl font-black tracking-tight italic uppercase">Intelligence Feed</h2>
                            <div className="space-y-3 md:space-y-4">
                                <div className="p-3.5 md:p-5 rounded-xl md:rounded-2xl border border-border bg-card space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded bg-muted border border-border">
                                            <ChartBarIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <h4 className="text-xs font-black text-foreground italic uppercase tracking-tight">Application Activity</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium italic opacity-80">
                                        You have tracked {actionsSummary?.APPLIED || 0} applications so far. Keep monitoring the feed for new verified listings matching your profile.
                                    </p>
                                </div>

                                <div className="p-4 md:p-6 rounded-xl md:rounded-2xl border border-border bg-card space-y-3 md:space-y-4 shadow-sm group hover:border-primary/30 transition-all">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded bg-success/10 border border-success/20 text-success">
                                            <CheckBadgeIcon className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-black text-sm md:text-base tracking-tight leading-none italic uppercase">Profile Verification</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium italic opacity-80 uppercase tracking-widest">
                                        Keep your career metadata updated for maximum match accuracy.
                                    </p>
                                    <Button asChild className="w-full !h-10 text-xs uppercase font-black tracking-widest">
                                        <Link href="/profile/edit">Update Profile</Link>
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

