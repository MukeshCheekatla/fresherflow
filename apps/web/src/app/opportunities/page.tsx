'use client';

import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Opportunity } from '@fresherflow/types';
import JobCard from '@/features/jobs/components/JobCard';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import BookmarkIcon from '@heroicons/react/24/outline/BookmarkIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useOpportunitiesFeed } from '@/features/jobs/hooks/useOpportunitiesFeed';
import { useAuth } from '@/contexts/AuthContext';

const FILTERS = {
    location: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Remote'],
};

const typeParamToEnum = (value: string) => {
    const v = value.toLowerCase();
    if (v === 'job' || v === 'jobs' || v === 'full-time' || v === 'full time') return 'JOB';
    if (v === 'internship' || v === 'internships') return 'INTERNSHIP';
    if (v === 'walk-in' || v === 'walkin' || v === 'walkins' || v === 'walk-ins') return 'WALKIN';
    return value.toUpperCase();
};

const enumToTypeParam = (value: string) => {
    if (value === 'JOB') return 'job';
    if (value === 'INTERNSHIP') return 'internship';
    if (value === 'WALKIN') return 'walk-in';
    return value.toLowerCase();
};

function OpportunitiesContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const [search, setSearch] = useState('');
    // Derived state from URL to avoid duplication and effect issues
    const typeParam = searchParams.get('type');
    const selectedType = typeParam ? typeParamToEnum(typeParam) : null;

    const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
    const [closingSoon, setClosingSoon] = useState(false);
    const [showOnlySaved, setShowOnlySaved] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter Logic
    const {
        filteredOpps,
        totalCount,
        isLoading,
        error,
        profileIncomplete,
        toggleSave,
        reload
    } = useOpportunitiesFeed({
        type: selectedType,
        selectedLoc,
        showOnlySaved,
        closingSoon,
        search
    });

    const isJobSaved = (opp: Opportunity) => {
        return opp.isSaved || false;
    };

    const isJobApplied = (opp: Opportunity) => {
        return opp.actions && opp.actions.length > 0;
    };

    const updateType = (type: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (type) {
            params.set('type', enumToTypeParam(type));
        } else {
            params.delete('type');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <AuthGate>
            <ProfileGate>
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-20 space-y-6 md:space-y-8">
                    {/* Page Header */}
                    <div className="flex flex-col gap-3 border-b border-border/60 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="space-y-1">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Browse the live feed</h1>
                                <p className="text-xs text-muted-foreground">Verified posts only.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border uppercase tracking-wider">
                                    {filteredOpps.length} results
                                </span>
                                {selectedType && (
                                    <button
                                        onClick={() => updateType(null)}
                                        className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                                    >
                                        Clear
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={cn(
                                        "inline-flex h-8 items-center justify-center rounded-full border px-3 text-[10px] font-bold uppercase tracking-widest transition-all",
                                        isFilterOpen ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <FunnelIcon className="w-4 h-4 mr-2" />
                                    {isFilterOpen ? 'Hide' : 'Filters'}
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
                            <div className="relative w-full lg:w-80">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search role or company..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-10 text-sm bg-background"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={selectedType === 'JOB' ? "default" : "outline"}
                                    onClick={() => updateType('JOB')}
                                    className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest"
                                >
                                    Jobs
                                </Button>
                                <Button
                                    variant={selectedType === 'INTERNSHIP' ? "default" : "outline"}
                                    onClick={() => updateType('INTERNSHIP')}
                                    className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest"
                                >
                                    Internships
                                </Button>
                                <Button
                                    variant={selectedType === 'WALKIN' ? "default" : "outline"}
                                    onClick={() => updateType('WALKIN')}
                                    className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest"
                                >
                                    Walk-ins
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                        {/* Control Panel (Sticky) */}
                        <aside className={cn(
                            "lg:col-span-3 space-y-6 lg:sticky lg:top-24",
                            isFilterOpen ? "block" : "hidden"
                        )}>
                            <div className="bg-card/80 rounded-2xl border border-border p-4 md:p-5 space-y-6">

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Location</h3>
                                        {selectedLoc && (
                                            <button onClick={() => setSelectedLoc(null)} className="text-[10px] font-bold text-primary uppercase tracking-widest">Clear</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                                        {FILTERS.location.map(loc => (
                                            <button
                                                key={loc}
                                                onClick={() => setSelectedLoc(selectedLoc === loc ? null : loc)}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-3 rounded-xl border text-xs font-semibold transition-all uppercase tracking-wide",
                                                    selectedLoc === loc
                                                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                                                        : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                <MapPinIcon className="w-4 h-4 opacity-70" />
                                                {loc}
                                            </button>
                                        ))
                                        }
                                    </div>
                                </div>

                                {/* Closing Soon Filter */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Urgency</h3>
                                    <button
                                        onClick={() => setClosingSoon(!closingSoon)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-3 rounded-xl border text-xs font-semibold transition-all text-left uppercase tracking-wide",
                                            closingSoon
                                                ? "bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-400 shadow-sm"
                                                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>Closing Soon</span>
                                        </div>
                                        {closingSoon && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                    </button>
                                </div>

                                {/* Saved Filter */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Saved</h3>
                                    <button
                                        onClick={() => setShowOnlySaved(!showOnlySaved)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-3 rounded-xl border text-xs font-semibold transition-all text-left uppercase tracking-wide",
                                            showOnlySaved
                                                ? "bg-primary/10 border-primary text-primary shadow-sm"
                                                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <BookmarkIcon className="w-4 h-4" />
                                            <span>Saved only</span>
                                        </div>
                                        {showOnlySaved && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Opportunity Feed */}
                        <div className={cn(
                            "transition-all duration-300",
                            isFilterOpen ? "lg:col-span-9" : "lg:col-span-12"
                        )}>
                            {/* Feed Display */}
                            {profileIncomplete ? (
                                <div className="p-10 md:p-16 text-center rounded-3xl border border-border bg-card/80 shadow-2xl">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheckIcon className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                                        Profile Readiness Required
                                    </h3>
                                    <div className="max-w-md mx-auto space-y-6">
                                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                            {profileIncomplete.message}
                                        </p>
                                        <div className="bg-muted/40 p-6 rounded-2xl border border-border">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-primary">{profileIncomplete.percentage}%</div>
                                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em] mt-1">Current</div>
                                                </div>
                                                <div className="w-px h-10 bg-border" />
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-foreground">100%</div>
                                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em] mt-1">Goal</div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button asChild className="h-12 px-8 text-sm font-bold uppercase tracking-widest">
                                            <Link href="/profile/edit">
                                                Complete Profile
                                                <ChevronRightIcon className="w-4 h-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : isLoading ? (
                                <div className="h-100 relative">
                                    <LoadingScreen message="Loading listings..." fullScreen={false} />
                                </div>
                            ) : error ? (
                                <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
                                    <h3 className="text-lg font-bold text-foreground tracking-tight">Feed unavailable</h3>
                                    <p className="text-sm font-medium text-muted-foreground mt-2 max-w-sm mx-auto">
                                        {error}
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => reload()}
                                        className="mt-6 h-10 px-6 text-xs font-bold uppercase tracking-widest"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : filteredOpps.length === 0 ? (
                                <div className="p-16 text-center rounded-3xl border border-dashed border-border bg-card/80">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                        <MagnifyingGlassIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground tracking-tight">No results found</h3>
                                    <p className="text-sm font-medium text-muted-foreground mt-2 max-w-sm mx-auto">
                                        Try adjusting your filters or search keywords to find matching opportunities.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('');
                                            updateType(null);
                                            setSelectedLoc(null);
                                            setClosingSoon(false);
                                            setShowOnlySaved(false);
                                        }}
                                        className="mt-6 h-11 px-6 text-sm font-bold uppercase tracking-widest"
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Listings</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Live updates</span>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
                                        isFilterOpen ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
                                    )}>
                                        {filteredOpps.map((opp) => (
                                            <JobCard
                                                key={opp.id}
                                                job={{
                                                    ...opp,
                                                    normalizedRole: opp.title,
                                                    salary: (opp.salaryMin !== undefined && opp.salaryMax !== undefined) ? { min: opp.salaryMin, max: opp.salaryMax } : undefined,
                                                }}
                                                jobId={opp.id}
                                                isSaved={isJobSaved(opp)}
                                                isApplied={isJobApplied(opp)}
                                                onToggleSave={() => toggleSave(opp.id)}
                                                onClick={() => router.push(`/opportunities/${opp.slug || opp.id}`)}
                                                isAdmin={user?.role === 'ADMIN'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Feed Footer */}
                            {!isLoading && !profileIncomplete && filteredOpps.length > 0 && (
                                <div className="mt-12 text-center pb-8 border-t border-border pt-8">
                                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
                                        Verified &bull; {totalCount} listings active
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}

export default function OpportunitiesPage() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <OpportunitiesContent />
        </Suspense>
    );
}
