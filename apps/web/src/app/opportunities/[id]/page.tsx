'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { opportunitiesApi, actionsApi, feedbackApi } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
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
    CheckBadgeIcon,
    ShareIcon,
    FlagIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ShareIcon as ShareIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function OpportunityDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [opp, setOpp] = useState<Opportunity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showReports, setShowReports] = useState(false);

    useEffect(() => {
        if (id) loadOpportunity();
    }, [id]);

    const loadOpportunity = async () => {
        setIsLoading(true);
        try {
            const { opportunity } = await opportunitiesApi.getById(id as string);
            // Sanitize data
            const sanitized = {
                ...opportunity,
                locations: opportunity.locations || [],
                requiredSkills: opportunity.requiredSkills || [],
                allowedDegrees: opportunity.allowedDegrees || [],
                allowedPassoutYears: opportunity.allowedPassoutYears || []
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

    const handleShare = async () => {
        const shareData = {
            title: `${opp?.title} at ${opp?.company}`,
            text: `Check out this opportunity: ${opp?.title} at ${opp?.company}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    };

    const handleReport = async (reason: string) => {
        if (!user) {
            toast.error('Identity required to file report.');
            router.push('/login');
            return;
        }

        const loadingToast = toast.loading('Filing community report...');
        try {
            await feedbackApi.submit(opp!.id, reason);
            toast.success('Report received. Our moderation team will review this listing.', { id: loadingToast });
            setShowReports(false);
        } catch (error: any) {
            toast.error(error.message || 'Transmission failed.', { id: loadingToast });
        }
    };

    if (isLoading) return <LoadingScreen message="Synchronizing Opportunity Data" />;

    if (!opp) return null;

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-24">
            <main className="max-w-6xl mx-auto px-2 md:px-4 py-4 md:py-12 space-y-6 md:space-y-10">

                {/* Hero Header */}
                <div className="premium-card !p-5 md:!p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-4 md:space-y-6">
                        <div className="flex items-center justify-between">
                            <Link href="/opportunities" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-black text-xs uppercase tracking-widest group/back">
                                <ArrowLeftIcon className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
                                Return to Feed
                            </Link>

                            <div className="flex items-center gap-2 relative">
                                <button
                                    onClick={handleShare}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary rounded-full transition-all font-black text-[10px] uppercase tracking-widest"
                                >
                                    <ShareIcon className="w-3.5 h-3.5" />
                                    Share
                                </button>

                                <button
                                    onClick={() => setShowReports(!showReports)}
                                    className={cn(
                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all font-black text-[10px] uppercase tracking-widest border",
                                        showReports ? "bg-primary text-white border-primary shadow-lg" : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent"
                                    )}
                                >
                                    <FlagIcon className="w-3.5 h-3.5" />
                                    Report
                                </button>

                                {showReports && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in zoom-in-95 duration-200">
                                        <div className="px-3 py-2 border-b border-border/50">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Select Issue Type</p>
                                        </div>
                                        {[
                                            { id: 'LINK_BROKEN', label: 'Broken Link', icon: ArrowTopRightOnSquareIcon },
                                            { id: 'EXPIRED', label: 'Already Expired', icon: ClockIcon },
                                            { id: 'DUPLICATE', label: 'Duplicate Post', icon: FlagIcon },
                                            { id: 'INACCURATE', label: 'Inaccurate info', icon: ExclamationTriangleIcon }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleReport(item.id)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted rounded-xl text-[11px] font-black text-foreground uppercase tracking-tighter transition-colors text-left"
                                            >
                                                <item.icon className="w-3.5 h-3.5 opacity-50" />
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

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
                                            <div className="flex items-center gap-2">
                                                <p className="text-base md:text-lg font-black text-foreground tracking-tight leading-none mb-0.5">{opp.company}</p>
                                                {opp.jobFunction && (
                                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[9px] font-black uppercase tracking-widest">{opp.jobFunction}</span>
                                                )}
                                            </div>
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
                                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Application Process</p>
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
                                <h2 className="text-sm md:text-base font-black tracking-tight italic uppercase">Description</h2>
                            </div>
                            <div className="text-foreground/80 font-medium leading-[1.7] whitespace-pre-wrap text-[13px] md:text-sm selection:bg-primary/20">
                                {opp.description}
                            </div>
                        </section>

                        {/* Requirements */}
                        <section className="premium-card !p-6 md:!p-8 space-y-4 md:space-y-6">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                                <div className="p-1.5 bg-muted rounded-lg text-primary"><CheckBadgeIcon className="w-5 h-5" /></div>
                                <h2 className="text-sm md:text-base font-black tracking-tight italic uppercase">Eligibility Criteria</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1 p-3 bg-muted/30 rounded-xl border border-border/50">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Allowed UG</p>
                                    <p className="text-foreground font-black text-xs">{(opp.allowedDegrees || []).join(', ') || 'Open for All UG'}</p>
                                </div>
                                <div className="space-y-1 p-3 bg-muted/30 rounded-xl border border-border/50">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Eligible Batches</p>
                                    <p className="text-foreground font-black text-xs">{(opp.allowedPassoutYears || []).join(', ') || 'Open for All Batches'}</p>
                                </div>
                                <div className="space-y-1 p-3 bg-muted/30 rounded-xl border border-border/50">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Experience Required</p>
                                    <p className="text-foreground font-black text-xs">
                                        {opp.experienceMin !== undefined || opp.experienceMax !== undefined ?
                                            `${opp.experienceMin ?? 0}-${opp.experienceMax ?? 'Any'} years` :
                                            'Fresher / Any'
                                        }
                                    </p>
                                </div>
                                <div className="col-span-full space-y-2.5">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Required Skills</p>
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
                            <section className="premium-card !p-6 md:!p-8 !bg-amber-500/5 !border-amber-500/20 space-y-6">
                                <div className="flex items-center gap-2.5 border-b border-amber-500/10 pb-4">
                                    <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-600"><MapPinIcon className="w-5 h-5" /></div>
                                    <h2 className="text-sm md:text-base font-black tracking-tight text-amber-900 uppercase italic">Recruitment Drive Logistics</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Walk-in Schedule</p>
                                        <p className="text-sm font-black text-foreground italic">{(opp as any).walkInDetails?.dateRange || 'Check Description'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Reporting Window</p>
                                        <p className="text-sm font-black text-foreground italic">{(opp as any).walkInDetails?.timeRange || (opp as any).walkInDetails?.reportingTime}</p>
                                    </div>
                                    <div className="col-span-full space-y-3">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Venue Location</p>
                                        <div className="bg-background/50 border border-amber-500/10 rounded-xl p-4 space-y-3">
                                            <p className="text-xs font-bold leading-relaxed text-foreground">{(opp as any).walkInDetails?.venueAddress}</p>
                                            {(opp as any).walkInDetails?.venueLink && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open((opp as any).walkInDetails.venueLink, '_blank')}
                                                    className="h-9 border-amber-500/20 text-amber-700 hover:bg-amber-500/10 font-black text-[10px] uppercase tracking-wider"
                                                >
                                                    <MapPinIcon className="w-3.5 h-3.5 mr-2" />
                                                    Open in Google Maps
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-500/10 rounded-lg p-3 flex items-center gap-3">
                                    <InformationCircleIcon className="w-4 h-4 text-amber-600" />
                                    <p className="text-[10px] font-bold text-amber-800 italic">
                                        Original documents & multiple copies of resume are usually required for walk-ins.
                                    </p>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Insights (1/3) */}
                    <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
                        <div className="premium-card !bg-foreground !text-background !p-6 space-y-6 shadow-2xl">
                            <div className="space-y-4">
                                <h3 className="font-black tracking-[0.25em] uppercase text-xs opacity-40">Quick Overview</h3>
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
                                        <p className="text-xs font-black opacity-40 uppercase mb-0.5">Salary / Stipend</p>
                                        <div className="flex items-center gap-1 text-base font-black italic leading-none text-white">
                                            <CurrencyRupeeIcon className="w-4 h-4 text-primary" />
                                            <span>
                                                {opp.salaryRange || opp.stipend || (
                                                    (opp.salaryMin !== undefined && opp.salaryMax !== undefined && opp.salaryMin > 0) ? (
                                                        opp.salaryPeriod === 'MONTHLY' ?
                                                            `₹${opp.salaryMin.toLocaleString()} - ${opp.salaryMax.toLocaleString()} /mo` :
                                                            `${(opp.salaryMin / 100000).toFixed(1)}L - ${(opp.salaryMax / 100000).toFixed(1)}L`
                                                    ) : 'Standard for Role'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    {opp.incentives && (
                                        <div>
                                            <p className="text-xs font-black opacity-40 uppercase mb-0.5">Incentives / Variable</p>
                                            <p className="text-base font-black text-success italic leading-none">{opp.incentives}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <p className="text-[9px] font-black opacity-40 uppercase tracking-widest leading-relaxed">
                                    Career Matching by <span className="opacity-100 text-primary">FresherFlow Gen-V</span>
                                </p>
                            </div>
                        </div>

                        {/* Guest CTA */}
                        {!isLoading && !(opp as any).actions?.length && (
                            <div className="premium-card !p-6 bg-primary/10 border-primary/20 space-y-4">
                                <p className="text-xs font-bold text-foreground">Want more personalized jobs?</p>
                                <Link href="/register" className="premium-button block text-center text-[10px] py-3">
                                    Join FresherFlow
                                </Link>
                            </div>
                        )}

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
    );
}
