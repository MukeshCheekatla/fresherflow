'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
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
    EyeIcon,
    CheckCircleIcon,
    BriefcaseIcon,
    XMarkIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function OpportunitiesListPage() {
    const { isAuthenticated } = useAdmin();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 20;
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

        if (typeParam) {
            setTypeFilter(typeParam.toUpperCase());
        } else {
            setTypeFilter('');
        }

        if (statusParam) {
            setStatusFilter(statusParam.toUpperCase());
        } else {
            setStatusFilter('');
        }
        setPage(1);
    }, [searchParams]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }
        loadOpportunities();
    }, [isAuthenticated, typeFilter, statusFilter, page]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (typeFilter) params.set('type', typeFilter);
        else params.delete('type');
        if (statusFilter) params.set('status', statusFilter);
        else params.delete('status');

        const next = params.toString();
        const current = searchParams.toString();
        if (next !== current) {
            router.replace(`${pathname}?${next}`);
        }
    }, [typeFilter, statusFilter, searchParams, pathname, router]);

    const loadOpportunities = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.getOpportunities({
                type: typeFilter || undefined,
                status: statusFilter || undefined,
                limit: pageSize,
                offset: (page - 1) * pageSize
            });
            setOpportunities(data.opportunities || []);
            setError('');
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to load opportunities';
            setError(errorMsg);
            toast.error(`❌ ${errorMsg}`);

            if (err.message?.includes('403') || err.message?.includes('Unauthorized')) {
                toast.error('🔒 Session expired. Please login again.');
                setTimeout(() => router.push('/admin/login'), 1500);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleExpire = (id: string, title: string) => {
        setConfirmModal({
            show: true,
            title: 'Expire Opportunity',
            message: `Are you sure you want to mark "${title}" as EXPIRED? This will move it to the expired tab and hide it from the active feed.`,
            type: 'warning',
            confirmText: 'Expire listing',
            action: async () => {
                const loadingToast = toast.loading('⏳ Updating status...');
                try {
                    await adminApi.expireOpportunity(id);
                    toast.success('✅ Opportunity marked as expired', { id: loadingToast });
                    loadOpportunities();
                    setConfirmModal(prev => ({ ...prev, show: false }));
                } catch (err: any) {
                    toast.error(`❌ Failed: ${err.message}`, { id: loadingToast });
                }
            }
        });
    };

    const handleDelete = (id: string, title: string) => {
        setConfirmModal({
            show: true,
            title: 'Remove Opportunity',
            message: `‼️ DANGER: Are you sure you want to REMOVE "${title}"? This is a soft-delete and will hide it from all users immediately.`,
            type: 'danger',
            confirmText: 'Remove listing',
            action: async () => {
                const loadingToast = toast.loading('⏳ Removing listing...');
                try {
                    await adminApi.deleteOpportunity(id, 'Removed by admin via dashboard');
                    toast.success('✅ Opportunity removed', { id: loadingToast });
                    loadOpportunities();
                    setConfirmModal(prev => ({ ...prev, show: false }));
                } catch (err: any) {
                    toast.error(`❌ Failed: ${err.message}`, { id: loadingToast });
                }
            }
        });
    };

    if (!isAuthenticated) return null;

    const hasNextPage = opportunities.length === pageSize;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="tracking-tighter text-slate-200">Stream Management</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Monitor and curate the FresherFlow active stream.</p>
                </div>
                <Link href="/admin/opportunities/create" className="premium-button">
                    <PlusCircleIcon className="w-5 h-5" />
                    New Listing
                </Link>
            </div>

            {/* Quick Toggle */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => setTypeFilter('JOB')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${typeFilter === 'JOB'
                        ? 'bg-blue-950/30 text-blue-300 border-blue-900/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                >
                    Jobs
                </button>
                <button
                    onClick={() => setTypeFilter('WALKIN')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${typeFilter === 'WALKIN'
                        ? 'bg-orange-950/30 text-orange-300 border-orange-900/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                >
                    Walk-ins
                </button>
                <button
                    onClick={() => setTypeFilter('')}
                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300 transition-all"
                >
                    All Types
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 focus-within:border-slate-700 transition-colors flex-1 min-w-[240px]">
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    <input
                        placeholder="Search listings..."
                        className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder:text-slate-500 font-bold"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        Filters
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer"
                    >
                        <option value="">All Types</option>
                        <option value="JOB">Jobs</option>
                        <option value="INTERNSHIP">Internships</option>
                        <option value="WALKIN">Walk-ins</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>
            </div>

            {/* Table/List */}
            {isLoading ? (
                <div className="grid gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : opportunities.length === 0 ? (
                <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-16 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto text-slate-700">
                        <DocumentTextIcon className="w-8 h-8" />
                    </div>
                    <h3 className="tracking-tighter text-slate-200">No listings found</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">
                        Start by creating a new job, internship or walk-in to start the flow for freshers.
                    </p>
                    <Link href="/admin/opportunities/create" className="premium-button bg-slate-800 !text-slate-200 hover:bg-slate-700 inline-flex">
                        <PlusCircleIcon className="w-5 h-5" />
                        Quick Create
                    </Link>
                </div>
            ) : (
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Opportunity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {opportunities.map((opp) => (
                                    <tr key={opp.id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${opp.type === 'WALKIN' ? 'bg-orange-950/30 text-orange-400' :
                                                    opp.type === 'INTERNSHIP' ? 'bg-purple-950/30 text-purple-400' :
                                                        'bg-blue-950/30 text-blue-400'
                                                    }`}>
                                                    {opp.type[0]}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight text-sm">{opp.title}</div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-black uppercase tracking-widest mt-1">
                                                        <BuildingOfficeIcon className="w-3.5 h-3.5" />
                                                        {opp.company}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <MapPinIcon className="w-3.5 h-3.5 text-slate-500" />
                                                    {opp.locations.join(', ')}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    <CalendarIcon className="w-3.5 h-3.5 text-slate-600" />
                                                    {new Date(opp.postedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${opp.status === 'PUBLISHED' ? 'bg-emerald-950/30 text-emerald-400' :
                                                opp.status === 'EXPIRED' ? 'bg-amber-950/30 text-amber-400' :
                                                    'bg-rose-950/30 text-rose-400'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${opp.status === 'PUBLISHED' ? 'bg-emerald-500' :
                                                    opp.status === 'EXPIRED' ? 'bg-amber-500' :
                                                        'bg-rose-500'
                                                    }`} />
                                                {opp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 outline-none">
                                                <Link
                                                    href={`/admin/opportunities/edit/${opp.id}`}
                                                    className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-950/30 rounded-xl transition-all"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </Link>
                                                {opp.status === 'PUBLISHED' && (
                                                    <button
                                                        onClick={() => handleExpire(opp.id, opp.title)}
                                                        className="p-2.5 text-slate-500 hover:text-amber-400 hover:bg-amber-950/30 rounded-xl transition-all"
                                                        title="Expire"
                                                    >
                                                        <ClockIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(opp.id, opp.title)}
                                                    className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all"
                                                    title="Remove"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
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
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${page === 1
                            ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                            }`}
                    >
                        Prev
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Page {page}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasNextPage}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${!hasNextPage
                            ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} />
                    <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-700">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${confirmModal.type === 'danger' ? 'bg-rose-950/30 text-rose-500' : 'bg-amber-950/30 text-amber-500'}`}>
                                    {confirmModal.type === 'danger' ? <TrashIcon className="w-6 h-6" /> : <ClockIcon className="w-6 h-6" />}
                                </div>
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                    className="p-2 text-slate-500 hover:text-slate-200 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <h3 className="text-2xl font-black text-slate-200 tracking-tight mb-2">
                                {confirmModal.title}
                            </h3>
                            <p className="text-slate-400 font-medium leading-relaxed mb-8">
                                {confirmModal.message}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-800 border border-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.action}
                                    className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${confirmModal.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-100'}`}
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

