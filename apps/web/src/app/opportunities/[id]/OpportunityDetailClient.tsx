'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { opportunitiesApi, actionsApi, feedbackApi, savedApi } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Opportunity } from '@fresherflow/types';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import {
    MapPinIcon,
    ClockIcon,
    BuildingOfficeIcon,
    ArrowLeftIcon,
    ArrowTopRightOnSquareIcon,
    InformationCircleIcon,
    ShareIcon,
    FlagIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

import Link from 'next/link';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function OpportunityDetailClient({ id, initialData }: { id: string; initialData?: Opportunity | null }) {
    const router = useRouter();
    const { user } = useAuth();
    // Use initialData if available, otherwise start null
    const [opp, setOpp] = useState<Opportunity | null>(initialData || null);
    // If initialData is provided, we are not loading. If not provided, we are loading.
    const [isLoading, setIsLoading] = useState(!initialData);
    const [showReports, setShowReports] = useState(false);

    const loadOpportunity = useCallback(async () => {
        // If we already have data (from server), we might not need to fetch again immediately
        // But if we want to ensure fresh data or if we navigated here client-side without data:
        if (initialData && !isLoading) {
            // Optional: Background revalidation or just skip. 
            // For now, let's skip re-fetching if we have initialData to avoid flicker/double-fetch
            // unless we want to support soft-navigation updates.
            // Let's stick to: Fetch only if we don't have data, or if we want to refresh.
            // Given the current architecture, let's interpret initialData as "the data".
            return;
        }

        setIsLoading(true);
        try {
            const { opportunity } = await opportunitiesApi.getById(id);
            // Sanitize data
            const sanitized = {
                ...opportunity,
                locations: opportunity.locations || [],
                requiredSkills: opportunity.requiredSkills || [],
                allowedDegrees: opportunity.allowedDegrees || [],
                allowedPassoutYears: opportunity.allowedPassoutYears || []
            };
            setOpp({
                ...sanitized,
                isSaved: opportunity.isSaved || false
            });
        } catch {
            toast.error('Listing protocol failed. Resource not found.');
            router.push('/opportunities');
        } finally {
            setIsLoading(false);
        }
    }, [id, router, initialData, isLoading]); // Added deps

    useEffect(() => {
        // If we have initialData, we might not need to fetch. 
        // But typically we might want to "hydrate" or check for updates.
        // However, to fix the double fetch logic:
        if (!initialData && id) {
            void loadOpportunity();
        }
    }, [id, initialData, loadOpportunity]); // Added deps

    const handleToggleSave = async () => {
        if (!opp) return;
        try {
            const result = await savedApi.toggle(opp.id);
            setOpp(prev => prev ? { ...prev, isSaved: result.saved } : null);
        } catch {
            toast.error('Failed to update bookmark');
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
        } catch {
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
        } catch {
            console.error('Share failed');
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
        } catch (err: unknown) {
            toast.error((err as Error).message || 'Transmission failed.', { id: loadingToast });
        }
    };

    if (isLoading) return <LoadingScreen message="Synchronizing Opportunity Data" />;
    if (!opp) return null;

    return (
        <div className="min-h-screen bg-background pb-20 selection:bg-primary/20">
            {/* Immersive Background Blur Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10 hidden md:block">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-success/10 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 max-w-6xl mx-auto px-4 py-4 md:py-8 space-y-4 md:space-y-6">

                {/* Navigation & Actions Top Bar */}
                <div className="flex items-center justify-between">
                    <Link href="/opportunities" className="group/back flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all">
                        <ArrowLeftIcon className="w-3.5 h-3.5 group-hover/back:-translate-x-0.5 transition-all" />
                        Back to Feed
                    </Link>

                    <div className="flex items-center gap-1.5">
                        <button onClick={handleShare} className="p-2 bg-muted/40 hover:bg-primary/10 rounded-lg transition-all text-muted-foreground hover:text-primary border border-border/50">
                            <ShareIcon className="w-4 h-4" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowReports(!showReports)}
                                className={cn(
                                    "p-2 rounded-lg transition-all border",
                                    showReports ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-destructive/5 hover:text-destructive"
                                )}
                            >
                                <FlagIcon className="w-4 h-4" />
                            </button>
                            {showReports && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                                    {[
                                        { id: 'LINK_BROKEN', label: 'Broken Link', icon: ArrowTopRightOnSquareIcon },
                                        { id: 'EXPIRED', label: 'Listing Expired', icon: ClockIcon },
                                        { id: 'DUPLICATE', label: 'Duplicate Item', icon: FlagIcon },
                                        { id: 'INACCURATE', label: 'Invalid Data', icon: ExclamationTriangleIcon }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleReport(item.id)}
                                            className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-muted rounded-lg text-[10px] font-bold text-foreground uppercase tracking-tight transition-all text-left group"
                                        >
                                            <item.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                    {/* Left Column: Essential Details (Lg: 8Cols) */}
                    <div className="lg:col-span-8 space-y-4">

                        {/* Expired Banner */}
                        {opp.expiresAt && new Date(opp.expiresAt) < new Date() && (
                            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 bg-destructive/10 rounded-full">
                                    <ClockIcon className="w-6 h-6 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-destructive uppercase tracking-wide">Opportunity Expired</h3>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        This listing is no longer accepting applications. It is visible for historical reference only.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Hero Branding Section */}
                        <div className="bg-card p-4 md:p-6 rounded-xl border border-border relative overflow-hidden group shadow-sm">
                            <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 opacity-30" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-tight rounded border border-primary/20">
                                        {opp.type}
                                    </span>
                                    {opp.expiresAt && new Date(opp.expiresAt) < new Date() ? (
                                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-destructive/5 border border-destructive/10 text-destructive text-[9px] font-bold uppercase tracking-tight rounded">
                                            <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                            Expired
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-success/5 border border-success/10 text-success text-[9px] font-bold uppercase tracking-tight rounded">
                                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                            Active
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight">
                                        {opp.title}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-muted/30 border border-border rounded-lg flex items-center justify-center">
                                            <BuildingOfficeIcon className="w-5 h-5 text-primary/60" />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <h2 className="text-base font-semibold text-foreground tracking-tight leading-none">{opp.company}</h2>
                                                {opp.jobFunction && (
                                                    <span className="text-[10px] text-muted-foreground font-medium">• {opp.jobFunction}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                                                <MapPinIcon className="w-3 h-3" />
                                                <span className="font-medium text-[10px] md:text-xs">{(opp.locations || []).join(', ') || 'Remote'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="pt-4 border-t border-border/50 grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Package</p>
                                        <p className="font-bold text-xs text-foreground truncate">{opp.salaryRange || 'Std. Entry'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Mode</p>
                                        <p className="font-bold text-xs text-foreground truncate">{opp.workMode || 'ONSITE'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Batch</p>
                                        <p className="font-bold text-xs text-foreground truncate">{opp.allowedPassoutYears?.[0] ? `${opp.allowedPassoutYears[0]}+` : 'Any'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Experience</p>
                                        <p className="font-bold text-xs text-foreground truncate">{opp.experienceMax ? `${opp.experienceMin || 0}-${opp.experienceMax}y` : 'Fresher+'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="bg-card p-4 md:p-6 rounded-xl border border-border shadow-sm space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Description</h3>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-foreground/80 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                                    {opp.description}
                                </p>
                            </div>
                        </div>

                        {/* Requirements Section */}
                        <div className="bg-card p-4 md:p-6 rounded-xl border border-border shadow-sm space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Requirements</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-0.5 p-2.5 bg-muted/20 border border-border rounded-lg">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Education</p>
                                    <p className="text-xs font-semibold text-foreground">{(opp.allowedDegrees || []).join(', ') || 'Any Graduate'}</p>
                                </div>
                                <div className="space-y-0.5 p-2.5 bg-muted/20 border border-border rounded-lg">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Key Skills</p>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                        {(opp.requiredSkills || []).map((s: string) => (
                                            <span key={s} className="px-1 py-0.5 bg-primary/5 text-primary text-[9px] font-bold uppercase rounded">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Walk-in Drive */}
                        {opp.type === 'WALKIN' && (
                            <div className="bg-amber-500/[0.03] border border-amber-500/10 p-4 md:p-6 rounded-xl space-y-4">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 border-b border-amber-500/10 pb-2">Walk-in Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-amber-600/70 uppercase">Date & Time</p>
                                        <p className="text-sm font-bold text-amber-800">{opp.walkInDetails?.dateRange} | {opp.walkInDetails?.timeRange || opp.walkInDetails?.reportingTime}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-amber-600/70 uppercase">Venue</p>
                                        <p className="text-xs font-medium text-amber-900 leading-relaxed">{opp.walkInDetails?.venueAddress}</p>
                                        {opp.walkInDetails?.venueLink && (
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(opp.walkInDetails?.venueLink, '_blank')}
                                                className="h-8 bg-amber-500 hover:bg-amber-600 border-none text-white font-bold uppercase text-[9px] px-3 shadow-sm"
                                            >
                                                View on Maps
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Dynamic Action Sidebar */}
                    <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
                        <div className="bg-card p-5 rounded-xl border border-border shadow-sm space-y-4">
                            <div className="space-y-2">
                                <Button
                                    onClick={handleApply}
                                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-tight shadow-md"
                                >
                                    Apply Now
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleToggleSave}
                                    className={cn(
                                        "flex items-center justify-center gap-2 h-9 rounded-lg border transition-all text-[10px] font-bold uppercase",
                                        opp.isSaved ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {opp.isSaved ? <BookmarkSolidIcon className="w-3.5 h-3.5" /> : <BookmarkIcon className="w-3.5 h-3.5" />}
                                    {opp.isSaved ? 'Saved' : 'Save'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center justify-center gap-2 h-9 rounded-lg border border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-all text-[10px] font-bold uppercase"
                                >
                                    <ShareIcon className="w-3.5 h-3.5" />
                                    Share
                                </button>
                            </div>

                            <div className="pt-3 border-t border-border flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 italic">Listing Verified</span>
                                <ShieldCheckIcon className="w-3.5 h-3.5 text-primary/40" />
                            </div>
                        </div>

                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
                            <h4 className="text-[9px] font-bold uppercase tracking-widest text-primary">Hiring Activity</h4>
                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[75%] shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
                            </div>
                            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                                <span className="text-foreground font-bold">{opp?.company}</span> is actively recruiting for this role.
                            </p>
                        </div>

                        <div className="p-3.5 flex items-start gap-3 bg-muted/10 border border-border border-dashed rounded-xl">
                            <InformationCircleIcon className="w-4 h-4 text-primary/40 flex-shrink-0 mt-0.5" />
                            <p className="text-[9px] font-medium text-muted-foreground leading-relaxed uppercase tracking-tight">
                                Fraud Protection: We never charge for placement. Report suspicious activity.
                            </p>
                        </div>

                        {user?.role === 'ADMIN' && (
                            <div className="bg-card p-4 border border-primary/20 rounded-xl space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-tight text-primary">Admin Control</h4>
                                <Link href={`/admin/opportunities/edit/${opp.id}`} className="block">
                                    <Button variant="outline" className="w-full text-[10px] font-bold uppercase h-8 hover:bg-primary/5">
                                        Edit Opportunity
                                    </Button>
                                </Link>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <button className="text-[8px] font-bold uppercase h-7 border border-border rounded">Sync</button>
                                    <button className="text-[8px] font-bold uppercase h-7 border border-destructive/20 text-destructive rounded">Abort</button>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </main>

            {/* Mobile Actions - Floating Bottom */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-40 flex gap-2">
                <Button
                    onClick={handleApply}
                    className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-tight shadow-xl rounded-xl flex items-center justify-center gap-2"
                >
                    Apply Now
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Button>
                <button
                    onClick={handleToggleSave}
                    className={cn(
                        "w-12 h-12 rounded-xl shadow-lg flex items-center justify-center transition-all border",
                        opp.isSaved ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"
                    )}
                >
                    {opp.isSaved ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
}
