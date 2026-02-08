'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { opportunitiesApi, actionsApi, feedbackApi, savedApi, growthApi } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Opportunity } from '@fresherflow/types';
import BookmarkIcon from '@heroicons/react/24/outline/BookmarkIcon';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import LinkIcon from '@heroicons/react/24/outline/LinkIcon';
import FlagIcon from '@heroicons/react/24/outline/FlagIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import CompanyLogo from '@/components/ui/CompanyLogo';
import { getRecentViewedByIdOrSlug, saveRecentViewed } from '@/lib/offline/recentViewed';
import { formatSyncTime, getDetailLastSyncAt } from '@/lib/offline/syncStatus';
import { OpportunityDetailSkeleton } from '@/components/ui/Skeleton';

export default function OpportunityDetailClient({ id, initialData }: { id: string; initialData?: Opportunity | null }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    // Use initialData if available, otherwise start null
    const [opp, setOpp] = useState<Opportunity | null>(initialData || null);
    // If initialData is provided, we are not loading. If not provided, we are loading.
    const [isLoading, setIsLoading] = useState(!initialData);
    const [showReports, setShowReports] = useState(false);
    const reportMenuRef = useRef<HTMLDivElement | null>(null);
    const hasTrackedDetailViewRef = useRef(false);
    const [isOnline, setIsOnline] = useState(true);
    const [detailLastSyncAt, setDetailLastSyncAt] = useState<number | null>(null);

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
            saveRecentViewed({
                ...sanitized,
                isSaved: opportunity.isSaved || false
            });
            setDetailLastSyncAt(getDetailLastSyncAt());
        } catch {
            const cachedOpportunity = getRecentViewedByIdOrSlug(id);
            if (cachedOpportunity) {
                setOpp(cachedOpportunity);
                toast.success('Offline mode: loaded cached listing.');
                return;
            }
            toast.error('Listing not found.');
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

    useEffect(() => {
        if (opp) {
            saveRecentViewed(opp);
        }
    }, [opp]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        setIsOnline(window.navigator.onLine);
        setDetailLastSyncAt(getDetailLastSyncAt());

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
        if (!opp || user || hasTrackedDetailViewRef.current) return;
        hasTrackedDetailViewRef.current = true;
        growthApi.trackEvent('DETAIL_VIEW', 'opportunity_detail').catch(() => undefined);
    }, [opp, user]);

    useEffect(() => {
        if (!showReports) return;

        const handleClickOutside = (event: Event) => {
            if (!reportMenuRef.current) return;
            if (!reportMenuRef.current.contains(event.target as Node)) {
                setShowReports(false);
            }
        };

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setShowReports(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('pointerdown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('pointerdown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [showReports]);

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
            toast.error('Error: Apply link unavailable for this listing.');
            return;
        }
        try {
            await actionsApi.track(opp.id, 'APPLIED');
            window.open(opp.applyLink, '_blank');
        } catch {
            window.open(opp.applyLink, '_blank');
        }
    };

    const getShareUrl = () => {
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('ref', 'share');
            url.searchParams.set('source', 'opportunity_share');
            url.searchParams.set('utm_source', 'fresherflow');
            url.searchParams.set('utm_medium', 'share');
            url.searchParams.set('utm_campaign', 'opportunity_share');
            return url.toString();
        } catch {
            return window.location.href;
        }
    };

    const handleShare = async () => {
        const shareUrl = getShareUrl();
        const shareData = {
            title: `${opp?.title} at ${opp?.company}`,
            text: `Check out this opportunity: ${opp?.title} at ${opp?.company}`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Link copied to clipboard!');
            }
        } catch {
            console.error('Share failed');
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(getShareUrl());
            toast.success('Link copied to clipboard!');
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const formatSalary = (opportunity: Opportunity) => {
        if (opportunity.salaryRange) return opportunity.salaryRange;
        if (opportunity.stipend) return opportunity.stipend;

        const period = opportunity.salaryPeriod === 'MONTHLY' ? '/mo' : ' LPA';
        const isMonthly = opportunity.salaryPeriod === 'MONTHLY';
        const sMin = opportunity.salaryMin ?? opportunity.salary?.min;
        const sMax = opportunity.salaryMax ?? opportunity.salary?.max;

        if (sMin != null && sMax != null) {
            if (sMin === 0 && sMax === 0 && opportunity.type === 'INTERNSHIP') return 'Unpaid';
            const formatMin = isMonthly ? sMin.toLocaleString() : (sMin / 100000).toFixed(1);
            const formatMax = isMonthly ? sMax.toLocaleString() : (sMax / 100000).toFixed(1);
            const finalMin = formatMin.endsWith('.0') ? formatMin.slice(0, -2) : formatMin;
            const finalMax = formatMax.endsWith('.0') ? formatMax.slice(0, -2) : formatMax;
            if (finalMin === finalMax) return `₹${finalMin}${period}`;
            return `₹${finalMin}-${finalMax}${period}`;
        }

        if (sMin != null) {
            const formatMin = isMonthly ? sMin.toLocaleString() : (sMin / 100000).toFixed(1);
            const finalMin = formatMin.endsWith('.0') ? formatMin.slice(0, -2) : formatMin;
            return `₹${finalMin}${period}`;
        }

        if (sMax != null) {
            const formatMax = isMonthly ? sMax.toLocaleString() : (sMax / 100000).toFixed(1);
            const finalMax = formatMax.endsWith('.0') ? formatMax.slice(0, -2) : formatMax;
            return `Up to ₹${finalMax}${period}`;
        }

        return 'Not disclosed';
    };

    const handleReport = async (reason: string) => {
        if (!user) {
            toast.error('Identity required to file report.');
            router.push('/login');
            return;
        }

        const loadingToast = toast.loading('Submitting report...');
        try {
            await feedbackApi.submit(opp!.id, reason);
            toast.success('Report received. Our moderation team will review this listing.', { id: loadingToast });
            setShowReports(false);
        } catch (err: unknown) {
            toast.error((err as Error).message || 'Report failed.', { id: loadingToast });
        }
    };

    if (isLoading) return <OpportunityDetailSkeleton />;
    if (!opp) return null;

    const detailPath = `/opportunities/${opp.slug || opp.id}`;
    const hasApplyLink = !!opp.applyLink;
    const sourceParam = searchParams.get('source');
    const fromShare = searchParams.get('ref') === 'share' || sourceParam === 'opportunity_share';
    const loginSource = fromShare ? 'opportunity_share' : 'opportunity_detail';
    const loginFromDetailHref = `/login?redirect=${encodeURIComponent(detailPath)}&source=${encodeURIComponent(loginSource)}`;

    return (
        <div className="min-h-screen bg-background pb-16 selection:bg-primary/20">
            <main className="relative z-10 max-w-6xl mx-auto px-4 py-4 md:py-7 space-y-3 md:space-y-5">

                {/* Navigation & Actions Top Bar */}
                <div className="flex items-center justify-between">
                    <Link href="/opportunities" className="group/back flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all">
                        <ArrowLeftIcon className="w-3.5 h-3.5 group-hover/back:-translate-x-0.5 transition-all" />
                        Back to feed
                    </Link>

                    <div className="flex items-center gap-1.5">
                        <button onClick={handleShare} className="p-2 bg-muted/40 hover:bg-primary/10 rounded-lg transition-all text-muted-foreground hover:text-primary border border-border/50 md:px-3 md:gap-2 md:h-9 md:text-xs md:font-semibold md:uppercase md:tracking-widest md:flex md:items-center">
                            <ShareIcon className="w-4 h-4" />
                            <span className="hidden md:inline">Share</span>
                        </button>
                        <button onClick={handleCopyLink} className="p-2 bg-muted/40 hover:bg-primary/10 rounded-lg transition-all text-muted-foreground hover:text-primary border border-border/50 md:px-3 md:gap-2 md:h-9 md:text-xs md:font-semibold md:uppercase md:tracking-widest md:flex md:items-center">
                            <LinkIcon className="w-4 h-4" />
                            <span className="hidden md:inline">Copy link</span>
                        </button>
                        <div className="relative" ref={reportMenuRef}>
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-start">

                    {/* Left Column: Essential Details (Lg: 8Cols) */}
                    <div className="lg:col-span-8 space-y-3 md:space-y-4">

                        {/* Expired Banner */}
                        {opp.expiresAt && new Date(opp.expiresAt) < new Date() && (
                            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 md:p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
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
                        <div className="bg-card p-4 md:p-5 rounded-xl border border-border relative overflow-hidden group shadow-sm">
                            <div className="relative z-10 space-y-4">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-tight rounded border border-primary/20">
                                        {opp.type}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-muted/40 text-muted-foreground text-[9px] font-bold uppercase tracking-tight rounded border border-border">
                                        {isOnline ? 'Online' : 'Offline'} • Sync {formatSyncTime(detailLastSyncAt)}
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

                                <div className="space-y-1">
                                    <h1 className="text-lg md:text-2xl font-bold tracking-tight text-foreground leading-tight">
                                        {opp.title}
                                    </h1>
                                    {!user && (
                                        <Link
                                            href={loginFromDetailHref}
                                            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                                        >
                                            Sign up to save & get alerts
                                        </Link>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <CompanyLogo
                                            companyName={opp.company}
                                            companyWebsite={opp.companyWebsite}
                                            applyLink={opp.applyLink}
                                            className="w-9 h-9 md:w-10 md:h-10 rounded-lg"
                                        />
                                        <div>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <h2 className="text-base font-semibold text-foreground tracking-tight leading-none">{opp.company}</h2>
                                                {opp.jobFunction && (
                                                    <span className="text-[10px] text-muted-foreground font-medium">- {opp.jobFunction}</span>
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
                                <div className="pt-3 border-t border-border/50 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Package</p>
                                        <p className="font-bold text-xs text-foreground truncate">{formatSalary(opp)}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Employment</p>
                                        <p className="font-bold text-xs text-foreground truncate">{opp.employmentType || 'Not specified'}</p>
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

                        {!user && (
                            <div className="bg-muted/20 border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-foreground">Like this listing?</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Sign up to save listings, set alerts, and track applications.
                                    </p>
                                </div>
                                <Link
                                    href={loginFromDetailHref}
                                    className="premium-button h-9 px-4 text-[10px] uppercase tracking-widest"
                                >
                                    Sign up free
                                </Link>
                            </div>
                        )}

                        {/* Description Section */}
                        <div className="hidden md:block bg-card p-4 md:p-5 rounded-xl border border-border shadow-sm space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Description</h3>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-foreground/80 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                                    {opp.description}
                                </p>
                            </div>
                        </div>

                        {/* Requirements Section */}
                        <div className="bg-card p-4 md:p-5 rounded-xl border border-border shadow-sm space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Requirements</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-0.5 p-2.5 bg-muted/20 border border-border rounded-lg">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Education</p>
                                    <p className="text-xs font-semibold text-foreground">{(opp.allowedDegrees || []).join(', ') || 'Any Graduate'}</p>
                                </div>
                                    <div className="space-y-0.5 p-2.5 bg-muted/20 border border-border rounded-lg">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Courses</p>
                                    <p className="text-xs font-semibold text-foreground">{(opp.allowedCourses || []).join(', ') || 'Any / Not restricted'}</p>
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
                                    {(opp.jobFunction || opp.incentives) && (
                                        <div className="space-y-0.5 p-2.5 bg-muted/20 border border-border rounded-lg">
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Role details</p>
                                            <p className="text-xs font-semibold text-foreground">{opp.jobFunction || 'General'}</p>
                                            {opp.incentives ? (
                                                <p className="text-[10px] text-muted-foreground">Incentives: {opp.incentives}</p>
                                            ) : null}
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Walk-in Drive */}
                        {opp.type === 'WALKIN' && (
                            <div className="bg-card border border-border p-4 md:p-5 rounded-xl space-y-4">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-2">Walk-in Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Date & Time</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {opp.walkInDetails?.dateRange} | {opp.walkInDetails?.timeRange || opp.walkInDetails?.reportingTime}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Venue</p>
                                        <p className="text-xs font-medium text-foreground leading-relaxed">{opp.walkInDetails?.venueAddress}</p>
                                        {opp.walkInDetails?.venueLink && (
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(opp.walkInDetails?.venueLink, '_blank')}
                                                className="h-8 bg-primary hover:bg-primary/90 border-none text-primary-foreground font-bold uppercase text-[9px] px-3 shadow-sm"
                                            >
                                                View on Maps
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {(opp.walkInDetails?.requiredDocuments?.length || opp.walkInDetails?.contactPerson || opp.walkInDetails?.contactPhone) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {opp.walkInDetails?.requiredDocuments?.length ? (
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase">Documents</p>
                                                <ul className="text-xs text-foreground space-y-1 list-disc list-inside">
                                                    {opp.walkInDetails.requiredDocuments.map((doc) => (
                                                        <li key={doc}>{doc}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null}
                                        {(opp.walkInDetails?.contactPerson || opp.walkInDetails?.contactPhone) && (
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase">Contact</p>
                                                {opp.walkInDetails?.contactPerson && (
                                                    <p className="text-xs font-medium text-foreground">{opp.walkInDetails.contactPerson}</p>
                                                )}
                                                {opp.walkInDetails?.contactPhone && (
                                                    <p className="text-xs font-medium text-foreground">{opp.walkInDetails.contactPhone}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="lg:hidden bg-card p-4 rounded-xl border border-border space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick actions</h4>
                            <button
                                onClick={() => {
                                    setShowReports(true);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="w-full h-9 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/5 transition-all text-[10px] font-bold uppercase"
                            >
                                Report issue
                            </button>
                            <p className="text-[10px] text-muted-foreground">
                                We never charge for placement. Report suspicious activity.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Action Sidebar */}
                    <aside className="lg:col-span-4 space-y-3 lg:sticky lg:top-24">
                        {!user && (
                            <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Get more matches</h4>
                                <p className="text-xs text-muted-foreground">
                                    Create an account to save, share, and get alerts for similar roles.
                                </p>
                                <Link
                                    href={loginFromDetailHref}
                                    className="premium-button h-9 px-4 text-[10px] uppercase tracking-widest"
                                >
                                    Sign up free
                                </Link>
                            </div>
                        )}
                        {opp.type === 'WALKIN' && (
                            <div className="hidden lg:block bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Walk-in snapshot</h4>
                                <div className="space-y-2 text-xs text-muted-foreground">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Date & Time</p>
                                        <p className="text-foreground font-semibold">
                                            {opp.walkInDetails?.dateRange} {opp.walkInDetails?.timeRange ? `• ${opp.walkInDetails.timeRange}` : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Venue</p>
                                        <p className="text-foreground">{opp.walkInDetails?.venueAddress}</p>
                                    </div>
                                    {opp.walkInDetails?.requiredDocuments?.length ? (
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Documents</p>
                                            <ul className="list-disc list-inside text-foreground space-y-1">
                                                {opp.walkInDetails.requiredDocuments.map((doc) => (
                                                    <li key={doc}>{doc}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}
                                </div>
                                {opp.walkInDetails?.venueLink && (
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(opp.walkInDetails?.venueLink, '_blank')}
                                        className="h-9 w-full bg-primary hover:bg-primary/90 border-none text-primary-foreground font-bold uppercase text-[10px] tracking-widest"
                                    >
                                        Open Maps
                                    </Button>
                                )}
                            </div>
                        )}
                        <div className="hidden lg:block bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Eligibility snapshot</h4>
                            <div className="space-y-2 text-xs text-muted-foreground">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Education</p>
                                    <p className="text-foreground font-semibold">
                                        {(opp.allowedDegrees && opp.allowedDegrees.length > 0) ? opp.allowedDegrees.join(', ') : 'Any Graduate'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Courses</p>
                                    <p className="text-foreground">
                                        {(opp.allowedCourses && opp.allowedCourses.length > 0) ? opp.allowedCourses.join(', ') : 'Not restricted'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Experience</p>
                                    <p className="text-foreground">
                                        {opp.experienceMax != null ? `${opp.experienceMin || 0}-${opp.experienceMax} yrs` : 'Fresher+ (no cap)'}
                                    </p>
                                </div>
                                {opp.employmentType ? (
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Employment</p>
                                        <p className="text-foreground">{opp.employmentType}</p>
                                    </div>
                                ) : null}
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Skills</p>
                                    <div className="flex flex-wrap gap-1">
                                        {(opp.requiredSkills || []).length > 0 ? (
                                            opp.requiredSkills.slice(0, 6).map((skill) => (
                                                <span key={skill} className="px-1.5 py-0.5 bg-muted/50 border border-border rounded text-[9px] font-semibold text-foreground">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-foreground">Not specified</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cn(
                            "bg-card p-4 md:p-5 rounded-xl border border-border shadow-sm space-y-3",
                            user ? "hidden md:block" : ""
                        )}>
                            {hasApplyLink && (
                                <div className="space-y-2">
                                    <Button
                                        onClick={handleApply}
                                        className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-tight shadow-md"
                                    >
                                        Apply Now
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-2">
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
                            </div>

                            <div className="pt-3 border-t border-border flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 italic">Listing Verified</span>
                                <ShieldCheckIcon className="w-3.5 h-3.5 text-primary/40" />
                            </div>
                        </div>

                        <div className="hidden lg:block bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
                            <h4 className="text-[9px] font-bold uppercase tracking-widest text-primary">Hiring activity</h4>
                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[75%] shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
                            </div>
                            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                                <span className="text-foreground font-bold">{opp?.company}</span> is actively recruiting for this role.
                            </p>
                        </div>

                        <div className="hidden lg:flex p-3.5 items-start gap-3 bg-muted/10 border border-border border-dashed rounded-xl">
                            <InformationCircleIcon className="w-4 h-4 text-primary/40 shrink-0 mt-0.5" />
                            <p className="text-[9px] font-medium text-muted-foreground leading-relaxed uppercase tracking-tight">
                                Fraud protection: We never charge for placement. Report suspicious activity.
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

            {/* Mobile Actions - Floating Bottom (Logged In Users Only) */}
            {user ? (
                <div className="md:hidden fixed bottom-4 left-3 right-3 z-40 flex gap-2 animate-in slide-in-from-bottom-4 duration-500">
                    {hasApplyLink && (
                        <Button
                            onClick={handleApply}
                            className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-tight shadow-xl rounded-xl flex items-center justify-center gap-2"
                        >
                            Apply Now
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </Button>
                    )}
                    <button
                        onClick={handleToggleSave}
                        className={cn(
                            `w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transition-all border ${!hasApplyLink ? 'flex-1' : ''}`,
                            opp.isSaved ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"
                        )}
                    >
                        {opp.isSaved ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                    </button>
                </div>
            ) : (
                /* Guest CTA - Sticky Bottom or Inline */
                <div className="md:hidden fixed bottom-4 left-3 right-3 z-40">
                    <Link href={loginFromDetailHref}>
                        <div className="bg-primary/95 backdrop-blur-md text-primary-foreground p-3 rounded-xl shadow-2xl flex items-center justify-between border border-primary/20 animate-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide">Join FresherFlow</p>
                                <p className="text-[10px] opacity-90">Unlock more verified listings.</p>
                            </div>
                            <div className="h-8 px-4 bg-white text-primary rounded-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-tight shadow-sm">
                                Sign Up Free
                            </div>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}
