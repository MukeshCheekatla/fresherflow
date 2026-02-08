'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { alertsApi } from '@/lib/api/client';
import { BellIcon, ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type AlertKindFilter = 'all' | 'DAILY_DIGEST' | 'CLOSING_SOON';

type AlertFeedItem = {
    id: string;
    kind: 'DAILY_DIGEST' | 'CLOSING_SOON';
    channel: 'EMAIL';
    sentAt: string;
    metadata: string | null;
    opportunity: {
        id: string;
        slug: string;
        title: string;
        company: string;
        type: 'JOB' | 'INTERNSHIP' | 'WALKIN';
        expiresAt: string | null;
    } | null;
};

type AlertFeedResponse = {
    deliveries: AlertFeedItem[];
    summary: {
        total: number;
        dailyDigest: number;
        closingSoon: number;
    };
};

export default function AlertsCenterPage() {
    const { user, isLoading } = useAuth();
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [kind, setKind] = useState<AlertKindFilter>('all');
    const [feed, setFeed] = useState<AlertFeedResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadFeed = async (nextKind: AlertKindFilter = kind) => {
        setLoadingFeed(true);
        setError(null);
        try {
            const response = await alertsApi.getFeed(nextKind, 50);
            setFeed(response as AlertFeedResponse);
        } catch (err: unknown) {
            setError((err as Error)?.message || 'Failed to load alerts');
        } finally {
            setLoadingFeed(false);
        }
    };

    useEffect(() => {
        if (isLoading || !user) return;
        void loadFeed(kind);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, user, kind]);

    const summary = useMemo(
        () => feed?.summary || { total: 0, dailyDigest: 0, closingSoon: 0 },
        [feed]
    );

    if (isLoading || loadingFeed) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Sign in to view alerts.</p>
                    <Link href="/login" className="premium-button !w-fit px-6">Sign in</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-16">
            <main className="max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Alert center</h1>
                            <p className="text-xs text-muted-foreground mt-1">Recent digests and closing-soon alerts.</p>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="h-9 text-xs font-bold uppercase tracking-widest">
                        <Link href="/account/alerts">Settings</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <SummaryCard label="All" value={summary.total} />
                    <SummaryCard label="Digest" value={summary.dailyDigest} />
                    <SummaryCard label="Closing Soon" value={summary.closingSoon} />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <FilterButton active={kind === 'all'} onClick={() => setKind('all')}>All</FilterButton>
                    <FilterButton active={kind === 'DAILY_DIGEST'} onClick={() => setKind('DAILY_DIGEST')}>Daily digest</FilterButton>
                    <FilterButton active={kind === 'CLOSING_SOON'} onClick={() => setKind('CLOSING_SOON')}>Closing soon</FilterButton>
                    <Button
                        variant="outline"
                        onClick={() => void loadFeed(kind)}
                        className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
                    >
                        Refresh
                    </Button>
                </div>

                {error ? (
                    <div className="rounded-xl border border-dashed border-border bg-card p-5 space-y-3">
                        <p className="text-sm font-medium text-foreground">Could not load alerts</p>
                        <p className="text-xs text-muted-foreground">{error}</p>
                        <Button variant="outline" onClick={() => void loadFeed(kind)} className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest">
                            Retry
                        </Button>
                    </div>
                ) : feed && feed.deliveries.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center space-y-3">
                        <BellIcon className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">No alerts yet</p>
                        <p className="text-xs text-muted-foreground">Alerts will appear here after digest or deadline checks run.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {feed?.deliveries.map((item) => {
                            const title = item.opportunity?.title || 'Opportunity update';
                            const company = item.opportunity?.company || 'FresherFlow';
                            const href = item.opportunity?.slug ? `/opportunities/${item.opportunity.slug}` : '/opportunities';
                            const kindLabel = item.kind === 'CLOSING_SOON' ? 'Closing soon' : 'Daily digest';
                            return (
                                <Link key={item.id} href={href} className="block rounded-xl border border-border bg-card/80 hover:bg-card transition-colors p-4 space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${item.kind === 'CLOSING_SOON' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-primary/10 text-primary'}`}>
                                            {kindLabel}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                                            <ClockIcon className="w-3 h-3" />
                                            {new Date(item.sentAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-foreground leading-snug">{title}</p>
                                    <p className="text-xs text-muted-foreground">{company}</p>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border p-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
    );
}

function FilterButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: string;
}) {
    return (
        <Button
            variant={active ? 'default' : 'outline'}
            onClick={onClick}
            className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
        >
            {children}
        </Button>
    );
}
