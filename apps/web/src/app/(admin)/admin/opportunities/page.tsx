'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useDebounce } from '@/lib/hooks/useDebounce';
import {
    PlusCircleIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    AdjustmentsHorizontalIcon,
    TrashIcon,
    ClockIcon,
    PencilSquareIcon,
    XMarkIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
    expireOpportunityAction,
    updateOpportunityAction,
    deleteOpportunityAction,
    bulkOpportunityAction
} from '@/features/jobs/actions/opportunity';

export default function OpportunitiesListPage() {
    const { isAuthenticated } = useAdmin();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('postedAt_desc');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 20;
    const debouncedSearch = useDebounce(search, 300);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const exportUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (typeFilter) params.set('type', enumToTypeParam(typeFilter));
        if (statusFilter) params.set('status', statusFilter);
        const query = params.toString();
        return `${process.env.NEXT_PUBLIC_API_URL}/api/admin/opportunities/export${query ? `?${query}` : ''}`;
    }, [typeFilter, statusFilter]);

    const typeParamToEnum = (value: string) => {
        const v = value.toLowerCase();
        if (v === 'job' || v === 'jobs') return 'JOB';
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

    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        action: () => void;
        type: 'danger' | 'warning';
        confirmText: string;
    }>({
        show: false,
        title: '',
        message: '',
        action: () => { },
        type: 'warning',
        confirmText: 'Confirm'
    });

    useEffect(() => {
        const typeParam = searchParams.get('type');
        const statusParam = searchParams.get('status');
        const qParam = searchParams.get('q');
        const sortParam = searchParams.get('sort');

        if (typeParam) {
            setTypeFilter(typeParamToEnum(typeParam));
        } else {
            setTypeFilter('');
        }

        if (statusParam) {
            setStatusFilter(statusParam.toUpperCase());
        } else {
            setStatusFilter('');
        }

        if (qParam !== null) {
            setSearch(qParam);
        } else {
            setSearch('');
        }

        if (sortParam) {
            setSort(sortParam);
        } else {
            setSort('postedAt_desc');
        }

        setPage(1);
    }, [searchParams]);

    const loadOpportunities = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.getOpportunities({
                type: typeFilter || undefined,
                status: statusFilter || undefined,
                q: debouncedSearch || undefined,
                sort,
                limit: pageSize,
                offset: (page - 1) * pageSize
            });
            setOpportunities(data.opportunities || []);
            setTotalCount(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err: unknown) {
            const errorMsg = (err as Error).message || 'Failed to load opportunities';
            toast.error(` ${errorMsg}`);

            if (errorMsg.includes('403') || errorMsg.includes('Unauthorized')) {
                toast.error('Session expired. Please log in again.');
                setTimeout(() => router.push('/admin/login'), 1500);
            }
        } finally {
            setIsLoading(false);
        }
    }, [typeFilter, statusFilter, debouncedSearch, sort, page, router]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }
        void loadOpportunities();
    }, [isAuthenticated, loadOpportunities, router]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (typeFilter) params.set('type', enumToTypeParam(typeFilter));
        else params.delete('type');
        if (statusFilter) params.set('status', statusFilter);
        else params.delete('status');
        if (search.trim()) params.set('q', search.trim());
        else params.delete('q');
        if (sort) params.set('sort', sort);
        else params.delete('sort');

        const next = params.toString();
        const current = searchParams.toString();
        if (next !== current) {
            router.replace(`${pathname}?${next}`);
        }
    }, [typeFilter, statusFilter, search, sort, searchParams, pathname, router]);


    const handleExpire = (id: string, title: string) => {
        setConfirmModal({
            show: true,
            title: 'Expire Opportunity',
            message: `Are you sure you want to mark "${title}" as EXPIRED? This will move it to the expired tab and hide it from the active feed.`,
            type: 'warning',
            confirmText: 'Expire listing',
            action: async () => {
                const loadingToast = toast.loading(' Updating status...');
                try {
                    const res = await expireOpportunityAction(id);
                    if (!res.success) throw new Error(res.error);

                    toast.success('Opportunity marked as expired', { id: loadingToast });
                    loadOpportunities();
                    setConfirmModal(prev => ({ ...prev, show: false }));
                } catch (err: unknown) {
                    toast.error(` Failed: ${(err as Error).message}`, { id: loadingToast });
                }
            }
        });
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        const loadingToast = toast.loading(`Updating to ${newStatus}...`);
        try {
            // TypeScript might complain about string vs explicit enum, but passing string works for now or casting
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await updateOpportunityAction(id, { status: newStatus as any });
            if (!res.success) throw new Error(res.error);

            toast.success(` Listing updated to ${newStatus}`, { id: loadingToast });
            loadOpportunities();
        } catch (err: unknown) {
            toast.error(` Failed: ${(err as Error).message}`, { id: loadingToast });
        }
    };

    const handleDelete = (id: string, title: string) => {
        setConfirmModal({
            show: true,
            title: 'Remove Opportunity',
            message: `!! DANGER: Are you sure you want to REMOVE "${title}"? This is a soft-delete and will hide it from all users immediately.`,
            type: 'danger',
            confirmText: 'Remove listing',
            action: async () => {
                const loadingToast = toast.loading(' Removing listing...');
                try {
                    const res = await deleteOpportunityAction(id, 'Removed by admin via dashboard');
                    if (!res.success) throw new Error(res.error);

                    toast.success('Opportunity removed', { id: loadingToast });
                    loadOpportunities();
                    setConfirmModal(prev => ({ ...prev, show: false }));
                } catch (err: unknown) {
                    toast.error(` Failed: ${(err as Error).message}`, { id: loadingToast });
                }
            }
        });
    };

    const handleBulkAction = async (action: 'DELETE' | 'ARCHIVE' | 'PUBLISH' | 'EXPIRE') => {
        if (selectedIds.length === 0) return;

        const actionNames = {
            'DELETE': 'remove',
            'ARCHIVE': 'archive',
            'PUBLISH': 'publish',
            'EXPIRE': 'expire'
        };

        setConfirmModal({
            show: true,
            title: `Bulk ${action.charAt(0) + action.slice(1).toLowerCase()}`,
            message: `Are you sure you want to ${actionNames[action]} ${selectedIds.length} listings? This action cannot be easily undone.`,
            type: action === 'DELETE' ? 'danger' : 'warning',
            confirmText: `Yes, ${action.toLowerCase()} all`,
            action: async () => {
                const loadingToast = toast.loading(` Processing bulk ${action.toLowerCase()}...`);
                try {
                    const res = await bulkOpportunityAction(selectedIds, action);
                    if (!res.success) throw new Error(res.error);

                    toast.success(` Success: ${selectedIds.length} items updated`, { id: loadingToast });
                    setSelectedIds([]);
                    loadOpportunities();
                    setConfirmModal(prev => ({ ...prev, show: false }));
                } catch (err: unknown) {
                    toast.error(` Failed: ${(err as Error).message}`, { id: loadingToast });
                }
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === displayOpportunities.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(displayOpportunities.map(o => o.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (!isAuthenticated) return null;

    const computedTotalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
    const effectiveTotalPages = totalPages || computedTotalPages;
    const hasNextPage = page < effectiveTotalPages;
    const displayOpportunities = [...opportunities].sort((a, b) => {
        const aArchived = a.status === 'ARCHIVED' ? 1 : 0;
        const bArchived = b.status === 'ARCHIVED' ? 1 : 0;
        return aArchived - bArchived;
    });

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header - Hidden on Mobile */}
            <div className="hidden md:flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Listings</h1>
                    <p className="text-sm text-muted-foreground">Manage listings and keep the feed accurate.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadOpportunities()}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        title="Refresh List"
                    >
                        <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <a
                        href={exportUrl}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Export CSV
                    </a>
                    <Link href="/admin/opportunities/create" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                        <PlusCircleIcon className="w-4 h-4 mr-2" />
                        New listing
                    </Link>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                                {selectedIds.length}
                            </div>
                            <span className="text-sm font-medium text-primary">Selected listings</span>
                        </div>
                        <div className="h-4 w-[1px] bg-primary/20" />
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleBulkAction('PUBLISH')}
                                className="h-8 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/50 rounded-md transition-colors"
                            >
                                Publish all
                            </button>
                            <button
                                onClick={() => handleBulkAction('ARCHIVE')}
                                className="h-8 px-3 text-xs font-semibold text-amber-700 hover:bg-amber-100/50 rounded-md transition-colors"
                            >
                                Archive all
                            </button>
                            <button
                                onClick={() => handleBulkAction('DELETE')}
                                className="h-8 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100/50 rounded-md transition-colors"
                            >
                                Delete all
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedIds([])}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground px-2"
                    >
                        Clear selection
                    </button>
                </div>
            )}

            {/* Quick Toggle - Hidden on Mobile to avoid duplicates */}
            <div className="hidden md:flex items-center gap-2">
                <button
                    onClick={() => setTypeFilter('JOB')}
                    className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors border ${typeFilter === 'JOB'
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                >
                    Jobs
                </button>
                <button
                    onClick={() => setTypeFilter('WALKIN')}
                    className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors border ${typeFilter === 'WALKIN'
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                >
                    Walk-ins
                </button>
                <button
                    onClick={() => setTypeFilter('')}
                    className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                    All types
                </button>
            </div>

            {/* Filters Bar - Sticky on Mobile & Desktop */}
            <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-md md:relative md:top-auto md:z-auto md:mx-0 md:px-0 md:py-0 md:bg-transparent space-y-3">
                <div className="flex flex-col gap-3 md:bg-card md:border md:border-border md:p-4 md:rounded-lg md:flex-row md:items-center md:gap-4 md:shadow-none">
                    <div className="relative flex-1 w-full">
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <input
                            placeholder="Search listings..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    {/* Filters - Grid on mobile, Flex on desktop */}
                    <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:gap-2">
                        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
                            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                            Filters
                        </div>

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="h-9 w-full md:w-auto rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">All types</option>
                            <option value="JOB">Jobs</option>
                            <option value="INTERNSHIP">Internships</option>
                            <option value="WALKIN">Walk-ins</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 w-full md:w-auto rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">All status</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="h-9 w-full md:w-auto rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="postedAt_desc">Newest</option>
                            <option value="postedAt_asc">Oldest</option>
                            <option value="company_asc">AZ</option>
                            <option value="company_desc">ZA</option>
                        </select>

                        <button
                            onClick={() => {
                                setTypeFilter('');
                                setStatusFilter('');
                                setSearch('');
                                setSort('postedAt_desc');
                                setPage(1);
                            }}
                            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Table/List */}
            {isLoading ? (
                <LoadingScreen message="Loading listings..." fullScreen={false} />
            ) : opportunities.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                        <DocumentTextIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground">No listings found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Start by creating a new job, internship or walk-in to start the flow for freshers.
                    </p>
                    <Link href="/admin/opportunities/create" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                        <PlusCircleIcon className="w-4 h-4 mr-2" />
                        Quick Create
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {displayOpportunities.map((opp) => (
                            <div key={opp.id} className="bg-card rounded-lg border border-border p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div
                                            onClick={() => toggleSelect(opp.id)}
                                            className={`w-4 h-4 mt-1 rounded border transition-colors cursor-pointer flex-shrink-0 flex items-center justify-center ${selectedIds.includes(opp.id)
                                                ? 'bg-primary border-primary'
                                                : 'border-muted-foreground/30 hover:border-primary'
                                                }`}
                                        >
                                            {selectedIds.includes(opp.id) && (
                                                <div className="w-2 h-2 bg-primary-foreground rounded-[1px]" />
                                            )}
                                        </div>
                                        <div className={`w-9 h-9 rounded-md flex items-center justify-center font-semibold text-xs ${opp.type === 'WALKIN' ? 'bg-amber-100 text-amber-700' :
                                            opp.type === 'INTERNSHIP' ? 'bg-purple-100 text-purple-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {opp.type[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-foreground">{opp.title}</div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                <BuildingOfficeIcon className="w-3 h-3" />
                                                {opp.company}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${opp.status === 'ARCHIVED' ? 'bg-rose-50 text-rose-700 ring-rose-600/10' :
                                        (opp.status === 'PUBLISHED' && opp.expiresAt && new Date(opp.expiresAt) < new Date()) ? 'bg-orange-50 text-orange-700 ring-orange-600/10' :
                                            opp.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                                                'bg-slate-50 text-slate-600 ring-slate-500/10'
                                        }`}>
                                        {opp.status === 'ARCHIVED' ? 'ARCHIVED' :
                                            (opp.status === 'PUBLISHED' && opp.expiresAt && new Date(opp.expiresAt) < new Date()) ? 'EXPIRED' :
                                                opp.status === 'PUBLISHED' ? 'LIVE' : opp.status}
                                    </span>
                                </div>

                                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <MapPinIcon className="w-3 h-3" />
                                        <span className="truncate">{opp.locations.join(', ')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="w-3 h-3" />
                                        {new Date(opp.postedAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end gap-2">
                                    <Link
                                        href={`/admin/opportunities/edit/${opp.slug || opp.id}`}
                                        className="h-9 px-3 inline-flex items-center justify-center rounded-md border border-input bg-background text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                                        title="Edit"
                                    >
                                        <PencilSquareIcon className="w-4 h-4 mr-1.5" />
                                        Edit
                                    </Link>
                                    {opp.status === 'DRAFT' && (
                                        <button
                                            onClick={() => handleStatusUpdate(opp.id, 'PUBLISHED')}
                                            className="h-9 px-3 inline-flex items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                            title="Publish Now"
                                        >
                                            <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                            Publish
                                        </button>
                                    )}
                                    {opp.status === 'PUBLISHED' && (
                                        <button
                                            onClick={() => handleExpire(opp.id, opp.title)}
                                            className="h-9 px-3 inline-flex items-center justify-center rounded-md border border-input bg-background text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                                            title="Expire"
                                        >
                                            <ClockIcon className="w-4 h-4 mr-1.5" />
                                            Expire
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(opp.id, opp.title)}
                                        className="h-9 px-3 inline-flex items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700 hover:bg-rose-100"
                                        title="Remove"
                                    >
                                        <TrashIcon className="w-4 h-4 mr-1.5" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="group px-5 py-3 w-10">
                                        <div
                                            onClick={toggleSelectAll}
                                            className={`w-4 h-4 rounded border transition-colors cursor-pointer flex items-center justify-center ${selectedIds.length === displayOpportunities.length && displayOpportunities.length > 0
                                                ? 'bg-primary border-primary'
                                                : 'border-muted-foreground/30 hover:border-primary'
                                                }`}
                                        >
                                            {selectedIds.length === displayOpportunities.length && displayOpportunities.length > 0 && (
                                                <div className="w-2 h-2 bg-primary-foreground rounded-[1px]" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Opportunity</th>
                                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Details</th>
                                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
                                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {displayOpportunities.map((opp) => (
                                    <tr key={opp.id} className={`hover:bg-muted/50 transition-colors group ${selectedIds.includes(opp.id) ? 'bg-primary/5' : ''}`}>
                                        <td className="px-5 py-4">
                                            <div
                                                onClick={() => toggleSelect(opp.id)}
                                                className={`w-4 h-4 rounded border transition-colors cursor-pointer flex items-center justify-center ${selectedIds.includes(opp.id)
                                                    ? 'bg-primary border-primary'
                                                    : 'border-muted-foreground/30 hover:border-primary'
                                                    }`}
                                            >
                                                {selectedIds.includes(opp.id) && (
                                                    <div className="w-2 h-2 bg-primary-foreground rounded-[1px]" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-md flex items-center justify-center font-semibold text-xs ${opp.type === 'WALKIN' ? 'bg-amber-100 text-amber-700' :
                                                    opp.type === 'INTERNSHIP' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {opp.type[0]}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{opp.title}</div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                        <BuildingOfficeIcon className="w-3 h-3" />
                                                        {opp.company}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <MapPinIcon className="w-3 h-3" />
                                                    <span className="truncate max-w-[200px]">{opp.locations.join(', ')}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {new Date(opp.postedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${opp.status === 'ARCHIVED' ? 'bg-rose-50 text-rose-700 ring-rose-600/10' :
                                                (opp.status === 'PUBLISHED' && opp.expiresAt && new Date(opp.expiresAt) < new Date()) ? 'bg-orange-50 text-orange-700 ring-orange-600/10' :
                                                    opp.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                                                        'bg-slate-50 text-slate-600 ring-slate-500/10'
                                                }`}>
                                                {opp.status === 'ARCHIVED' ? 'ARCHIVED' :
                                                    (opp.status === 'PUBLISHED' && opp.expiresAt && new Date(opp.expiresAt) < new Date()) ? 'EXPIRED' :
                                                        opp.status === 'PUBLISHED' ? 'LIVE' : opp.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/opportunities/edit/${opp.slug || opp.id}`}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </Link>
                                                {opp.status === 'DRAFT' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(opp.id, 'PUBLISHED')}
                                                        className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-md transition-all"
                                                        title="Publish Now"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {opp.status === 'PUBLISHED' && (
                                                    <button
                                                        onClick={() => handleExpire(opp.id, opp.title)}
                                                        className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all"
                                                        title="Expire"
                                                    >
                                                        <ClockIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(opp.id, opp.title)}
                                                    className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                                                    title="Remove"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && opportunities.length > 0 && (
                <div className="flex items-center justify-between py-4 border-t border-border">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-medium text-muted-foreground">
                        Page {page} of {effectiveTotalPages} · {totalCount} results
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasNextPage}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card rounded-lg border border-border shadow-lg w-full max-w-md relative z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmModal.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {confirmModal.type === 'danger' ? <TrashIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
                                </div>
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2">
                                {confirmModal.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                {confirmModal.message}
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.action}
                                    className={`inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${confirmModal.type === 'danger' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
                                >
                                    {confirmModal.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
