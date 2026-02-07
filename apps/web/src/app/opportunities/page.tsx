'use client';

import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { opportunitiesApi, savedApi } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { Opportunity } from '@fresherflow/types';
import toast from 'react-hot-toast';
import { useDebounce } from '@/lib/hooks/useDebounce';
import JobCard from '@/features/jobs/components/JobCard';
import {
    MagnifyingGlassIcon,
    MapPinIcon,
    ChevronRightIcon,
    FunnelIcon,
    ShieldCheckIcon,
    ClockIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

const FILTERS = {
    type: [
        { value: 'JOB', label: 'Jobs' },
        { value: 'INTERNSHIP', label: 'Internships' },
        { value: 'WALKIN', label: 'Walk-ins' }
    ],
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
    const { user, isLoading: authLoading } = useAuth();

    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
    const [closingSoon, setClosingSoon] = useState(false);
    const [showOnlySaved, setShowOnlySaved] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [profileIncomplete, setProfileIncomplete] = useState<{ percentage: number; message: string } | null>(null);

    const debouncedSearch = useDebounce(search, 300);

    // Sync state with URL params
    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam) {
            const t = typeParamToEnum(typeParam);
            if (t === 'JOB') setSelectedType('JOB');
            else if (t === 'INTERNSHIP') setSelectedType('INTERNSHIP');
            else if (t === 'WALKIN') setSelectedType('WALKIN');
            else setSelectedType(t);
        } else {
            setSelectedType(null);
        }
    }, [searchParams]);

    const loadOpportunities = useCallback(async () => {
        if (!user || authLoading) return;
        setIsLoading(true);
        setProfileIncomplete(null);
        try {
            let data;
            if (showOnlySaved) {
                data = await savedApi.list();
            } else {
                data = await opportunitiesApi.list({
                    type: selectedType || undefined,
                    city: selectedLoc || undefined
                });
            }
            setOpportunities(data.opportunities || []);
            setTotalCount(data.count || data.opportunities?.length || 0);
        } catch (err: unknown) {
            const error = err as { code?: string; completionPercentage?: number; message?: string };
            if (error.code === 'PROFILE_INCOMPLETE') {
                setProfileIncomplete({
                    percentage: error.completionPercentage || 0,
                    message: error.message || 'Complete your profile to access job listings'
                });
            } else {
                toast.error(error.message || 'Failed to load feed');
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedType, selectedLoc, user, authLoading, showOnlySaved]);

    useEffect(() => {
        if (!authLoading && user) {
            loadOpportunities();
        }
    }, [loadOpportunities, authLoading, user, showOnlySaved]);

    const filteredOpps = useMemo(() => {
        return opportunities.filter(opp => {
            const matchesSearch = !debouncedSearch ||
                opp.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                opp.company.toLowerCase().includes(debouncedSearch.toLowerCase());

            const matchesType = !selectedType || opp.type === selectedType;
            const matchesLoc = !selectedLoc || opp.locations.includes(selectedLoc);

            const matchesClosingSoon = !closingSoon || (() => {
                if (!opp.expiresAt) return false;
                const expiryDate = new Date(opp.expiresAt);
                const now = new Date();
                const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
                return expiryDate >= now && expiryDate <= threeDaysFromNow;
            })();

            return matchesSearch && matchesType && matchesLoc && matchesClosingSoon;
        });
    }, [opportunities, debouncedSearch, selectedType, selectedLoc, closingSoon]);

    const isJobSaved = (opp: Opportunity) => {
        return opp.isSaved || false;
    };

    const isJobApplied = (opp: Opportunity) => {
        return opp.actions && opp.actions.length > 0;
    };

    const toggleSave = async (opportunityId: string) => {
        try {
            const result = await savedApi.toggle(opportunityId);
            setOpportunities(prev => prev.map(opp =>
                opp.id === opportunityId
                    ? { ...opp, isSaved: result.saved }
                    : opp
            ));
        } catch {
            toast.error('Failed to update bookmark');
        }
    };

    const updateType = (type: string | null) => {
        setSelectedType(type);
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border py-6">
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground italic uppercase">Search Feed</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border uppercase tracking-wider">
                                    {filteredOpps.length} Results Found
                                </span>
                                {selectedType && (
                                    <button
                                        onClick={() => updateType(null)}
                                        className="text-xs font-bold text-primary hover:underline uppercase tracking-tight"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full md:w-64">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by role or company..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-12 text-sm"
                                />
                            </div>
                            <Button
                                variant={isFilterOpen ? "default" : "outline"}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="h-12 px-6 text-sm font-bold uppercase tracking-wider"
                            >
                                <FunnelIcon className="w-4 h-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                        {/* Control Panel (Sticky) */}
                        <aside className={cn(
                            "lg:col-span-3 space-y-6 lg:sticky lg:top-24",
                            isFilterOpen ? "block" : "hidden"
                        )}>
                            <div className="bg-card rounded-xl border border-border p-5 md:p-6 space-y-8">
                                <div>
                                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Category</h3>
                                    <div className="space-y-2">
                                        {FILTERS.type.map(type => (
                                            <button
                                                key={type.value}
                                                onClick={() => updateType(selectedType === type.value ? null : type.value)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-3 rounded-lg border text-xs font-semibold transition-all text-left uppercase tracking-wide",
                                                    selectedType === type.value
                                                        ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                        : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                {type.label}
                                                {selectedType === type.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

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
                                                    "flex items-center gap-3 px-3 py-3 rounded-lg border text-xs font-semibold transition-all uppercase tracking-wide",
                                                    selectedLoc === loc
                                                        ? "bg-primary/5 border-primary text-primary shadow-sm"
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
                                            "w-full flex items-center justify-between px-3 py-3 rounded-lg border text-xs font-semibold transition-all text-left uppercase tracking-wide",
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
                                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Saved Content</h3>
                                    <button
                                        onClick={() => setShowOnlySaved(!showOnlySaved)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-3 rounded-lg border text-xs font-semibold transition-all text-left uppercase tracking-wide",
                                            showOnlySaved
                                                ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <BookmarkIcon className="w-4 h-4" />
                                            <span>My Bookmarks</span>
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
                                <div className="p-12 md:p-20 text-center rounded-2xl border border-border bg-card">
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
                                        <div className="bg-muted/50 p-6 rounded-xl border border-border">
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
                                <div className="h-[400px] relative">
                                    <LoadingScreen message="Syncing Live Feed..." fullScreen={false} />
                                </div>
                            ) : filteredOpps.length === 0 ? (
                                <div className="p-20 text-center rounded-2xl border border-dashed border-border bg-card">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                        <MagnifyingGlassIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground tracking-tight">No Results Found</h3>
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
                                        className="mt-6 h-12 px-6 text-sm font-bold uppercase tracking-widest"
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Search Results</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Live Stream</span>
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
                                                onClick={() => router.push(`/opportunities/${opp.slug}`)}
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
                                        Verified &bull; {totalCount} Listings Online
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
