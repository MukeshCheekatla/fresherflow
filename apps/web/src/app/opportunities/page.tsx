'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { opportunitiesApi } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { Opportunity } from '@/types/api';
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

const FILTERS = {
    type: [
        { label: 'Full-time', value: 'JOB' },
        { label: 'Internship', value: 'INTERNSHIP' },
        { label: 'Walk-ins', value: 'WALKIN' },
    ],
    location: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Remote'],
};

function OpportunitiesContent() {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 300);

    // Sync state with URL params
    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam) {
            const t = typeParam.toUpperCase();
            if (t === 'FULL-TIME' || t === 'JOB') setSelectedType('JOB');
            else if (t === 'INTERNSHIP') setSelectedType('INTERNSHIP');
            else if (t === 'WALKIN' || t === 'WALK-IN' || t === 'WALK-INS') setSelectedType('WALKIN');
            else setSelectedType(t);
        } else {
            setSelectedType(null);
        }
    }, [searchParams]);

    const loadOpportunities = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await opportunitiesApi.list({
                type: selectedType || undefined,
                city: selectedLoc || undefined
            });
            setOpportunities(data.opportunities || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load feed');
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
            // Map JOB back to Full-time for cleaner URLs if desired, or just use JOB
            const label = FILTERS.type.find(t => t.value === type)?.label || type;
            params.set('type', label);
        } else {
            params.delete('type');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <AuthGate>
            <ProfileGate>
                <div className="max-w-7xl mx-auto px-4 pb-12 md:pb-20 space-y-4 md:space-y-8">
                    {/* Page Header - Ultra Compact */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1.5 bg-muted rounded-full border border-border flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    {filteredOpps.length} {selectedType ? selectedType.replace('JOB', 'Jobs').replace('WALKIN', 'Walk-ins').replace('INTERNSHIP', 'Internships') : 'Opportunities'} Found
                                </p>
                            </div>
                            {selectedType && (
                                <button
                                    onClick={() => updateType(null)}
                                    className="text-[10px] font-black text-primary uppercase hover:underline"
                                >
                                    Clear Category
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full md:w-64">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search feed..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="premium-input !pl-9 !h-9 !text-xs italic"
                                />
                            </div>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={cn(
                                    "premium-button-outline !h-9 px-4 text-[10px] uppercase tracking-widest",
                                    isFilterOpen && "bg-muted border-primary text-primary"
                                )}
                            >
                                <FunnelIcon className="w-3.5 h-3.5" />
                                {isFilterOpen ? 'Close' : 'Filters'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
                        {/* Control Panel (Sticky) */}
                        <aside className={cn(
                            "lg:col-span-3 space-y-6 lg:sticky lg:top-24 transition-all duration-300",
                            isFilterOpen ? "block" : "hidden"
                        )}>
                            <div className="p-6 rounded-2xl border border-border bg-card space-y-8 shadow-sm">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Job Type</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {FILTERS.type.map(type => (
                                            <button
                                                key={type.value}
                                                onClick={() => updateType(selectedType === type.value ? null : type.value)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all",
                                                    selectedType === type.value
                                                        ? "bg-primary/5 border-primary text-primary"
                                                        : "bg-background border-border text-muted-foreground hover:border-primary/30"
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
                                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Location</h3>
                                        {selectedLoc && (
                                            <button onClick={() => setSelectedLoc(null)} className="text-[9px] font-black text-primary uppercase">Reset</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                                        {FILTERS.location.map(loc => (
                                            <button
                                                key={loc}
                                                onClick={() => setSelectedLoc(selectedLoc === loc ? null : loc)}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                                    selectedLoc === loc
                                                        ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                        : "bg-background border-border text-muted-foreground hover:border-primary/30"
                                                )}
                                            >
                                                <MapPinIcon className="w-3.5 h-3.5" />
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border/50">
                                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                        <p className="text-[10px] font-bold text-muted-foreground italic leading-relaxed">
                                            Platform ensures 100% verification for all listed opportunities.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Opportunity Feed */}
                        <div className={cn(
                            "transition-all duration-300",
                            isFilterOpen ? "lg:col-span-9" : "lg:col-span-12"
                        )}>
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonJobCard key={i} />)}
                                </div>
                            ) : filteredOpps.length === 0 ? (
                                <div className="p-20 text-center rounded-3xl border-2 border-dashed border-border bg-muted/10">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                                        <MagnifyingGlassIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-foreground uppercase italic tracking-tight">Null ResultSet</h3>
                                    <p className="text-sm text-muted-foreground mt-2 font-medium max-w-sm mx-auto">
                                        No opportunities current match your defined parameters in the {selectedType || 'global'} feed.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearch('');
                                            updateType(null);
                                            setSelectedLoc(null);
                                        }}
                                        className="premium-button mt-8 mx-auto"
                                    >
                                        Flush All Filters
                                    </button>
                                </div>
                            ) : (
                                <div className={cn(
                                    "grid grid-cols-1 md:grid-cols-2 gap-6",
                                    isFilterOpen ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
                                )}>
                                    {filteredOpps.map((opp) => (
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
                                            onClick={() => router.push(`/opportunities/${opp.id}`)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Feed Metadata Footer */}
                            {!isLoading && (
                                <div className="mt-12 text-center pb-8 border-t border-border pt-8">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                                        Total opportunities synchronized.
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
