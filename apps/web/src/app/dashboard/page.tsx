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
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { SkeletonJobCard } from '@/components/ui/Skeleton';

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
            setRecentOpps(data.opportunities.slice(0, 3));
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

    const handleLogout = async () => {
        const loadingToast = toast.loading('🔒 Securely logging out...');
        try {
            await logout();
            toast.success('👋 Session ended. See you soon!', { id: loadingToast });
            router.push('/login');
        } catch (err) {
            toast.error('Logout failed', { id: loadingToast });
        }
    };

    return (
        <AuthGate>
            <ProfileGate>
                <div className="space-y-8">
                    {/* Welcome Hero - Compact */}
                    <div className="relative overflow-hidden bg-primary rounded-3xl p-6 md:p-8 text-primary-foreground shadow-xl">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-background/10 rounded-full backdrop-blur-md text-[10px] font-black tracking-widest uppercase border border-white/5">
                                    <ChartBarIcon className="w-3 h-3 text-emerald-400" />
                                    Active Pulse
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-inherit">
                                    Welcome home, {user?.fullName?.split(' ')[0]}.
                                </h2>
                                <p className="opacity-70 text-sm font-medium">
                                    Your career hub for matches and readiness.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/opportunities" className="premium-button bg-background !text-foreground hover:opacity-90 shadow-none border border-border/10">
                                    Explore Matches
                                </Link>
                                <Link href="/profile/edit" className="premium-button-outline border-white/20 text-white bg-transparent hover:bg-white/5 shadow-none">
                                    Edit Profile
                                </Link>
                            </div>
                        </div>
                        {/* Subtle Abstract Decor */}
                        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                    </div>

                    {/* Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Profile Strength - Enhanced */}
                        <div className="job-card col-span-1 md:col-span-2 lg:col-span-1 relative overflow-hidden group border-primary/20 shadow-xl">
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Strength</div>
                                </div>
                                <div>
                                    <div className="relative w-20 h-20 mx-auto mb-4">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-muted/10" />
                                            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={213.6} strokeDashoffset={213.6 - (213.6 * (profile?.completionPercentage || 0)) / 100} className="text-primary transition-all duration-1000" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-foreground">
                                            {profile?.completionPercentage}%
                                        </div>
                                    </div>
                                    <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">Profile Engineering</p>
                                </div>
                            </div>
                        </div>

                        {[
                            { label: 'Applied', value: actionsSummary?.APPLIED || 0, icon: DocumentTextIcon, color: 'text-primary', bg: 'bg-primary/10' },
                            { label: 'Planning', value: actionsSummary?.PLANNING || 0, icon: Squares2X2Icon, color: 'text-accent', bg: 'bg-accent/10' },
                            { label: 'Attended', value: actionsSummary?.ATTENDED || 0, icon: CalendarDaysIcon, color: 'text-primary', bg: 'bg-primary/10' }
                        ].map((stat, i) => (
                            <div key={i} className="job-card">
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest pt-1">Live Sync</div>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-foreground mb-1">{isLoading ? '...' : stat.value}</h4>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recommendations Snippet */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="tracking-tighter">Matches for You</h2>
                            <Link href="/opportunities" className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                                View Full Stream <ArrowRightIcon className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoadingOpps ? (
                                [1, 2, 3].map(i => <SkeletonJobCard key={i} />)
                            ) : recentOpps.length === 0 ? (
                                <div className="col-span-full job-card text-center text-muted-foreground font-bold p-12">
                                    No matches found yet. Keep your profile updated for the best results.
                                </div>
                            ) : (
                                recentOpps.map((opp) => (
                                    <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                                        <div className="job-card h-full">
                                            <div>
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">{opp.company}</span>
                                                <h3 className="leading-tight group-hover:text-primary transition-colors">{opp.title}</h3>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                                                    <MapPinIcon className="w-4 h-4" />
                                                    {opp.locations[0]}
                                                </div>
                                                <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px] font-black uppercase tracking-widest">{opp.type}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                        <div className="bg-card border border-border rounded-[3rem] overflow-hidden group hover:shadow-2xl transition-all h-[320px] flex flex-col">
                            <div className="p-10 flex-1 space-y-4">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                    <BriefcaseIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground tracking-tighter">One Stream Vault</h3>
                                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                                    Hand-picked career paths verified by our engine and aligned with your profile skills.
                                </p>
                            </div>
                            <Link href="/opportunities" className="bg-secondary/50 p-6 flex items-center justify-between group-hover:bg-secondary transition-colors">
                                <span className="font-bold text-foreground">Access Vault</span>
                                <ArrowRightIcon className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="bg-card border border-border rounded-[3rem] overflow-hidden group hover:shadow-2xl transition-all h-[320px] flex flex-col">
                            <div className="p-10 flex-1 space-y-4">
                                <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                                    <AdjustmentsHorizontalIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground tracking-tighter">Profile Engineering</h3>
                                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                                    Retune your preferences, location targets, and skill catalog to improve match accuracy.
                                </p>
                            </div>
                            <Link href="/profile/edit" className="bg-secondary/50 p-6 flex items-center justify-between group-hover:bg-secondary transition-colors">
                                <span className="font-bold text-foreground">Optimization Hub</span>
                                <ArrowRightIcon className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}
