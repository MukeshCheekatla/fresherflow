'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { alertsApi } from '@/lib/api/client';
import { BellIcon, ArrowLeftIcon, ClockIcon, BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Loader2, Timer, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type AlertKindFilter = 'all' | 'DAILY_DIGEST' | 'CLOSING_SOON' | 'HIGHLIGHT' | 'APP_UPDATE';

const SCROLLBAR_HIDE_STYLE = `
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
@keyframes progress-fast {
  0% { transform: translateX(-100%) scaleX(0.2); }
  50% { transform: translateX(0%) scaleX(0.5); }
  100% { transform: translateX(100%) scaleX(0.2); }
}
.animate-progress-fast {
  animation: progress-fast 1s infinite linear;
}
`;

type AlertFeedItem = {
    id: string;
    kind: 'DAILY_DIGEST' | 'CLOSING_SOON';
    channel: 'EMAIL' | 'APP';
    sentAt: string;
    readAt: string | null;
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
    unreadCount: number;
    summary: {
        total: number;
        dailyDigest: number;
        closingSoon: number;
        highlight: number;
        appUpdate: number;
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

    const markAllRead = async () => {
        try {
            await alertsApi.markAllRead();
            setFeed(prev => prev ? {
                ...prev,
                unreadCount: 0,
                deliveries: prev.deliveries.map(d => ({ ...d, readAt: new Date().toISOString() }))
            } : null);
        } catch {
            // silent fail
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await alertsApi.markRead(id);
            setFeed(prev => prev ? {
                ...prev,
                unreadCount: Math.max(0, prev.unreadCount - 1),
                deliveries: prev.deliveries.map(d => d.id === id ? { ...d, readAt: new Date().toISOString() } : d)
            } : null);
        } catch {
            // silent fail
        }
    };

    useEffect(() => {
        if (isLoading || !user) return;
        void loadFeed(kind);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, user, kind]);

    const summary = useMemo(
        () => feed?.summary || { total: 0, dailyDigest: 0, closingSoon: 0, highlight: 0, appUpdate: 0 },
        [feed]
    );

    if (isLoading) {
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
        <div className="min-h-screen bg-background pb-16 relative overflow-hidden">
            <style>{SCROLLBAR_HIDE_STYLE}</style>

            {/* Background Decorations - Desktop Only */}
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/5 blur-[120px] pointer-events-none -z-10" />

            <main className="relative max-w-3xl mx-auto px-4 py-4 md:py-8 space-y-6">
                {/* Desktop Header: Visible on md+, Hidden on mobile */}
                <div className="hidden md:flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center bg-card border border-border/60 hover:border-primary/40 rounded-xl transition-all shadow-sm active:scale-95">
                            <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Alert center</h1>
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mt-1">Smart personalization feed</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Quick Filters</p>
                    <Link
                        href="/account/alerts"
                        className="text-[10px] font-black uppercase tracking-[0.15em] text-primary hover:text-primary-600 px-1"
                    >
                        Preferences
                    </Link>
                </div>

                {/* Progress Loader for filter switches */}
                <div className="h-0.5 w-full bg-muted overflow-hidden relative">
                    {loadingFeed && (
                        <div className="absolute inset-0 bg-primary animate-progress-fast origin-left" />
                    )}
                </div>

                <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide gap-2 transition-all">
                    <SummaryCard
                        label="All"
                        value={summary.total}
                        icon={<BellIcon className="w-4 h-4" />}
                        active={kind === 'all'}
                        onClick={() => setKind('all')}
                    />
                    <SummaryCard
                        label="Digest"
                        value={summary.dailyDigest}
                        icon={<BookOpenIcon className="w-4 h-4" />}
                        active={kind === 'DAILY_DIGEST'}
                        onClick={() => setKind('DAILY_DIGEST')}
                    />
                    <SummaryCard
                        label="Closing"
                        value={summary.closingSoon}
                        icon={<Timer className="w-4 h-4" />}
                        active={kind === 'CLOSING_SOON'}
                        onClick={() => setKind('CLOSING_SOON')}
                    />
                    <SummaryCard
                        label="High"
                        value={summary.highlight}
                        icon={<SparklesIcon className="w-4 h-4" />}
                        active={kind === 'HIGHLIGHT'}
                        onClick={() => setKind('HIGHLIGHT')}
                    />
                    <SummaryCard
                        label="App"
                        value={summary.appUpdate}
                        icon={<Smartphone className="w-4 h-4" />}
                        active={kind === 'APP_UPDATE'}
                        onClick={() => setKind('APP_UPDATE')}
                    />
                </div>

                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Recent Activity</p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void loadFeed(kind)}
                            className="h-6 px-2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-foreground"
                        >
                            Refresh
                        </Button>
                        {feed && feed.unreadCount > 0 && (
                            <>
                                <div className="w-px h-3 bg-border/40 mx-0.5" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllRead}
                                    className="h-6 px-2 text-[8px] font-bold uppercase tracking-widest text-primary/80 hover:bg-primary/5"
                                >
                                    Clear Unread
                                </Button>
                            </>
                        )}
                    </div>
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
                    <div className="rounded-3xl border-2 border-dashed border-border/60 bg-card/30 p-12 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-muted/30 flex items-center justify-center text-muted-foreground/40">
                            <BellIcon className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-bold text-foreground">No alerts yet</p>
                            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                                You&apos;re all caught up! New alerts will appear here when they match your profile.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {feed?.deliveries.map((item) => {
                            const title = item.opportunity?.title || 'Opportunity update';
                            const company = item.opportunity?.company || 'FresherFlow';
                            const href = item.opportunity?.slug ? `/opportunities/${item.opportunity.slug}` : '/opportunities';
                            const kindLabel =
                                item.kind === 'CLOSING_SOON' ? 'Closing soon' :
                                    item.kind === 'DAILY_DIGEST' ? 'Daily digest' :
                                        item.kind === 'HIGHLIGHT' ? 'Highlight' : 'App Update';
                            return (
                                <Link
                                    key={item.id}
                                    href={href}
                                    onClick={() => !item.readAt && markAsRead(item.id)}
                                    className={cn(
                                        "group block rounded-2xl border transition-all duration-300 p-4 relative overflow-hidden active:scale-[0.98]",
                                        item.readAt
                                            ? "border-border/60 bg-card/40 text-muted-foreground"
                                            : "border-primary/20 bg-card shadow-sm hover:shadow-md hover:border-primary/40 ring-1 ring-primary/5"
                                    )}
                                >
                                    {!item.readAt && (
                                        <div className="absolute top-4 right-4 animate-pulse">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-lg",
                                            item.kind === 'CLOSING_SOON'
                                                ? 'bg-primary/10 text-primary-700 dark:text-primary-300'
                                                : 'bg-muted text-muted-foreground',
                                            item.readAt && "opacity-60"
                                        )}>
                                            {kindLabel}
                                        </span>
                                        <span className="text-[9px] font-bold text-muted-foreground/60 inline-flex items-center gap-1.5 uppercase tracking-wider">
                                            <ClockIcon className="w-3 h-3" />
                                            {new Date(item.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className={cn(
                                            "text-sm font-bold leading-tight group-hover:text-primary transition-colors",
                                            item.readAt ? "text-muted-foreground/80" : "text-foreground"
                                        )}>
                                            {title}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-semibold text-muted-foreground/60">{company}</p>
                                            <div className="w-1 h-1 rounded-full bg-border" />
                                            <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">{item.channel}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    icon,
    active,
    onClick
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "min-w-[80px] flex-1 text-left rounded-xl border p-2.5 transition-all duration-200 group relative",
                active
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/10 scale-[1.02] z-10"
                    : "bg-card/40 border-border/60 hover:border-primary/40 hover:bg-card/80 text-foreground"
            )}
        >
            <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center mb-2 transition-colors",
                active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:text-primary"
            )}>
                {icon}
            </div>
            <div className="flex items-end justify-between gap-1">
                <p className={cn(
                    "text-[8px] font-black uppercase tracking-widest",
                    active ? "text-white/80" : "text-muted-foreground"
                )}>
                    {label}
                </p>
                <p className="text-sm font-black tracking-tight leading-none">{value}</p>
            </div>
        </button>
    );
}
