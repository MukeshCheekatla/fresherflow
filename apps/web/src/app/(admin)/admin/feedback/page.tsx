'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
    ChatBubbleBottomCenterTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    TrashIcon,
    FlagIcon,
    ClockIcon,
    UserIcon
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
        <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500 pb-2 md:pb-12">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5 md:space-y-1">
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">User Feedback</h1>
                    <p className="text-[10px] md:text-sm text-muted-foreground">Monitoring reports and community issues.</p>
                </div>
                <button
                    onClick={loadFeedback}
                    className="inline-flex h-8 md:h-9 items-center justify-center rounded-md border border-input bg-background px-3 md:px-4 text-xs md:text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <ArrowPathIcon className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2" />
                    <span className="hidden md:inline">Sync Log</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[
                    { label: 'Total Reports', value: feedback.length, icon: ChatBubbleBottomCenterTextIcon, color: 'text-blue-500' },
                    { label: 'Issue Hotspots', value: Object.keys(groupedFeedback).length, icon: ExclamationTriangleIcon, color: 'text-amber-500' },
                    { label: 'Resolved Rate', value: '0%', icon: CheckCircleIcon, color: 'text-emerald-500' }
                ].map((stat, i) => (
                    <div key={i} className={cn(
                        "bg-card p-3 md:p-5 rounded-lg border border-border shadow-sm flex items-center justify-between",
                        i === 2 && "col-span-2 md:col-span-1" // Make last one span 2 cols on mobile
                    )}>
                        <div className="space-y-0.5 md:space-y-1">
                            <p className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide uppercase">{stat.label}</p>
                            <p className="text-lg md:text-2xl font-semibold text-foreground tracking-tight">{stat.value}</p>
                        </div>
                        <div className={cn(
                            "p-1.5 md:p-2 rounded-full bg-muted/50",
                            stat.color
                        )}>
                            <stat.icon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted/20 border border-border/50 rounded-lg animate-pulse" />)}
                </div>
            ) : Object.keys(groupedFeedback).length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-lg p-8 md:p-12 text-center space-y-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                        <FlagIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-foreground">Clean Slate</h3>
                    <p className="text-xs md:text-sm text-muted-foreground max-w-sm mx-auto">No user reports have been filed recently.</p>
                </div>
            ) : (
                <div className="space-y-4 md:space-y-6">
                    {Object.entries(groupedFeedback).map(([oppId, data]: [string, any]) => (
                        <div key={oppId} className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                            {/* Opportunity Information */}
                            <div className="bg-muted/40 p-3 md:p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-muted rounded-md border border-border/50 flex items-center justify-center font-bold text-muted-foreground text-[10px] md:text-sm">
                                        {data.opportunity?.company?.[0] || '?'}
                                    </div>
                                    <div>
                                        <h4 className="text-sm md:text-base font-semibold text-foreground leading-tight">
                                            {data.opportunity?.title || 'Unknown Opportunity'}
                                        </h4>
                                        <p className="text-[10px] md:text-xs font-medium text-muted-foreground">
                                            {data.opportunity?.company || 'Unknown Company'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/opportunities/edit/${oppId}`}
                                        className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2 md:px-3 text-[10px] md:text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex-1 md:flex-none"
                                    >
                                        <PencilSquareIcon className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5" />
                                        Repair
                                    </Link>
                                    <button
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Reports Grid */}
                            <div className="p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {data.items.map((fb: any) => (
                                    <div key={fb.id} className="p-3 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={cn(
                                                "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                                                fb.reason === 'LINK_BROKEN' ? 'bg-rose-50 text-rose-700 ring-rose-600/10' :
                                                    fb.reason === 'EXPIRED' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                                                        'bg-slate-50 text-slate-700 ring-slate-600/10'
                                            )}>
                                                {fb.reason.replace('_', ' ')}
                                            </span>
                                            <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                                                <ClockIcon className="w-2.5 h-2.5" />
                                                {new Date(fb.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center">
                                                <UserIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] md:text-xs font-medium text-foreground leading-none">
                                                    {fb.user?.fullName || 'Anonymous'}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                                    Reporter
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Strip */}
                            <div className="bg-muted/40 px-3 md:px-4 py-2 border-t border-border flex items-center justify-between">
                                <p className="text-[10px] md:text-xs font-medium text-muted-foreground">
                                    {data.items.length} community report{data.items.length !== 1 ? 's' : ''}
                                </p>
                                <button className="text-[10px] md:text-xs font-medium text-primary hover:underline">
                                    Resolve Hub
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
