'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import {
    Plus,
    Search,
    MoreVertical,
    ExternalLink,
    MapPin,
    Building2,
    Calendar,
    Filter,
    Trash2,
    Clock,
    Edit,
    Eye,
    AlertCircle,
    Briefcase,
    X
} from 'lucide-react';

export default function OpportunitiesListPage() {
    const { isAuthenticated, token } = useAdmin();
    const router = useRouter();
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
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
        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }
        loadOpportunities();
    }, [isAuthenticated, typeFilter, statusFilter]);

    const loadOpportunities = async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const data = await adminApi.getOpportunities(token, {
                type: typeFilter || undefined,
                status: statusFilter || undefined
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
                    await adminApi.expireOpportunity(token!, id);
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
                    await adminApi.deleteOpportunity(token!, id, 'Removed by admin via dashboard');
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stream Management</h1>
                    <p className="text-slate-500 font-medium">Monitor and curate the FresherFlow active stream.</p>
                </div>
                <Link href="/admin/opportunities/create" className="premium-button flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Listing
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 focus-within:border-slate-400 transition-colors flex-1 min-w-[240px]">
                    <Search className="w-4 h-4" />
                    <input
                        placeholder="Search listings..."
                        className="bg-transparent border-none outline-none text-sm text-slate-900 w-full placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <Filter className="w-4 h-4" />
                        Filters:
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                    >
                        <option value="">All Types</option>
                        <option value="JOB">Jobs</option>
                        <option value="INTERNSHIP">Internships</option>
                        <option value="WALKIN">Walk-ins</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="REMOVED">Removed</option>
                    </select>
                </div>
            </div>

            {/* Table/List */}
            {isLoading ? (
                <div className="grid gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : opportunities.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No listings found</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        Start by creating a new job, internship or walk-in to start the flow for freshers.
                    </p>
                    <Link href="/admin/opportunities/create" className="premium-button-outline inline-flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Quick Create
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Opportunity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {opportunities.map((opp) => (
                                    <tr key={opp.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${opp.type === 'WALKIN' ? 'bg-orange-100 text-orange-600' :
                                                    opp.type === 'INTERNSHIP' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {opp.type[0]}
                                                </div>
                                                <div>
                                                    <div className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{opp.title}</div>
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mt-0.5">
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        {opp.company}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {opp.locations.join(', ')}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(opp.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${opp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                                opp.status === 'EXPIRED' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${opp.status === 'ACTIVE' ? 'bg-emerald-500' :
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
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                {opp.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => handleExpire(opp.id, opp.title)}
                                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                        title="Expire"
                                                    >
                                                        <Clock className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(opp.id, opp.title)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-5 h-5" />
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

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${confirmModal.type === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {confirmModal.type === 'danger' ? <Trash2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                </div>
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                                {confirmModal.title}
                            </h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                {confirmModal.message}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 border border-slate-100 transition-all"
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
