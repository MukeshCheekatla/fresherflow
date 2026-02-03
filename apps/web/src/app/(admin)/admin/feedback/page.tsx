'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import {
    ChatBubbleBottomCenterTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowLeftIcon,
    FunnelIcon,
    EllipsisVerticalIcon,
    ClockIcon,
    UserIcon,
    ArrowTopRightOnSquareIcon,
    PencilSquareIcon,
    TrashIcon,
    FlagIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function FeedbackPage() {
    const { isAuthenticated } = useAdmin();
    const router = useRouter();
    const [feedback, setFeedback] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }
        loadFeedback();
    }, [isAuthenticated]);

    const loadFeedback = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.getFeedback();
            setFeedback(data.feedback || []);
            setError('');
        } catch (err: any) {
            toast.error(`❌ ${err.message}`);
            setError(err.message || 'Failed to load feedback');
        } finally {
            setIsLoading(false);
        }
    };

    const groupedFeedback = feedback.reduce((acc, fb) => {
        const oppId = fb.opportunityId;
        if (!acc[oppId]) {
            acc[oppId] = {
                opportunity: fb.opportunity,
                items: []
            };
        }
        acc[oppId].items.push(fb);
        return acc;
    }, {} as Record<string, any>);

    if (!isAuthenticated) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="tracking-tighter text-slate-200">User Feedback</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Monitoring reports and community issues.</p>
                </div>
                <button
                    onClick={loadFeedback}
                    className="premium-button bg-slate-800 !text-slate-200 border-slate-700 hover:bg-slate-700 shadow-sm flex items-center gap-2"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                    Sync Log
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Reports', value: feedback.length, icon: ChatBubbleBottomCenterTextIcon, color: 'text-blue-400', bg: 'bg-blue-950/30' },
                    { label: 'Issue Hotspots', value: Object.keys(groupedFeedback).length, icon: ExclamationTriangleIcon, color: 'text-orange-400', bg: 'bg-orange-950/30' },
                    { label: 'Resolved Rate', value: '0%', icon: CheckCircleIcon, color: 'text-emerald-400', bg: 'bg-emerald-950/30' }
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-sm flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-black text-slate-200 tracking-tighter">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />)}
                </div>
            ) : Object.keys(groupedFeedback).length === 0 ? (
                <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-16 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto text-slate-700">
                        <FlagIcon className="w-8 h-8" />
                    </div>
                    <h3 className="tracking-tighter text-slate-200">Clean Slate</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">No user reports have been filed recently.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedFeedback).map(([oppId, data]: [string, any]) => (
                        <div key={oppId} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm group hover:shadow-md transition-all">
                            {/* Opportunity Information */}
                            <div className="bg-slate-800/50 p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center font-black text-slate-400">
                                        {data.opportunity?.company?.[0] || '?'}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                                            {data.opportunity?.title || 'Unknown Opportunity'}
                                        </h4>
                                        <p className="text-sm font-medium text-slate-500 tracking-tight">
                                            {data.opportunity?.company || 'Unknown Company'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/opportunities/edit/${oppId}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all active:scale-95"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                        Repair Listing
                                    </Link>
                                    <button
                                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Reports Grid */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.items.map((fb: any) => (
                                    <div key={fb.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 hover:border-slate-700 transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${fb.reason === 'LINK_BROKEN' ? 'bg-rose-950/30 text-rose-400' :
                                                fb.reason === 'EXPIRED' ? 'bg-amber-950/30 text-amber-400' :
                                                    'bg-slate-900 text-slate-400'
                                                }`}>
                                                {fb.reason.replace('_', ' ')}
                                            </span>
                                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                <ClockIcon className="w-3 h-3" />
                                                {new Date(fb.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                                                <UserIcon className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight leading-none">
                                                    {fb.user?.fullName || 'Anonymous'}
                                                </p>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                                    Verification Required
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Strip */}
                            <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {data.items.length} community report{data.items.length !== 1 ? 's' : ''}
                                </p>
                                <button className="text-xs font-bold text-blue-400 hover:underline">
                                    Mark Hub Resolved
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
