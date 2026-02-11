'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { actionsApi } from '@/lib/api/client';
import { ActionType } from '@fresherflow/types';
import type { Opportunity } from '@fresherflow/types';
import LoadingScreen from '@/components/ui/LoadingScreen';
import toast from 'react-hot-toast';

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
const STATUS_LABEL: Record<string, string> = {
    APPLIED: 'Applied',
    PLANNED: 'Planned',
    INTERVIEWED: 'Interviewed',
    SELECTED: 'Selected',
    PLANNING: 'Planned',
    ATTENDED: 'Interviewed',
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

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const data = await actionsApi.list();
                setActions(data.actions || []);
            } catch {
                toast.error('Unable to load tracker right now.');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [authLoading, user]);

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
                <div className="max-w-md w-full rounded-xl border border-border bg-card p-6 text-center space-y-4">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in required</h1>
                    <p className="text-sm text-muted-foreground">Sign in to track your application progress.</p>
                    <Link
                        href="/login"
                        className="inline-flex h-10 items-center justify-center px-6 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Application Tracker</h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Applied | Planned | Interviewed | Selected</p>
                    </div>
                    <Link href="/opportunities" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                        Browse listings
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {STATUS_ORDER.map((status) => (
                        <div key={status} className="rounded-xl border border-border bg-card p-4">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{STATUS_LABEL[status]}</p>
                            <p className="text-2xl font-bold tracking-tight text-foreground mt-1">{grouped[status].length}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-5">
                    {STATUS_ORDER.map((status) => (
                        <section key={status} className="space-y-2">
                            <h2 className="text-sm font-bold tracking-tight text-foreground">{STATUS_LABEL[status]}</h2>
                            {grouped[status].length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border bg-card p-4 text-xs text-muted-foreground">
                                    No listings in this stage yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {grouped[status].map((item) => {
                                        const opp = item.opportunity;
                                        if (!opp) return null;
                                        return (
                                            <Link
                                                key={item.id}
                                                href={`/opportunities/${opp.slug || opp.id}`}
                                                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                                            >
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{opp.company}</p>
                                                <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2">{opp.title}</p>
                                                <div className="mt-2 text-[11px] text-muted-foreground">
                                                    {(opp.locations || []).slice(0, 2).join(', ') || 'Location not specified'}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
