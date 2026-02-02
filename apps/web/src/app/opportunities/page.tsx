'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';
import { opportunitiesApi } from '@/lib/api/client';
import { useEffect, useState, useMemo } from 'react';
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
    ArrowLeftIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function OpportunitiesPage() {
    const { user, logout } = useAuth();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        closingSoon: false
    });

    const debouncedCity = useDebounce(citySearch, 500);
    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        loadOpportunities();
    }, [filters, debouncedCity, debouncedSearch]);

    const loadOpportunities = async () => {
        setIsLoading(true);
        try {
            const apiFilters = {
                ...filters,
                city: debouncedCity,
                search: debouncedSearch
            };
            const response = await opportunitiesApi.list(
                apiFilters.type || apiFilters.city || apiFilters.closingSoon || apiFilters.search ? apiFilters : undefined
            );
            setOpportunities(response.opportunities || []);
        } catch (error: any) {
            toast.error(`❌ Load failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setCitySearch('');
        setFilters({ type: '', closingSoon: false });
    };

    return (
        <AuthGate>
            <ProfileGate>
                <div className="space-y-10">
                    {/* Search Bar Top */}
                    <div className="relative group">
                        <label htmlFor="main-search" className="sr-only">Search roles or companies</label>
                        <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            id="main-search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by role, company name, or keywords..."
                            className="w-full h-[56px] bg-card border border-border rounded-2xl pl-16 pr-20 text-base font-bold shadow-xl shadow-slate-200/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-foreground"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
                                aria-label="Clear search"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                        {/* Desktop Sidebar Filters */}
                        <aside className="hidden md:block w-72 shrink-0 space-y-8 h-fit sticky top-[104px]">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Stream Filters</h3>
                                    <div className="space-y-2">
                                        {['', 'JOB', 'INTERNSHIP', 'WALKIN'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilters({ ...filters, type })}
                                                className={`w-full text-left px-5 h-[44px] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${filters.type === type ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-card hover:text-foreground border border-transparent hover:border-border'}`}
                                            >
                                                {type === '' ? 'Omni Stream' : type === 'JOB' ? 'Direct Jobs' : type === 'INTERNSHIP' ? 'Internships' : 'Walk-In Drives'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Location Sync</h3>
                                    <div className="relative">
                                        <label htmlFor="city-search" className="sr-only">City or Remote</label>
                                        <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="city-search"
                                            type="text"
                                            value={citySearch}
                                            onChange={(e) => setCitySearch(e.target.value)}
                                            className="premium-input pl-11 shadow-sm"
                                            placeholder="City or Remote"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3 px-5 h-[44px] bg-card border border-border rounded-xl cursor-pointer hover:border-primary/20 transition-all shadow-sm">
                                        <input
                                            type="checkbox"
                                            checked={filters.closingSoon}
                                            onChange={(e) => setFilters({ ...filters, closingSoon: e.target.checked })}
                                            className="w-4 h-4 rounded-md border-border bg-background text-primary focus:ring-primary transition-all"
                                        />
                                        <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Ending Soon</span>
                                    </label>
                                </div>

                                <button
                                    onClick={handleClearFilters}
                                    className="w-full text-[10px] font-black text-muted-foreground hover:text-rose-500 transition-colors uppercase tracking-widest pt-2"
                                >
                                    Drop All Filters
                                </button>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1 space-y-8">
                            {/* Header / Stats */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h1 className="tracking-tighter">Live Stream</h1>
                                    <p className="text-muted-foreground font-medium text-sm md:text-base tracking-tight">Curated opportunities matched for your profile.</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Results</p>
                                    <p className="text-xl font-black text-foreground tracking-tighter">{opportunities.length} Matches</p>
                                </div>
                            </div>

                            {/* Mobile Filter Summary */}
                            <div className="md:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                <button
                                    onClick={() => document.getElementById('mobile-filter-sheet')?.classList.remove('translate-y-full')}
                                    className="h-10 px-4 bg-card border border-border rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-sm text-foreground"
                                >
                                    <AdjustmentsHorizontalIcon className="w-4 h-4 text-muted-foreground" />
                                    Refine Stream
                                </button>
                                {(filters.type || debouncedCity) && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="h-10 px-4 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* List Rendering */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 gap-6">
                                    {[1, 2, 3, 4].map(i => <SkeletonJobCard key={i} />)}
                                </div>
                            ) : opportunities.length === 0 ? (
                                <div className="bg-card rounded-[3rem] border-2 border-dashed border-border p-20 text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mx-auto text-muted-foreground/20">
                                        <MagnifyingGlassIcon className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground tracking-tighter">Negative Results</h3>
                                    <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm leading-relaxed">No signals detected for these parameters. Try loosening your sync filters or expanding location targets.</p>
                                    <button
                                        onClick={handleClearFilters}
                                        className="premium-button bg-secondary !text-secondary-foreground !h-12 px-8 mx-auto"
                                    >
                                        Reset Filter Protocol
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 pb-24">
                                    {opportunities.map((opp) => (
                                        <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                                            <JobCard
                                                job={{
                                                    ...opp,
                                                    normalizedRole: opp.title,
                                                    experienceRange: { min: 0, max: 2 }, // Default for freshers if not provided
                                                    mustHaveSkills: opp.requiredSkills,
                                                    niceToHaveSkills: [],
                                                    workType: (opp.workMode?.toLowerCase() as any) || 'onsite',
                                                    salary: opp.salaryMin ? { min: opp.salaryMin, max: opp.salaryMax || opp.salaryMin, currency: 'INR' } : null,
                                                    employmentType: opp.type === 'INTERNSHIP' ? 'internship' : 'full-time',
                                                    source: 'FresherFlow Verified',
                                                    lastVerified: opp.postedAt
                                                } as any}
                                                jobId={opp.id}
                                            />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Mobile Filter Sheet */}
                <div id="mobile-filter-sheet" className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] transition-transform translate-y-full md:hidden" onClick={(e) => {
                    if (e.target === e.currentTarget) e.currentTarget.classList.add('translate-y-full');
                }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[3rem] p-10 space-y-8 animate-in slide-in-from-bottom-20 duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-foreground tracking-tighter">Filter Protocol</h3>
                            <button onClick={() => document.getElementById('mobile-filter-sheet')?.classList.add('translate-y-full')} className="p-2 bg-background text-muted-foreground rounded-full">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Stream Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['', 'JOB', 'INTERNSHIP', 'WALKIN'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFilters({ ...filters, type })}
                                            className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${filters.type === type ? 'bg-primary border-primary text-primary-foreground shadow-xl' : 'bg-card border-border text-muted-foreground'}`}
                                        >
                                            {type === '' ? 'All' : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Location Sync</label>
                                <input
                                    type="text"
                                    value={citySearch}
                                    onChange={(e) => setCitySearch(e.target.value)}
                                    className="premium-input !h-14"
                                    placeholder="Enter target city..."
                                />
                            </div>

                            <button
                                onClick={() => document.getElementById('mobile-filter-sheet')?.classList.add('translate-y-full')}
                                className="w-full premium-button h-16 shadow-2xl shadow-slate-200"
                            >
                                Activate Filters
                            </button>
                        </div>
                    </div>
                </div>
            </ProfileGate>
        </AuthGate>
    );
}
