'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import {
    BriefcaseIcon,
    MapPinIcon,
    PlusCircleIcon,
    ArrowRightIcon,
    ChartBarIcon,
    ClockIcon,
    SignalIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AdminOverviewSkeleton } from '@/components/ui/Skeleton';

export default function AdminDashboardHome() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recent, setRecent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        jobs: 0,
        walkins: 0,
        total: 0,
        recent24h: 0
    });
    const [observability, setObservability] = useState({
        requests: 0,
        errorRatePct: 0,
        avgLatencyMs: 0,
        p95LatencyMs: 0
    });

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const [summaryRes, recentRes, metricsRes] = await Promise.all([
                adminApi.getOpportunitiesSummary(),
                adminApi.getOpportunities({ limit: 5 }),
                adminApi.getSystemMetrics()
            ]);

            const summary = summaryRes.summary || {};
            const opportunities = recentRes.opportunities || [];
            const totals = metricsRes.metrics?.totals || {};

            setRecent(opportunities);
            setStats({
                jobs: (summary.total || 0) - (summary.walkins || 0),
                walkins: summary.walkins || 0,
                total: summary.total || 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recent24h: opportunities.filter((o: any) => {
                    const posted = new Date(o.postedAt).getTime();
                    return posted > Date.now() - 24 * 60 * 60 * 1000;
                }).length
            });
            setObservability({
                requests: totals.requests || 0,
                errorRatePct: totals.errorRatePct || 0,
                avgLatencyMs: totals.avgLatencyMs || 0,
                p95LatencyMs: totals.p95LatencyMs || 0
            });
        } catch (err: unknown) {
            const error = err as Error;
            const message = error.message || 'Unknown error';
            setLoadError(message);
            toast.error(`Failed to load dashboard: ${message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const statsCards = [
        { label: 'Live listings', value: stats.jobs, icon: BriefcaseIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Walk-ins', value: stats.walkins, icon: MapPinIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Total listings', value: stats.total, icon: ChartBarIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'New (24h)', value: stats.recent24h, icon: ClockIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    if (loading) {
        return <AdminOverviewSkeleton />;
    }

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-700 pb-8 text-foreground">
            <header className="space-y-0.5">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Admin overview</h1>
                <p className="text-xs md:text-sm text-muted-foreground">Quick summary and shortcuts.</p>
            </header>

            {loadError && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Some dashboard data could not be loaded.
                    </p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-200/80 mt-1">{loadError}</p>
                    <button
                        onClick={() => void loadDashboard()}
                        className="mt-3 inline-flex h-8 items-center justify-center rounded-md bg-amber-500 px-3 text-xs font-semibold text-black hover:bg-amber-400 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {statsCards.map((stat) => (
                    <div key={stat.label} className="bg-card p-4 md:p-5 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground tracking-wide truncate pr-2">
                                {stat.label}
                            </span>
                            <stat.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4 shrink-0", stat.color)} />
                        </div>
                        <p className="text-xl font-semibold tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <Link
                    href="/admin/opportunities/create"
                    className="group bg-card p-4 md:p-5 rounded-lg border border-border shadow-sm flex items-center justify-between transition-all hover:border-primary/50 hover:shadow-md"
                >
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-primary">
                            <PlusCircleIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">Listings</span>
                        </div>
                        <h3 className="text-sm md:text-base font-semibold">Create listing</h3>
                        <p className="text-[11px] md:text-xs text-muted-foreground font-medium">Add jobs, internships, or walk-ins.</p>
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <ArrowRightIcon className="w-4 h-4 text-primary" />
                    </div>
                </Link>

                <Link
                    href="/admin/feedback"
                    className="group bg-card p-4 md:p-5 rounded-lg border border-border shadow-sm flex items-center justify-between transition-all hover:border-primary/50 hover:shadow-md"
                >
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <ChartBarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">Reports</span>
                        </div>
                        <h3 className="text-sm md:text-base font-semibold">Review feedback</h3>
                        <p className="text-[11px] md:text-xs text-muted-foreground font-medium">Review user reports.</p>
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-muted rounded-md flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                        <ArrowRightIcon className="w-4 h-4 text-foreground/70" />
                    </div>
                </Link>
            </div>

            {/* Request Health */}
            <div className="bg-card rounded-lg border border-border shadow-sm p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm md:text-base font-semibold tracking-tight">Request health</h3>
                    <SignalIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total requests</p>
                        <p className="text-sm md:text-base font-semibold">{observability.requests}</p>
                    </div>
                    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Error rate</p>
                        <p className="text-sm md:text-base font-semibold">{observability.errorRatePct}%</p>
                    </div>
                    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg latency</p>
                        <p className="text-sm md:text-base font-semibold">{observability.avgLatencyMs} ms</p>
                    </div>
                    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">P95 latency</p>
                        <p className="text-sm md:text-base font-semibold">{observability.p95LatencyMs} ms</p>
                    </div>
                </div>
            </div>

            {/* Recent Postings Simple List */}
            <div className="bg-card dark:bg-card/40 rounded-lg border border-border shadow-sm overflow-hidden w-full">
                <div className="px-4 py-3 md:px-5 md:py-4 border-b border-border flex justify-between items-center bg-muted/20 md:bg-transparent">
                    <h3 className="text-sm md:text-base font-semibold tracking-tight">Recent listings</h3>
                    <Link href="/admin/opportunities" className="text-[10px] md:text-xs font-medium text-primary hover:underline">View all</Link>
                </div>
                <div className="divide-y divide-border">
                    {recent.map((item) => {
                        const isWalkin = item.type === 'WALKIN';
                        return (
                            <Link
                                key={item.id}
                                href={`/admin/opportunities/edit/${item.id}`}
                                className="px-4 py-2.5 md:px-5 md:py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                            >
                                <div className="min-w-0 flex-1 pr-2">
                                    <p className="text-xs md:text-sm font-medium truncate">
                                        {item.company}
                                    </p>
                                    <p className="text-[10px] md:text-xs text-muted-foreground truncate font-medium">
                                        {item.title || item.normalizedRole}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right space-y-0.5 md:space-y-1">
                                    <span className="text-[9px] md:text-xs text-muted-foreground font-medium block">
                                        {new Date(item.postedAt).toLocaleDateString()}
                                    </span>
                                    <span className={cn(
                                        "inline-flex items-center rounded-md px-1 py-0.5 md:px-1.5 md:py-0.5 text-[9px] md:text-xs font-medium ring-1 ring-inset",
                                        isWalkin ? "bg-amber-500/10 text-amber-500 ring-amber-500/20" : "bg-blue-500/10 text-blue-500 ring-blue-500/20"
                                    )}>
                                        {item.type}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                    {recent.length === 0 && (
                        <div className="px-5 py-6 text-center text-xs md:text-sm text-muted-foreground">
                            No recent listings yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


