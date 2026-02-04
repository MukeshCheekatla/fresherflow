'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { opportunitiesApi } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { Opportunity } from '@fresherflow/types';
import toast from 'react-hot-toast';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { SkeletonJobCard } from '@/components/ui/Skeleton';
import JobCard from '@/features/jobs/components/JobCard';
import {
    MagnifyingGlassIcon,
    MapPinIcon,
    BriefcaseIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    AdjustmentsHorizontalIcon,
    ChevronRightIcon,
    FunnelIcon,
    XMarkIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const FILTERS = {
    type: [
        { label: 'Full-time', value: 'JOB' },
        { label: 'Internship', value: 'INTERNSHIP' },
        { label: 'Walk-ins', value: 'WALKIN' },
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
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
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
        setIsLoading(true);
        setProfileIncomplete(null); // Reset error state
        try {
            const data = await opportunitiesApi.list({
                type: selectedType || undefined,
                city: selectedLoc || undefined
            });
            setOpportunities(data.opportunities || []);
            setTotalCount(data.count || 0);
        } catch (error: any) {
            // Check if this is a profile incomplete error
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
    }, [selectedType, selectedLoc]);

    useEffect(() => {
        loadOpportunities();
    }, [loadOpportunities]);

    const filteredOpps = useMemo(() => {
        return opportunities.filter(opp => {
            // Search filter
            const matchesSearch = !debouncedSearch ||
                opp.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                opp.company.toLowerCase().includes(debouncedSearch.toLowerCase());

            // Type filter - strict matching with enums
            const matchesType = !selectedType || opp.type === selectedType;

            // Location filter
            const matchesLoc = !selectedLoc || opp.locations.includes(selectedLoc);

            return matchesSearch && matchesType && matchesLoc;
        });
    }, [opportunities, debouncedSearch, selectedType, selectedLoc]);

    const updateType = (type: string | null) => {
        setSelectedType(type);
        // Update URL to match state
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
                <div className="max-w-7xl mx-auto px-2 md:px-4 pb-12 md:pb-20 space-y-6 md:space-y-8">
                    {/* Page Header - Clean & Compact */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border py-6">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Opportunities</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                                    {filteredOpps.length} Results
                                </span>
                                {selectedType && (
                                    <button
                                        onClick={() => updateType(null)}
                                        className="text-xs font-medium text-primary hover:underline"
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
                                    className="pl-10 h-10 text-sm"
                                />
                            </div>
                            <Button
                                variant={isFilterOpen ? "default" : "outline"}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="h-10 px-4 text-sm font-medium"
                            >
                                <FunnelIcon className="w-4 h-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                        {/* Control Panel (Sticky) */}
                        <aside className={cn(
                            "lg:col-span-3 space-y-6 lg:sticky lg:top-24 transition-all duration-300 animate-in fade-in",
                            isFilterOpen ? "block" : "hidden"
                        )}>
                            <div className="bg-card rounded-xl border border-border p-5 md:p-6 space-y-8">
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Category</h3>
                                    <div className="space-y-2">
                                        {FILTERS.type.map(type => (
                                            <button
                                                key={type.value}
                                                onClick={() => updateType(selectedType === type.value ? null : type.value)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left",
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
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</h3>
                                        {selectedLoc && (
                                            <button onClick={() => setSelectedLoc(null)} className="text-xs font-medium text-primary">Clear</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                                        {FILTERS.location.map(loc => (
                                            <button
                                                key={loc}
                                                onClick={() => setSelectedLoc(selectedLoc === loc ? null : loc)}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                                                    selectedLoc === loc
                                                        ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                        : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                <MapPinIcon className="w-4 h-4 opacity-70" />
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
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
                                        Profile Completion Required
                                    </h3>
                                    <div className="max-w-md mx-auto space-y-6">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {profileIncomplete.message}
                                        </p>
                                        <div className="bg-muted/50 p-6 rounded-xl border border-border">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-primary">{profileIncomplete.percentage}%</div>
                                                    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Current</div>
                                                </div>
                                                <div className="w-px h-10 bg-border" />
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-foreground">100%</div>
                                                    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Goal</div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button asChild className="h-11 px-8 text-sm font-semibold">
                                            <Link href="/profile/edit">
                                                Complete Profile
                                                <ChevronRightIcon className="w-4 h-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : isLoading ? (
                                <div className={cn(
                                    "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
                                    isFilterOpen ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
                                )}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonJobCard key={i} />)}
                                </div>
                            ) : filteredOpps.length === 0 ? (
                                <div className="p-20 text-center rounded-2xl border border-dashed border-border bg-card">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                        <MagnifyingGlassIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground tracking-tight">System: No results found</h3>
                                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                                        Try adjusting your filters or search keywords to find matching opportunities.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('');
                                            updateType(null);
                                            setSelectedLoc(null);
                                        }}
                                        className="mt-6 h-9 px-4 text-xs font-medium"
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            ) : (
                                <div className={cn(
                                    "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-in fade-in duration-500",
                                    isFilterOpen ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
                                )}>
                                    {filteredOpps.map((opp) => (
                                        <JobCard
                                            key={opp.id}
                                            job={{
                                                ...opp,
                                                normalizedRole: opp.title,
                                                salary: (opp.salaryMin !== undefined && opp.salaryMax !== undefined) ? { min: opp.salaryMin, max: opp.salaryMax } : undefined,
                                            } as any}
                                            jobId={opp.id}
                                            isApplied={(opp as any).actions?.some((a: any) => a.actionType === 'APPLIED')}
                                            onClick={() => router.push(`/opportunities/${opp.id}`)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Feed Footer */}
                            {!isLoading && !profileIncomplete && (
                                <div className="mt-12 text-center pb-8 border-t border-border pt-8">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60">
                                        {totalCount} Opportunities Synced With Career Grid
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
        <Suspense fallback={
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-muted/20 animate-pulse rounded-2xl" />
                    ))}
                </div>
            </div>
        }>
            <OpportunitiesContent />
        </Suspense>
    );
}
