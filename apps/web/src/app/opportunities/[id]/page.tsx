'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { opportunitiesApi, actionsApi } from '@/lib/api/client';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { Opportunity } from '@fresherflow/types';
import toast from 'react-hot-toast';
import {
    MapPinIcon,
    BriefcaseIcon,
    ClockIcon,
    CalendarDaysIcon,
    BuildingOfficeIcon,
    ArrowLeftIcon,
    ArrowTopRightOnSquareIcon,
    InformationCircleIcon,
    SparklesIcon,
    GlobeAltIcon,
    CurrencyRupeeIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';

export default function OpportunityDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [opp, setOpp] = useState<Opportunity | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) loadOpportunity();
    }, [id]);

    const loadOpportunity = async () => {
        setIsLoading(true);
        try {
            const data = await opportunitiesApi.getById(id as string);
            // Sanitize data
            const sanitized = {
                ...data,
                locations: data.locations || [],
                requiredSkills: data.requiredSkills || [],
                allowedDegrees: data.allowedDegrees || [],
                allowedPassoutYears: data.allowedPassoutYears || []
            };
            setOpp(sanitized);
        } catch (error: any) {
            toast.error('Listing protocol failed. Resource not found.');
            router.push('/opportunities');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        if (!opp || !opp.applyLink) {
            toast.error('❌ Apply link unavailable for this listing.');
            return;
        }
        try {
            await actionsApi.track(opp.id, 'APPLIED');
            window.open(opp.applyLink, '_blank');
        } catch (error) {
            window.open(opp.applyLink, '_blank');
        }
    };

    if (isLoading) return <LoadingScreen message="Synchronizing Opportunity Data" />;

    if (!opp) return null;

    return (
        <AuthGate>
            <ProfileGate>
                <div className="min-h-screen bg-background pb-24 md:pb-24">
                    <main className="max-w-6xl mx-auto px-4 py-4 md:py-12 space-y-6 md:space-y-10">

                        {/* Hero Header */}
                        <div className="premium-card !p-5 md:!p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

                            <div className="relative z-10 space-y-4 md:space-y-6">
                                <Link href="/opportunities" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-black text-xs uppercase tracking-widest group/back">
                                    <ArrowLeftIcon className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
                                    Return to Feed
                                </Link>

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-10">
                                    <div className="space-y-4 md:space-y-5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">{opp.type}</span>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-muted/50 rounded-full text-xs font-black text-muted-foreground uppercase tracking-widest">
                                                <GlobeAltIcon className="w-3.5 h-3.5" />
                                                {opp.workMode || 'ONSITE'}
                                            </div>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded-full text-xs font-black uppercase tracking-widest">
                                                <CheckBadgeIcon className="w-3.5 h-3.5" />
                                                Verified Feed
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight italic">
                                                {opp.title}
                                            </h1>
                                            <div className="flex items-center gap-3 pt-1">
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-card border border-border rounded-xl flex items-center justify-center shadow-sm">
                                                    <BuildingOfficeIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-base md:text-lg font-black text-foreground tracking-tight leading-none mb-0.5">{opp.company}</p>
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <MapPinIcon className="w-3.5 h-3.5" />
                                                        <p className="font-bold text-xs tracking-tight">{(opp.locations || []).join(' • ')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:block">
                                        <div className="premium-card bg-primary text-primary-foreground !p-6 text-center space-y-4 min-w-[240px]">
                                            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Application Protocol</p>
                                            <Button
                                                variant="secondary"
                                                onClick={handleApply}
                                                className="w-full h-11 bg-background text-foreground hover:bg-background/90"
                                            >
                                                Apply Now
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                            </Button>
                                            <p className="text-[10px] font-bold opacity-60">Redirects to official portal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                            {/* Main Content (2/3) */}
                            <div className="lg:col-span-2 space-y-10">
                                {/* Description */}
                                <section className="premium-card !p-6 md:!p-8 space-y-4 md:space-y-6">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                                        <div className="p-1.5 bg-muted rounded-lg text-primary"><BriefcaseIcon className="w-5 h-5" /></div>
                                        <h2 className="text-sm md:text-base font-black tracking-tight italic uppercase">Mission Objective</h2>
                                    </div>
                                    <div className="text-foreground/80 font-medium leading-[1.7] whitespace-pre-wrap text-[13px] md:text-sm selection:bg-primary/20">
                                        {opp.description}
                                    </div>
                                </section>

                                {/* Requirements */}
                                <section className="premium-card !p-6 md:!p-8 space-y-4 md:space-y-6">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                                        <div className="p-1.5 bg-muted rounded-lg text-primary"><CheckBadgeIcon className="w-5 h-5" /></div>
                                        <h2 className="text-sm md:text-base font-black tracking-tight italic uppercase">Entry Requirements</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-1 p-3 bg-muted/30 rounded-xl border border-border/50">
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Allowed Degrees</p>
                                            <p className="text-foreground font-black text-xs">{(opp.allowedDegrees || []).join(', ') || 'Omni-Degree (Any)'}</p>
                                        </div>
                                        <div className="space-y-1 p-3 bg-muted/30 rounded-xl border border-border/50">
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Target Batches</p>
                                            <p className="text-foreground font-black text-xs">{(opp.allowedPassoutYears || []).join(', ') || 'All Cohorts'}</p>
                                        </div>
                                        <div className="col-span-full space-y-2.5">
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Core Competencies</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(opp.requiredSkills || []).map((s: string) => (
                                                    <span key={s} className="px-3 py-1 bg-primary/5 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Special Walk-In Section */}
                                {opp.type === 'WALKIN' && (
                                    <section className="premium-card !p-6 md:!p-8 !bg-orange-500/5 !border-orange-500/20 space-y-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 bg-orange-500/20 rounded-lg text-orange-600"><MapPinIcon className="w-5 h-5" /></div>
                                            <h2 className="text-sm md:text-base font-black tracking-tight text-orange-900 uppercase italic">On-Site Logistics (Walk-In)</h2>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-orange-800 font-bold leading-relaxed text-[11px] md:text-xs">
                                                This listing is a direct physical recruitment event. Ensure all academic credentials and identification documents are ready.
                                            </p>
                                            {opp.expiresAt && (
                                                <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20">
                                                    <CalendarDaysIcon className="w-4 h-4" />
                                                    <span>Event Active: {new Date(opp.expiresAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* Sidebar Insights (1/3) */}
                            <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
                                <div className="premium-card !bg-foreground !text-background !p-6 space-y-6 shadow-2xl">
                                    <div className="space-y-4">
                                        <h3 className="font-black tracking-[0.25em] uppercase text-xs opacity-40">Intelligence Feed</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-black opacity-40 uppercase mb-0.5">Status</p>
                                                <p className="text-base font-black text-success italic leading-none">Hiring Active</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black opacity-40 uppercase mb-0.5">Integrity</p>
                                                <p className="text-base font-black text-primary italic leading-none">Flow Verified</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black opacity-40 uppercase mb-0.5">Expected Salary</p>
                                                <div className="flex items-center gap-1 text-base font-black italic leading-none text-white">
                                                    <CurrencyRupeeIcon className="w-4 h-4" />
                                                    <span>Competitive</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/10">
                                        <p className="text-[9px] font-black opacity-40 uppercase tracking-widest leading-relaxed">
                                            Career Matching by <span className="opacity-100 text-primary">FresherFlow Gen-V</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="premium-card !p-4 flex items-center gap-3 bg-muted/30">
                                    <InformationCircleIcon className="w-6 h-6 text-primary flex-shrink-0" />
                                    <p className="text-[10px] font-bold text-muted-foreground italic leading-relaxed">
                                        Protect your data. Always use secure portals. We never request financial transactions.
                                    </p>
                                </div>
                            </aside>
                        </div>
                    </main>

                    {/* Mobile Dynamic Action Bar - Positioned above fixed bottom nav */}
                    <div className="md:hidden fixed bottom-[72px] left-4 right-4 z-50">
                        <Button
                            onClick={handleApply}
                            className="w-full text-sm font-black italic uppercase tracking-widest shadow-2xl"
                        >
                            Complete Application
                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}
