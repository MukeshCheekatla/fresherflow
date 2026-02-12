'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { actionsApi } from '@/lib/api/client';
import { ActionType } from '@fresherflow/types';
import type { Opportunity } from '@fresherflow/types';
import LoadingScreen from '@/components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import {
    BriefcaseIcon,
    ChevronRightIcon,
    EllipsisHorizontalIcon,
    TrashIcon,
    CheckCircleIcon,
    ArrowPathRoundedSquareIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type ActionRecord = {
    id: string;
    actionType: ActionType;
    createdAt: string | Date;
    opportunity?: Opportunity;
};

const STATUS_ORDER: ActionType[] = [
    ActionType.APPLIED,
    ActionType.PLANNED,
    ActionType.INTERVIEWED,
    ActionType.SELECTED,
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    APPLIED: { label: 'Applied', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    PLANNED: { label: 'Planned', color: 'text-amber-600', bgColor: 'bg-amber-50' },
    INTERVIEWED: { label: 'Interviewed', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    SELECTED: { label: 'Selected', color: 'text-green-600', bgColor: 'bg-green-50' },
    PLANNING: { label: 'Planned', color: 'text-amber-600', bgColor: 'bg-amber-50' },
    ATTENDED: { label: 'Interviewed', color: 'text-purple-600', bgColor: 'bg-purple-50' },
};

const normalizeStatus = (value: ActionType): ActionType => {
    if (value === ActionType.PLANNING) return ActionType.PLANNED;
    if (value === ActionType.ATTENDED) return ActionType.INTERVIEWED;
    return value;
};

export default function AccountTrackerPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [actions, setActions] = useState<ActionRecord[]>([]);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const data = await actionsApi.list();
            setActions(data.actions || []);
        } catch {
            toast.error('Unable to load tracker right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }
        loadData();
    }, [authLoading, user]);

    const handleUpdateStatus = async (opportunityId: string, newStatus: ActionType) => {
        const loadingToast = toast.loading('Updating status...');
        try {
            await actionsApi.track(opportunityId, newStatus);
            await loadData();
            toast.success('Status updated', { id: loadingToast });
            setActiveMenu(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update status';
            toast.error(message, { id: loadingToast });
        }
    };

    const handleRemove = async (opportunityId: string) => {
        if (!confirm('Stop tracking this application?')) return;
        const loadingToast = toast.loading('Removing...');
        try {
            await actionsApi.remove(opportunityId);
            await loadData();
            toast.success('Removed from tracker', { id: loadingToast });
            setActiveMenu(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to remove';
            toast.error(message, { id: loadingToast });
        }
    };

    const grouped = useMemo(() => {
        const map: Record<string, ActionRecord[]> = {
            APPLIED: [],
            PLANNED: [],
            INTERVIEWED: [],
            SELECTED: [],
        };

        actions.forEach((item) => {
            const normalized = normalizeStatus(item.actionType);
            if (!map[normalized]) return;
            map[normalized].push({ ...item, actionType: normalized });
        });

        return map;
    }, [actions]);

    if (authLoading || loading) return <LoadingScreen message="Loading tracker..." />;

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center space-y-6 shadow-sm">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <ArrowPathRoundedSquareIcon className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in required</h1>
                        <p className="text-sm text-muted-foreground">Log in to your account to view and manage your job application progress.</p>
                    </div>
                    <Link
                        href="/login"
                        className="premium-button h-11 px-8 inline-flex items-center justify-center font-bold uppercase tracking-widest text-xs"
                    >
                        Sign in to FresherFlow
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Application Tracker</h1>
                        <p className="text-sm text-muted-foreground font-medium">Keep track of your job search progress across different stages.</p>
                    </div>
                    <Link href="/opportunities" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1.5">
                        <BriefcaseIcon className="w-4 h-4" />
                        Browse More Opportunities
                    </Link>
                </div>

                {/* Stats Summary Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {STATUS_ORDER.map((status) => (
                        <div key={status} className={cn(
                            "rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-sm",
                            STATUS_CONFIG[status].bgColor
                        )}>
                            <p className={cn("text-[10px] uppercase tracking-widest font-black", STATUS_CONFIG[status].color)}>
                                {STATUS_CONFIG[status].label}
                            </p>
                            <p className="text-3xl font-black tracking-tighter text-foreground mt-1">
                                {grouped[status].length}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Tracking Lanes / Sections */}
                <div className="space-y-10">
                    {STATUS_ORDER.map((status) => (
                        <section key={status} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-1.5 h-6 rounded-full", STATUS_CONFIG[status].color.replace('text-', 'bg-'))} />
                                <h2 className="text-lg font-bold tracking-tight text-foreground">
                                    {STATUS_CONFIG[status].label}
                                    <span className="ml-2 text-muted-foreground font-normal text-sm">({grouped[status].length})</span>
                                </h2>
                            </div>

                            {grouped[status].length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
                                    <p className="text-sm text-muted-foreground font-medium italic">No applications in this stage yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {grouped[status].map((item) => {
                                        const opp = item.opportunity;
                                        if (!opp) return null;
                                        const isMenuOpen = activeMenu === item.id;

                                        return (
                                            <div
                                                key={item.id}
                                                className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-all hover:shadow-md flex flex-col justify-between overflow-hidden"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <Link href={`/opportunities/${opp.slug || opp.id}`} className="min-w-0 flex-1 space-y-1">
                                                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground group-hover:text-primary transition-colors">
                                                            {opp.company}
                                                        </p>
                                                        <h3 className="text-base font-bold text-foreground leading-snug line-clamp-1">
                                                            {opp.title}
                                                        </h3>
                                                    </Link>

                                                    {/* Action Menu */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setActiveMenu(isMenuOpen ? null : item.id);
                                                            }}
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                                                        >
                                                            <EllipsisHorizontalIcon className="w-5 h-5" />
                                                        </button>

                                                        {isMenuOpen && (
                                                            <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in duration-200">
                                                                <p className="px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Move to</p>
                                                                {STATUS_ORDER.filter(s => s !== status).map(s => (
                                                                    <button
                                                                        key={s}
                                                                        onClick={() => handleUpdateStatus(opp.id, s)}
                                                                        className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-muted rounded-lg text-[10px] font-bold text-foreground uppercase tracking-tight transition-all text-left"
                                                                    >
                                                                        <CheckCircleIcon className="w-4 h-4 text-muted-foreground" />
                                                                        {STATUS_CONFIG[s].label}
                                                                    </button>
                                                                ))}
                                                                <div className="h-px bg-border my-1" />
                                                                <button
                                                                    onClick={() => handleRemove(opp.id)}
                                                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-destructive/5 text-destructive rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all text-left"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                    Stop Tracking
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                                                        <MapPinIcon className="w-3.5 h-3.5" />
                                                        {opp.locations[0] || 'Remote'}
                                                    </div>
                                                    <Link
                                                        href={`/opportunities/${opp.slug || opp.id}`}
                                                        className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 group/btn"
                                                    >
                                                        View Listing
                                                        <ChevronRightIcon className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </main>

            {/* Click away surface for menu */}
            {activeMenu && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setActiveMenu(null)}
                />
            )}
        </div>
    );
}
